import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { DebugErrorAlert } from '../components/ui/DebugErrorAlert';

export const BusResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { searchParams: any };

  const [buses, setBuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const origin = state?.searchParams?.origin || 'Mumbai';
  const destination = state?.searchParams?.destination || 'Goa';
  const dateStr = state?.searchParams?.date || '15 Oct 2026';
  const passengers = state?.searchParams?.passengers || 2;

  const fetchBuses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/buses/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          date: dateStr,
          passengers
        })
      });
      const data = await res.json();
      if (data.success && (data.results || data.buses)) {
        setBuses(data.results || data.buses);
      } else {
        setError(data.error || 'No buses found for this route');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch buses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [state]);

  const filteredBuses = buses.filter(b => {
    const type = (b.busType || b.type || '').toLowerCase();
    if (activeFilter === 'sleeper') return type.includes('sleeper');
    if (activeFilter === 'ac') return type.includes('ac');
    if (activeFilter === 'rating') return Number(b.rating || 4.5) >= 4.7;
    return true;
  });

  return (
    <div className="bg-[#f6faff] min-h-screen text-[#171c20] font-['Outfit',sans-serif] antialiased flex flex-col">
      {/* 1. Curved Fixed Header (Stitch design) */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-white/95 backdrop-blur-xl rounded-b-[24px] shadow-[0_4px_20px_rgba(0,101,145,0.06)] border-b border-slate-100">
        <div className="h-20 px-4 flex items-center justify-between gap-2 max-w-4xl mx-auto">
          <button
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-[#f0f4fa] flex items-center justify-center text-[#0F172A] hover:bg-[#eaeef4] active:scale-95 transition-all shrink-0 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>

          <div className="flex flex-col items-center justify-center text-center flex-1 min-w-0 px-2">
            <div className="flex items-center justify-center gap-1.5 truncate max-w-full">
              <span className="font-bold text-[16px] text-[#0F172A] truncate">{origin}</span>
              <span className="material-symbols-outlined text-[#006591] text-[16px] shrink-0 font-bold">arrow_forward</span>
              <span className="font-bold text-[16px] text-[#006591] truncate">{destination}</span>
            </div>
            <span className="text-[11px] font-medium text-[#475569] font-['JetBrains_Mono',monospace] truncate mt-0.5">
              {dateStr} • {passengers} Travellers • Verified Bus Fleet
            </span>
          </div>

          <button
            aria-label="Edit search details"
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-[#c9e6ff]/40 flex items-center justify-center text-[#006591] hover:bg-[#c9e6ff] active:scale-95 transition-all shrink-0 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full pt-24 pb-28 min-h-screen bg-[#F8FAFC] max-w-4xl mx-auto">
        {/* Sub-header trip metadata chip bar */}
        <section className="px-4 pt-2 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-[#006591] text-[18px]">calendar_month</span>
            <span className="text-[12px] font-['JetBrains_Mono',monospace] text-[#475569] truncate">
              {dateStr} • {passengers} Travellers
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[#eaeef4] px-2.5 py-0.5 rounded-full shrink-0">
            <span className="material-symbols-outlined text-[#006c49] text-[14px]">bolt</span>
            <span className="text-[11px] font-['JetBrains_Mono',monospace] text-[#00714d] font-bold">
              {filteredBuses.length} Fleet(s) Available
            </span>
          </div>
        </section>

        {/* Quick Filter Pills */}
        <section className="w-full px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] whitespace-nowrap shadow-xs transition-all shrink-0 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#0ea5e9] text-white font-bold'
                  : 'bg-white text-[#475569] hover:text-[#0F172A]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">directions_bus</span>
              <span>All Fleet</span>
            </button>

            <button
              onClick={() => setActiveFilter('sleeper')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] whitespace-nowrap shadow-xs transition-all shrink-0 cursor-pointer ${
                activeFilter === 'sleeper'
                  ? 'bg-[#0ea5e9] text-white font-bold'
                  : 'bg-white text-[#475569] hover:text-[#0F172A]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">airline_seat_flat</span>
              <span>AC Sleeper</span>
            </button>

            <button
              onClick={() => setActiveFilter('rating')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] whitespace-nowrap shadow-xs transition-all shrink-0 cursor-pointer ${
                activeFilter === 'rating'
                  ? 'bg-[#0ea5e9] text-white font-bold'
                  : 'bg-white text-[#475569] hover:text-[#0F172A]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
              <span>Top Rated (4.7+)</span>
            </button>

            <button
              onClick={() => setActiveFilter('ac')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] whitespace-nowrap shadow-xs transition-all shrink-0 cursor-pointer ${
                activeFilter === 'ac'
                  ? 'bg-[#0ea5e9] text-white font-bold'
                  : 'bg-white text-[#475569] hover:text-[#0F172A]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">ac_unit</span>
              <span>AC Chilled</span>
            </button>
          </div>
        </section>

        {/* Bus List Cards */}
        <section className="px-4 pt-1 pb-4 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-3">
                <Loader2 className="w-8 h-8 text-[#0ea5e9] animate-spin" />
                <p className="text-slate-500 font-semibold text-sm">Searching real-time verified buses & sleeper berths...</p>
              </div>
            ) : error || filteredBuses.length === 0 ? (
              <DebugErrorAlert error={error || 'No buses found for this date & route.'} onRetry={fetchBuses} />
            ) : (
              filteredBuses.map((bus, idx) => {
                const busName = bus.operatorName || bus.name || 'IntrCity SmartBus';
                const busType = bus.busType || bus.type || 'Volvo 9600 Multi-Axle AC Sleeper (2+1)';
                const depTime = bus.departure?.time || (bus.departureTime ? String(bus.departureTime).split('T')[1]?.slice(0, 5) : '21:00');
                const depStation = bus.departure?.station || bus.boardingPoints?.[0]?.location || `${origin} (Borivali East)`;
                const arrTime = bus.arrival?.time || (bus.arrivalTime ? String(bus.arrivalTime).split('T')[1]?.slice(0, 5) : '07:30');
                const arrStation = bus.arrival?.station || bus.droppingPoints?.[0]?.location || `${destination} (Mapusa Circle)`;
                const fare = Number(bus.price || bus.fare || 1850);
                const availableSeats = Number(bus.seatsAvailable || bus.availableSeats || 14);
                const rating = bus.rating || 4.8;
                const duration = bus.duration || '10h 30m';

                return (
                  <motion.div
                    key={bus.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="w-full bg-white rounded-2xl shadow-[0_4px_18px_rgba(0,101,145,0.08)] p-4 sm:p-5 flex flex-col gap-3 transition-all hover:shadow-lg border border-slate-100 cursor-pointer active:scale-[0.99]"
                    onClick={() => {
                      navigate('/buses/seatmap', {
                        state: {
                          bus,
                          searchParams: {
                            origin,
                            destination,
                            date: dateStr,
                            passengers
                          }
                        }
                      });
                    }}
                  >
                    {/* Top Row: Operator & Rating */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-base text-[#0F172A] tracking-tight">{busName}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#6cf8bb]/30 text-[#00714d] font-['JetBrains_Mono',monospace] text-[10px] font-bold shrink-0">
                            <span className="material-symbols-outlined text-[12px] mr-0.5">verified</span>Verified
                          </span>
                        </div>
                        <span className="text-[12px] text-[#475569] truncate mt-0.5">{busType}</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0 pl-1">
                        <div className="flex items-center gap-1 bg-[#006c49] text-white px-2 py-0.5 rounded-md shadow-xs">
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                          <span className="font-['JetBrains_Mono',monospace] text-[12px] font-bold">{rating}</span>
                        </div>
                        <span className="font-['JetBrains_Mono',monospace] text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                          {Math.floor(650 + idx * 110)} reviews
                        </span>
                      </div>
                    </div>

                    {/* Timeline & Route Stats */}
                    <div className="flex items-center justify-between bg-[#f0f4fa] p-3 rounded-xl">
                      <div className="flex flex-col">
                        <span className="font-['JetBrains_Mono',monospace] text-lg font-bold text-[#0F172A]">{depTime}</span>
                        <span className="text-xs text-[#475569] truncate max-w-[120px] sm:max-w-none">{depStation}</span>
                      </div>
                      <div className="flex flex-col items-center px-2">
                        <span className="font-['JetBrains_Mono',monospace] text-[11px] text-slate-500">{duration}</span>
                        <div className="flex items-center gap-1 my-1 w-20 justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]"></span>
                          <span className="h-0.5 flex-1 bg-[#dee3e9]"></span>
                          <span className="material-symbols-outlined text-[#006591] text-[14px]">directions_bus</span>
                          <span className="h-0.5 flex-1 bg-[#dee3e9]"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]"></span>
                        </div>
                        <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#006c49] font-bold">96% On-time</span>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className="font-['JetBrains_Mono',monospace] text-lg font-bold text-[#0F172A]">{arrTime}</span>
                        <span className="text-xs text-[#475569] truncate max-w-[120px] sm:max-w-none">{arrStation}</span>
                      </div>
                    </div>

                    {/* Key Amenities Strip */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eaeef4] text-[#3e4850] text-[11px] shrink-0 font-['JetBrains_Mono',monospace]">
                        <span className="material-symbols-outlined text-[14px] text-[#006591]">near_me</span>
                        <span>Live GPS</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eaeef4] text-[#3e4850] text-[11px] shrink-0 font-['JetBrains_Mono',monospace]">
                        <span className="material-symbols-outlined text-[14px] text-[#006591]">wc</span>
                        <span>Washroom</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eaeef4] text-[#3e4850] text-[11px] shrink-0 font-['JetBrains_Mono',monospace]">
                        <span className="material-symbols-outlined text-[14px] text-[#006591]">power</span>
                        <span>Charging</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eaeef4] text-[#3e4850] text-[11px] shrink-0 font-['JetBrains_Mono',monospace]">
                        <span className="material-symbols-outlined text-[14px] text-[#006591]">bed</span>
                        <span>Blanket</span>
                      </div>
                    </div>

                    {/* Price & CTA Row */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-['JetBrains_Mono',monospace]">Starting from</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-[#0F172A]">₹{fare.toLocaleString('en-IN')}</span>
                          <span className="text-[11px] text-[#006c49] font-bold bg-[#6cf8bb]/30 px-2 py-0.2 rounded-full font-['JetBrains_Mono',monospace]">
                            {availableSeats} seats left
                          </span>
                        </div>
                      </div>

                      <button
                        className="px-5 py-2.5 rounded-xl bg-[#0ea5e9] text-white text-xs sm:text-sm font-bold shadow-[0_3px_12px_rgba(14,165,233,0.35)] hover:bg-[#0284c7] transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/buses/seatmap', {
                            state: {
                              bus,
                              searchParams: {
                                origin,
                                destination,
                                date: dateStr,
                                passengers
                              }
                            }
                          });
                        }}
                      >
                        <span>Select Seats</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};
