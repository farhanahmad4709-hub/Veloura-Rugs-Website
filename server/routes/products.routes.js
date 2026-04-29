const router = require('express').Router();
const { pool } = require('../config/db');

async function ensureDatabaseReady() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0].toLowerCase());
    
    // Check if we need to seed (missing tables OR empty products)
    let needsSeed = false;
    if (!tableList.includes('products')) {
      needsSeed = true;
    } else {
      const [count] = await pool.query('SELECT COUNT(*) as total FROM products');
      if (count[0].total === 0) needsSeed = true;
    }

    if (needsSeed) {
      console.log('⚡ Running Lightning Luxury Seed...');
      await pool.query('SET FOREIGN_KEY_CHECKS = 0');
      await pool.query('DROP TABLE IF EXISTS product_images');
      await pool.query('DROP TABLE IF EXISTS products');
      
      await pool.query(`CREATE TABLE products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255), description TEXT, price DECIMAL(10,2), original_price DECIMAL(10,2),
        discount_pct INT, badge VARCHAR(20), size VARCHAR(20), style VARCHAR(50),
        color VARCHAR(50), stock_count INT DEFAULT 10, is_active TINYINT DEFAULT 1, featured TINYINT DEFAULT 1
      )`);
      
      await pool.query(`CREATE TABLE product_images (
        id INT PRIMARY KEY AUTO_INCREMENT, product_id INT, image_url TEXT, sort_order INT DEFAULT 0
      )`);

      // 1. Bulk Insert Products
      await pool.query(`
        INSERT INTO products (id, name, price, original_price, discount_pct, badge, size, style, color, featured) VALUES
        (1, 'Ivory Floral Traditional Wool Rug', 111997, 278600, 60, 'SALE', '8x10', 'Traditional', 'Ivory', 1),
        (2, 'Royal Red Persian Silk Rug', 155000, 310000, 50, 'HOT', '9x12', 'Traditional', 'Red', 1),
        (3, 'Midnight Blue Modern Abstract Rug', 89997, 180000, 50, 'NEW', '6x9', 'Modern', 'Blue', 1),
        (4, 'Golden Tribal Geometric Rug', 75000, 150000, 50, 'SALE', '5x8', 'Tribal', 'Gold', 1),
        (5, 'Silver Grey Minimalist Rug', 65000, 130000, 50, '', '8x10', 'Modern', 'Grey', 1),
        (6, 'Emerald Green Vintage Wash Rug', 120000, 240000, 50, 'SALE', '9x12', 'Vintage', 'Green', 1),
        (7, 'Terracotta Oushak Wool Rug', 95000, 190000, 50, 'HOT', '6x9', 'Turkish Oushak', 'Orange', 1),
        (8, 'Black & White Kilim Rug', 45000, 90000, 50, 'SALE', '4x6', 'Kilim', 'Multi', 1),
        (9, 'Cream Moroccan Berber Rug', 110000, 220000, 50, 'NEW', '8x10', 'Moroccan', 'Cream', 1),
        (10, 'Navy Blue Mamluk Style Rug', 135000, 270000, 50, '', '9x12', 'Mamluk', 'Blue', 1),
        (11, 'Saffron Yellow Tribal Runner', 35000, 70000, 50, 'SALE', '2.5x10', 'Tribal', 'Yellow', 1)
      `);

      // 2. Bulk Insert Images
      await pool.query(`
        INSERT INTO product_images (product_id, image_url) VALUES
        (1, 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg'),
        (2, 'https://images.pexels.com/photos/10313592/pexels-photo-10313592.jpeg'),
        (3, 'https://images.pexels.com/photos/4553277/pexels-photo-4553277.jpeg'),
        (4, 'https://images.pexels.com/photos/2724745/pexels-photo-2724745.jpeg'),
        (5, 'https://images.pexels.com/photos/2724746/pexels-photo-2724746.jpeg'),
        (6, 'https://images.pexels.com/photos/2724747/pexels-photo-2724747.jpeg'),
        (7, 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg'),
        (8, 'https://images.pexels.com/photos/2724750/pexels-photo-2724750.jpeg'),
        (9, 'https://images.pexels.com/photos/2724751/pexels-photo-2724751.jpeg'),
        (10, 'https://images.pexels.com/photos/2724752/pexels-photo-2724752.jpeg'),
        (11, 'https://images.pexels.com/photos/2724753/pexels-photo-2724753.jpeg')
      `);
      
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('✅ Lightning Seed Complete!');
    }
  } catch (err) {
    console.error('❌ Auto-Setup Failed:', err.message);
  }
}

router.get('/', async (req, res) => {
  try {
    await ensureDatabaseReady();

    const { style, size, color, sort, search, featured } = req.query;
    let sql = 'SELECT p.*, (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) as main_image FROM products p WHERE p.is_active = 1';
    const params = [];

    if (style) { sql += ' AND p.style = ?'; params.push(style); }
    if (size) { sql += ' AND p.size = ?'; params.push(size); }
    if (color) { sql += ' AND p.color = ?'; params.push(color); }
    if (featured === 'true') { sql += ' AND p.featured = 1'; }
    if (search) { sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

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

module.exports = router;
