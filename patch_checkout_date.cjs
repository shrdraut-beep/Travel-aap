const fs = require('fs');
let content = fs.readFileSync('src/pages/CheckoutPage.tsx', 'utf8');

// Replace en-US with en-IN
content = content.replace(/'en-US'/g, "'en-IN'");
// Replace en-GB with en-IN
content = content.replace(/'en-GB'/g, "'en-IN'");

// Also let's check for any explicit text formatting
fs.writeFileSync('src/pages/CheckoutPage.tsx', content);
