import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, CheckCircle, Info, Wifi, Coffee, Car, Waves, ShieldCheck, ThumbsUp, Map as MapIcon, Calendar, Clock, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DebugErrorAlert } from '../components/ui/DebugErrorAlert';

export const StaysDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { hotel: any; searchParams: any };
  const baseHotel = state?.hotel;
  
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!baseHotel?.id) {
      setIsLoading(false);
      return;
    }
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/stays/${baseHotel.id}?checkInDate=${state.searchParams?.checkInDate || ''}&checkOutDate=${state.searchParams?.checkOutDate || ''}&adults=${state.searchParams?.adults || 2}`);
        const data = await res.json();
        if (data.success && data.results) {
           // Travelport Property Details response
           setDetails(data.results);
        }
      } catch (err) {
        console.error('Failed to fetch details', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [baseHotel, state?.searchParams]);

  // Fallback to base hotel data if detailed data isn't available or still loading
  const hotel = details || baseHotel || {};
  
  const name = baseHotel?.name || hotel?.name || hotel?.propertyInfo?.name || 'Unknown Property';
  const rating = baseHotel?.rating || hotel?.starRating || hotel?.propertyInfo?.ratings?.[0]?.value || 0;
  const reviewsCount = baseHotel?.reviewsCount || 748;
  const addressStr = baseHotel?.address || hotel?.address?.street || hotel?.propertyInfo?.address?.street || 'Location not available';
  
  // Aggregate Images
  let images: string[] = [];
  if (details?.images && details.images.length > 0) {
    images = details.images.map((img: any) => img.url || img);
  } else if (hotel?.propertyInfo?.imageURLs?.length > 0) {
    images = hotel.propertyInfo.imageURLs.map((img: any) => img.url);
  } else if (baseHotel?.images?.length > 0) {
    images = baseHotel.images;
  } else if (baseHotel?.image) {
    images = [baseHotel.image];
  } else {
    images = ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80'];
  }

  // Aggregate Amenities
  let amenities: string[] = [];
  if (details?.amenities) {
    amenities = details.amenities;
  } else if (hotel?.propertyInfo?.amenities) {
    amenities = hotel.propertyInfo.amenities.map((a: any) => a.description || a.name || a);
  } else if (baseHotel?.amenities) {
    amenities = baseHotel.amenities;
  }
  if (amenities.length === 0) {
    amenities = ['Free Wi-Fi', 'Swimming pool', 'Free parking', 'Spa', 'Front desk [24-hour]', 'Fitness center'];
  }

  // Room Types & Rates
  let rooms = [];
  if (details?.roomTypes) {
    rooms = details.roomTypes;
  } else if (hotel?.rawOffer?.roomTypes) {
    rooms = hotel.rawOffer.roomTypes;
  } else {
    // Generate mock rooms if none provided from search
    rooms = [
      {
        roomTypeCode: 'SUP',
        name: 'Superior Room',
        description: '26 m² / 280 ft² • City view • Non-smoking',
        maxOccupancy: 3,
        rates: [
          {
            ratePlanCode: 'PROMO',
            rateName: 'Room with Breakfast',
            nightlyPrice: baseHotel?.pricePerNight || 4500,
            totalPrice: (baseHotel?.pricePerNight || 4500) * 2,
            breakfastIncluded: true,
            refundable: false,
            cancellationPolicy: 'Non-refundable'
          }
        ]
      },
      {
        roomTypeCode: 'PRM',
        name: 'Premium Room - Pool View',
        description: '38 m² / 409 ft² • Pool view • Balcony/terrace',
        maxOccupancy: 3,
        rates: [
          {
            ratePlanCode: 'FLEX',
            rateName: 'Premium Flex',
            nightlyPrice: (baseHotel?.pricePerNight || 4500) * 1.2,
            totalPrice: (baseHotel?.pricePerNight || 4500) * 1.2 * 2,
            breakfastIncluded: true,
            refundable: true,
            cancellationPolicy: 'Free cancellation before check-in'
          }
        ]
      }
    ];
  }

  return (
    <div className="min-h-screen  pb-24">
      {/* App Bar overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between pointer-events-none">
         <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/40 hover:bg-white/80 flex items-center justify-center backdrop-blur shadow-sm text-slate-800 transition-colors pointer-events-auto">
           <ArrowLeft className="w-5 h-5" />
         </button>
      </div>

      {/* Hero Gallery */}
      <div className="relative h-72 sm:h-96 bg-slate-200">
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeImageIndex}
            src={images[activeImageIndex]} 
            alt={name} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover" 
          />
        </AnimatePresence>
        
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          {activeImageIndex + 1} / {images.length}
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 right-20 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.slice(0, 10).map((img: string, idx: number) => (
              <button 
                key={idx} 
                onClick={() => setActiveImageIndex(idx)}
                className={`w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${activeImageIndex === idx ? 'border-white shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white -mt-4 rounded-t-3xl relative z-10 p-5 sm:p-6 shadow-sm border-b border-slate-200">
        
        {/* Title & Rating */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{name}</h1>
        <div className="flex items-center gap-1.5 mt-2">
           {rating > 0 && (
             <div className="flex items-center text-orange-500">
               {[...Array(Math.floor(rating))].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
             </div>
           )}
           <span className="text-xs text-slate-500 ml-1">({reviewsCount} reviews)</span>
        </div>
        
        <p className="text-sm text-slate-500 mt-2 flex items-start gap-1.5">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> 
          <span>{addressStr} <span className="text-pink-600 font-medium ml-1 cursor-pointer">870 meters from city center</span></span>
        </p>

        {/* Agoda-style Score Badge */}
        {rating > 0 && (
          <div className="mt-4 flex items-center gap-3 bg-transparent p-3 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-rose-200">
              {rating * 2 > 10 ? 8.0 : (rating * 2).toFixed(1)}
            </div>
            <div>
              <div className="font-extrabold text-rose-700">Excellent</div>
              <div className="text-xs text-slate-500 font-medium">{reviewsCount} reviews</div>
            </div>
          </div>
        )}

      </div>

      <div className="max-w-4xl mx-auto space-y-3 p-3 sm:p-4 mt-1">
        
        {/* Selling Out Fast Banner */}
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-rose-700 font-bold text-sm">Selling out fast!</h3>
            <p className="text-xs text-rose-600/80 mt-0.5 leading-relaxed">Already 2 room types are sold out for your dates. Remaining rooms from <span className="font-bold">₹{baseHotel?.pricePerNight || 9450}</span></p>
          </div>
        </div>

        {/* Top Amenities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg text-slate-900">Top Amenities</h3>
            <button className="text-pink-600 font-bold text-sm">See all</button>
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            {amenities.slice(0, 6).map((am: string, i: number) => {
              let Icon = CheckCircle;
              const amLower = am.toLowerCase();
              if (amLower.includes('wifi') || amLower.includes('internet')) Icon = Wifi;
              else if (amLower.includes('pool')) Icon = Waves;
              else if (amLower.includes('park')) Icon = Car;
              else if (amLower.includes('breakfast') || amLower.includes('restaurant')) Icon = Coffee;

              return (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <Icon className="w-4 h-4 text-pink-500 shrink-0" />
                  <span className="line-clamp-1">{am}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Helpful Facts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-extrabold text-lg text-slate-900 mb-4">Some helpful facts</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2"><Calendar className="w-4 h-4 text-slate-400" /> Check-in/Check-out</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 ml-6">
                <div>
                  <div className="text-slate-400 text-xs">Check-in from:</div>
                  <div className="font-semibold text-slate-800">03:00 PM</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">Check-out until:</div>
                  <div className="font-semibold text-slate-800">12:00 PM</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-800 text-sm mb-2">The property</h4>
              <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-5">
                <li>Year property opened: 2022</li>
                <li>Number of floors: 4</li>
                <li>Number of rooms: 95</li>
                <li>Non-smoking rooms/floors: yes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Room Selection List */}
        <h2 className="text-xl font-black text-slate-900 mt-8 mb-4 px-1">Recommended Rooms</h2>
        
        <div className="space-y-5">
          {rooms.map((roomType: any, rtIdx: number) => {
            const rates = roomType.rates || [];
            if (rates.length === 0) return null;
            
            return rates.map((rate: any, rIdx: number) => (
              <div key={`${rtIdx}-${rIdx}`} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Room Header Image & Name */}
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-extrabold text-lg text-slate-900">{roomType.name || rate.rateName || 'Superior Room'}</h3>
                  <p className="text-xs text-slate-500 mt-1">{roomType.description || `Max ${roomType.maxOccupancy || 2} adults • 1 King bed`}</p>
                </div>

                <div className="p-4 space-y-4">
                  {/* Benefits */}
                  <div className="flex flex-wrap gap-2">
                    {rate.breakfastIncluded && (
                      <span className="bg-pink-50 text-pink-700 border border-pink-200 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Coffee className="w-3.5 h-3.5" /> Breakfast Included
                      </span>
                    )}
                    <span className="bg-pink-50 text-pink-700 border border-pink-200 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5" /> Free WiFi
                    </span>
                    {rate.refundable && (
                      <span className="bg-pink-50 text-pink-700 border border-pink-200 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Free Cancellation
                      </span>
                    )}
                  </div>

                  {/* Agoda-style Price Tag */}
                  <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      75% OFF TODAY
                    </div>
                    
                    <p className="text-rose-600 font-bold text-sm mb-3">Cheapest price you've seen!</p>
                    
                    <div className="flex items-end justify-between">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs text-slate-400 line-through">₹{((rate.totalPrice || rate.nightlyPrice || 15000) * 3).toLocaleString('en-IN')}</span>
                         </div>
                         <div className="text-2xl font-black text-rose-600 leading-none">
                           ₹{Math.ceil(rate.totalPrice || rate.nightlyPrice || 9450).toLocaleString('en-IN')}
                         </div>
                         <div className="text-[10px] text-slate-500 font-medium mt-1">
                           {state.searchParams?.rooms || 1} room(s) after taxes + fees
                         </div>
                       </div>
                       
                       <button 
                         onClick={() => navigate('/stays/checkout', { state: { hotel, roomRate: rate, roomType, searchParams: state.searchParams } })}
                         className="bg-rose-600 hover:bg-rose-700 text-white font-black py-3 px-8 rounded-xl shadow-md shadow-rose-200 active:scale-95 transition-all text-sm tracking-wide"
                       >
                         Book
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ));
          })}
        </div>

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 sm:p-4 z-40 flex items-center justify-between shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div>
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Start at</p>
          <div className="text-xl font-black text-slate-900 leading-none">₹{Math.ceil(baseHotel?.pricePerNight || 9450).toLocaleString('en-IN')}</div>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">-75% TODAY</p>
        </div>
        <button 
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="bg-rose-600 text-white font-black py-3 px-6 rounded-xl shadow-lg shadow-rose-200 text-sm"
        >
          SELECT ROOM
        </button>
      </div>

    </div>
  );
};
