import re

content = open("src/App.tsx", "r").read()

new_func = """  const generateSmartPlan = async (type: string) => {
    setIsSmartGenerating(true);
    try {
      // 1. Calculate precise number of days
      const start = new Date(trip?.startDate || new Date());
      const end = new Date(trip?.endDate || new Date());
      const totalDays = Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      // 2. Strict AI Instructions
      const strictRules = `
        STRICT RULES FOR ITINERARY GENERATION:
        1. TRANSPORT MODE: The user is traveling by '${trip?.transportMode || 'road'}'. If they selected Train/Bus/Car, DO NOT mention Airports or Flights under any circumstances.
        2. DURATION: Generate exactly a ${totalDays}-day itinerary. Do not generate 3 days if the trip is 2 days.
        3. GEOGRAPHY & TRAVEL TIME: Group locations geographically. Do not make users travel from North to South just for dinner. Ensure logical travel times between spots.
        4. CONSISTENCY: If you mention a famous spot in the title (e.g., Dudhsagar), it MUST be included in the daily schedule.
        5. BUDGET: The total budget is ₹${trip?.totalBudget || 'Standard'}. Suggest realistic activities and restaurants within this budget.
      `;

      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripName: trip?.name,
          startDate: trip?.startDate,
          endDate: trip?.endDate,
          members: trip?.members?.map((m) => m.name),
          transportMode: trip?.transportMode || 'road', // <--- Added Transport Mode
          totalBudget: trip?.totalBudget, // <--- Added Total Budget
          lang,
          promptInstruction: strictRules // <--- Sent Strict Rules to Backend
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
          
          const cleanText = text.replace(/\\\\n/g, ' ').replace(/\\\\"/g, "'").replace(/\\\\/g, "");
          try { return JSON.parse(cleanText + '"}]}'); } catch (e) {}
          
          return null;
        };

        parsedPlan = attemptParseJSON(result.text);

        if (!parsedPlan) {
          console.error("Failed to parse JSON itinerary text", result.text);
        }

        if (parsedPlan && parsedPlan.itinerary) {
          const generatedPlans: TripPlan[] = parsedPlan.itinerary.map((dayItem: any, index: number) => {
            const planDate = new Date(trip.startDate);
            planDate.setDate(planDate.getDate() + index);
            const dateStr = planDate.toISOString().split("T")[0];

            let detailText = '';
                if (dayItem.activities && Array.isArray(dayItem.activities)) {
                  dayItem.activities.forEach((act: any) => {
                    const actTime = act.timeOfDay ? act.timeOfDay.toLowerCase() : '';
                    const emoji = actTime.includes('morning') ? '🌅' : actTime.includes('afternoon') ? '☀️' : '🌇';
                    detailText += `### ${emoji} ${act.timeOfDay}\\n**${act.activityName}**\\n${act.exactLocation}\\n*Estimated Cost: ${act.realisticCost}*\\n\\n`;
                  });
                } else {
                  detailText = dayItem.practical_activities ? `${dayItem.practical_activities}\\n\\n` : '';
                  if (dayItem.morning || dayItem.afternoon || dayItem.evening) {
                    detailText += `### 🌅 Morning\\n${dayItem.morning || ''}\\n\\n### ☀️ Afternoon\\n${dayItem.afternoon || ''}\\n\\n### 🌇 Evening\\n${dayItem.evening || ''}\\n\\n`;
                  }
                }
            if (dayItem.daily_budget_breakdown) {
              detailText += `**💰 ${lang === 'mr' ? 'दैनिक खर्च अंदाज' : 'Daily Budget Breakdown'}:** ${dayItem.daily_budget_breakdown}\\n\\n`;
            }
            if (dayItem.local_pro_tips) {
              detailText += `**💡 ${lang === 'mr' ? 'स्थानिक टिप्स' : 'Local Pro Tips'}:** ${dayItem.local_pro_tips}`;
            }

            return {
              id: `plan_ai_day_${dayItem.day || index + 1}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
              type: 'activity' as const,
              title: `${lang === 'mr' ? 'दिवस' : 'Day'} ${dayItem.day}: ${parsedPlan.trip_title || trip?.name}`,
              detail: detailText,
              datetime: `${dateStr}T09:00:00`
            };
          });

          updateTripState({
            ...trip,
            aiPlan: result.text,
            itinerary: [...generatedPlans, ...trip.itinerary]
          });
          triggerToast(lang === 'mr' ? 'Smart नियोजन यशस्वीरित्या तयार झाले!' : "Detailed Smart Itinerary generated!", "success");
        } else {
          const newPlan: TripPlan = {
            id: "plan_ai_" + Date.now(),
            type: "other",
            title: lang === "mr" ? "Smart मार्गदर्शन" : "Smart Guidance",
            detail: result.text,
            datetime: new Date().toISOString()
          };
          updateTripState({ ...trip, itinerary: [newPlan, ...trip.itinerary] });
          triggerToast("Smart Plan generated!");
        }
      } else {
        triggerToast(result.error || "Error generating plan", "alert");
      }
    } catch (e: any) {
      console.error(e);
      triggerToast("सध्या Smart ला माहिती मिळवण्यात तांत्रिक अडचण आली आहे, कृपया आपण स्वतः प्लॅन तयार करून पुढे जा.", "alert");
      setShowPlanModal(true);
      setPlanModalTab("manual");
    } finally {
      setIsSmartGenerating(false);
    }
  };"""

pattern = re.compile(r'  const generateSmartPlan = async \(type: string\) => \{.*?    setIsSmartGenerating\(false\);\n    \}\n  \};\n', re.DOTALL)
content = pattern.sub(new_func + '\n', content)
open("src/App.tsx", "w").write(content)
