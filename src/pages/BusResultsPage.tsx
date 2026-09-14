import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, MapPin, Clock, Coffee, Wifi, Star, Zap, ChevronRight } from 'lucide-react';
import { DebugErrorAlert } from '../components/ui/DebugErrorAlert';
import { BrandHeader } from '../components/common/BrandHeader';

export const BusResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { searchParams: any };
  
  const [buses, setBuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuses = async () => {
      if (!state?.searchParams) {
        setError("No search parameters provided.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch('/api/buses/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.searchParams)
        });
        const data = await res.json();
        if (data.success && data.results) {
          setBuses(data.results);
        } else {
          setError(data.error || "No buses found");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuses();
  }, [state]);

  const origin = state?.searchParams?.origin || 'Origin';
  const destination = state?.searchParams?.destination || 'Destination';
  const dateStr = state?.searchParams?.date || 'Today';

  return (
    <div className="premium-root min-h-screen bg-[var(--premium-page)] flex flex-col pb-16">
      {/* Brand Header */}
      <BrandHeader
        title={`${origin} to ${destination}`}
        subtitle={`${dateStr} • ${buses.length} Buses found`}
        onBack={() => navigate(-1)}
      />

      <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
            <p className="text-slate-500 font-medium">Finding best buses...</p>
          </div>
        ) : error || buses.length === 0 ? (
          <DebugErrorAlert error={error || "No buses found"} onRetry={() => window.location.reload()} />
        ) : (
          <div className="space-y-4">
            {buses.map((bus, idx) => (
              <motion.div 
                key={bus.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_12px_35px_-15px_rgba(40,32,79,0.15)] hover:shadow-[0_20px_45px_-15px_rgba(40,32,79,0.22)] border border-slate-200/80 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate('/buses/seatmap', { state: { bus, searchParams: state.searchParams } })}
              >
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100/60 inline-block mb-1">
                        {bus.type || 'Luxury Express'}
                      </span>
                      <h3 className="font-black text-lg text-slate-900 group-hover:text-pink-600 transition-colors">{bus.name}</h3>
                   </div>
                   <div className="bg-pink-50 text-pink-700 border border-pink-200/50 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-black">
                      <Star className="w-3.5 h-3.5 fill-current" /> {bus.rating || '4.5'}
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative mb-4">
                   <div className="flex-1 w-full flex items-center gap-4">
                     <div className="relative pl-6 space-y-4 flex-1">
                        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 border-l-2 border-dashed border-pink-200"></div>
                        
                        <div className="flex items-center gap-3 relative z-10">
                           <div className="w-5 h-5 -ml-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                              A
                           </div>
                           <div>
                              <div className="text-base font-black text-slate-900">{bus.departure.time}</div>
                              <div className="text-xs text-slate-500 font-medium">{bus.departure.station}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                           <div className="w-5 h-5 -ml-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                              B
                           </div>
                           <div>
                              <div className="text-base font-black text-slate-900">{bus.arrival.time}</div>
                              <div className="text-xs text-slate-500 font-medium">{bus.arrival.station}</div>
                           </div>
                        </div>
                     </div>
                   </div>
                   
                   <div className="sm:text-right w-full sm:w-auto shrink-0 sm:pl-6 sm:border-l border-slate-100 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400">Starting from</p>
                       <div className="text-2xl font-black text-slate-900">₹{bus.fare}</div>
                     </div>
                     <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                       <Zap className="w-3 h-3 fill-current" /> {bus.availableSeats} seats left
                     </p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                   <div className="flex flex-wrap items-center gap-1.5">
                     {bus.amenities.slice(0, 3).map((am: string, i: number) => (
                       <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold">
                         {am}
                       </span>
                     ))}
                     {bus.amenities.length > 3 && <span className="text-[10px] text-slate-400 font-bold">+{bus.amenities.length - 3} more</span>}
                   </div>
                   <div className="flex items-center gap-1.5 text-xs font-black text-pink-600 group-hover:text-pink-700 transition-colors">
                     <span>Select Seats</span>
                     <div className="w-7 h-7 rounded-full bg-pink-50 group-hover:bg-pink-600 group-hover:text-white flex items-center justify-center transition-all">
                       <ChevronRight className="w-4 h-4" />
                     </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
