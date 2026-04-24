const express = require('express');
const router = express.Router();
const db = require('../db');

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

const { cloudinary } = require('../utils/cloudinary');

// POST new slide (Handle Base64 -> Cloudinary)
router.post('/', async (req, res) => {
  const { title_white, title_red, subtitle, display_order, is_active, image_url } = req.body;
  const order = parseInt(display_order) || 0;
  const active = !!is_active;

  let final_image_url = image_url;

  try {
    // If it's a base64 string, upload to Cloudinary
    if (image_url && image_url.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(image_url, {
        folder: 'mutantmodz/hero'
      });
      final_image_url = uploadRes.secure_url;
    }

    const { rows } = await db.query(
      'INSERT INTO hero_slides (image_url, title_white, title_red, subtitle, display_order, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [final_image_url, title_white, title_red, subtitle, order, active]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating slide:', err);
    res.status(500).json({ error: 'Failed to create slide', details: err.message });
  }
});

// PUT update slide (Handle Base64 -> Cloudinary)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title_white, title_red, subtitle, display_order, is_active, image_url } = req.body;
  const order = parseInt(display_order) || 0;
  const active = !!is_active;

  let final_image_url = image_url;

  try {
    // If it's a base64 string, upload to Cloudinary
    if (image_url && image_url.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(image_url, {
        folder: 'mutantmodz/hero'
      });
      final_image_url = uploadRes.secure_url;
    }

    const { rows } = await db.query(
      'UPDATE hero_slides SET image_url = $1, title_white = $2, title_red = $3, subtitle = $4, display_order = $5, is_active = $6 WHERE id = $7 RETURNING *',
      [final_image_url, title_white, title_red, subtitle, order, active, id]
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
