import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DebugErrorAlert } from '../components/ui/DebugErrorAlert';
import { 
  ArrowLeft, 
  Plane, 
  SlidersHorizontal, 
  Calendar as CalendarIcon,
  ArrowUpDown,
  Zap,
  Sunrise,
  Sunset,
  X,
  RotateCcw
} from 'lucide-react';
import { FlightResultsLoader } from '../components/flights/FlightResultsLoader';
import { FlightCard } from '../components/booking/FlightCard';
import { DateFareStrip } from '../components/flights/DateFareStrip';
import { FlightPriceCalendarModal } from '../components/flights/FlightPriceCalendarModal';
import { FlightFilterSortModal, FilterState, SortOption } from '../components/flights/FlightFilterSortModal';
import { BrandHeader } from '../components/common/BrandHeader';

export const FlightsResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { searchParams: any };
  
  const [currentSearchParams, setCurrentSearchParams] = useState<any>(state?.searchParams);
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'cheapest',
    stops: [],
    timeSlots: [],
    airlines: [],
    maxPrice: 1000000
  });

  // Sync state if navigation changes
  useEffect(() => {
    if (state?.searchParams) {
      setCurrentSearchParams(state.searchParams);
    }
  }, [state]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    fetchFlights(currentSearchParams);
  };

  const fetchFlights = async (paramsToUse?: any) => {
    const params = paramsToUse || currentSearchParams;
    if (!params) {
      setError("No search parameters provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
        if (!response.ok) {
          throw new Error(data.details || data.error || "Search failed");
        }
      } catch (e) {
        console.error("Raw Backend Response:", text);
        if (e instanceof Error && e.message !== "Unexpected token '<'" && !e.message.includes("JSON")) {
          throw e;
        }
        throw new Error("Backend returned invalid data. Check console.");
      }

      if (data.success) {
        const flightList = data.flights || [];
        setOffers(flightList);

        // Calculate max price limit from incoming offers to initialize slider
        const prices = flightList.map((f: any) => {
          const offerPrices = (f.offers || []).map((o: any) => parseFloat(o.total_amount)).filter((p: number) => !isNaN(p));
          return offerPrices.length > 0 ? Math.min(...offerPrices) : parseFloat(f.total_amount) || 0;
        }).filter((p: number) => p > 0);

        if (prices.length > 0) {
          const maxP = Math.max(...prices);
          setFilters(prev => ({
            ...prev,
            maxPrice: Math.ceil(maxP / 500) * 500
          }));
        }
      } else {
        setError(data.details || data.error || "Failed to fetch flights");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights(currentSearchParams);
  }, [currentSearchParams]);

  const handleGoBack = () => navigate(-1);

  // When user clicks another date on Date Strip or Calendar Modal
  const handleDateChange = (newDate: string) => {
    if (!newDate || newDate === currentSearchParams?.departDate) return;
    
    const updatedSlices = (currentSearchParams?.slices || []).map((s: any, idx: number) => {
      if (idx === 0) return { ...s, departure_date: newDate };
      return s;
    });

    const updatedParams = {
      ...currentSearchParams,
      departDate: newDate,
      slices: updatedSlices.length > 0 ? updatedSlices : [
        { 
          origin: currentSearchParams?.origin || 'BOM', 
          destination: currentSearchParams?.destination || 'DEL', 
          departure_date: newDate 
        }
      ]
    };

    setCurrentSearchParams(updatedParams);
  };

  // Helper extractors
  const getFlightMinPrice = (flight: any): number => {
    const offerPrices = (flight.offers || [])
      .map((o: any) => parseFloat(o.total_amount))
      .filter((p: number) => !isNaN(p) && isFinite(p));
    
    if (offerPrices.length > 0) return Math.min(...offerPrices);
    
    const topLevelPrice = parseFloat(flight.total_amount);
    return (!isNaN(topLevelPrice) && isFinite(topLevelPrice)) ? topLevelPrice : Infinity;
  };

  const getFlightDurationMinutes = (flight: any): number => {
    const firstSlice = flight?.slices?.[0];
    if (!firstSlice?.duration) return 9999;
    const match = firstSlice.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 9999;
    const hours = parseInt(match[1] || '0', 10);
    const mins = parseInt(match[2] || '0', 10);
    return hours * 60 + mins;
  };

  const getFlightDepartTime = (flight: any): number => {
    const seg = flight?.slices?.[0]?.segments?.[0];
    if (!seg?.departing_at) return 0;
    return new Date(seg.departing_at).getTime();
  };

  const getFlightArriveTime = (flight: any): number => {
    const segments = flight?.slices?.[0]?.segments || [];
    const lastSeg = segments[segments.length - 1];
    if (!lastSeg?.arriving_at) return 0;
    return new Date(lastSeg.arriving_at).getTime();
  };

  const getFlightStops = (flight: any): number => {
    const segments = flight?.slices?.[0]?.segments || [];
    return Math.max(0, segments.length - 1);
  };

  const getFlightTimeSlot = (flight: any): string => {
    const seg = flight?.slices?.[0]?.segments?.[0];
    if (!seg?.departing_at) return 'morning';
    const hour = new Date(seg.departing_at).getHours();
    if (hour < 6) return 'early_morning';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'night';
  };

  const getFlightAirlineName = (flight: any): string => {
    return flight?.slices?.[0]?.segments?.[0]?.marketing_carrier?.name || flight?.owner?.name || 'Airline';
  };

  // Derive unique airlines and prices
  const { availableAirlines, minPriceLimit, maxPriceLimit } = useMemo(() => {
    const airlineMap: { [name: string]: { code: string; name: string; logo?: string; minPrice: number } } = {};
    let minP = Infinity;
    let maxP = 0;

    offers.forEach(flight => {
      const price = getFlightMinPrice(flight);
      if (price < minP && price < 1000000) minP = price;
      if (price > maxP && price < 1000000) maxP = price;

      const carrier = flight?.slices?.[0]?.segments?.[0]?.marketing_carrier || flight?.owner || {};
      const name = carrier.name || 'Airline';
      const code = carrier.iata_code || '';
      const logo = carrier.logo_symbol_url;

      if (!airlineMap[name]) {
        airlineMap[name] = { code, name, logo, minPrice: price };
      } else if (price < airlineMap[name].minPrice) {
        airlineMap[name].minPrice = price;
      }
    });

    return {
      availableAirlines: Object.values(airlineMap),
      minPriceLimit: minP === Infinity ? 0 : minP,
      maxPriceLimit: maxP === 0 ? 50000 : maxP
    };
  }, [offers]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.stops.length > 0) count += filters.stops.length;
    if (filters.timeSlots.length > 0) count += filters.timeSlots.length;
    if (filters.airlines.length > 0) count += filters.airlines.length;
    if (filters.maxPrice < maxPriceLimit) count += 1;
    if (filters.sortBy !== 'cheapest') count += 1;
    return count;
  }, [filters, maxPriceLimit]);

  // Filter and sort offers
  const filteredAndSortedOffers = useMemo(() => {
    let list = [...offers];

    // 1. Filter: Stops
    if (filters.stops.length > 0) {
      list = list.filter(f => {
        const stops = getFlightStops(f);
        if (filters.stops.includes('0') && stops === 0) return true;
        if (filters.stops.includes('1') && stops === 1) return true;
        if (filters.stops.includes('2+') && stops >= 2) return true;
        return false;
      });
    }

    // 2. Filter: Time Slots
    if (filters.timeSlots.length > 0) {
      list = list.filter(f => {
        const slot = getFlightTimeSlot(f);
        return filters.timeSlots.includes(slot);
      });
    }

    // 3. Filter: Airlines
    if (filters.airlines.length > 0) {
      list = list.filter(f => {
        const name = getFlightAirlineName(f);
        return filters.airlines.includes(name);
      });
    }

    // 4. Filter: Max Price
    if (filters.maxPrice > 0) {
      list = list.filter(f => getFlightMinPrice(f) <= filters.maxPrice);
    }

    // 5. Sorting
    list.sort((a, b) => {
      switch (filters.sortBy) {
        case 'cheapest':
          return getFlightMinPrice(a) - getFlightMinPrice(b);
        case 'expensive':
          return getFlightMinPrice(b) - getFlightMinPrice(a);
        case 'fastest':
          return getFlightDurationMinutes(a) - getFlightDurationMinutes(b);
        case 'depart_early':
          return getFlightDepartTime(a) - getFlightDepartTime(b);
        case 'depart_late':
          return getFlightDepartTime(b) - getFlightDepartTime(a);
        case 'arrive_early':
          return getFlightArriveTime(a) - getFlightArriveTime(b);
        case 'arrive_late':
          return getFlightArriveTime(b) - getFlightArriveTime(a);
        default:
          return getFlightMinPrice(a) - getFlightMinPrice(b);
      }
    });

    return list;
  }, [offers, filters]);

  const handleResetFilters = () => {
    setFilters({
      sortBy: 'cheapest',
      stops: [],
      timeSlots: [],
      airlines: [],
      maxPrice: maxPriceLimit
    });
  };

  const handleQuickSort = (option: SortOption) => {
    setFilters(prev => ({ ...prev, sortBy: option }));
  };

  const handleQuickToggleStop = (stopVal: string) => {
    setFilters(prev => {
      const exists = prev.stops.includes(stopVal);
      const nextStops = exists ? prev.stops.filter(s => s !== stopVal) : [...prev.stops, stopVal];
      return { ...prev, stops: nextStops };
    });
  };

  // Derive origin and destination display for the header / loader
  const originCode = currentSearchParams?.slices?.[0]?.origin || currentSearchParams?.origin || 'BOM';
  const destCode = currentSearchParams?.slices?.[0]?.destination || currentSearchParams?.destination || 'DEL';
  const departDate = currentSearchParams?.slices?.[0]?.departure_date || currentSearchParams?.departDate || new Date().toISOString().split('T')[0];
  const totalPax = (currentSearchParams?.adults || 1) + (currentSearchParams?.children || 0) + (currentSearchParams?.infants || 0);

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-[Inter]">
      {/* 1. Top Brand Header */}
      <BrandHeader
        title="Flight Search Results"
        subtitle={`${originCode} ➔ ${destCode} • ${totalPax} Traveler${totalPax > 1 ? 's' : ''} • ${currentSearchParams?.cabinClass || 'Economy'}`}
        onBack={handleGoBack}
        badge={
          currentSearchParams?.tripType && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/25">
              {currentSearchParams.tripType === 'roundTrip' ? 'Round-Trip' : currentSearchParams.tripType === 'multiCity' ? 'Multi-City' : 'One-Way'}
            </span>
          )
        }
      />

      {/* 2. Date Fare Strip (Price Bar / Daily Slider) */}
      <DateFareStrip
        selectedDate={departDate}
        onSelectDate={handleDateChange}
        originCode={originCode}
        destCode={destCode}
        onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
      />

      {/* 3. Quick Filter & Sort Toolbar */}
      {!isLoading && offers.length > 0 && (
        <div className="bg-white border-b border-slate-200/80 px-3 py-2 sticky top-[58px] sm:top-[64px] z-20 shadow-2xs">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            {/* Primary Filter Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs ${
                  activeFiltersCount > 0
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white ring-2 ring-rose-400/40'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters & Sort</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-rose-600 text-[10px] font-black flex items-center justify-center ml-0.5">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Sort Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <button
                type="button"
                onClick={() => handleQuickSort('cheapest')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filters.sortBy === 'cheapest'
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white font-black shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>₹ Cheapest</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSort('fastest')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filters.sortBy === 'fastest'
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white font-black shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Fastest</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSort('depart_early')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filters.sortBy === 'depart_early'
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white font-black shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Sunrise className="w-3 h-3 text-orange-500" />
                <span>Early Depart</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickToggleStop('0')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filters.stops.includes('0')
                    ? 'bg-emerald-700 text-white font-black shadow-xs ring-1 ring-emerald-800'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>🟢 Non-Stop</span>
              </button>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 whitespace-nowrap transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 4. Main Content Results Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 min-h-0">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FlightResultsLoader 
                originCode={originCode} 
                destCode={destCode} 
                departDate={departDate}
                passengers={currentSearchParams?.adults || 1}
                cabinClass={currentSearchParams?.cabinClass || 'Economy'}
              />
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mt-10">
              <DebugErrorAlert error={error} onRetry={handleRetry} />
            </motion.div>
          ) : offers.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 text-center bg-white rounded-2xl shadow-sm border border-slate-200 max-w-xl mx-auto mt-10">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Flights Found</h3>
              <p className="text-slate-500 mb-6 text-sm">We couldn't find any flight offers for this route and date.</p>
              <button 
                onClick={() => setIsCalendarModalOpen(true)} 
                className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white px-5 py-2.5 rounded-xl font-bold hover:brightness-105 text-sm cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Check Other Dates</span>
              </button>
            </motion.div>
          ) : filteredAndSortedOffers.length === 0 ? (
            <motion.div key="no-filtered-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200 max-w-lg mx-auto mt-8 font-[Inter]">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1">No Flights Match Your Filters</h3>
              <p className="text-slate-500 text-xs mb-4">
                Try widening your price range or clearing stop / time filters to see all {offers.length} available flights.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:brightness-105 shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl w-full mx-auto pb-20 space-y-4">
              
              <div className="px-2 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Available Flights ({filteredAndSortedOffers.length})
                  </h2>
                  <p className="text-slate-500 text-xs font-semibold">
                    Sorted by <span className="font-bold text-rose-600">{
                      filters.sortBy === 'cheapest' ? 'Cheapest First' :
                      filters.sortBy === 'fastest' ? 'Fastest First' :
                      filters.sortBy === 'depart_early' ? 'Earliest Departure' :
                      filters.sortBy === 'depart_late' ? 'Latest Departure' :
                      filters.sortBy === 'arrive_early' ? 'Earliest Arrival' :
                      filters.sortBy === 'arrive_late' ? 'Latest Arrival' : 'Price: High to Low'
                    }</span> • {offers.length} total options
                  </p>
                </div>

                <button
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-rose-600" />
                  <span>Fare Calendar</span>
                </button>
              </div>

              <div className="space-y-3">
                {filteredAndSortedOffers.map((flight: any, idx: number) => {
                  const flightOffers = flight.offers || [];
                  const offerPrices = flightOffers
                    .map((o: any) => parseFloat(o.total_amount))
                    .filter((p: number) => !isNaN(p) && isFinite(p));
                  
                  let minPrice = offerPrices.length > 0 ? Math.min(...offerPrices) : null;
                  let currency = flightOffers.length > 0 ? flightOffers[0].currency : null;
                  
                  if (minPrice === null) {
                    const topLevelPrice = parseFloat(flight.total_amount);
                    if (!isNaN(topLevelPrice) && isFinite(topLevelPrice)) {
                      minPrice = topLevelPrice;
                    }
                  }
                  
                  return (
                    <FlightCard 
                      key={flight.id || idx} 
                      flight={flight}
                      minPrice={minPrice as number}
                      currency={currency}
                      onBookNow={() => navigate('/flights/fares', { state: { flight, searchParams: currentSearchParams } })} 
                    />
                  );
                })}
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Monthly Price Calendar Modal */}
      <FlightPriceCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDate={departDate}
        onSelectDate={(newDate) => {
          handleDateChange(newDate);
          setIsCalendarModalOpen(false);
        }}
        originCode={originCode}
        destCode={destCode}
      />

      {/* 6. Sort & Filter Modal / Bottom Sheet */}
      <FlightFilterSortModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        availableAirlines={availableAirlines}
        minPriceLimit={minPriceLimit}
        maxPriceLimit={maxPriceLimit}
        totalResultsCount={offers.length}
        filteredResultsCount={filteredAndSortedOffers.length}
      />
    </div>
  );
};

export default FlightsResultsPage;


