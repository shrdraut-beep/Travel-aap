const fs = require('fs');
let content = fs.readFileSync('src/components/travel/api.ts', 'utf8');

// Replace "new Date().toISOString().split('T')[0]" with a function call to a new helper
content = content.replace(
  /export function formatDateToYYYYMMDD/,
  "const getTomorrowDateString = () => {\n  const d = new Date();\n  d.setDate(d.getDate() + 1);\n  return d.toISOString().split('T')[0];\n};\n\nexport function formatDateToYYYYMMDD"
);

content = content.replace(/new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/g, 'getTomorrowDateString()');

fs.writeFileSync('src/components/travel/api.ts', content);
