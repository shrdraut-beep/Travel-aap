import React, { useState } from 'react';
import { Plane, Calendar, Users, ArrowRightLeft, Search, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { SearchInput } from '../SearchInput';
import { IATA_TO_CITY_MAP, CITY_TO_IATA_MAP, CITY_GROUPS } from '../../data/airports';
import { getFullStationDetails } from '../../services/travelTimeService';
import { LiveRadarModal } from '../modals/LiveRadarModal';
import { TransportOptions } from './TransportOptions';

interface FlightSearchTabProps {
  lang: string;
  currencySymbol: string;
  onOpenLiveRadar?: () => void;
}


const AIRPORT_CITIES: Record<string, string> = IATA_TO_CITY_MAP;

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

export const FlightSearchTab: React.FC<FlightSearchTabProps> = ({ lang, currencySymbol, onOpenLiveRadar }) => {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState(tomorrowStr);
  const [returnDate, setReturnDate] = useState('');
  const [cabinClass, setCabinClass] = useState('economy');
  const [adults, setAdults] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [flightData, setFlightData] = useState<any>(null);
  const [isCached, setIsCached] = useState(false);
  const [showLocalLiveRadar, setShowLocalLiveRadar] = useState(false);

  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleFlightSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);

    try {
      const o = origin.toUpperCase();
      const d = destination.toUpperCase();

      // Get all valid codes for origin and destination based on groups
      const originCodes = CITY_GROUPS[o] || [CITY_TO_IATA_MAP[o] || o];
      const destinationCodes = CITY_GROUPS[d] || [CITY_TO_IATA_MAP[d] || d];

      let flightSchedules;
      try {
        const module = await import('../../data/flightSchedules.json');
        flightSchedules = module.default || module;
      } catch (e) {
        console.error("Failed to load flight schedules:", e);
        flightSchedules = [];
      }

      const filteredFlights = flightSchedules.filter((f: any) => {
        const fromMatch = originCodes.some(code => f.from.toUpperCase() === code.toUpperCase());
        const toMatch = destinationCodes.some(code => f.to.toUpperCase() === code.toUpperCase());
        return fromMatch && toMatch;
      });

      // Map to expected format for TransportOptions
      const results = filteredFlights.map((f: any) => {
        const srcCode = f.from || origin || 'BOM';
        const dstCode = f.to || destination || 'DEL';
        const srcDet = getFullStationDetails(srcCode);
        const dstDet = getFullStationDetails(dstCode);

        return {
          airline: f.airline,
          flightNumber: f.flight_number,
          departureTime: f.time,
          arrivalTime: f.arrival_time,
          duration: f.duration,
          provider: f.airline,
          originCode: srcCode,
          destinationCode: dstCode,
          originFullName: srcDet.fullName,
          destinationFullName: dstDet.fullName,
          from: srcCode,
          to: dstCode
        };
      });

      setFlightData({ flights: results });
      setIsCached(false);
    } catch (error: any) {
      console.error("Flight Search Error:", error);
      setFlightData(null);
    } finally {
      // Simulate a small loading delay for UX
      setTimeout(() => setIsLoading(false), 600);
    }
  };


  return (
    <div className="space-y-6">
      {/* Flight Search Form */}
      <form onSubmit={handleFlightSearch} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <SearchInput
            label={lang === 'mr' ? 'कुठून (Origin)' : 'From / Origin'}
            placeholder="Search city, airport name, or ISK..."
            value={origin}
            onChange={(code) => setOrigin(code)}
            mode="flights"
            iconType="from"
          />

          <button
            type="button"
            onClick={handleSwapAirports}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors mx-auto shrink-0 shadow-sm border border-slate-200 mt-5 md:mt-0"
          >
            <ArrowRightLeft className="w-5 h-5 md:rotate-0 rotate-90" />
          </button>

          <SearchInput
            label={lang === 'mr' ? 'कुठे (Destination)' : 'To / Destination'}
            placeholder="Search city, airport name, or DEL..."
            value={destination}
            onChange={(code) => setDestination(code)}
            mode="flights"
            iconType="to"
          />
        </div>
        
        {/* Date, Return, Adults & Class */}
        <div className="mt-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
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
                {lang === 'mr' ? 'प्रवासी' : 'Adults'}
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full bg-transparent font-bold text-xs text-slate-900 outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                {lang === 'mr' ? 'केबिन' : 'Cabin'}
              </label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="w-full bg-transparent font-bold text-xs text-slate-900 outline-none"
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Search className="w-5 h-5" />
          <span>{lang === 'mr' ? 'थेट विमान दर शोधा' : 'Search Flights'}</span>
        </button>


      </form>

      
        <LiveRadarModal
          isOpen={showLocalLiveRadar}
          onClose={() => setShowLocalLiveRadar(false)}
          lang={lang}
        />
      

      {/* Flight Cards Results rendered via TransportOptions */}
      {(hasSearched || isLoading) && (
        <TransportOptions
          mode="flight"
          data={flightData}
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

