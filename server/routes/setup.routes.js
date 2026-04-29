const router = require('express').Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    console.log('🚀 Starting Database Setup...');

    // 1. Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        price DECIMAL(10,2),
        original_price DECIMAL(10,2),
        discount_pct INT,
        badge VARCHAR(20),
        size_category VARCHAR(20),
        style VARCHAR(50),
        color_family VARCHAR(50),
        stock_count INT DEFAULT 10,
        is_active TINYINT DEFAULT 1,
        featured TINYINT DEFAULT 0
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

    // 2. Clear and Insert Sample Data
    await pool.query('DELETE FROM product_images');
    await pool.query('DELETE FROM products');

    await pool.query(`
      INSERT INTO products (name, price, original_price, discount_pct, badge, size_category, style, color_family, featured) VALUES
      ('Ivory Floral Traditional Wool Rug', 111997.00, 278600.00, 60, 'SALE', '3x5', 'Traditional', 'Beige', 1),
      ('Red Transitional Wool Rug', 97997.00, 245000.00, 60, 'NEW', '3x5', 'Transitional', 'Red', 1),
      ('Multicolor Tribal Wool Runner', 83997.00, 210000.00, 60, 'SALE', '3x5', 'Tribal', 'Multicolor', 1)
    `);

    await pool.query(`
      INSERT INTO product_images (product_id, image_url, sort_order) VALUES
      (1, 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg', 0),
      (2, 'https://images.pexels.com/photos/10313592/pexels-photo-10313592.jpeg', 0),
      (3, 'https://images.pexels.com/photos/4553277/pexels-photo-4553277.jpeg', 0)
    `);

    res.json({ ok: true, message: 'Database setup successfully with 3 sample rugs!' });
  } catch (err) {
    console.error('Setup error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
