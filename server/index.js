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

// Magic Setup Route (Direct in Index for safety)
app.get('/api/setup', async (req, res) => {
  try {
    const { pool } = require('./config/db');
    await pool.query(`CREATE TABLE IF NOT EXISTS products (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255), price DECIMAL(10,2), images TEXT)`); // Simple test
    await pool.query(`INSERT INTO products (name, price) VALUES ('Test Rug', 100) ON DUPLICATE KEY UPDATE name=name`);
    res.json({ ok: true, message: 'Setup script triggered! Please check your Shop page now.' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
app.use('/api/setup', require('./routes/setup.routes'));

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
function start() {
  // 1. START LISTENING IMMEDIATELY (Don't wait for DB)
  app.listen(PORT, () => {
    console.log(`\n✦ Veloura Rugs server running on http://localhost:${PORT}`);
    console.log(`  ├─ Storefront: http://localhost:${PORT}`);
    console.log(`  ├─ Admin:      http://localhost:${PORT}/admin`);
    console.log(`  └─ API:        http://localhost:${PORT}/api`);
    
    // 2. Do DB checks in the background after starting
    testConnection();
    
    (async () => {
      try {
        const { pool } = require('./config/db');
        console.log("🛠️ Running Background Auto-Setup...");
        await pool.query(`CREATE TABLE IF NOT EXISTS products (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255), price DECIMAL(10,2), vendor VARCHAR(255), image_urls TEXT, is_active TINYINT DEFAULT 1, featured TINYINT DEFAULT 0, style VARCHAR(50), size VARCHAR(50), color VARCHAR(50))`);
        console.log("✅ Background Setup Complete!");
      } catch (err) {
        console.error("❌ Background Setup Failed:", err.message);
      }
    })();
  });
}
start();
// Export for Vercel
module.exports = app;

// Only start if run directly
if (require.main === module) {
  start();
}
