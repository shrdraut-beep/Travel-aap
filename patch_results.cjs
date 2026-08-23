const fs = require('fs');

function patchFile(file, cardRegex, onSelectAttrRegex) {
  let content = fs.readFileSync(file, 'utf8');

  // Change Card definition
  content = content.replace(/onSelect: \(\) => void/g, "onSelect: (amount: number) => void");
  
  // Extract convertedAmount
  content = content.replace(/const { formattedINR, isLoading } = useINRConversion\(/g, "const { convertedAmount, formattedINR, isLoading } = useINRConversion(");

  // Update button onClick
  content = content.replace(/onClick={onSelect}/g, "onClick={() => onSelect(convertedAmount ?? parseFloat(offer?.total_amount || quote?.total_amount || rate?.total_amount || 0))}");
  
  // Custom fix for Stays Details Page which had onClick={onSelect} but might be different
  content = content.replace(/onClick=\{\(\) => onSelect\(\)\}/g, "onClick={() => onSelect(convertedAmount ?? parseFloat(offer?.total_amount || quote?.total_amount || rate?.total_amount || 0))}");

  fs.writeFileSync(file, content);
}

patchFile('src/pages/FlightsResultsPage.tsx');
patchFile('src/pages/CarsResultsPage.tsx');
patchFile('src/pages/StaysDetailsPage.tsx');
