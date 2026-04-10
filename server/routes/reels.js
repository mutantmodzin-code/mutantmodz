const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `reel-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // Increased to 100MB
});

// Get all reels
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM reels WHERE is_active = true ORDER BY display_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching reels:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all reels (including inactive)
router.get('/admin', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM reels ORDER BY display_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching admin reels:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create a new reel (with optional upload)
router.post('/', upload.single('video'), async (req, res) => {
  req.setTimeout(0); // Disable timeout for large uploads
  console.log('REELS_POST: Body:', req.body);
  console.log('REELS_POST: File:', req.file);
  
  const { title, instagram_url, display_order, is_active } = req.body;
  const order = parseInt(display_order) || 0;
  const active = is_active === 'true' || is_active === true;
  let video_url = null;
  
  if (req.file) {
    const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
    video_url = `${baseUrl}/uploads/${req.file.filename}`;
    console.log('REELS_POST: Generated URL:', video_url);
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO reels (title, instagram_url, video_url, display_order, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, instagram_url || null, video_url, order, active]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('CRITICAL: Error creating reel:', err);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack 
    });
  }
});

// Admin: Update a reel (with optional upload)
router.put('/:id', upload.single('video'), async (req, res) => {
  const { id } = req.params;
  console.log(`REELS_PUT: ID: ${id}, Body:`, req.body);
  
  const { title, instagram_url, display_order, is_active, existing_video_url } = req.body;
  const order = parseInt(display_order) || 0;
  const active = is_active === 'true' || is_active === true;
  
  let video_url = existing_video_url;
  if (req.file) {
    const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
    video_url = `${baseUrl}/uploads/${req.file.filename}`;
    console.log('REELS_PUT: New video URL generated:', video_url);
  }

  try {
    const { rows } = await db.query(
      'UPDATE reels SET title = $1, instagram_url = $2, video_url = $3, display_order = $4, is_active = $5 WHERE id = $6 RETURNING *',
      [title, instagram_url, video_url, order, active, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Reel not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('CRITICAL: Error updating reel:', err);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack 
    });
  }
});

// Admin: Delete a reel
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM reels WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Reel not found' });
    res.json({ message: 'Reel deleted successfully' });
  } catch (err) {
    console.error('Error deleting reel:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
