const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'migrate_v3.sql'), 'utf8');
        console.log('--- Applying Migration V3 (Bike Compatibility) ---');
        await pool.query(sql);
        console.log('✅ Migration successful: bike_brand and bike_model added.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration Error:', err);
        process.exit(1);
    }
}

runMigration();
