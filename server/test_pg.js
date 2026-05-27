const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const { Client } = pg;

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  
  console.log('DATABASE_URL starts with:', connectionString ? connectionString.substring(0, 20) + '...' : 'undefined');
  
  if (!connectionString) {
    console.error('DATABASE_URL is not defined in environment variables');
    process.exit(1);
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Successfully connected to the database');
    const res = await client.query('SELECT 1 as result');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection failed:');
    console.error(err.message);
    if (err.stack) {
        console.error(err.stack);
    }
    process.exit(1);
  }
}

testConnection();
