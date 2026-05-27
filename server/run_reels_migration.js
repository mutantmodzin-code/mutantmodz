const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrateReels() {
  const client = await pool.connect();
  try {
    console.log('--- Migrating Reels Table ---');
    
    // Add video_url column if not exists
    await client.query(`
      ALTER TABLE reels ADD COLUMN IF NOT EXISTS video_url TEXT;
    `);
    console.log('✅ Column video_url added to reels table.');

    // Add some default video URLs if they are missing
    // Using some public sample videos for demo
    await client.query(`
      UPDATE reels SET video_url = 'https://assets.mixkit.co/videos/preview/mixkit-motorcyclist-riding-on-the-highway-at-night-40333-large.mp4' WHERE video_url IS NULL AND title = 'Night Ride';
      UPDATE reels SET video_url = 'https://assets.mixkit.co/videos/preview/mixkit-motorcyclist-riding-on-a-mountain-road-40334-large.mp4' WHERE video_url IS NULL AND title = 'Mountain Touring';
      UPDATE reels SET video_url = 'https://assets.mixkit.co/videos/preview/mixkit-man-riding-a-motorcycle-on-a-country-road-40331-large.mp4' WHERE video_url IS NULL;
    `);
    console.log('✅ Seed videos updated.');

    console.log('--- Migration Complete ---');
  } catch (err) {
    console.error('❌ Migration Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrateReels();
