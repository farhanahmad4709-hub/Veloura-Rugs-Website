const router = require('express').Router();
const { pool } = require('../config/db');

router.get('/diag', async (req, res) => {
  try {
    const results = {};
    
    // Check tables
    const [tables] = await pool.query('SHOW TABLES');
    results.tables = tables.map(t => Object.values(t)[0]);
    
    // Check products columns
    if (results.tables.includes('products')) {
      const [cols] = await pool.query('DESCRIBE products');
      results.products_cols = cols.map(c => c.Field);
    }
    
    // Check orders columns
    if (results.tables.includes('orders')) {
      const [cols] = await pool.query('DESCRIBE orders');
      results.orders_cols = cols.map(c => c.Field);
    }

    // Check one product for stock
    if (results.tables.includes('products')) {
      const [prod] = await pool.query('SELECT id, name, stock FROM products LIMIT 1');
      results.sample_product = prod[0];
    }

    res.json({ ok: true, diagnostics: results });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/force-init', async (req, res) => {
  try {
    const { ensureDatabaseReady } = require('../utils/db-init');
    // Mock req, res, next since it's designed as middleware
    await ensureDatabaseReady({ path: '' }, {}, () => {});
    res.json({ ok: true, message: 'Database forcefully initialized and healed!' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/create-admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { pool } = require('../config/db');
    const hash = await bcrypt.hash('admin123', 10);
    // Insert or update admin account
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@veloura.com', ?, 'admin')
       ON DUPLICATE KEY UPDATE password_hash = ?, role = 'admin'`, 
      [hash, hash]
    );
    res.json({ ok: true, message: 'Admin account created! Username: admin, Password: admin123' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/debug-checkout', async (req, res) => {
  try {
    const { pool } = require('../config/db');
    const conn = await pool.getConnection();
    try {
      const { items, discount_amount = 0, shipping_fee = 0 } = req.body;
      let subtotal = 0;
      for (const item of items) {
        const [prod] = await conn.query('SELECT price, stock FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
        if (!prod.length || prod[0].stock < item.quantity) {
          return res.status(400).json({ error: 'Stock validation failed' });
        }
        subtotal += prod[0].price * item.quantity;
      }
      res.json({ ok: true, subtotal });
    } catch (e) {
      res.status(500).json({ ok: false, exact_error: e.message, stack: e.stack });
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, exact_error: err.message });
  }
});

module.exports = router;
