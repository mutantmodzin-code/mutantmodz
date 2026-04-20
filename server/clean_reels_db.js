const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function cleanReels() {
    try {
        // 1. Delete the "Caution" reels (Title 'testing' and 'tesing')
        const deleteRes = await pool.query(
            "DELETE FROM reels WHERE LOWER(title) IN ('testing', 'tesing')"
        );
        console.log(`✅ Deleted ${deleteRes.rowCount} broken test reels.`);

        // 2. Fix hardcoded localhost URLs for other reels
        const updateRes = await pool.query(`
            UPDATE reels 
            SET video_url = REPLACE(video_url, 'http://localhost:3001', '')
            WHERE video_url LIKE 'http://localhost:3001%'
        `);
        console.log(`✅ Cleaned ${updateRes.rowCount} reel URLs (removed localhost prefix).`);

    } catch (err) {
        console.error('❌ Error cleaning reels:', err);
    } finally {
        await pool.end();
    }
}

cleanReels();
