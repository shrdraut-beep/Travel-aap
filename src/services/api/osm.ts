export interface OSMPlace {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: string;
  distance?: number; // approx distance in meters
}

// Haversine formula
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const fetchNearbyUtilities = async (
  lat: number,
  lon: number,
  radius: number = 5000 // 5km
): Promise<{ hospitals: OSMPlace[], atms: OSMPlace[], fuel: OSMPlace[], mechanics: OSMPlace[] }> => {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
  // Query for hospitals, atms, fuel, car_repair
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="atm"](around:${radius},${lat},${lon});
      node["amenity"="fuel"](around:${radius},${lat},${lon});
      node["shop"="car_repair"](around:${radius},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: query,
    });
    if (!response.ok) throw new Error('Overpass API failed');
    const data = await response.json();

    const hospitals: OSMPlace[] = [];
    const atms: OSMPlace[] = [];
    const fuel: OSMPlace[] = [];
    const mechanics: OSMPlace[] = [];

    if (data.elements) {
      data.elements.forEach((el: any) => {
        if (el.type === 'node' && el.tags) {
          const place: OSMPlace = {
            id: el.id,
            lat: el.lat,
            lon: el.lon,
            name: el.tags.name || el.tags.operator || 'Unknown',
            type: el.tags.amenity || el.tags.shop || 'unknown',
            distance: Math.round(getDistanceFromLatLonInKm(lat, lon, el.lat, el.lon) * 1000)
          };

          if (el.tags.amenity === 'hospital') hospitals.push(place);
          else if (el.tags.amenity === 'atm') atms.push(place);
          else if (el.tags.amenity === 'fuel') fuel.push(place);
          else if (el.tags.shop === 'car_repair') mechanics.push(place);
        }
      });
    }

    // Sort by distance
    const sortByDistance = (a: OSMPlace, b: OSMPlace) => (a.distance || 0) - (b.distance || 0);

    return {
      hospitals: hospitals.sort(sortByDistance),
      atms: atms.sort(sortByDistance),
      fuel: fuel.sort(sortByDistance),
      mechanics: mechanics.sort(sortByDistance)
    };
  } catch (error) {
    console.warn('OSM Overpass API notice:', error);
    return { hospitals: [], atms: [], fuel: [], mechanics: [] };
  }
};
