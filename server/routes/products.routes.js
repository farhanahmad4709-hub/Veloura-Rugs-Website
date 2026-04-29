const router = require('express').Router();
const { pool } = require('../config/db');

// GET /api/products — list with optional filters
router.get('/', async (req, res) => {
  try {
    const { style, size, color, sort, search, featured } = req.query;
    
    // Use explicit 'test.' prefix to avoid any "Ghost Database" issues
    let sql = 'SELECT p.*, GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) AS image_urls FROM test.products p LEFT JOIN test.product_images pi ON p.id = pi.product_id WHERE p.is_active = 1';
    const params = [];

    if (style) { sql += ' AND p.style = ?'; params.push(style); }
    if (size) { sql += ' AND p.size = ?'; params.push(size); }
    if (color) { sql += ' AND p.color = ?'; params.push(color); }
    if (featured === 'true') { sql += ' AND p.featured = 1'; }
    if (search) { sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    sql += ' GROUP BY p.id';

    if (sort === 'price-asc') sql += ' ORDER BY p.price ASC';
    else if (sort === 'price-desc') sql += ' ORDER BY p.price DESC';
    else if (sort === 'name-asc') sql += ' ORDER BY p.name ASC';
    else if (sort === 'name-desc') sql += ' ORDER BY p.name DESC';
    else sql += ' ORDER BY p.id ASC';

    console.log('📡 Fetching rugs from test database...');
    const [rows] = await pool.query(sql, params);

    const products = rows.map(r => ({
      ...r,
      images: r.image_urls ? r.image_urls.split(',') : [],
      image_urls: undefined
    }));

    res.json(products);
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
