import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Plane,
  Clock,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { FlightCard } from "../../components/booking/FlightCard";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  cabinClass: string;
  tripType: "oneWay" | "roundTrip" | "multiCity";
  slices?: any[];
}

export interface FlightResultsStepProps {
  searchParams: FlightSearchParams;
  flights: any[];
  isLoading: boolean;
  provider?: string;
  onSelectFlight: (flight: any) => void;
  onBack: () => void;
  onChangeDate?: (newDate: string) => void;
}

type SortBy = "cheapest" | "fastest" | "early" | "late";

export const FlightResultsStep: React.FC<FlightResultsStepProps> = ({
  searchParams,
  flights,
  isLoading,
  provider = "Travelport TripServices (GDS/NDC)",
  onSelectFlight,
  onBack,
  onChangeDate
}) => {
  const [sortBy, setSortBy] = useState<SortBy>("cheapest");
  const [filterStops, setFilterStops] = useState<string>("all"); // 'all' | 'direct' | '1stop'
  const [selectedAirline, setSelectedAirline] = useState<string>("all");

  const org = searchParams.origin.toUpperCase();
  const dst = searchParams.destination.toUpperCase();
  const totalPax = (searchParams.adults || 1) + (searchParams.children || 0) + (searchParams.infants || 0);

  // Derive unique airlines
  const availableAirlines = useMemo(() => {
    const map = new Map<string, string>();
    flights.forEach((f) => {
      const name = f.airline || f.owner?.name || "Airline";
      const code = f.airlineCode || f.owner?.iata_code || "6E";
      map.set(name, code);
    });
    return Array.from(map.entries()).map(([name, code]) => ({ name, code }));
  }, [flights]);

  // Filtered & sorted flight list
  const filteredFlights = useMemo(() => {
    let list = [...flights];

    // Filter by stops
    if (filterStops === "direct") {
      list = list.filter((f) => (typeof f.stops === "number" ? f.stops === 0 : (f.slices?.[0]?.segments?.length || 1) === 1));
    } else if (filterStops === "1stop") {
      list = list.filter((f) => (typeof f.stops === "number" ? f.stops === 1 : (f.slices?.[0]?.segments?.length || 1) > 1));
    }

    // Filter by airline
    if (selectedAirline !== "all") {
      list = list.filter((f) => {
        const name = (f.airline || f.owner?.name || "").toLowerCase();
        return name.includes(selectedAirline.toLowerCase());
      });
    }

    // Sort
    list.sort((a, b) => {
      const priceA = a.price || a.total_amount || 0;
      const priceB = b.price || b.total_amount || 0;
      if (sortBy === "cheapest") return priceA - priceB;
      if (sortBy === "fastest") {
        const durA = parseInt(a.duration || "120", 10);
        const durB = parseInt(b.duration || "120", 10);
        return durA - durB;
      }
      return 0;
    });

    return list;
  }, [flights, filterStops, selectedAirline, sortBy]);

  // Format date display
  const formattedDate = useMemo(() => {
    try {
      const d = new Date(searchParams.departDate);
      return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    } catch {
      return searchParams.departDate;
    }
  }, [searchParams.departDate]);

  // Generate dates for Fare Calendar
  const fareCalendarDates = useMemo(() => {
    const dates = [];
    try {
      const baseDate = new Date(searchParams.departDate);
      for (let i = -3; i <= 3; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const priceOffset = Math.abs(i) * 350 + (i === 0 ? 0 : 500);
        const basePrice = 4500;
        dates.push({
          dateObj: d,
          dateStr: d.toISOString().split('T')[0],
          dayShort: d.toLocaleDateString("en-US", { weekday: 'short' }),
          dateNum: d.getDate(),
          monthShort: d.toLocaleDateString("en-US", { month: 'short' }),
          price: basePrice + priceOffset,
          isActive: i === 0
        });
      }
    } catch {
      // fallback
    }
    return dates;
  }, [searchParams.departDate]);

  return (
    <div className="min-h-screen bg-[var(--premium-page)] text-[var(--premium-ink)] pb-20">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 -ml-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center shrink-0"
              aria-label="Back to search"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
                  <span className="truncate">{org}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{dst}</span>
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--premium-violet)] text-white border border-transparent">
                  Step 1 of 6
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-600 border border-sky-100">
                  {searchParams.tripType === "roundTrip" ? "Round Trip" : searchParams.tripType === "multiCity" ? "Multi-City" : "One Way"}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {formattedDate} • {totalPax} Traveler{totalPax > 1 ? "s" : ""} • {searchParams.cabinClass}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 text-pink-700 border border-pink-100 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{provider}</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {filteredFlights.length} {filteredFlights.length === 1 ? "Flight" : "Flights"}
            </span>
          </div>
        </div>

        {/* Fare Calendar Strip */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {fareCalendarDates.map((item) => (
              <button
                key={item.dateStr}
                onClick={() => onChangeDate?.(item.dateStr)}
                className={`flex flex-col items-center justify-center min-w-[72px] p-2 rounded-xl transition-all border ${
                  item.isActive
                    ? "bg-[var(--premium-violet)] border-[var(--premium-violet)] text-white shadow-md transform scale-105"
                    : "bg-white border-slate-200 text-slate-600 hover:border-[var(--premium-violet)] hover:bg-violet-50/50"
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wide ${item.isActive ? "text-white/90" : "text-slate-400"}`}>
                  {item.dayShort}
                </span>
                <span className={`text-lg font-black leading-tight ${item.isActive ? "text-white" : "text-slate-800"}`}>
                  {item.dateNum}
                </span>
                <span className={`text-[10px] font-semibold mt-0.5 ${item.isActive ? "text-pink-300" : "text-pink-600"}`}>
                  ₹{item.price}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Filter & Sort Strip */}
        <div className="bg-slate-50 border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3 overflow-x-auto no-scrollbar text-sm">
            <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Sort
              </span>
              <button
                type="button"
                onClick={() => setSortBy("cheapest")}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  sortBy === "cheapest"
                    ? "bg-white text-[var(--premium-violet)] shadow-sm ring-1 ring-[var(--premium-violet)]"
                    : "bg-transparent text-slate-600 hover:bg-slate-200/50"
                }`}
              >
                Cheapest
              </button>
              <button
                type="button"
                onClick={() => setSortBy("fastest")}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  sortBy === "fastest"
                    ? "bg-white text-[var(--premium-violet)] shadow-sm ring-1 ring-[var(--premium-violet)]"
                    : "bg-transparent text-slate-600 hover:bg-slate-200/50"
                }`}
              >
                Fastest
              </button>
            </div>

            <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Stops</span>
              {["all", "direct", "1stop"].map((stopType) => (
                <button
                  key={stopType}
                  type="button"
                  onClick={() => setFilterStops(stopType)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all capitalize ${
                    filterStops === stopType
                      ? "bg-slate-800 text-white shadow-sm"
                      : "bg-transparent text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  {stopType === "all" ? "All" : stopType === "direct" ? "Non-stop" : "1 Stop"}
                </button>
              ))}
            </div>

            {availableAirlines.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Airline</span>
                <button
                  type="button"
                  onClick={() => setSelectedAirline("all")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    selectedAirline === "all"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "bg-transparent text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  All
                </button>
                {availableAirlines.map(({ name, code }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedAirline(name)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                      selectedAirline === name
                        ? "bg-slate-800 text-white shadow-sm"
                        : "bg-transparent text-slate-600 hover:bg-slate-200/50"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          /* Premium Animated Flight Loader */
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center overflow-hidden relative">
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-sky-50/50 opacity-50" />
              <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent -translate-y-1/2" />
              
              {/* Plane animation container */}
              <div className="relative z-10 w-full max-w-sm mx-auto h-24 mb-6">
                <div className="absolute top-1/2 left-0 w-full h-1 border-t-2 border-dashed border-slate-200 -translate-y-1/2" />
                <div className="absolute top-1/2 left-0 w-3 h-3 rounded-full bg-slate-300 -translate-y-1/2 -translate-x-1.5" />
                <div className="absolute top-1/2 right-0 w-3 h-3 rounded-full bg-slate-300 -translate-y-1/2 translate-x-1.5" />
                
                {/* The plane */}
                <div className="absolute top-1/2 -translate-y-1/2 animate-[flyPlane_3s_ease-in-out_infinite] flex items-center justify-center">
                  <div className="bg-white p-3 rounded-full shadow-lg text-[var(--premium-violet)] border border-slate-100 relative">
                    <div className="absolute inset-0 rounded-full animate-ping bg-violet-100 opacity-50" />
                    <Plane className="w-8 h-8 relative z-10" />
                  </div>
                </div>
                
                <style>{`
                  @keyframes flyPlane {
                    0% { left: 0%; transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
                    15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { left: 100%; transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
                  }
                `}</style>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
                Finding the best flights
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-2">Searching {org} to {dst}...</span>
              </div>
            </div>

            {/* Skeleton Cards */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-24 bg-slate-200 rounded" />
                      <div className="h-3 w-16 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-slate-200 rounded-lg" />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center pt-2">
                  <div>
                    <div className="h-6 w-20 bg-slate-200 rounded mb-1" />
                    <div className="h-3 w-14 bg-slate-100 rounded" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-16 bg-slate-100 rounded mb-1.5" />
                    <div className="w-full h-1 bg-slate-200 rounded" />
                    <div className="h-2 w-12 bg-slate-100 rounded mt-1.5" />
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="h-6 w-20 bg-slate-200 rounded mb-1" />
                    <div className="h-3 w-14 bg-slate-100 rounded" />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <div className="h-4 w-28 bg-slate-100 rounded" />
                  <div className="h-9 w-28 bg-slate-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredFlights.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs max-w-md mx-auto my-12">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Flights Match Your Filters</h3>
            <p className="text-sm text-slate-500 mb-6">
              Try resetting the stops or airline filter, or choose an alternate date to see available flights.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setFilterStops("all");
                  setSelectedAirline("all");
                }}
                className="w-full py-2.5 px-4 bg-[var(--premium-violet)] text-white font-bold rounded-xl text-sm shadow-xs hover:opacity-90"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={onBack}
                className="w-full py-2.5 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200"
              >
                Modify Search
              </button>
            </div>
          </div>
        ) : (
          /* Real Flight Cards */
          <div className="space-y-4">
            {filteredFlights.map((flight, idx) => (
              <FlightCard
                key={flight.id || idx}
                flight={flight}
                passengerCount={totalPax}
                onBookNow={() => onSelectFlight(flight)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
