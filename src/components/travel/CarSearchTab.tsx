import React, { useState } from 'react';

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

import { useNavigate } from 'react-router-dom';
import { TransportOptions } from './TransportOptions';
import { BookingFunnelLayout } from './BookingFunnelLayout';
import { Users, Minus, Plus } from 'lucide-react';

export const CarSearchTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const navigate = useNavigate();
  const isMr = lang === 'mr';
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState(getTomorrowDate());
  const [passengers, setPassengers] = useState(2);
  const [cabType, setCabType] = useState<'regular' | 'rental'>('regular');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [carData, setCarData] = useState<any[]>([]);
  const [vehicleCategory, setVehicleCategory] = useState<'sedan' | 'suv' | 'traveller'>('suv');

  const handleCarSearch = () => {
    navigate('/cars/results', {
      state: {
        searchParams: {
          pickUpLocation: origin,
          dropOffLocation: destination,
          pickUpDate: departDate,
          dropOffDate: departDate, // using same date for basic one-way UI for now
          passengers,
          cabType,
          vehicleCategory
        }
      }
    });
  };

  const maxPassengers = vehicleCategory === 'sedan' ? 4 : vehicleCategory === 'suv' ? 6 : 12;

  const renderPassengerSelector = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-bold text-slate-800 mb-3">Vehicle Type</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'sedan', label: 'Sedan (Max 4)' },
            { id: 'suv', label: 'SUV (Max 6)' },
            { id: 'traveller', label: 'Tempo (Max 12)' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setVehicleCategory(cat.id as any);
                const limit = cat.id === 'sedan' ? 4 : cat.id === 'suv' ? 6 : 12;
                if (passengers > limit) setPassengers(limit);
              }}
              className={`py-2 rounded-[16px] text-xs font-black transition-all cursor-pointer ${
                vehicleCategory === cat.id
                  ? 'premium-gradient-pink text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Passengers</h4>
          <p className="text-[10px] text-slate-500">
            {vehicleCategory === 'sedan' ? 'Sedan capacity: Max 4' : vehicleCategory === 'suv' ? 'SUV capacity: Max 6' : 'Tempo capacity: Max 12'}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 rounded-[16px] p-1">
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
              if (passengers < maxPassengers) {
                setPassengers(passengers + 1);
              }
            }} 
            disabled={passengers >= maxPassengers}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {passengers >= maxPassengers && (
        <div className="p-3 bg-premium-pink-soft border border-premium-pink rounded-[16px] text-xs font-bold text-premium-pink leading-snug">
          ⚠️ Cab Limit: Maximum {maxPassengers} passengers allowed for {vehicleCategory.toUpperCase()}. For larger groups, select Tempo Traveller.
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-[11px] font-bold">
            ⚡ ZuelPay Cabs API
          </span>
          <span className="hidden sm:inline text-[11px]">Sedan • SUV • Outstation • Airport Transfers</span>
        </div>
      </div>
      <BookingFunnelLayout
        mode="car"
        onBack={onBack}
        origin={origin}
        setOrigin={setOrigin}
        destination={destination}
        setDestination={setDestination}
        date={departDate}
        setDate={setDepartDate}
        onSearch={handleCarSearch}
        isLoading={isLoading}
        hasSearched={hasSearched}
        lang={lang}
        cabType={cabType}
        setCabType={setCabType}
        passengerSummary={`${passengers} Passenger${passengers > 1 ? 's' : ''}`}
        renderPassengerSelector={renderPassengerSelector}
        renderResults={() => (
          <TransportOptions
            mode="car"
            data={carData}
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
    </div>
  );
};
