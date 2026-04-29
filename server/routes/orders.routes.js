/* ═══════════════════════════════════════════
   ORDER ROUTES — /api/orders
   ═══════════════════════════════════════════ */
const router = require('express').Router();
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Generate order number
function generateOrderNumber() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `VR-${date}-${rand}`;
}

// POST /api/orders — place an order
router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { items, shipping, payment_method, notes, discount_amount = 0, shipping_fee = 0 } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'No items in order' });
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    for (const item of items) {
      const [prod] = await conn.query('SELECT price, stock FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
      if (!prod.length || prod[0].stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ error: `Insufficient stock for product ID ${item.product_id}` });
      }
      item.price_at_time = prod[0].price;
      subtotal += prod[0].price * item.quantity;
    }

    const total = subtotal - discount_amount + shipping_fee;
    const order_number = generateOrderNumber();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, order_number, subtotal, discount_amount, shipping_fee, total,
        shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_zip,
        payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, order_number, subtotal, discount_amount || 0, shipping_fee || 0, total,
        shipping?.name || null, shipping?.email || null, shipping?.phone || null, shipping?.address || null,
        shipping?.city || null, shipping?.state || null, shipping?.zip || null, payment_method || 'Card', notes || null]
    );

    // Insert order items and decrement stock
    for (const item of items) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
        [orderResult.insertId, item.product_id, item.quantity, item.price_at_time]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    // Clear user's cart
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    await conn.commit();
    res.status(201).json({ message: 'Order placed', order_number, order_id: orderResult.insertId });
  } catch (err) {
    await conn.rollback();
    console.error('Order error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// GET /api/orders — user's orders
router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!orders.length) return res.status(404).json({ error: 'Order not found' });

    const [items] = await pool.query(`
      SELECT oi.*, p.name, p.size, p.style,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) AS image
      FROM order_items oi JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
