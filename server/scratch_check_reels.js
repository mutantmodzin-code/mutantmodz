const db = require('./db');

async function checkReels() {
  try {
    const { rows } = await db.query('SELECT * FROM reels');
    console.log('--- REELS IN DATABASE ---');
    rows.forEach(r => {
      console.log(`ID: ${r.id} | Title: ${r.title} | VideoURL: ${r.video_url} | InstaURL: ${r.instagram_url}`);
    });
    console.log('-------------------------');
    process.exit(0);
  } catch (err) {
    console.error('DB ERROR:', err);
    process.exit(1);
  }
}

checkReels();
