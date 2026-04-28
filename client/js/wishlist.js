/* ═══════════════════════════════════════════════════════════════
   VELOURA RUGS — WISHLIST SYSTEM (API SYNC)
   ═══════════════════════════════════════════════════════════════ */

const Wishlist = {
  STORAGE_KEY: 'veloura_wishlist',
  items: [],

  async init() {
    if (window.VelouraAPI && VelouraAPI.isLoggedIn()) {
      try {
        const res = await VelouraAPI.getWishlist();
        if (res.ok && Array.isArray(res.data)) {
          this.items = res.data.map(item => ({
            id: item.product_id,
            api_item_id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            original_price: parseFloat(item.original_price),
            images: [item.image],
            badge: item.badge,
            size: item.size,
            style: item.style
          }));
          this.saveLocal(this.items);
        }
      } catch (err) {
        console.error('Wishlist sync error:', err);
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

  async toggle(product) {
    const isAdded = this.isWishlisted(product.id);
    
    if (window.VelouraAPI && VelouraAPI.isLoggedIn()) {
      if (isAdded) {
        const item = this.items.find(i => i.id === product.id);
        if (item && item.api_item_id) {
          await VelouraAPI.removeFromWishlist(item.api_item_id);
          showToast('Removed from wishlist', '💔');
        }
      } else {
        await VelouraAPI.addToWishlist(product.id);
        showToast('Added to wishlist', '❤️', 'toast-gold');
      }
      await this.init(); // Refresh from server
    } else {
      // Guest logic
      let items = this.getLocal();
      const idx = items.findIndex(i => i.id === product.id);
      if (idx >= 0) {
        items.splice(idx, 1);
        showToast('Removed from wishlist', '💔');
      } else {
        items.push(product);
        showToast('Added to wishlist', '❤️', 'toast-gold');
      }
      this.items = items;
      this.saveLocal(items);
    }
    return !isAdded; 
  },

  isWishlisted(id) {
    return this.items.some(i => i.id === id);
  },

  async remove(id) {
    const isAdded = this.isWishlisted(id);
    if (!isAdded) return;

    if (window.VelouraAPI && VelouraAPI.isLoggedIn()) {
      const item = this.items.find(i => i.id === id);
      if (item && item.api_item_id) {
        await VelouraAPI.removeFromWishlist(item.api_item_id);
        await this.init();
      }
    } else {
      const items = this.getLocal().filter(i => i.id !== id);
      this.items = items;
      this.saveLocal(items);
    }
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.items = [];
    this.updateUI();
  },

  getCount() {
    return this.items.length;
  },

  updateUI() {
    document.querySelectorAll('.action-btn[data-wishlist]').forEach(btn => {
      const id = parseInt(btn.dataset.wishlist);
      if (this.isWishlisted(id)) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
  Wishlist.init();
});