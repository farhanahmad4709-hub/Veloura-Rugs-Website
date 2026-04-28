-- ═══════════════════════════════════════════════════════════════
-- VELOURA RUGS — DATABASE SCHEMA
-- Run this in phpMyAdmin or MySQL CLI to create all tables
-- ═══════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS veloura_rugs
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE veloura_rugs;

-- ───────────────────────────────────────────
-- USERS
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('customer', 'admin') DEFAULT 'customer',
    phone           VARCHAR(20),
    address         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ───────────────────────────────────────────
-- PRODUCTS
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
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
) ENGINE=InnoDB;

-- ───────────────────────────────────────────
-- PRODUCT IMAGES
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    product_id      INT NOT NULL,
    image_url       VARCHAR(500) NOT NULL,
    sort_order      INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ───────────────────────────────────────────
-- ORDERS
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT,
    order_number    VARCHAR(20) UNIQUE NOT NULL,
    status          ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
                    DEFAULT 'pending',
    subtotal        DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    shipping_fee    DECIMAL(12,2) DEFAULT 0,
    total           DECIMAL(12,2) NOT NULL,
    shipping_name   VARCHAR(100),
    shipping_email  VARCHAR(255),
    shipping_phone  VARCHAR(20),
    shipping_address TEXT,
    shipping_city   VARCHAR(100),
    shipping_state  VARCHAR(100),
    shipping_zip    VARCHAR(20),
    payment_method  VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ───────────────────────────────────────────
-- ORDER ITEMS
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT NOT NULL,
    product_id      INT NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    price_at_time   DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- ───────────────────────────────────────────
-- CART ITEMS
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    product_id      INT NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    added_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_cart_item (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ───────────────────────────────────────────
-- WISHLIST ITEMS
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    product_id      INT NOT NULL,
    added_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_wishlist_item (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ───────────────────────────────────────────
-- CONTACT MESSAGES
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    subject         VARCHAR(255),
    message         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ───────────────────────────────────────────
-- NEWSLETTER SUBSCRIBERS
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscribers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
