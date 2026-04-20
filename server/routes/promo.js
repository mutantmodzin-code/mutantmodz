const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for promo images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'promo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET all active promo banners (Frontend)
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM promo_banners WHERE is_active = TRUE ORDER BY display_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all promo banners (Admin)
router.get('/admin', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM promo_banners ORDER BY display_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new promo banner
router.post('/', upload.single('image'), async (req, res) => {
  const { title, discount_text, price_text, bg_color, display_order, is_active } = req.body;
  const order = parseInt(display_order) || 0;
  const active = is_active === 'true' || is_active === true;
  let image_url = null;

  if (req.file) {
    const baseUrl = process.env.NODE_ENV === 'production' && !process.env.VPS_URL ? '' : (process.env.VPS_URL || 'http://localhost:5001');
    image_url = `${baseUrl}/uploads/${req.file.filename}`;
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO promo_banners (title, discount_text, price_text, bg_color, display_order, is_active, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, discount_text, price_text, bg_color, order, active, image_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating promo banner:', err);
    res.status(500).json({ error: 'Failed to create banner', details: err.message });
  }
});

// PUT update promo banner
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, discount_text, price_text, bg_color, display_order, is_active, existing_image_url } = req.body;
  const order = parseInt(display_order) || 0;
  const active = is_active === 'true' || is_active === true || is_active === '1';
  
  let image_url = existing_image_url;
  if (req.file) {
    const baseUrl = process.env.NODE_ENV === 'production' && !process.env.VPS_URL ? '' : (process.env.VPS_URL || 'http://localhost:5001');
    image_url = `${baseUrl}/uploads/${req.file.filename}`;
  }

  try {
    const { rows } = await db.query(
      'UPDATE promo_banners SET title=$1, discount_text=$2, price_text=$3, bg_color=$4, display_order=$5, is_active=$6, image_url=$7 WHERE id=$8 RETURNING *',
      [title, discount_text, price_text, bg_color, order, active, image_url, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Banner not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE promo banner
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('DELETE FROM promo_banners WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Banner not found' });
    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
