const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        console.log('--- Adding OTP Columns to Customers and Users ---');
        await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS otp_hash TEXT');
        await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_hash TEXT');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP');
        console.log('✅ OTP Columns added successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
