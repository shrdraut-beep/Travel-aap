import { generateSecureId } from '../../src/utils/security';

// Mock vendor database with their operational coordinates
export const mockVendors = [
  { id: 'v-101', name: 'Goa Cabs', lat: 15.5494, lng: 73.7538, radiusKm: 10 }, // Baga
  { id: 'v-102', name: 'Panjim Stays', lat: 15.4909, lng: 73.8278, radiusKm: 15 },
  { id: 'v-103', name: 'North Goa Tours', lat: 15.5921, lng: 73.7441, radiusKm: 10 }
];

/**
 * Task 1: Micro-Location Smart Routing
 * Converts landmark string to Lat-Long without GPS permissions.
 * In a real environment, this calls Google Places API or GraphHopper.
 */
export async function geocodeLandmark(landmark: string): Promise<{ lat: number, lng: number } | null> {
  // Mock Geocoding
  if (landmark.toLowerCase().includes('baga') || landmark.toLowerCase().includes('goa')) {
    return { lat: 15.5494, lng: 73.7538 }; // Baga Beach
  }
  if (landmark.toLowerCase().includes('mumbai')) {
    return { lat: 19.0760, lng: 72.8777 };
  }
  // Default mock fallback
  return { lat: 20.5937, lng: 78.9629 };
}

/**
 * Haversine formula to calculate distance between two coordinates
 */
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Finds vendors within a strict 5 km radius using MongoDB $near or Haversine equivalent.
 */
export async function findVendorsInRadius(lat: number, lng: number, maxRadiusKm: number = 5) {
  // MongoDB $near mock logic
  return mockVendors.filter(vendor => {
    const distance = getDistanceFromLatLonInKm(lat, lng, vendor.lat, vendor.lng);
    return distance <= maxRadiusKm;
  });
}

/**
 * Sends targeted push alerts via Firebase/FCM to micro-localized vendors.
 */
export async function sendTargetedAlerts(vendorIds: string[], tripReqId: string, origin: string) {
  // Mock FCM batching
  console.log(`[FCM Targeted Alert] Sent push notification for Trip ${tripReqId} to micro-localized vendors: ${vendorIds.join(', ')}`);
  console.log(`[Alert Details] "New lead near ${origin} within 5km radius!"`);
}
