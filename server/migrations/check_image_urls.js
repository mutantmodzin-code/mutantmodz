const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('sslmode=require')) 
    ? { rejectUnauthorized: false } 
    : false
});

async function check() {
  try {
    console.log('--- Checking Existing Image URLs ---');
    const { rows } = await pool.query('SELECT image_url FROM products LIMIT 5');
    console.log('Products sample:', rows);
    const heroRows = await pool.query('SELECT image_url FROM hero_slides LIMIT 5');
    console.log('Hero sample:', heroRows.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
