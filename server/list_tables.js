const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function findTables() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables in current DB:', res.rows.map(r => r.table_name));
        process.exit(0);
    } catch (err) {
        console.error('Error finding tables:', err);
        process.exit(1);
    }
}
findTables();
