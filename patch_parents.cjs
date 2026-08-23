const fs = require('fs');

function patchParentFlights() {
  let content = fs.readFileSync('src/pages/FlightsResultsPage.tsx', 'utf8');
  content = content.replace(/onSelect=\{\(\) => navigate\('\/checkout'/g, "onSelect={(amount) => navigate('/checkout'");
  content = content.replace(/amount: offer\.total_amount,/g, "amount: amount,");
  fs.writeFileSync('src/pages/FlightsResultsPage.tsx', content);
}

function patchParentCars() {
  let content = fs.readFileSync('src/pages/CarsResultsPage.tsx', 'utf8');
  content = content.replace(/onSelect=\{\(\) => navigate\('\/checkout'/g, "onSelect={(amount) => navigate('/checkout'");
  content = content.replace(/amount: quote\.total_amount,/g, "amount: amount,");
  fs.writeFileSync('src/pages/CarsResultsPage.tsx', content);
}

function patchParentStays() {
  let content = fs.readFileSync('src/pages/StaysDetailsPage.tsx', 'utf8');
  content = content.replace(/onSelect=\{\(\) => \{[\s\n]*navigate\('\/checkout'/g, "onSelect={(amount) => {\n                        navigate('/checkout'");
  content = content.replace(/amount: rate\.total_amount,/g, "amount: amount,");
  fs.writeFileSync('src/pages/StaysDetailsPage.tsx', content);
}

patchParentFlights();
patchParentCars();
patchParentStays();
