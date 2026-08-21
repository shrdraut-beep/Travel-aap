import React, { useState } from 'react';
import { TransportOptions } from './TransportOptions';
import { BookingFunnelLayout } from './BookingFunnelLayout';
import { SearchResultsToolbar } from './SearchResultsToolbar';
import { IATA_TO_CITY_MAP, CITY_TO_IATA_MAP, CITY_GROUPS } from '../../data/airports';
import { Users, Minus, Plus } from 'lucide-react';

const CABIN_CLASSES = ['economy', 'premium', 'business', 'first'];

const departureMinutes = (flight: any) => {
  const raw = String(flight.departureTime || flight.departure_time || flight.time || '');
  const match = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + parseInt(match[2], 10);
};

const durationMinutes = (flight: any) => {
  const raw = String(flight.duration || '');
  const h = raw.match(/(\d+)h/);
  const m = raw.match(/(\d+)m/);
  return (h ? parseInt(h[1], 10) : 0) * 60 + (m ? parseInt(m[1], 10) : 0);
};

export const FlightSearchTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const isMr = lang === 'mr';
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState('economy');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [flightData, setFlightData] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('price');
  const [nonStopOnly, setNonStopOnly] = useState(false);

  const visibleFlights = React.useMemo(() => {
    const list = nonStopOnly
      ? flightData.filter(f => (f.stops ?? 0) === 0)
      : flightData;

    return [...list].sort((a, b) => {
      if (sortBy === 'departure') return departureMinutes(a) - departureMinutes(b);
      if (sortBy === 'duration') return durationMinutes(a) - durationMinutes(b);
      return (a.price || 0) - (b.price || 0);
    });
  }, [flightData, sortBy, nonStopOnly]);

  const handleFlightSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      let flightSchedules;
      try {
        const module = await import('../../data/flightSchedules.json');
        flightSchedules = module.default || module;
      } catch (e) {
        flightSchedules = [];
      }
      
      const o = origin.toUpperCase();
      const d = destination.toUpperCase();
      const originCodes = CITY_GROUPS[o] || [CITY_TO_IATA_MAP[o] || o];
      const destinationCodes = CITY_GROUPS[d] || [CITY_TO_IATA_MAP[d] || d];

      let results = flightSchedules.filter((f: any) => 
        originCodes.includes(f.originCode) && destinationCodes.includes(f.destCode)
      );

      if (results.length === 0) {
        // Fallback mock
        results = [
          {
            flightNumber: `AI-${Math.floor(Math.random() * 900) + 100}`,
            airline: 'Air India',
            origin: origin,
            destination: destination,
            originCode: originCodes[0] || origin,
            destCode: destinationCodes[0] || destination,
            departureTime: '08:00 AM',
            arrivalTime: '10:30 AM',
            duration: '2h 30m',
            price: 5400,
            cabin: 'Economy'
          }
        ];
      }

      setFlightData(results);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  const renderStepper = (
    label: string,
    hint: string,
    value: number,
    onChange: (next: number) => void,
    min: number,
    max: number
  ) => (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-bold text-slate-800">{label}</h4>
        <p className="text-[10px] text-slate-500">{hint}</p>
      </div>
      <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
        >
          <Minus className="w-4 h-4"/>
        </button>
        <span className="font-black text-slate-900 w-4 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
        >
          <Plus className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );

  const renderPassengerSelector = () => (
    <div className="space-y-6">
      {renderStepper('Adults', '12+ years (Max 9 per booking)', adults, (next) => {
        setAdults(next);
        if (infants > next) setInfants(next);
      }, 1, 9)}

      {renderStepper('Children', '2-11 years', children, setChildren, 0, 8)}

      {renderStepper('Infants', 'Under 2 years (one per adult)', infants, setInfants, 0, adults)}

      {adults >= 9 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 leading-snug">
          ⚠️ Airline Rule: Maximum 9 passengers allowed per standard booking. For more than 9 passengers, please make a Group Booking.
        </div>
      )}

      <div>
        <h4 className="font-bold text-slate-800 mb-3">Cabin Class</h4>
        <div className="grid grid-cols-4 gap-2">
          {CABIN_CLASSES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCabinClass(c)}
              className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${cabinClass === c ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <BookingFunnelLayout
      mode="flight"
      onBack={onBack}
      origin={origin}
      setOrigin={setOrigin}
      destination={destination}
      setDestination={setDestination}
      date={departDate}
      setDate={setDepartDate}
      onSearch={handleFlightSearch}
      isLoading={isLoading}
      hasSearched={hasSearched}
      lang={lang}
      passengerSummary={`${adults + children + infants} Traveller${adults + children + infants > 1 ? 's' : ''}, ${cabinClass}`}
      renderPassengerSelector={renderPassengerSelector}
      renderResultsToolbar={() => (
        <SearchResultsToolbar
          lang={lang}
          activeSort={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { key: 'price', label: 'Cheapest' },
            { key: 'duration', label: 'Fastest' },
            { key: 'departure', label: 'Departure' },
          ]}
          toggles={[{ key: 'nonstop', label: 'Non-stop', active: nonStopOnly, onToggle: () => setNonStopOnly(v => !v) }]}
        />
      )}
      renderResults={() => (
        <TransportOptions
          mode="flight"
          data={visibleFlights}
          isLoading={isLoading}
          isCached={false}
          origin={origin}
          destination={destination}
          lang={lang}
          currencySymbol={currencySymbol}
          onBookNow={onBookNow}
        />
      )}
    />
  );
};
