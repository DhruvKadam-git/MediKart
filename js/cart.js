const DELIVERY_CHARGE = 40; // Fixed delivery charge (₹40)

let products = [];
let cart = [];

async function fetchProducts() {
  try {
    const res = await fetch('products.json');
    products = await res.json();
  } catch (e) {
    console.error('Error loading products:', e);
  }
}

function loadCart() {
  cart = JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function findProduct(id) {
  return products.find(p => p.id == id);
}

function calculateSummary() {
  let subtotal = 0;
  let discount = 0;

  cart.forEach(item => {
    const product = findProduct(item.id);
    if (!product) return;

    subtotal += product.price * item.quantity;
    if (product.oldPrice && product.oldPrice > product.price) {
      discount += (product.oldPrice - product.price) * item.quantity;
    }
  });

  const total = subtotal + DELIVERY_CHARGE;

  return { subtotal, discount, delivery: DELIVERY_CHARGE, total };
}

function renderSummary() {
  const { subtotal, discount, delivery, total } = calculateSummary();

  document.getElementById('summarySubtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('summaryDiscount').textContent = `-₹${discount.toFixed(2)}`;
  document.getElementById('summaryDelivery').textContent = `₹${delivery.toFixed(2)}`;
  document.getElementById('summaryTotal').textContent = `₹${total.toFixed(2)}`;
}

function renderCartItems() {
  const container = document.getElementById('cartContainer');
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-500 mt-10">Your cart is empty.</p>';
    document.getElementById('checkoutButton').disabled = true;
    renderSummary();
    return;
  }

  document.getElementById('checkoutButton').disabled = false;

  cart.forEach(item => {
    const product = findProduct(item.id);
    if (!product) return;

    const itemTotal = product.price * item.quantity;

    const div = document.createElement('div');
    div.className = 'flex items-center bg-white rounded shadow p-4 space-x-4 mb-6';
    div.setAttribute('data-id', product.id);
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="w-24 h-24 object-cover rounded" />
      <div class="flex-1">
        <h2 class="font-semibold text-lg text-gray-900">${product.name}</h2>
        <p class="text-sm text-gray-600">Brand: ${product.brand}</p>
        <p class="text-green-600 font-bold mt-1">₹${product.price} x ${item.quantity} = ₹${itemTotal}</p>
        <div class="mt-3 flex items-center space-x-3">
          <button class="quantity-btn bg-gray-200 text-gray-700 rounded px-3 py-1 hover:bg-gray-300" aria-label="Decrease quantity">-</button>
          <span class="w-6 text-center text-gray-800 font-semibold">${item.quantity}</span>
          <button class="quantity-btn bg-gray-200 text-gray-700 rounded px-3 py-1 hover:bg-gray-300" aria-label="Increase quantity">+</button>
          <button class="ml-6 text-red-600 hover:underline font-semibold" aria-label="Remove item">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  attachEventListeners();
}

function attachEventListeners() {
  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.onclick = () => {
      const parent = btn.closest('[data-id]');
      if (!parent) return;
      const id = parent.getAttribute('data-id');
      const index = cart.findIndex(item => item.id == id);
      if (index === -1) return;

      if (btn.textContent.trim() === '+') {
        cart[index].quantity++;
      } else if (btn.textContent.trim() === '-') {
        cart[index].quantity = Math.max(1, cart[index].quantity - 1);
      }

      saveCart();
      renderCartItems();
      renderSummary();
    };
  });

  document.querySelectorAll('[aria-label="Remove item"]').forEach(btn => {
    btn.onclick = () => {
      const parent = btn.closest('[data-id]');
      if (!parent) return;
      const id = parent.getAttribute('data-id');
      cart = cart.filter(item => item.id != id);
      saveCart();
      renderCartItems();
      renderSummary();
    };
  });
}

document.getElementById('checkoutButton').addEventListener('click', () => {
  alert('Proceeding to checkout...');
  // Add your checkout flow here
});

// Initialize
(async function init() {
  await fetchProducts();
  loadCart();
  renderCartItems();
  renderSummary();
})();
