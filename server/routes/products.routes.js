const router = require('express').Router();
const { pool } = require('../config/db');

// Internal function to auto-setup database if tables are missing
async function ensureDatabaseReady() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0].toLowerCase());
    
    if (!tableList.includes('products') || !tableList.includes('product_images')) {
      console.log('🛠️ Tables missing! Running Auto-Setup...');
      
      await pool.query('SET FOREIGN_KEY_CHECKS = 0');
      await pool.query(`CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255), description TEXT, price DECIMAL(10,2), original_price DECIMAL(10,2),
        discount_pct INT, badge VARCHAR(20), size VARCHAR(20), style VARCHAR(50),
        color VARCHAR(50), stock_count INT DEFAULT 10, is_active TINYINT DEFAULT 1, featured TINYINT DEFAULT 1
      )`);
      
      await pool.query(`CREATE TABLE IF NOT EXISTS product_images (
        id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, image_url TEXT, sort_order INT DEFAULT 0
      )`);

      // Seed data if empty
      const [count] = await pool.query('SELECT COUNT(*) as total FROM products');
      if (count[0].total === 0) {
        await pool.query(`INSERT INTO products (id, name, price, original_price, discount_pct, badge, size, style, color, featured, is_active) VALUES
          (1, 'Ivory Floral Traditional Wool Rug', 111997.00, 278600.00, 60, 'SALE', '3x5', 'Traditional', 'Beige', 1, 1),
          (2, 'Red Transitional Wool Rug', 97997.00, 245000.00, 60, 'NEW', '3x5', 'Transitional', 'Red', 1, 1),
          (3, 'Multicolor Tribal Wool Runner', 83997.00, 210000.00, 60, 'SALE', '3x5', 'Tribal', 'Multicolor', 1, 1)`);
        
        await pool.query(`INSERT INTO product_images (product_id, image_url) VALUES
          (1, 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg'),
          (2, 'https://images.pexels.com/photos/10313592/pexels-photo-10313592.jpeg'),
          (3, 'https://images.pexels.com/photos/4553277/pexels-photo-4553277.jpeg')`);
      }
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('✅ DB Auto-Setup Complete');
    }
  } catch (err) {
    console.error('❌ Auto-Setup Failed:', err.message);
  }
}

router.get('/', async (req, res) => {
  try {
    await ensureDatabaseReady(); // Check/Fix DB every time it's empty

    const { style, size, color, sort, search, featured } = req.query;
    
    let sql = 'SELECT p.*, GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order) AS image_urls FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id WHERE p.is_active = 1';
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
