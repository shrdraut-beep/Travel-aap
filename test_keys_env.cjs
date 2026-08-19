const fs = require('fs');
const content = fs.readFileSync('.env.example', 'utf-8');
const lines = content.split('\n').filter(line => line.includes('RAZORPAY'));
console.log("Lines with RAZORPAY in .env.example:");
lines.forEach(l => console.log(l.trim()));
