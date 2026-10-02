import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Compass, 
  Plane, 
  Utensils, 
  Armchair, 
  Hotel, 
  Car, 
  CheckCircle2, 
  ShieldCheck,
  Search,
  MapPin,
  Award
} from 'lucide-react';
import { type ProfileFormData } from './EditProfileModal';
import { ALL_AIRPORTS, searchAirports } from '../../data/airports';

interface TravelPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ProfileFormData;
  onSave: (updated: Partial<ProfileFormData>) => void;
  isMr?: boolean;
}

export const TravelPreferencesModal: React.FC<TravelPreferencesModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  isMr = false
}) => {
  const [departureCity, setDepartureCity] = useState(initialData.departureCity || 'BOM (Mumbai)');
  const [dietaryPreference, setDietaryPreference] = useState(initialData.dietaryPreference || 'Veg Meal');
  const [seatPreference, setSeatPreference] = useState(initialData.seatPreference || 'Window Seat');
  const [loyaltyProgram, setLoyaltyProgram] = useState(initialData.loyaltyProgram || 'None');
  const [hotelRoomType, setHotelRoomType] = useState('King Bed (High Floor)');
  const [cabPreference, setCabPreference] = useState('Prime Sedan (Dzire / Etios AC)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // City Search Dropdown State
  const [citySearchQuery, setCitySearchQuery] = useState(initialData.departureCity || 'BOM (Mumbai)');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDepartureCity(initialData.departureCity || 'BOM (Mumbai)');
    setCitySearchQuery(initialData.departureCity || 'BOM (Mumbai)');
    setDietaryPreference(initialData.dietaryPreference || 'Veg Meal');
    setSeatPreference(initialData.seatPreference || 'Window Seat');
    setLoyaltyProgram(initialData.loyaltyProgram || 'None');
  }, [initialData, isOpen]);

  // Close city dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getCitySuggestions = () => {
    const query = citySearchQuery.trim().toLowerCase();
    if (!query) {
      return ALL_AIRPORTS.slice(0, 8).map((a) => ({
        city: a.city,
        code: a.code,
        airport: a.airport,
        label: `${a.code} (${a.city})`
      }));
    }
    const matched = searchAirports(query);
    const seen = new Set<string>();
    const uniqueList: { city: string; code: string; airport: string; label: string }[] = [];
    matched.forEach((a) => {
      if (!seen.has(a.city.toLowerCase())) {
        seen.add(a.city.toLowerCase());
        uniqueList.push({
          city: a.city,
          code: a.code,
          airport: a.airport,
          label: `${a.code} (${a.city})`
        });
      }
    });
    return uniqueList.slice(0, 8);
  };

  const handleSelectCity = (label: string) => {
    setDepartureCity(label);
    setCitySearchQuery(label);
    setIsCityDropdownOpen(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      departureCity,
      dietaryPreference,
      seatPreference,
      loyaltyProgram
    });
    showToast(isMr ? 'प्रवास प्राधान्ये यशस्वीरित्या सेव्ह झाली!' : 'Travel preferences updated successfully!');
    setTimeout(() => onClose(), 600);
  };

  const citySuggestions = getCitySuggestions();

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-['Outfit',sans-serif]">
      <div 
        className="w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Toast */}
        {toastMessage && (
          <div className="absolute top-4 inset-x-0 mx-auto z-50 max-w-xs px-4 pointer-events-none">
            <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
              <span>{toastMessage}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 px-5 py-4 border-b border-amber-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {isMr ? 'प्रवास व बुकिंग प्राधान्ये' : 'Travel & Booking Preferences'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {isMr ? 'फ्लाइट्स, हॉटेल्स व कॅब्ससाठी एकत्रित प्राधान्ये' : 'Consolidated preferences for Flights, Hotels & Cabs'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Consolidated Travel Preferences */}
        <form onSubmit={handleSave} className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* 1. Home / Departure City with Live Search Dropdown */}
          <div className="relative" ref={cityDropdownRef}>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-sky-600" />
                <span>{isMr ? 'घर / मूळ शहर (Departure City)' : 'Home / Departure City & Airport'}</span>
              </span>
              <span className="text-[10px] font-semibold text-sky-600 lowercase font-mono">
                type to search
              </span>
            </label>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={citySearchQuery}
                onFocus={() => setIsCityDropdownOpen(true)}
                onChange={(e) => {
                  setCitySearchQuery(e.target.value);
                  setIsCityDropdownOpen(true);
                }}
                placeholder="Type city or airport name (e.g. Mumbai, Pune, Delhi, Goa)..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {citySearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setCitySearchQuery('');
                    setIsCityDropdownOpen(true);
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Suggestions */}
            {isCityDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-52 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-150">
                {citySuggestions.length > 0 ? (
                  citySuggestions.map((item) => {
                    const isSelected = departureCity === item.label;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleSelectCity(item.label)}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-amber-50/70 transition-colors cursor-pointer ${
                          isSelected ? 'bg-amber-50 font-bold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">{item.city}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[230px]">{item.airport}</p>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] font-black text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md shrink-0">
                          {item.code}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No airport found for &ldquo;{citySearchQuery}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. In-Flight & Hotel Meal Preference (Consolidated) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMr ? 'जेवणाचे प्राधान्य (Dietary Preference)' : 'Dietary / Meal Preference'}</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'Veg Meal', label: 'Veg' },
                { id: 'Non-Veg', label: 'Non-Veg' },
                { id: 'Jain Meal', label: 'Jain' },
                { id: 'Vegan', label: 'Vegan' },
                { id: 'Diabetic', label: 'Diabetic' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDietaryPreference(m.id)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer truncate ${
                    dietaryPreference.toLowerCase().includes(m.label.toLowerCase())
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Flight Seat Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Armchair className="w-3.5 h-3.5 text-blue-600" />
              <span>{isMr ? 'सीट प्राधान्य (Seat Preference)' : 'Flight Seat Preference'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Window Seat', label: 'Window' },
                { id: 'Aisle Seat', label: 'Aisle' },
                { id: 'Extra Legroom', label: 'Extra Leg' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeatPreference(s.id)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer truncate ${
                    seatPreference.toLowerCase().includes(s.label.toLowerCase())
                      ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-200 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Frequent Flyer / Loyalty Program */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>{isMr ? 'एअरलाईन लॉयल्टी प्रोग्राम' : 'Frequent Flyer / Loyalty Program'}</span>
            </label>
            <select
              value={loyaltyProgram}
              onChange={(e) => setLoyaltyProgram(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="6E Rewards Linked">IndiGo 6E Rewards</option>
              <option value="Air India Flying Returns">Air India Flying Returns</option>
              <option value="Club Vistara Linked">Club Vistara</option>
              <option value="SpiceClub Member">SpiceJet SpiceClub</option>
              <option value="None">None (General Traveler)</option>
            </select>
          </div>

          {/* 5. Hotel Stay Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Hotel className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isMr ? 'हॉटेल मुक्काम प्राधान्य' : 'Hotel Stay Preference'}</span>
            </label>
            <select
              value={hotelRoomType}
              onChange={(e) => setHotelRoomType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="King Bed (High Floor)">King Bed (High Floor)</option>
              <option value="Twin Beds (Quiet Room)">Twin Beds (Quiet Room)</option>
              <option value="Pool View with Balcony">Pool View with Balcony</option>
              <option value="Smoking Room">Smoking Allowed Room</option>
            </select>
          </div>

          {/* 6. Outstation Cab Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-teal-600" />
              <span>{isMr ? 'कॅब प्राधान्य' : 'Outstation Cab Preference'}</span>
            </label>
            <select
              value={cabPreference}
              onChange={(e) => setCabPreference(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="Prime Sedan (Dzire / Etios AC)">Prime Sedan (Dzire / Etios AC)</option>
              <option value="Spacious SUV (Ertiga / Innova AC)">Spacious SUV (Ertiga / Innova AC)</option>
              <option value="Green Electric Vehicle (EV AC)">Green Electric Vehicle (EV AC)</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all mt-2"
          >
            {isMr ? 'प्राधान्ये सेव्ह करा' : 'Save Preferences'}
          </button>
        </form>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Synced with Booking &amp; Recommendation Engine</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            {isMr ? 'रद्द करा' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelPreferencesModal;
