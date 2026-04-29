const { pool } = require('../config/db');

let lastDbCheck = 0;
const DB_CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes

async function ensureDatabaseReady(req, res, next) {
  // Skip for static files
  if (req.path.includes('.') || req.path.startsWith('/admin')) return next();
  
  const now = Date.now();
  if (now - lastDbCheck < DB_CHECK_INTERVAL) return next();
  lastDbCheck = now;

  console.log('🔌 Verifying Database Schema...');
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0].toLowerCase());
    
    const requiredTables = ['products', 'users', 'orders', 'order_items', 'cart_items', 'wishlist_items'];
    const missingTables = requiredTables.filter(t => !tableList.includes(t));

    if (missingTables.length > 0) {
      console.log('⚠️ Missing tables detected:', missingTables.join(', '));
      // Hardcoded Schema for Vercel Resilience
      const schemaStatements = [
        `CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('customer', 'admin') DEFAULT 'customer',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB`,
        `CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(12,2) NOT NULL,
          original_price DECIMAL(12,2) NOT NULL,
          vendor VARCHAR(100) DEFAULT 'Veloura Rugs',
          size VARCHAR(10) NOT NULL,
          style VARCHAR(50) NOT NULL,
          color VARCHAR(30) NOT NULL,
          badge VARCHAR(20) DEFAULT '',
          featured BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          stock INT DEFAULT 100
        ) ENGINE=InnoDB`,
        `CREATE TABLE IF NOT EXISTS product_images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          image_url VARCHAR(500) NOT NULL,
          sort_order INT DEFAULT 0,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB`,
        `CREATE TABLE IF NOT EXISTS cart_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB`,
        `CREATE TABLE IF NOT EXISTS wishlist_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          product_id INT NOT NULL,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB`,
        `CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          order_number VARCHAR(20) UNIQUE NOT NULL,
          status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
          subtotal DECIMAL(12,2) NOT NULL,
          discount_amount DECIMAL(12,2) DEFAULT 0.00,
          shipping_fee DECIMAL(12,2) DEFAULT 0.00,
          total DECIMAL(12,2) NOT NULL,
          shipping_name VARCHAR(100),
          shipping_email VARCHAR(255),
          shipping_phone VARCHAR(20),
          shipping_address TEXT,
          shipping_city VARCHAR(100),
          shipping_state VARCHAR(100),
          shipping_zip VARCHAR(20),
          payment_method VARCHAR(50),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB`,
        `CREATE TABLE IF NOT EXISTS order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          price_at_time DECIMAL(12,2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        ) ENGINE=InnoDB`
      ];
      for (const sql of schemaStatements) {
        await pool.query(sql);
      }
      
      // Ensure missing columns exist in existing tables (Self-Healing - Forceful)
      const columnFixes = [
        `ALTER TABLE products ADD COLUMN stock INT DEFAULT 100`,
        `ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(12,2) DEFAULT 0.00`,
        `ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(12,2) DEFAULT 0.00`,
        `ALTER TABLE orders ADD COLUMN notes TEXT`
      ];
      for (const sql of columnFixes) {
        try { await pool.query(sql); } catch(e) { /* Ignore error if column already exists */ }
      }

      console.log('✅ Tables verified/created');
    }

    // Ensure we have products
    const [products] = await pool.query('SELECT count(*) as count FROM products');
    if (products[0].count < 30) {
      console.log('🌱 Catalog incomplete, re-seeding...');
      const fs = require('fs');
      const path = require('path');
      const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seed = fs.readFileSync(seedPath, 'utf8');
        const statements = seed.split(';').filter(s => s.trim().length > 0);
        for (const statement of statements) {
          await pool.query(statement);
        }
        console.log('✅ Catalog seeded successfully');
      }
    }
    
    next();
  } catch (err) {
    console.error('❌ Database Initialization Error:', err.message);
    // Don't block the request if it's just a health check failure
    next();
  }
}

module.exports = { ensureDatabaseReady };
