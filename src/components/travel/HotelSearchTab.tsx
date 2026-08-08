import React, { useState } from 'react';
import { generateEarnKaroLink } from "./config";
import { Building2, Search, Star, ExternalLink, MapPin, ShieldCheck, Loader2, Navigation, Phone, Globe } from 'lucide-react';
import { HotelOption } from './api';
import { HandoffModal } from './HandoffModal';

interface HotelSearchTabProps {
  lang: string;
  currencySymbol: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Select Date';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' });
  } catch (e) {
    return dateString;
  }
};

export const HotelSearchTab: React.FC<HotelSearchTabProps> = ({ lang }) => {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const fourDaysLaterStr = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

  const [destination, setDestination] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [checkIn, setCheckIn] = useState(tomorrowStr);
  const [checkOut, setCheckOut] = useState(fourDaysLaterStr);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Foursquare Hotel Results
  const [hotels, setHotels] = useState<any[]>([]);
  const [handoffModal, setHandoffModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  const handleHotelSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setError(null);

    // CRITICAL USER REQUIREMENT:
    // Only city and placeName are sent to Foursquare API endpoint.
    // Rooms, adults, children, and dates are NOT sent to Foursquare API.
    try {
      const queryParams = new URLSearchParams({
        city: destination.trim(),
        place: placeName.trim()
      });

      console.log(`[Foursquare Hotel API] Requesting hotels for city=${destination.trim()}, place=${placeName.trim()} (Excluding rooms/guests/dates from API payload)`);

      const res = await fetch(`/api/foursquare-hotels?${queryParams.toString()}`);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.hotels)) {
        setHotels(data.hotels);
      } else {
        throw new Error(data.error || 'Foursquare API failed');
      }
    } catch (err: any) {
      console.warn("[Foursquare API Fetch Error]:", err);
      // Client-side fallback to direct backend request or fallback empty
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hotel Search Form */}
      <form onSubmit={handleHotelSearch} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl space-y-4">
        
        {/* Destination City & Optional Place Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-200 hover:border-purple-400 focus-within:border-purple-600 focus-within:bg-white rounded-2xl p-3 transition-all">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              {lang === 'mr' ? 'शहर / गंतव्य स्थान (City)' : 'Destination City'} <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={lang === 'mr' ? 'उदा. नाशिक, मुंबई, गोवा, पुणे' : 'e.g. Nashik, Mumbai, Goa, Pune'}
                className="w-full bg-transparent font-black text-base text-slate-900 outline-none"
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 hover:border-purple-400 focus-within:border-purple-600 focus-within:bg-white rounded-2xl p-3 transition-all">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              {lang === 'mr' ? 'हॉटेल / ठिकाणाचे नाव (पर्यायी)' : 'Hotel / Place Name (Optional)'}
            </label>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder={lang === 'mr' ? 'उदा. ताज, मॅरियट, रिसॉर्ट' : 'e.g. Taj, Marriott, Resort'}
                className="w-full bg-transparent font-bold text-sm text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Dates & Guest Occupancy (Kept in UI state only) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Check-in & Check-out */}
          <div className="md:col-span-6 grid grid-cols-2 gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                {lang === 'mr' ? 'चेक-इन तारीख' : 'Check-in Date'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-full bg-transparent font-bold text-xs text-slate-900 pointer-events-none flex items-center h-6">
                  {formatDate(checkIn)}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                {lang === 'mr' ? 'चेक-आऊट तारीख' : 'Check-out Date'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-full bg-transparent font-bold text-xs text-slate-900 pointer-events-none flex items-center h-6">
                  {formatDate(checkOut)}
                </div>
              </div>
            </div>
          </div>

          {/* Rooms, Adults, Children Controls */}
          <div className="md:col-span-6 grid grid-cols-3 gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 flex flex-col justify-between">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                {lang === 'mr' ? 'खोल्या (Rooms)' : 'Rooms'}
              </label>
              <div className="flex items-center justify-between px-1">
                <button type="button" onClick={() => setRooms(Math.max(1, rooms - 1))} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">-</button>
                <span className="font-bold text-sm">{rooms}</span>
                <button type="button" onClick={() => setRooms(Math.min(5, rooms + 1))} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">+</button>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 flex flex-col justify-between">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                {lang === 'mr' ? 'प्रौढ (Adults)' : 'Adults'}
              </label>
              <div className="flex items-center justify-between px-1">
                <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">-</button>
                <span className="font-bold text-sm">{adults}</span>
                <button type="button" onClick={() => setAdults(Math.min(10, adults + 1))} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">+</button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 flex flex-col justify-between">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                {lang === 'mr' ? 'मुले (Children)' : 'Children'}
              </label>
              <div className="flex items-center justify-between px-1">
                <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">-</button>
                <span className="font-bold text-sm">{children}</span>
                <button type="button" onClick={() => setChildren(Math.min(6, children + 1))} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{lang === 'mr' ? 'फॉरस्क्वेअर API द्वारे हॉटेल्स शोधत आहे...' : 'Searching via Foursquare API...'}</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>{lang === 'mr' ? 'हॉटेल्स शोधा (Foursquare API Search)' : 'Search Hotels (Foursquare API)'}</span>
            </>
          )}
        </button>

        {/* Quick Suggestion Chips */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">
            {lang === 'mr' ? 'लोकप्रिय शहरे:' : 'Popular Cities:'}
          </span>
          {['Goa', 'Nashik', 'Mumbai', 'Pune', 'Shirdi', 'Mahabaleshwar'].map((cityName) => (
            <button
              key={cityName}
              type="button"
              onClick={() => {
                setDestination(cityName);
              }}
              className="px-3 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-xs font-bold rounded-full shrink-0 transition-colors"
            >
              {cityName}
            </button>
          ))}
        </div>
      </form>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="h-5 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 w-full bg-slate-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 bg-slate-150 rounded" />
                    <div className="flex gap-1.5 pt-1">
                      <div className="h-4 w-12 bg-slate-150 rounded" />
                      <div className="h-4 w-16 bg-slate-150 rounded" />
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-6 w-20 bg-slate-200 rounded" />
                  <div className="h-9 w-28 bg-slate-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Initial Search Prompt State */}
      {!isLoading && !error && !hasSearched && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center mx-auto text-purple-600 shadow-sm">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h5 className="font-black text-slate-900 text-lg">
              {lang === 'mr' ? 'फॉरस्क्वेअर API द्वारे हॉटेल्स शोधा' : 'Foursquare Places API Hotel Search'}
            </h5>
            <p className="text-xs font-semibold text-slate-500">
              {lang === 'mr'
                ? 'कोणत्याही शहरातील हॉटेल्सची नावे, फोटो, पूर्ण पत्ता व रेटिंग थेट Foursquare API द्वारे पाहण्यासाठी वर शहराचे नाव प्रविष्ट करा.'
                : 'Enter a destination city above to fetch verified hotels with photos, full address, and ratings powered by Foursquare Places API.'}
            </p>
          </div>
        </div>
      )}

      {/* Foursquare Results Grid Cards */}
      {!isLoading && !error && hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-black text-slate-900 text-base">
              {lang === 'mr' ? 'हॉटेल शोध निकाल' : 'Hotel Search Results'} ({destination})
            </h4>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
              {hotels.length} {lang === 'mr' ? 'पर्याय सापडले (Foursquare)' : 'Results Found'}
            </span>
          </div>

          {hotels.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center mx-auto text-purple-600">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h5 className="font-black text-slate-900 text-lg">
                  {lang === 'mr' ? 'हॉटेल्स सापडली नाहीत' : 'No Hotels Found'}
                </h5>
                <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
                  {lang === 'mr'
                    ? 'या शहरासाठी फॉरस्क्वेअर API वर हॉटेल्स सापडले नाहीत. कृपया शहराचे नाव तपासा.'
                    : 'No hotel results found for this location. Please try a different city name.'}
                </p>
              </div>
            </div>
          ) : (
            /* Card Format Rendering */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotels.map((hotel, index) => (
                <div
                  key={hotel.id || index}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Hotel Banner Photo & Rating Badge */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Fallback if image fails
                          (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80`;
                        }}
                      />
                      
                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-slate-900/90 text-white backdrop-blur px-3 py-1 rounded-full text-xs font-black shadow flex items-center gap-1 border border-slate-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span>{hotel.rating} / 5</span>
                      </div>

                      {/* Foursquare Tag */}
                      <div className="absolute bottom-3 left-3 bg-purple-900/80 text-purple-100 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border border-purple-500/30">
                        <Building2 className="w-3 h-3 text-purple-300" />
                        <span>{hotel.category || 'Hotel & Resort'}</span>
                      </div>
                    </div>

                    {/* Hotel Details */}
                    <div className="p-5 space-y-3">
                      {/* Hotel Name */}
                      <h5 className="font-black text-slate-900 text-lg leading-snug group-hover:text-purple-600 transition-colors">
                        {hotel.name}
                      </h5>

                      {/* Full Address */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1">
                        <p className="text-xs font-semibold text-slate-600 flex items-start gap-1.5 leading-relaxed">
                          <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                          <span><strong className="text-slate-900">{lang === 'mr' ? 'पूर्ण पत्ता:' : 'Full Address:'}</strong> {hotel.location}</span>
                        </p>
                      </div>

                      {/* Amenities Chips */}
                      {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hotel.amenities.map((am: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-extrabold border border-purple-100">
                              ✓ {am}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <a
                        href={hotel.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-black text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-100/70 hover:bg-purple-200/80 px-3 py-1.5 rounded-xl transition-all border border-purple-200"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{lang === 'mr' ? 'नकाशा व दिशा (Maps)' : 'View Map & Address'}</span>
                      </a>
                    </div>

                    <a
                      href="https://bitli.in/1HdfW4l"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-orange-500/20 flex items-center gap-1.5 active:scale-95 transition-all inline-flex cursor-pointer"
                    >
                      <span>{lang === 'mr' ? 'दर तपासा व बुक करा' : 'Check Price & Book'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Affiliate Handoff Modal */}
      <HandoffModal
        isOpen={handoffModal.isOpen}
        onClose={() => setHandoffModal((prev) => ({ ...prev, isOpen: false }))}
        partnerUrl={handoffModal.url}
        itemTitle={handoffModal.title}
        lang={lang}
      />
    </div>
  );
};
