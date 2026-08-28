import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, MapPin, Star, Filter, Wifi, Coffee, ShieldCheck, Compass as Sparkles, Building2, Phone, Navigation } from 'lucide-react';
import { DebugErrorAlert } from '../components/ui/DebugErrorAlert';
import { useINRConversion } from '../utils/currencyConverter';
import { SortFilterSheet } from '../components/booking/agoda/SortFilterSheet';

const HotelCard = ({ hotel, onSelect }: any) => {
  const name = hotel?.name || hotel?.accommodation?.name || 'Hotel Property';
  const rating = hotel?.rating || hotel?.accommodation?.rating || 0;
  const address = hotel?.address || hotel?.location || hotel?.accommodation?.location?.address?.line_1 || '';
  const city = hotel?.location || hotel?.city || '';
  const phone = hotel?.phone || hotel?.rawOffer?.propertyInfo?.phone?.phoneNumber || '';
  const distance = hotel?.distance || (hotel?.rawOffer?.propertyInfo?.distanceFromSearchPoint ? `${hotel.rawOffer.propertyInfo.distanceFromSearchPoint.value} ${hotel.rawOffer.propertyInfo.distanceFromSearchPoint.unitOfDistance}` : '');

  // Try to find the cheapest rate
  const rates = hotel?.rates || hotel?.roomRates || [];
  const minRate = rates.length > 0 ? rates.reduce((min: any, r: any) => parseFloat(r.total_amount) < parseFloat(min.total_amount) ? r : min, rates[0]) : null;
  const baseCurrency = minRate?.total_currency || hotel?.currency || 'INR';
  const baseAmount = minRate?.total_amount || hotel?.pricePerNight || 0;
  
  const { formattedINR, isLoading } = useINRConversion(baseAmount, baseCurrency);
  
  // Raw offer images
  const imageUrl = hotel?.image || hotel?.accommodation?.photos?.[0]?.url || '';

  const numAmount = typeof formattedINR === 'string' ? parseInt(formattedINR.replace(/[^0-9]/g, ''), 10) : 0;
  const strikeAmount = numAmount > 0 ? Math.round(numAmount * 1.25) : 0;

  return (
    <div 
      onClick={() => onSelect(hotel)} 
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200/90 overflow-hidden cursor-pointer transition-all duration-200 flex flex-col sm:flex-row mb-5 group hover:border-rose-300 relative"
    >
      {/* Top Banner Tag */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
        {rating > 0 && (
          <div className="bg-amber-500/95 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{rating}★ GIATA</span>
          </div>
        )}
        {hotel?.freeCancellation && (
          <div className="bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Free Cancellation</span>
          </div>
        )}
      </div>

      {/* Image Thumbnail */}
      <div className="w-full sm:w-2/5 h-52 sm:h-auto bg-slate-100 relative overflow-hidden shrink-0 flex items-center justify-center">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-slate-400">
            <Building2 className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
            <span className="text-xs font-semibold text-slate-400">Travelport Property</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 sm:hidden" />
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-100/60 inline-block">
              {hotel?.provider || 'Travelport Stays'}
            </span>
            {distance && (
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                <Navigation className="w-3 h-3 text-rose-500" /> {distance}
              </span>
            )}
          </div>

          <h3 className="font-black text-base sm:text-lg text-slate-900 mt-1.5 group-hover:text-rose-600 transition-colors line-clamp-1">
            {name}
          </h3>

          {address && (
            <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> 
              <span className="line-clamp-1">{address}</span>
            </p>
          )}

          {phone && (
            <p className="text-slate-600 text-xs mt-1 flex items-center gap-1 font-medium">
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 
              <span>+{phone}</span>
            </p>
          )}

          {/* Key Amenities Pills */}
          {hotel?.amenities && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-slate-600 font-medium">
              {hotel.amenities.slice(0, 3).map((amenity: any, idx: number) => (
                <span key={idx} className="bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                  {idx === 0 ? <Wifi className="w-3 h-3 text-indigo-500" /> : <Coffee className="w-3 h-3 text-amber-500" />} {amenity.description || amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
          <div>
            {numAmount > 0 ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 line-through">₹{strikeAmount.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 rounded">20% OFF</span>
                </div>
                {isLoading ? (
                  <div className="h-7 w-24 bg-slate-200 animate-pulse rounded-md mt-1" />
                ) : (
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none mt-0.5">
                    {formattedINR}
                    <span className="text-[11px] font-medium text-slate-500 block sm:inline sm:ml-1">/ night + taxes</span>
                  </div>
                )}
              </>
            ) : (
              <div>
                <span className="text-xs font-bold text-slate-600">Rate Plan</span>
                <div className="text-sm sm:text-base font-extrabold text-slate-800">Available on Request</div>
              </div>
            )}
          </div>
          <button className="bg-[#e11d48] hover:bg-[#be123c] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-200 group-hover:scale-102 active:scale-95 transition-all">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export const StaysResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { searchParams: any };
  
  const [hotels, setHotels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortMethod, setSortMethod] = useState('best_match');
  const [showDebug, setShowDebug] = useState(false);

  const fetchStays = async () => {
    if (!state?.searchParams) {
      setError("No search parameters provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.searchParams)
      });
      const data = await res.json();
      if (data.success && data.results && data.results.length > 0) {
        setHotels(data.results);
      } else {
        setError(data.details || data.error || "No properties found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStays();
  }, [state]);
  
  // Handle Sort
  const displayedHotels = [...hotels].sort((a, b) => {
    if (sortMethod === 'lowest_price') {
      const pA = a.rates?.[0]?.total_amount || 999999;
      const pB = b.rates?.[0]?.total_amount || 999999;
      return pA - pB;
    }
    return 0; // best match / default
  });

  const destinationName = state?.searchParams?.destination || (typeof state?.searchParams?.location === 'string' ? state?.searchParams?.location : state?.searchParams?.location?.name) || 'Selected Destination';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-[Inter]">
      <div className="px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-slate-800">Hotels in {destinationName}</h1>
            <p className="text-xs text-slate-500">{destinationName} • {state?.searchParams?.rooms || 1} Room(s) • {state?.searchParams?.adults || 2} Guest(s)</p>
          </div>
        </div>
        <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
          <Filter className="w-4 h-4" /> Sort
        </button>
        <button onClick={() => setShowDebug(!showDebug)} className="flex items-center gap-2 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-sm font-medium ml-2">
          JSON
        </button>
      </div>

      
      {showDebug && (
        <div className="bg-slate-900 text-green-400 p-4 m-4 rounded-xl overflow-auto text-xs max-h-96 border border-slate-700">
          <h3 className="text-white font-bold mb-2">RAW JSON from API</h3>
          <pre>{JSON.stringify(hotels, null, 2)}</pre>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {isLoading ? (
             <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-64 space-y-4">
               <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
               <p className="text-slate-500 font-medium">Searching for the best hotels...</p>
             </motion.div>
          ) : error || hotels.length === 0 ? (
             <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <DebugErrorAlert error={error || "No hotels found for the selected criteria."} onRetry={fetchStays} />
             </motion.div>
          ) : (
             <motion.div key="results" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
               {displayedHotels.map((h, i) => (
                 <HotelCard 
                   key={i} 
                   hotel={h} 
                   onSelect={(hotel: any) => navigate('/stays/details', { state: { hotel, searchParams: state.searchParams } })} 
                 />
               ))}
             </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <SortFilterSheet 
        visible={showFilters}
        mode="hotel"
        onClose={() => setShowFilters(false)}
        onApply={(filters: any) => { setSortMethod(filters.sort); }}
      />
    </div>
  );
}
