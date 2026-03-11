const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: 'postgresql://postgres:dinesh@127.0.0.1:5432/postgres'
});

async function findDbs() {
    try {
        const res = await pool.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
        console.log('Available Databases:', res.rows.map(r => r.datname));
        process.exit(0);
    } catch (err) {
        console.error('Error finding DBs:', err);
        process.exit(1);
    }
}
findDbs();
