const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for slide images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'hero-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET all slides
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM hero_slides ORDER BY display_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching slides:', err);
    res.status(500).json({ error: 'Failed to fetch slides' });
  }
});

// POST new slide
router.post('/', upload.single('image'), async (req, res) => {
  const { title_white, title_red, subtitle, display_order, is_active, image_base64 } = req.body;
  const order = parseInt(display_order) || 0;
  const active = is_active === 'true' || is_active === true;
  let image_url = null;

  if (req.file) {
    const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
    image_url = `${baseUrl}/uploads/${req.file.filename}`;
  } else if (image_base64) {
    image_url = image_base64; // Store Base64 directly in the DB
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO hero_slides (image_url, title_white, title_red, subtitle, display_order, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [image_url, title_white, title_red, subtitle, order, active]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating slide:', err);
    res.status(500).json({ error: 'Failed to create slide', details: err.message });
  }
});

// PUT update slide
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title_white, title_red, subtitle, display_order, is_active, existing_image_url, image_base64 } = req.body;
  const order = parseInt(display_order) || 0;
  const active = is_active === 'true' || is_active === true;
  
  let image_url = existing_image_url;
  if (req.file) {
    const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
    image_url = `${baseUrl}/uploads/${req.file.filename}`;
  } else if (image_base64) {
    image_url = image_base64;
  }

  try {
    const { rows } = await db.query(
      'UPDATE hero_slides SET image_url = $1, title_white = $2, title_red = $3, subtitle = $4, display_order = $5, is_active = $6 WHERE id = $7 RETURNING *',
      [image_url, title_white, title_red, subtitle, order, active, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Slide not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating slide:', err);
    res.status(500).json({ error: 'Failed to update slide' });
  }
});

// DELETE slide
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('DELETE FROM hero_slides WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Slide not found' });
    res.json({ message: 'Slide deleted successfully' });
  } catch (err) {
    console.error('Error deleting slide:', err);
    res.status(500).json({ error: 'Failed to delete slide' });
  }
});

module.exports = router;
