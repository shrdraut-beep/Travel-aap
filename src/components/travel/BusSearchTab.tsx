import React, { useState } from 'react';
import { searchBuses } from '../../services/busTravelService';
import { TransportOptions } from './TransportOptions';
import { BookingFunnelLayout } from './BookingFunnelLayout';
import { Users, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

export const BusSearchTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const navigate = useNavigate();
  const isMr = lang === 'mr';
  const [origin, setOrigin] = useState('Mumbai');
  const [destination, setDestination] = useState('Goa');
  const [departDate, setDepartDate] = useState(getTomorrowDate());
  const [passengers, setPassengers] = useState(1);
  const [busType, setBusType] = useState('AC Sleeper');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [busData, setBusData] = useState<any[]>([]);

  
  const handleBusSearch = async () => {
    navigate('/buses', {
      state: {
        searchParams: {
          origin: origin || 'Mumbai',
          destination: destination || 'Goa',
          date: departDate,
          passengers,
          busType
        }
      }
    });
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
