const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function cleanUrls() {
  const client = await pool.connect();
  try {
    console.log('--- Cleaning Localhost URLs from Database ---');
    
    // Clean hero_slides
    const heroResult = await client.query(`
      UPDATE hero_slides 
      SET image_url = REPLACE(image_url, 'http://localhost:3001', '')
      WHERE image_url LIKE 'http://localhost:3001%';
    `);
    console.log(`✅ Cleaned ${heroResult.rowCount} hero slide URLs.`);

    // Clean reels
    const reelsResult = await client.query(`
      UPDATE reels 
      SET video_url = REPLACE(video_url, 'http://localhost:3001', '')
      WHERE video_url LIKE 'http://localhost:3001%';
    `);
    console.log(`✅ Cleaned ${reelsResult.rowCount} reel video URLs.`);

    // Clean image_url in products
    const productResult = await client.query(`
      UPDATE products 
      SET image_url = REPLACE(image_url, 'http://localhost:3001', '')
      WHERE image_url LIKE 'http://localhost:3001%';
    `);
    console.log(`✅ Cleaned ${productResult.rowCount} product image URLs.`);

    console.log('--- Cleanup Complete ---');
  } catch (err) {
    console.error('❌ Cleanup Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

cleanUrls();
