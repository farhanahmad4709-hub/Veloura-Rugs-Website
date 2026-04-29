/* ═══════════════════════════════════════════════════════════════
   VELOURA RUGS — SHARED APP JS
   ═══════════════════════════════════════════════════════════════ */

/* ─── TOAST NOTIFICATIONS ────────────────────────────────────── */
function showToast(message, icon = '✓', cls = '') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${cls}`;
  // Safety check: ensure icon and message are not literally "undefined"
  const iconSafe = (icon && icon !== 'undefined' && icon !== 'error' && icon !== 'info' && icon !== 'success') ? icon : '✓';
  const msgSafe = (message && message !== 'undefined') ? message : 'Action completed';
  toast.innerHTML = `<span>${iconSafe}</span><span>${msgSafe}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

/* ─── CART SIDEBAR TOGGLE ────────────────────────────────────── */
function toggleCart(e) {
  if (e) e.preventDefault();
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
  Cart.renderSidebar();
}
function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

/* ─── MOBILE NAV ─────────────────────────────────────────────── */
function toggleNav() {
  document.getElementById('mainNav').classList.toggle('open');
}

/* ─── QUICK VIEW MODAL ───────────────────────────────────────── */
function openQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;

  let modal = document.getElementById('qvModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'qvModal';
    modal.className = 'qv-modal';
    modal.innerHTML = `
      <div class="qv-inner">
        <button class="qv-close" onclick="closeQuickView()">✕</button>
        <div class="qv-img" id="qvImg"></div>
        <div class="qv-body" id="qvBody"></div>
      </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) closeQuickView(); });
    document.body.appendChild(modal);
  }

  const productPrice = product.price || 0;
  const originalPrice = product.original_price || product.originalPrice || productPrice;
  const primaryImg = product.images?.[0] || '';

  document.getElementById('qvImg').innerHTML = `<img src="${primaryImg}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">`;
  document.getElementById('qvBody').innerHTML = `
    <p class="product-vendor">${product.vendor || 'Veloura Rugs'}</p>
    <h2>${product.name}</h2>
    <div class="product-price">
      <span class="price-sale">PKR ${productPrice.toLocaleString('en-US',{minimumFractionDigits:2})}</span>
      <span class="price-orig">PKR ${originalPrice.toLocaleString('en-US',{minimumFractionDigits:2})}</span>
    </div>
    <p>${product.description || ''}</p>
    <div style="display:flex;gap:.5rem;font-size:.8rem;color:var(--muted);">
      <span>Size: <strong>${product.size || ''}</strong></span>
      <span>·</span>
      <span>Style: <strong>${product.style || ''}</strong></span>
      <span>·</span>
      <span>Color: <strong>${product.color || ''}</strong></span>
    </div>
    <div class="qv-actions">
      <button class="btn btn-green" onclick='Cart.add(${JSON.stringify(product).replace(/'/g,"&apos;")});closeQuickView()'>Add to Cart</button>
      <a href="product.html?id=${product.id}" class="btn btn-outline-green">View Details</a>
    </div>
  `;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('qvModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── RENDER PRODUCT CARD ────────────────────────────────────── */
function renderProductCard(product) {
  const wishlisted = Wishlist.isWishlisted(product.id);
  const badgeCls = product.badge === 'NEW' ? 'product-badge badge-new' : 'product-badge';
  const primaryImg = product.images?.[0] || '';
  const productPrice = product.price || 0;
  const originalPrice = product.original_price || product.originalPrice || productPrice;

  return `
/* ─── RENDER PRODUCT CARD ────────────────────────────────────── */
function renderProductCard(product) {
  const wishlisted = Wishlist.isWishlisted(product.id);
  const badgeCls = product.badge === 'NEW' ? 'product-badge badge-new' : 'product-badge';
  const primaryImg = product.images?.[0] || '';
  const productPrice = product.price || 0;
  const originalPrice = product.original_price || product.originalPrice || productPrice;

  return `
    <div class="product-card">
      <div class="product-img">
        <a href="product.html?id=${product.id}">
          <img class="main-img" src="${primaryImg}" alt="${product.name}" loading="lazy" />
        </a>
        ${product.badge ? `<span class="${badgeCls}">${product.badge}</span>` : ''}
        <div class="product-actions">
          <button class="action-btn ${wishlisted ? 'active' : ''}" data-wishlist="${product.id}"
            title="Wishlist" onclick="handleWishlist(${product.id}, this)">
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </button>
          <button class="action-btn" title="Quick View" onclick="openQuickView(${product.id})">
            <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>
      <div class="product-body">
        <p class="product-vendor">${product.vendor || 'Veloura Rugs'}</p>
        <h3 class="product-name"><a href="product.html?id=${product.id}" style="color:inherit;">${product.name}</a></h3>
        <div class="product-price">
          <span class="price-sale">PKR ${productPrice.toLocaleString('en-US',{minimumFractionDigits:2})}</span>
          <span class="price-orig">PKR ${originalPrice.toLocaleString('en-US',{minimumFractionDigits:2})}</span>
        </div>
        <button class="product-cta" onclick='Cart.add(${JSON.stringify(product).replace(/'/g,"&apos;")})'>Add to Cart</button>
      </div>
    </div>
  `;
}

function handleWishlist(id, btn) {
  const product = getProductById(id);
  if (!product) return;
  const added = Wishlist.toggle(product);
  if (added) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
}

/* ─── NEWSLETTER ─────────────────────────────────────────────── */
/* ─── AUTH UI UPDATE ─────────────────────────────────────────── */
function updateAuthUI() {
  const user = VelouraAPI.getCurrentUser();
  const authNav = document.getElementById('authNav');
  if (!authNav) return;
  
  if (user && user.name) {
    authNav.innerHTML = `
      <span style="font-size:var(--fs-sm);color:var(--green);font-weight:600;">✦ ${user.name.split(' ')[0]}</span>
      <button onclick="VelouraAPI.logout();location.reload();"
        style="font-size:var(--fs-sm);color:var(--muted);background:none;border:none;cursor:pointer;font-family:var(--ff-body);font-weight:500;margin-left:.8rem;">
        Logout
      </button>
    `;
  } else {
    authNav.innerHTML = `
      <a href="login.html" style="font-size:var(--fs-sm);color:var(--muted);font-weight:500;transition:color .2s;"
         onmouseover="this.style.color='var(--green)'" onmouseleave="this.style.color='var(--muted)'">
        Login
      </a>
    `;
  }
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  // ... rest of init
  const form = document.querySelector('.newsletter-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input && input.value) {
        showToast('Thank you for subscribing!', '✉️', 'toast-gold');
        input.value = '';
      }
    });
    const btn = form.querySelector('button');
    if (btn) {
      btn.addEventListener('click', () => {
        const input = form.querySelector('input');
        if (input && input.value) {
          showToast('Thank you for subscribing!', '✉️', 'toast-gold');
          input.value = '';
        }
      });
    }
  }

  // Global search
  const searchInput = document.querySelector('.search-wrap input');
  if (searchInput) {
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = `shop.html?search=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }
});