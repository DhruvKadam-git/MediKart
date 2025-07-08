document.addEventListener("DOMContentLoaded", () => {
    loadUserInfo();
    loadUserOrders();
    loadSavedAddresses();
    loadPaymentMethods();
  
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout);
    }
  });
  
  // Load user info
  function renderProfile(user) {
    document.querySelector(".user-name").textContent  = user.name;
    document.querySelector(".user-email").textContent = user.email;
    document.querySelector(".user-phone").textContent = user.phone;
    const avatarEl = document.getElementById("userAvatar");
    if (avatarEl) avatarEl.src = user.avatar || `https://i.pravatar.cc/150?u=${user.email}`;
  }

  function loadUserInfo() {
    const existing = localStorage.getItem("user");
    if (existing) {
      renderProfile(JSON.parse(existing));
    }

    // Always attempt to refresh from Firestore so we have the latest data
    refreshProfileFromFirestore();
  }

  async function refreshProfileFromFirestore() {
    if (!window.firebase || !firebase.auth) return;

    const user = firebase.auth().currentUser;
    if (!user) {
      // Wait for auth state ready
      firebase.auth().onAuthStateChanged((u) => {
        if (u) fetchAndUpdate(u);
      });
    } else {
      fetchAndUpdate(user);
    }
  }

  async function fetchAndUpdate(user) {
    try {
      const snap = await firebase.firestore().collection("users").doc(user.uid).get();
      if (snap.exists) {
        const data = snap.data();
        const profile = {
          name: data.name || user.displayName || "User",
          email: data.email || user.email,
          phone: data.phone || user.phoneNumber || "",
          avatar: data.avatar || user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`
        };
        localStorage.setItem("user", JSON.stringify(profile));
        renderProfile(profile);
      }
    } catch (err) {
      console.error("Failed to refresh profile", err);
    }
  }
  
  // Load orders
  function loadUserOrders() {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const ordersContainer = document.getElementById("ordersContainer");
  
    if (!orders.length) {
      ordersContainer.innerHTML = `<p class="text-center text-gray-500">No orders found.</p>`;
      return;
    }
  
    orders.forEach(order => {
      const card = document.createElement("div");
      card.className = "border border-gray-200 rounded p-4 mb-4";
  
      const itemsHTML = order.items.map(item => `
        <div class="flex items-center space-x-4">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
          <div>
            <p class="font-semibold text-gray-900">${item.name}</p>
            <p class="text-gray-600">Quantity: ${item.quantity}</p>
          </div>
        </div>
      `).join("");
  
      card.innerHTML = `
        <div class="flex justify-between items-center mb-3">
          <span class="font-semibold text-gray-900">Order #${order.id}</span>
          <span class="text-sm text-green-600 font-semibold">${order.status}</span>
        </div>
        <p class="text-gray-700 mb-2">Placed on: ${order.date}</p>
        <div class="space-y-2">${itemsHTML}</div>
        <p class="mt-4 font-semibold text-gray-900">Total Paid: ₹${order.total}</p>
      `;
  
      ordersContainer.appendChild(card);
    });
  }
  
  // Load saved addresses
  function loadSavedAddresses() {
    const user = JSON.parse(localStorage.getItem("user"));
    const addressContainer = document.getElementById("addressContainer");
    if (!user?.addresses?.length) {
      addressContainer.innerHTML = `<p class="text-center text-gray-500">No saved addresses.</p>`;
      return;
    }
  
    user.addresses.forEach((address, index) => {
      const div = document.createElement("div");
      div.className = "border border-gray-200 rounded p-4 mb-4 flex justify-between items-start";
  
      div.innerHTML = `
        <div>
          <h3 class="font-medium text-gray-900">${address.label}</h3>
          <p class="text-sm text-gray-600">${address.details}</p>
        </div>
        <button onclick="removeAddress(${index})" class="text-red-600 hover:underline text-sm">Remove</button>
      `;
  
      addressContainer.appendChild(div);
    });
  }
  
  function removeAddress(index) {
    const user = JSON.parse(localStorage.getItem("user"));
    user.addresses.splice(index, 1);
    localStorage.setItem("user", JSON.stringify(user));
    location.reload();
  }
  
  // Load saved payment methods
  function loadPaymentMethods() {
    const user = JSON.parse(localStorage.getItem("user"));
    const paymentContainer = document.getElementById("paymentContainer");
    if (!user?.paymentMethods?.length) {
      paymentContainer.innerHTML = `<p class="text-center text-gray-500">No payment methods added.</p>`;
      return;
    }
  
    user.paymentMethods.forEach((method, index) => {
      const div = document.createElement("div");
      div.className = "border border-gray-200 rounded p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between";
  
      let content = "";
  
      if (method.type === "card") {
        content = `
          <div class="flex items-center space-x-4">
            <img src="https://img.icons8.com/color/48/mastercard-logo.png" class="w-10 h-10" />
            <div>
              <p class="text-gray-900 font-medium">${method.provider} ending in ${method.last4}</p>
              <p class="text-sm text-gray-600">Expires ${method.expiry}</p>
            </div>
          </div>
        `;
      } else if (method.type === "upi") {
        content = `
          <div class="flex items-center space-x-4">
            <img src="https://img.icons8.com/color/48/phonepe.png" class="w-10 h-10" />
            <div>
              <p class="text-gray-900 font-medium">${method.provider}</p>
              <p class="text-sm text-gray-600">${method.upi}</p>
            </div>
          </div>
        `;
      }
  
      div.innerHTML = `
        ${content}
        <div class="mt-4 md:mt-0 flex space-x-4">
          <button onclick="removePayment(${index})" class="text-red-600 hover:underline text-sm font-medium">Remove</button>
        </div>
      `;
  
      paymentContainer.appendChild(div);
    });
  }
  
  function removePayment(index) {
    const user = JSON.parse(localStorage.getItem("user"));
    user.paymentMethods.splice(index, 1);
    localStorage.setItem("user", JSON.stringify(user));
    location.reload();
  }
  
  // Logout function
  function handleLogout() {
    // Clear cached profile
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Sign out from Firebase (safe even if not signed in)
    if (window.firebase && firebase.auth) {
      firebase.auth().signOut().catch(console.error);
    }

    // Redirect to login route served by Flask
    window.location.href = "/login";
  }
  