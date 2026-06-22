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

    // Create blocked_ips table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blocked_ips (
          id SERIAL PRIMARY KEY,
          ip VARCHAR(50) UNIQUE NOT NULL,
          block_type VARCHAR(20) NOT NULL,
          blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP
      );
    `);
    console.log('✓ blocked_ips table checked/created');

    // Add columns for tracking origins to customers and pending_registrations
    await pool.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_agent TEXT;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS browser_fingerprint TEXT;

      ALTER TABLE pending_registrations ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50);
      ALTER TABLE pending_registrations ADD COLUMN IF NOT EXISTS user_agent TEXT;
      ALTER TABLE pending_registrations ADD COLUMN IF NOT EXISTS browser_fingerprint TEXT;
    `);
    console.log('✓ IP and user-agent columns added/verified');
  } catch (err) {
    console.error('❌ Error initializing custom auth/security tables:', err);
  }
}
initTables();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
