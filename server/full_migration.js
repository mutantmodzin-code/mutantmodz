const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('sslmode=require')) 
    ? { rejectUnauthorized: false } 
    : false
});

async function setup() {
  try {
    console.log('--- Initializing Full Mutant Modz Database ---');

    // 1. Categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Vendors/Suppliers (unified)
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

    // 3. Products
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

    // 4. Customers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE,
        email VARCHAR(100),
        address TEXT,
        otp_hash TEXT,
        otp_expiry TIMESTAMP,
        is_verified BOOLEAN DEFAULT FALSE,
        pending_email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Invoices
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0.00,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        order_type VARCHAR(50) DEFAULT 'Offline Order',
        status VARCHAR(20) DEFAULT 'paid',
        gst_percentage DECIMAL(5, 2) DEFAULT 0.00,
        cgst_amount DECIMAL(10, 2) DEFAULT 0.00,
        sgst_amount DECIMAL(10, 2) DEFAULT 0.00,
        igst_amount DECIMAL(10, 2) DEFAULT 0.00,
        taxable_value DECIMAL(10, 2) DEFAULT 0.00,
        total_gst DECIMAL(10, 2) DEFAULT 0.00,
        delivery_charge DECIMAL(10, 2) DEFAULT 0.00,
        shipped_at TIMESTAMP,
        expected_delivery DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Invoice Items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE SET NULL,
        combo_id INT, -- Will reference combos table if needed
        garage_sale_id INT, -- Will reference garage_sale table if needed
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        line_total DECIMAL(10, 2) NOT NULL,
        purchase_price DECIMAL(10, 2) DEFAULT 0.00,
        gst_percentage DECIMAL(5, 2) DEFAULT 0.00,
        cgst_amount DECIMAL(10, 2) DEFAULT 0.00,
        sgst_amount DECIMAL(10, 2) DEFAULT 0.00,
        igst_amount DECIMAL(10, 2) DEFAULT 0.00,
        taxable_amount DECIMAL(10, 2) DEFAULT 0.00,
        selected_size VARCHAR(50),
        selected_color VARCHAR(50),
        discount_percent DECIMAL(5, 2) DEFAULT 0.00
      );
    `);

    // 7. Inventory Logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        change_amount INT NOT NULL,
        type VARCHAR(20) CHECK (type IN ('addition', 'sale', 'adjustment', 'return')),
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Users (Admin)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        otp_hash TEXT,
        otp_expiry TIMESTAMP,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Garage Sale Table
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

    // 10. Combos Table
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
        linked_items JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 11. Promo Banners Table
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

    // Indexing
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_invoices_order_type ON invoices(order_type)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id)`);

    // Default Categories
    const catCheck = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count) === 0) {
      await pool.query("INSERT INTO categories (name) VALUES ('Helmets'), ('Accessories'), ('Gear'), ('Mods'), ('Luggage'), ('Lighting')");
      console.log('✅ Categories initialized');
    }

    // Default Admin User
    const userCheck = await pool.query('SELECT COUNT(*) FROM users WHERE username = $1', ['admin']);
    if (parseInt(userCheck.rows[0].count) === 0) {
      const password = process.env.ADMIN_PASSWORD || '71297129';
      const hash = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)', ['admin', hash, 'admin']);
      console.log('✅ Default admin user created');
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

    console.log('--- Full Database Setup Success ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database Setup Failure:', err);
    process.exit(1);
  }
}

setup();
