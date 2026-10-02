import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { DebugErrorAlert } from '../components/ui/DebugErrorAlert';

export const StaysResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { searchParams: any };

  const [hotels, setHotels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('top_rated');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const searchParams = state?.searchParams || {
    destination: 'North Goa',
    location: 'Calangute',
    checkInDate: '2026-10-15',
    checkOutDate: '2026-10-18',
    adults: 2,
    rooms: 1
  };

  const destination = searchParams.destination || searchParams.location || 'North Goa';
  const checkIn = searchParams.checkInDate || '15 Oct 2026';
  const checkOut = searchParams.checkOutDate || '18 Oct 2026';
  const guests = searchParams.adults || 2;
  const rooms = searchParams.rooms || 1;

  const fetchStays = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });
      const data = await res.json();
      if (data.success && (data.results || data.hotels)) {
        const list = data.results || data.hotels;
        setHotels(list);
      } else {
        setError(data.error || 'No hotels found for the selected destination');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch hotels from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStays();
  }, [state]);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter logic
  const filteredHotels = hotels.filter(h => {
    if (activeFilter === 'top_rated') return (h.rating || 0) >= 4.5;
    if (activeFilter === 'beachfront') {
      const text = `${h.name} ${h.location || ''} ${(h.features || []).join(' ')}`.toLowerCase();
      return text.includes('beach') || text.includes('sea') || text.includes('ocean');
    }
    if (activeFilter === 'pool') {
      const text = `${h.name} ${h.location || ''} ${(h.features || []).join(' ')}`.toLowerCase();
      return text.includes('pool') || text.includes('villa');
    }
    if (activeFilter === 'breakfast') {
      const text = `${h.name} ${(h.amenities || []).map((a: any) => a.name || a).join(' ')}`.toLowerCase();
      return text.includes('breakfast');
    }
    if (activeFilter === 'budget') {
      const p = h.pricePerNight || h.price || 0;
      return p <= 3500;
    }
    return true;
  });

  return (
    <div className="bg-[#f6faff] min-h-screen text-[#171c20] font-['Outfit',sans-serif] antialiased flex flex-col">
      {/* 1. Curved Fixed Header (Stitch design) */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-white/95 backdrop-blur-xl rounded-b-[24px] shadow-[0_4px_20px_rgba(0,101,145,0.06)] border-b border-slate-100">
        <div className="h-20 px-4 flex items-center justify-between gap-2 max-w-4xl mx-auto">
          <button
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-[#f0f4fa] flex items-center justify-center text-[#0F172A] hover:bg-[#eaeef4] active:scale-95 transition-all shrink-0 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>

          <div className="flex flex-col items-center justify-center text-center flex-1 min-w-0 px-2">
            <div className="flex items-center justify-center gap-1.5 truncate max-w-full">
              <span className="font-bold text-[16px] text-[#0F172A] truncate">{destination}</span>
              <span className="material-symbols-outlined text-[#006591] text-[16px] shrink-0 font-bold">arrow_forward</span>
              <span className="font-bold text-[16px] text-[#006591] truncate">Stays & Resorts</span>
            </div>
            <span className="text-[11px] font-medium text-[#475569] font-['JetBrains_Mono',monospace] truncate mt-0.5">
              {checkIn} – {checkOut} • {guests} Guests • {rooms} Room
            </span>
          </div>

          <button
            aria-label="Edit search details"
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-[#c9e6ff]/40 flex items-center justify-center text-[#006591] hover:bg-[#c9e6ff] active:scale-95 transition-all shrink-0 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full pt-24 pb-28 min-h-screen bg-[#F8FAFC] max-w-4xl mx-auto">
        {/* Sub-header trip metadata chip bar */}
        <section className="px-4 pt-2 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-[#006591] text-[18px]">calendar_month</span>
            <span className="text-[12px] font-['JetBrains_Mono',monospace] text-[#475569] truncate">
              {checkIn}–{checkOut} • {guests} Guests • {rooms} Room
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[#eaeef4] px-2.5 py-0.5 rounded-full shrink-0">
            <span className="material-symbols-outlined text-[#006c49] text-[14px]">bolt</span>
            <span className="text-[11px] font-['JetBrains_Mono',monospace] text-[#00714d] font-bold">
              {filteredHotels.length} Properties
            </span>
          </div>
        </section>

        {/* Quick Filter Pills */}
        <section className="w-full px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveFilter('top_rated')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] whitespace-nowrap shadow-xs transition-all shrink-0 cursor-pointer ${
                activeFilter === 'top_rated'
                  ? 'bg-[#0ea5e9] text-white font-bold'
                  : 'bg-white text-[#475569] hover:text-[#0F172A]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
              <span>Top Rated (4.5+)</span>
            </button>

            <button
              onClick={() => setActiveFilter('beachfront')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] whitespace-nowrap shadow-xs transition-all shrink-0 cursor-pointer ${
                activeFilter === 'beachfront'
                  ? 'bg-[#0ea5e9] text-white font-bold'
                  : 'bg-white text-[#475569] hover:text-[#0F172A]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">waves</span>
              <span>Beachfront</span>
            </button>

            <button
              onClick={() => setActiveFilter('pool')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] whitespace-nowrap shadow-xs transition-all shrink-0 cursor-pointer ${
                activeFilter === 'pool'
                  ? 'bg-[#0ea5e9] text-white font-bold'
                  : 'bg-white text-[#475569] hover:text-[#0F172A]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">pool</span>
              <span>Pool Villa</span>
            </button>

            <button
              onClick={() => setActiveFilter('breakfast')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] whitespace-nowrap shadow-xs transition-all shrink-0 cursor-pointer ${
                activeFilter === 'breakfast'
                  ? 'bg-[#0ea5e9] text-white font-bold'
                  : 'bg-white text-[#475569] hover:text-[#0F172A]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">bakery_dining</span>
              <span>Free Breakfast</span>
            </button>

            <button
              onClick={() => setActiveFilter('budget')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] whitespace-nowrap shadow-xs transition-all shrink-0 cursor-pointer ${
                activeFilter === 'budget'
                  ? 'bg-[#0ea5e9] text-white font-bold'
                  : 'bg-white text-[#475569] hover:text-[#0F172A]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">savings</span>
              <span>Budget (Under ₹3,500)</span>
            </button>
          </div>
        </section>

        {/* Hotel Cards List */}
        <section className="px-4 pt-1 pb-4 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-3">
                <Loader2 className="w-8 h-8 text-[#0ea5e9] animate-spin" />
                <p className="text-slate-500 font-semibold text-sm">Searching verified resort & stay inventory...</p>
              </div>
            ) : error || filteredHotels.length === 0 ? (
              <DebugErrorAlert error={error || 'No hotels matched the active filters.'} onRetry={fetchStays} />
            ) : (
              filteredHotels.map((hotel, idx) => {
                const hotelName = hotel.name || 'Luxury Resort & Spa';
                const hotelLocation = hotel.location || `${destination}, Goa`;
                const price = Number(hotel.pricePerNight || hotel.price || 8500);
                const originalPrice = Number(hotel.originalPrice || Math.round(price * 1.25));
                const rating = Number(hotel.rating || 4.8);
                const reviews = hotel.reviewsCount || Math.floor(180 + idx * 65);
                const tag = hotel.tag || (idx === 0 ? 'Bestseller' : '5-Star Luxury');
                const image = hotel.image || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
                const isSaved = Boolean(wishlist[hotel.id || idx]);

                return (
                  <motion.article
                    key={hotel.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex flex-col bg-white rounded-2xl shadow-[0_4px_18px_rgba(0,101,145,0.08)] overflow-hidden transition-all hover:shadow-lg active:scale-[0.99] cursor-pointer border border-slate-100"
                    onClick={() => {
                      navigate('/stays/details', {
                        state: {
                          hotel,
                          searchParams
                        }
                      });
                    }}
                  >
                    {/* Hero Image Container */}
                    <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                      <img
                        alt={hotelName}
                        src={image}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/75 via-transparent to-transparent pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-[#de8712] text-white px-2.5 py-1 rounded-full font-['JetBrains_Mono',monospace] text-[11px] font-bold tracking-wide uppercase shadow-sm">
                          {tag}
                        </span>
                        <span className="bg-white/90 backdrop-blur-md text-[#006591] font-['JetBrains_Mono',monospace] text-[11px] px-2 py-1 rounded-full font-semibold">
                          5-Star Luxury
                        </span>
                      </div>

                      {/* Wishlist Heart */}
                      <button
                        type="button"
                        aria-label="Save to wishlist"
                        onClick={(e) => toggleWishlist(hotel.id || String(idx), e)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-rose-500 shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: isSaved ? '"FILL" 1' : '"FILL" 0' }}
                        >
                          favorite
                        </span>
                      </button>

                      {/* Bottom Overlay: Location & Star rating */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[#6ffbbe] text-[16px]">location_on</span>
                          <span className="text-[13px] font-medium drop-shadow-sm truncate max-w-[200px] sm:max-w-none">
                            {hotelLocation}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md text-[#0F172A] px-2 py-0.5 rounded-lg shadow-sm">
                          <span className="material-symbols-outlined text-[#de8712] text-[15px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                            star
                          </span>
                          <span className="font-['JetBrains_Mono',monospace] text-xs font-bold">{rating}</span>
                          <span className="font-['JetBrains_Mono',monospace] text-[10px] text-slate-500">({reviews})</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 flex flex-col gap-3">
                      <h2 className="text-base sm:text-lg font-bold text-[#0F172A] leading-snug">
                        {hotelName}
                      </h2>

                      {/* Amenities Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#eaeef4] text-[#475569] font-['JetBrains_Mono',monospace] text-[11px]">
                          <span className="material-symbols-outlined text-[13px] text-[#006591]">free_breakfast</span> Free Breakfast
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#eaeef4] text-[#475569] font-['JetBrains_Mono',monospace] text-[11px]">
                          <span className="material-symbols-outlined text-[13px] text-[#006c49]">beach_access</span> Private Beach
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#eaeef4] text-[#475569] font-['JetBrains_Mono',monospace] text-[11px]">
                          <span className="material-symbols-outlined text-[13px] text-[#0ea5e9]">pool</span> Infinity Pool
                        </span>
                      </div>

                      {/* Price & CTA Row */}
                      <div className="pt-2 flex items-end justify-between border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-['JetBrains_Mono',monospace] text-slate-400">Per night incl. taxes</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-black text-[#0F172A]">
                              ₹{price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs font-['JetBrains_Mono',monospace] text-slate-400 line-through">
                              ₹{originalPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <button
                          className="px-5 py-2.5 rounded-xl bg-[#0ea5e9] text-white text-xs sm:text-sm font-bold shadow-[0_3px_12px_rgba(14,165,233,0.35)] hover:bg-[#0284c7] transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/stays/details', {
                              state: {
                                hotel,
                                searchParams
                              }
                            });
                          }}
                        >
                          <span>Book Now</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};
