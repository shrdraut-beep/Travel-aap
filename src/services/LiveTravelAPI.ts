/**
 * LiveTravelAPI Service
 * Professional Live Travel API integration module for Flights & Trains
 * Standardized structure ready for RapidAPI (Skyscanner, Amadeus, IRCTC Live API)
 * Incorporates 28-Day (4-Week) Local Cache for real API data.
 */

export interface LiveTravelResult<T = any> {
  status: "SUCCESS" | "PENDING_API_INTEGRATION" | "ERROR";
  message: string;
  data?: T;
  isCached?: boolean;
  cacheKey?: string;
}

export type TravelMode = 'flight' | 'train' | 'bus';

const TWENTY_EIGHT_DAYS_MS = 28 * 24 * 60 * 60 * 1000;

/**
 * Generate 28-day cache key for live route queries
 */
export function getTravelCacheKey(mode: TravelMode, origin: string, destination: string, date: string): string {
  const oKey = (origin || 'any').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const dKey = (destination || 'any').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const dateKey = (date || 'any').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `live_travel_${mode}_${oKey}_${dKey}_${dateKey}`;
}

/**
 * Save real live travel API data into the 28-day local cache
 */
export function cacheLiveTravelData(cacheKey: string, data: any): void {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch (err) {
    console.warn("[LiveTravelAPI] Failed to store live travel cache:", err);
  }
}

/**
 * Live Flight API fetcher (Ready for Skyscanner / Amadeus / RapidAPI)
 * Strictly zero hallucinated AI generation & zero old CSV/JSON fallbacks.
 */
export async function fetchLiveFlights(
  origin: string,
  destination: string,
  date: string
): Promise<LiveTravelResult<any[]>> {
  const cacheKey = getTravelCacheKey('flight', origin, destination, date);

  // 1. Check 28-Day Cache for real saved API data
  try {
    const cachedStr = localStorage.getItem(cacheKey);
    if (cachedStr) {
      const cacheObj = JSON.parse(cachedStr);
      const age = Date.now() - (Number(cacheObj.timestamp) || 0);
      if (age < TWENTY_EIGHT_DAYS_MS && Array.isArray(cacheObj.data) && cacheObj.data.length > 0) {
        return {
          status: "SUCCESS",
          message: "Cached Live Flight Schedule",
          data: cacheObj.data,
          isCached: true,
          cacheKey
        };
      }
    }
  } catch (e) {
    console.warn("[LiveTravelAPI] Cache lookup note:", e);
  }

  // 2. Real API fetch attempt (e.g. Duffel / RapidAPI proxy)
  const flightUrl = "/api/search-flights";
  try {
    const res = await fetch(flightUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination, date })
    });
    if (res.status === 429) {
      console.error("API Rate Limit Hit for:", flightUrl);
    }
    const json = await res.json().catch(() => ({}));
    if (res.ok && json?.success && Array.isArray(json.flights) && json.flights.length > 0) {
      cacheLiveTravelData(cacheKey, json.flights);
      return {
        status: "SUCCESS",
        message: "Live flights loaded from Live API",
        data: json.flights,
        isCached: false,
        cacheKey
      };
    }
  } catch (err) {
    console.error("API Rate Limit Hit for:", flightUrl, err);
  }

  // 3. Return hardcoded state when real API is pending integration
  return {
    status: "PENDING_API_INTEGRATION",
    message: "लाईव्ह डेटा आणण्यासाठी कृपया खऱ्या API (उदा. RapidAPI) शी कनेक्ट करा.",
    data: []
  };
}

/**
 * Live Train API fetcher (Ready for IRCTC RapidAPI)
 * Strictly zero hallucinated AI generation & zero old CSV/JSON fallbacks.
 */
export async function fetchLiveTrains(
  origin: string,
  destination: string,
  date: string
): Promise<LiveTravelResult<any[]>> {
  const cacheKey = getTravelCacheKey('train', origin, destination, date);

  // 1. Check 28-Day Cache for real saved API data
  try {
    const cachedStr = localStorage.getItem(cacheKey);
    if (cachedStr) {
      const cacheObj = JSON.parse(cachedStr);
      const age = Date.now() - (Number(cacheObj.timestamp) || 0);
      if (age < TWENTY_EIGHT_DAYS_MS && Array.isArray(cacheObj.data) && cacheObj.data.length > 0) {
        return {
          status: "SUCCESS",
          message: "Cached Live Train Schedule",
          data: cacheObj.data,
          isCached: true,
          cacheKey
        };
      }
    }
  } catch (e) {
    console.warn("[LiveTravelAPI] Cache lookup note:", e);
  }

  // 2. Real API fetch attempt via live train status or station search
  const trainUrl = "/api/train-status";
  try {
    const res = await fetch(trainUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination, date, trainNumber: origin })
    });
    if (res.status === 429) {
      console.error("API Rate Limit Hit for:", trainUrl);
    }
    const json = await res.json().catch(() => ({}));
    if (res.ok && json?.success && json.data) {
      const trainArray = Array.isArray(json.data) ? json.data : [json.data];
      cacheLiveTravelData(cacheKey, trainArray);
      return {
        status: "SUCCESS",
        message: "Live train status loaded from Live API",
        data: trainArray,
        isCached: false,
        cacheKey
      };
    }
  } catch (err) {
    console.error("API Rate Limit Hit for:", trainUrl, err);
  }

  // 3. Return hardcoded state when real API is pending integration
  return {
    status: "PENDING_API_INTEGRATION",
    message: "लाईव्ह डेटा आणण्यासाठी कृपया खऱ्या API (उदा. RapidAPI) शी कनेक्ट करा.",
    data: []
  };
}
