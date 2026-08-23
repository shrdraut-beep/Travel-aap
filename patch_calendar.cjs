const fs = require('fs');
let content = fs.readFileSync('src/components/travel/BookingFunnelLayout.tsx', 'utf8');

content = content.replace(
  /for \(let i = 0; i < 60; i\+\+\) \{/,
  "const startOffset = 1;\n    for (let i = startOffset; i < 60 + startOffset; i++) {"
);

fs.writeFileSync('src/components/travel/BookingFunnelLayout.tsx', content);
