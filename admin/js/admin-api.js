/* ═══════════════════════════════════════════
   ADMIN API HELPER
   ═══════════════════════════════════════════ */

// Replace this with your Render URL after deployment
const API_BASE = '/api';

const AdminAPI = {
  getToken() { return localStorage.getItem('veloura_admin_token'); },

  checkAuth() {
    if (!this.getToken()) { window.location.href = 'index.html'; return false; }
    return true;
  },

  logout() {
    localStorage.removeItem('veloura_admin_token');
    localStorage.removeItem('veloura_admin_user');
    window.location.href = 'index.html';
  },

  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}`, ...options.headers };
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (res.status === 401 || res.status === 403) { this.logout(); return null; }

    const ct = res.headers.get('content-type');
    if (ct && ct.includes('text/csv')) return { ok: res.ok, blob: await res.blob() };

    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data, status: res.status };
  },

  // Dashboard
  async getDashboard() { return this.request('/admin/dashboard'); },

  // Products
  async getProducts() { return this.request('/admin/products'); },
  async createProduct(data) { return this.request('/admin/products', { method: 'POST', body: JSON.stringify(data) }); },
  async updateProduct(id, data) { return this.request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
  async deleteProduct(id) { return this.request(`/admin/products/${id}`, { method: 'DELETE' }); },

  // Orders
  async getOrders(status) { return this.request(`/admin/orders${status ? '?status=' + status : ''}`); },
  async updateOrderStatus(id, status) { return this.request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }); },

  // Users
  async getUsers() { return this.request('/admin/users'); },

  // Messages
  async getMessages() { return this.request('/admin/messages'); },

  // CSV Export
  async exportCSV(type) {
    const res = await fetch(`/api/admin/export/${type}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veloura_${type}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

// Toast helper
function showToast(msg, type = 'info') {
  let c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

// Format currency
function formatPKR(val) {
  return 'PKR ' + Number(val).toLocaleString('en-PK');
}
