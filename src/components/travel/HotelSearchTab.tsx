import React, { useState } from 'react';
import { TransportOptions } from './TransportOptions';
import { BookingFunnelLayout } from './BookingFunnelLayout';
import { Users, Minus, Plus } from 'lucide-react';

export const HotelSearchTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const isMr = lang === 'mr';
  const [destination, setDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hotelData, setHotelData] = useState<any[]>([]);

  const handleHotelSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setTimeout(() => {
      setHotelData([
        {
          id: 'HTL-1',
          name: 'Taj Exotica Resort & Spa',
          location: destination || 'Goa',
          rating: 4.9,
          reviews: 1284,
          price: 18500,
          originalPrice: 22000,
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800',
          amenities: ['Pool', 'Spa', 'Beachfront', 'Free Breakfast']
        },
        {
          id: 'HTL-2',
          name: 'W Hotel',
          location: destination || 'Goa',
          rating: 4.7,
          reviews: 856,
          price: 15200,
          originalPrice: 18000,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
          amenities: ['Pool', 'Bar', 'Gym', 'Pet Friendly']
        }
      ]);
      setIsLoading(false);
    }, 800);
  };

  const renderPassengerSelector = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Guests</h4>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
          <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Minus className="w-4 h-4"/></button>
          <span className="font-black text-slate-900 w-4 text-center">{guests}</span>
          <button onClick={() => setGuests(Math.min(10, guests + 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Plus className="w-4 h-4"/></button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Rooms</h4>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
          <button onClick={() => setRooms(Math.max(1, rooms - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Minus className="w-4 h-4"/></button>
          <span className="font-black text-slate-900 w-4 text-center">{rooms}</span>
          <button onClick={() => setRooms(Math.min(5, rooms + 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-800 font-bold active:scale-95"><Plus className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );

  return (
    <BookingFunnelLayout
      mode="hotel"
      onBack={onBack}
      origin=""
      setOrigin={() => {}}
      destination={destination}
      setDestination={setDestination}
      date={checkInDate}
      setDate={setCheckInDate}
      onSearch={handleHotelSearch}
      isLoading={isLoading}
      hasSearched={hasSearched}
      lang={lang}
      passengerSummary={`${guests} Guest${guests > 1 ? 's' : ''}, ${rooms} Room${rooms > 1 ? 's' : ''}`}
      renderPassengerSelector={renderPassengerSelector}
      renderResults={() => (
        <TransportOptions
          mode="hotel"
          data={hotelData}
          isLoading={isLoading}
          isCached={false}
          origin=""
          destination={destination}
          lang={lang}
          currencySymbol={currencySymbol}
          onBookNow={onBookNow}
        />
      )}
    />
  );
};
