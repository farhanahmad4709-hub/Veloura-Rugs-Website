/* ═══════════════════════════════════════════════════════════════
   VELOURA RUGS — CART SYSTEM (API SYNC)
   ═══════════════════════════════════════════════════════════════ */

const Cart = {
  STORAGE_KEY: 'veloura_cart',
  items: [],

  async init() {
    if (window.VelouraAPI && VelouraAPI.isLoggedIn()) {
      try {
        const res = await VelouraAPI.getCart();
        if (res.ok && Array.isArray(res.data)) {
          // Map API data to our frontend structure
          this.items = res.data.map(item => ({
            id: item.product_id,
            api_item_id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            qty: item.quantity,
            images: [item.image],
            size: item.size,
            style: item.style
          }));
          this.saveLocal(this.items);
        }
      } catch (err) {
        console.error('Cart sync error:', err);
        this.items = this.getLocal();
      }
    } else {
      this.items = this.getLocal();
    }
    this.updateUI();
  },

  getLocal() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
    catch { return []; }
  },

  saveLocal(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.updateUI();
  },

  async add(product, qty = 1) {
    if (window.VelouraAPI && VelouraAPI.isLoggedIn()) {
      const res = await VelouraAPI.addToCart(product.id, qty);
      if (!res.ok) {
        showToast(res.error || 'Could not add to cart', '❌', 'toast-error');
        return;
      }
      await this.init(); // Refresh from server
    } else {
      // Guest logic
      const items = this.getLocal();
      const existing = items.find(i => i.id === product.id);
      if (existing) existing.qty += qty;
      else items.push({ ...product, qty });
      this.items = items;
      this.saveLocal(items);
    }
    showToast(`"${product.name.substring(0, 30)}..." added to cart`, '🛒');
  },

  async remove(id) {
    if (window.VelouraAPI && VelouraAPI.isLoggedIn()) {
      // We need the API's item ID, not the product ID. 
      // Our items array now stores 'api_item_id' for this purpose.
      const item = this.items.find(i => i.id === id);
      if (item && item.api_item_id) {
        await VelouraAPI.removeFromCart(item.api_item_id);
        await this.init();
      }
    } else {
      const items = this.getLocal().filter(i => i.id !== id);
      this.items = items;
      this.saveLocal(items);
    }
  },

  async updateQty(id, qty) {
    if (qty < 1) return this.remove(id);

    if (window.VelouraAPI && VelouraAPI.isLoggedIn()) {
      const item = this.items.find(i => i.id === id);
      if (item && item.api_item_id) {
        await VelouraAPI.updateCartItem(item.api_item_id, qty);
        await this.init();
      }
    } else {
      const items = this.getLocal();
      const item = items.find(i => i.id === id);
      if (item) {
        item.qty = qty;
        this.items = items;
        this.saveLocal(items);
      }
    }
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.items = [];
    this.updateUI();
  },

  getCount() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  getTotal() {
    return this.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  },

  updateUI() {
    const count = this.getCount();
    document.querySelectorAll('.cart-badge').forEach(el => { el.textContent = count; });
    this.renderSidebar();
  },

  renderSidebar() {
    const list = document.querySelector('.cart-items-list');
    const empty = document.querySelector('.cart-empty');
    const footer = document.querySelector('.cart-footer');
    const headerTitle = document.querySelector('.cart-header h3');
    if (!list) return;

    const count = this.getCount();
    if (headerTitle) headerTitle.textContent = `Your Cart (${count} item${count !== 1 ? 's' : ''})`;

    if (this.items.length === 0) {
      list.innerHTML = '';
      list.style.display = 'none';
      if (empty) empty.style.display = 'flex';
      if (footer) footer.style.display = 'none';
      return;
    }

    list.style.display = 'block';
    if (empty) empty.style.display = 'none';
    if (footer) footer.style.display = 'block';

    list.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.images?.[0] || ''}" alt="${item.name}" style="width:72px;height:72px;object-fit:cover;border-radius:3px;" />
        </div>
        <div class="cart-item-info">
          <h4>${item.name.substring(0, 45)}${item.name.length > 45 ? '...' : ''}</h4>
          <div class="cart-item-price">PKR ${(item.price * item.qty).toLocaleString('en-US', {minimumFractionDigits:2})}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="Cart.updateQty(${item.id}, ${item.qty - 1})">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="Cart.updateQty(${item.id}, ${item.qty + 1})">+</button>
          </div>
        </div>
        <button class="remove-item" onclick="Cart.remove(${item.id})" title="Remove">✕</button>
      </div>
    `).join('');

    const totalRow = footer ? footer.querySelector('.cart-total-row span:last-child') : null;
    if (totalRow) {
      totalRow.textContent = `PKR ${this.getTotal().toLocaleString('en-US', {minimumFractionDigits:2})}`;
    }
  }
};

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
});