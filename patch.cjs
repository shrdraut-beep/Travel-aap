const fs = require('fs');
let stays = fs.readFileSync('src/pages/StaysDetailsPage.tsx', 'utf8');
stays = stays.replace(/{ \/\* @ts-ignore \*\/ }<StaysSummary/g, '{/* @ts-ignore */}\n<StaysSummary');
stays = stays.replace(/{ \/\* @ts-ignore \*\/ }<StaysAmenities/g, '{/* @ts-ignore */}\n<StaysAmenities');
stays = stays.replace(/{ \/\* @ts-ignore \*\/ }<StaysCancellationTimeline/g, '{/* @ts-ignore */}\n<StaysCancellationTimeline');

stays = stays.replace(/\{\(stayDetails\.roomRates \|\| \[\]\)\.map\(\(rate: any, i: number\) => \(\s*\{ \/\* @ts-ignore \*\/ \}<StaysRoomRateCard key=\{i\} rate=\{rate\} onSelect=\{[^}]+\} \/>\s*\)\)\}/g, 
`{(stayDetails.roomRates || []).map((rate: any, i: number) => (
  <React.Fragment key={i}>
    {/* @ts-ignore */}
    <StaysRoomRateCard rate={rate} onSelect={() => console.log('Selected', rate)} />
  </React.Fragment>
))}`);
fs.writeFileSync('src/pages/StaysDetailsPage.tsx', stays);

let flights = fs.readFileSync('src/pages/FlightsResultsPage.tsx', 'utf8');
flights = flights.replace(/{ \/\* @ts-ignore \*\/ }<DuffelNGSView/g, '{/* @ts-ignore */}\n<DuffelNGSView');
fs.writeFileSync('src/pages/FlightsResultsPage.tsx', flights);
