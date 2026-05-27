const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupHeroTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id SERIAL PRIMARY KEY,
        image_url TEXT,
        title_white TEXT,
        title_red TEXT,
        subtitle TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('--- DATABASE SYNC ---');
    console.log('HERO_SLIDES table is ready.');
    console.log('---------------------');
  } catch (err) {
    console.error('Migration Error:', err);
  } finally {
    pool.end();
  }
}

setupHeroTable();
