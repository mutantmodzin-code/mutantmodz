const db = require('../db');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const updateAdmin = async (username, password) => {
    try {
        if (!username || !password) {
            console.error('Usage: node update_admin.js <new_username> <new_password>');
            console.log('Example: node update_admin.js superadmin MyNewSecurePassword123');
            process.exit(1);
        }

        // Validate password complexity
        if (password.length < 12) {
            console.error('❌ Error: Password must be at least 12 characters.');
            process.exit(1);
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            console.error('❌ Error: Password must contain uppercase, lowercase, number, and special character.');
            process.exit(1);
        }

        // Check Have I Been Pwned
        const { checkPwnedPassword } = require('../utils/security');
        console.log('🔍 Checking Have I Been Pwned database for credential leaks...');
        const pwned = await checkPwnedPassword(password);
        if (pwned.isBreached) {
            console.error(`❌ Error: This password was found in ${pwned.count} public data breaches. Please choose a different password.`);
            process.exit(1);
        }

        console.log(`🔄 Updating admin credentials for: ${username}`);
        
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 1. Update Database
        const result = await db.query('SELECT * FROM users WHERE role = $1', ['admin']);
        
        if (result.rows.length > 0) {
            await db.query(
                'UPDATE users SET username = $1, password_hash = $2 WHERE role = $3',
                [username, hashedPassword, 'admin']
            );
            console.log('✅ Database: Admin credentials updated.');
        } else {
            await db.query(
                'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
                [username, hashedPassword, 'admin']
            );
            console.log('✅ Database: New admin user created.');
        }

        // 2. Update .env file for consistency
        const envPath = path.join(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            
            // Update or add ADMIN_PASSWORD
            if (envContent.includes('ADMIN_PASSWORD=')) {
                envContent = envContent.replace(/ADMIN_PASSWORD=.*/, `ADMIN_PASSWORD=${password}`);
            } else {
                envContent += `\nADMIN_PASSWORD=${password}`;
            }
            
            fs.writeFileSync(envPath, envContent);
            console.log('✅ .env: ADMIN_PASSWORD updated.');
        }
        
        console.log('\n✨ Admin credentials successfully changed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.message.includes('ENOTFOUND')) {
            console.log('\n💡 Tip: Your database host could not be reached. Please check your internet connection or DATABASE_URL in .env');
        }
        process.exit(1);
    }
};

const args = process.argv.slice(2);
updateAdmin(args[0], args[1]);
