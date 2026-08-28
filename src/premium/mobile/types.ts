import type { DateRange } from "../ui/DateRangePicker";
import type { CabinClass, TravellerCounts } from "../ui/TravellerPicker";

/** The booking verticals surfaced on the home screen. */
export type SearchMode = "flights" | "hotels" | "trains" | "buses" | "cabs";

export type TripType = "oneway" | "round";

export interface SearchPayload {
  mode: SearchMode;
  tripType: TripType;
  origin: string;
  destination: string;
  dates: DateRange;
  travellers: TravellerCounts;
  cabin: CabinClass;
  rooms: number;
}

/** Bottom navigation destinations. */
export type NavTab = "home" | "trips" | "explore" | "offers" | "account";
