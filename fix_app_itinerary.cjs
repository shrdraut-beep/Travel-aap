const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `          updateTripState({
            ...trip,
            aiPlan: result.text,
            itinerary: [...generatedPlans, ...trip.itinerary]
          });`;

const replaceStr = `          // Prepend a Trip Overview with Budget & Weather if available
          let overviewText = '';
          if (parsedPlan.budgetWarning) {
            overviewText += \`**⚠️ \${lang === 'mr' ? 'बजेट चेतावणी' : 'Budget Warning'}:** \${parsedPlan.budgetWarning}\\n\\n\`;
          }
          if (parsedPlan.totalEstimatedCost) {
            overviewText += \`**💸 \${lang === 'mr' ? 'एकूण अंदाजित खर्च' : 'Total Estimated Cost'}:** ₹\${parsedPlan.totalEstimatedCost}\\n\\n\`;
          }
          if (parsedPlan.tollAndFuelCost) {
            overviewText += \`**🚗 \${lang === 'mr' ? 'टोल आणि इंधन खर्च (OSM)' : 'Toll & Fuel Cost (OSM)'}:** ₹\${parsedPlan.tollAndFuelCost}\\n\\n\`;
          }
          if (parsedPlan.weather) {
            overviewText += \`**☁️ \${lang === 'mr' ? 'हवामान अंदाज' : 'Weather Forecast'}:** \${parsedPlan.weather}\\n\\n\`;
          }
          if (parsedPlan.packingList && Array.isArray(parsedPlan.packingList)) {
            overviewText += \`**🎒 \${lang === 'mr' ? 'काय सोबत घ्याल?' : 'Packing List'}:**\\n\${parsedPlan.packingList.map((item) => \`- \${item}\`).join('\\n')}\\n\\n\`;
          }

          if (overviewText) {
            generatedPlans.unshift({
              id: \`plan_ai_overview_\${Date.now()}\`,
              type: 'note' as const,
              title: lang === 'mr' ? '✨ स्मार्ट ट्रिप ओव्हरव्ह्यू (Smart Trip Overview)' : '✨ Smart Trip Overview',
              detail: overviewText.trim(),
              datetime: \`\${trip?.startDate || new Date().toISOString().split("T")[0]}T08:00:00\`
            });
          }

          updateTripState({
            ...trip,
            aiPlan: result.text,
            itinerary: [...generatedPlans, ...trip.itinerary]
          });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched src/App.tsx successfully");
} else {
  console.log("Target string not found in src/App.tsx");
}
