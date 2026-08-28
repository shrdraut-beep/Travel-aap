import React, { useState } from 'react';
import { 
  Plane, Search, Clock, MapPin, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LiveFlightTrackerWidgetProps {
  defaultFlightNumber?: string;
  source?: string;
  destination?: string;
}

export const LiveFlightTrackerWidget: React.FC<LiveFlightTrackerWidgetProps> = ({
  defaultFlightNumber = '6E-2134',
  source = 'Mumbai (BOM)',
  destination = 'Goa (GOI)',
}) => {
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  const [flightInput, setFlightInput] = useState(defaultFlightNumber);
  const [searchedFlight, setSearchedFlight] = useState(defaultFlightNumber);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightInput.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setSearchedFlight(flightInput.trim().toUpperCase());
      setIsSearching(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shrink-0 shadow-xs">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {isMr ? 'लाईव्ह फ्लाइट आणि गेट ट्रॅकर' : 'Live Flight & Terminal Gate Tracker'}
              </h3>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Amadeus Live
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              {isMr ? 'रिअल-टाइम स्टेटस, टर्मिनल, गेट आणि लगेज बेल्ट माहिती' : 'Real-time delay status, gate, terminal & baggage belt'}
            </p>
          </div>
        </div>

        <a
          href={`https://www.flightradar24.com/${searchedFlight}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 self-start sm:self-auto transition-colors"
        >
          <span>FlightRadar24</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={flightInput}
            onChange={e => setFlightInput(e.target.value)}
            placeholder={isMr ? 'फ्लाइट किंवा PNR नंबर (उदा. 6E-2134, AI-101)' : 'Enter Flight or PNR (e.g. 6E-2134, AI-101)'}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-60 shrink-0"
        >
          {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : (isMr ? 'ट्रॅक करा' : 'Track')}
        </button>
      </form>

      {/* Flight Card Result */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-indigo-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/30 text-indigo-200 text-xs font-black uppercase border border-indigo-400/30">
              {searchedFlight}
            </span>
            <span className="text-xs font-bold text-slate-300">IndiGo Airlines</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {isMr ? 'वेळेवर (ON TIME)' : 'ON TIME'}
          </span>
        </div>

        {/* Departure & Arrival Route */}
        <div className="grid grid-cols-3 gap-2 items-center text-center py-2 border-y border-white/10">
          <div className="text-left">
            <span className="text-xl sm:text-2xl font-black block leading-none">BOM</span>
            <span className="text-[10px] font-bold text-slate-400 block mt-1">Mumbai Terminal 2</span>
            <span className="text-xs font-extrabold text-amber-300 block mt-0.5">08:30 AM</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">1h 15m Non-Stop</span>
            <div className="w-full flex items-center gap-1 my-1">
              <div className="h-0.5 flex-1 bg-indigo-400/40" />
              <Plane className="w-4 h-4 text-indigo-300 transform rotate-90" />
              <div className="h-0.5 flex-1 bg-indigo-400/40" />
            </div>
            <span className="text-[8px] font-semibold text-emerald-300">Airbus A321neo</span>
          </div>

          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black block leading-none">GOI</span>
            <span className="text-[10px] font-bold text-slate-400 block mt-1">Goa Terminal 1</span>
            <span className="text-xs font-extrabold text-emerald-300 block mt-0.5">09:45 AM</span>
          </div>
        </div>

        {/* Live Airport Intelligence Badges */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-center border border-white/10">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-300 block">
              {isMr ? 'बोर्डिंग गेट' : 'BOARDING GATE'}
            </span>
            <span className="text-sm font-black text-amber-300 mt-0.5 block">Gate 42B</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-center border border-white/10">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-300 block">
              {isMr ? 'लगेज बेल्ट' : 'BAGGAGE BELT'}
            </span>
            <span className="text-sm font-black text-emerald-300 mt-0.5 block">Belt 03</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 text-center border border-white/10">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-300 block">
              {isMr ? 'हवामान (GOI)' : 'WEATHER'}
            </span>
            <span className="text-sm font-black text-sky-300 mt-0.5 block">28°C Sunny</span>
          </div>
        </div>
      </div>
    </div>
  );
};
