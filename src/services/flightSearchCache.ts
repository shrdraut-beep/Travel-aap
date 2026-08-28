export interface CachedSearchResults {
  timestamp: number;
  flights: any[];
  searchParams: any;
}

const CACHE_PREFIX = 'routripo_flight_cache_';
const LAST_SEARCH_KEY = 'routripo_last_flight_search_params';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

// In-memory cache map for instant access
const memoryCache = new Map<string, CachedSearchResults>();

/**
 * Generates a unique, deterministic cache key from flight search parameters
 */
export function getFlightSearchCacheKey(params: any): string {
  if (!params) return 'default_search';
  const origin = (params.origin || params.slices?.[0]?.origin || 'BOM').trim().toUpperCase();
  const destination = (params.destination || params.slices?.[0]?.destination || 'DEL').trim().toUpperCase();
  const departDate = params.departDate || params.slices?.[0]?.departure_date || 'default_date';
  const returnDate = params.returnDate || params.slices?.[1]?.departure_date || '';
  const tripType = params.tripType || 'oneWay';
  const adults = params.adults ?? 1;
  const children = params.children ?? 0;
  const infants = params.infants ?? 0;
  const cabinClass = params.cabinClass || 'Economy';

  return `${CACHE_PREFIX}${tripType}_${origin}_${destination}_${departDate}_${returnDate}_${adults}_${children}_${infants}_${cabinClass}`;
}

/**
 * Save search parameters into sessionStorage for back-navigation recovery
 */
export function saveLastSearchParams(params: any): void {
  if (!params) return;
  try {
    sessionStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(params));
  } catch (e) {
    console.warn('Failed to save search params to sessionStorage:', e);
  }
}

/**
 * Retrieve last search parameters from sessionStorage if location.state is missing
 */
export function getLastSearchParams(): any | null {
  try {
    const raw = sessionStorage.getItem(LAST_SEARCH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Failed to parse last search params:', e);
    return null;
  }
}

/**
 * Retrieve cached flight search results for given params if available and not expired
 */
export function getCachedFlightResults(params: any): { flights: any[]; timestamp: number } | null {
  const key = getFlightSearchCacheKey(params);

  // 1. Check in-memory cache
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key)!;
    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return { flights: entry.flights, timestamp: entry.timestamp };
    } else {
      memoryCache.delete(key);
    }
  }

  // 2. Check sessionStorage
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const entry: CachedSearchResults = JSON.parse(raw);
      if (entry && Array.isArray(entry.flights) && entry.flights.length > 0 && (Date.now() - entry.timestamp < CACHE_TTL_MS)) {
        // Hydrate memory cache
        memoryCache.set(key, entry);
        return { flights: entry.flights, timestamp: entry.timestamp };
      } else if (entry) {
        sessionStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn('Failed to read flight cache from sessionStorage:', e);
  }

  return null;
}

/**
 * Store flight search results in local cache (memory + sessionStorage)
 */
export function setCachedFlightResults(params: any, flights: any[]): void {
  if (!params || !Array.isArray(flights)) return;
  const key = getFlightSearchCacheKey(params);
  const entry: CachedSearchResults = {
    timestamp: Date.now(),
    flights,
    searchParams: params
  };

  memoryCache.set(key, entry);
  saveLastSearchParams(params);

  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    console.warn('Failed to write flight cache to sessionStorage:', e);
  }
}

/**
 * Clear cached flight search results (e.g., when user forces a refresh)
 */
export function clearFlightSearchCache(params?: any): void {
  if (params) {
    const key = getFlightSearchCacheKey(params);
    memoryCache.delete(key);
    try {
      sessionStorage.removeItem(key);
    } catch (e) {}
  } else {
    memoryCache.clear();
  }
}
