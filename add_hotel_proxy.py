import sys

with open('server.ts', 'r') as f:
    content = f.read()

new_route = """
// Google Places Proxy
app.get("/api/google-places/textsearch/json", async (req, res) => {
  try {
    const query = req.query.query;
    const clientKey = req.query.key;
    const serverKey = process.env.VITE_GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_PLACES_API_KEY;
    const apiKey = clientKey || serverKey;
    
    if (!apiKey) {
      return res.status(401).json({ error: "Google Places API key missing" });
    }
    
    const targetUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`;
    const response = await axios.get(targetUrl);
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Google Places Photo Proxy
app.get("/api/google-places/photo", async (req, res) => {
  try {
    const photoRef = req.query.photo_reference;
    const clientKey = req.query.key;
    const serverKey = process.env.VITE_GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_PLACES_API_KEY;
    const apiKey = clientKey || serverKey;
    
    if (!apiKey) {
      return res.status(401).json({ error: "Google Places API key missing" });
    }
    
    const targetUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${apiKey}`;
    const response = await axios.get(targetUrl, { responseType: 'stream' });
    response.data.pipe(res);
  } catch (error: any) {
    res.status(500).json({ error: "Photo fetch failed" });
  }
});
"""

if "// Google Places Proxy" not in content:
    content = content.replace("async function startServer()", new_route + "\nasync function startServer()")
    with open('server.ts', 'w') as f:
        f.write(content)
