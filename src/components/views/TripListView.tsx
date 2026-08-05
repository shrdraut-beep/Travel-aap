import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { 
  Plus, Users, Globe, Calendar, Search, MapPin, Map, MoreVertical, 
  Trash2, Filter, Edit2, Camera, Milestone, Train, Share2, Sparkles, 
  X, Plane, Building2, Ticket, TicketCheck, ExternalLink, Check, Calculator, ChevronLeft
} from 'lucide-react';
import { TripGroup, TripMemory } from '../../types';
import { getCurrencySymbol } from '../../utils';
import { LiveFlightSearchCard } from '../LiveFlightSearchCard';
import { SharedBookingWidget } from '../SharedBookingWidget';
import { useBookingStore } from '../../store/useBookingStore';
import { ExplorePackagesView } from './ExplorePackagesView';

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
      <div className="px-4 sm:px-5 pt-4 pb-2">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveView('packages')}
            className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all shadow-sm border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          >
             <span className="text-2xl leading-none">🏝️</span>
             <span className="font-bold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'हॉलिडे पॅकेजेस' : 'Holiday Packages'}</span>
          </button>
          <button
            onClick={() => setActiveView('templates')}
            className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all shadow-sm border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          >
             <span className="text-2xl leading-none">🗺️</span>
             <span className="font-bold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'सहल टेम्पलेट्स' : 'Trip Templates'}</span>
          </button>
        </div>
      </div>
      )}

      <main className="flex-1 px-4 sm:px-5 pt-2 space-y-5">
        {activeView === 'trips' && (
          <>
            {/* Action Buttons Section */}
            <div className="space-y-2 sm:space-y-3">
              {/* Top Row: 2 Buttons - BLANK TRIP | Smart Planner */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button 
              onClick={onCreateTrip}
              className="flex flex-col items-center justify-center gap-1.5 bg-white border-2 border-slate-300 p-2.5 sm:p-3.5 rounded-2xl shadow-xs active:scale-95 transition-all hover:border-slate-400 group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-900 group-hover:bg-coral rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs transition-colors">
                <Plus className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="text-center w-full">
                <span className="font-black text-[10px] sm:text-xs text-slate-950 tracking-tight uppercase leading-tight truncate block">
                  {lang === 'mr' ? 'नवीन सहल' : 'Blank Trip'}
                </span>
                <span className="text-[9px] font-extrabold text-slate-500 block mt-0.5">
                  {lang === 'mr' ? 'मॅन्युअल मसुदा' : 'Add Trip'}
                </span>
              </div>
            </button>

            <button 
              onClick={() => {
                if (onFutureTripPlan) onFutureTripPlan();
                else onCreateTrip();
              }}
              className="flex flex-col items-center justify-center gap-1.5 bg-emerald-50 border-2 border-emerald-200 p-2.5 sm:p-3.5 rounded-2xl shadow-xs active:scale-95 transition-all hover:border-emerald-400 group relative overflow-hidden"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 group-hover:bg-emerald-700 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs transition-colors">
                <span className="text-xl leading-none animate-pulse">✨</span>
              </div>
              <div className="text-center w-full">
                <span className="font-black text-[10px] sm:text-xs text-slate-950 tracking-tight uppercase leading-tight truncate block">
                  {lang === 'mr' ? 'स्मार्ट प्लॅनर' : 'Smart Planner'}
                </span>
                <span className="text-[9px] font-extrabold text-emerald-600 block mt-0.5">
                  {lang === 'mr' ? 'स्मार्ट नियोजन' : 'Smart Route Plan'}
                </span>
              </div>
            </button>
          </div>

          {/* Bottom Row: 1 Button - BOOK TICKETS */}
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            <button 
              onClick={() => setIsBookingOpen(!isBookingOpen)}
              className={`flex flex-col items-center justify-center gap-1.5 border-2 p-3 sm:p-3.5 rounded-2xl shadow-xs active:scale-95 transition-all ${isBookingOpen ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-300 hover:border-slate-400'}`}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-colors ${isBookingOpen ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white'}`}>
                <span className="text-xl leading-none">🎟️</span>
              </div>
              <div className="text-center w-full">
                <span className="font-black text-[11px] sm:text-xs text-slate-950 tracking-tight uppercase leading-tight truncate block">
                  {lang === 'mr' ? 'तिकीट बुकिंग' : 'Book Tickets'}
                </span>
                <span className="text-[9px] font-extrabold text-amber-600 block mt-0.5">
                  {lang === 'mr' ? 'रेल्वे / विमान' : 'Flights & Trains'}
                </span>
              </div>
            </button>
          </div>
        </div>

        
        {/* Toggleable Shared Booking Widget */}
        <AnimatePresence>
          {isBookingOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20, transition: { duration: 0.2 } }}
              className="overflow-hidden"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 border-2 border-slate-200/90 shadow-md space-y-3 mb-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                      <TicketCheck className="w-4 h-4" />
                    </div>

                    <div>
                      <h3 className="font-black text-sm text-slate-950 tracking-tight leading-none">
                        {lang === 'mr' ? 'बुकिंग खिडकी' : 'Booking Window'}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-600">
                        {lang === 'mr' ? 'विमान, हॉटेल व रेल्वे तिकीट बुकिंग' : 'Flight, Hotel & Train Booking'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <SharedBookingWidget lang={lang} currencySymbol={getCurrencySymbol('INR')} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between px-1">
           <h2 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-widest">{lang === 'mr' ? 'होम' : 'Home'}</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'mr' ? 'सहल शोधा...' : 'Search trips...'}
            className="w-full bg-white backdrop-blur-md border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all text-slate-700 shadow-2xs"
          />
        </div>

        <div className="space-y-6">
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
                             text: `Check out our trip ${trip.name} on Pravas Wataghati!`,
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

                  <div className="absolute bottom-5 left-6 right-6">
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-2xl leading-tight tracking-tight">{trip.name}</h3>
                      <div className="flex items-center gap-3 text-sm font-bold text-white">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {getTripDates(trip)}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {(trip.members || []).length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1.5">
                       <p className="text-sm font-bold text-slate-700 uppercase tracking-[0.2em]">{lang === 'mr' ? 'एकूण हिशोब' : 'Summary'}</p>
                       <p className="text-[17px] font-black text-slate-800">
                         {getCurrencySymbol(trip.defaultCurrency)}{new Intl.NumberFormat('en-IN').format(budget)} / <span className="text-rose-500">{getCurrencySymbol(trip.defaultCurrency)}{new Intl.NumberFormat('en-IN').format(spent)}</span>
                       </p>
                    </div>
                    <div className="px-5 py-2.5 text-white rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg" style={{ backgroundColor: themeColor }}>
                       {lang === 'mr' ? 'पहा' : 'View'}
                    </div>
                  </div>
                  
                  {/* Budget progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-bold text-slate-700 uppercase tracking-widest">
                      <span>{lang === 'mr' ? 'खर्च' : 'Budget'}</span>
                      <span>{Math.round(Math.min((spent / (budget || 1)) * 100, 100))}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all rounded-full" 
                        style={{ width: `${Math.min((spent / (budget || 1)) * 100, 100)}%`, backgroundColor: themeColor }} 
                      />
                    </div>
                  </div>

                  {/* Duration progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-bold text-slate-800 uppercase">
                      <span>{lang === 'mr' ? 'कालावधी' : 'Duration'}</span>
                      <span>{durationProgress.daysElapsed} / {durationProgress.totalDays} {lang === 'mr' ? 'दिवस' : 'Days'}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 transition-all" 
                        style={{ width: `${durationProgress.percentage}%` }} 
                      />
                    </div>
                  </div>
                  
                  {/* Trip Memories Section (Requirement 4) */}
                  <TripCardMemories trip={trip} themeColor={themeColor} lang={lang} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredTrips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-emerald-200" />
             </div>
             <p className="text-emerald-300 font-medium px-12">

               {trips.length === 0 
                 ? t('noTripsYet') 
                 : (lang === 'mr' ? 'कोणतीही सहल सापडली नाही' : 'No matching trips found')}
             </p>
          </div>
        )}
        </>
        )}

        {activeView === 'packages' && (
          <ExplorePackagesView lang={lang} />
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

