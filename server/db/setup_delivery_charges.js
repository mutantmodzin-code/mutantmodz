const db = require('./index');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function run() {
    try {
        console.log('Creating delivery_charges table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS delivery_charges (
                id SERIAL PRIMARY KEY,
                state VARCHAR(100) NOT NULL,
                city VARCHAR(100),
                charge INT NOT NULL CHECK (charge IN (100, 200, 300)),
                UNIQUE(state, city)
            )
        `);
        console.log('✅ Table created');

        console.log('Seeding data...');
        await db.query(`
            INSERT INTO delivery_charges (state, city, charge) VALUES
                ('Tamil Nadu',     NULL,          100),
                ('Tamil Nadu',     'Chennai',     100),
                ('Tamil Nadu',     'Coimbatore',  100),
                ('Tamil Nadu',     'Madurai',     100),
                ('Tamil Nadu',     'Salem',       100),
                ('Tamil Nadu',     'Trichy',      100),
                ('Karnataka',      NULL,          100),
                ('Karnataka',      'Bangalore',   100),
                ('Karnataka',      'Mysore',      100),
                ('Kerala',         NULL,          200),
                ('Kerala',         'Kochi',       200),
                ('Kerala',         'Trivandrum',  200),
                ('Maharashtra',    NULL,          200),
                ('Maharashtra',    'Mumbai',      200),
                ('Maharashtra',    'Pune',        200),
                ('Andhra Pradesh', NULL,          200),
                ('Andhra Pradesh', 'Hyderabad',   200),
                ('Telangana',      NULL,          200),
                ('Telangana',      'Hyderabad',   200),
                ('Delhi',          NULL,          200),
                ('Gujarat',        NULL,          200),
                ('Gujarat',        'Ahmedabad',   200),
                ('West Bengal',    NULL,          200),
                ('West Bengal',    'Kolkata',     200),
                ('Rajasthan',      NULL,          300),
                ('Uttar Pradesh',  NULL,          300),
                ('Madhya Pradesh', NULL,          300),
                ('Bihar',          NULL,          300),
                ('Assam',          NULL,          300),
                ('Odisha',         NULL,          300),
                ('Punjab',         NULL,          200),
                ('Haryana',        NULL,          200)
            ON CONFLICT DO NOTHING
        `);
        console.log('✅ Data seeded');
        console.log('--- Done ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

run();
