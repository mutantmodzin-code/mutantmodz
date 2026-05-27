const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('sslmode=require')) 
    ? { rejectUnauthorized: false } 
    : false
});

async function migrate() {
  try {
    console.log('--- Creating Missing Tables ---');

    // 1. hero_slides
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id SERIAL PRIMARY KEY,
        image_url TEXT,
        title_white VARCHAR(255),
        title_red VARCHAR(255),
        subtitle TEXT,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ table "hero_slides" handled');

    // 2. reels
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reels (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        instagram_url TEXT,
        video_url TEXT,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ table "reels" handled');

    // 3. delivery_charges
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_charges (
        id SERIAL PRIMARY KEY,
        state VARCHAR(100) NOT NULL,
        city VARCHAR(100),
        charge DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(state, city)
      );
    `);
    console.log('✅ table "delivery_charges" handled');

    console.log('--- Migration Success ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Failure:', err);
    process.exit(1);
  }
}

migrate();
