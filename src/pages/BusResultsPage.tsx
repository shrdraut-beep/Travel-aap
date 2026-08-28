import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, MapPin, Clock, Coffee, Wifi, Star, Zap, ChevronRight } from 'lucide-react';
import { DebugErrorAlert } from '../components/ui/DebugErrorAlert';

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
    <div className="min-h-screen bg-slate-50 font-[Inter]">
      {/* Flutter App Style Header */}
      <div className="bg-white px-5 py-6 rounded-b-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
          <div>
             <h1 className="text-xl font-bold text-slate-900">{origin} to {destination}</h1>
             <p className="text-sm text-slate-500 font-medium">{dateStr} • {buses.length} Buses found</p>
          </div>
        </div>
      </div>

      <div className="p-5 max-w-lg mx-auto pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 font-medium">Finding best buses...</p>
          </div>
        ) : error || buses.length === 0 ? (
          <DebugErrorAlert error={error || "No buses found"} onRetry={() => window.location.reload()} />
        ) : (
          <div className="space-y-5">
            {buses.map((bus, idx) => (
              <motion.div 
                key={bus.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/buses/seatmap', { state: { bus, searchParams: state.searchParams } })}
              >
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="font-bold text-lg text-slate-900">{bus.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{bus.type}</p>
                   </div>
                   <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" /> {bus.rating}
                   </div>
                </div>

                <div className="flex items-center justify-between relative mb-4">
                   <div className="absolute left-3.5 top-2 bottom-2 w-0.5 border-l-2 border-dashed border-slate-200"></div>
                   
                   <div className="space-y-4 w-full">
                     <div className="flex items-center gap-3 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                           <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                        </div>
                        <div>
                           <div className="text-sm font-bold text-slate-900">{bus.departure.time}</div>
                           <div className="text-xs text-slate-500">{bus.departure.station}</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                           <MapPin className="w-4 h-4 text-rose-600" />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-slate-900">{bus.arrival.time}</div>
                           <div className="text-xs text-slate-500">{bus.arrival.station}</div>
                        </div>
                     </div>
                   </div>
                   
                   <div className="text-right shrink-0 pl-4 border-l border-slate-100">
                     <p className="text-xs text-slate-400 font-medium mb-1">Starting from</p>
                     <div className="text-xl font-black text-slate-900">₹{bus.fare}</div>
                     <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center justify-end gap-0.5">
                       <Zap className="w-3 h-3" /> {bus.availableSeats} Seats left
                     </p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-2">
                     {bus.amenities.slice(0, 3).map((am: string, i: number) => (
                       <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
                         {am}
                       </span>
                     ))}
                     {bus.amenities.length > 3 && <span className="text-[10px] text-slate-400">+{bus.amenities.length - 3}</span>}
                   </div>
                   <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                     <ChevronRight className="w-4 h-4" />
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
