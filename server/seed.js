const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function seed() {
    const password = 'admin123';
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    console.log(`Generated Hash for admin123: ${hash}`);

    try {
        // Create users table properly
        await pool.query('DROP TABLE IF EXISTS users CASCADE');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Insert admin
        await pool.query('INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)', ['admin', hash, 'admin']);

        console.log('Admin user seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seed();
