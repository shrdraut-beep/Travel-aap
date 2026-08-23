const fs = require('fs');
let content = fs.readFileSync('src/components/views/MyTicketsView.tsx', 'utf8');

// Replace en-US with en-IN
content = content.replace(/'en-US'/g, "'en-IN'");
fs.writeFileSync('src/components/views/MyTicketsView.tsx', content);
