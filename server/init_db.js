const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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

    // 7. Promo Banners Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promo_banners (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100),
        subtitle VARCHAR(100),
        discount_text VARCHAR(50),
        price_text VARCHAR(50),
        image_url TEXT,
        link_url TEXT,
        bg_color VARCHAR(50) DEFAULT '#fbbf24',
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Default Categories
    const catCheck = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count) === 0) {
      await pool.query("INSERT INTO categories (name) VALUES ('Helmets'), ('Accessories'), ('Gear'), ('Mods'), ('Luggage'), ('Lighting')");
      console.log('✅ Categories initialized');
    }

    // Seed initial promo banners if empty
    const promoCheck = await pool.query('SELECT COUNT(*) FROM promo_banners');
    if (parseInt(promoCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO promo_banners (title, discount_text, price_text, bg_color) VALUES 
        ('METAL PRODUCTS', '40% OFF', '₹1099', '#fbbf24'),
        ('TOP BOX', '46% OFF', '₹2599', '#fbbf24'),
        ('JERRY CAN', '41% OFF', '₹1599', '#fbbf24'),
        ('COMMUNICATION', '35% OFF', '₹1099', '#fbbf24'),
        ('FOGLIGHT', '80% OFF', '₹249', '#fbbf24'),
        ('MIRROR', '60% OFF', '₹149', '#fbbf24')
      `);
      console.log('✅ Promo banners initialized');
    }

    console.log('--- Database Setup Success ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database Setup Failure:', err);
    process.exit(1);
  }
}

setup();
