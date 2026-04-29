const { pool } = require('./server/config/db');

async function fixDB() {
  try {
    const conn = await pool.getConnection();
    console.log('Connected to DB');

    // 1. Check if 'stock' exists in 'products'
    try {
      await conn.query('ALTER TABLE products ADD COLUMN stock INT DEFAULT 100');
      console.log('Added stock to products');
    } catch(e) { console.log('stock might exist: ' + e.message); }

    // 2. Check orders columns
    try {
      await conn.query('ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(12,2) DEFAULT 0.00');
      console.log('Added discount_amount');
    } catch(e) { console.log('discount_amount might exist: ' + e.message); }

    try {
      await conn.query('ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(12,2) DEFAULT 0.00');
      console.log('Added shipping_fee');
    } catch(e) { console.log('shipping_fee might exist: ' + e.message); }

    try {
      await conn.query('ALTER TABLE orders ADD COLUMN notes TEXT');
      console.log('Added notes');
    } catch(e) { console.log('notes might exist: ' + e.message); }

    // 3. Create order_items just in case
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          price_at_time DECIMAL(12,2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        ) ENGINE=InnoDB`);
      console.log('Ensured order_items table exists');
    } catch(e) { console.log('order_items error: ' + e.message); }

    conn.release();
    process.exit(0);
  } catch(e) {
    console.error('Fatal error:', e);
    process.exit(1);
  }
}

fixDB();
