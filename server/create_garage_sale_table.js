const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createGarageSaleTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS garage_sale (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(255),
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        images TEXT[] DEFAULT '{}',
        description TEXT,
        garage_sale_type VARCHAR(100),
        linked_items JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Garage Sale table created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating garage sale table:', err);
    process.exit(1);
  }
}

createGarageSaleTable();
