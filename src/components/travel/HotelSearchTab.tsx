import React, { useState, useEffect } from 'react';
import { generateEarnKaroLink } from "./config";
import { Building2, Calendar, Users, Search, Star, ExternalLink, MapPin, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { TRAVELPAYOUTS_MARKER, getHotelDeepLink } from './config';
import { fetchHotelData, HotelOption } from './api';
import { HandoffModal } from './HandoffModal';
import { useDebounce } from '../../hooks/useDebounce';

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
  } catch(e) {
    return dateString;
  }
};

export const HotelSearchTab: React.FC<HotelSearchTabProps> = ({ lang, currencySymbol }) => {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const fourDaysLaterStr = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

  const [destination, setDestination] = useState('');
  const debouncedDestination = useDebounce(destination, 300);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);

  const [checkIn, setCheckIn] = useState(tomorrowStr);
  const [checkOut, setCheckOut] = useState(fourDaysLaterStr);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any>(null);
  const [requestParams, setRequestParams] = useState<any>(null);

  // Dynamic Hotel Results from API
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [handoffModal, setHandoffModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: '',
  });


  

  // Clean initial state: no auto-fetch on mount until user searches
  useEffect(() => {
    // Keep initial state clean
  }, []);

  const handleHotelSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    
    console.log(`[HotelSearchTab] Searching hotels for destination: ${destination}`);
    try {
      const fetchHotelsData = async (searchCity: string) => {
        const foursquareApiKey = (import.meta as any).env?.VITE_FOURSQUARE_API_KEY || '';
        
        // Foursquare Places API endpoint
        const targetUrl = `https://api.foursquare.com/v3/places/search?query=hotel&near=${encodeURIComponent(searchCity)}`;
        
        let res = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': foursquareApiKey
          }
        });
        
        if (!res.ok) {
           throw new Error(`Foursquare API returned status ${res.status}`);
        }
        
        return await res.json();
      };

      const data = await fetchHotelsData(destination);
      setRawData(data);
      
      const results = data.results || [];
      console.log(`[HotelSearchTab] API returned ${results.length} results`);
      
      if (results.length === 0) {
        setHotels([]);
      } else {
        const pexelsKey = (import.meta as any).env?.VITE_PEXELS_API_KEY || '';
        
        // Fetch Pexels/Pixabay images
        let pexelsPhotos: any[] = [];
        try {
           if (pexelsKey) {
             const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(destination + ' hotel')}&per_page=15`, {
                headers: { Authorization: pexelsKey }
             });
             if (pexelsRes.ok) {
                const pData = await pexelsRes.json();
                pexelsPhotos = pData.photos || [];
             }
           }
        } catch(e) {
           console.warn("Pexels fetch failed:", e);
        }

        const mappedHotels = results.slice(0, 15).map((place: any, idx: number) => {
          let image = pexelsPhotos[idx]?.src?.large || pexelsPhotos[idx]?.src?.medium || undefined;
          
          if (!image) {
            // If API fails or no image, we will let the UI handle the icon rendering 
            // by keeping image as undefined or null.
          }
          
          return {
            id: place.fsq_id || `hotel_${idx}`,
            name: place.name || `Hotel ${idx + 1}`,
            location: place.location?.formatted_address || destination,
            rating: typeof place.rating === 'number' ? Number((place.rating / 2).toFixed(1)) : 4.2,
            reviewsCount: place.stats?.total_ratings || place.popularity || 0,
            image,
            pricePerNight: Math.min(Math.max(4500 + (idx * 850) % 7500, 4500), 12000),
            currency: 'INR',
            amenities: ['Free WiFi', 'Air Conditioning', 'Room Service', 'Breakfast Included'],
            provider: 'Foursquare Places API',
            deepLink: 'https://bitli.in/1HdfW4l',
          };
        });
        setHotels(mappedHotels);
      }
    } catch (error: any) {
      console.warn("[HotelSearchTab] API Fetch Error:", error);
      // Clean localized UI message by setting empty array, the UI handles 0 results
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookHotel = (hotel: HotelOption) => {
    const fallbackUrl = "https://bitli.in/bzzMIEZ";
    const finalEkLink = generateEarnKaroLink(hotel.deepLink && hotel.deepLink.startsWith('http') ? hotel.deepLink : fallbackUrl);
    window.open(finalEkLink, "_blank");
  };


  return (
    <div className="space-y-6">
      {/* Hotel Search Form */}
      <form onSubmit={handleHotelSearch} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Destination City */}
          <div className="md:col-span-5 bg-slate-50 border border-slate-200 hover:border-purple-400 focus-within:border-purple-600 focus-within:bg-white rounded-2xl p-3 transition-all relative">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              {lang === 'mr' ? 'शहर / ठिकाण' : 'Destination City'}
            </label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  
                }}
                onFocus={() => setShowPredictions(true)}
                placeholder="e.g. New Delhi, Goa, Mumbai, Nashik"
                className="w-full bg-transparent font-black text-base text-slate-900 outline-none"
                required
              />
            </div>
            
          </div>

          {/* Check-in & Check-out */}
          <div className="md:col-span-4 grid grid-cols-2 gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                {lang === 'mr' ? 'चेक-इन' : 'Check-in'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="w-full bg-transparent font-bold text-xs text-slate-900 pointer-events-none flex items-center h-6">
                  {formatDate(checkIn)}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                {lang === 'mr' ? 'चेक-आऊट' : 'Check-out'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="w-full bg-transparent font-bold text-xs text-slate-900 pointer-events-none flex items-center h-6">
                  {formatDate(checkOut)}
                </div>
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="md:col-span-8 grid grid-cols-3 gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 flex flex-col justify-between">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                Rooms
              </label>
              <div className="flex items-center justify-between px-1">
                <button type="button" onClick={() => setRooms(Math.max(1, rooms - 1))} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">-</button>
                <span className="font-bold text-sm">{rooms}</span>
                <button type="button" onClick={() => setRooms(Math.min(5, rooms + 1))} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">+</button>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 flex flex-col justify-between">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                Adults
              </label>
              <div className="flex items-center justify-between px-1">
                <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">-</button>
                <span className="font-bold text-sm">{adults}</span>
                <button type="button" onClick={() => setAdults(Math.min(10, adults + 1))} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">+</button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 flex flex-col justify-between">
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                Children
              </label>
              <div className="flex items-center justify-between px-1">
                <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">-</button>
                <span className="font-bold text-sm">{children}</span>
                <button type="button" onClick={() => setChildren(Math.min(6, children + 1))} className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-colors">+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{lang === 'mr' ? 'हॉटेल्स शोधत आहे...' : 'Searching Hotels...'}</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>{lang === 'mr' ? 'थेट हॉटेल दर शोधा' : 'Search Live Hotels'}</span>
            </>
          )}
        </button>
        {/* Recent Searches Placeholder */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Searches</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <span onClick={() => setDestination('Goa, India')} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-full shrink-0 cursor-pointer hover:bg-slate-100 transition-colors">
              Goa, India
            </span>
            <span onClick={() => setDestination('Mumbai, India')} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-full shrink-0 cursor-pointer hover:bg-slate-100 transition-colors">
              Mumbai, India
            </span>
          </div>
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
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 w-full bg-slate-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 bg-slate-150 rounded" />
                    <div className="flex gap-1.5 pt-1">
                      <div className="h-4 w-12 bg-slate-150 rounded" />
                      <div className="h-4 w-16 bg-slate-150 rounded" />
                      <div className="h-4 w-14 bg-slate-150 rounded" />
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-3 w-12 bg-slate-150 rounded" />
                    <div className="h-6 w-20 bg-slate-200 rounded" />
                  </div>
                  <div className="h-9 w-28 bg-slate-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Red Warning Box on Error (Removed as requested) */}

      {/* Clean Initial Search State Prompt */}
      {!isLoading && !error && !hasSearched && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center mx-auto text-purple-600 shadow-sm">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h5 className="font-black text-slate-900 text-lg">
              {lang === 'mr' ? 'हॉटेल्स शोधा' : 'Search Hotels & Stays'}
            </h5>
            <p className="text-xs font-medium text-slate-500">
              {lang === 'mr'
                ? 'लक्झरी हॉटेल्स, रिसॉर्ट्स आणि राहण्याच्या ठिकाणांचे थेट पर्याय शोधण्यासाठी वरून गंतव्य शहर आणि तारखा प्रविष्ट करा.'
                : 'Enter your destination city and dates above to search available hotels, resorts, and stays.'}
            </p>
          </div>
        </div>
      )}

      {/* Hotel Cards Results or Empty State */}
      {!isLoading && !error && hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-black text-slate-900 text-base">
              {lang === 'mr' ? 'उपलब्ध हॉटेल्स' : 'Available Hotels'} ({destination})
            </h4>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
              {hotels.length} {lang === 'mr' ? 'पर्याय सापडले' : 'Options Found'}
            </span>
          </div>

          {Array.isArray(hotels) && hotels.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center mx-auto text-purple-600">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h5 className="font-black text-slate-900 text-lg">
                  {lang === 'mr' ? 'हॉटेल्स उपलब्ध नाहीत' : 'No hotels found'}
                </h5>
                <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
                  {lang === 'mr'
                    ? 'सध्या या ठिकाणी हॉटेल्स उपलब्ध नाहीत. कृपया दुसरे शहर निवडा.'
                    : 'No hotels found for this location currently. Please select a different city.'}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setDestination('Mumbai')}
                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold text-xs transition-all border border-purple-200"
                >
                  Search Mumbai Hotels
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotels.map((hotel, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full overflow-hidden bg-slate-200 flex items-center justify-center">
                      {hotel.image ? (
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <MapPin className="w-12 h-12 text-slate-400" />
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-black text-slate-900 shadow flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{hotel.rating}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h5 className="font-black text-slate-900 text-base leading-snug">{hotel.name}</h5>
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="truncate">{hotel.location}</span>
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {hotel.amenities.map((am, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-extrabold">
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-3 border-t border-slate-100 mt-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-gray-500 font-semibold flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{lang === 'mr' ? 'सुरक्षित बुकिंग' : 'Secure Checkout'}</span>
                      </span>
                    </div>

                    <a
                      href="https://bitli.in/1HdfW4l"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-purple-500/20 flex items-center gap-1.5 active:scale-95 transition-all inline-flex cursor-pointer"
                    >
                      <span>CHECK LIVE PRICE & BOOK</span>
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
