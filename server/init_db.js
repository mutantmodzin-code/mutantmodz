const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setup() {
  try {
    console.log('--- Initializing Mutant Modz Database ---');

    // 1. Create Categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create Vendors (formerly suppliers)
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

    // 3. Create Products with premium fields
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create Product Vendor Prices (history)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_vendor_prices (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        vendor_id INT REFERENCES vendors(id) ON DELETE CASCADE,
        purchase_price DECIMAL(10, 2) NOT NULL,
        selling_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert Default Categories
    const catCheck = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count) === 0) {
      await pool.query("INSERT INTO categories (name) VALUES ('Helmets'), ('Accessories'), ('Gear'), ('Mods')");
      console.log('✅ Categories initialized');
    }

    // Insert Default Admin if empty
    const userCheck = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      // password is 'admin123' hashed with bcrypt (placeholder)
      // Note: in a real app you'd use a real hash
      await pool.query("INSERT INTO users (username, password_hash) VALUES ('admin', '$2b$10$EfvGvS1x.uX0r0e.jL4r5.B1zP.wz1C.K5C5C5C5C5C5C5C5C5C')");
      console.log('✅ Admin user created');
    }

    console.log('--- Database Setup Success ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database Setup Failure:', err);
    process.exit(1);
  }
}

setup();
