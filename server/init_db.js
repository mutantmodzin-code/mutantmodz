const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('sslmode=require')) 
    ? { rejectUnauthorized: false } 
    : false
});

async function setup() {
  try {
    console.log('--- Initializing Mutant Modz Database ---');

    // 1. Categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Vendors
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        contact_person VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Products (Expanded with Bike Mods info)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        brand VARCHAR(100),
        price DECIMAL(10, 2) NOT NULL,
        stock INT DEFAULT 0,
        vendor_id INT REFERENCES vendors(id) ON DELETE SET NULL,
        sku VARCHAR(50) UNIQUE,
        purchase_price DECIMAL(10, 2) DEFAULT 0.00,
        image_url TEXT,
        bike_brand VARCHAR(100),
        bike_model VARCHAR(100),
        sub_category VARCHAR(100),
        sub_category_type VARCHAR(100),
        description TEXT,
        discount_percent DECIMAL(5, 2) DEFAULT 0.00,
        is_garage_sale BOOLEAN DEFAULT FALSE,
        is_combo BOOLEAN DEFAULT FALSE,
        combo_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Garage Sale Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS garage_sale (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100),
        price DECIMAL(10, 2) NOT NULL,
        stock INT DEFAULT 0,
        image_url TEXT,
        images TEXT[],
        description TEXT,
        garage_sale_type VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        linked_items JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Combos Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS combos (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INT DEFAULT 0,
        image_url TEXT,
        images TEXT[],
        combo_type VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        items JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Default Categories
    const catCheck = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count) === 0) {
      await pool.query("INSERT INTO categories (name) VALUES ('Helmets'), ('Accessories'), ('Gear'), ('Mods'), ('Luggage'), ('Lighting')");
      console.log('✅ Categories initialized');
    }

    console.log('--- Database Setup Success ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database Setup Failure:', err);
    process.exit(1);
  }
}

setup();
