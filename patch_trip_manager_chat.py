import re

with open("server/routes/tripManager.ts", "r") as f:
    content = f.read()

chat_endpoint = """
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
"""

if "/trip-manager-chat" not in content:
    content = content.replace("export default router;", chat_endpoint + "\nexport default router;")

with open("server/routes/tripManager.ts", "w") as f:
    f.write(content)

