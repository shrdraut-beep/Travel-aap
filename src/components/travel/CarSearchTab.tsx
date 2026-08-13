import React, { useState, useEffect } from 'react';
import { Car, Calendar, MapPin, Users, Clock, ShieldCheck, Star, ExternalLink, CheckCircle2, ChevronRight, Fuel, Sparkles, Layers, UserPlus } from 'lucide-react';
import { SearchInput } from '../SearchInput';
import { mergeAndDeduplicateInventory, InventoryItem } from '../../utils/inventoryDeduplication';
import { useVendorStore } from '../../store/useVendorStore';
import { VendorRegistrationScreen } from '../views/VendorRegistrationScreen';

interface CarSearchTabProps {
  lang: string;
  currencySymbol: string;
}

// 1. Third-Party Aggregator API Results (e.g. Savaari / OTA API)
const THIRD_PARTY_API_CABS: InventoryItem[] = [
  {
    id: 'api-cab-1',
    name: 'Dzire / Etios',
    location: 'Nashik to Goa Route',
    city: 'Nashik',
    type: 'Comfort Sedan (AC)',
    seats: 4,
    bags: 3,
    perKm: '₹14/km',
    estimatedTotal: '₹2,950',
    rating: '4.7',
    reviews: 140,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600',
    features: ['Extra Legroom', 'Standard Driver', 'AC + Music'],
    source: 'api'
  },
  {
    id: 'api-cab-2',
    name: 'Toyota Innova Crysta',
    location: 'Nashik to Goa Route',
    city: 'Nashik',
    type: 'Premium SUV (7 Seater)',
    seats: 7,
    bags: 5,
    perKm: '₹22/km',
    estimatedTotal: '₹5,400',
    rating: '4.8',
    reviews: 180,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600',
    features: ['Rear AC', 'Expressway Toll Extra'],
    source: 'api'
  },
  {
    id: 'api-cab-3',
    name: 'Maruti WagonR / Swift',
    location: 'Nashik Local Route',
    city: 'Nashik',
    type: 'Hatchback (AC)',
    seats: 4,
    bags: 2,
    perKm: '₹12/km',
    estimatedTotal: '₹2,300',
    rating: '4.6',
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
    features: ['Clean Interior', 'Standard Cab'],
    source: 'api'
  }
];

// 2. Direct Vendor Registrations (Higher Profit Margin & Direct Contracts)
const DIRECT_VENDOR_CABS: InventoryItem[] = [
  {
    id: 'direct-cab-1',
    name: 'Dzire / Etios',
    location: 'Nashik to Goa Direct Partner Fleet',
    city: 'Nashik',
    type: 'Comfort Sedan (AC)',
    seats: 4,
    bags: 3,
    perKm: '₹13/km',
    estimatedTotal: '₹2,800',
    rating: '4.9',
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600',
    features: ['Extra Legroom', 'Boot Space for 3 Large Bags', 'Top Rated Driver', 'RouTriO VIP Perks'],
    source: 'direct',
    isDirectPartner: true,
    isRouTriOVerified: true,
    badgeText: 'RouTriO Verified'
  },
  {
    id: 'direct-cab-2',
    name: 'Toyota Innova Crysta',
    location: 'Nashik Direct VIP Fleet',
    city: 'Nashik',
    type: 'Premium SUV (7 Seater)',
    seats: 7,
    bags: 5,
    perKm: '₹21/km',
    estimatedTotal: '₹5,200',
    rating: '5.0',
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600',
    features: ['Captain Seats', 'Dual Climate AC', 'Luxury Interior', 'Verified Expressway Driver'],
    source: 'direct',
    isDirectPartner: true,
    isRouTriOVerified: true,
    badgeText: 'Direct Partner'
  },
  {
    id: 'direct-cab-3',
    name: 'Ertiga / Triber',
    location: 'Direct Partner Fleet',
    city: 'Nashik',
    type: 'Family SUV (6 Seater)',
    seats: 6,
    bags: 4,
    perKm: '₹16/km',
    estimatedTotal: '₹3,900',
    rating: '4.9',
    reviews: 185,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600',
    features: ['6 Comfort Seats', 'Rear AC Vents', 'Carrier Available', 'Long Distance Special'],
    source: 'direct',
    isDirectPartner: true,
    isRouTriOVerified: true,
    badgeText: 'RouTriO Verified'
  }
];

export const CarSearchTab: React.FC<CarSearchTabProps> = ({ lang, currencySymbol }) => {
  const isMr = lang === 'mr';
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const { applications: vendorApps } = useVendorStore();
  const [showVendorRegistration, setShowVendorRegistration] = useState(false);

  const [serviceType, setServiceType] = useState<'outstation' | 'local' | 'airport' | 'rental'>('outstation');
  const [pickupCity, setPickupCity] = useState('Nashik');
  const [dropCity, setDropCity] = useState('Goa');
  const [pickupDate, setPickupDate] = useState(tomorrowStr);
  const [pickupTime, setPickupTime] = useState('06:00');
  const [passengers, setPassengers] = useState(4);
  const [hasSearched, setHasSearched] = useState(true);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Map approved vendor cab applications
  const approvedVendorCabs: InventoryItem[] = vendorApps
    .filter(app => app.category === 'Cab' && app.status === 'APPROVED')
    .map(app => ({
      id: app.id,
      name: app.businessName,
      location: `${app.city} Direct Fleet`,
      city: app.city,
      type: 'Direct Vendor Vehicle',
      seats: 5,
      bags: 4,
      perKm: app.pricingDetails,
      estimatedTotal: app.pricingDetails,
      rating: '4.9',
      reviews: 180,
      image: app.photoUrls[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600',
      features: ['Verified Fleet Owner', 'Zero Middleman Charges', 'GPS Tracked', 'RouTriO VIP Perks'],
      source: 'direct',
      isDirectPartner: true,
      isRouTriOVerified: true,
      badgeText: 'RouTriO Verified'
    }));

  const allDirectVendorCabs = [...approvedVendorCabs, ...DIRECT_VENDOR_CABS];

  // Inventory & Deduplication State
  const [displayedCabs, setDisplayedCabs] = useState<InventoryItem[]>([]);
  const [dedupStats, setDedupStats] = useState<{
    deduplicatedCount: number;
    directPartnerCount: number;
    apiCount: number;
  }>({ deduplicatedCount: 0, directPartnerCount: 0, apiCount: 0 });

  // Run Smart Merge & Deduplication on load / search
  useEffect(() => {
    const { mergedResults, deduplicatedCount, directPartnerCount, apiCount } = mergeAndDeduplicateInventory(
      THIRD_PARTY_API_CABS,
      allDirectVendorCabs
    );

    setDisplayedCabs(mergedResults);
    setDedupStats({
      deduplicatedCount,
      directPartnerCount,
      apiCount
    });
  }, [pickupCity, dropCity, serviceType, vendorApps]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const { mergedResults, deduplicatedCount, directPartnerCount, apiCount } = mergeAndDeduplicateInventory(
      THIRD_PARTY_API_CABS,
      allDirectVendorCabs
    );
    setDisplayedCabs(mergedResults);
    setDedupStats({ deduplicatedCount, directPartnerCount, apiCount });
  };

  const handleConfirmBooking = () => {
    if (!contactName || !contactPhone) {
      alert(isMr ? 'कृपया तुमचे नाव आणि मोबाईल नंबर भरा' : 'Please enter your name and phone number');
      return;
    }
    setBookingSuccess(true);
  };

  if (showVendorRegistration) {
    return <VendorRegistrationScreen onBack={() => setShowVendorRegistration(false)} />;
  }

  return (
    <div className="space-y-6">
      
      {/* B2B Cab Fleet Vendor Direct Registration Callout Banner */}
      <div className="bg-gradient-to-r from-orange-900 via-slate-900 to-indigo-950 rounded-2xl p-3.5 px-4 text-white shadow-sm flex items-center justify-between gap-3 text-xs border border-orange-500/30">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
          <div>
            <span className="font-extrabold text-orange-300">Are you a Cab / Taxi Fleet Owner?</span>
            <p className="text-[11px] text-slate-300 font-medium">
              List your cabs on RouTriO Direct Network to connect with travellers directly with zero booking commissions.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowVendorRegistration(true)}
          className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Apply as Vendor
        </button>
      </div>

      {/* Service Type Switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'outstation', label: isMr ? 'आउटस्टेशन टॅक्सी' : 'Outstation Cab' },
          { id: 'local', label: isMr ? 'स्थानिक ८ तास / ८० किमी' : 'Local Hourly Rental' },
          { id: 'airport', label: isMr ? 'विमानतळ पिकअप/ड्रॉप' : 'Airport Taxi' },
          { id: 'rental', label: isMr ? 'सेल्फ-ड्राइव्ह कार' : 'Self-Drive Rental' }
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setServiceType(s.id as any)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              serviceType === s.id
                ? 'bg-white text-orange-600 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSearch} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              {isMr ? 'पिकअप शहर / स्थान' : 'Pickup Location'}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-orange-500 absolute left-3 top-3.5" />
              <input
                type="text"
                value={pickupCity}
                onChange={(e) => setPickupCity(e.target.value)}
                placeholder="उदा. नाशिक, मुंबई, पुणे"
                className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              {isMr ? 'ड्रॉप स्थान (Destination)' : 'Drop Location'}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-500 absolute left-3 top-3.5" />
              <input
                type="text"
                value={dropCity}
                onChange={(e) => setDropCity(e.target.value)}
                placeholder="उदा. गोवा, शिर्डी, महाबळेश्वर"
                className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              {isMr ? 'तारीख' : 'Pickup Date'}
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-900 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              {isMr ? 'वेळ' : 'Time'}
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-900 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              {isMr ? 'प्रवासी' : 'Passengers'}
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-900 outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n} Persons</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Car className="w-5 h-5" />
          <span>{isMr ? 'गाड्या आणि टॅक्सी शोधा' : 'Search Cabs & Cars'}</span>
        </button>
      </form>

      {/* Available Cars List with Smart Deduplication */}
      {hasSearched && (
        <div className="space-y-4">

          {/* Deduplication Status Summary Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between gap-3 text-xs border border-orange-500/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <span className="font-extrabold text-amber-300">Smart Inventory Deduplication Active</span>
                <p className="text-[11px] text-slate-300 font-medium">
                  Direct Vendor Cabs prioritized over Third-Party Aggregator API listings for maximum margin & reliability.
                </p>
              </div>
            </div>
            {dedupStats.deduplicatedCount > 0 && (
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-full shrink-0">
                {dedupStats.deduplicatedCount} Duplicate API Cab Removed
              </span>
            )}
          </div>

          <div className="flex items-center justify-between px-1">
            <h4 className="font-black text-slate-900 text-base">
              {isMr ? `उपलब्ध टॅक्सी (${pickupCity} ➔ ${dropCity})` : `Available Cabs (${pickupCity} ➔ ${dropCity})`}
            </h4>
            <div className="flex items-center gap-2">
              {dedupStats.directPartnerCount > 0 && (
                <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {dedupStats.directPartnerCount} Direct Partner Cabs
                </span>
              )}
              <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                {displayedCabs.length} Options
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedCabs.map((car) => (
              <div 
                key={car.id} 
                className={`bg-white rounded-3xl overflow-hidden border shadow-md hover:shadow-xl transition-all flex flex-col justify-between ${
                  car.isDirectPartner
                    ? 'border-emerald-300 ring-2 ring-emerald-400/20 shadow-emerald-900/5'
                    : 'border-slate-200'
                }`}
              >
                <div className="relative h-40">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* RouTriO Verified / Direct Partner Visual Badge */}
                  {car.isDirectPartner ? (
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-amber-300 fill-emerald-800" />
                      <span>{car.badgeText || 'RouTriO Verified'}</span>
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 bg-slate-900/80 text-slate-200 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border border-slate-700">
                      <Car className="w-3 h-3 text-orange-400" />
                      <span>Aggregator Cab</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                    <div>
                      <h5 className="font-black text-base leading-tight flex items-center gap-1.5">
                        <span>{car.name}</span>
                        {car.isDirectPartner && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950 shrink-0" />
                        )}
                      </h5>
                      <p className="text-xs text-white/80 font-medium">{car.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-amber-300">{car.estimatedTotal}</span>
                      <span className="text-[10px] text-white/70 block">({car.perKm})</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-4 text-xs font-extrabold text-slate-600">
                    <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                      <Users className="w-3.5 h-3.5 text-orange-500" /> {car.seats} Seats
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                      <Fuel className="w-3.5 h-3.5 text-emerald-500" /> AC Included
                    </span>
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-xl border border-amber-200">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {car.rating}
                    </span>
                  </div>

                  {Array.isArray(car.features) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {car.features.map((f: string, idx: number) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-bold">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedCar(car);
                      setBookingSuccess(false);
                    }}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>{isMr ? 'बुकिंग करा' : 'Book This Cab'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg">
                {bookingSuccess ? (isMr ? '🎉 बुकिंग यशस्वी!' : '🎉 Cab Booked!') : (isMr ? 'टॅक्सी बुकिंग तपशील' : 'Confirm Cab Booking')}
              </h3>
              <button
                onClick={() => setSelectedCar(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {!bookingSuccess ? (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm">{selectedCar.name}</span>
                    <span className="font-black text-orange-600 text-base">{selectedCar.estimatedTotal}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">{pickupCity} ➔ {dropCity} ({pickupDate} at {pickupTime})</p>
                  <p className="text-[11px] text-emerald-600 font-bold">✓ Driver, Toll, Fuel & AC Included</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                      {isMr ? 'तुमचे नाव' : 'Passenger Name'}
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Enter Full Name"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                      {isMr ? 'मोबाईल नंबर (ड्रायव्हर कॉल करेल)' : 'Mobile Number'}
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="10-digit Phone Number"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  {isMr ? 'नक्की बुकिंग करा (₹० टोकन)' : 'Confirm & Reserve Cab'}
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-3xl">
                  ✓
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">
                    {isMr ? 'तुमची टॅक्सी यशस्वीपणे बुक झाली आहे!' : 'Cab Booking Confirmed!'}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Booking ID: <span className="font-mono font-bold text-slate-800">ROUTRIPO-CAB-{Math.floor(100000 + Math.random() * 900000)}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-2">
                    {isMr ? `चालक २ तासांपूर्वी ${contactPhone} वर संपर्क साधेल.` : `Driver details will be sent via SMS to ${contactPhone}.`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCar(null)}
                  className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
