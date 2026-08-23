const fs = require('fs');
let code = fs.readFileSync('src/components/common/DateRangePicker.tsx', 'utf8');

// fix timezone comparison issue by using string comparison
code = code.replace(
  "const isBetween = tempStart && tempEnd && currentDate > new Date(tempStart) && currentDate < new Date(tempEnd);",
  "const isBetween = tempStart && tempEnd && dateStr > tempStart && dateStr < tempEnd;"
);

fs.writeFileSync('src/components/common/DateRangePicker.tsx', code);
