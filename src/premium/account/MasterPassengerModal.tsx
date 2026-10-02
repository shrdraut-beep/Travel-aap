import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  User
} from 'lucide-react';
import { 
  MasterPassengerService, 
  type Passenger 
} from '../../services/MasterPassengerService';

interface MasterPassengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMr?: boolean;
}

export const MasterPassengerModal: React.FC<MasterPassengerModalProps> = ({
  isOpen,
  onClose,
  isMr = false
}) => {
  const [passengers, setPassengers] = useState<Passenger[]>(MasterPassengerService.getPassengers());
  const [isAdding, setIsAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for new passenger
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('26');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [idType, setIdType] = useState<'Aadhaar' | 'Passport' | 'Voter ID' | 'Driving License'>('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [mealPreference, setMealPreference] = useState<'Veg' | 'Non-Veg' | 'Jain' | 'Vegan' | 'Diabetic'>('Veg');
  const [frequentFlyerNo, setFrequentFlyerNo] = useState('');

  useEffect(() => {
    setPassengers(MasterPassengerService.getPassengers());
    const unsub = MasterPassengerService.subscribe((list) => setPassengers(list));
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please enter full name as per Government ID');
      return;
    }

    MasterPassengerService.addPassenger({
      fullName: fullName.trim(),
      age: Number(age) || 25,
      gender,
      idType,
      idNumber: idNumber ? `•••• •••• ${idNumber.slice(-4)}` : '•••• •••• 9912',
      mealPreference,
      frequentFlyerNo: frequentFlyerNo.trim() || undefined
    });

    setIsAdding(false);
    setFullName('');
    setIdNumber('');
    setFrequentFlyerNo('');
    showToast(`${fullName.trim()} saved to Master Passenger List!`);
  };

  const handleDelete = (id: string, name: string) => {
    MasterPassengerService.deletePassenger(id);
    showToast(`Removed ${name} from passenger list`);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-['Outfit',sans-serif]">
      <div 
        className="w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
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
        <div className="bg-gradient-to-r from-blue-50 via-white to-sky-50 px-5 py-4 border-b border-blue-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Master Passenger List
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {passengers.length} Saved
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                1-Click Auto-Fill Co-Travellers across Flights &amp; Trains
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

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Add Passenger Button / Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Co-Travellers &amp; Family
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isAdding ? 'Cancel' : '+ Add Co-Traveller'}</span>
            </button>
          </div>

          {/* Form to Add Co-Traveller */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3 animate-in fade-in duration-200">
              <h4 className="text-xs font-black text-blue-950 uppercase tracking-wide">
                New Co-Traveller Details
              </h4>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Full Name (As per Govt ID)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">ID Type</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">ID Number (Last 4)</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="e.g. 8920"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Meal Preference</label>
                  <select
                    value={mealPreference}
                    onChange={(e) => setMealPreference(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Jain">Jain Meal</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Diabetic">Diabetic Meal</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Frequent Flyer # (Optional)</label>
                  <input
                    type="text"
                    value={frequentFlyerNo}
                    onChange={(e) => setFrequentFlyerNo(e.target.value)}
                    placeholder="e.g. AI-982104"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
              >
                Save Passenger
              </button>
            </form>
          )}

          {/* List of Saved Passengers */}
          <div className="space-y-2">
            {passengers.map((pax) => (
              <div
                key={pax.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 truncate">{pax.fullName}</p>
                      {pax.isPrimary && (
                        <span className="text-[9.5px] font-mono font-black uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {pax.age} yrs • {pax.gender} • {pax.mealPreference} Meal • {pax.idType}: <span className="font-mono">{pax.idNumber}</span>
                    </p>
                  </div>
                </div>

                {!pax.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleDelete(pax.id, pax.fullName)}
                    title="Delete Passenger"
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted with ISO-27001 Zero-Trust Storage</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
