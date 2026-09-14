import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DebugErrorAlert } from '../components/ui/DebugErrorAlert';
import { ArrowLeft, Loader2, Car, Users, Briefcase, Settings, ShieldCheck } from 'lucide-react';
import { useINRConversion } from '../utils/currencyConverter';
import { BrandHeader } from '../components/common/BrandHeader';

// --- CUSTOM THEMED COMPONENTS ---

const CustomCarQuoteCard: React.FC<{ quote: any, onSelect: (amount: number) => void }> = ({ quote, onSelect }) => {
  const { convertedAmount, formattedINR, isLoading } = useINRConversion(quote.total_amount, quote.total_currency);
  
  const vehicleName = quote.vehicle?.name || "Standard SUV";
  const supplierName = quote.supplier?.name || "Top Supplier";
  const seats = quote.vehicle?.seats || 5;
  const bags = quote.vehicle?.bags || 2;
  const transmission = quote.vehicle?.transmission || "Automatic";
  const image = quote.vehicle?.image_url;

  return (
    <div className="bg-white rounded-3xl shadow-[0_12px_35px_-15px_rgba(40,32,79,0.15)] hover:shadow-[0_20px_45px_-15px_rgba(40,32,79,0.22)] border border-slate-200/80 p-5 sm:p-6 flex flex-col md:flex-row gap-6 transition-all duration-300 mb-4 group">
      
      {/* Vehicle Image (Left side) */}
      <div className="w-full md:w-1/3 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-center min-h-[160px] p-4 shrink-0 group-hover:scale-102 transition-transform">
        {image ? (
          <img src={image} alt={vehicleName} className="max-w-full max-h-36 object-contain mix-blend-multiply" />
        ) : (
          <Car className="w-16 h-16 text-pink-300" />
        )}
      </div>

      {/* Details & Pricing (Right side) */}
      <div className="w-full flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100/60 inline-block mb-1.5">
              {supplierName}
            </span>
            <h3 className="text-xl font-black text-slate-900 group-hover:text-pink-600 transition-colors">{vehicleName}</h3>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5 text-pink-500" /> {seats} Seats
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
                <Briefcase className="w-3.5 h-3.5 text-pink-500" /> {bags} Bags
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full capitalize">
                <Settings className="w-3.5 h-3.5 text-pink-500" /> {transmission}
              </div>
            </div>
          </div>
          
          <div className="sm:text-right flex flex-col sm:items-end w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div className="flex items-center gap-1.5 text-pink-700 text-xs font-black mb-2 bg-pink-50 px-3 py-1 rounded-full border border-pink-200/50 w-fit sm:w-auto">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Instant Confirmation</span>
            </div>
            
            {isLoading ? (
               <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-full mb-2"></div>
            ) : (
              <div className="flex flex-col sm:items-end mb-1">
                <span className="text-2xl font-black text-slate-900">{formattedINR}</span>
                {quote.total_currency !== 'INR' && (
                  <span className="text-xs text-slate-400 font-medium">
                    ({quote.total_amount} {quote.total_currency})
                  </span>
                )}
              </div>
            )}
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total (taxes included)</div>
          </div>
        </div>
        
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-500">
            ✨ Free cancellation up to 24h before pickup
          </div>
          <button 
            onClick={() => onSelect(convertedAmount ?? parseFloat(quote?.total_amount || 0))}
            className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:opacity-95 text-white px-7 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-md shadow-rose-500/25 active:scale-95 transition-all"
          >
            Select Car
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE LAYOUT ---

export const CarsResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { searchParams: any };
  
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    fetchCars();
  };

  const fetchCars = async () => {
    if (!state?.searchParams) {
      setError("No search parameters provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cars/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.searchParams)
      });
      const data = await res.json();
      if (data.success) {
        setQuotes(data.quotes);
      } else {
        setError(data.details || data.error || "Failed to fetch cars");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [state]);

  const handleGoBack = () => navigate(-1);

  return (
    <div className="premium-root min-h-screen flex flex-col bg-[var(--premium-page)] pb-16">
      {/* Header */}
      <BrandHeader
        title="Car Rental Options"
        subtitle={state?.searchParams?.pickup ? `${state.searchParams.pickup} ➔ ${state.searchParams.drop || 'Local'}` : 'Top verified vehicle providers'}
        onBack={handleGoBack}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
              <p className="text-slate-500 font-medium">Searching live car quotes...</p>
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mt-10">
              <DebugErrorAlert error={error} onRetry={handleRetry} />
            </motion.div>
          ) : quotes.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 text-center bg-white rounded-2xl shadow-sm border border-slate-100 max-w-xl mx-auto mt-10">
              <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Cars Found</h3>
              <p className="text-slate-500 mb-6">We couldn't find any car quotes for this location and date.</p>
              <button onClick={handleGoBack} className="text-rose-600 font-medium hover:underline">
                Modify Search
              </button>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl w-full mx-auto pb-20">
              
              <div className="mb-6 px-2 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Available Vehicles</h2>
                  <p className="text-slate-500 mt-1">Found {quotes.length} rental options for your trip.</p>
                </div>
              </div>

              <div className="space-y-4">
                {quotes.map((quote, idx) => (
                  <CustomCarQuoteCard 
                    key={quote.id || idx} 
                    quote={quote} 
                    onSelect={(amount) => navigate('/checkout', { 
                      state: { 
                        item: {
                          id: quote.id || `car_${Math.random()}`,
                          title: quote.vehicle?.name || "Standard SUV",
                          vertical: 'car',
                          amount: amount,
                          image: quote.vehicle?.image_url,
                          meta: quote
                        },
                        currencySymbol: '₹',
                        lang: 'en'
                      } 
                    })} 
                  />
                ))}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
