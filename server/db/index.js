const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Run inline database table initialization
async function initTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_registrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) UNIQUE NOT NULL,
          email VARCHAR(100) NOT NULL,
          address TEXT,
          otp_hash TEXT,
          otp_expiry TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ pending_registrations table checked/created');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS security_logs (
          id SERIAL PRIMARY KEY,
          ip VARCHAR(50),
          email VARCHAR(100),
          user_agent TEXT,
          action VARCHAR(50),
          status VARCHAR(20),
          reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ security_logs table checked/created');
  } catch (err) {
    console.error('❌ Error initializing custom auth/security tables:', err);
  }
}
initTables();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
