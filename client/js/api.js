/* ═══════════════════════════════════════════════════════════════
   VELOURA RUGS — CLIENT API HELPER
   Central module for all API calls from the storefront
   ═══════════════════════════════════════════════════════════════ */

// Replace this with your Render URL after deployment (e.g., https://veloura-api.onrender.com)
const API_BASE = '/api';

const VelouraAPI = {
  /* ─── TOKEN MANAGEMENT ─────────────────── */
  getToken() {
    return localStorage.getItem('veloura_token');
  },
  setToken(token) {
    localStorage.setItem('veloura_token', token);
  },
  clearToken() {
    localStorage.removeItem('veloura_token');
    localStorage.removeItem('veloura_current_user');
  },

  /* ─── FETCH WRAPPER ────────────────────── */
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { 
        ...options, 
        headers,
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    if (res.status === 401) {
      this.clearToken();
      // Don't redirect if already on login page
      if (!window.location.pathname.includes('login')) {
        // User is not logged in, that's ok for public routes
      }
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      return { ok: res.ok, blob: await res.blob(), status: res.status };
    }

      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, data, status: res.status };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') return { ok: false, data: { error: 'Request timed out' }, status: 408 };
      return { ok: false, data: { error: 'Network error' }, status: 500 };
    }
  },

  /* ─── AUTH ──────────────────────────────── */
  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.ok && res.data && res.data.token && res.data.user) {
      this.setToken(res.data.token);
      localStorage.setItem('veloura_current_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  logout() {
    this.clearToken();
  },

  getCurrentUser() {
    try { 
      const data = localStorage.getItem('veloura_current_user');
      if (!data || data === 'undefined') return null;
      return JSON.parse(data); 
    }
    catch { return null; }
  },

  isLoggedIn() {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  /* ─── PRODUCTS ─────────────────────────── */
  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    return this.request(`/products${qs ? '?' + qs : ''}`);
  },

  async getProduct(id) {
    return this.request(`/products/${id}`);
  },

  /* ─── CART ──────────────────────────────── */
  async getCart() {
    return this.request('/cart');
  },

  async addToCart(product_id, quantity = 1) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id, quantity })
    });
  },

  async updateCartItem(id, quantity) {
    return this.request(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  async removeFromCart(id) {
    return this.request(`/cart/${id}`, { method: 'DELETE' });
  },

  /* ─── WISHLIST ─────────────────────────── */
  async getWishlist() {
    return this.request('/wishlist');
  },

  async addToWishlist(product_id) {
    return this.request('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id })
    });
  },

  async removeFromWishlist(id) {
    return this.request(`/wishlist/${id}`, { method: 'DELETE' });
  },

  /* ─── ORDERS ───────────────────────────── */
  async placeOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  async createOrder(orderData) {
    return this.placeOrder(orderData);
  },

  async getOrders() {
    return this.request('/orders');
  },

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }
};

// Make globally available
window.VelouraAPI = VelouraAPI;
