import React, { useState } from 'react';
import { fetchTravelDataFromAI } from '../../services/travelAIService';
import { Bus, Calendar, Users, ArrowRightLeft, Search, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { TransportOptions } from './TransportOptions';

interface BusSearchTabProps {
  lang: string;
  currencySymbol: string;
}


const formatDate = (dateString: string) => {
  if (!dateString) return 'Select Date';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' });
  } catch(e) {
    return dateString;
  }
};

export const BusSearchTab: React.FC<BusSearchTabProps> = ({ lang, currencySymbol }) => {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState(tomorrowStr);
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [busData, setBusData] = useState<any>(null);
  const [isCached, setIsCached] = useState(false);

  const handleSwapCities = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleBusSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const res = await fetchTravelDataFromAI('bus', {
        origin,
        destination,
        date: departDate,
        passengers: adults
      });
      setBusData(res.data);
      setIsCached(res.isCached);
    } catch (err: any) {
      console.error("Bus Search Error:", err);
      setBusData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleBusSearch} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                {lang === 'mr' ? 'कुठून (Origin)' : 'From / Origin'}
              </label>
            </div>
            <div className="relative bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white rounded-2xl p-3 transition-all flex items-center gap-2.5 shadow-xs">
              <div className="text-slate-400 shrink-0">
                <Bus className="w-4 h-4 text-emerald-500" />
              </div>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Nashik"
                className="w-full bg-transparent font-extrabold text-sm text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSwapCities}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 flex items-center justify-center transition-colors mx-auto shrink-0 shadow-sm border border-slate-200 mt-5 md:mt-0"
          >
            <ArrowRightLeft className="w-5 h-5 md:rotate-0 rotate-90" />
          </button>

          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                {lang === 'mr' ? 'कुठे (Destination)' : 'To / Destination'}
              </label>
            </div>
            <div className="relative bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white rounded-2xl p-3 transition-all flex items-center gap-2.5 shadow-xs">
              <div className="text-slate-400 shrink-0">
                <Bus className="w-4 h-4 text-rose-500" />
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Delhi"
                className="w-full bg-transparent font-extrabold text-sm text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                {lang === 'mr' ? 'प्रस्थान' : 'Departure'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="w-full bg-transparent font-bold text-xs text-slate-900 pointer-events-none flex items-center h-6">
                  {formatDate(departDate)}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                {lang === 'mr' ? 'परत' : 'Return (Optional)'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-full bg-transparent font-bold text-xs text-slate-900 pointer-events-none flex items-center h-6 text-slate-500">
                  {returnDate ? formatDate(returnDate) : '+ Add Return'}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                {lang === 'mr' ? 'प्रवासी' : 'Passengers'}
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full bg-transparent font-bold text-xs text-slate-900 outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Search className="w-5 h-5" />
          <span>{lang === 'mr' ? 'बस शोधा' : 'Search Buses'}</span>
        </button>
      </form>

      {(hasSearched || isLoading) && (
        <TransportOptions
          mode="bus"
          data={busData}
          isLoading={isLoading}
          isCached={isCached}
          origin={origin}
          destination={destination}
          lang={lang}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
};


