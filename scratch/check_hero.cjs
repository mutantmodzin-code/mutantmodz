require('dotenv').config({ path: './server/.env' });
const db = require('../server/db');
async function checkHero() {
    try {
        const { rows } = await db.query('SELECT * FROM hero_slides');
        console.log('Hero Slides:', JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
checkHero();
