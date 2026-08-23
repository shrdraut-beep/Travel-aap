import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DebugErrorAlert } from '../components/ui/DebugErrorAlert';
import { ArrowLeft, Loader2, MapPin, Star, Check, Info, BedDouble } from 'lucide-react';
import { useINRConversion } from '../utils/currencyConverter';

// ----------------------------------------------------------------------
// Custom Themed Components (Replacing @duffel/components)
// ----------------------------------------------------------------------

const CustomStaysSummary: React.FC<{ stay: any }> = ({ stay }) => {
  const name = stay?.accommodation?.name || stay?.name || 'Unknown Property';
  const rating = stay?.accommodation?.rating || stay?.rating || 0;
  const address = stay?.accommodation?.location?.address?.line_1 || 'Address not available';

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-slate-900">{name}</h1>
          {rating > 0 && (
            <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
              <Star className="w-4 h-4 fill-current" />
              <span className="ml-1 text-sm font-semibold">{rating}</span>
            </div>
          )}
        </div>
        <div className="flex items-center text-slate-500 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{address}</span>
        </div>
      </div>
    </div>
  );
};

const CustomAmenitiesList: React.FC<{ amenities: any[] }> = ({ amenities }) => {
  if (!amenities || amenities.length === 0) {
    return <p className="text-slate-500">No amenities listed.</p>;
  }
  
  // Basic deduplication and rendering
  const uniqueAmenities = Array.from(new Set(amenities.map(a => typeof a === 'string' ? a : a.type || a.description)));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {uniqueAmenities.map((amenity: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="text-sm capitalize">{amenity.replace(/_/g, ' ')}</span>
        </div>
      ))}
    </div>
  );
};

const CustomRoomRateCard: React.FC<{ rate: any, onSelect: (amount: number) => void }> = ({ rate, onSelect }) => {
  const roomName = rate?.room?.name || 'Standard Room';
  const baseCurrency = rate?.total_currency || 'USD';
  const baseAmount = rate?.total_amount || 0;
  
  const { convertedAmount, formattedINR, isLoading } = useINRConversion(baseAmount, baseCurrency);

  return (
    <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-blue-600" />
            {roomName}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {rate?.board_type ? `Board: ${rate.board_type.replace(/_/g, ' ')}` : 'Room only'}
          </p>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Price</p>
          {isLoading ? (
             <div className="h-8 w-24 bg-slate-200 animate-pulse rounded"></div>
          ) : (
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900">{formattedINR}</span>
              {baseCurrency !== 'INR' && (
                <span className="text-xs text-slate-400">
                  (Converted from {baseAmount} {baseCurrency})
                </span>
              )}
            </div>
          )}
        </div>
        <button 
          onClick={() => onSelect(convertedAmount ?? parseFloat(rate?.total_amount || 0))}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Select Room
        </button>
      </div>
    </div>
  );
};

const CustomCancellationTimeline: React.FC<{ timeline: any[] }> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex gap-2 items-center text-slate-600 bg-slate-50 p-4 rounded-lg">
        <Info className="w-5 h-5 text-blue-500" />
        <p className="text-sm">Please check the individual room rate for specific cancellation policies.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
      {timeline.map((event, idx) => (
        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
            <Info className="w-4 h-4" />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <div className="font-bold text-slate-800">{new Date(event.date).toLocaleDateString()}</div>
             <div className="text-sm text-slate-600 mt-1">{event.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------

export const StaysDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { searchParams: any };
  
  const [stayDetails, setStayDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    fetchStays();
  };

  const fetchStays = async () => {
    if (!state?.searchParams) {
      setError("No search parameters provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stays/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.searchParams)
      });
      const data = await res.json();
      if (data.success && data.results && data.results.length > 0) {
        setStayDetails(data.results[0]);
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

  const handleGoBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-[Inter]">
      <div className="px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={handleGoBack} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <span className="font-bold text-lg text-slate-800">Stay Details</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-500 font-medium">Fetching live properties...</p>
            </motion.div>
          ) : error || !stayDetails ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mt-10">
              <DebugErrorAlert error={error || "Property not found"} onRetry={handleRetry} />
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl w-full mx-auto space-y-8 pb-20">
              
              {/* Custom Summary Component */}
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-100">
                <CustomStaysSummary stay={stayDetails} />
              </div>

              {/* Custom Amenities Component */}
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-100">
                <h2 className="text-xl font-bold mb-6 text-slate-800">Amenities</h2>
                <CustomAmenitiesList amenities={stayDetails.accommodation?.amenities || stayDetails.amenities || []} />
              </div>

              {/* Custom Room Rates Component with Currency Conversion */}
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-100">
                <h2 className="text-xl font-bold mb-6 text-slate-800">Available Rooms</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {(stayDetails.rates || stayDetails.roomRates || []).map((rate: any, i: number) => (
                    <CustomRoomRateCard 
                      key={i} 
                      rate={rate} 
                      onSelect={(amount) => {
                        navigate('/checkout', { 
                          state: { 
                            item: {
                              id: rate.id || `hotel_${Math.random()}`,
                              title: stayDetails.name || "Premium Stay",
                              vertical: 'hotel',
                              amount: amount,
                              meta: { rate, property: stayDetails }
                            },
                            currencySymbol: '₹',
                            lang: 'en'
                          } 
                        })
                      }} 
                    />
                  ))}
                </div>
              </div>

              {/* Custom Cancellation Timeline */}
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-100">
                <h2 className="text-xl font-bold mb-6 text-slate-800">Cancellation Policy</h2>
                <CustomCancellationTimeline timeline={stayDetails.cancellationTimeline || []} />
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
