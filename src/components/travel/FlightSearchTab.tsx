import React, { useState } from 'react';
import { TransportOptions } from './TransportOptions';
import { BookingFunnelLayout } from './BookingFunnelLayout';
import { IATA_TO_CITY_MAP, CITY_TO_IATA_MAP, CITY_GROUPS } from '../../data/airports';
import { Users, Minus, Plus } from 'lucide-react';

export const FlightSearchTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const isMr = lang === 'mr';
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [flightData, setFlightData] = useState<any[]>([]);

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

  const renderPassengerSelector = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Adults</h4>
          <p className="text-[10px] text-slate-500">12+ years (Max 9 per booking)</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
          <button 
            type="button"
            onClick={() => setAdults(Math.max(1, adults - 1))} 
            disabled={adults <= 1}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Minus className="w-4 h-4"/>
          </button>
          <span className="font-black text-slate-900 w-4 text-center">{adults}</span>
          <button 
            type="button"
            onClick={() => {
              if (adults < 9) {
                setAdults(adults + 1);
              }
            }} 
            disabled={adults >= 9}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {adults >= 9 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 leading-snug">
          ⚠️ Airline Rule: Maximum 9 passengers allowed per standard booking. For more than 9 passengers, please make a Group Booking.
        </div>
      )}

      <div>
        <h4 className="font-bold text-slate-800 mb-3">Cabin Class</h4>
        <div className="grid grid-cols-3 gap-2">
          {['economy', 'business', 'first'].map(c => (
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
      passengerSummary={`${adults} Adult${adults > 1 ? 's' : ''}, ${cabinClass}`}
      renderPassengerSelector={renderPassengerSelector}
      renderResults={() => (
        <TransportOptions
          mode="flight"
          data={flightData}
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
