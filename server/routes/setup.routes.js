const router = require('express').Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    console.log('🚀 Starting Database Setup...');

    // 1. Reset Tables (Truncate resets the IDs to 1)
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE product_images');
    await pool.query('TRUNCATE TABLE products');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Create Tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        description TEXT,
        price DECIMAL(10,2),
        original_price DECIMAL(10,2),
        discount_pct INT,
        badge VARCHAR(20),
        size VARCHAR(20),
        style VARCHAR(50),
        color VARCHAR(50),
        stock_count INT DEFAULT 10,
        is_active TINYINT DEFAULT 1,
        featured TINYINT DEFAULT 1
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT,
        image_url TEXT,
        sort_order INT DEFAULT 0
      )
    `);

    // 3. Insert Sample Data (IDs will now definitely be 1, 2, 3)
    await pool.query(`
      INSERT INTO products (id, name, description, price, original_price, discount_pct, badge, size, style, color, featured) VALUES
      (1, 'Ivory Floral Traditional Wool Rug', 'A beautiful ivory rug with floral patterns.', 111997.00, 278600.00, 60, 'SALE', '3x5', 'Traditional', 'Beige', 1),
      (2, 'Red Transitional Wool Rug', 'Vibrant red rug with a modern touch.', 97997.00, 245000.00, 60, 'NEW', '3x5', 'Transitional', 'Red', 1),
      (3, 'Multicolor Tribal Wool Runner', 'Classic tribal runner for long hallways.', 83997.00, 210000.00, 60, 'SALE', '3x5', 'Tribal', 'Multicolor', 1)
    `);

    await pool.query(`
      INSERT INTO product_images (product_id, image_url, sort_order) VALUES
      (1, 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg', 0),
      (2, 'https://images.pexels.com/photos/10313592/pexels-photo-10313592.jpeg', 0),
      (3, 'https://images.pexels.com/photos/4553277/pexels-photo-4553277.jpeg', 0)
    `);

    res.json({ ok: true, message: 'Database RESET and REFILLED! Refresh your shop page now.' });
  } catch (err) {
    console.error('Setup error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
