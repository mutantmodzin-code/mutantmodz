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
    console.log('--- Checking Columns for reels ---');
    const { rows } = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'reels'
    `);
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
