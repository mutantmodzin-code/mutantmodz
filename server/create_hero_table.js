const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createHeroTable() {
  const client = await pool.connect();
  try {
    console.log('Creating hero_slides table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id SERIAL PRIMARY KEY,
        image_url TEXT NOT NULL,
        title_white TEXT,
        title_red TEXT,
        subtitle TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Check if empty, add defaults
    const { rows } = await client.query('SELECT count(*) FROM hero_slides');
    if (parseInt(rows[0].count) === 0) {
      console.log('Adding default slides...');
      const defaultSlides = [
        ['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1920', "Coimbatore's Best", 'Bike Accessories', 'Shop premium helmets, riding gear, and custom modifications in Coimbatore.', 1],
        ['https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=1920', "Engineered for", 'Performance', 'Experience the next level of biking with our custom-tuned performance parts.', 2],
        ['https://images.pexels.com/photos/262667/pexels-photo-262667.jpeg?auto=compress&cs=tinysrgb&w=1920', "Rider Safety", 'First Content', 'World-class safety gear for the modern urban rider.', 3]
      ];
      
      for (const slide of defaultSlides) {
        await client.query(
          'INSERT INTO hero_slides (image_url, title_white, title_red, subtitle, display_order) VALUES ($1, $2, $3, $4, $5)',
          slide
        );
      }
    }
    
    console.log('Hero table ready.');
  } catch (err) {
    console.error('Error creating hero table:', err);
  } finally {
    client.release();
    pool.end();
  }
}

createHeroTable();
