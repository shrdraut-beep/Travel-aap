// ==========================================
// TRAVEL MODULE CONFIGURATION & ROUTING
// ==========================================
// All external bookings and partner services are coordinated natively.
// Zero affiliate tracking or external ad networks.

/**
 * Native internal flight deep link coordinator
 */
export const getFlightDeepLink = (
  origin: string,
  destination: string,
  date: string,
  adults: number = 1
): string => {
  const q = new URLSearchParams({
    origin: origin || 'BOM',
    destination: destination || 'DEL',
    date: date || '',
    adults: String(adults || 1)
  });
  return `#/flights?${q.toString()}`;
};

/**
 * Native internal hotel deep link coordinator
 */
export const getHotelDeepLink = (
  destination: string,
  checkIn: string,
  checkOut: string,
  adults: number = 1
): string => {
  const q = new URLSearchParams({
    destination: destination || 'Goa',
    checkIn: checkIn || '',
    checkOut: checkOut || '',
    adults: String(adults || 1)
  });
  return `#/hotels?${q.toString()}`;
};
