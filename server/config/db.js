/* ═══════════════════════════════════════════
   MYSQL CONNECTION POOL
   ═══════════════════════════════════════════ */
const mysql = require('mysql2/promise');
require('dotenv').config();

console.log(`🔌 Attempting DB Connection to: ${process.env.DB_HOST} on port ${process.env.DB_PORT}`);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  port: parseInt(process.env.DB_PORT) || 3306,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 10000 
});

console.log(`📡 Connecting to DB: ${process.env.DB_HOST}`);

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
