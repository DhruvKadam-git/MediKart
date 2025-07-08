// Get selected product ID stored by index page
const productId = localStorage.getItem('selectedProductId');

if (!productId) {
  alert("No product selected!");
  // Optionally, redirect to product listing page
  window.location.href = "index.html";
}

// Fetch all products from JSON
fetch('products.json')
  .then(response => response.json())
  .then(products => {
    const product = products.find(p => p.id == productId);
    if (product) {
      renderProductDetails(product);
    } else {
      alert("Product not found!");
      window.location.href = "index.html";
    }
  })
  .catch(err => {
    console.error("Failed to fetch products:", err);
  });

  function renderProductDetails(product) {
    // Set product image
    document.getElementById('productImage').src = product.image;
  
    // Set product name and brand
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productBrand').textContent = `Brand: ${product.brand}`;
  
    // Set price and old price
    document.getElementById('productPrice').textContent = `₹${product.price}`;
    document.getElementById('productOldPrice').textContent = product.oldPrice ? `₹${product.oldPrice}` : '';
  
    // Calculate discount %
    if (product.oldPrice && product.oldPrice > product.price) {
      const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
      const discountElem = document.getElementById('productDiscount');
      discountElem.textContent = `${discount}% OFF`;
      discountElem.classList.remove('hidden');
    }
  
    // Set product description
    document.getElementById('productDesc').textContent = product.description;
  
    // Set availability (default In Stock if not provided)
    document.getElementById('availabilityStatus').textContent = product.availability || "In Stock";
  }

  document.getElementById('addToCartBtn').addEventListener('click', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.id == productId);
  
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;  // Increase quantity
    } else {
      cart.push({ id: productId, quantity: 1 });
    }
  
    localStorage.setItem('cart', JSON.stringify(cart));
    alert("Product added to cart!");
  });
  