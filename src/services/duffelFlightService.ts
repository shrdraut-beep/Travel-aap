import { FlightOption } from '../components/travel/api';
import { getFullStationDetails } from './travelTimeService';

export interface DuffelSearchParams {
  origin: string;
  destination: string;
  departDate?: string;
  date?: string;
  adults?: number;
  cabinClass?: string;
  limit?: number;
}

/**
 * Constructs standard partner search URL for flight booking
 */
export function constructMakeMyTripPartnerUrl(
  origin: string,
  destination: string,
  date?: string
): string {
  const originCode = (origin || 'BOM').trim().toUpperCase().slice(0, 3);
  const destCode = (destination || 'DEL').trim().toUpperCase().slice(0, 3);
  const depDate = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  return `https://www.makemytrip.com/flight/search?itinerary=${originCode}-${destCode}-${depDate}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=E`;
}

/**
 * Formats Duffel ISO 8601 duration (e.g., "PT2H15M") into human readable "2h 15m"
 */
export function formatDuffelDuration(isoDuration?: string): string {
  if (!isoDuration) return '2h 15m';
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (match) {
    const hours = match[1] ? `${match[1]}h` : '';
    const mins = match[2] ? `${match[2]}m` : '';
    return `${hours} ${mins}`.trim() || isoDuration;
  }
  return isoDuration.replace('PT', '').toLowerCase();
}

/**
 * Formats Duffel ISO timestamp (e.g., "2026-08-15T08:30:00") to "08:30 AM"
 */
export function formatDuffelTime(isoStr?: string): string {
  if (!isoStr) return '08:30 AM';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) {
      const parts = isoStr.split('T');
      if (parts[1]) return parts[1].slice(0, 5);
      return isoStr;
    }
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return isoStr;
  }
}

/**
 * Duffel API Flight Search Service
 * Endpoint: https://api.duffel.com/air/offer_requests?return_offers=true
 * Header: Duffel-Version: v1 (or v2)
 * Authorization is handled securely on the backend server.
 */
export async function fetchDuffelFlights(
  params: DuffelSearchParams | string,
  destinationCode?: string,
  travelDate?: string
): Promise<FlightOption[]> {
  let origin = 'BOM';
  let destination = 'DEL';
  let date = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  let adults = 1;
  let cabinClass = 'economy';

  if (typeof params === 'object') {
    origin = params.origin || 'BOM';
    destination = params.destination || 'DEL';
    date = params.departDate || params.date || date;
    adults = Math.max(1, params.adults || 1);
    cabinClass = params.cabinClass || 'economy';
  } else {
    origin = params || 'BOM';
    destination = destinationCode || 'DEL';
    date = travelDate || date;
  }

  const originCode = origin.trim().toUpperCase().slice(0, 3);
  const destCode = destination.trim().toUpperCase().slice(0, 3);
  const cleanDate = (date || '').split('T')[0].trim() || new Date(Date.now() + 86400000).toISOString().split('T')[0];

  try {
    const serverRes = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: originCode,
        destination: destCode,
        departDate: cleanDate,
        adults: adults,
        cabinClass: cabinClass
      })
    });
    const data = await serverRes.json();
    if (data.success && Array.isArray(data.flights)) {
      return data.flights;
    }
  } catch (err) {
    console.error("Flight search error:", err);
  }

  return [];
}

/**
 * Maps raw Duffel offer objects to standard FlightOption models
 */
export function mapDuffelOffersToFlightOptions(
  offers: any[],
  originCode: string,
  destCode: string,
  formattedDate: string,
  deepLink: string = ''
): FlightOption[] {
  return offers.map((offer: any, idx: number) => {
    const slice = offer.slices?.[0] || {};
    const segments = slice.segments || [];
    const firstSeg = segments[0] || {};
    const lastSeg = segments[segments.length - 1] || firstSeg;

    const owner = offer.owner || {};
    const marketingCarrier = firstSeg.marketing_carrier || owner;
    const operatingCarrier = firstSeg.operating_carrier || owner;

    const airlineName =
      owner.name ||
      marketingCarrier.name ||
      operatingCarrier.name ||
      'Commercial Airline';

    const airlineCode = (
      owner.iata_code ||
      marketingCarrier.iata_code ||
      operatingCarrier.iata_code ||
      '6E'
    ).toUpperCase();

    const flightNumber =
      firstSeg.marketing_carrier_flight_number
        ? `${airlineCode}-${firstSeg.marketing_carrier_flight_number.replace(/^[A-Z0-9]+-?/i, '')}`
        : `${airlineCode}-${100 + idx * 12}`;

    const departureTime = formatDuffelTime(firstSeg.departing_at);
    const arrivalTime = formatDuffelTime(lastSeg.arriving_at);
    const departureDate = firstSeg.departing_at ? firstSeg.departing_at.split('T')[0] : formattedDate;
    const arrivalDate = lastSeg.arriving_at ? lastSeg.arriving_at.split('T')[0] : formattedDate;

    const duration = formatDuffelDuration(slice.duration);
    const isDirect = segments.length <= 1;
    const stopsCount = Math.max(0, segments.length - 1);

    const price = parseFloat(offer.total_amount || '0') || 0;
    const currency = (offer.total_currency || 'INR').toUpperCase();

    const logoUrl =
      owner.logo_symbol_url ||
      marketingCarrier.logo_symbol_url ||
      '';

    const origCodeVal = (firstSeg.origin?.iata_code || originCode).toUpperCase();
    const destCodeVal = (lastSeg.destination?.iata_code || destCode).toUpperCase();
    const origDet = getFullStationDetails(origCodeVal);
    const destDet = getFullStationDetails(destCodeVal);

    return {
      id: offer.id ? `duffel_${offer.id}` : `duffel_off_${idx}_${Date.now()}`,
      airline: airlineName,
      airlineCode: airlineCode,
      logo: logoUrl,
      flightNumber,
      departureTime,
      arrivalTime,
      departureDate,
      arrivalDate,
      originCode: origCodeVal,
      destinationCode: destCodeVal,
      originFullName: origDet.fullName,
      destinationFullName: destDet.fullName,
      duration,
      direct: isDirect,
      stops: stopsCount,
      price,
      currency,
      cabinClass: 'Economy',
      provider: 'Duffel Live Flight API',
      deepLink: deepLink || '',
    };
  });
}

// Alias fetchCachedFlights for compatibility
export const fetchCachedFlights = fetchDuffelFlights;
