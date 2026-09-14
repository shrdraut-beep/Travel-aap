import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  RotateCcw, 
  Check, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon,
  Plane,
  Clock,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';

export type SortOption = 
  | 'cheapest' 
  | 'fastest' 
  | 'depart_early' 
  | 'depart_late' 
  | 'arrive_early' 
  | 'arrive_late' 
  | 'expensive';

export interface FilterState {
  sortBy: SortOption;
  stops: string[]; // '0', '1', '2+'
  timeSlots: string[]; // 'early_morning', 'morning', 'afternoon', 'night'
  airlines: string[]; // Carrier IATA or name
  maxPrice: number;
}

export interface FlightFilterSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  availableAirlines: Array<{ code: string; name: string; logo?: string; minPrice?: number }>;
  minPriceLimit: number;
  maxPriceLimit: number;
  totalResultsCount: number;
  filteredResultsCount: number;
  lang?: string;
}

export const FlightFilterSortModal: React.FC<FlightFilterSortModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  availableAirlines,
  minPriceLimit,
  maxPriceLimit,
  totalResultsCount,
  filteredResultsCount,
  lang = 'en'
}) => {
  const isMr = lang === 'mr';
  const [tempFilters, setTempFilters] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    setTempFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    const defaultState: FilterState = {
      sortBy: 'cheapest',
      stops: [],
      timeSlots: [],
      airlines: [],
      maxPrice: maxPriceLimit
    };
    setTempFilters(defaultState);
  };

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const toggleStop = (stop: string) => {
    setTempFilters(prev => {
      const exists = prev.stops.includes(stop);
      const nextStops = exists ? prev.stops.filter(s => s !== stop) : [...prev.stops, stop];
      return { ...prev, stops: nextStops };
    });
  };

  const toggleTimeSlot = (slot: string) => {
    setTempFilters(prev => {
      const exists = prev.timeSlots.includes(slot);
      const nextSlots = exists ? prev.timeSlots.filter(s => s !== slot) : [...prev.timeSlots, slot];
      return { ...prev, timeSlots: nextSlots };
    });
  };

  const toggleAirline = (airlineName: string) => {
    setTempFilters(prev => {
      const exists = prev.airlines.includes(airlineName);
      const nextAirlines = exists ? prev.airlines.filter(a => a !== airlineName) : [...prev.airlines, airlineName];
      return { ...prev, airlines: nextAirlines };
    });
  };

  const sortOptionsList: Array<{ id: SortOption; label: string; desc: string; icon: any }> = [
    { id: 'cheapest', label: isMr ? 'किमान दर आधी (Cheapest)' : 'Cheapest First', desc: isMr ? 'कमी किमतीनुसार' : 'Lowest price first', icon: IndianRupee },
    { id: 'fastest', label: isMr ? 'कमी वेळ / वेगवान (Fastest)' : 'Fastest First', desc: isMr ? 'सर्वात कमी प्रवासाची वेळ' : 'Shortest flight duration', icon: Clock },
    { id: 'depart_early', label: isMr ? 'लवकर निघणारी (Early Departure)' : 'Earliest Departure', desc: isMr ? 'पहाटे/सकाळपासून' : 'Depart earliest', icon: Sunrise },
    { id: 'depart_late', label: isMr ? 'उशीरा निघणारी (Late Departure)' : 'Latest Departure', desc: isMr ? 'संध्याकाळ/रात्र' : 'Depart latest', icon: Moon },
    { id: 'arrive_early', label: isMr ? 'लवकर पोहोचणारी (Early Arrival)' : 'Earliest Arrival', desc: isMr ? 'गंतव्यस्थानी लवकर' : 'Arrive earliest', icon: Sun },
    { id: 'arrive_late', label: isMr ? 'उशीरा पोहोचणारी (Late Arrival)' : 'Latest Arrival', desc: isMr ? 'गंतव्यस्थानी उशीरा' : 'Arrive latest', icon: Sunset },
    { id: 'expensive', label: isMr ? 'जास्त दर आधी (Highest Price)' : 'Price: High to Low', desc: isMr ? 'प्रीमियम/बिझनेस क्लास' : 'Highest price first', icon: IndianRupee },
  ];

  const timeSlotsList = [
    { id: 'early_morning', label: isMr ? 'पहाटे (Before 6 AM)' : 'Before 6 AM', sub: 'Early Morning', icon: Sunrise },
    { id: 'morning', label: isMr ? 'सकाळ (6 AM - 12 PM)' : '6 AM - 12 PM', sub: 'Morning', icon: Sun },
    { id: 'afternoon', label: isMr ? 'दुपार (12 PM - 6 PM)' : '12 PM - 6 PM', sub: 'Afternoon', icon: Sunset },
    { id: 'night', label: isMr ? 'रात्र (After 6 PM)' : 'After 6 PM', sub: 'Evening / Night', icon: Moon },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 ">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[16px] bg-white/15 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black leading-tight">
                  {isMr ? 'सॉर्ट आणि फिल्टर्स' : 'Sort & Filter Flights'}
                </h2>
                <p className="text-[11px] text-white/80 font-medium">
                  {isMr 
                    ? `${totalResultsCount} पर्यायांपैकी परिष्कृत करा` 
                    : `Refine among ${totalResultsCount} flight option${totalResultsCount > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isMr ? 'रीसेट' : 'Reset'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* 1. Sort Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpDown className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  {isMr ? 'क्रमवारी लावा (Sort By)' : 'Sort By'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sortOptionsList.map(opt => {
                  const isSelected = tempFilters.sortBy === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTempFilters(prev => ({ ...prev, sortBy: opt.id }))}
                      className={`flex items-center justify-between p-3 rounded-[16px] border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 border-rose-600 text-white shadow-sm ring-2 ring-rose-500/20 font-bold'
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-rose-50/40 hover:border-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                        <div>
                          <span className={`text-xs font-black block ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {opt.label}
                          </span>
                          <span className={`text-[10px] block ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                            {opt.desc}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 2. Number of Stops */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Plane className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  {isMr ? 'थांबे (Stops)' : 'Stops'}
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '0', label: isMr ? 'नॉन-स्टॉप' : 'Non-Stop', desc: 'Direct' },
                  { id: '1', label: isMr ? '१ थांबा' : '1 Stop', desc: 'Single Layover' },
                  { id: '2+', label: isMr ? '२+ थांबे' : '2+ Stops', desc: 'Multi Layover' },
                ].map(stopItem => {
                  const isSelected = tempFilters.stops.includes(stopItem.id);
                  return (
                    <button
                      key={stopItem.id}
                      type="button"
                      onClick={() => toggleStop(stopItem.id)}
                      className={`p-3 rounded-[16px] border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 border-rose-600 text-white shadow-sm ring-2 ring-rose-500/20 font-black'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50/40 hover:border-rose-200'
                      }`}
                    >
                      <span className={`text-xs font-black block ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {stopItem.label}
                      </span>
                      <span className={`text-[10px] block ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {stopItem.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 3. Departure Time Slots */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  {isMr ? 'निघण्याची वेळ (Departure Time)' : 'Departure Time'}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {timeSlotsList.map(slot => {
                  const isSelected = tempFilters.timeSlots.includes(slot.id);
                  const Icon = slot.icon;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => toggleTimeSlot(slot.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-[16px] border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 border-rose-600 text-white shadow-sm ring-2 ring-rose-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50/40 hover:border-rose-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-black block truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {slot.label}
                        </span>
                        <span className={`text-[10px] block ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                          {slot.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Airlines Filter (if any available) */}
            {availableAirlines.length > 0 && (
              <>
                <hr className="border-slate-100" />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                        {isMr ? 'विमान कंपन्या (Airlines)' : 'Airlines'}
                      </h3>
                    </div>
                    {tempFilters.airlines.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setTempFilters(prev => ({ ...prev, airlines: [] }))}
                        className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        {isMr ? 'सर्व निवडा' : 'Clear Airline Filter'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {availableAirlines.map(airline => {
                      const isSelected = tempFilters.airlines.includes(airline.name);
                      return (
                        <button
                          key={airline.name}
                          type="button"
                          onClick={() => toggleAirline(airline.name)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-[16px] border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-50/70 border-rose-500 ring-1 ring-rose-500'
                              : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              isSelected ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 border-rose-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            {airline.logo ? (
                              <img src={airline.logo} alt={airline.name} className="w-6 h-6 object-contain rounded bg-white p-0.5 border border-slate-100" />
                            ) : (
                              <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-700">
                                {airline.code}
                              </div>
                            )}

                            <span className="text-xs font-bold text-slate-900">
                              {airline.name}
                            </span>
                          </div>

                          {airline.minPrice && (
                            <span className="text-xs font-black text-slate-700">
                              ₹{airline.minPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* 5. Price Range Slider */}
            {maxPriceLimit > minPriceLimit && (
              <>
                <hr className="border-slate-100" />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-rose-600" />
                      <span>{isMr ? 'कमाल किंमत (Max Price)' : 'Max Price Limit'}</span>
                    </h3>
                    <span className="text-sm font-black text-rose-600">
                      Up to ₹{tempFilters.maxPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={minPriceLimit}
                    max={maxPriceLimit}
                    step={100}
                    value={tempFilters.maxPrice}
                    onChange={(e) => setTempFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                    className="w-full accent-rose-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold mt-1">
                    <span>₹{minPriceLimit.toLocaleString('en-IN')}</span>
                    <span>₹{maxPriceLimit.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Footer Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0 shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)]">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMr ? 'उपलब्ध उड्डाणे' : 'Matching Flights'}
              </span>
              <span className="text-sm font-black text-slate-900">
                {totalResultsCount} flights total
              </span>
            </div>

            <button
              onClick={handleApply}
              className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:brightness-105 active:scale-98 text-white font-extrabold px-6 py-3 rounded-[16px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isMr ? 'फिल्टर्स लागू करा' : 'Apply Filters'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
