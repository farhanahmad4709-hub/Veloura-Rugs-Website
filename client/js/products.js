/* ═══════════════════════════════════════════════════════════════
   VELOURA RUGS — PRODUCTS DATA
   ═══════════════════════════════════════════════════════════════ */

// Local fallback data (superseded by API if available)
const PRODUCTS = [
  {
    id: 1,
    name: "3×5 ft Ivory Floral Traditional Wool Rug",
    vendor: "Veloura Rugs",
    price: 111997,
    original_price: 278600,
    discount: 60,
    badge: "SALE",
    size: "3x5",
    style: "Traditional",
    color: "Beige",
    description: "A compact traditional wool rug with ivory and warm beige floral motifs.",
    images: ["https://images.pexels.com/photos/34135357/pexels-photo-34135357.jpeg"],
    featured: true
  }
  // ... (In a real app, this would be empty or a few placeholders)
];

// Sizes available
const RUG_SIZES = ["3x5", "4x6", "5x8", "6x9", "7x10", "8x10", "9x12", "10x13", "12x15"];

// Styles available
const RUG_STYLES = ["Traditional", "Transitional", "Tribal", "Turkish Oushak", "Vintage", "Mamluk", "Modern", "Kilims", "Moroccan"];

// Colors available
const RUG_COLORS = ["Multicolor", "Beige", "Red", "Blue", "Black", "Brown", "Grey", "Green", "Gold"];

function getPrimaryImage(product) {
  if (!product || !Array.isArray(product.images) || product.images.length === 0) return 'image/placeholder.jpg';
  return product.images[0];
}

function getProductById(id) {
  return PRODUCTS.find(p => p.id === parseInt(id));
}

function getRelatedProducts(product, limit = 4) {
  return PRODUCTS
    .filter(p => p.id !== product.id && (p.style === product.style || p.color === product.color))
    .slice(0, limit);
}

function formatPKR(val) {
  return 'PKR ' + Number(val).toLocaleString('en-PK');
}

/**
 * Renders a single product card HTML
 * @param {Object} product 
 * @returns {String} HTML string
 */
function renderProductCard(product) {
  try {
    if (!product) return '';
    
    // 1. Safe Name & Vendor
    const name = product.name || 'Untitled Rug';
    const vendor = product.vendor || 'Veloura Rugs';
    
    // 2. Safe Image Loading
    let images = [];
    if (product.image_urls && typeof product.image_urls === 'string') {
      images = product.image_urls.split(',');
    } else if (Array.isArray(product.images)) {
      images = product.images;
    }
    const primaryImg = (images.length > 0 && images[0]) ? images[0] : 'image/placeholder.jpg';
    
    // 3. Safe Price Formatting
    const price = parseFloat(product.price) || 0;
    const currentPrice = typeof formatPKR === 'function' ? formatPKR(price) : `PKR ${price.toLocaleString()}`;
    
    let priceOrigHtml = '';
    if (product.original_price) {
      const origPrice = parseFloat(product.original_price);
      priceOrigHtml = `<span class="price-orig">${typeof formatPKR === 'function' ? formatPKR(origPrice) : `PKR ${origPrice.toLocaleString()}`}</span>`;
    }
    
    const badgeHtml = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
    
    // 4. Safe JSON (Escape for HTML attribute)
    const productJson = JSON.stringify(product)
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    return `
      <div class="product-card" data-product='${productJson}'>
        <div class="product-image">
          ${badgeHtml}
          <img src="${primaryImg}" alt="${name}" loading="lazy" onerror="this.src='image/placeholder.jpg'">
          <div class="product-actions">
            <button class="action-btn" onclick="handleCartAdd(this)" title="Add to Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </button>
            <button class="action-btn" onclick="handleWishlistToggle(this)" title="Add to Wishlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </button>
          </div>
        </div>
        <div class="product-info">
          <p class="product-vendor">${vendor}</p>
          <h3 class="product-title"><a href="product.html?id=${product.id}">${name}</a></h3>
          <div class="product-price">
            <span class="price-current">${currentPrice}</span>
            ${priceOrigHtml}
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Individual product render error:', err);
    return ''; // Skip this product if it's totally broken
  }
}

// Global handlers to avoid quote issues in HTML attributes
window.handleCartAdd = function(btn) {
  const card = btn.closest('.product-card');
  const product = JSON.parse(card.dataset.product);
  Cart.add(product);
};

window.handleWishlistToggle = function(btn) {
  const card = btn.closest('.product-card');
  const product = JSON.parse(card.dataset.product);
  Wishlist.toggle(product);
};
