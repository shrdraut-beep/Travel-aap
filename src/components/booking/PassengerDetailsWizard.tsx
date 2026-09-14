import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  AlertCircle, 
  Check, 
  CheckCircle2, 
  CreditCard,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Building,
  Calendar
} from 'lucide-react';

export interface PassengerFormData {
  id: string;
  type: 'Adult' | 'Child' | 'Infant';
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  nationality: string;
}

export interface ContactFormData {
  phone: string;
  email: string;
  hasGST: boolean;
  gstNumber: string;
  companyName: string;
}

export interface PassengerDetailsWizardProps {
  passengers: PassengerFormData[];
  contactInfo: ContactFormData;
  errors: Record<string, string>;
  onUpdatePassenger: (id: string, field: keyof PassengerFormData, val: any) => void;
  onUpdateContact: (field: keyof ContactFormData, val: any) => void;
  onCompleteWizard?: () => void;
  onStepChange?: (stepIndex: number, isBillingStep: boolean) => void;
}

export const PassengerDetailsWizard: React.FC<PassengerDetailsWizardProps> = ({
  passengers,
  contactInfo,
  errors,
  onUpdatePassenger,
  onUpdateContact,
  onCompleteWizard,
  onStepChange,
}) => {
  // Step index: 0 to passengers.length - 1 (individual passengers), and passengers.length (Billing & Contact)
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const isBillingStep = currentStep === passengers.length;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/\D/g, '').slice(0, 10);
    onUpdateContact('phone', cleanDigits);
    if (localErrors.phone) {
      setLocalErrors(prev => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    let birthDate: Date;
    if (dobString.includes('/')) {
      const parts = dobString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        birthDate = new Date(year, month, day);
      } else {
        return null;
      }
    } else if (dobString.includes('-')) {
      birthDate = new Date(dobString);
    } else {
      return null;
    }

    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validatePassenger = (index: number): boolean => {
    const pax = passengers[index];
    if (!pax) return true;

    const newErrors: Record<string, string> = {};

    if (!pax.firstName || !pax.firstName.trim()) {
      newErrors[`pax_${index}_firstName`] = 'First name is required as per Govt ID';
    } else if (pax.firstName.trim().length < 2) {
      newErrors[`pax_${index}_firstName`] = 'Please enter at least 2 characters';
    }

    if (!pax.lastName || !pax.lastName.trim()) {
      newErrors[`pax_${index}_lastName`] = 'Last name is required as per Govt ID';
    } else if (pax.lastName.trim().length < 1) {
      newErrors[`pax_${index}_lastName`] = 'Please enter last name';
    }

    if (!pax.dob || !pax.dob.trim()) {
      newErrors[`pax_${index}_dob`] = 'Date of birth is required';
    } else {
      const age = calculateAge(pax.dob);
      if (age === null) {
        newErrors[`pax_${index}_dob`] = 'Please enter valid date (DD/MM/YYYY)';
      } else if (pax.type === 'Adult' && age < 12) {
        newErrors[`pax_${index}_dob`] = 'Adult must be 12+ years old';
      } else if (pax.type === 'Child' && (age < 2 || age >= 12)) {
        newErrors[`pax_${index}_dob`] = 'Child must be between 2 and 11 years (under 12 years)';
      } else if (pax.type === 'Infant' && (age < 0 || age >= 2)) {
        newErrors[`pax_${index}_dob`] = 'Infant must be under 2 years';
      }
    }

    setLocalErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateBillingStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contactInfo.phone || !contactInfo.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (contactInfo.phone.trim().length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!contactInfo.email || !contactInfo.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (contactInfo.hasGST) {
      if (!contactInfo.companyName || !contactInfo.companyName.trim()) {
        newErrors.companyName = 'Company name is required for GST invoice';
      }
      if (!contactInfo.gstNumber || !contactInfo.gstNumber.trim()) {
        newErrors.gstNumber = 'GSTIN is required';
      } else if (contactInfo.gstNumber.trim().length < 15) {
        newErrors.gstNumber = 'Valid 15-character GSTIN required';
      }
    }

    setLocalErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const changeStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (onStepChange) {
      onStepChange(newStep, newStep === passengers.length);
    }
  };

  const handleNextPassenger = () => {
    if (currentStep < passengers.length) {
      if (validatePassenger(currentStep)) {
        changeStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      changeStep(currentStep - 1);
    }
  };

  const handleStepClick = (targetIndex: number) => {
    // Only allow jumping back to earlier steps, or forward if all previous steps are valid
    if (targetIndex < currentStep) {
      changeStep(targetIndex);
    } else if (targetIndex === currentStep) {
      return;
    } else {
      // Validate all steps from currentStep up to targetIndex - 1
      for (let i = 0; i < targetIndex; i++) {
        if (i < passengers.length && !validatePassenger(i)) {
          changeStep(i);
          return;
        }
      }
      changeStep(targetIndex);
    }
  };

  const handleProceedToReview = () => {
    if (validateBillingStep()) {
      if (onCompleteWizard) {
        onCompleteWizard();
      }
    }
  };

  const currentPax = passengers[currentStep];
  const activeFirstNameError = localErrors[`pax_${currentStep}_firstName`] || errors[`pax_${currentStep}_firstName`] || (currentPax ? errors[`pax_${currentPax.id}_firstName`] : undefined);
  const activeLastNameError = localErrors[`pax_${currentStep}_lastName`] || errors[`pax_${currentStep}_lastName`] || (currentPax ? errors[`pax_${currentPax.id}_lastName`] : undefined);
  const activeDobError = localErrors[`pax_${currentStep}_dob`] || errors[`pax_${currentStep}_dob`];
  const activePhoneError = localErrors.phone || errors.phone;
  const activeEmailError = localErrors.email || errors.email;
  const activeGstError = localErrors.gstNumber || errors.gstNumber;
  const activeCompanyError = localErrors.companyName || errors.companyName;

  return (
    <div className="space-y-6 ">
      {/* 1. Strict Top Horizontal Step Tracker */}
      <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-rose-600">
              Passenger & Contact Wizard
            </span>
            <span className="text-xs font-medium text-slate-400">•</span>
            <span className="text-xs font-bold text-slate-600">
              {isBillingStep 
                ? 'Final Step: Contact & GST' 
                : `Step ${currentStep + 1} of ${passengers.length + 1}: ${currentPax?.type || 'Passenger'} ${currentStep + 1}`}
            </span>
          </div>
          <span className="text-xs font-black px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
            {currentStep + 1} / {passengers.length + 1}
          </span>
        </div>

        {/* Strict Step Sequence Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {passengers.map((pax, idx) => {
            const isActive = currentStep === idx;
            const isCompleted = currentStep > idx;
            const hasName = Boolean(pax.firstName && pax.lastName);

            return (
              <React.Fragment key={pax.id || idx}>
                <button
                  type="button"
                  onClick={() => handleStepClick(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-[16px] text-xs font-black transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] ring-2 ring-rose-600/20'
                      : isCompleted
                      ? 'bg-premium-sky-soft text-premium-sky-deep border border-premium-sky-deep hover:bg-premium-sky-soft'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive
                        ? 'bg-white text-rose-600'
                        : isCompleted
                        ? 'bg-premium-sky-deep text-white'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </span>
                  <span className="whitespace-nowrap">
                    {pax.type} {idx + 1}
                    {hasName && !isActive && (
                      <span className="font-normal text-[11px] ml-1 opacity-90">({pax.firstName})</span>
                    )}
                  </span>
                </button>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </React.Fragment>
            );
          })}

          {/* Final Billing Step */}
          <button
            type="button"
            onClick={() => handleStepClick(passengers.length)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-[16px] text-xs font-black transition-all shrink-0 cursor-pointer ${
              isBillingStep
                ? 'bg-rose-600 text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] ring-2 ring-rose-600/20'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                isBillingStep ? 'bg-white text-rose-600' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {passengers.length + 1}
            </span>
            <span className="whitespace-nowrap">Billing & Contact</span>
          </button>
        </div>
      </div>

      {/* 2. Step Form: EXACT ONE Passenger Form at a time */}
      {!isBillingStep && currentPax && (
        <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[20px] bg-rose-600/10 text-rose-600 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {currentPax.type} {currentStep + 1} Details
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Enter details exactly matching Government photo ID proof (Aadhaar / Passport / Voter ID)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              Passenger {currentStep + 1} of {passengers.length}
            </span>
          </div>

          {/* Form Fields for Active Passenger */}
          <div className="space-y-4">
            {/* Title, First Name, Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentPax.title}
                  onChange={(e) => onUpdatePassenger(currentPax.id, 'title', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-[16px] px-3 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-rose-600 focus:outline-none cursor-pointer"
                >
                  {currentPax.type === 'Adult' ? (
                    <>
                      <option value="Mr">Mr.</option>
                      <option value="Mrs">Mrs.</option>
                      <option value="Ms">Ms.</option>
                    </>
                  ) : (
                    <>
                      <option value="Mstr">Mstr.</option>
                      <option value="Miss">Miss</option>
                    </>
                  )}
                </select>
              </div>

              <div className="sm:col-span-5">
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  First & Middle Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh"
                  value={currentPax.firstName}
                  onChange={(e) => {
                    onUpdatePassenger(currentPax.id, 'firstName', e.target.value);
                    if (localErrors[`pax_${currentStep}_firstName`]) {
                      setLocalErrors(prev => {
                        const next = { ...prev };
                        delete next[`pax_${currentStep}_firstName`];
                        return next;
                      });
                    }
                  }}
                  className={`w-full bg-white border rounded-[16px] px-3.5 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                    activeFirstNameError
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-rose-600'
                  }`}
                />
                {activeFirstNameError && (
                  <span className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{activeFirstNameError}</span>
                  </span>
                )}
              </div>

              <div className="sm:col-span-4">
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharma"
                  value={currentPax.lastName}
                  onChange={(e) => {
                    onUpdatePassenger(currentPax.id, 'lastName', e.target.value);
                    if (localErrors[`pax_${currentStep}_lastName`]) {
                      setLocalErrors(prev => {
                        const next = { ...prev };
                        delete next[`pax_${currentStep}_lastName`];
                        return next;
                      });
                    }
                  }}
                  className={`w-full bg-white border rounded-[16px] px-3.5 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                    activeLastNameError
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-rose-600'
                  }`}
                />
                {activeLastNameError && (
                  <span className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{activeLastNameError}</span>
                  </span>
                )}
              </div>
            </div>

            {/* DOB, Gender & Nationality */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">DD/MM/YYYY</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    value={
                      // If stored as YYYY-MM-DD, display as DD/MM/YYYY for manual entry
                      currentPax.dob && currentPax.dob.includes('-') && currentPax.dob.length === 10
                        ? (() => {
                            const [y, m, d] = currentPax.dob.split('-');
                            return `${d}/${m}/${y}`;
                          })()
                        : currentPax.dob || ''
                    }
                    onChange={(e) => {
                      let val = e.target.value;
                      // Auto-format as DD/MM/YYYY when typing digits
                      const digits = val.replace(/\D/g, '').slice(0, 8);
                      let formatted = '';
                      if (digits.length > 0) formatted = digits.slice(0, 2);
                      if (digits.length >= 3) formatted += '/' + digits.slice(2, 4);
                      if (digits.length >= 5) formatted += '/' + digits.slice(4, 8);

                      onUpdatePassenger(currentPax.id, 'dob', formatted);
                      if (localErrors[`pax_${currentStep}_dob`]) {
                        setLocalErrors(prev => {
                          const next = { ...prev };
                          delete next[`pax_${currentStep}_dob`];
                          return next;
                        });
                      }
                    }}
                    className={`w-full bg-white border rounded-[16px] pl-3.5 pr-10 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                      activeDobError
                        ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                        : 'border-slate-300 focus:ring-2 focus:ring-rose-600'
                    }`}
                  />
                  {/* Hidden date picker synced with calendar icon */}
                  <input
                    type="date"
                    id={`dob-picker-${currentPax.id}`}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split('-');
                        onUpdatePassenger(currentPax.id, 'dob', `${d}/${m}/${y}`);
                        if (localErrors[`pax_${currentStep}_dob`]) {
                          setLocalErrors(prev => {
                            const next = { ...prev };
                            delete next[`pax_${currentStep}_dob`];
                            return next;
                          });
                        }
                      }
                    }}
                    className="sr-only"
                    tabIndex={-1}
                  />
                  <label
                    htmlFor={`dob-picker-${currentPax.id}`}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer transition-colors"
                    title="Choose from calendar"
                  >
                    <Calendar className="w-4 h-4" />
                  </label>
                </div>
                {activeDobError ? (
                  <span className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{activeDobError}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {currentPax.type === 'Adult' && 'Age 12+ years'}
                    {currentPax.type === 'Child' && 'Age between 2 and 11 years'}
                    {currentPax.type === 'Infant' && 'Age under 2 years'}
                  </span>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentPax.gender}
                  onChange={(e) => {
                    const newGender = e.target.value as 'Male' | 'Female' | 'Other';
                    onUpdatePassenger(currentPax.id, 'gender', newGender);
                    if (newGender === 'Female') {
                      if (currentPax.type === 'Adult' && currentPax.title === 'Mr') {
                        onUpdatePassenger(currentPax.id, 'title', 'Mrs');
                      } else if (currentPax.type === 'Child' && currentPax.title === 'Mstr') {
                        onUpdatePassenger(currentPax.id, 'title', 'Miss');
                      }
                    } else if (newGender === 'Male') {
                      if (currentPax.type === 'Adult' && (currentPax.title === 'Mrs' || currentPax.title === 'Ms')) {
                        onUpdatePassenger(currentPax.id, 'title', 'Mr');
                      } else if (currentPax.type === 'Child' && currentPax.title === 'Miss') {
                        onUpdatePassenger(currentPax.id, 'title', 'Mstr');
                      }
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-[16px] px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-rose-600 focus:outline-none cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Nationality <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentPax.nationality}
                  onChange={(e) => onUpdatePassenger(currentPax.id, 'nationality', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-[16px] px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-rose-600 focus:outline-none cursor-pointer"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>
            </div>
          </div>

          {/* Strict Wizard Navigation Buttons */}
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
              onClick={handleNextPassenger}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-[16px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{currentStep === passengers.length - 1 ? 'Next: Billing Details ➔' : `Next: ${passengers[currentStep + 1]?.type || 'Passenger'} ${currentStep + 2} ➔`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Final Step: Billing & Contact Details */}
      {isBillingStep && (
        <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[20px] bg-premium-sky-soft text-premium-sky-deep flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Billing & Contact Details
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Your e-ticket, SMS alerts, and boarding pass updates will be sent here
                </p>
              </div>
            </div>

            <span className="text-xs font-black text-premium-sky-deep bg-premium-sky-soft border border-premium-sky-deep px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All {passengers.length} Passengers Validated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mobile Number - Strictly 10 Digits */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-700 font-bold text-xs">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={contactInfo.phone}
                  onChange={handlePhoneChange}
                  className={`w-full bg-white border rounded-r-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none transition-all ${
                    activePhoneError
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-rose-600'
                  }`}
                />
              </div>
              {activePhoneError && (
                <span className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{activePhoneError}</span>
                </span>
              )}
              <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                {contactInfo.phone.length}/10 digits entered
              </span>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Email ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={contactInfo.email}
                onChange={(e) => {
                  onUpdateContact('email', e.target.value);
                  if (localErrors.email) {
                    setLocalErrors(prev => {
                      const next = { ...prev };
                      delete next.email;
                      return next;
                    });
                  }
                }}
                className={`w-full bg-white border rounded-[16px] px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none transition-all ${
                  activeEmailError
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-2 focus:ring-rose-600'
                }`}
              />
              {activeEmailError && (
                <span className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{activeEmailError}</span>
                </span>
              )}
            </div>
          </div>

          {/* GST Option */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={contactInfo.hasGST}
                onChange={(e) => onUpdateContact('hasGST', e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-600"
              />
              <span>I have a GST number (Optional for corporate tax invoice)</span>
            </label>

            {contactInfo.hasGST && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <input
                    type="text"
                    placeholder="Registered Company Name *"
                    value={contactInfo.companyName}
                    onChange={(e) => {
                      onUpdateContact('companyName', e.target.value);
                      if (localErrors.companyName) {
                        setLocalErrors(prev => {
                          const next = { ...prev };
                          delete next.companyName;
                          return next;
                        });
                      }
                    }}
                    className={`w-full bg-white border rounded-[16px] px-3.5 py-2.5 text-xs font-semibold ${
                      activeCompanyError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {activeCompanyError && (
                    <span className="text-[10px] font-bold text-rose-500 mt-1 block">{activeCompanyError}</span>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="GST Registration No (e.g. 27AAAAA0000A1Z5) *"
                    value={contactInfo.gstNumber}
                    onChange={(e) => {
                      onUpdateContact('gstNumber', e.target.value.toUpperCase());
                      if (localErrors.gstNumber) {
                        setLocalErrors(prev => {
                          const next = { ...prev };
                          delete next.gstNumber;
                          return next;
                        });
                      }
                    }}
                    className={`w-full bg-white border rounded-[16px] px-3.5 py-2.5 text-xs font-semibold uppercase ${
                      activeGstError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {activeGstError && (
                    <span className="text-[10px] font-bold text-rose-500 mt-1 block">{activeGstError}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Passenger Summary Chips */}
          <div className="bg-transparent rounded-[16px] p-3 border border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Configured Travelers:</span>
            {passengers.map((p, idx) => (
              <span
                key={p.id || idx}
                onClick={() => changeStep(idx)}
                className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-semibold cursor-pointer hover:border-rose-600 hover:text-rose-600 transition-colors"
              >
                {p.title} {p.firstName || `Pax ${idx + 1}`} {p.lastName}
              </span>
            ))}
          </div>

          {/* Wizard Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-[16px] border border-slate-300 text-slate-700 font-bold text-xs hover:bg-transparent transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Passenger {passengers.length}</span>
            </button>

            <button
              type="button"
              onClick={handleProceedToReview}
              className="px-6 py-2.5 bg-premium-sky-deep hover:bg-[var(--premium-sky-deep)] text-white font-extrabold text-xs rounded-[16px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>Validate & Confirm Details</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerDetailsWizard;
