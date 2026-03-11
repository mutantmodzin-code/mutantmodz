const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function updateSchema() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, '..', 'update_schema.sql'), 'utf8');
        console.log('--- Applying Schema Updates ---');
        await pool.query(sql);
        console.log('✅ Schema updated successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Schema Update Error:', err);
        process.exit(1);
    }
}

updateSchema();
