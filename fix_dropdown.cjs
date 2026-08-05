const fs = require('fs');
const file = 'src/components/travel/HotelSearchTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove predictions dropdown rendering
content = content.replace(/\{showPredictions && predictions\.length > 0 && \([\s\S]*?<\/div>\s*\)\}/, '');
content = content.replace(/setShowPredictions\(true\);/g, '');
content = content.replace(/onFocus=\{\(\) => \}/g, ''); // in case we left empty onFocus

fs.writeFileSync(file, content);
