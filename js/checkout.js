const DELIVERY_CHARGE = 40;

// Load cart from localStorage
function loadCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

// Fetch product data from products.json (assumed in root or public folder)
async function fetchProducts() {
  const res = await fetch('products.json');
  return await res.json();
}

// Calculate and render summary section
async function calculateAndRenderSummary() {
  const products = await fetchProducts();
  const cart = loadCart();

  let subtotal = 0;
  let discount = 0;

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product) {
      subtotal += product.price * item.quantity;
      if (product.oldPrice && product.oldPrice > product.price) {
        discount += (product.oldPrice - product.price) * item.quantity;
      }
    }
  });

  const total = subtotal + DELIVERY_CHARGE;

  // Update DOM
  document.getElementById('summarySubtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('summaryDiscount').textContent = `-₹${discount.toFixed(2)}`;
  document.getElementById('summaryDelivery').textContent = `₹${DELIVERY_CHARGE.toFixed(2)}`;
  document.getElementById('summaryTotal').textContent = `₹${total.toFixed(2)}`;

  return { subtotal, discount, delivery: DELIVERY_CHARGE, total };
}

// Validate address form
function validateAddressForm() {
  const fields = ['fullName', 'phone', 'address', 'city', 'state', 'zip'];
  for (let field of fields) {
    const value = document.getElementById(field)?.value.trim();
    if (!value) {
      alert(`Please fill in your ${field}`);
      return false;
    }
  }
  return true;
}

// Validate payment form
function validatePaymentForm() {
  const method = document.getElementById('paymentMethod').value;
  if (!method) {
    alert('Please select a payment method.');
    return false;
  }

  if (method === 'card') {
    const cardFields = ['cardName', 'cardNumber', 'expiryDate', 'cvv'];
    for (let field of cardFields) {
      const value = document.getElementById(field)?.value.trim();
      if (!value) {
        alert(`Please complete your card's ${field}`);
        return false;
      }
    }
  }

  return true;
}

// Handle placing the order
async function handlePlaceOrder() {
  if (!validateAddressForm() || !validatePaymentForm()) return;

  const orderSummary = await calculateAndRenderSummary();

  const order = {
    address: {
      name: document.getElementById('fullName').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zip: document.getElementById('zip').value,
    },
    paymentMethod: document.getElementById('paymentMethod').value,
    summary: orderSummary,
    date: new Date().toISOString(),
  };

  // Simulate order placement
  console.log('Order placed:', order);

  // Clear cart and redirect
  localStorage.removeItem('cart');
  alert('Your order has been placed successfully!');
  window.location.href = 'thankyou.html'; // Redirect to thank you page
}

// Init function on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  calculateAndRenderSummary();

  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', handlePlaceOrder);
  }
});
