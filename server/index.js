/* ═══════════════════════════════════════════════════════════════
   VELOURA RUGS — EXPRESS SERVER
   Serves: Client storefront, Admin dashboard, REST API
   ═══════════════════════════════════════════════════════════════ */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

/* ─── MIDDLEWARE ──────────────────────────── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─── API ROUTES ─────────────────────────── */
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

/* ─── SERVE STATIC FILES ─────────────────── */
// Admin dashboard at /admin
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// Client storefront at root
app.use(express.static(path.join(__dirname, '..', 'client')));

// Fallback to index.html for client
app.get('*splat', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
  }
});

/* ─── START SERVER ───────────────────────── */
async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n✦ Veloura Rugs server running on http://localhost:${PORT}`);
    console.log(`  ├─ Storefront: http://localhost:${PORT}`);
    console.log(`  ├─ Admin:      http://localhost:${PORT}/admin`);
    console.log(`  └─ API:        http://localhost:${PORT}/api\n`);
  });
}

// Export for Vercel
module.exports = app;

// Only start if run directly
if (require.main === module) {
  start();
}
