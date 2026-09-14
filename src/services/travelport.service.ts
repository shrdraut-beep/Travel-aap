/**
 * Client-side Travelport & RTAIP Service API client
 */

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  cabinClass?: string;
}

export interface HotelSearchParams {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  rooms: number;
}

export const rtaipService = {
  async searchFlights(params: FlightSearchParams) {
    const res = await fetch("/api/travelport/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async priceFlight(payload: any) {
    const res = await fetch("/api/travelport/flights/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async bookFlight(payload: any) {
    const res = await fetch("/api/travelport/flights/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async searchHotels(params: HotelSearchParams) {
    const res = await fetch("/api/hotels/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async bookHotel(payload: any) {
    const res = await fetch("/api/hotels/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};

export const otaipService = rtaipService;

