const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\/\/ Google Places Proxy[\s\S]*?\}\);/g, '');
content = content.replace(/\/\/ Google Places Photo Proxy[\s\S]*?\}\);/g, '');

fs.writeFileSync(file, content);
