const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const generateSmartPlan = async \([^)]*\) => \{[\s\S]*?(?=\n  const handleUpdateMember =)/;
const match = code.match(regex);
if (!match) {
  console.log("Could not find generateSmartPlan function.");
  process.exit(1);
}

const replacement = `const generateSmartPlan = async (type: string) => {
    setIsSmartGenerating(true);
    setLoadingSteps([
      { id: '1', text: lang === 'mr' ? '📍 अंतर आणि मार्ग मोजत आहे...' : '📍 Calculating route & distance...', status: 'loading' },
      { id: '2', text: lang === 'mr' ? '💰 बजेटचे कॅल्क्युलेशन करत आहे...' : '💰 Checking budget viability...', status: 'pending' },
      { id: '3', text: lang === 'mr' ? '🌤️ प्रवासाच्या तारखेचे हवामान चेक करत आहे...' : '🌤️ Checking travel dates weather...', status: 'pending' },
      { id: '4', text: lang === 'mr' ? '🏛️ ठिकाणाची ऐतिहासिक माहिती घेत आहे...' : '🏛️ Fetching destination historical data...', status: 'pending' },
      { id: '5', text: lang === 'mr' ? '🍽️ प्रसिद्ध हॉटेल्स आणि रेस्टॉरंट्स शोधत आहे...' : '🍽️ Finding popular hotels & restaurants...', status: 'pending' },
      { id: '6', text: lang === 'mr' ? '✨ AI कडून तुमचा ट्रिप प्लॅन तयार होत आहे...' : '✨ AI is crafting your trip plan...', status: 'pending' }
    ]);
    try {
      // 1. Calculate precise number of days
      const start = new Date(trip?.startDate || new Date());
      const end = new Date(trip?.endDate || new Date());
      const totalDays = Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      // STEP 1: PRE-TRIP VALIDATION (DISTANCE API)
      let distMetrics: any = null;
      if (trip?.source && trip?.name) {
        if (trip?.transportMode === 'train') {
          setLoadingSteps(prev => prev.map(s => s.id === '1' ? { ...s, text: lang === 'mr' ? '🚂 रेल्वे मार्ग आणि वेळ तपासत आहे...' : '🚂 Checking train route & time...' } : s));
        } else if (trip?.transportMode === 'flight') {
          setLoadingSteps(prev => prev.map(s => s.id === '1' ? { ...s, text: lang === 'mr' ? '✈️ विमान प्रवासाचे पर्याय शोधत आहे...' : '✈️ Searching flight options...' } : s));
        } else {
          setLoadingSteps(prev => prev.map(s => s.id === '1' ? { ...s, text: lang === 'mr' ? '🚗 हायवे आणि टोल तपासत आहे...' : '🚗 Checking highways & tolls...' } : s));
        }

        distMetrics = await fetchDrivingDistanceAndTime(trip.source, trip.name);
        
        // HARD BLOCK VALIDATION
        const maxAllowedTransit = totalDays * 8; // 8 hours per day max driving
        if (distMetrics.totalTransitHours > maxAllowedTransit) {
          triggerToast(lang === 'mr' ? \`प्रवास कालावधी इशारा: \${trip.source} ते \${trip.name} प्रवास खूप लांब आहे (\${distMetrics.totalTransitHours} तास). जवळचे ठिकाण निवडा.\` : \`Warning: Travel time (\${distMetrics.totalTransitHours} hrs) is too long for a \${totalDays} day trip.\`, "alert");
          setIsSmartGenerating(false);
          return;
        }
      }
      setLoadingSteps(prev => prev.map(s => s.id === '1' ? { ...s, status: 'success' } : s.id === '2' ? { ...s, status: 'loading' } : s));
      await new Promise(r => setTimeout(r, 800)); // Budget check mock

      setLoadingSteps(prev => prev.map(s => s.id === '2' ? { ...s, status: 'success' } : s.id === '3' ? { ...s, status: 'loading' } : s));
      await new Promise(r => setTimeout(r, 800)); // Weather check mock

      setLoadingSteps(prev => prev.map(s => s.id === '3' ? { ...s, status: 'success' } : s.id === '4' ? { ...s, status: 'loading' } : s));
      
      // Real Wikipedia fetch
      let wikiFacts = "";
      try {
        const dest = trip?.name || "Destination";
        const wikiRes = await fetch(\`https://mr.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=3&exlimit=1&titles=\${encodeURIComponent(dest)}&explaintext=1&format=json&origin=*\`);
        const wikiData = await wikiRes.json();
        const pages = wikiData?.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== "-1") {
            wikiFacts = pages[pageId].extract;
          }
        }
        if (!wikiFacts) {
          const enWikiRes = await fetch(\`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=3&exlimit=1&titles=\${encodeURIComponent(dest)}&explaintext=1&format=json&origin=*\`);
          const enWikiData = await enWikiRes.json();
          const enPages = enWikiData?.query?.pages;
          if (enPages) {
            const enPageId = Object.keys(enPages)[0];
            if (enPageId !== "-1") {
              wikiFacts = enPages[enPageId].extract;
            }
          }
        }
        setLoadingSteps(prev => prev.map(s => s.id === '4' ? { ...s, status: 'success' } : s.id === '5' ? { ...s, status: 'loading' } : s));
      } catch (e) {
        setLoadingSteps(prev => prev.map(s => s.id === '4' ? { ...s, status: 'error', text: lang === 'mr' ? '❌ माहिती मिळाली नाही' : '❌ Info not found' } : s.id === '5' ? { ...s, status: 'loading' } : s));
      }
      
      await new Promise(r => setTimeout(r, 800)); // Places check mock
      setLoadingSteps(prev => prev.map(s => s.id === '5' ? { ...s, status: 'success' } : s.id === '6' ? { ...s, status: 'loading' } : s));

      // 2. Strict AI Instructions
      const strictRules = \`
        STRICT RULES FOR ITINERARY GENERATION:
        1. TRANSPORT MODE: The user is traveling by '\${trip?.transportMode || 'road'}'. If they selected Train/Bus/Car, DO NOT mention Airports or Flights under any circumstances.
        2. DURATION: Generate exactly a \${totalDays}-day itinerary. Do not generate 3 days if the trip is 2 days.
        3. GEOGRAPHY & TRAVEL TIME: Group locations geographically. Do not make users travel from North to South just for dinner. Ensure logical travel times between spots.
        4. CONSISTENCY: If you mention a famous spot in the title (e.g., Dudhsagar), it MUST be included in the daily schedule.
        5. BUDGET: The total budget is ₹\${trip?.totalBudget || 'Standard'}. Suggest realistic activities and restaurants within this budget.
        6. DIETARY DIVERSITY: For EVERY Lunch and Dinner, suggest TWO distinct options: (🔴 Local/Non-Veg famous dish) AND (🟢 Pure Veg option). Do NOT force everything to be Pure Veg.
      \`;

      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: trip?.source || "",
          tripName: trip?.name,
          startDate: trip?.startDate,
          endDate: trip?.endDate,
          members: trip?.members?.map((m) => m.name),
          transportMode: trip?.transportMode || 'road',
          totalBudget: trip?.totalBudget,
          lang,
          wikiFacts: wikiFacts,
          promptInstruction: strictRules
        })
      });
      
      const result = await response.json();
      if (result.success) {
        let parsedPlan: any = null;
        
        const attemptParseJSON = (text: string) => {
          try { return JSON.parse(text); } catch (e) {}
          try { return JSON.parse(text + '"}'); } catch (e) {}
          try { return JSON.parse(text + '"]}'); } catch (e) {}
          try { return JSON.parse(text + '}]}'); } catch (e) {}
          try { return JSON.parse(text + '"}]}'); } catch (e) {}
          try { return JSON.parse(text + ']}'); } catch (e) {}
          try { return JSON.parse(text + '}'); } catch (e) {}
          const cleanText = text.replace(/\\\\n/g, " ").replace(/\\\\"/g, "'").replace(/\\\\\\\\/g, "");
          try { return JSON.parse(cleanText + '"}]}'); } catch (e) {}
          return null;
        };

        parsedPlan = attemptParseJSON(result.text);

        if (!parsedPlan) {
          console.error("Failed to parse JSON itinerary text", result.text);
        }

        if (parsedPlan && parsedPlan.itinerary) {
          let generatedPlans: TripPlan[] = parsedPlan.itinerary.map((dayItem: any, index: number) => {
            const planDate = new Date(trip.startDate);
            planDate.setDate(planDate.getDate() + index);
            const dateStr = planDate.toISOString().split("T")[0];

            let detailText = '';
            if (dayItem.activities && Array.isArray(dayItem.activities)) {
              dayItem.activities.forEach((act: any) => {
                const actTime = act.timeOfDay ? act.timeOfDay.toLowerCase() : '';
                const emoji = actTime.includes('morning') ? '🌅' : actTime.includes('afternoon') ? '☀️' : '🌇';
                detailText += \`### \${emoji} \${act.timeOfDay}
**\${act.activityName}**
\${act.description || ''}
\`;
                if (act.cost) {
                  detailText += \`* \${lang === 'mr' ? 'खर्च' : 'Cost'}: ₹\${act.cost}\n\n\`;
                } else {
                  detailText += '\n';
                }
              });
            } else {
              detailText = \`### 🌅 \${lang === 'mr' ? 'सकाळ' : 'Morning'}
\${dayItem.morning_9am_to_12pm || ''}

### ☀️ \${lang === 'mr' ? 'दुपार' : 'Afternoon'}
\${dayItem.afternoon_12pm_to_4pm || ''}

### 🌇 \${lang === 'mr' ? 'संध्याकाळ' : 'Evening'}
\${dayItem.evening_4pm_to_9pm || ''}

🏨 **Stay**: \${dayItem.stay || ''}
💡 **Tips**: \${dayItem.daily_local_travel_tips || ''}\`;
            }

            return {
              id: \`ai_\${Date.now()}_\${index}\`,
              title: dayItem.day_title || \`Day \${index + 1}\`,
              date: dateStr,
              location: dayItem.stay ? dayItem.stay.split(' ')[0] : trip.name,
              details: detailText.trim(),
              type: 'itinerary',
              cost: dayItem.estimated_daily_cost || 0
            };
          });

          // Check for hard abort from backend
          if (parsedPlan.abort) {
            triggerToast(\`🚫 \${parsedPlan.budgetWarning}\`, 'alert');
          } else {
            const overviewText = parsedPlan.wiki_summary ? \`**🏛️ \${lang === 'mr' ? 'माहिती' : 'Info'}:** \${parsedPlan.wiki_summary}\\n\\n\` : '';
            
            const aiDiscussion = {
              id: \`ai_disc_\${Date.now()}\`,
              title: lang === 'mr' ? \`✨ AI ट्रिप प्लॅन - \${trip.name}\` : \`✨ AI Trip Plan - \${trip.name}\`,
              date: new Date().toISOString().split("T")[0],
              location: trip.name,
              details: \`\${overviewText}**🌤️ \${lang === 'mr' ? 'हवामान' : 'Weather'}:** \${parsedPlan.weather || ''}\\n\\n**🎒 \${lang === 'mr' ? 'पॅकिंग लिस्ट' : 'Packing List'}:** \${(parsedPlan.packingList || []).join(', ')}\\n\\n**💰 \${lang === 'mr' ? 'अंदाजित खर्च' : 'Estimated Cost'}:** ₹\${parsedPlan.totalEstimatedCost || 0} (\${lang === 'mr' ? 'प्रवास खर्च' : 'Travel Cost'}: ₹\${parsedPlan.tollAndFuelCost || 0})\`,
              type: 'discussion',
              cost: 0
            };

            const updatedItinerary = [...itinerary, aiDiscussion, ...generatedPlans];
            
            updateTripState({
              ...trip,
              itinerary: updatedItinerary
            });
            triggerToast(lang === 'mr' ? "✨ स्मार्ट प्लॅन तयार झाला!" : "✨ Smart Plan generated!");
            setLoadingSteps(prev => prev.map(s => s.id === '6' ? { ...s, status: 'success' } : s));
          }
        }
      } else {
         throw new Error("Failed to generate");
      }
    } catch (error) {
      console.error("Smart Planner generation failed", error);
      triggerToast(lang === 'mr' ? "प्लॅन तयार करताना त्रुटी आली." : "Failed to generate plan.", "alert");
      setLoadingSteps(prev => prev.map(s => s.status === 'loading' ? { ...s, status: 'error' } : s));
    } finally {
      setTimeout(() => setIsSmartGenerating(false), 1500);
    }
  };`;

code = code.replace(match[0], replacement + '\n');
fs.writeFileSync('src/App.tsx', code);
console.log("Replaced generateSmartPlan function.");
