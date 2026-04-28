/* ═══════════════════════════════════════════
   ADMIN ROUTES — /api/admin
   ═══════════════════════════════════════════ */
const router = require('express').Router();
const { pool } = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

/* ─── DASHBOARD KPIs ───────────────────── */
router.get('/dashboard', async (req, res) => {
  try {
    const [[{totalRevenue}]] = await pool.query("SELECT COALESCE(SUM(total),0) AS totalRevenue FROM orders WHERE status != 'cancelled'");
    const [[{totalOrders}]] = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{totalUsers}]] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'customer'");
    const [[{totalProducts}]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products WHERE is_active = 1');
    const [[{lowStock}]] = await pool.query('SELECT COUNT(*) AS lowStock FROM products WHERE stock <= 3 AND is_active = 1');
    const [[{outOfStock}]] = await pool.query('SELECT COUNT(*) AS outOfStock FROM products WHERE stock = 0 AND is_active = 1');

    // Recent orders
    const [recentOrders] = await pool.query('SELECT id, order_number, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 10');

    // Revenue last 7 days
    const [revenueDays] = await pool.query(`
      SELECT DATE(created_at) AS date, SUM(total) AS revenue
      FROM orders WHERE status != 'cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at) ORDER BY date
    `);

    // Order status breakdown
    const [statusBreakdown] = await pool.query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status');

    // Top selling products
    const [topProducts] = await pool.query(`
      SELECT p.name, SUM(oi.quantity) AS sold
      FROM order_items oi JOIN products p ON oi.product_id = p.id
      GROUP BY oi.product_id ORDER BY sold DESC LIMIT 5
    `);

    res.json({
      kpis: { totalRevenue, totalOrders, totalUsers, totalProducts, lowStock, outOfStock },
      recentOrders, revenueDays, statusBreakdown, topProducts
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── PRODUCTS CRUD ────────────────────── */
router.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { name, price, original_price, discount, badge, size, style, color, description, stock, featured, images } = req.body;
    const [result] = await pool.query(
      'INSERT INTO products (name, price, original_price, discount, badge, size, style, color, description, stock, featured) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [name, price, original_price, discount || 0, badge || '', size, style, color, description, stock || 1, featured || false]
    );
    if (images && images.length) {
      for (let i = 0; i < images.length; i++) {
        await pool.query('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?,?,?)', [result.insertId, images[i], i]);
      }
    }
    res.status(201).json({ message: 'Product created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { name, price, original_price, discount, badge, size, style, color, description, stock, featured, is_active, images } = req.body;
    await pool.query(
      `UPDATE products SET name=?, price=?, original_price=?, discount=?, badge=?, size=?, style=?, color=?, description=?, stock=?, featured=?, is_active=? WHERE id=?`,
      [name, price, original_price, discount, badge, size, style, color, description, stock, featured, is_active ?? true, req.params.id]
    );
    if (images && Array.isArray(images) && images.length > 0) {
      await pool.query('DELETE FROM product_images WHERE product_id = ?', [req.params.id]);
      for (let i = 0; i < images.length; i++) {
        await pool.query('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?,?,?)', [req.params.id, images[i], i]);
      }
    }
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── ORDERS MANAGEMENT ────────────────── */
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT o.*, u.name AS user_name, u.email AS user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id';
    const params = [];
    if (status) { sql += ' WHERE o.status = ?'; params.push(status); }
    sql += ' ORDER BY o.created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending','confirmed','processing','shipped','delivered','cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    // If cancelling, restore stock
    if (status === 'cancelled') {
      const [items] = await pool.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [req.params.id]);
      for (const item of items) {
        await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── USERS MANAGEMENT ─────────────────── */
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.created_at,
        COUNT(DISTINCT o.id) AS order_count,
        COALESCE(SUM(o.total),0) AS total_spent
      FROM users u LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── CSV EXPORT ───────────────────────── */
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let rows, filename, headers;

    if (type === 'products') {
      [rows] = await pool.query('SELECT id, name, price, original_price, discount, size, style, color, stock, featured FROM products WHERE is_active = 1');
      filename = 'veloura_products.csv';
      headers = ['ID','Name','Price','Original Price','Discount %','Size','Style','Color','Stock','Featured'];
    } else if (type === 'orders') {
      [rows] = await pool.query("SELECT o.id, o.order_number, o.status, o.total, o.shipping_name, o.shipping_email, o.created_at FROM orders o ORDER BY o.created_at DESC");
      filename = 'veloura_orders.csv';
      headers = ['ID','Order Number','Status','Total','Customer Name','Customer Email','Date'];
    } else if (type === 'users') {
      [rows] = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
      filename = 'veloura_users.csv';
      headers = ['ID','Name','Email','Role','Joined'];
    } else {
      return res.status(400).json({ error: 'Invalid export type. Use: products, orders, users' });
    }

    // Build CSV
    const csvLines = [headers.join(',')];
    for (const row of rows) {
      const vals = Object.values(row).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`);
      csvLines.push(vals.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvLines.join('\n'));
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── MESSAGES ─────────────────────────── */
router.get('/messages', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
