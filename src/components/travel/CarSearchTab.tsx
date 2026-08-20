import React, { useState } from 'react';
import { TransportOptions } from './TransportOptions';
import { BookingFunnelLayout } from './BookingFunnelLayout';
import { Users, Minus, Plus } from 'lucide-react';

export const CarSearchTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const isMr = lang === 'mr';
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [passengers, setPassengers] = useState(2);
  const [cabType, setCabType] = useState<'regular' | 'rental'>('regular');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [carData, setCarData] = useState<any[]>([]);

  const handleCarSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setTimeout(() => {
      setCarData([
        {
          vehicleName: 'Toyota Innova Crysta',
          category: 'SUV',
          capacity: '6 Seats',
          bags: '4 Bags',
          price: cabType === 'regular' ? 2400 : 3500,
          originalPrice: cabType === 'regular' ? 2800 : 4000,
          provider: 'RouTripo Assured',
          rating: 4.8,
          features: ['AC', 'Free Cancellation', 'Expert Driver']
        },
        {
          vehicleName: 'Honda City / Hyundai Verna',
          category: 'Sedan',
          capacity: '4 Seats',
          bags: '2 Bags',
          price: cabType === 'regular' ? 1200 : 2000,
          originalPrice: cabType === 'regular' ? 1500 : 2400,
          provider: 'Local Partners',
          rating: 4.6,
          features: ['AC', 'Free Cancellation']
        }
      ]);
      setIsLoading(false);
    }, 800);
  };

  const [vehicleCategory, setVehicleCategory] = useState<'sedan' | 'suv' | 'traveller'>('suv');

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
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                vehicleCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
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
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 leading-snug">
          ⚠️ Cab Limit: Maximum {maxPassengers} passengers allowed for {vehicleCategory.toUpperCase()}. For larger groups, select Tempo Traveller.
        </div>
      )}
    </div>
  );

  return (
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
  );
};
