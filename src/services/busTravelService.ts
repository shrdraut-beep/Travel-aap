/**
 * Comprehensive Intercity Bus & Travel Service
 * Provides seamless integration for Bus search, seat layouts, boarding points, and instant booking.
 */

export interface BusSearchParams {
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
  passengers?: number;
  busType?: string;
}

export interface BusPassenger {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  seatNumber?: string;
  contactNo?: string;
  email?: string;
}

export async function searchBuses(params: BusSearchParams) {
  try {
    const res = await fetch('/api/buses/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: params.origin,
        destination: params.destination,
        date: params.date,
        passengers: params.passengers || 1,
        busType: params.busType
      })
    });
    const data = await res.json();
    return data.buses || [];
  } catch (err) {
    console.error('[Bus Service] Search error:', err);
    return [];
  }
}

export async function getBusSeatLayout(busId: string, searchTokenId?: string) {
  try {
    const res = await fetch('/api/buses/seatlayout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ busId, searchTokenId })
    });
    return await res.json();
  } catch (err) {
    console.error('[Bus Service] Seat layout error:', err);
    return null;
  }
}

export async function getBusBoardingPoints(busId: string, searchTokenId?: string) {
  try {
    const res = await fetch('/api/buses/boardingpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ busId, searchTokenId })
    });
    return await res.json();
  } catch (err) {
    console.error('[Bus Service] Boarding point error:', err);
    return null;
  }
}

export async function bookBus(bookingParams: {
  busId: string;
  searchTokenId?: string;
  boardingPointId?: string;
  droppingPointId?: string;
  passengers: BusPassenger[];
  selectedSeats?: string[];
}) {
  try {
    const res = await fetch('/api/buses/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingParams)
    });
    return await res.json();
  } catch (err) {
    console.error('[Bus Service] Booking error:', err);
    return null;
  }
}
