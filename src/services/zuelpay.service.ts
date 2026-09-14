/**
 * Frontend Client for ZuelPay Unified Travel API
 * Connects frontend components to server-side ZuelPay endpoints for:
 * - Train (Search & PNR)
 * - Bus (Search & Seat Layout)
 * - Car / Cabs (Search & Quote)
 */

export interface TrainSearchParams {
  origin: string;
  destination: string;
  date: string;
  quota?: string;
  classType?: string;
}

export interface BusSearchParams {
  origin: string;
  destination: string;
  date: string;
  busType?: string;
  passengers?: number;
}

export interface CarSearchParams {
  origin: string;
  destination?: string;
  pickupDate: string;
  dropDate?: string;
  cabType?: "regular" | "rental" | "outstation" | "airport";
  vehicleCategory?: "hatchback" | "sedan" | "suv" | "traveller";
  hours?: number;
}

export const zuelpayClient = {
  /**
   * Check ZuelPay API status
   */
  async getStatus() {
    try {
      const res = await fetch("/api/zuelpay/status");
      return await res.json();
    } catch {
      return { success: false, configured: false };
    }
  },

  /**
   * Search Trains via ZuelPay
   */
  async searchTrains(params: TrainSearchParams) {
    const res = await fetch("/api/zuelpay/trains/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return await res.json();
  },

  /**
   * Check IRCTC Train PNR Status
   */
  async checkPnr(pnr: string) {
    const res = await fetch(`/api/zuelpay/trains/pnr/${encodeURIComponent(pnr)}`);
    return await res.json();
  },

  /**
   * Search Buses via ZuelPay
   */
  async searchBuses(params: BusSearchParams) {
    const res = await fetch("/api/zuelpay/buses/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return await res.json();
  },

  /**
   * Get Bus Seat Layout
   */
  async getBusSeatLayout(busId: string) {
    const res = await fetch("/api/zuelpay/buses/seatlayout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ busId }),
    });
    return await res.json();
  },

  /**
   * Search Cars & Cabs via ZuelPay
   */
  async searchCars(params: CarSearchParams) {
    const res = await fetch("/api/zuelpay/cars/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return await res.json();
  },
};
