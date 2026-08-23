const fs = require('fs');

function fixFlights() {
  let content = fs.readFileSync('src/pages/FlightsResultsPage.tsx', 'utf8');
  content = content.replace(/quote\?\.total_amount \|\| rate\?\.total_amount \|\| /g, "");
  fs.writeFileSync('src/pages/FlightsResultsPage.tsx', content);
}

function fixCars() {
  let content = fs.readFileSync('src/pages/CarsResultsPage.tsx', 'utf8');
  content = content.replace(/offer\?\.total_amount \|\| /g, "");
  content = content.replace(/ \|\| rate\?\.total_amount/g, "");
  fs.writeFileSync('src/pages/CarsResultsPage.tsx', content);
}

function fixStays() {
  let content = fs.readFileSync('src/pages/StaysDetailsPage.tsx', 'utf8');
  content = content.replace(/offer\?\.total_amount \|\| quote\?\.total_amount \|\| /g, "");
  fs.writeFileSync('src/pages/StaysDetailsPage.tsx', content);
}

fixFlights();
fixCars();
fixStays();
