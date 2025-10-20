const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');

function testPassword(username, passwordToTest) {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        const db = JSON.parse(data);
        
        const user = db.users.find(u => u.username === username);
        if (!user) {
            console.log(`❌ User '${username}' not found!`);
            return;
        }

        const isMatch = bcrypt.compareSync(passwordToTest, user.password);
        
        if (isMatch) {
            console.log(`✅ Password '${passwordToTest}' is CORRECT for user '${username}'`);
        } else {
            console.log(`❌ Password '${passwordToTest}' is WRONG for user '${username}'`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Command line usage
const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
    console.log('\n🔍 PASSWORD TESTER');
    console.log('==================');
    console.log('Usage: node password-tester.js <username> <password>');
    console.log('');
    console.log('Example:');
    console.log('  node password-tester.js itayrev mypassword123');
    console.log('');
    console.log('This will tell you if the password is correct for login.');
} else {
    testPassword(username, password);
}