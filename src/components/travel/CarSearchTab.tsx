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

  const renderPassengerSelector = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Passengers</h4>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
          <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Minus className="w-4 h-4"/></button>
          <span className="font-black text-slate-900 w-4 text-center">{passengers}</span>
          <button onClick={() => setPassengers(Math.min(7, passengers + 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Plus className="w-4 h-4"/></button>
        </div>
      </div>
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
