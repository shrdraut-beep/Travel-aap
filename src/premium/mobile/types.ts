import type { DateRange } from "../ui/DateRangePicker";
import type { CabinClass, TravellerCounts } from "../ui/TravellerPicker";

/** The booking verticals surfaced on the home screen. */
export type SearchMode = "flights" | "hotels" | "trains" | "buses" | "cabs" | "holidays";

export type TripType = "oneway" | "round" | "multicity";

export interface FlightLeg {
  id: string;
  origin: string;
  destination: string;
  date: Date | null;
}

export interface SearchPayload {
  mode: SearchMode;
  tripType: TripType;
  origin: string;
  destination: string;
  dates: DateRange;
  legs?: FlightLeg[];
  travellers: TravellerCounts;
  cabin: CabinClass;
  rooms: number;
}

/** Bottom navigation destinations. */
export type NavTab = "home" | "trips" | "explore" | "offers" | "account";
