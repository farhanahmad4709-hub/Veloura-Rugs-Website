const router = require('express').Router();
const { pool } = require('../config/db');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { style, size, color, sort, search, featured } = req.query;
    let sql = 'SELECT p.*, (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) as main_image FROM products p WHERE p.is_active = 1';
    const params = [];

    if (style) { sql += ' AND p.style = ?'; params.push(style); }
    if (size) { sql += ' AND p.size = ?'; params.push(size); }
    if (color) { sql += ' AND p.color = ?'; params.push(color); }
    if (featured === 'true') { sql += ' AND p.featured = 1'; }
    if (search) { sql += ' AND (p.name LIKE ? OR p.style LIKE ? OR p.color LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    if (sort === 'price-asc') sql += ' ORDER BY p.price ASC';
    else if (sort === 'price-desc') sql += ' ORDER BY p.price DESC';
    else if (sort === 'name-asc') sql += ' ORDER BY p.name ASC';
    else if (sort === 'name-desc') sql += ' ORDER BY p.name DESC';
    else sql += ' ORDER BY p.id ASC';

    const [rows] = await pool.query(sql, params);
    
    const products = rows.map(r => ({
      ...r,
      images: r.main_image ? [r.main_image] : ['https://via.placeholder.com/400x500?text=Veloura+Rug']
    }));

    res.json(products);
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order', [req.params.id]);
    
    const product = rows[0];
    product.images = images.map(img => img.image_url);
    if (product.images.length === 0) {
      product.images = ['https://via.placeholder.com/400x500?text=Veloura+Rug'];
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
