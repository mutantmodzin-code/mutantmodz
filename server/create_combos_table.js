const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    console.log('--- Migrating: Creating Combos Table ---');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS combos (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100),
        price DECIMAL(10, 2) NOT NULL,
        stock INT DEFAULT 0,
        image_url TEXT,
        images TEXT[],
        description TEXT,
        combo_type VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Combos table created (if not exists)');

    // Optional: Migrate existing combos from products table
    const existing = await pool.query('SELECT * FROM products WHERE is_combo = true');
    console.log(`Found ${existing.rows.length} existing combos in products table.`);
    
    for (const p of existing.rows) {
        await pool.query(
            'INSERT INTO combos (name, brand, price, stock, image_url, description, combo_type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [p.name, p.brand, p.price, p.stock, p.image_url, p.description, p.combo_type]
        );
        console.log(`Migrated combo: ${p.name}`);
    }

    console.log('--- Migration Success ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Failure:', err);
    process.exit(1);
  }
}

migrate();
