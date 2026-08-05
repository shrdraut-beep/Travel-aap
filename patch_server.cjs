const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const startStr = 'app.post("/api/generate-itinerary", async (req, res) => {';
const endStr = 'res.json({ success: false, error: "Failed to generate itinerary" });\n  }\n});';

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr, startIdx) + endStr.length;

const newEndpoint = `app.post("/api/generate-itinerary", async (req, res) => {
  try {
    const { tripName, startDate, endDate, members, lang, promptInstruction, transportMode, totalBudget } = req.body;
    const prompt = \`
      You are an Expert Pre-Trip Planner for Pravas Wataghati. Create a detailed day-wise travel itinerary for:
      - Trip Destination: \${tripName || "Tour"}
      - Dates: \${startDate || "Day 1"} to \${endDate || "Day 3"}
      - Members: \${Array.isArray(members) ? members.join(", ") : "Friends/Family"}
      - Transport Mode: \${transportMode || "road"}
      - Total Budget: \${totalBudget || "Standard"}
      - Language: \${lang === "mr" ? "Marathi" : "English"}
      \${promptInstruction || ""}

      CRITICAL AI LOGIC RULES:
      1. OSM ROUTING, TOLL TAX & BUDGET VALIDATION:
         - Estimate Fuel costs and TOLL TAXES based on estimated OSM routing distance (if transport mode is road/car).
         - Calculate the Exact Total Trip Cost (Transport + Tolls + Hotels + Food + Activities).
         - BUDGET CHECK: Compare this Total Cost with the user's budget. If the budget is low, include a prominent "budgetWarning" in the response.
      2. REMOVE STRICT VEG FILTER & DYNAMIC FOOD SUGGESTIONS:
         - Assume mixed dietary preferences.
         - For EVERY Lunch and Dinner in the itinerary, you MUST suggest exactly TWO highly-rated local restaurant options:
           Option A: Famous for Local/Non-Veg cuisine (🔴).
           Option B: Famous for Pure Veg/Jain cuisine (🟢).
      3. WEATHER API INTEGRATION & SMART PACKING LIST:
         - Analyze the typical weather conditions for the selected destination during the travel dates.
         - Add a "weather" and "packingList" section in the JSON response.
      4. LOCAL HOLIDAYS & CLOSURE AWARENESS:
         - Check if any selected travel dates fall on local public holidays, festivals, or standard weekly off-days (e.g., museums closed on Mondays).
         - Adjust the itinerary automatically so users do not visit closed attractions.
      5. 100% PURE MARATHI SCRIPT: If Language is Marathi, ALL text fields in the JSON MUST be written completely in fluent Devanagari Marathi script (मराठी).

      Return ONLY valid JSON with structure:
      {
        "budgetWarning": "⚠️ बजेट चेतावणी: तुमचे बजेट थोडे कमी पडू शकते..." (or null if budget is fine),
        "weather": "Estimated weather string",
        "packingList": ["Item 1", "Item 2"],
        "totalEstimatedCost": 15000,
        "tollAndFuelCost": 2500,
        "trip_title": "Trip Title",
        "itinerary": [
          {
            "day": 1,
            "title": "Arrival & City Highlights",
            "daily_budget_breakdown": "₹1500 (Food) + ₹500 (Travel)",
            "local_pro_tips": "Start early to avoid traffic.",
            "activities": [
              { "timeOfDay": "Morning (08:30 AM)", "activityName": "Arrival & Breakfast", "exactLocation": "Local Cafe", "realisticCost": "₹300" },
              { "timeOfDay": "Afternoon (01:30 PM)", "activityName": "Sightseeing & Lunch (🔴 Non-Veg Place | 🟢 Pure Veg Place)", "exactLocation": "City Center", "realisticCost": "₹400" }
            ]
          }
        ]
      }
    \`;

    const geminiRes = await safeGeminiGenerate(prompt);
    if (geminiRes.text) {
      return res.json({ success: true, text: geminiRes.text });
    }

    // Fallback structured Itinerary
    const isMr = lang === "mr";
    const fallbackItinerary = {
      budgetWarning: null,
      weather: isMr ? "अंदाजित हवामान: ३०°C, स्वच्छ आकाश" : "Expected Weather: 30°C, Clear Skies",
      packingList: isMr ? ["सनग्लासेस", "कॅप", "सुती कपडे"] : ["Sunglasses", "Cap", "Cotton Clothes"],
      totalEstimatedCost: 10000,
      tollAndFuelCost: 1500,
      trip_title: isMr ? "माझी खास ट्रिप" : "My Special Trip",
      itinerary: [
        {
          day: 1,
          title: isMr ? "दिवस १: आगमन व पर्यटन" : "Day 1: Arrival & Sightseeing",
          daily_budget_breakdown: "₹1000",
          local_pro_tips: "Carry water.",
          activities: [
            { timeOfDay: "Morning", activityName: isMr ? "आगमन व नाश्ता" : "Arrival & Breakfast", exactLocation: "Hotel", realisticCost: "₹300" },
            { timeOfDay: "Afternoon", activityName: isMr ? "प्रमुख स्थळे व जेवण (🔴 मालवणी फिश हाऊस | 🟢 शाकाहारी थाळी)" : "Sightseeing & Lunch (🔴 Malvani Fish House | 🟢 Pure Veg Thali)", exactLocation: "City Center", realisticCost: "₹400" }
          ]
        }
      ]
    };
    res.json({ success: true, text: JSON.stringify(fallbackItinerary), fallback: true });
  } catch (err) {
    res.json({ success: false, error: "Failed to generate itinerary" });
  }
});`;

code = code.substring(0, startIdx) + newEndpoint + code.substring(endIdx);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts successfully");
