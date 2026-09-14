// src/components/booking/PassengerForm.tsx
import React, { useState } from 'react';
import { useBookingFlow, Passenger } from '../../context/BookingFlowContext';
import { 
  User, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  HeartHandshake, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ChevronRight,
  Phone
} from 'lucide-react';

const NATIONALITIES = [
  'India',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Singapore',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Nepal',
  'Sri Lanka',
  'Other',
];

interface PassengerFormProps {
  onAllCompleted?: () => void;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({ onAllCompleted }) => {
  const { state, dispatch } = useBookingFlow();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const handleUpdate = (index: number, patch: Partial<Passenger>) => {
    const current = state.passengers[index];
    if (!current) return;
    dispatch({
      type: 'SET_PASSENGER',
      index,
      passenger: { ...current, ...patch },
    });

    // Clear step error
    if (Object.keys(stepErrors).length > 0) {
      setStepErrors({});
    }
  };

  const isPassengerValid = (pax: Passenger): boolean => {
    if (!pax.firstName || pax.firstName.trim().length < 2) return false;
    if (!pax.lastName || pax.lastName.trim().length < 1) return false;
    if (!pax.dob || pax.dob.trim().length !== 10) return false; // Basic DD/MM/YYYY validation
    if (!pax.nationality || pax.nationality.trim().length === 0) return false;
    if (pax.isUnaccompaniedMinor) {
      if (!pax.guardianName || pax.guardianName.trim().length < 2) return false;
      if (!pax.guardianPhone || pax.guardianPhone.trim().replace(/\D/g, '').length < 10) return false;
    }
    return true;
  };

  const handleDobChange = (index: number, value: string) => {
    // Mask as DD/MM/YYYY
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.substring(0, 8);
    
    let formatted = '';
    if (cleaned.length > 0) {
      formatted = cleaned.substring(0, 2);
    }
    if (cleaned.length > 2) {
      formatted += '/' + cleaned.substring(2, 4);
    }
    if (cleaned.length > 4) {
      formatted += '/' + cleaned.substring(4, 8);
    }
    
    handleUpdate(index, { dob: formatted });
  };

  const validateCurrentPassenger = (index: number): boolean => {
    const pax = state.passengers[index];
    if (!pax) return true;

    const errs: Record<string, string> = {};
    if (!pax.firstName || pax.firstName.trim().length < 2) {
      errs.firstName = 'First Name is required (min 2 characters)';
    }
    if (!pax.lastName || pax.lastName.trim().length < 1) {
      errs.lastName = 'Last Name is required';
    }
    if (!pax.dob || pax.dob.trim().length !== 10) {
      errs.dob = 'Date of birth is required in DD/MM/YYYY format';
    }
    if (pax.isUnaccompaniedMinor) {
      if (!pax.guardianName || pax.guardianName.trim().length < 2) {
        errs.guardianName = 'Guardian name is required';
      }
      if (!pax.guardianPhone || pax.guardianPhone.trim().replace(/\D/g, '').length < 10) {
        errs.guardianPhone = 'Valid 10-digit guardian phone required';
      }
    }

    setStepErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep < state.passengers.length) {
      if (validateCurrentPassenger(currentStep)) {
        if (currentStep < state.passengers.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          // All passengers finished
          if (onAllCompleted) {
            onAllCompleted();
          } else {
            setCurrentStep(state.passengers.length);
          }
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentPax = state.passengers[currentStep];

  return (
    <div className="space-y-4">
      {/* 1. Horizontal Visual Tracker */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[20px] bg-rose-50 border border-rose-100 flex items-center justify-center text-[#0B1E3D] font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-[#0B1E3D] uppercase tracking-wide">
                Passenger Details Stepper
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {currentStep < state.passengers.length
                  ? `Filling Passenger ${currentStep + 1} of ${state.passengers.length}`
                  : 'All Passenger Details Recorded'}
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 bg-premium-pink-soft text-premium-pink border border-premium-pink rounded-full shrink-0">
            {state.passengers.filter(isPassengerValid).length}/{state.passengers.length} Done
          </span>
        </div>

        {/* Stepper Steps */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {state.passengers.map((pax, idx) => {
            const isActive = currentStep === idx;
            const isCompleted = isPassengerValid(pax);
            const paxLabel = pax.passengerType || 'Adult';

            return (
              <React.Fragment key={idx}>
                <button
                  type="button"
                  onClick={() => {
                    if (idx <= currentStep || isPassengerValid(pax)) {
                      setCurrentStep(idx);
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-[20px] text-xs font-black transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1E3D] text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]'
                      : isCompleted
                      ? 'bg-premium-sky-soft text-premium-sky-deep border border-premium-sky-deep hover:bg-premium-sky-soft'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive
                        ? 'bg-white text-[#0B1E3D]'
                        : isCompleted
                        ? 'bg-premium-sky-deep text-white'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {isCompleted && !isActive ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </span>
                  <span className="whitespace-nowrap">
                    {paxLabel} {idx + 1}
                    {pax.firstName && !isActive && <span className="font-normal text-[11px] ml-1">({pax.firstName})</span>}
                  </span>
                </button>

                {idx < state.passengers.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 2. Wizard Card: Render ONLY the active passenger form */}
      {currentStep < state.passengers.length && currentPax && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#0B1E3D] text-white text-xs font-black flex items-center justify-center">
                {currentStep + 1}
              </span>
              <div>
                <h5 className="font-black text-slate-900 text-sm">
                  {currentPax.passengerType || 'Adult'} {currentStep + 1} Details
                </h5>
                <p className="text-[11px] font-bold text-slate-500">
                  Government Photo ID Proof required at airport check-in
                </p>
              </div>
            </div>

            {isPassengerValid(currentPax) && (
              <span className="text-xs font-black text-premium-sky-deep bg-premium-sky-soft border border-premium-sky-deep px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Validated
              </span>
            )}
          </div>

          {/* Form Fields for Active Passenger */}
          <div className="space-y-4">
            {/* Salutation, First Name, Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Type */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentPax.passengerType || 'Adult'}
                  onChange={(e) => {
                    const newType = e.target.value as 'Adult' | 'Child' | 'Infant';
                    handleUpdate(currentStep, { 
                      passengerType: newType,
                      salutation: newType === 'Child' || newType === 'Infant' ? 'Mstr.' : 'Mr.'
                    });
                  }}
                  className="w-full h-11 px-3 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-800 focus:bg-white focus:border-rose-400 outline-hidden cursor-pointer"
                >
                  <option value="Adult">Adult (12+ yrs)</option>
                  <option value="Child">Child (2-11 yrs)</option>
                  <option value="Infant">Infant (Under 2)</option>
                </select>
              </div>

              {/* Salutation */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentPax.salutation}
                  onChange={(e) => handleUpdate(currentStep, { salutation: e.target.value as any })}
                  className="w-full h-11 px-2 sm:px-3 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-800 focus:bg-white focus:border-rose-400 outline-hidden cursor-pointer"
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Mstr.">Mstr.</option>
                  <option value="Miss">Miss</option>
                </select>
              </div>

              {/* First Name */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-black text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh"
                  value={currentPax.firstName}
                  onChange={(e) => handleUpdate(currentStep, { firstName: e.target.value })}
                  className={`w-full h-11 px-3 bg-transparent border rounded-[16px] text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 outline-hidden ${
                    stepErrors.firstName
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-200 focus:border-rose-400 focus:ring-rose-400'
                  }`}
                />
                {stepErrors.firstName && (
                  <span className="text-[10px] font-bold text-rose-500 mt-1 block">{stepErrors.firstName}</span>
                )}
              </div>

              {/* Last Name */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharma"
                  value={currentPax.lastName}
                  onChange={(e) => handleUpdate(currentStep, { lastName: e.target.value })}
                  className={`w-full h-11 px-3 bg-transparent border rounded-[16px] text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 outline-hidden ${
                    stepErrors.lastName
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-200 focus:border-rose-400 focus:ring-rose-400'
                  }`}
                />
                {stepErrors.lastName && (
                  <span className="text-[10px] font-bold text-rose-500 mt-1 block">{stepErrors.lastName}</span>
                )}
              </div>
            </div>

            {/* Gender, DOB, Nationality */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Gender */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentPax.gender}
                  onChange={(e) => handleUpdate(currentStep, { gender: e.target.value as any })}
                  className="w-full h-11 px-3 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-800 focus:bg-white focus:border-rose-400 outline-hidden cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date of Birth (Masked Input) */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={currentPax.dob || ''}
                  onChange={(e) => handleDobChange(currentStep, e.target.value)}
                  className={`w-full h-11 px-3 bg-transparent border rounded-[16px] text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 outline-hidden tracking-widest ${
                    stepErrors.dob
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-200 focus:border-rose-400 focus:ring-rose-400'
                  }`}
                />
                {stepErrors.dob && (
                  <span className="text-[10px] font-bold text-rose-500 mt-1 block">{stepErrors.dob}</span>
                )}
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Nationality <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentPax.nationality}
                  onChange={(e) => handleUpdate(currentStep, { nationality: e.target.value })}
                  className="w-full h-11 px-3 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-800 focus:bg-white focus:border-rose-400 outline-hidden cursor-pointer"
                >
                  {NATIONALITIES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Unaccompanied Minor Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between p-3 rounded-[20px] bg-premium-pink-soft/60 border border-premium-pink/80 cursor-pointer hover:bg-premium-pink-soft transition-colors">
                <div className="flex items-center gap-2.5">
                  <HeartHandshake className="w-4 h-4 text-premium-pink" />
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Unaccompanied Minor (Age 5 - 12)
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Check this if child is flying alone
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={currentPax.isUnaccompaniedMinor}
                  onChange={(e) => handleUpdate(currentStep, { isUnaccompaniedMinor: e.target.checked })}
                  className="w-5 h-5 rounded-md accent-[#FF5A5F] cursor-pointer"
                />
              </label>

              {/* Guardian Details Prompt when checked */}
              {currentPax.isUnaccompaniedMinor && (
                <div className="mt-3 p-4 bg-white rounded-[20px] border border-premium-pink shadow-xs space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-xs font-black text-premium-pink">
                    <ShieldAlert className="w-4 h-4 text-premium-pink" />
                    <span>Mandatory Guardian Contact Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Guardian Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Anand Sharma"
                        value={currentPax.guardianName || ''}
                        onChange={(e) => handleUpdate(currentStep, { guardianName: e.target.value })}
                        className="w-full h-10 px-3 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-400 outline-hidden"
                      />
                      {stepErrors.guardianName && (
                        <span className="text-[10px] font-bold text-rose-500 mt-1 block">{stepErrors.guardianName}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Phone (+91) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={currentPax.guardianPhone || ''}
                        onChange={(e) => handleUpdate(currentStep, { guardianPhone: e.target.value.replace(/\D/g, '') })}
                        className="w-full h-10 px-3 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-400 outline-hidden"
                      />
                      {stepErrors.guardianPhone && (
                        <span className="text-[10px] font-bold text-rose-500 mt-1 block">{stepErrors.guardianPhone}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Relationship
                      </label>
                      <select
                        value={currentPax.guardianRelation || 'Parent'}
                        onChange={(e) => handleUpdate(currentStep, { guardianRelation: e.target.value })}
                        className="w-full h-10 px-3 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-800 focus:bg-white focus:border-rose-400 outline-hidden cursor-pointer"
                      >
                        <option value="Parent">Parent</option>
                        <option value="Legal Guardian">Legal Guardian</option>
                        <option value="Sibling / Relative">Sibling / Relative</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Navigation Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-4 py-2.5 rounded-[16px] border border-slate-300 text-slate-700 font-bold text-xs hover:bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#FF5A5F] hover:bg-[#ff4046] text-white font-extrabold text-xs rounded-[16px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{currentStep === state.passengers.length - 1 ? 'Save & Review Details ➔' : 'Next Passenger ➔'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
