const fs = require('fs');
let content = fs.readFileSync('src/pages/FlightsResultsPage.tsx', 'utf8');

content = content.replace(
  /<DuffelNGSView offers=\{offers\} onSelect=\{\(offerId\) => console.log\('Selected flight', offerId\)\} \/>/,
  "{offerRequest && <DuffelNGSView offerRequest={offerRequest} onSelect={(offerId) => console.log('Selected flight', offerId)} />}"
);

fs.writeFileSync('src/pages/FlightsResultsPage.tsx', content);
