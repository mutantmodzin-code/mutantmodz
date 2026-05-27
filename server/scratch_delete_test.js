const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function deleteTest() {
    try {
        const res = await pool.query("DELETE FROM reels WHERE LOWER(title) = 'test'");
        console.log(`✅ Deleted ${res.rowCount} 'test' reels.`);
    } catch (err) {
        console.error('❌ Error deleting test reel:', err);
    } finally {
        await pool.end();
    }
}

deleteTest();
