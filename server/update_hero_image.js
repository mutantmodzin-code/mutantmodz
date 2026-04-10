const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateHeroImage() {
  try {
    const imageUrl = 'http://localhost:3001/uploads/mutant_hero_premium.png';
    await pool.query(
      'UPDATE hero_slides SET image_url = $1 WHERE display_order = 1',
      [imageUrl]
    );
    console.log('Successfully updated primary hero image content.');
  } catch (err) {
    console.error('Error updating hero image:', err);
  } finally {
    pool.end();
  }
}

updateHeroImage();
