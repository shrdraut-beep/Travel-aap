import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/trip-manager-briefing', async (req, res) => {
  try {
    const { destination, timeOfDay, bookings, weather, lang } = req.body;
    
    const prompt = `You are an elite, proactive Trip Manager AI for a travel app.
The user is traveling to: ${destination}.
Current time of day: ${timeOfDay}.
Bookings data: ${JSON.stringify(bookings)}.
Weather forecast: ${JSON.stringify(weather)}.
Language: ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}.

Draft a short, energetic, and helpful "Daily Morning/Afternoon/Evening Briefing" message (max 3 short sentences). 
Include a quick weather tip and a reminder about their next activity if there is one. 
Keep the tone professional yet friendly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    res.json({ success: true, text: response.text });
  } catch (error) {
    console.error('Error generating morning briefing:', error);
    res.status(500).json({ success: false, text: "Welcome to your Trip Manager! Enjoy your day." });
  }
});


router.post('/trip-manager-chat', async (req, res) => {
  try {
    const { message, trip, history, lang } = req.body;
    
    const prompt = `You are an elite, proactive Trip Manager AI for a travel app.
The user is traveling to: ${trip?.name}.
User's message: ${message}
Chat history: ${JSON.stringify(history)}
Language: ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}.

Respond directly to the user's message as a helpful trip manager. Provide advice, schedule checks, or tips. Keep it concise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    res.json({ success: true, text: response.text });
  } catch (error) {
    console.error('Error generating trip manager chat:', error);
    res.status(500).json({ success: false, text: "I'm having trouble connecting to my servers right now." });
  }
});

export default router;
