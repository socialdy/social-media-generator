// Script to generate bcrypt hash for test user password
// Run with: node generate-password-hash.js

const bcrypt = require('bcryptjs');

const password = 'TestPassword123!';
const saltRounds = 10;

const hash = bcrypt.hashSync(password, saltRounds);

console.log('='.repeat(60));
console.log('Test User Credentials');
console.log('='.repeat(60));
console.log('Email: test@socialhub.com');
console.log('Password: TestPassword123!');
console.log('='.repeat(60));
console.log('\nBcrypt Hash (for SQL script):');
console.log(hash);
console.log('='.repeat(60));
console.log('\nUpdate create-test-user.sql with this hash!');
