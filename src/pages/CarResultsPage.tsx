import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Users, Briefcase, Settings2, Fuel, Star } from 'lucide-react';
import { DebugErrorAlert } from '../components/ui/DebugErrorAlert';

export const CarResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { searchParams: any };
  
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      if (!state?.searchParams) {
        setError("No search parameters provided.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch('/api/cars/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.searchParams)
        });
        const data = await res.json();
        if (data.success && data.results) {
          setCars(data.results);
        } else {
          setError(data.error || "No cars found");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCars();
  }, [state]);

  const searchLoc = state?.searchParams?.location || 'Location';

  return (
    <div className="min-h-screen bg-slate-50 font-[Inter]">
      {/* Flutter App Style Header */}
      <div className="bg-white px-5 py-6 rounded-b-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
          <div>
             <h1 className="text-xl font-bold text-slate-900">Cars in {searchLoc}</h1>
             <p className="text-sm text-slate-500 font-medium">{cars.length} vehicles available</p>
          </div>
        </div>
      </div>

      <div className="p-5 max-w-lg mx-auto pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 font-medium">Finding available cars...</p>
          </div>
        ) : error || cars.length === 0 ? (
          <DebugErrorAlert error={error || "No cars found"} onRetry={() => window.location.reload()} />
        ) : (
          <div className="space-y-5">
            {cars.map((car, idx) => (
              <motion.div 
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight">{car.title}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{car.vendorName}</p>
                   </div>
                   <div className="bg-amber-50 text-amber-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" /> {car.rating}
                   </div>
                </div>

                <div className="w-full h-40 bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
                  <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-md text-slate-700">
                    {car.year} Model
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-5">
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-2 rounded-xl">
                    <Users className="w-4 h-4 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">{car.seats} Seats</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-2 rounded-xl">
                    <Settings2 className="w-4 h-4 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">{car.transmission}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-2 rounded-xl">
                    <Fuel className="w-4 h-4 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700 capitalize">{car.fuelType}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-50 p-2 rounded-xl">
                    <Briefcase className="w-4 h-4 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">Unlimited</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                   <div>
                     <p className="text-xs text-slate-400 font-medium mb-0.5">Price per day</p>
                     <div className="text-xl font-black text-slate-900">₹{car.pricePerDay}</div>
                   </div>
                   <button 
                     onClick={() => alert('Proceeding to book ' + car.title)}
                     className="bg-slate-900 text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-slate-800 transition-colors text-sm"
                   >
                     Book Now
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
