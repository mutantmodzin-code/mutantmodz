const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'promo_banners'");
    console.log('Columns in promo_banners:', res.rows);
    
    const count = await pool.query("SELECT COUNT(*) FROM promo_banners");
    console.log('Row count:', count.rows[0].count);
  } catch (err) {
    console.error('Error checking table:', err.message);
  } finally {
    await pool.end();
  }
}

check();
