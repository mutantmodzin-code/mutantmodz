const { pool } = require('./server/db');

async function addDescription() {
    try {
        await pool.query('ALTER TABLE products ADD COLUMN description TEXT;');
        console.log('Successfully added description column to products table.');
    } catch (err) {
        if (err.code === '42701') {
            console.log('Column description already exists.');
        } else {
            console.error('Error adding column:', err);
        }
    } finally {
        await pool.end();
    }
}

addDescription();
