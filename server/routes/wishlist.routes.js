/* ═══════════════════════════════════════════
   WISHLIST ROUTES — /api/wishlist
   ═══════════════════════════════════════════ */
const router = require('express').Router();
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/wishlist
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT wi.id, p.id AS product_id, p.name, p.price, p.original_price, p.discount, p.badge, p.size, p.style, p.color, p.stock,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) AS image
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      WHERE wi.user_id = ?
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/wishlist
router.post('/', async (req, res) => {
  try {
    const { product_id } = req.body;
    await pool.query(
      'INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)',
      [req.user.id, product_id]
    );
    res.json({ message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/wishlist/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM wishlist_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
