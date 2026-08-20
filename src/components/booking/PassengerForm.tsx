// src/components/booking/PassengerForm.tsx
import React, { useState, useEffect } from 'react';
import { useBookingFlow, Passenger } from '../../context/BookingFlowContext';
import { User, Users, CheckCircle2, AlertCircle, ShieldAlert, HeartHandshake, ChevronDown, ChevronUp } from 'lucide-react';

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

export const PassengerForm: React.FC = () => {
  const { state, dispatch } = useBookingFlow();
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const handleUpdate = (index: number, patch: Partial<Passenger>) => {
    const current = state.passengers[index];
    if (!current) return;
    dispatch({
      type: 'SET_PASSENGER',
      index,
      passenger: { ...current, ...patch },
    });
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

  // Auto-expand next invalid passenger when current becomes valid
  useEffect(() => {
    const currentPax = state.passengers[expandedIndex];
    if (currentPax && isPassengerValid(currentPax)) {
      const nextInvalidIndex = state.passengers.findIndex(p => !isPassengerValid(p));
      if (nextInvalidIndex !== -1 && nextInvalidIndex !== expandedIndex) {
        setExpandedIndex(nextInvalidIndex);
      }
    }
  }, [state.passengers, expandedIndex]);

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

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0B1E3D] font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-sm text-[#0B1E3D] uppercase tracking-wide">
              Traveller Details ({state.passengers.length} Passenger{state.passengers.length > 1 ? 's' : ''})
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Names must match Government ID proof
            </p>
          </div>
        </div>
        <span className="text-xs font-black px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full shrink-0">
          {state.passengers.filter(isPassengerValid).length}/{state.passengers.length} Valid
        </span>
      </div>

      {/* Dynamic N-Passenger Forms - Accordion */}
      <div className="space-y-3">
        {state.passengers.map((pax, index) => {
          const isValid = isPassengerValid(pax);
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={index}
              className={`bg-white rounded-3xl border-2 transition-all shadow-sm overflow-hidden ${
                isValid ? 'border-emerald-300 ring-2 ring-emerald-100' : isExpanded ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
              }`}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                className="w-full p-4 sm:p-5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center transition-colors ${isValid ? 'bg-emerald-500 text-white' : isExpanded ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {index + 1}
                  </span>
                  <div className="text-left">
                    <h5 className="font-black text-slate-900 text-sm">
                      {pax.firstName || pax.lastName ? `${pax.salutation} ${pax.firstName} ${pax.lastName}`.trim() : `Passenger ${index + 1}`}
                    </h5>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {pax.passengerType || 'Adult'} {pax.isUnaccompaniedMinor ? '• Unaccompanied' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200 space-y-4">
                  
                  {/* Salutation, First Name, Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-4">
                    {/* Type */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={pax.passengerType || 'Adult'}
                        onChange={(e) => {
                          const newType = e.target.value as 'Adult' | 'Child' | 'Infant';
                          handleUpdate(index, { 
                            passengerType: newType,
                            salutation: newType === 'Child' || newType === 'Infant' ? 'Mstr.' : 'Mr.'
                          });
                        }}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-hidden cursor-pointer"
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
                        value={pax.salutation}
                        onChange={(e) => handleUpdate(index, { salutation: e.target.value as any })}
                        className="w-full h-11 px-2 sm:px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-hidden cursor-pointer"
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
                        value={pax.firstName}
                        onChange={(e) => handleUpdate(index, { firstName: e.target.value })}
                        className={`w-full h-11 px-3 bg-slate-50 border rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 outline-hidden ${
                          pax.firstName && pax.firstName.trim().length < 2
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                            : 'border-slate-200 focus:border-rose-400 focus:ring-rose-400'
                        }`}
                      />
                    </div>

                    {/* Last Name */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sharma"
                        value={pax.lastName}
                        onChange={(e) => handleUpdate(index, { lastName: e.target.value })}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-hidden"
                      />
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
                        value={pax.gender}
                        onChange={(e) => handleUpdate(index, { gender: e.target.value as any })}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-hidden cursor-pointer"
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
                        value={pax.dob || ''}
                        onChange={(e) => handleDobChange(index, e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-hidden tracking-widest"
                      />
                    </div>

                    {/* Nationality */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Nationality <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={pax.nationality}
                        onChange={(e) => handleUpdate(index, { nationality: e.target.value })}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-hidden cursor-pointer"
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
                    <label className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 cursor-pointer hover:bg-amber-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <HeartHandshake className="w-4 h-4 text-amber-700" />
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
                        checked={pax.isUnaccompaniedMinor}
                        onChange={(e) => handleUpdate(index, { isUnaccompaniedMinor: e.target.checked })}
                        className="w-5 h-5 rounded-md accent-[#FF5A5F] cursor-pointer"
                      />
                    </label>

                    {/* Guardian Details Prompt when checked */}
                    {pax.isUnaccompaniedMinor && (
                      <div className="mt-3 p-4 bg-white rounded-2xl border border-amber-300 shadow-xs space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                          <ShieldAlert className="w-4 h-4 text-amber-700" />
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
                              value={pax.guardianName || ''}
                              onChange={(e) => handleUpdate(index, { guardianName: e.target.value })}
                              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-400 outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Phone (+91) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="tel"
                              maxLength={10}
                              placeholder="9876543210"
                              value={pax.guardianPhone || ''}
                              onChange={(e) => handleUpdate(index, { guardianPhone: e.target.value.replace(/\D/g, '') })}
                              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-400 outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Relationship
                            </label>
                            <select
                              value={pax.guardianRelation || 'Parent'}
                              onChange={(e) => handleUpdate(index, { guardianRelation: e.target.value })}
                              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-rose-400 outline-hidden cursor-pointer"
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
                  
                  {/* Footer Action */}
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    {isValid ? (
                      <button
                        type="button"
                        onClick={() => {
                          const nextInvalidIndex = state.passengers.findIndex(p => !isPassengerValid(p));
                          if (nextInvalidIndex !== -1) {
                            setExpandedIndex(nextInvalidIndex);
                          } else {
                            setExpandedIndex(-1);
                          }
                        }}
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Save & Collapse
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
