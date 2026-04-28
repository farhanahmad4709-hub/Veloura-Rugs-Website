const router = require('express').Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    console.log('🚀 Starting Database Setup...');

    // 1. Create Tables
    console.log("🚀 Starting Minimal Setup...");
    
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
