import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TripGroup } from '../../types';
import { ExplorePackagesView } from './ExplorePackagesView';
import { FlightSearchTab } from '../travel/FlightSearchTab';
import { HotelSearchTab } from '../travel/HotelSearchTab';
import { TrainInfoTab } from '../travel/TrainInfoTab';
import { BusSearchTab } from '../travel/BusSearchTab';
import { CarSearchTab } from '../travel/CarSearchTab';
import { 
  Compass, 
  Ticket, 
  Building2, 
  CheckCircle2, 
  Plane, 
  Train, 
  Bus, 
  Car, 
  X, 
  Tag, 
  Sparkles, 
  Star, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  Search,
  Gift
} from 'lucide-react';
import { flightService } from '../../services/flights/FlightService';
import { hotelService } from '../../services/hotels/HotelService';
import { trainService } from '../../services/trains/TrainService';
import { carService } from '../../services/cars/CarService';
import { cabService } from '../../services/cabs/CabService';
import { busService } from '../../services/buses/BusService';
import { packageService } from '../../services/packages/PackageService';
import { mockCoupons } from '../../data/mockDataStore';

import { 
  BookingItemPayload 
} from '../../pages/CheckoutPage';

export const TRAVELPAYOUTS_MARKER = "554147";

interface BookingsViewProps {
  trip: TripGroup;
  lang: string;
  t: (key: string) => string;
  currencySymbol: string;
  themeColor?: string;
  onUpdateTrip?: (updatedTrip: TripGroup) => void;
}

type ActiveVerticalModal = 'packages' | 'flights' | 'hotels' | 'trains' | 'cars' | 'cabs' | 'buses' | null;

export const BookingsView: React.FC<BookingsViewProps> = ({
  trip,
  lang,
  t,
  currencySymbol = '₹',
  themeColor = '#2563eb'
}) => {
  const isMr = lang === 'mr';
  const [activeModal, setActiveModal] = useState<ActiveVerticalModal>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // E2E Sandbox & Checkout Modal State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allInventoryItems, setAllInventoryItems] = useState<BookingItemPayload[]>([]);
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenCheckout = (itemPayload: BookingItemPayload) => {
    navigate('/checkout', { state: { item: itemPayload, currencySymbol, lang } });
  };

  useEffect(() => {
    async function fetchData() {
      const [pkgs, flights, hotels, trains, cars, cabs, buses] = await Promise.all([
        packageService.getAll(),
        flightService.getAllFlights(),
        hotelService.getAllHotels(),
        trainService.getAllTrains(),
        carService.getAll(),
        cabService.getAll(),
        busService.getAll(),
      ]);

      const inventoryItems: BookingItemPayload[] = [
        ...pkgs.map((pkg: any) => ({
          id: pkg.id,
          title: pkg.title,
          vertical: 'package' as const,
          subtitle: `${pkg.durationDays}D/${pkg.durationNights}N • ${pkg.destination}`,
          location: pkg.destination,
          amount: pkg.price || pkg.amount,
          image: pkg.image,
          provider: pkg.agentName,
          meta: { rating: pkg.rating, reviews: pkg.reviewsCount }
        })),
        ...flights.map((fl: any) => ({
          id: fl.id,
          title: `${fl.airline} (${fl.flightNumber})`,
          vertical: 'flight' as const,
          subtitle: `${fl.origin} (${fl.originCode}) → ${fl.destination} (${fl.destinationCode})`,
          location: `${fl.originCode} to ${fl.destinationCode}`,
          time: `${fl.departureTime} - ${fl.arrivalTime}`,
          duration: fl.duration,
          amount: fl.amount,
          provider: fl.airline,
          meta: { stops: fl.stops, cabin: fl.cabinClass }
        })),
        ...hotels.map((ht: any) => ({
          id: ht.id,
          title: ht.name,
          vertical: 'hotel' as const,
          subtitle: `${ht.city}, ${ht.location}`,
          location: ht.location,
          amount: ht.amountPerNight || ht.amount,
          image: ht.images?.[0] || '',
          provider: ht.name,
          meta: { rating: ht.rating, amenities: ht.amenities }
        })),
        ...trains.map((tr: any) => ({
          id: tr.id,
          title: `${tr.trainName} (#${tr.trainNumber})`,
          vertical: 'train' as const,
          subtitle: `${tr.origin} (${tr.originCode}) → ${tr.destination} (${tr.destinationCode})`,
          location: `${tr.originCode} - ${tr.destinationCode}`,
          time: `${tr.departureTime} - ${tr.arrivalTime}`,
          duration: tr.duration,
          amount: tr.amount,
          provider: 'Indian Railways (IRCTC)',
          meta: { days: tr.runsOn?.join(', ') || 'All Days' }
        })),
        ...cars.map((cr: any) => ({
          id: cr.id,
          title: `${cr.brand} ${cr.model}`,
          vertical: 'car' as const,
          subtitle: `${cr.category} • ${cr.fuelType} • ${cr.transmission}`,
          location: cr.pickupLocations?.[0] || 'Multiple Hubs',
          amount: cr.amountPerDay || cr.amount,
          image: cr.image,
          provider: 'RouTripO Self-Drive Fleet',
          meta: { seats: cr.seats, rating: cr.rating }
        })),
        ...cabs.map((cb: any) => ({
          id: cb.id,
          title: `${cb.cabType} (${cb.carModel})`,
          vertical: 'cab' as const,
          subtitle: `${cb.driverName} • Includes Driver & AC`,
          location: 'Local & Outstation',
          amount: cb.amount,
          image: cb.image,
          provider: cb.driverName,
          meta: { rating: cb.driverRating, perKm: `₹${cb.ratePerKm}/km` }
        })),
        ...buses.map((bs: any) => ({
          id: bs.id,
          title: `${bs.operatorName} (${bs.busType})`,
          vertical: 'bus' as const,
          subtitle: `${bs.origin} → ${bs.destination}`,
          location: `${bs.origin} to ${bs.destination}`,
          time: `${bs.departureTime} - ${bs.arrivalTime}`,
          duration: bs.duration,
          amount: bs.amount,
          provider: bs.operatorName,
          meta: { rating: bs.rating, seats: `${bs.availableSeats} seats left` }
        }))
      ];
      setAllInventoryItems(inventoryItems);
    }
    fetchData();
  }, []);


  const filteredItems = allInventoryItems.filter((it) => {
    const matchCategory = selectedCategory === 'all' || it.vertical === selectedCategory;
    const matchQuery = !searchQuery.trim() || 
      it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (it.subtitle && it.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (it.location && it.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchQuery;
  });

  return (
    <div className="flex flex-col min-h-screen w-full p-4 sm:p-6 pb-44 sm:pb-36 space-y-7 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[300] bg-slate-900 text-white px-5 py-3 rounded-2xl font-extrabold text-xs shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 7 Verticals Navigation Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-indigo-600 uppercase font-black">
              {isMr ? 'सर्वसमावेशक ट्रॅव्हल सेवा' : '7 Core Travel Verticals'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isMr ? 'राऊट्रिपो ट्रॅव्हल हब' : 'RouTriO Travel Services'}
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero-Trust Escrow Payments</span>
          </div>
        </div>

        {/* 7 Vertical Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* 1. Tour Packages */}
          <button
            type="button"
            onClick={() => setActiveModal('packages')}
            className="p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-200 hover:border-purple-300 active:scale-95 text-slate-800 cursor-pointer group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🏝️</span>
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-center line-clamp-1">
              {isMr ? 'टूर पॅकेजेस' : 'Tour Packages'}
            </span>
          </button>

          {/* 2. Flights */}
          <button
            type="button"
            onClick={() => setActiveModal('flights')}
            className="p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-200 hover:border-sky-300 active:scale-95 text-slate-800 cursor-pointer group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">✈️</span>
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-center line-clamp-1">
              {isMr ? 'विमान' : 'Flights'}
            </span>
          </button>

          {/* 3. Hotels */}
          <button
            type="button"
            onClick={() => setActiveModal('hotels')}
            className="p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200 hover:border-orange-300 active:scale-95 text-slate-800 cursor-pointer group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🏨</span>
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-center line-clamp-1">
              {isMr ? 'हॉटेल्स' : 'Hotels'}
            </span>
          </button>

          {/* 4. Trains */}
          <button
            type="button"
            onClick={() => setActiveModal('trains')}
            className="p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md bg-gradient-to-br from-emerald-50 to-green-50/50 border border-emerald-200 hover:border-emerald-300 active:scale-95 text-slate-800 cursor-pointer group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🚆</span>
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-center line-clamp-1">
              {isMr ? 'ट्रेन' : 'Trains'}
            </span>
          </button>

          {/* 5. Self-Drive Cars */}
          <button
            type="button"
            onClick={() => setActiveModal('cars')}
            className="p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md bg-gradient-to-br from-teal-50 to-cyan-50/50 border border-teal-200 hover:border-teal-300 active:scale-95 text-slate-800 cursor-pointer group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🚗</span>
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-center line-clamp-1">
              {isMr ? 'कार रेंटल्स' : 'Self-Drive'}
            </span>
          </button>

          {/* 6. Cabs & Taxis */}
          <button
            type="button"
            onClick={() => setActiveModal('cabs')}
            className="p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md bg-gradient-to-br from-yellow-50 to-amber-50/50 border border-yellow-200 hover:border-yellow-300 active:scale-95 text-slate-800 cursor-pointer group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🚕</span>
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-center line-clamp-1">
              {isMr ? 'कॅब्स / टॅक्सी' : 'Cabs & Taxi'}
            </span>
          </button>

          {/* 7. Buses */}
          <button
            type="button"
            onClick={() => setActiveModal('buses')}
            className="col-span-2 sm:col-span-1 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md bg-gradient-to-br from-rose-50 to-pink-50/50 border border-rose-200 hover:border-rose-300 active:scale-95 text-slate-800 cursor-pointer group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🚌</span>
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-center line-clamp-1">
              {isMr ? 'बस' : 'Buses'}
            </span>
          </button>
        </div>
      </div>

      {/* PROMO CODE & INSTANT CHECKOUT TESTING BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black uppercase rounded-md tracking-wider">
                Live E2E Sandbox
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">100% Verified Testing</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Instant Booking & Promo Code Engine
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Test coupon validations across all 7 travel verticals. Applying <strong className="text-amber-300 font-bold">WELCOME500</strong> or <strong className="text-amber-300 font-bold">SAVE20</strong> dynamically recalculates price, strikes through the old rate, and charges the exact discounted amount.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-white/10 p-2.5 rounded-2xl border border-white/10 shrink-0">
            <Tag className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">Active Test Codes:</span>
            {mockCoupons.slice(0, 3).map((c) => (
              <span key={c.code} className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-lg text-[10px] font-mono font-black">
                {c.code}
              </span>
            ))}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-t border-white/10">
          {/* Vertical Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {[
              { id: 'all', label: 'All Verticals (7)' },
              { id: 'package', label: '🏝️ Packages' },
              { id: 'flight', label: '✈️ Flights' },
              { id: 'hotel', label: '🏨 Hotels' },
              { id: 'train', label: '🚆 Trains' },
              { id: 'car', label: '🚗 Cars' },
              { id: 'cab', label: '🚕 Cabs' },
              { id: 'bus', label: '🚌 Buses' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by city, airline, hotel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
            />
          </div>
        </div>
      </div>

      {/* ALL VERTICALS LIVE INVENTORY CARDS WITH 'BOOK NOW' BUTTONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-black text-slate-900">
            {selectedCategory === 'all' ? 'All Live Inventory' : `${selectedCategory.toUpperCase()} Options`}
            <span className="text-xs font-bold text-slate-500 ml-2">({filteredItems.length} available)</span>
          </h4>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Ready for Instant Checkout
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Optional Photo or Top Icon Bar */}
              {item.image ? (
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-slate-700">
                    <span>{item.vertical}</span>
                  </div>
                  {item.meta?.rating && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-900 px-2.5 py-1 rounded-lg text-xs font-black shadow flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{item.meta.rating}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 pb-0 flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200">
                    {item.vertical}
                  </span>
                  {item.duration && (
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.duration}
                    </span>
                  )}
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h5 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.title}
                  </h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {item.subtitle || item.location}
                  </p>

                  {item.time && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Timing: {item.time}</span>
                    </div>
                  )}
                </div>

                {/* Pricing & Book Now Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Fare</span>
                    <div className="text-xl font-black text-slate-900 flex items-baseline gap-1">
                      <span>{currencySymbol}{item.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-normal text-slate-500">
                        {item.vertical === 'hotel' ? '/night' : item.vertical === 'car' ? '/day' : '/person'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenCheckout(item)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL-SCREEN MODAL OVERLAYS FOR VERTICAL TABS */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col">
          <div className="flex-none pt-safe bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight flex items-center gap-2">
                {activeModal === 'packages' && (isMr ? '🏝️ टूर पॅकेजेस' : '🏝️ Tour Packages')}
                {activeModal === 'flights' && (isMr ? '✈️ विमान शोध' : '✈️ Flight Search')}
                {activeModal === 'hotels' && (isMr ? '🏨 हॉटेल बुकिंग' : '🏨 Hotel Search')}
                {activeModal === 'trains' && (isMr ? '🚆 ट्रेन माहिती' : '🚆 Train Search')}
                {activeModal === 'cars' && (isMr ? '🚗 सेल्फ-ड्राईव्ह कार' : '🚗 Self-Drive Car Rentals')}
                {activeModal === 'cabs' && (isMr ? '🚕 कॅब व टॅक्सी' : '🚕 Cabs & Taxis with Driver')}
                {activeModal === 'buses' && (isMr ? '🚌 बस बुकिंग' : '🚌 Bus Search')}
              </h3>
              <button 
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-full transition-colors active:scale-95 shadow-sm border border-rose-200 flex items-center justify-center cursor-pointer"
                title={isMr ? 'बंद करा' : 'Close'}
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-safe [&::-webkit-scrollbar]:hidden">
            <div className="p-4 sm:p-6 pb-24">
              {activeModal === 'packages' && <ExplorePackagesView lang={lang} onBookNow={handleOpenCheckout} />}
              {activeModal === 'flights' && <FlightSearchTab lang={lang} currencySymbol={currencySymbol} onBookNow={handleOpenCheckout} />}
              {activeModal === 'hotels' && <HotelSearchTab lang={lang} currencySymbol={currencySymbol} onBookNow={handleOpenCheckout} />}
              {activeModal === 'trains' && <TrainInfoTab lang={lang} currencySymbol={currencySymbol} onBookNow={handleOpenCheckout} />}
              {activeModal === 'cars' && <CarSearchTab lang={lang} currencySymbol={currencySymbol} onBookNow={handleOpenCheckout} />}
              {activeModal === 'cabs' && <CarSearchTab lang={lang} currencySymbol={currencySymbol} onBookNow={handleOpenCheckout} />}
              {activeModal === 'buses' && <BusSearchTab lang={lang} currencySymbol={currencySymbol} onBookNow={handleOpenCheckout} />}
            </div>
          </div>
        </div>
      )}

      {/* Universal Checkout Modal is now a dedicated page via React Router */}
    </div>
  );
};
