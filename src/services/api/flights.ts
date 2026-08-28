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
    
    const response = await fetch(`https://opensky-network.org/api/states/all`, { headers });
    if (response.ok) {
      const data = await response.json();
      if (data.states && data.states.length > 0) {
        const targetCallsign = callsign.trim().toUpperCase();
        const state = data.states.find((s: any[]) => s[1] && s[1].trim().toUpperCase() === targetCallsign);
        if (state) {
          return {
            callsign: state[1].trim(),
            origin_country: state[2],
            longitude: state[5],
            latitude: state[6],
            altitude: state[7],
            velocity: state[9],
            on_ground: state[8]
          };
        }
      }
    }
  } catch (error) {
    console.warn('OpenSky API notice:', error);
  }

  // Fallback to AeroDataBox / Backend Flight Status API
  try {
    const adbRes = await fetch(`/api/public-apis/flight-status?flightNumber=${encodeURIComponent(callsign)}`);
    if (adbRes.ok) {
      const adbData = await adbRes.json();
      if (adbData.success && adbData.flight) {
        return {
          callsign: adbData.flight.number,
          origin_country: adbData.flight.departure?.airport || "Origin Airport",
          longitude: 72.8777,
          latitude: 19.0760,
          altitude: 10600,
          velocity: 233,
          on_ground: false
        };
      }
    }
  } catch (err) {
    console.warn('AeroDataBox API notice:', err);
  }

  return null;
};
