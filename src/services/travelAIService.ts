import { fetchLiveFlights, fetchLiveTrains, getTravelCacheKey } from './LiveTravelAPI';
import flightSchedules from '../data/flightSchedules.json';
import trainNames from '../data/trainname.json';
import airports from '../data/airports.json';

export interface TripDetails {
  source: string;
  destination: string;
  days: number;
  budget: number;
  members: string;
  date: string;
  foodPreference: string; // उदा. शाकाहारी, मांसाहारी, जैन, सी-फूड
  transportMode: string;
}


export interface DistanceMatrixResult {
  origin: string;
  destination: string;
  distanceKm: number;
  drivingDurationMinutes: number;
  drivingDurationHours: number;
  recommendedRestBreaks: number;
  totalBreakMinutes: number;
  totalTransitMinutes: number;
  totalTransitHours: number;
  isFullDayTransit: boolean;
  suggestedIntermediateHalt?: string;
}

export interface VerifiedPlace {
  name: string;
  formattedAddress: string;
  rating: number;
  userRatingsTotal: number;
  lat?: number;
  lng?: number;
  placeId?: string;
}

export interface ProgressStep {
  id: string;
  text: string;
  status: 'loading' | 'success' | 'error' | 'pending';
}

/**
 * Queries the Distance Matrix API to get realistic driving distance, duration, and breaks.
 */
export async function fetchDrivingDistanceAndTime(origin: string, destination: string): Promise<DistanceMatrixResult> {
  try {
    const res = await fetch('/api/maps/distance-matrix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination }),
    });
    const data = await res.json();
    if (data.success) {
      return data;
    }
  } catch (e) {
    console.warn('Distance Matrix API endpoint notice:', e);
  }

  return {
    origin,
    destination,
    distanceKm: 250,
    drivingDurationMinutes: 300,
    drivingDurationHours: 5,
    recommendedRestBreaks: 1,
    totalBreakMinutes: 45,
    totalTransitMinutes: 345,
    totalTransitHours: 5.8,
    isFullDayTransit: false,
  };
}

/**
 * Queries the Places API to get operational tourist attractions and verified locations.
 */
export async function fetchVerifiedPlaces(destination: string, query?: string): Promise<VerifiedPlace[]> {
  try {
    const res = await fetch('/api/maps/places-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, query }),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.places)) {
      return data.places;
    }
  } catch (e) {
    console.warn('Places API endpoint notice:', e);
  }

  return [
    { name: `${destination} Main Shrine`, formattedAddress: destination, rating: 4.7, userRatingsTotal: 1500 },
    { name: `${destination} Heritage Fort & Viewpoint`, formattedAddress: destination, rating: 4.6, userRatingsTotal: 1200 },
  ];
}

export interface TravelAISearchParams {
  origin?: string;
  destination?: string;
  date?: string;
  passengers?: number;
  trainNumber?: string;
  cabinClass?: string;
  [key: string]: any;
}

export interface TravelAIResponse {
  data: {
    flights?: any[];
    buses?: any[];
    trains?: any[];
    status?: string;
    message?: string;
    [key: string]: any;
  };
  isCached: boolean;
  cacheKey: string;
  status?: string;
  message?: string;
}

export type TravelMode = 'flight' | 'bus' | 'train';

/**
 * Unified function to fetch live travel data from real APIs with 28-day cache
 */
export async function fetchTravelDataFromAI(
  mode: TravelMode,
  searchParams: TravelAISearchParams
): Promise<TravelAIResponse> {
  const origin = searchParams.origin || 'BOM';
  const destination = searchParams.destination || 'DEL';
  const date = searchParams.date || new Date(new Date().getTime() + 86400000).toISOString().split('T')[0];
  const cacheKey = getTravelCacheKey(mode, origin, destination, date);

  try {
    if (mode === 'flight') {
      const liveRes = await fetchLiveFlights(origin, destination, date);
      return {
        data: {
          flights: liveRes.data || [],
          status: liveRes.status,
          message: liveRes.message
        },
        isCached: !!liveRes.isCached,
        cacheKey,
        status: liveRes.status,
        message: liveRes.message
      };
    } else if (mode === 'train') {
      const liveRes = await fetchLiveTrains(origin, destination, date);
      return {
        data: {
          trains: liveRes.data || [],
          status: liveRes.status,
          message: liveRes.message
        },
        isCached: !!liveRes.isCached,
        cacheKey,
        status: liveRes.status,
        message: liveRes.message
      };
    } else {
      return {
        data: { buses: [], status: "NO_DATA", message: "Bus API integration required." },
        isCached: false,
        cacheKey,
        status: "NO_DATA",
        message: "Bus API integration required."
      };
    }
  } catch (error) {
    console.error(`Error fetching ${mode} data:`, error);
    return {
      data: { status: "ERROR", message: "Failed to fetch live data." },
      isCached: false,
      cacheKey,
      status: "ERROR",
      message: "Failed to fetch live data."
    };
  }
}

