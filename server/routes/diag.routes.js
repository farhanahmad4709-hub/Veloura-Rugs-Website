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

module.exports = router;
