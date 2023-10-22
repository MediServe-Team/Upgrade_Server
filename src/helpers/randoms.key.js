// excute this file to random key
const crypto = require('crypto');

const randomKey1 = crypto.randomBytes(32).toString('hex');
const randomKey2 = crypto.randomBytes(32).toString('hex');

console.table({ randomKey1, randomKey2 });
