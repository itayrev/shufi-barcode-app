const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');

// Read database
function readDatabase() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error.message);
        return null;
    }
}

// Write database
function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing database:', error.message);
        return false;
    }
}

// List all users
function listUsers() {
    const db = readDatabase();
    if (!db) return;

    console.log('\n🔍 REGISTERED USERS');
    console.log('==================');
    
    if (db.users.length === 0) {
        console.log('No users registered yet.');
        return;
    }

    db.users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log(`   Password: [Encrypted - ${user.password.substring(0, 20)}...]`);
        console.log('');
    });
}

// Add new user
function addUser(username, password) {
    const db = readDatabase();
    if (!db) return;

    // Check if username already exists
    const existingUser = db.users.find(u => u.username === username);
    if (existingUser) {
        console.log(`❌ Username '${username}' already exists!`);
        return;
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create new user
    const newUser = {
        id: db.nextUserId,
        username: username,
        password: hashedPassword,
        created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    db.nextUserId++;

    if (writeDatabase(db)) {
        console.log(`✅ User '${username}' added successfully!`);
    }
}

// Delete user
function deleteUser(username) {
    const db = readDatabase();
    if (!db) return;

    const userIndex = db.users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        console.log(`❌ User '${username}' not found!`);
        return;
    }

    db.users.splice(userIndex, 1);

    if (writeDatabase(db)) {
        console.log(`✅ User '${username}' deleted successfully!`);
    }
}

// Change password
function changePassword(username, newPassword) {
    const db = readDatabase();
    if (!db) return;

    const user = db.users.find(u => u.username === username);
    if (!user) {
        console.log(`❌ User '${username}' not found!`);
        return;
    }

    user.password = bcrypt.hashSync(newPassword, 10);

    if (writeDatabase(db)) {
        console.log(`✅ Password changed for user '${username}'!`);
    }
}

// Command line interface
function main() {
    const command = process.argv[2];
    const username = process.argv[3];
    const password = process.argv[4];

    switch (command) {
        case 'list':
            listUsers();
            break;
        case 'add':
            if (!username || !password) {
                console.log('Usage: node user-manager.js add <username> <password>');
                return;
            }
            addUser(username, password);
            break;
        case 'delete':
            if (!username) {
                console.log('Usage: node user-manager.js delete <username>');
                return;
            }
            deleteUser(username);
            break;
        case 'password':
            if (!username || !password) {
                console.log('Usage: node user-manager.js password <username> <newpassword>');
                return;
            }
            changePassword(username, password);
            break;
        default:
            console.log('\n👥 SHUFI USER MANAGER');
            console.log('=====================');
            console.log('Available commands:');
            console.log('');
            console.log('📋 node user-manager.js list                    - List all users');
            console.log('➕ node user-manager.js add <user> <pass>       - Add new user');
            console.log('❌ node user-manager.js delete <username>       - Delete user');
            console.log('🔑 node user-manager.js password <user> <pass>  - Change password');
            console.log('');
            console.log('Examples:');
            console.log('  node user-manager.js list');
            console.log('  node user-manager.js add john mypassword123');
            console.log('  node user-manager.js delete john');
            console.log('  node user-manager.js password john newpass456');
    }
}

main();