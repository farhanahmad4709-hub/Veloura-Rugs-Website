/* ═══════════════════════════════════════════
   MYSQL CONNECTION POOL
   ═══════════════════════════════════════════ */
const mysql = require('mysql2/promise');
require('dotenv').config();

console.log(`🔌 Attempting DB Connection to: ${process.env.DB_HOST} on port ${process.env.DB_PORT}`);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 21353,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 5000,
  ssl: { rejectUnauthorized: false } // Force SSL for cloud connections
});

// Test connection on startup
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
