import React, { useState } from 'react';
import { TransportOptions } from './TransportOptions';
import { BookingFunnelLayout } from './BookingFunnelLayout';
import { Users, Minus, Plus } from 'lucide-react';

export const BusSearchTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const isMr = lang === 'mr';
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [busType, setBusType] = useState('AC Sleeper');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [busData, setBusData] = useState<any[]>([]);

  const handleBusSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setTimeout(() => {
      setBusData([
        {
          operatorName: 'VRL Travels',
          busType: 'Volvo Multi-Axle A/C Sleeper',
          origin: origin || 'Mumbai',
          destination: destination || 'Goa',
          departureTime: '21:00',
          arrivalTime: '08:00',
          duration: '11h 00m',
          price: 1800,
          seatsAvailable: 12
        },
        {
          operatorName: 'Neeta Tours',
          busType: 'A/C Seater / Sleeper',
          origin: origin || 'Mumbai',
          destination: destination || 'Goa',
          departureTime: '22:30',
          arrivalTime: '09:45',
          duration: '11h 15m',
          price: 1200,
          seatsAvailable: 4
        }
      ]);
      setIsLoading(false);
    }, 800);
  };

  const renderPassengerSelector = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Passengers</h4>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
          <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Minus className="w-4 h-4"/></button>
          <span className="font-black text-slate-900 w-4 text-center">{passengers}</span>
          <button onClick={() => setPassengers(Math.min(6, passengers + 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Plus className="w-4 h-4"/></button>
        </div>
      </div>
      <div>
        <h4 className="font-bold text-slate-800 mb-3">Bus Type</h4>
        <div className="grid grid-cols-2 gap-2">
          {['AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Volvo'].map(c => (
            <button
              key={c}
              onClick={() => setBusType(c)}
              className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${busType === c ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
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
      mode="bus"
      onBack={onBack}
      origin={origin}
      setOrigin={setOrigin}
      destination={destination}
      setDestination={setDestination}
      date={departDate}
      setDate={setDepartDate}
      onSearch={handleBusSearch}
      isLoading={isLoading}
      hasSearched={hasSearched}
      lang={lang}
      passengerSummary={`${passengers} Pax, ${busType}`}
      renderPassengerSelector={renderPassengerSelector}
      renderResults={() => (
        <TransportOptions
          mode="bus"
          data={busData}
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
