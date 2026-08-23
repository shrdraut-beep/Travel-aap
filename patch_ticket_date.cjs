const fs = require('fs');
let content = fs.readFileSync('src/pages/TicketDetailsPage.tsx', 'utf8');

// Replace en-US with en-IN
content = content.replace(/'en-US'/g, "'en-IN'");
fs.writeFileSync('src/pages/TicketDetailsPage.tsx', content);
