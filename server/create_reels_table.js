const { query } = require('./db');

async function createReelsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS reels (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        instagram_url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Reels table created successfully');

    // Seed with some initial data if empty
    const { rows } = await query('SELECT count(*) FROM reels');
    if (parseInt(rows[0].count) === 0) {
      await query(`
        INSERT INTO reels (title, instagram_url, display_order) VALUES
        ('Helmets', 'https://www.instagram.com/reel/DLhmu_MzjWm/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', 1),
        ('Night Ride', 'https://www.instagram.com/reel/DLPjIJkz1Ri/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', 2),
        ('Mountain Touring', 'https://www.instagram.com/reel/DFKvNbBz_tc/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', 3),
        ('HIMALAYAN 450', 'https://www.instagram.com/reel/DLUufIPTimS/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==', 4)
      `);
      console.log('Seed data inserted into reels table');
    }
  } catch (err) {
    console.error('Error creating reels table:', err);
  } finally {
    process.exit();
  }
}

createReelsTable();
