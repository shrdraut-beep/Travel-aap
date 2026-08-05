export interface RouteResult {
  distance: number; // in meters
  time: number; // in milliseconds
  instructions: any[];
}

export const fetchOptimizedRoute = async (points: {lat: number, lon: number}[], vehicle: string = 'driving'): Promise<RouteResult | null> => {
  try {
    // OSRM expects lon,lat separated by semicolons
    const pointsQuery = points.map(p => `${p.lon},${p.lat}`).join(';');
    // OSRM profile is usually 'driving' instead of 'car'
    const profile = vehicle === 'car' ? 'driving' : vehicle;
    
    const response = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${pointsQuery}?overview=false`);
    if (!response.ok) return null;
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      return {
        distance: data.routes[0].distance,
        time: data.routes[0].duration * 1000, // OSRM returns duration in seconds, we need ms
        instructions: [], // OSRM doesn't return instructions by default unless requested
      };
    }
    return getFallbackRoute(points);
  } catch (error: any) {
    console.warn('OSRM API notice:', error?.message || error);
    return getFallbackRoute(points);
  }
};

function getFallbackRoute(points: {lat: number, lon: number}[]): RouteResult | null {
  if (!points || points.length < 2) return null;
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

const geocodeCache: Record<string, {lat: number, lon: number} | null> = {};

export const geocodePlace = async (query: string): Promise<{lat: number, lon: number} | null> => {
  try {
    const cleanQuery = query.replace(/(day \d+|दिवस \d+:?)/gi, '').split(':')[0].trim();
    if (!cleanQuery) return null;

    const cacheKey = cleanQuery.toLowerCase();
    if (cacheKey in geocodeCache) {
      return geocodeCache[cacheKey];
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'PravasWataghatiTravelApp/1.0'
        }
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.length > 0) {
      const result = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      geocodeCache[cacheKey] = result;
      return result;
    }
    geocodeCache[cacheKey] = null;
    return null;
  } catch (err) {
    console.warn("Geocoding notice:", err);
    return null;
  }
};
