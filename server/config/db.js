/* ═══════════════════════════════════════════
   MYSQL CONNECTION POOL
   ═══════════════════════════════════════════ */
const mysql = require('mysql2/promise');
require('dotenv').config();

console.log(`🔌 Attempting DB Connection to: ${process.env.DB_HOST} on port ${process.env.DB_PORT}`);

const poolConfig = process.env.DATABASE_URL 
  ? { uri: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'defaultdb',
      port: parseInt(process.env.DB_PORT) || 3306,
    };

const pool = mysql.createPool({
  ...poolConfig,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 15000 
});

console.log(`📡 DB Mode: ${process.env.DATABASE_URL ? 'URL' : 'Manual'}`);

// Test connection
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ DB Connected');
    conn.release();
  } catch (err) {
    console.error('❌ DB Fail:', err.message);
  }
}

module.exports = { pool, testConnection };
