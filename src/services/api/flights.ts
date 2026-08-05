export interface FlightStatus {
  callsign: string;
  origin_country: string;
  longitude: number | null;
  latitude: number | null;
  altitude: number | null;
  velocity: number | null;
  on_ground: boolean;
}

export const fetchFlightStatus = async (callsign: string): Promise<FlightStatus | null> => {
  const username = (import.meta as any).env.VITE_OPENSKY_USERNAME;
  const password = (import.meta as any).env.VITE_OPENSKY_PASSWORD;

  try {
    const headers = new Headers();
    if (username && password) {
      headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
    }
    
    // OpenSky requires callsigns to be right-padded to 8 chars sometimes, but we can try exact or fetch all and filter.
    // However, fetching all might be too large. Let's try fetching by callsign (open sky exact match requires it).
    // The easiest way is to use the flights or tracks endpoints, but the prompt says "state vectors".
    // "fetch real-time state vectors" -> /api/states/all
    
    const response = await fetch(`https://opensky-network.org/api/states/all`, { headers });
    if (!response.ok) return null;
    const data = await response.json();
    
    if (data.states && data.states.length > 0) {
      // Find the state vector with the matching callsign
      const targetCallsign = callsign.trim().toUpperCase();
      const state = data.states.find((s: any[]) => s[1] && s[1].trim().toUpperCase() === targetCallsign);
      
      if (state) {
        return {
          callsign: state[1].trim(),
          origin_country: state[2],
          longitude: state[5],
          latitude: state[6],
          altitude: state[7], // baro_altitude
          velocity: state[9],
          on_ground: state[8]
        };
      }
    }
    return null;
  } catch (error) {
    console.warn('OpenSky API notice:', error);
    return null;
  }
};
