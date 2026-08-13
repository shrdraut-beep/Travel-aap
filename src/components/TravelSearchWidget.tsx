import React, { useState } from 'react';
import { 
  Plane, 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  ArrowRightLeft,
  ChevronDown,
  Sparkles,
  Check
} from 'lucide-react';

export interface FlightSearchParams {
  type: 'flight';
  tripType: 'one-way' | 'round-trip';
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travellers: number;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
}

export interface HotelSearchParams {
  type: 'hotel';
  location: string;
  checkInDate: string;
  checkOutDate: string;
  rooms: number;
  guests: number;
}

export type TravelSearchParams = FlightSearchParams | HotelSearchParams;

interface TravelSearchWidgetProps {
  onSearch?: (params: TravelSearchParams) => void;
  className?: string;
  initialTab?: 'flights' | 'hotels';
}

export const TravelSearchWidget: React.FC<TravelSearchWidgetProps> = ({
  onSearch,
  className = '',
  initialTab = 'flights'
}) => {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>(initialTab);

  // Flight State
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('round-trip');
  const [origin, setOrigin] = useState('Mumbai (BOM)');
  const [destination, setDestination] = useState('Delhi (DEL)');
  const [departureDate, setDepartureDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 14);
    return today.toISOString().split('T')[0];
  });
  const [travellers, setTravellers] = useState(1);
  const [cabinClass, setCabinClass] = useState<'Economy' | 'Premium Economy' | 'Business' | 'First'>('Economy');
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);

  // Hotel State
  const [location, setLocation] = useState('Goa, India');
  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 5);
    return today.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 8);
    return today.toISOString().split('T')[0];
  });
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

  // Swap origin and destination
  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'flights') {
      const flightData: FlightSearchParams = {
        type: 'flight',
        tripType,
        origin,
        destination,
        departureDate,
        returnDate: tripType === 'round-trip' ? returnDate : '',
        travellers,
        cabinClass,
      };
      if (onSearch) onSearch(flightData);
    } else {
      const hotelData: HotelSearchParams = {
        type: 'hotel',
        location,
        checkInDate,
        checkOutDate,
        rooms,
        guests,
      };
      if (onSearch) onSearch(hotelData);
    }
  };

  return (
    <div className={`bg-white rounded-3xl p-5 shadow-lg border border-slate-100/80 transition-all duration-300 ${className}`}>
      {/* 1. Tabbed Interface Toggle */}
      <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('flights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'flights'
                ? 'bg-white text-slate-900 shadow-sm shadow-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plane className={`w-4 h-4 ${activeTab === 'flights' ? 'text-rose-500' : 'text-slate-400'}`} />
            <span>Flights</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hotels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'hotels'
                ? 'bg-white text-slate-900 shadow-sm shadow-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeTab === 'hotels' ? 'text-rose-500' : 'text-slate-400'}`} />
            <span>Hotels</span>
          </button>
        </div>

        {/* Extra pill info / One-way vs Round-trip for flights */}
        {activeTab === 'flights' ? (
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                checked={tripType === 'round-trip'}
                onChange={() => setTripType('round-trip')}
                className="accent-rose-500"
              />
              <span>Round Trip</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer ml-2">
              <input
                type="radio"
                name="tripType"
                checked={tripType === 'one-way'}
                onChange={() => setTripType('one-way')}
                className="accent-rose-500"
              />
              <span>One Way</span>
            </label>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Best Price Guaranteed</span>
          </div>
        )}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        {/* ================= 2. FLIGHT SEARCH FORM ================= */}
        {activeTab === 'flights' && (
          <div className="space-y-3">
            {/* Mobile Trip Type selector */}
            <div className="flex sm:hidden items-center gap-4 text-xs font-bold text-slate-600 mb-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="tripTypeMobile"
                  checked={tripType === 'round-trip'}
                  onChange={() => setTripType('round-trip')}
                  className="accent-rose-500"
                />
                <span>Round Trip</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="tripTypeMobile"
                  checked={tripType === 'one-way'}
                  onChange={() => setTripType('one-way')}
                  className="accent-rose-500"
                />
                <span>One Way</span>
              </label>
            </div>

            {/* From & To (Origin & Destination) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
              {/* From Input */}
              <div className="group relative bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-3 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">From (Origin)</span>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="City or Airport"
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Swap Button */}
              <button
                type="button"
                onClick={handleSwapAirports}
                title="Swap Locations"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md text-slate-600 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center transition-all cursor-pointer hidden md:flex"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>

              {/* To Input */}
              <div className="group relative bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-3 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">To (Destination)</span>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="City or Airport"
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Departure, Return, Travellers & Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Departure Date */}
              <div className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-3 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Departure Date</span>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Return Date (Optional) */}
              <div className={`bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-3 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all ${tripType === 'one-way' ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Return Date</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Optional</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                  <input
                    type="date"
                    value={returnDate}
                    disabled={tripType === 'one-way'}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Travellers & Class */}
              <div className="relative bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-3 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all sm:col-span-2 lg:col-span-1">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Travellers & Class</span>
                <button
                  type="button"
                  onClick={() => setShowTravellerDropdown(!showTravellerDropdown)}
                  className="w-full flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {travellers} {travellers === 1 ? 'Passenger' : 'Passengers'}, {cabinClass}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu for Travellers & Class */}
                {showTravellerDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Passengers</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTravellers(Math.max(1, travellers - 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-black w-5 text-center">{travellers}</span>
                        <button
                          type="button"
                          onClick={() => setTravellers(Math.min(9, travellers + 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Cabin Class</span>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {(['Economy', 'Premium Economy', 'Business', 'First'] as const).map((cls) => (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => {
                              setCabinClass(cls);
                              setShowTravellerDropdown(false);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left transition-all ${
                              cabinClass === cls
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {cls}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTravellerDropdown(false)}
                      className="w-full py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold mt-2"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. HOTEL SEARCH FORM ================= */}
        {activeTab === 'hotels' && (
          <div className="space-y-3">
            {/* City, Location or Property */}
            <div className="group relative bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-3 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
              <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                City, Location or Property
              </span>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where are you going?"
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Check-in, Check-out, Rooms & Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Check-in Date */}
              <div className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-3 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Check-in Date</span>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Check-out Date */}
              <div className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-3 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Check-out Date</span>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Rooms & Guests */}
              <div className="relative bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-3 focus-within:bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Rooms & Guests</span>
                <button
                  type="button"
                  onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                  className="w-full flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {rooms} {rooms === 1 ? 'Room' : 'Rooms'}, {guests} {guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu for Rooms & Guests */}
                {showRoomDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95">
                    {/* Rooms counter */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Rooms</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRooms(Math.max(1, rooms - 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-black w-5 text-center">{rooms}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(Math.min(5, rooms + 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Guests counter */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700">Guests</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-black w-5 text-center">{guests}</span>
                        <button
                          type="button"
                          onClick={() => setGuests(Math.min(10, guests + 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowRoomDropdown(false)}
                      className="w-full py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold mt-2"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. SEARCH BUTTON ================= */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 px-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-md shadow-rose-500/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2.5 group"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>
              {activeTab === 'flights' ? 'SEARCH FLIGHTS' : 'SEARCH HOTELS'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
