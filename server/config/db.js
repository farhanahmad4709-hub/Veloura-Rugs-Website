const mysql = require('mysql2/promise');
require('dotenv').config();

// Log connection attempt (X-Ray Vision)
console.log('🔌 Attempting DB Connection...');

const poolConfig = process.env.DATABASE_URL 
  ? { 
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for some cloud providers
    }
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'test',
      port: process.env.DB_PORT || 3306,
      ssl: { rejectUnauthorized: false }
    };

const pool = mysql.createPool(poolConfig);

// Test the connection immediately
pool.getConnection()
  .then(conn => {
    console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
    conn.release();
  })
  .catch(err => {
    console.error('❌ DATABASE CONNECTION FAILED:', err.message);
  });

module.exports = { pool };
