// Initial product data with stock
const initialProducts = [
  // Smartphones
  { id: 1, name: "Samsung Galaxy S21", category: "smartphone", price: 58999, image: "assets/galaxy_s21.png", stock: 5 },
  { id: 2, name: "Apple iPhone 14", category: "smartphone", price: 89900, image: "assets/iphone_14.png", stock: 10 },
  { id: 3, name: "OnePlus 10", category: "smartphone", price: 68099, image: "assets/oneplus_10.png", stock: 3 },

  // Laptops
  { id: 4, name: "MacBook Pro", category: "laptop", price: 169900, image: "assets/macbook_pro.png", stock: 2 },
  { id: 5, name: "Dell XPS 13", category: "laptop", price: 178090, image: "assets/dell_xps_13.png", stock: 0 },
  { id: 6, name: "ThinkPad", category: "laptop", price: 127899, image: "assets/thinkpad.png", stock: 4 },

  // Headphones
  { id: 7, name: "Sony WH-1000XM4", category: "headphone", price: 29990, image: "assets/sony_wh1000xm4.png", stock: 6 },
  { id: 8, name: "Bose QC35", category: "headphone", price: 27900, image: "assets/bose_qc35.png", stock: 2 },

  // Smartwatches
  { id: 9, name: "Apple Watch Series 7", category: "smartwatch", price: 46900, image: "assets/apple_watch_7.png", stock: 0 },
  { id: 10, name: "Fitbit Versa 3", category: "smartwatch", price: 18999, image: "assets/fitbit_versa_3.png", stock: 8 },

  // Power Banks
  { id: 11, name: "Anker PowerCore 10000", category: "powerbank", price: 1600, image: "assets/anker_powercore_10000.png", stock: 10 },
  { id: 12, name: "RavPower 20000", category: "powerbank", price: 6890, image: "assets/ravpower_20000.png", stock: 5 },

  // Adaptors
  { id: 13, name: "USB-C Adapter", category: "adaptor", price: 1999, image: "assets/usb_c_adapter.png", stock: 0 },
  { id: 14, name: "Travel Charger", category: "adaptor", price: 2549, image: "assets/travel_charger.png", stock: 9 }
];

// --- Stock Persistence Functions ---
function getLiveProducts() {
  const storedProducts = localStorage.getItem("voiceShopProductStock");
  if (storedProducts) {
    return JSON.parse(storedProducts);
  }
  // Initialize and save if not found
  localStorage.setItem("voiceShopProductStock", JSON.stringify(initialProducts));
  return initialProducts;
}

function saveLiveProducts(products) {
  localStorage.setItem("voiceShopProductStock", JSON.stringify(products));
}

// Cart array
let cart = JSON.parse(localStorage.getItem("voiceShopCart")) || [];

// --- Rendering Functions (Updated to show stock) ---

function renderProductCard(product) {
  const stockText = product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock';
  const disabled = product.stock === 0 ? "disabled" : "";
  const stockClass = product.stock === 0 ? "out-of-stock" : "";
  
  const productDiv = document.createElement("div");
  productDiv.className = "product-card";
  
  productDiv.innerHTML = `
    <img src="${product.image}" alt="${product.name}" />
    <h3>${product.name}</h3>
    <p>Price: ₹${product.price}</p>
    <p class="${stockClass}">${stockText}</p>
    <button ${disabled} onclick="addToCart(${product.id})">${product.stock === 0 ? "Out of Stock" : "Add to Cart"}</button>
  `;
  return productDiv;
}

// Render products filtered by category (Used by all category pages)
function renderCategoryProducts(category) {
  const productsGrid = document.getElementById("productsGrid");
  productsGrid.innerHTML = "";
  const products = getLiveProducts();
  const filtered = products.filter(p => p.category === category);
  filtered.forEach(product => {
    productsGrid.appendChild(renderProductCard(product));
  });
}

// Render featured products for homepage
function renderFeaturedProducts() {
  const productsGrid = document.getElementById("productsGrid");
  productsGrid.innerHTML = "";
  const products = getLiveProducts();

  const categories = ["smartphone", "laptop", "headphone", "smartwatch", "powerbank", "adaptor"];
  categories.forEach(cat => {
    const filtered = products.filter(p => p.category === cat).slice(0, 2);
    filtered.forEach(product => {
      productsGrid.appendChild(renderProductCard(product));
    });
  });
}

// --- Cart and Stock Logic (Updated for live reduction) ---

function getProductIndex(id) {
  return getLiveProducts().findIndex(p => p.id === id);
}

function getProductById(id) {
  return getLiveProducts().find(p => p.id === id);
}

// Add to cart (Reduces stock by 1)
function addToCart(id) {
  const products = getLiveProducts();
  const productIndex = getProductIndex(id);
  const product = products[productIndex];

  if (!product || product.stock <= 0) {
    alert("Out of stock better luck next time");
    return;
  }
  
  // 1. Reduce the live stock
  product.stock -= 1;
  saveLiveProducts(products);

  // 2. Add/update the cart
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    // When adding to cart, only quantity and price matter for the cart item
    cart.push({...product, quantity: 1, stock: undefined}); 
  }
  localStorage.setItem("voiceShopCart", JSON.stringify(cart));
  
  // 3. Update UI on current page
  updateCartCount();
  // Call the appropriate render function based on the current page
  if (document.getElementById("pageTitle") && document.getElementById("pageTitle").textContent.includes("Featured")) {
    renderFeaturedProducts();
  } else if (document.getElementById("pageTitle")) {
    const category = document.getElementById("pageTitle").textContent.toLowerCase().split(' ')[0];
    renderCategoryProducts(category.replace('s','')); // crude way to get category name
  }
  alert(`${product.name} added to cart! Stock reduced.`);
}
function searchProducts() {
    let keyword = document.getElementById("searchBox").value.toLowerCase();
    const productsGrid = document.getElementById("productsGrid");

    productsGrid.innerHTML = "";

    let products = getLiveProducts();

    // Filter products by name or category
    let results = products.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.category.toLowerCase().includes(keyword)
    );

    // Show results
    results.forEach(product => {
        productsGrid.appendChild(renderProductCard(product));
    });

    // If no matches found
    if (results.length === 0) {
        productsGrid.innerHTML = "<p>No products found</p>";
    }
}

// Change quantity (Increments/Decrements stock)
function changeQuantity(id, delta) {
  const products = getLiveProducts();
  const productIndex = getProductIndex(id);
  const liveProduct = products[productIndex];
  const cartItem = cart.find(i => i.id === id);

  if (!cartItem) return;

  if (delta > 0) {
    // Incrementing quantity: Check and reduce live stock
    if (liveProduct.stock <= 0) {
      alert("Out of stock better luck next time");
      return;
    }
    liveProduct.stock -= 1;
    cartItem.quantity += 1;

  } else if (delta < 0) {
    // Decrementing quantity: Increase live stock
    if (cartItem.quantity <= 1) {
      // If quantity is 1 and we decrement, remove it
      cart = cart.filter(i => i.id !== id);
    } else {
      cartItem.quantity -= 1;
    }
    liveProduct.stock += 1;
  }
  
  saveLiveProducts(products);
  localStorage.setItem("voiceShopCart", JSON.stringify(cart));
  
  renderCartItems();
  updateCartCount();
}

// Render cart items on cart.html (Kept centered via CSS)
function renderCartItems() {
  const cartItemsDiv = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");
  const products = getLiveProducts(); // Get live stock for reference

  if (!cartItemsDiv || !totalPriceEl) return;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = "<p style='text-align: center;'>Your cart is empty.</p>";
    totalPriceEl.textContent = "";
    return;
  }

  let total = 0;
  cartItemsDiv.innerHTML = "";

  cart.forEach(item => {
    total += item.price * item.quantity;
    const liveStock = products.find(p => p.id === item.id).stock;
    
    // Check if item quantity exceeds available stock (shouldn't happen with correct logic, but good for display)
    const stockAlert = liveStock === 0 && item.quantity > 0 ? "⚠️ No more stock available!" : "";

    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width:80px;height:80px;">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p>Price: ₹${item.price}</p>
        <p>Quantity: 
          <button onclick="changeQuantity(${item.id}, -1)">-</button>
          ${item.quantity}
          <button onclick="changeQuantity(${item.id}, 1)">+</button>
        </p>
        <p style="color:red; font-size: 0.8rem;">${stockAlert}</p>
        <button onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    `;
    cartItemsDiv.appendChild(itemDiv);
  });

  totalPriceEl.textContent = `Total: ₹${total}`;
}

// Remove item from cart (Increments stock back)
function removeFromCart(id) {
  const cartItem = cart.find(i => i.id === id);
  if (!cartItem) return;

  const products = getLiveProducts();
  const productIndex = getProductIndex(id);
  
  // Return the quantity back to live stock
  products[productIndex].stock += cartItem.quantity;

  cart = cart.filter(i => i.id !== id);
  
  saveLiveProducts(products);
  localStorage.setItem("voiceShopCart", JSON.stringify(cart));
  renderCartItems();
  updateCartCount();
}

// Clear entire cart (Increments stock back for all items)
function clearCart() {
  if (confirm("Are you sure you want to clear the cart?")) {
    const products = getLiveProducts();
    
    cart.forEach(item => {
      const productIndex = getProductIndex(item.id);
      products[productIndex].stock += item.quantity;
    });

    cart = [];
    
    saveLiveProducts(products);
    localStorage.setItem("voiceShopCart", JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
  }
}

function purchaseCart() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  if (confirm("Do you want to place the order?")) {
    // Stock is already reduced on add/increment, so just clear the cart
    cart = [];
    localStorage.setItem("voiceShopCart", JSON.stringify(cart));
    updateCartCount();
    window.location.href = "order.html";
  }
}


function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountSpan = document.getElementById("cartCount");
  if (cartCountSpan) {
    cartCountSpan.textContent = count;
  }
}

function startVoiceAssistant() {
  const spokenTextP = document.getElementById("spokenText");
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1; 

  recognition.start();
  spokenTextP.textContent = "Listening...";

  recognition.onresult = function(event) {
    const speech = event.results[0][0].transcript.toLowerCase();
    spokenTextP.textContent = `You said: "${speech}"`;
    processVoiceCommand(speech);
  };

  recognition.onerror = function(event) {
    spokenTextP.textContent = "Error occurred in recognition: " + event.error;
  };
}

function processVoiceCommand(command) {
  command = command.toLowerCase();

  if (command.includes("go to laptops")) {
    window.location.href = "laptops.html";
  } else if (command.includes("go to smartphones")) {
    window.location.href = "smartphones.html";
  } else if (command.includes("go to headphones")) {
    window.location.href = "headphones.html";
  } else if (command.includes("go to smartwatches")) {
    window.location.href = "smartwatches.html";
  } else if (command.includes("go to power banks") || command.includes("go to powerbanks")) {
    window.location.href = "powerbanks.html";
  } else if (command.includes("go to adaptors") || command.includes("go to adapters")) {
    window.location.href = "adaptors.html";
  } else if (
    command.includes("go to cart") ||
    command.includes("show cart") ||
    command.includes("open cart")
  ) {
    window.location.href = "cart.html";
  } else if (
    command.includes("go to home") ||
    command.includes("home page") ||
    command.includes("go home")
  ) {
    window.location.href = "index.html";
  } else if (command.startsWith("add ")) {
    let foundProduct = null;
    const products = getLiveProducts();
    for (let p of products) {
      if (command.includes(p.name.toLowerCase())) {
        foundProduct = p;
        break;
      }
    }
    if (foundProduct) {
      addToCart(foundProduct.id);
    } else {
      alert("Product not found for adding to cart.");
    }
  } else {
    alert("Voice command not recognized. Try commands like 'go to laptops', 'go to cart', or 'go to home'.");
  }
}