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

const { ensureDatabaseReady } = require('./utils/db-init');

/* ─── MIDDLEWARE ──────────────────────────── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global DB Readiness state
let isDbReady = false;
let dbCheckInProgress = null;

app.use(async (req, res, next) => {
  if (isDbReady) return next();
  
  if (!dbCheckInProgress) {
    dbCheckInProgress = ensureDatabaseReady()
      .then(() => { isDbReady = true; dbCheckInProgress = null; })
      .catch(err => { console.error('DB Readiness Error:', err); dbCheckInProgress = null; });
  }
  
  // Safety timeout: don't block request for more than 8s
  const timeout = new Promise(resolve => setTimeout(resolve, 8000));
  await Promise.race([dbCheckInProgress, timeout]);
  
  next();
});

/* ─── API ROUTES ─────────────────────────── */
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/test', require('./routes/diag.routes'));

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
// Background Auto-Setup has been moved to utils/db-init.js

// Start local server only if run directly
if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 Local server: http://localhost:${PORT}`));
}

// Export for Vercel
module.exports = app;
