const router = require('express').Router();
const { pool } = require('../config/db');

async function ensureDatabaseReady() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0].toLowerCase());
    
    // If tables are missing OR we have "Test" data (PKR 100), re-seed properly
    let needsReseed = false;
    if (!tableList.includes('products') || !tableList.includes('product_images')) {
      needsReseed = true;
    } else {
      const [testCheck] = await pool.query('SELECT COUNT(*) as total FROM products WHERE price = 100');
      if (testCheck[0].total > 0) needsReseed = true;
    }

    if (needsReseed) {
      console.log('💎 Cleaning and Seeding Luxury Collection...');
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

      // SEED LUXURY DATA (11 Beautiful Rugs)
      const rugs = [
        ['Ivory Floral Traditional Wool Rug', 111997, 278600, 60, 'SALE', '8x10', 'Traditional', 'Ivory', 1],
        ['Royal Red Persian Silk Rug', 155000, 310000, 50, 'HOT', '9x12', 'Traditional', 'Red', 1],
        ['Midnight Blue Modern Abstract Rug', 89997, 180000, 50, 'NEW', '6x9', 'Modern', 'Blue', 1],
        ['Golden Tribal Geometric Rug', 75000, 150000, 50, 'SALE', '5x8', 'Tribal', 'Gold', 1],
        ['Silver Grey Minimalist Rug', 65000, 130000, 50, '', '8x10', 'Modern', 'Grey', 1],
        ['Emerald Green Vintage Wash Rug', 120000, 240000, 50, 'SALE', '9x12', 'Vintage', 'Green', 1],
        ['Terracotta Oushak Wool Rug', 95000, 190000, 50, 'HOT', '6x9', 'Turkish Oushak', 'Orange', 1],
        ['Black & White Kilim Rug', 45000, 90000, 50, 'SALE', '4x6', 'Kilim', 'Multi', 1],
        ['Cream Moroccan Berber Rug', 110000, 220000, 50, 'NEW', '8x10', 'Moroccan', 'Cream', 1],
        ['Navy Blue Mamluk Style Rug', 135000, 270000, 50, '', '9x12', 'Mamluk', 'Blue', 1],
        ['Saffron Yellow Tribal Runner', 35000, 70000, 50, 'SALE', '2.5x10', 'Tribal', 'Yellow', 1]
      ];

      for (const rug of rugs) {
        const [result] = await pool.query(
          'INSERT INTO products (name, price, original_price, discount_pct, badge, size, style, color, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          rug
        );
        // Add a high-quality pexels image for each
        const imgUrl = `https://images.pexels.com/photos/${2724740 + result.insertId}/pexels-photo-${2724740 + result.insertId}.jpeg?auto=compress&cs=tinysrgb&w=800`;
        await pool.query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [result.insertId, imgUrl]);
      }
      
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('✅ Luxury Collection Live!');
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
    
    // Map data for frontend (ensure 'images' array exists)
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
