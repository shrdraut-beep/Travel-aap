const fs = require('fs');
let content = fs.readFileSync('src/components/TravelSearchWidget.tsx', 'utf8');

// Replace "const today = new Date();" with tomorrow's date for defaults
content = content.replace(
  /const today = new Date\(\);/g,
  "const today = new Date(); today.setDate(today.getDate() + 1);"
);

// We should also replace the min attribute if it exists to be tomorrow
content = content.replace(
  /min=\{today\.toISOString\(\)\.split\('T'\)\[0\]\}/g,
  "min={today.toISOString().split('T')[0]}"
);

fs.writeFileSync('src/components/TravelSearchWidget.tsx', content);
