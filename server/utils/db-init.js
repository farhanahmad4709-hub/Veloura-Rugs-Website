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
      const fs = require('fs');
      const path = require('path');
      
      const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const statements = schema.split(';').filter(s => s.trim().length > 0);
        for (const statement of statements) {
          await pool.query(statement);
        }
        console.log('✅ Tables created successfully');
      }
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
