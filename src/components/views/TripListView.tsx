import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { 
  Plus, Users, Globe, Calendar, Search, MapPin, Map, MoreVertical, 
  Trash2, Filter, Edit2, Camera, Milestone, Train, Share2, Compass as Sparkles, Compass, 
  X, Plane, Building2, Ticket, TicketCheck, ExternalLink, Check, Calculator, ChevronLeft, Luggage
} from 'lucide-react';
import { TripGroup, TripMemory } from '../../types';
import { getCurrencySymbol } from '../../utils';
import { SharedBookingWidget } from '../SharedBookingWidget';
import { useBookingStore } from '../../store/useBookingStore';
import { ExplorePackagesView } from './ExplorePackagesView';
import { BookingItemPayload } from '../../pages/CheckoutPage';

interface TripListViewProps {
  trips: TripGroup[];
  onSelectTrip: (id: string) => void;
  onCreateTrip: () => void;
  onJoinTrip: () => void;
  onFutureTripPlan?: () => void;
  onCommunityTemplates?: () => void;
  onEditTrip?: (trip: TripGroup) => void;
  onDeleteTrip: (id: string, name: string) => void;
  onUpdateTrip?: (trip: TripGroup) => void;
  onShareTrip?: (trip: TripGroup) => void;
  onNavigate?: (tab: string) => void;
  lang: string;
  t: (key: string) => string;
}

// Subcomponent for Card Memories with local photo upload & local delete badge (Requirement 4)
const TripCardMemories: React.FC<{
  trip: TripGroup;
  themeColor: string;
  lang: string;
}> = ({ trip, themeColor, lang }) => {
  // Local state for memories only within this component
  const [localMemories, setLocalMemories] = React.useState<TripMemory[]>(() => {
    if (trip.memories && trip.memories.length > 0) {
      return trip.memories;
    }
    return [];
  });

  const handleAddLocalPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newPhoto: TripMemory = {
          id: `local_photo_${Date.now()}`,
          imageUrl: base64String,
          timestamp: new Date().toISOString()
        };
        setLocalMemories(prev => [newPhoto, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLocalPhoto = (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();
    // Security Constraint: removes photo ONLY from local UI state of this component
    setLocalMemories(prev => prev.filter(p => p.id !== photoId));
  };

  return (
    <div className="pt-4 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">
          {lang === 'mr' ? 'आठवणी' : 'Memories'}
        </p>

        {/* Dedicated Photo / Camera Upload Button */}
        <label 
          className="px-3 py-2 bg-slate-100/90 hover:bg-slate-200/80 rounded-xl cursor-pointer transition-all inline-flex items-center gap-1.5 border border-slate-200/80 shadow-2xs active:scale-95"
          style={{ color: themeColor }}
          title={lang === 'mr' ? 'कैमेराने किंवा गॅलरीतून फोटो घ्या' : 'Capture or pick photo'}
        >
          <Camera className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">{lang === 'mr' ? 'फोटो' : 'Photo'}</span>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden"
            onChange={handleAddLocalPhoto}
          />
        </label>
      </div>

      {localMemories.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar px-1 pt-1" style={{ scrollbarWidth: 'none' }}>
          {localMemories.map((mem, idx) => (
            <div key={`${mem.id}-${idx}`} className="w-16 h-16 shrink-0 rounded-[18px] overflow-visible snap-center relative border border-slate-200/80 shadow-xs group">
              <img src={mem.imageUrl} alt="Memory" className="w-full h-full object-cover rounded-[18px]" />
              
              {/* Small "Delete" (X) badge icon on top-right corner */}
              <button
                onClick={(e) => handleDeleteLocalPhoto(e, mem.id)}
                className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md z-20 active:scale-90 transition-all border border-white flex items-center justify-center"
                title={lang === 'mr' ? 'फोटो डिलीट करा' : 'Delete photo'}
              >
                <X className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 px-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/80 text-center mx-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {lang === 'mr' ? 'अजून फोटो नाहीत' : 'No photos yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export const TripListView: React.FC<TripListViewProps> = ({ 
  trips, onSelectTrip, onCreateTrip, onJoinTrip, onFutureTripPlan, onCommunityTemplates, onEditTrip, onDeleteTrip, onUpdateTrip, onShareTrip, onNavigate, lang, t 
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const [bookingSearchActive, setBookingSearchActive] = React.useState(false);
  const [activeView, setActiveView] = React.useState<'trips' | 'packages' | 'templates'>('trips');
  const navigate = useNavigate();

  const handleBookNow = (item: BookingItemPayload) => {
    navigate('/checkout', { state: { item, currencySymbol: getCurrencySymbol(), lang } });
  };

  // Synchronized Booking Window State
  const {
    activeTab: bookingTab,
    setActiveTab: setBookingTab,
    flightOrigin,
    setFlightOrigin,
    flightDestination,
    setFlightDestination,
    flightDepartureDate,
    setFlightDepartureDate,
    trainOrigin,
    setTrainOrigin,
    trainDestination,
    setTrainDestination,
    trainDate,
    setTrainDate,
    trainClass,
    setTrainClass,
    hotelCity,
    setHotelCity,
    checkInDate: hotelCheckIn,
    setCheckInDate: setHotelCheckIn,
    hotelGuests,
    setHotelGuests
  } = useBookingStore();

  const handleBookingSearch = (type: 'flight' | 'hotel' | 'train') => {
    setBookingSearchActive(true);
    if (onNavigate) {
      onNavigate('bookings');
    }
  };

  const getTripDates = (trip: TripGroup) => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const format = { day: 'numeric' as const, month: 'short' as const, year: '2-digit' as const };
    return `${start.toLocaleDateString(lang === 'mr' ? 'mr-IN-u-nu-latn' : lang === 'hi' ? 'hi-IN-u-nu-latn' : 'en-IN', format)} - ${end.toLocaleDateString(lang === 'mr' ? 'mr-IN-u-nu-latn' : lang === 'hi' ? 'hi-IN-u-nu-latn' : 'en-IN', format)}`;
  };

  const calculateSpent = (trip: TripGroup) => {
    return (trip.expenses || []).reduce((sum, e) => sum + e.amount, 0);
  };

  const calculateBudget = (trip: TripGroup) => {
    return trip.totalBudget || (trip.members || []).reduce((sum, m) => sum + m.totalDeposited, 0);
  };

  const getTripDurationProgress = (trip: TripGroup) => {
    const start = new Date(trip.startDate).getTime();
    const end = new Date(trip.endDate).getTime();
    const now = Date.now();
    
    // Add 1 day to end to include the whole last day
    const effectiveEnd = end + 24 * 60 * 60 * 1000;
    const totalDuration = effectiveEnd - start;
    const totalDays = Math.max(1, Math.ceil(totalDuration / (1000 * 60 * 60 * 24)));
    
    if (now < start) return { percentage: 0, daysElapsed: 0, totalDays };
    if (now > effectiveEnd) return { percentage: 100, daysElapsed: totalDays, totalDays };
    
    const elapsed = now - start;
    const percentage = Math.min((elapsed / totalDuration) * 100, 100);
    const daysElapsed = Math.ceil(elapsed / (1000 * 60 * 60 * 24));
    
    return { percentage, daysElapsed, totalDays };
  };


  const filteredTrips = (trips || []).filter(trip => {
    const q = searchQuery.toLowerCase();
    const dates = getTripDates(trip).toLowerCase();
    return trip.name.toLowerCase().includes(q) || dates.includes(q);
  });

  return (
    <div className="w-full flex flex-col pb-44 sm:pb-36">
      {activeView !== 'trips' ? (
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setActiveView('trips')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{lang === 'mr' ? 'मागे' : 'Back'}</span>
          </button>
          <h2 className="font-black text-slate-900 text-sm uppercase tracking-wide">
            {activeView === 'packages' && (lang === 'mr' ? 'हॉलिडे पॅकेजेस' : 'Holiday Packages')}
            {activeView === 'templates' && (lang === 'mr' ? 'सहल टेम्पलेट्स' : 'Trip Templates')}
          </h2>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      ) : (
      <>
        {/* Top Bar for TripListView */}
        <div className="flex items-center justify-between px-5 pt-6 pb-2 bg-slate-50">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">{t('welcome') || 'Namaste,'}</p>
            <p className="text-lg font-bold text-slate-800 font-[Poppins] flex items-center gap-2">
              RouTripO <Compass className="w-4 h-4 text-orange-500" />
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center cursor-pointer">
              <Globe className="w-4 h-4 text-orange-500" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              RT
            </div>
          </div>
        </div>

        <div className="px-5 mt-2 bg-slate-50">
          <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm border border-slate-100">
            <Search className="w-4 h-4 text-orange-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'mr' ? "सहल शोधा..." : "Search trips, destinations..."}
              className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="px-5 mt-5 bg-slate-50">
          <div className="flex items-center justify-between px-1 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-orange-500" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quick actions</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            <button onClick={() => setActiveView('packages')} className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform">
              <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-md">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium text-center leading-tight">Holiday Pkgs</span>
            </button>
            <button onClick={() => setActiveView('templates')} className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform">
              <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium text-center leading-tight">Templates</span>
            </button>
            <button onClick={onCreateTrip} className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform">
              <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-md">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium text-center leading-tight">New Trip</span>
            </button>
            <button onClick={() => { if (onFutureTripPlan) onFutureTripPlan(); else onCreateTrip(); }} className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform">
              <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium text-center leading-tight">Smart Planner</span>
            </button>
          </div>
        </div>
      </>
      )}

      <main className="flex-1 px-4 sm:px-5 pt-6 space-y-5 bg-slate-50">
        {activeView === 'trips' && (
          <>
            <div className="flex items-center justify-between px-1 mb-1">
              <div className="flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-orange-500" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{lang === 'mr' ? 'तुमच्या सहली' : 'Your Trips'}</p>
              </div>
              <span className="text-[11px] text-orange-500 font-bold cursor-pointer">{trips.length} Total</span>
            </div>

            {/* List of Trips */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                <button 
                  onClick={onJoinTrip}
                  className="w-full py-3 rounded-2xl border border-dashed border-orange-300 text-orange-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white transition-colors cursor-pointer bg-orange-50/50"
                >
                  <Users className="w-4 h-4" />{lang === 'mr' ? 'सहलीत सामील व्हा (कोड)' : 'Join trip via Passcode'}
                </button>
              </div>

              {filteredTrips.map((trip, idx) => {
            const spent = calculateSpent(trip);
            const budget = calculateBudget(trip);
            const durationProgress = getTripDurationProgress(trip);
            const themeColor = trip.themeColor || '#6366f1';

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onSelectTrip(trip.id)}
                className="bg-white backdrop-blur-md rounded-[32px] overflow-hidden shadow-xl border border-slate-200/50 active:scale-[0.98] transition-all flex flex-col relative"
              >
                <div className="h-52 w-full relative bg-slate-100">
                  {trip.wallpaperUrl && (
                    <img src={trip.wallpaperUrl} alt={trip.name} className="w-full h-full object-cover" />
                  )}

                  {/* Trip Card Action Buttons including Share (Requirement 3) */}
                  <div className="absolute top-4 right-4 flex gap-2">
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         if (onShareTrip) {
                           onShareTrip(trip);
                         } else if (navigator.share) {
                           navigator.share({
                             title: trip.name,
                             text: `Check out our trip ${trip.name} on Routripo!`,
                             url: window.location.href,
                           }).catch(() => {});
                         } else {
                           navigator.clipboard.writeText(window.location.href);
                           alert(lang === 'mr' ? 'सहलीची लिंक कॉपी झाली!' : 'Trip link copied!');
                         }
                       }}
                       className="p-2.5 sm:p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-all border border-white/20 active:scale-95 shadow-2xs"
                       title={lang === 'mr' ? 'शेअर करा' : 'Share Trip'}
                     >
                       <Share2 className="w-4 h-4" />
                     </button>

                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         if (onEditTrip) onEditTrip(trip);
                       }}
                       className="p-2.5 sm:p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-all border border-white/20 active:scale-95 shadow-2xs"
                       title={lang === 'mr' ? 'संपादन' : 'Edit'}
                     >
                       <Edit2 className="w-4 h-4" />
                     </button>

                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         onDeleteTrip(trip.id, trip.name);
                       }}
                       className="p-2.5 sm:p-3 bg-rose-500/40 backdrop-blur-md rounded-2xl text-white hover:bg-rose-500/60 transition-all border border-rose-500/20 active:scale-95 shadow-2xs"
                       title={lang === 'mr' ? 'काढून टाका' : 'Delete'}
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-white/80 text-[11px] font-medium mb-1.5 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {getTripDates(trip)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {(trip.members || []).length}</span>
                    </p>
                    <p className="text-white font-bold font-[Poppins] text-xl">{trip.name}</p>
                    
                    <div className="flex items-center justify-between mt-3 gap-3">
                      <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-full" style={{ width: `${Math.min((spent / (budget || 1)) * 100, 100)}%` }} />
                      </div>
                      <span className="text-white text-[10px] font-semibold tracking-wide">{Math.round(Math.min((spent / (budget || 1)) * 100, 100))}% spent</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white shadow-sm border border-slate-100 rounded-b-[32px]">
                  {/* Trip Memories Section (Requirement 4) */}
                  <TripCardMemories trip={trip} themeColor={themeColor} lang={lang} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredTrips.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center my-8 p-8 text-center bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100/60 rounded-[36px] border-2 border-dashed border-pink-300 shadow-sm relative overflow-hidden"
          >
            <div className="w-24 h-24 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-lg shadow-pink-500/25 mb-4 relative group">
              <Luggage className="w-12 h-12 text-white animate-bounce" />
              <span className="absolute -top-1 -right-1 text-xl">✨</span>
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-1">
              {lang === 'mr' ? 'तुमची पहिली सहल प्लॅन करा! 🧳' : 'Plan your first trip! 🧳'}
            </h3>
            
            <p className="text-xs font-semibold text-slate-600 max-w-sm mb-6 leading-relaxed">
              {trips.length === 0 
                ? (lang === 'mr' ? 'नवीन ठिकाण जोडा, मित्रांना आमंत्रित करा आणि खर्चाचे विभाजन सहजपणे करा!' : 'Add destinations, invite your group, and split travel expenses effortlessly!')
                : (lang === 'mr' ? 'तुम्ही शोधलेला कोणताही ट्रिप प्लॅन सापडला नाही.' : 'No matching trips found for your search filter.')}
            </p>

            <button
              onClick={onCreateTrip}
              className="px-6 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'mr' ? 'नवीन सहल तयार करा' : 'Create New Trip'}</span>
            </button>
          </motion.div>
        )}
        </>
        )}

        {activeView === 'packages' && (
          <ExplorePackagesView lang={lang} onBookNow={handleBookNow} />
        )}

        {activeView === 'templates' && (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-dashed border-slate-200">
            <Share2 className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-slate-500 px-8">
              {lang === 'mr' ? 'इतर वापरकर्त्यांनी शेअर केलेली सहल टेम्पलेट्स लवकरच येत आहेत.' : 'Trip templates shared by other users are coming soon.'}
            </p>
          </div>
        )}
      </main>

      {/* Floating Action Button (Only show on My Trips) */}
      {activeView === 'trips' && (
      <div className="fixed bottom-[110px] right-[20px] flex flex-col gap-3 z-50">
        <button 
          onClick={onCreateTrip}
          className="w-16 h-16 bg-coral text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-all shadow-coral/30"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>
      )}
    </div>
  );
};

