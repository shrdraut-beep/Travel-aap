import React, { useState } from 'react';
import { TransportOptions } from './TransportOptions';
import { BookingFunnelLayout } from './BookingFunnelLayout';
import { Users, Minus, Plus } from 'lucide-react';

export const TrainInfoTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const isMr = lang === 'mr';
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [classType, setClassType] = useState('SL');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [trainData, setTrainData] = useState<any[]>([]);

  const handleTrainSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setTimeout(() => {
      setTrainData([
        {
          trainNumber: '12951',
          trainName: 'Rajdhani Express',
          origin: origin || 'Mumbai Central',
          destination: destination || 'New Delhi',
          departureTime: '17:00',
          arrivalTime: '08:32',
          duration: '15h 32m',
          classes: ['3A', '2A', '1A'],
          price: 2400,
          status: 'Available'
        },
        {
          trainNumber: '12903',
          trainName: 'Golden Temple Mail',
          origin: origin || 'Mumbai Central',
          destination: destination || 'Nizamuddin',
          departureTime: '21:25',
          arrivalTime: '19:00',
          duration: '21h 35m',
          classes: ['SL', '3A', '2A', '1A'],
          price: 680,
          status: 'WL 12'
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
          <p className="text-[10px] text-slate-500">IRCTC Limit: Max 6 per booking</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
          <button 
            type="button"
            onClick={() => setPassengers(Math.max(1, passengers - 1))} 
            disabled={passengers <= 1}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Minus className="w-4 h-4"/>
          </button>
          <span className="font-black text-slate-900 w-4 text-center">{passengers}</span>
          <button 
            type="button"
            onClick={() => {
              if (passengers < 6) {
                setPassengers(passengers + 1);
              }
            }} 
            disabled={passengers >= 6}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {passengers >= 6 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 leading-snug">
          ⚠️ IRCTC Rule: Maximum 6 passengers allowed per general ticket (4 for Tatkal).
        </div>
      )}

      <div>
        <h4 className="font-bold text-slate-800 mb-3">Class</h4>
        <div className="grid grid-cols-4 gap-2">
          {['SL', '3A', '2A', '1A'].map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setClassType(c)}
              className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${classType === c ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
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
      mode="train"
      onBack={onBack}
      origin={origin}
      setOrigin={setOrigin}
      destination={destination}
      setDestination={setDestination}
      date={departDate}
      setDate={setDepartDate}
      onSearch={handleTrainSearch}
      isLoading={isLoading}
      hasSearched={hasSearched}
      lang={lang}
      passengerSummary={`${passengers} Pax, ${classType}`}
      renderPassengerSelector={renderPassengerSelector}
      renderResults={() => (
        <TransportOptions
          mode="train"
          data={trainData}
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
