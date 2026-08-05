const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import if not present
if (!code.includes('fetchDrivingDistanceAndTime')) {
  code = code.replace("import { addHotelBooking, getHotelBookings } from './services/localSearchService';", "import { addHotelBooking, getHotelBookings } from './services/localSearchService';\nimport { fetchDrivingDistanceAndTime } from './services/travelAIService';");
}

const targetStr = `const generateSmartPlan = async (type: string) => {
    setIsSmartGenerating(true);
    try {
      // 1. Calculate precise number of days
      const start = new Date(trip?.startDate || new Date());
      const end = new Date(trip?.endDate || new Date());
      const totalDays = Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);`;

const replaceStr = `const generateSmartPlan = async (type: string) => {
    setIsSmartGenerating(true);
    try {
      // 1. Calculate precise number of days
      const start = new Date(trip?.startDate || new Date());
      const end = new Date(trip?.endDate || new Date());
      const totalDays = Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      // STEP 1: PRE-TRIP VALIDATION (DISTANCE API)
      if (trip?.source && trip?.name) {
        const distMetrics = await fetchDrivingDistanceAndTime(trip.source, trip.name);
        // If driving duration is > 30% of total trip time (e.g., 24 hrs per day)
        // Let's say if total transit hours > (totalDays * 24 * 0.3)
        // Or simpler: if it takes more than 10 hours for a 2 day trip
        const maxAllowedTransit = totalDays * 8; // 8 hours per day max driving
        if (distMetrics.totalTransitHours > maxAllowedTransit) {
          triggerToast(lang === 'mr' ? \`प्रवास कालावधी इशारा: \${trip.source} ते \${trip.name} प्रवास खूप लांब आहे (\${distMetrics.totalTransitHours} तास). जवळचे ठिकाण निवडा.\` : \`Warning: Travel time (\${distMetrics.totalTransitHours} hrs) is too long for a \${totalDays} day trip.\`, "alert");
          setIsSmartGenerating(false);
          return;
        }
      }
`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
} else {
  console.log("Could not find start string in src/App.tsx");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched src/App.tsx successfully");
