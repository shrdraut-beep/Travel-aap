const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf-8');
const matches = content.match(/new Razorpay/g);
console.log("new Razorpay instances in server.ts:", matches ? matches.length : 0);
