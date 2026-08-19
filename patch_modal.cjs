const fs = require('fs');
let code = fs.readFileSync('src/components/travel/UniversalBookingCheckoutModal.tsx', 'utf-8');

// Remove createPortal import and usage
code = code.replace("import { createPortal } from 'react-dom';", "");
code = code.replace(/return createPortal\(/g, 'return (');
code = code.replace(/ \);(?=[^)]*$)/, ');'); // This might be tricky, let's just do a string replacement for the final closing tag.
// Actually, I can just replace `return createPortal(` with `return (` and then the closing `);` will just match correctly.
// Let's use a regex to fix the ending.
code = code.replace(
  /return createPortal\(\s*<AnimatePresence>/,
  'return (\n    <AnimatePresence>'
);
// In React, `return ( ... );` is fine. If it was `return createPortal(..., document.body);` then I need to remove `, document.body`.
code = code.replace(/, document\.body\s*\);/g, ');');

// Make sure z-index is extremely high
code = code.replace(/z-\[99999\]/g, 'z-[999999]');

fs.writeFileSync('src/components/travel/UniversalBookingCheckoutModal.tsx', code);
