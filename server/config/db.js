/* ═══════════════════════════════════════════
   MYSQL CONNECTION POOL
   ═══════════════════════════════════════════ */
const mysql = require('mysql2/promise');
require('dotenv').config();

console.log(`🔌 Attempting DB Connection to: ${process.env.DB_HOST} on port ${process.env.DB_PORT}`);

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 21353,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 15000, // 15 seconds
  ssl: { rejectUnauthorized: false }
});

// Test connection on startup
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed but continuing:', err.message);
    // Don't exit process, let server try to handle requests or setup
  }
}

module.exports = { pool, testConnection };
