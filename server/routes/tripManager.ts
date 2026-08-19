import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const router = express.Router();

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined in environment.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

/**
 * Robust helper to query Gemini with failover.
 * Tries the premium 'gemini-3.7-flash' first. If it is overloaded or rate-limited,
 * it instantly falls back to the high-capacity 'gemini-3.1-flash-lite' model.
 */
async function generateContentWithFailover(ai: any, params: any) {
  const models = ['gemini-3.7-flash', 'gemini-3.1-flash-lite'];
  
  for (const model of models) {
    try {
      console.log(`[AI] Activating query sequence on: ${model}`);
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      console.log(`[AI] ${model} is currently busy, shifting task to backup option...`);
    }
  }
  
  throw new Error("System is handling high traffic. Using smart local fallbacks.");
}

function getDeterministicBudgetWarning(lang: string, budgetBase: number, totalSpent: number, budgetPercent: number) {
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';
  
  if (isMr) {
    return {
      id: 'det-budget-warning',
      title: '⚠️ बजेट इशारा: ८०% पेक्षा जास्त वापर!',
      message: `तुमच्या एकूण बजेटपैकी (₹${budgetBase}) तब्बल ${budgetPercent.toFixed(1)}% (₹${totalSpent}) खर्च झाले आहेत! अधिक खर्च टाळण्यासाठी आजच्या खर्चाची काळजी घ्या आणि मोफत प्रेक्षणीय स्थळांना प्राधान्य द्या.`,
      type: 'budget'
    };
  } else if (isHi) {
    return {
      id: 'det-budget-warning',
      title: '⚠️ बजट चेतावनी: ८०% से अधिक उपयोग!',
      message: `आपके कुल बजट (₹${budgetBase}) में से ${budgetPercent.toFixed(1)}% (₹${totalSpent}) खर्च हो चुके हैं! अतिरिक्त खर्चों से बचने के लिए आज के खर्च को नियंत्रित करें और मुफ्त पर्यटन स्थलों को चुनें।`,
      type: 'budget'
    };
  } else {
    return {
      id: 'det-budget-warning',
      title: '⚠️ Budget Alert: Over 80% Spent!',
      message: `You have spent ${budgetPercent.toFixed(1)}% (₹${totalSpent}) of your total budget (₹${budgetBase})! To avoid overspending, please trim extra costs today and opt for free sightseeing options.`,
      type: 'budget'
    };
  }
}

const getDeterministicFallbacks = (
  lang: string,
  budgetPercent: number,
  totalSpent: number,
  budgetBase: number,
  itineraryCount: number,
  weather: any
) => {
  const suggestions = [];
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';

  // 1. Budget suggestion if budgetPercent >= 80%
  if (budgetPercent >= 80) {
    suggestions.push(getDeterministicBudgetWarning(lang, budgetBase, totalSpent, budgetPercent));
  }

  // 2. Itinerary count suggestion if no plans
  if (itineraryCount === 0) {
    if (isMr) {
      suggestions.push({
        id: 'fallback-itinerary',
        title: '📅 नियोजनात नवीन उपक्रम जोडा',
        message: 'तुमच्या सहलीच्या नियोजनात अजून कोणतेही उपक्रम जोडलेले नाहीत. आजचे आकर्षक ठिकाण जोडण्यासाठी प्लॅनिंग टॅब तपासा!',
        type: 'activity'
      });
    } else if (isHi) {
      suggestions.push({
        id: 'fallback-itinerary',
        title: '📅 नियोजन में नई गतिविधियां जोड़ें',
        message: 'आपकी यात्रा के नियोजन में अभी तक कोई गतिविधि नहीं जोड़ी गई है। आज ही आकर्षक गतिविधि जोड़ने के लिए प्लानिंग टैब देखें!',
        type: 'activity'
      });
    } else {
      suggestions.push({
        id: 'fallback-itinerary',
        title: '📅 Add Activities to Itinerary',
        message: 'No activities are planned yet. Visit the planning tab to add top recommendations or sightseeing points!',
        type: 'activity'
      });
    }
  }

  // 3. General Travel Pro-Tip (always useful)
  if (isMr) {
    suggestions.push({
      id: 'fallback-general-tip',
      title: '💡 स्थानिक ट्रॅव्हल प्रो-टिप',
      message: 'ग्रुपसोबत प्रवास करताना सर्व खर्चाची नोंद लगेच ठेवा. एका क्लिकवर खर्च विभक्त (split) करण्यासाठी खर्च टॅबचा वापर करा!',
      type: 'activity'
    });
  } else if (isHi) {
    suggestions.push({
      id: 'fallback-general-tip',
      title: '💡 स्थानीय ट्रैवल प्रो-टिप',
      message: 'ग्रुप के साथ यात्रा करते समय सभी खर्चों को तुरंत रिकॉर्ड करें। खर्चों को बांटने (split) के लिए खर्च टैब का उपयोग करें!',
      type: 'activity'
    });
  } else {
    suggestions.push({
      id: 'fallback-general-tip',
      title: '💡 Local Travel Pro-Tip',
      message: 'Always log your group expenses immediately to avoid calculations later. Use the Expense tab to split bills on the go!',
      type: 'activity'
    });
  }

  return suggestions.slice(0, 3);
};

const getFallbackBriefing = (lang: string, destination: string, timeOfDay: string) => {
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';

  const timePhrasesMr: Record<string, string> = {
    morning: 'शुभ सकाळ! ☀️ तुमच्या आजच्या प्रवासाची सुरुवात आनंददायी असो.',
    afternoon: 'नमस्कार! 🌤️ दुपारचा प्रवास आनंददायी आणि सुखकर जावो.',
    evening: 'शुभ संध्याकाल! 🌅 आजची संध्याकाळ सुंदर आठवणींनी सजवून घ्या.',
    night: 'शुभ रात्री! 🌙 आजची रात्र विश्रांतीसाठी उत्तम असो.'
  };

  const timePhrasesHi: Record<string, string> = {
    morning: 'सुप्रभात! ☀️ आपकी आज की यात्रा मंगलमय हो।',
    afternoon: 'नमस्कार! 🌤️ दोपहर का सफर सुखद और आनंददायक हो।',
    evening: 'शुभ संध्या! 🌅 आज की शाम खुशनुमा यादों से भरी हो।',
    night: 'शुभ रात्रि! 🌙 आज की रात विश्राम और आराम के लिए हो।'
  };

  const timePhrasesEn: Record<string, string> = {
    morning: 'Good morning! ☀️ Hope your travels today are filled with joy.',
    afternoon: 'Good afternoon! 🌤️ Have a safe and pleasant journey today.',
    evening: 'Good evening! 🌅 Enjoy a beautiful and relaxing evening on your trip.',
    night: 'Good night! 🌙 Wishing you a peaceful rest after a day of travel.'
  };

  const phrase = isMr
    ? (timePhrasesMr[timeOfDay] || timePhrasesMr.morning)
    : isHi
    ? (timePhrasesHi[timeOfDay] || timePhrasesHi.morning)
    : (timePhrasesEn[timeOfDay] || timePhrasesEn.morning);

  if (isMr) {
    return `${phrase} ${destination} मधील आपला वेळ आनंदात घालवा! ट्रेनची थेट स्थिती, प्रेक्षणीय स्थळे आणि ग्रुप खर्च सहज व्यवस्थापित करा.`;
  } else if (isHi) {
    return `${phrase} ${destination} में अपना समय आनंद से बिताएं! ट्रेन की स्थिति, दर्शनीय स्थल और खर्चों को आसानी से प्रबंधित करें।`;
  } else {
    return `${phrase} Enjoy your time in ${destination}! Keep checking schedules, top attractions, and group expenses on the go.`;
  }
};

function getFallbackChatResponse(lang: string) {
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';
  
  if (isMr) {
    return "मी सध्या तुमच्या प्रवासाची आणि खर्चाची माहिती तपासत आहे. जर काही तातडीची मदत हवी असेल, जसे की खर्च नोंदवणे किंवा वेळापत्रक तपासणे, तर तुम्ही खालील पर्यायांचा थेट वापर करू शकता.";
  } else if (isHi) {
    return "मैं वर्तमान में आपकी यात्रा और खर्चों की जानकारी की समीक्षा कर रहा हूँ। यदि आपको तत्काल सहायता की आवश्यकता है, जैसे कि खर्च दर्ज करना या शेड्यूल जांचना, तो आप सीधे नीचे दिए गए विकल्पों का उपयोग कर सकते हैं।";
  } else {
    return "I am currently reviewing your trip details and expenses. If you need immediate assistance with logging expenses, tracking transit, or checking bookings, feel free to use the quick action buttons.";
  }
}

// 1. Suggestions Endpoint
router.post('/trip-manager-suggestions', async (req, res) => {
  try {
    const { trip, weather, lang, currentDateTime } = req.body;
    
    // 1. Compute stats
    const expenses = trip?.expenses || [];
    const totalSpent = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    const budgetBase = trip?.totalBudget || 0;
    const budgetPercent = budgetBase > 0 ? (totalSpent / budgetBase) * 100 : 0;
    const itineraryCount = (trip?.itinerary || []).length;
    
    // 2. Define deterministic fallback suggestions
    const deterministicBudgetWarning = getDeterministicBudgetWarning(lang, budgetBase, totalSpent, budgetPercent);
    const fallbackSuggestions = getDeterministicFallbacks(lang, budgetPercent, totalSpent, budgetBase, itineraryCount, weather);

    // 3. Try to generate with Gemini
    const ai = getGeminiClient();
    if (!ai) {
      console.warn("Gemini client not available. Using deterministic suggestions.");
      const finalSuggestions = budgetPercent >= 80 
        ? [deterministicBudgetWarning, ...fallbackSuggestions.filter(s => s.id !== 'det-budget-warning' && s.id !== 'fallback-budget-warning')].slice(0, 3)
        : fallbackSuggestions;
      return res.json({ success: true, suggestions: finalSuggestions });
    }

    const systemInstruction = `You are a helpful, proactive Travel Manager AI for a smart group travel app.
Based on the current trip data (destination, spent budget, total budget, itinerary activities, weather conditions), generate 1 to 3 proactive, highly contextual and actionable suggestions for the group.

Each suggestion must have:
- title: Short and catchy (e.g., "☀️ Morning Sightseeing Tip" or "🌧️ Rain Alert!")
- message: Concise description (max 2 short sentences). Explain what they should do.
- type: Category of the suggestion ('budget', 'weather', 'activity', or 'booking')
- actionLabel: (Optional) Text for a button to apply this suggestion (e.g., "Add Activity" or "View Split")
- actionData: (Optional) A complete JSON object describing an activity to add to their itinerary if they tap the action button. The object must contain:
  - title: Name of the activity/action
  - datetime: ISO 8601 string for when it should happen (suggest a realistic date/time within the trip dates)
  - notes: Description/pro tips for this activity

Language: ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}. All fields in the JSON (title, message, actionLabel, actionData.title, actionData.notes) MUST be written in the specified language (using Devanagari script for Marathi and Hindi).`;

    const prompt = `Trip Destination: ${trip?.name || 'Unknown'}
Trip Dates: ${trip?.startDate || 'N/A'} to ${trip?.endDate || 'N/A'}
Total Budget: ₹${budgetBase}
Total Spent so far: ₹${totalSpent} (Spent Percentage: ${budgetPercent.toFixed(1)}%)
Number of planned activities: ${itineraryCount}
Current Weather Info: ${JSON.stringify(weather)}
Current Date/Time: ${currentDateTime || new Date().toISOString()}`;

    try {
      const response = await generateContentWithFailover(ai, {
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    message: { type: Type.STRING },
                    type: { type: Type.STRING },
                    actionLabel: { type: Type.STRING },
                    actionData: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        datetime: { type: Type.STRING },
                        notes: { type: Type.STRING }
                      }
                    }
                  },
                  required: ['title', 'message', 'type']
                }
              }
            },
            required: ['suggestions']
          }
        }
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText.trim());
      let aiSuggestions = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];

      // Clean/enrich suggestions from Gemini
      aiSuggestions = aiSuggestions.map((s: any, index: number) => ({
        id: `ai-sug-${index}-${Date.now()}`,
        ...s
      }));

      // Merge deterministic budget warning if budget spent >= 80% and AI didn't output a budget suggestion
      if (budgetPercent >= 80) {
        const hasAiBudgetSug = aiSuggestions.some((s: any) => s.type === 'budget');
        if (!hasAiBudgetSug) {
          aiSuggestions = [deterministicBudgetWarning, ...aiSuggestions];
        }
      }

      // Cap at 3 suggestions
      return res.json({ success: true, suggestions: aiSuggestions.slice(0, 3) });
    } catch (err) {
      console.error("Gemini Suggestions Generation Error:", err);
      // Fallback with deterministic warnings
      const finalSuggestions = budgetPercent >= 80 
        ? [deterministicBudgetWarning, ...fallbackSuggestions.filter(s => s.id !== 'det-budget-warning' && s.id !== 'fallback-budget-warning')].slice(0, 3)
        : fallbackSuggestions;
      return res.json({ success: true, suggestions: finalSuggestions });
    }
  } catch (error) {
    console.error("Error in trip manager suggestions endpoint:", error);
    res.status(500).json({ success: false, suggestions: [] });
  }
});

// 2. Briefing Endpoint
router.post('/trip-manager-briefing', async (req, res) => {
  try {
    const { destination, timeOfDay, bookings, weather, lang } = req.body;
    
    const fallbackText = getFallbackBriefing(lang, destination, timeOfDay);
    
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ success: true, text: fallbackText });
    }

    const prompt = `You are an elite, proactive Trip Manager AI for a travel app.
The user is traveling to: ${destination}.
Current time of day: ${timeOfDay}.
Bookings data: ${JSON.stringify(bookings)}.
Weather forecast: ${JSON.stringify(weather)}.
Language: ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}.

Draft a short, energetic, and helpful briefing message (max 3 short sentences). 
Include a quick weather tip and a reminder about their next activity if there is one. 
If Language is Marathi, respond in beautiful fluent Marathi script. If Hindi, Hindi. Otherwise English.
Keep the tone professional yet friendly.`;

    try {
      const response = await generateContentWithFailover(ai, {
        contents: prompt,
      });
      res.json({ success: true, text: response.text || fallbackText });
    } catch (err) {
      console.error('Error generating briefing from Gemini:', err);
      res.json({ success: true, text: fallbackText });
    }
  } catch (error) {
    console.error('Error in morning briefing:', error);
    res.status(500).json({ success: false, text: "Welcome to your Trip Manager! Enjoy your day." });
  }
});

// 3. Chat Endpoint
router.post('/trip-manager-chat', async (req, res) => {
  try {
    const { message, trip, history, lang } = req.body;
    
    const expenses = trip?.expenses || [];
    const totalSpent = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    const budgetBase = trip?.totalBudget || 0;
    const budgetPercent = budgetBase > 0 ? (totalSpent / budgetBase) * 100 : 0;
    const remaining = budgetBase - totalSpent;

    const fallbackText = getFallbackChatResponse(lang);

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ success: true, text: fallbackText });
    }

    const systemInstruction = `You are "Pravas Wataghati"'s elite, proactive AI Trip Manager.
You are helping a group of travelers who are currently traveling or planning a trip to: ${trip?.name || 'Destination'}.

TRIP CONTEXT:
- Destination: ${trip?.name || 'Tour'}
- Trip Dates: ${trip?.startDate || 'N/A'} to ${trip?.endDate || 'N/A'}
- Total Budget: ₹${budgetBase}
- Total Spent: ₹${totalSpent} (Spent Percentage: ${budgetPercent.toFixed(1)}%)
- Remaining Budget: ₹${remaining}
- Planned Activities: ${(trip?.itinerary || []).length} items
- Members Count: ${(trip?.members || []).length || 1} members

CRITICAL GUIDELINES:
1. RESPONSE STYLE: Keep your answers crisp, concise, highly actionable, and tailored for reading on a mobile screen during a trip. Use bullet points or bold text to emphasize actions.
2. EXPERT LOCAL KNOWLEDGE: Only suggest real-world existing hotels, transit points, attractions, restaurants, and food options. Account for actual travel times, traffic, train/flight durations.
3. LANGUAGE INTEGRITY: Respond completely and natively in the chosen language: ${lang === 'mr' ? 'Marathi (मराठी - in Devanagari script)' : lang === 'hi' ? 'Hindi (हिंदी - in Devanagari script)' : 'English'}.
4. TROUBLESHOOTING: If budget is spent >= 80% (which is currently the case if ${budgetPercent >= 80}), warn them constructively and suggest cost-saving tips. If rain or delayed activities are mentioned, instantly offer alternative plans.

Be supportive, friendly, and act as a reliable companion for their journey!`;

    // Map history to safe turns
    const contents = [];
    const safeHistory = Array.isArray(history) ? history : [];
    
    for (const h of safeHistory) {
      if (h.role && h.text) {
        contents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text }]
        });
      }
    }
    
    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    try {
      const response = await generateContentWithFailover(ai, {
        contents,
        config: {
          systemInstruction,
        }
      });
      res.json({ success: true, text: response.text || fallbackText });
    } catch (err) {
      console.error('Error generating chat from Gemini:', err);
      res.json({ success: true, text: fallbackText });
    }
  } catch (error) {
    console.error('Error in trip manager chat:', error);
    res.status(500).json({ success: false, text: "I'm having trouble connecting to my servers right now." });
  }
});

export default router;
