/**
 * Inventory Deduplication Utility for RoutTripo Travel Platform
 * Handles smart merging and deduplication of Third-Party API results (e.g. TBO, Foursquare)
 * and Direct Vendor Registrations (Local Partners / Direct Contracts).
 * 
 * Rule 1: Merges API and Direct Vendor results.
 * Rule 2: Deduplicates based on Name normalization + Location / Coordinates / City proximity.
 * Rule 3: Priority Override - ALWAYS retains Direct Vendor inventory over API results.
 * Rule 4: Decorates direct items with 'isDirectPartner' / 'isRoutTripoVerified' flags for visual badges.
 */

export interface InventoryItem {
  id: string | number;
  name: string;
  location: string;
  city?: string;
  lat?: number;
  lng?: number;
  coordinates?: { lat: number; lng: number };
  source?: 'direct' | 'api' | 'tbo' | 'foursquare' | 'amadeus';
  isDirectPartner?: boolean;
  isRoutTripoVerified?: boolean;
  badgeText?: string;
  price?: string | number;
  rating?: string | number;
  image?: string;
  [key: string]: any;
}

/**
 * Normalizes string for fuzzy string comparison (lowercasing, removing noise words and special characters)
 */
export function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(hotel|resort|spa|suites|suite|inn|palace|grand|villas|villa|stay|cab|cabs|taxi|car|rentals|rental|by|at|and|the)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates distance in meters between two lat/lng coordinates using the Haversine formula
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Checks token overlap similarity between two normalized strings (0.0 to 1.0)
 */
export function calculateNameSimilarity(name1: string, name2: string): number {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);

  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.85;

  const tokens1 = new Set(norm1.split(' ').filter(t => t.length > 2));
  const tokens2 = new Set(norm2.split(' ').filter(t => t.length > 2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0.0;

  let intersectionCount = 0;
  tokens1.forEach(token => {
    if (tokens2.has(token)) intersectionCount++;
  });

  const unionSize = new Set([...tokens1, ...tokens2]).size;
  return intersectionCount / unionSize;
}

/**
 * Checks if two inventory items refer to the same physical property or car model
 */
export function isDuplicateInventory(itemA: InventoryItem, itemB: InventoryItem): boolean {
  const nameSim = calculateNameSimilarity(itemA.name, itemB.name);

  // If names are very dissimilar (<0.50), they are not duplicates
  if (nameSim < 0.50) return false;

  // Check 1: Geo Coordinates check (if available on both)
  const latA = itemA.lat ?? itemA.coordinates?.lat;
  const lngA = itemA.lng ?? itemA.coordinates?.lng;
  const latB = itemB.lat ?? itemB.coordinates?.lat;
  const lngB = itemB.lng ?? itemB.coordinates?.lng;

  if (latA && lngA && latB && lngB) {
    const distanceMeters = calculateDistanceMeters(latA, lngA, latB, lngB);
    // If within 500 meters and name similarity > 0.5, it's a duplicate
    if (distanceMeters <= 500 && nameSim >= 0.5) {
      return true;
    }
  }

  // Check 2: City / Location match + high name similarity (>0.75)
  const cityA = (itemA.city || itemA.location || '').toLowerCase();
  const cityB = (itemB.city || itemB.location || '').toLowerCase();

  const cityMatches = cityA.includes(cityB) || cityB.includes(cityA) || cityA === cityB;

  if (cityMatches && nameSim >= 0.70) {
    return true;
  }

  // Check 3: Almost exact name match (similarity >= 0.90)
  if (nameSim >= 0.90) {
    return true;
  }

  return false;
}

export interface SmartMergeResult<T extends InventoryItem> {
  mergedResults: T[];
  deduplicatedCount: number;
  directPartnerCount: number;
  apiCount: number;
}

/**
 * Smart Merge & Deduplication Function
 * 
 * 1. Takes apiResults and directVendorResults.
 * 2. Identifies duplicates using Name & Location / Coordinates.
 * 3. Priority Override: Direct Vendor listings overwrite and remove API listings.
 * 4. Adds 'isDirectPartner', 'isRoutTripoVerified', and 'badgeText' flags.
 */
export function mergeAndDeduplicateInventory<T extends InventoryItem>(
  apiResults: T[],
  directVendorResults: T[]
): SmartMergeResult<T> {
  // Mark direct vendor items explicitly
  const decoratedDirect: T[] = directVendorResults.map(item => ({
    ...item,
    source: item.source || 'direct',
    isDirectPartner: true,
    isRoutTripoVerified: true,
    badgeText: item.badgeText || 'RoutTripo Verified'
  }));

  // Filter API results: keep only those that DO NOT match any direct vendor item
  let deduplicatedCount = 0;
  const filteredApiResults: T[] = [];

  for (const apiItem of apiResults) {
    const isOverriddenByDirect = decoratedDirect.some(directItem =>
      isDuplicateInventory(directItem, apiItem)
    );

    if (isOverriddenByDirect) {
      deduplicatedCount++;
      console.log(`[Inventory Deduplication] Overriding API listing "${apiItem.name}" in favor of Direct Vendor Partner listing.`);
    } else {
      // Also ensure decorated API item
      filteredApiResults.push({
        ...apiItem,
        source: apiItem.source || 'api',
        isDirectPartner: false,
        isRoutTripoVerified: false
      });
    }
  }

  // Combine results with Direct Vendor items FIRST (yielding higher margins & priority)
  const mergedResults = [...decoratedDirect, ...filteredApiResults];

  return {
    mergedResults,
    deduplicatedCount,
    directPartnerCount: decoratedDirect.length,
    apiCount: filteredApiResults.length
  };
}
