const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetReqStr = `tripName: trip?.name,
          startDate: trip?.startDate,`;

const replaceReqStr = `source: trip?.source || "",
          tripName: trip?.name,
          startDate: trip?.startDate,`;

if (code.includes(targetReqStr)) {
  code = code.replace(targetReqStr, replaceReqStr);
}

const targetStr = `if (parsedPlan.tollAndFuelCost) {
            overviewText += \`**🚗 \${lang === 'mr' ? 'टोल आणि इंधन खर्च (OSM)' : 'Toll & Fuel Cost (OSM)'}:** ₹\${parsedPlan.tollAndFuelCost}\\n\\n\`;
          }`;

const replaceStr = `if (parsedPlan.abort) {
            overviewText = \`**🚫 \${lang === 'mr' ? 'प्रवास कालावधी इशारा' : 'Travel Time Warning'}:** \${parsedPlan.budgetWarning}\\n\\n\`;
            generatedPlans = []; // Don't show itinerary if aborted
          } else {
            if (parsedPlan.wiki_summary) {
              overviewText += \`**📍 \${lang === 'mr' ? 'ठिकाणाबद्दल थोडक्यात माहिती (Wikipedia)' : 'About Location (Wikipedia)'}:** \${parsedPlan.wiki_summary}\\n\\n\`;
            }
            if (parsedPlan.tollAndFuelCost) {
              overviewText += \`**🚗 \${lang === 'mr' ? 'टोल आणि इंधन खर्च (OSM)' : 'Toll & Fuel Cost (OSM)'}:** ₹\${parsedPlan.tollAndFuelCost}\\n\\n\`;
            }
          }`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched src/App.tsx successfully");
