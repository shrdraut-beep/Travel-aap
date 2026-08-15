import re

with open("src/services/api/routing.ts", "r") as f:
    content = f.read()

new_fallback = """
async function getFallbackRoute(points: {lat: number, lon: number}[], vehicle: string): Promise<RouteResult | null> {
  if (!points || points.length < 2) return null;
  
  // Try Google Maps API as fallback
  const googleApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || 
                       (import.meta as any).env?.VITE_GOOGLE_PLACES_API_KEY || 
                       (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY;
                       
  if (googleApiKey) {
    try {
      const origin = `${points[0].lat},${points[0].lon}`;
      const dest = `${points[points.length-1].lat},${points[points.length-1].lon}`;
      const waypoints = points.slice(1, -1).map(p => `${p.lat},${p.lon}`).join('|');
      
      let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&key=${googleApiKey}`;
      if (waypoints) {
        url += `&waypoints=${waypoints}`;
      }
      
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const leg = data.routes[0].legs[0];
          return {
            distance: leg.distance.value,
            time: leg.duration.value * 1000,
            instructions: []
          };
        }
      }
    } catch (err) {
      console.warn("Google Maps fallback failed:", err);
    }
  }

  // Final fallback: straight line math
  let totalMeters = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const R = 6371000; // Earth radius in meters
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lon - p1.lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalMeters += R * c;
  }
  // Multiply by 1.3 for estimated road distance factor
  const roadMeters = Math.round(totalMeters * 1.3);
  // Estimate driving time at ~45 km/h = 12.5 m/s
  const durationMs = Math.round((roadMeters / 12.5) * 1000);
  return {
    distance: roadMeters,
    time: durationMs,
    instructions: []
  };
}
"""

content = re.sub(r'function getFallbackRoute\(points: \{lat: number, lon: number\}\[\]\): RouteResult \| null \{.*?\n\}', new_fallback, content, flags=re.DOTALL)
content = content.replace("return getFallbackRoute(points);", "return await getFallbackRoute(points, vehicle);")

with open("src/services/api/routing.ts", "w") as f:
    f.write(content)
print("Updated routing.ts")
