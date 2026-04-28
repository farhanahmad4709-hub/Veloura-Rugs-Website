const router = require('express').Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    console.log('🚀 Starting Database Setup...');

    // 1. Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('customer', 'admin') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        discount INT DEFAULT 0,
        badge VARCHAR(50),
        size VARCHAR(50),
        style VARCHAR(100),
        color VARCHAR(50),
        stock INT DEFAULT 0,
        featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT,
        image_url VARCHAR(255) NOT NULL,
        sort_order INT DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        user_id INT,
        total DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        shipping_name VARCHAR(100) NOT NULL,
        shipping_email VARCHAR(100) NOT NULL,
        shipping_phone VARCHAR(20),
        shipping_address TEXT NOT NULL,
        shipping_city VARCHAR(100) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cod',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT,
        product_id INT,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // 2. Check if products already exist
    const [[{count}]] = await pool.query('SELECT COUNT(*) AS count FROM products');
    
    if (count === 0) {
      console.log('📦 Seeding initial products...');
      // Insert a few core products as a sample (you can run your full seed later)
      await pool.query(`
        INSERT INTO products (name, price, original_price, discount, badge, size, style, color, stock, featured) VALUES
        ('Ivory Floral Traditional Wool Rug', 111997.00, 278600.00, 60, 'SALE', '3x5', 'Traditional', 'Beige', 5, 1),
        ('Red Transitional Wool Rug', 97997.00, 245000.00, 60, 'NEW', '3x5', 'Transitional', 'Red', 3, 1),
        ('Multicolor Tribal Wool Runner', 83997.00, 210000.00, 60, 'SALE', '3x5', 'Tribal', 'Multicolor', 4, 1)
      `);
      
      await pool.query(`
        INSERT INTO product_images (product_id, image_url, sort_order) VALUES
        (1, 'https://images.pexels.com/photos/34135357/pexels-photo-34135357.jpeg', 0),
        (2, 'https://images.pexels.com/photos/10313592/pexels-photo-10313592.jpeg', 0),
        (3, 'https://images.pexels.com/photos/4553277/pexels-photo-4553277.jpeg', 0)
      `);
    }

    res.json({ ok: true, message: 'Database setup successfully! Your tables are ready.' });
  } catch (err) {
    console.error('Setup error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
