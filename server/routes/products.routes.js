const router = require('express').Router();
const { pool } = require('../config/db');

async function ensureDatabaseReady() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0].toLowerCase());
    
    // Expand check to all tables
    const [tables] = await pool.query('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0].toLowerCase());
    const requiredTables = ['products', 'product_images', 'users', 'orders', 'order_items', 'cart_items', 'wishlist_items'];
    const missingTables = requiredTables.filter(t => !tableList.includes(t));

    let needsSeed = false;
    if (missingTables.length > 0) {
      needsSeed = true;
    } else {
      const [count] = await pool.query('SELECT COUNT(*) as total FROM products');
      if (count[0].total < 25) needsSeed = true; 
    }

    if (needsSeed) {
      console.log('🏗️ FORCING Restoration of Original 30-Rug Collection...');
      await pool.query('SET FOREIGN_KEY_CHECKS = 0');
      await pool.query('DROP TABLE IF EXISTS wishlist_items');
      await pool.query('DROP TABLE IF EXISTS cart_items');
      await pool.query('DROP TABLE IF EXISTS order_items');
      await pool.query('DROP TABLE IF EXISTS orders');
      await pool.query('DROP TABLE IF EXISTS product_images');
      await pool.query('DROP TABLE IF EXISTS products');
      await pool.query('DROP TABLE IF EXISTS users');
      
      await pool.query(`CREATE TABLE users (
          id              INT AUTO_INCREMENT PRIMARY KEY,
          name            VARCHAR(100) NOT NULL,
          email           VARCHAR(255) NOT NULL UNIQUE,
          password_hash   VARCHAR(255) NOT NULL,
          role            ENUM('customer', 'admin') DEFAULT 'customer',
          phone           VARCHAR(20),
          address         TEXT,
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`);

      await pool.query(`CREATE TABLE products (
          id              INT AUTO_INCREMENT PRIMARY KEY,
          name            VARCHAR(255) NOT NULL,
          vendor          VARCHAR(100) DEFAULT 'Veloura Rugs',
          price           DECIMAL(12,2) NOT NULL,
          original_price  DECIMAL(12,2) NOT NULL,
          discount        INT DEFAULT 0,
          badge           VARCHAR(20) DEFAULT '',
          size            VARCHAR(10) NOT NULL,
          style           VARCHAR(50) NOT NULL,
          color           VARCHAR(30) NOT NULL,
          description     TEXT,
          stock           INT DEFAULT 1,
          featured        BOOLEAN DEFAULT FALSE,
          is_active       BOOLEAN DEFAULT TRUE,
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`);
      
      await pool.query(`CREATE TABLE product_images (
          id              INT AUTO_INCREMENT PRIMARY KEY,
          product_id      INT NOT NULL,
          image_url       VARCHAR(500) NOT NULL,
          sort_order      INT DEFAULT 0,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB`);

      await pool.query(`CREATE TABLE orders (
          id              INT AUTO_INCREMENT PRIMARY KEY,
          user_id         INT,
          order_number    VARCHAR(20) UNIQUE NOT NULL,
          status          ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
          subtotal        DECIMAL(12,2) NOT NULL,
          total           DECIMAL(12,2) NOT NULL,
          shipping_name   VARCHAR(100),
          shipping_email  VARCHAR(255),
          shipping_phone  VARCHAR(20),
          shipping_address TEXT,
          shipping_city   VARCHAR(100),
          shipping_state  VARCHAR(100),
          shipping_zip    VARCHAR(20),
          payment_method  VARCHAR(50),
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB`);

      await pool.query(`CREATE TABLE order_items (
          id              INT AUTO_INCREMENT PRIMARY KEY,
          order_id        INT NOT NULL,
          product_id      INT NOT NULL,
          quantity        INT NOT NULL DEFAULT 1,
          price_at_time   DECIMAL(12,2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id)
      ) ENGINE=InnoDB`);

      await pool.query(`CREATE TABLE cart_items (
          id              INT AUTO_INCREMENT PRIMARY KEY,
          user_id         INT NOT NULL,
          product_id      INT NOT NULL,
          quantity        INT NOT NULL DEFAULT 1,
          added_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_cart_item (user_id, product_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB`);

      await pool.query(`CREATE TABLE wishlist_items (
          id              INT AUTO_INCREMENT PRIMARY KEY,
          user_id         INT NOT NULL,
          product_id      INT NOT NULL,
          added_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_wishlist_item (user_id, product_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB`);

      // SEED ALL 30 AUTHENTIC PRODUCTS
      await pool.query(`INSERT INTO products (id, name, vendor, price, original_price, discount, badge, size, style, color, description, stock, featured) VALUES
        (1,'3×5 ft Ivory Floral Traditional Wool Rug','Veloura Rugs',111997,278600,60,'SALE','3x5','Traditional','Beige','A compact traditional wool rug with ivory and warm beige floral motifs.',5,TRUE),
        (2,'3×5 ft Red Transitional Wool Rug','Veloura Rugs',97997,245000,60,'NEW','3x5','Transitional','Red','A vibrant transitional rug in deep red and berry tones.',3,FALSE),
        (3,'3×5 ft Multicolor Tribal Wool Runner','Veloura Rugs',83997,210000,60,'SALE','3x5','Tribal','Multicolor','A handwoven tribal runner with rich multicolor geometry.',4,FALSE),
        (4,'4×6 ft Cream Turkish Oushak Accent Rug','Veloura Rugs',223997,559720,60,'SALE','4x6','Turkish Oushak','Beige','A soft ivory Turkish Oushak rug with delicate gold vines.',2,TRUE),
        (5,'4×6 ft Blue Vintage Overdyed Wool Rug','Veloura Rugs',176397,441000,60,'SALE','4x6','Vintage','Blue','A compact vintage rug refreshed with saturated blue overdyed tones.',3,FALSE),
        (6,'4×6 ft Midnight Mamluk Wool Rug','Veloura Rugs',195997,490000,60,'SALE','4x6','Mamluk','Black','A luxurious Mamluk-style accent rug in deep black and ivory.',2,FALSE),
        (7,'5×8 ft Multicolor Kilim Flatweave Rug','Veloura Rugs',209997,525000,60,'SALE','5x8','Kilims','Multicolor','A joyful Kilim flatweave featuring bright geometric stripes.',4,FALSE),
        (8,'5×8 ft Brown Tribal Wool Rug','Veloura Rugs',2519997,629720,60,'SALE','5x8','Tribal','Brown','A warm brown tribal rug with layered motifs and artisanal handwork.',3,FALSE),
        (9,'5×8 ft Ivory Modern Abstract Rug','Veloura Rugs',307997,727720,60,'NEW','5x8','Modern','Beige','A refined modern rug in ivory and cream with soft abstract washes.',2,FALSE),
        (10,'6×9 ft Grey Transitional Hand Knotted Rug','Veloura Rugs',349997,875000,60,'SALE','6x9','Transitional','Grey','A soft grey transitional rug with painterly texture.',3,FALSE),
        (11,'6×9 ft Emerald Vintage Overdyed Rug','Veloura Rugs',335997,840000,60,'SALE','6x9','Vintage','Green','A heritage rug dyed in deep emerald green.',2,FALSE),
        (12,'6×9 ft Black Kilim Wool Rug','Veloura Rugs',274397,686000,60,'SALE','6x9','Kilims','Black','A dramatic black Kilim with crisp geometric motifs.',3,FALSE),
        (13,'7×10 ft Rust Red Tribal Runner Rug','Veloura Rugs',419997,1050000,60,'SALE','7x10','Tribal','Red','A large tribal runner with sunset red and rust hues.',2,FALSE),
        (14,'7×10 ft Ivory Gold Turkish Oushak Rug','Veloura Rugs',447997,1119720,60,'NEW','7x10','Turkish Oushak','Gold','A refined Turkish Oushak in ivory and gold.',1,FALSE),
        (15,'7×10 ft Brown Mamluk Wool Rug','Veloura Rugs',475997,1190000,60,'SALE','7x10','Mamluk','Brown','Inspired by historic Mamluk carpets with warm brown tones.',2,FALSE),
        (16,'8×10 ft Blue Floral Traditional Rug','Veloura Rugs',503997,1259720,60,'SALE','8x10','Traditional','Blue','A luxurious traditional rug with a blue floral medallion.',1,TRUE),
        (17,'8×10 ft Emerald Overdyed Vintage Rug','Veloura Rugs',363997,910000,60,'SALE','8x10','Vintage','Green','A lush vintage rug in emerald green overdyed tones.',2,FALSE),
        (18,'8×10 ft Soft Grey Modern Rug','Veloura Rugs',391997,980000,60,'NEW','8x10','Modern','Grey','A calm modern rug in textured grey with subtle tonal variation.',3,FALSE),
        (19,'9×12 ft Gold Toned Traditional Area Rug','Veloura Rugs',699997,1750000,60,'SALE','9x12','Traditional','Gold','A beautiful traditional rug in warm gold tones.',1,TRUE),
        (20,'9×12 ft Soft Blue Transitional Rug','Veloura Rugs',643997,1610000,60,'SALE','9x12','Transitional','Blue','A soft blue transitional rug blending classic and contemporary.',2,FALSE),
        (21,'9×12 ft Brown Mamluk Wool Rug','Veloura Rugs',727997,1819720,60,'SALE','9x12','Mamluk','Brown','A stately Mamluk rug in rich brown and ivory.',1,FALSE),
        (22,'10×13 ft Golden Turkish Oushak Rug','Veloura Rugs',923997,2310000,60,'SALE','10x13','Turkish Oushak','Gold','A grand Turkish Oushak rug in gold and ivory.',1,FALSE),
        (23,'10×13 ft Black Modern Graphic Rug','Veloura Rugs',559997,1399720,60,'NEW','10x13','Modern','Black','A dynamic modern rug in black and ivory with crisp graphic blocks.',2,FALSE),
        (24,'10×13 ft Multicolor Moroccan Wool Rug','Veloura Rugs',783997,1959720,60,'SALE','10x13','Moroccan','Multicolor','A spirited Moroccan wool rug in jewel-toned multicolor.',1,FALSE),
        (25,'12×15 ft Green Gold Moroccan Palace Rug','Veloura Rugs',2519997,6300000,60,'SALE','12x15','Moroccan','Green','A grand Moroccan rug in green and gold.',1,FALSE),
        (26,'12×15 ft Red Gold Moroccan Salon Rug','Veloura Rugs',2099997,5250000,60,'SALE','12x15','Moroccan','Red','A lavish Moroccan salon rug in red and gold.',1,FALSE),
        (27,'12×15 ft Grey Kilim Wool Rug','Veloura Rugs',1931997,4830000,60,'NEW','12x15','Kilims','Grey','A grand Kilim with subtle grey tones.',1,FALSE),
        (28,'8×10 ft Luxe Gold Moroccan Rug','Veloura Rugs',615997,1539720,60,'SALE','8x10','Moroccan','Gold','A luxe gold Moroccan rug with shimmering accents.',2,FALSE),
        (29,'5×8 ft Ivory Gold Turkish Oushak Rug','Veloura Rugs',265997,671720,60,'NEW','5x8','Turkish Oushak','Gold','A graceful Turkish Oushak accent rug in ivory and gold.',3,FALSE),
        (30,'6×9 ft Gold Modern Accent Rug','Veloura Rugs',363997,910000,60,'SALE','6x9','Modern','Gold','A modern gold accent rug in soft painterly hues.',2,FALSE)
      `);

      // SEED AUTHENTIC IMAGES
      await pool.query(`INSERT INTO product_images (product_id, image_url, sort_order) VALUES
        (1,'https://images.pexels.com/photos/34135357/pexels-photo-34135357.jpeg?cs=srgb&fm=jpg',0),
        (2,'https://images.pexels.com/photos/30123749/pexels-photo-30123749.jpeg?cs=srgb&fm=jpg',0),
        (3,'https://images.pexels.com/photos/34084602/pexels-photo-34084602.jpeg?cs=srgb&fm=jpg',0),
        (4,'https://images.pexels.com/photos/34536023/pexels-photo-34536023.jpeg?cs=srgb&fm=jpg',0),
        (5,'https://images.pexels.com/photos/34599036/pexels-photo-34599036.jpeg?cs=srgb&fm=jpg',0),
        (6,'https://images.pexels.com/photos/30577489/pexels-photo-30577489.jpeg?cs=srgb&fm=jpg',0),
        (7,'https://images.pexels.com/photos/30002587/pexels-photo-30002587.jpeg?cs=srgb&fm=jpg',0),
        (8,'https://images.pexels.com/photos/34182137/pexels-photo-34182137.jpeg?cs=srgb&fm=jpg',0),
        (9,'https://images.pexels.com/photos/29177155/pexels-photo-29177155.jpeg?cs=srgb&fm=jpg',0),
        (10,'https://images.pexels.com/photos/35746323/pexels-photo-35746323.jpeg?cs=srgb&fm=jpg',0),
        (11,'https://images.pexels.com/photos/30123764/pexels-photo-30123764.jpeg?cs=srgb&fm=jpg',0),
        (12,'https://images.pexels.com/photos/33299495/pexels-photo-33299495.jpeg?cs=srgb&fm=jpg',0),
        (13,'https://images.pexels.com/photos/34113608/pexels-photo-34113608.jpeg?cs=srgb&fm=jpg',0),
        (14,'https://images.pexels.com/photos/32025734/pexels-photo-32025734.jpeg?cs=srgb&fm=jpg',0),
        (15,'https://images.pexels.com/photos/33868700/pexels-photo-33868700.jpeg?cs=srgb&fm=jpg',0),
        (16,'https://images.pexels.com/photos/30002567/pexels-photo-30002567.jpeg?cs=srgb&fm=jpg',0),
        (17,'https://images.pexels.com/photos/32536660/pexels-photo-32536660.jpeg?cs=srgb&fm=jpg',0),
        (18,'https://images.pexels.com/photos/30002542/pexels-photo-30002542.jpeg?cs=srgb&fm=jpg',0),
        (19,'https://images.pexels.com/photos/34536023/pexels-photo-34536023.jpeg?cs=srgb&fm=jpg',0),
        (20,'https://images.pexels.com/photos/31445156/pexels-photo-31445156.jpeg?cs=srgb&fm=jpg',0),
        (21,'https://images.pexels.com/photos/30002533/pexels-photo-30002533.jpeg?cs=srgb&fm=jpg',0),
        (22,'https://images.pexels.com/photos/34536023/pexels-photo-34536023.jpeg?cs=srgb&fm=jpg',0),
        (23,'https://images.pexels.com/photos/34601064/pexels-photo-34601064.jpeg?cs=srgb&fm=jpg',0),
        (24,'https://images.pexels.com/photos/31445156/pexels-photo-31445156.jpeg?cs=srgb&fm=jpg',0),
        (25,'https://images.pexels.com/photos/35888863/pexels-photo-35888863.jpeg?cs=srgb&fm=jpg',0),
        (26,'https://images.pexels.com/photos/33425413/pexels-photo-33425413.jpeg?cs=srgb&fm=jpg',0),
        (27,'https://images.pexels.com/photos/32536660/pexels-photo-32536660.jpeg?cs=srgb&fm=jpg',0),
        (28,'https://images.pexels.com/photos/30015750/pexels-photo-30015750.jpeg?cs=srgb&fm=jpg',0),
        (29,'https://images.pexels.com/photos/30002533/pexels-photo-30002533.jpeg?cs=srgb&fm=jpg',0),
        (30,'https://images.pexels.com/photos/30002536/pexels-photo-30002536.jpeg?cs=srgb&fm=jpg',0)
      `);
      
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('✅ 30 Authentic Rugs Restored!');
    }
  } catch (err) {
    console.error('❌ Auto-Setup Failed:', err.message);
  }
}

router.get('/', async (req, res) => {
  try {
    await ensureDatabaseReady();

    const { style, size, color, sort, search, featured } = req.query;
    let sql = 'SELECT p.*, (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) as main_image FROM products p WHERE p.is_active = 1';
    const params = [];

    if (style) { sql += ' AND p.style = ?'; params.push(style); }
    if (size) { sql += ' AND p.size = ?'; params.push(size); }
    if (color) { sql += ' AND p.color = ?'; params.push(color); }
    if (featured === 'true') { sql += ' AND p.featured = 1'; }
    if (search) { sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    if (sort === 'price-asc') sql += ' ORDER BY p.price ASC';
    else if (sort === 'price-desc') sql += ' ORDER BY p.price DESC';
    else if (sort === 'name-asc') sql += ' ORDER BY p.name ASC';
    else if (sort === 'name-desc') sql += ' ORDER BY p.name DESC';
    else sql += ' ORDER BY p.id ASC';

    const [rows] = await pool.query(sql, params);
    
    const products = rows.map(r => ({
      ...r,
      images: r.main_image ? [r.main_image] : ['https://via.placeholder.com/400x500?text=Veloura+Rug']
    }));

    res.json(products);
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
