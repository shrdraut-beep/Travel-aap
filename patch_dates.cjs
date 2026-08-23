const fs = require('fs');
const files = [
  'src/components/travel/FlightSearchTab.tsx',
  'src/components/travel/HotelSearchTab.tsx',
  'src/components/travel/CarSearchTab.tsx',
  'src/components/travel/BusSearchTab.tsx',
  'src/components/travel/TrainInfoTab.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('const getTomorrowDate = () =>')) {
    content = content.replace(
      "import React, { useState } from 'react';",
      "import React, { useState } from 'react';\n\nconst getTomorrowDate = () => {\n  const tomorrow = new Date();\n  tomorrow.setDate(tomorrow.getDate() + 1);\n  return tomorrow.toISOString().split('T')[0];\n};\n"
    );
  }

  content = content.replace(
    /const \[departDate, setDepartDate\] = useState\(''\);/,
    "const [departDate, setDepartDate] = useState(getTomorrowDate());"
  );
  content = content.replace(
    /const \[checkInDate, setCheckInDate\] = useState\(''\);/,
    "const [checkInDate, setCheckInDate] = useState(getTomorrowDate());"
  );

  fs.writeFileSync(file, content);
}
