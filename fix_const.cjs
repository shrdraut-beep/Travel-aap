const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("const generatedPlans: TripPlan[] = parsedPlan.itinerary.map", "let generatedPlans: TripPlan[] = parsedPlan.itinerary.map");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched const to let");
