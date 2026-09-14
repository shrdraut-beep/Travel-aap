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
  // Always use the secure backend proxy to avoid exposing API keys on the client
  try {
    const adbRes = await fetch(`/api/public-apis/flight-status?flightNumber=${encodeURIComponent(callsign)}`);
    if (adbRes.ok) {
      const adbData = await adbRes.json();
      if (adbData.success && adbData.flight) {
        return {
          callsign: adbData.flight.number,
          origin_country: adbData.flight.departure?.airport || "Origin Airport",
          longitude: adbData.flight.longitude || 72.8777,
          latitude: adbData.flight.latitude || 19.0760,
          altitude: adbData.flight.altitude || 10600,
          velocity: adbData.flight.speed || 233,
          on_ground: adbData.flight.status === "Arrived"
        };
      }
    }
  } catch (err) {
    console.error('Backend Flight API error:', err);
  }

  return null;
};
