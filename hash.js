// Quick script to get the bcrypt hash
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('TestPassword123!', 10);
console.log(hash);
