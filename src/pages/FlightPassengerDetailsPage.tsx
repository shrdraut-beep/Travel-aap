import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck, 
  Plane, 
  Calendar,
  Lock,
  Building
} from 'lucide-react';
import { BrandHeader } from '../components/common/BrandHeader';
import { useAuthStore } from '../store/useAuthStore';

export interface PassengerFormData {
  id: string;
  type: 'Adult' | 'Child' | 'Infant';
  title: 'Mr' | 'Ms' | 'Mrs' | 'Mstr';
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  nationality: string;
}

export interface ContactFormData {
  phone: string;
  email: string;
  hasGST: boolean;
  gstNumber?: string;
  companyName?: string;
}

export const FlightPassengerDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore(s => s.currentUser);

  const state = location.state as {
    flight?: any;
    item?: any;
    selectedPlan?: any;
    selectedFare?: any;
    totalAmount?: number;
    passengerCount?: number;
    adults?: number;
    children?: number;
    infants?: number;
    searchParams?: any;
    offer_id?: string;
    currency?: string;
    currencySymbol?: string;
    lang?: string;
    passengers?: PassengerFormData[];
    contactInfo?: ContactFormData;
  } | undefined;

  const flight = state?.flight || state?.item?.meta?.flight;
  const selectedPlan = state?.selectedPlan || state?.selectedFare;
  const adultCount = Math.max(1, state?.adults ?? state?.passengerCount ?? 1);
  const childCount = Math.max(0, state?.children ?? 0);
  const infantCount = Math.max(0, state?.infants ?? 0);
  const totalPaxCount = adultCount + childCount + infantCount;

  // Initialize passenger list strictly according to traveler counts (no dummy names)
  const [passengers, setPassengers] = useState<PassengerFormData[]>(() => {
    if (state?.passengers && state.passengers.length === totalPaxCount) {
      return state.passengers;
    }
    const list: PassengerFormData[] = [];
    for (let i = 0; i < adultCount; i++) {
      list.push({
        id: `pax-adult-${i + 1}`,
        type: 'Adult',
        title: 'Mr',
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        nationality: 'India'
      });
    }
    for (let i = 0; i < childCount; i++) {
      list.push({
        id: `pax-child-${i + 1}`,
        type: 'Child',
        title: 'Mstr',
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        nationality: 'India'
      });
    }
    for (let i = 0; i < infantCount; i++) {
      list.push({
        id: `pax-infant-${i + 1}`,
        type: 'Infant',
        title: 'Mstr',
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        nationality: 'India'
      });
    }
    return list;
  });

  const [contactInfo, setContactInfo] = useState<ContactFormData>(() => {
    return state?.contactInfo || {
      phone: (currentUser as any)?.phone || '',
      email: currentUser?.email || '',
      hasGST: false,
      gstNumber: '',
      companyName: ''
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Flight Route details for header
  const originCode = flight?.origin || flight?.originCode || state?.searchParams?.origin || 'BOM';
  const destCode = flight?.destination || flight?.destinationCode || state?.searchParams?.destination || 'DEL';
  const airlineName = flight?.airline || flight?.owner?.name || 'IndiGo';
  const flightNumber = flight?.flightNumber || '6E-2045';

  const updatePassenger = (idx: number, field: keyof PassengerFormData, val: any) => {
    setPassengers(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });

    const errorKey = `pax_${idx}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const updateContact = (field: keyof ContactFormData, val: any) => {
    setContactInfo(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    passengers.forEach((pax, idx) => {
      if (!pax.firstName || pax.firstName.trim().length < 2) {
        newErrors[`pax_${idx}_firstName`] = 'First name is required (min 2 letters)';
      }
      if (!pax.lastName || pax.lastName.trim().length < 1) {
        newErrors[`pax_${idx}_lastName`] = 'Last name is required as per Govt ID';
      }
      if (!pax.gender) {
        newErrors[`pax_${idx}_gender`] = 'Please select gender';
      }
      if (!pax.dob || !pax.dob.trim()) {
        newErrors[`pax_${idx}_dob`] = 'Date of birth is required';
      }
    });

    const cleanPhone = contactInfo.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Mobile number is required';
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!contactInfo.email || !contactInfo.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (contactInfo.hasGST) {
      if (!contactInfo.companyName?.trim()) {
        newErrors.companyName = 'Company name is required for GST invoice';
      }
      if (!contactInfo.gstNumber?.trim() || contactInfo.gstNumber.trim().length < 15) {
        newErrors.gstNumber = 'Valid 15-character GSTIN is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = useMemo(() => {
    const cleanPhone = contactInfo.phone.replace(/\D/g, '');
    const phoneValid = cleanPhone.length === 10;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email.trim());

    const paxValid = passengers.every(
      p => p.firstName.trim().length >= 2 && p.lastName.trim().length >= 1 && Boolean(p.gender) && Boolean(p.dob.trim())
    );

    return phoneValid && emailValid && paxValid;
  }, [passengers, contactInfo]);

  const handleContinueToSeats = () => {
    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    navigate('/flights/seats', {
      state: {
        ...state,
        flight,
        item: state?.item,
        selectedPlan,
        passengers,
        contactInfo,
        totalAmount: state?.totalAmount || selectedPlan?.inrPrice || 4890,
        passengerCount: totalPaxCount,
        adults: adultCount,
        children: childCount,
        infants: infantCount,
        searchParams: state?.searchParams,
        offer_id: state?.offer_id || flight?.id,
        currency: 'INR',
        currencySymbol: '₹',
        lang: 'en'
      }
    });
  };

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Booking Session Expired</h2>
          <p className="text-sm text-slate-500 mb-6">Please select your flight again from the search results.</p>
          <button 
            onClick={() => navigate('/flights/results')}
            className="w-full bg-[#0B1E3D] hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all cursor-pointer"
          >
            Back to Flight Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Brand Header */}
      <BrandHeader
        title="Passenger Details"
        subtitle={`${airlineName} ${flightNumber} • ${originCode} ➔ ${destCode} • ${totalPaxCount} Traveler${totalPaxCount > 1 ? 's' : ''}`}
        onBack={() => navigate(-1)}
      />

      {/* Step Progress Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs font-bold text-slate-500 overflow-x-auto gap-2">
          <div className="flex items-center gap-1 text-pink-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>1. Fare</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1 text-rose-600 font-black">
            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white flex items-center justify-center text-[10px]">2</span>
            <span>Passenger Details</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1 text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">3</span>
            <span>Seats</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1 text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">4</span>
            <span>Meals</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1 text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">5</span>
            <span>Baggage</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1 text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">6</span>
            <span>Review & Pay</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6 pb-36 overflow-y-auto">
        
        {/* Government Photo ID Match Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-orange-900 leading-relaxed shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-orange-950 block mb-0.5">Government ID Match Required (Aadhaar / Passport / Voter ID)</span>
            <span>
              Please enter names exactly as they appear on official photo IDs. Airlines charge heavy penalties or may deny boarding if ticket names do not match government ID.
            </span>
          </div>
        </div>

        {/* Dynamic Passenger Forms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-rose-600" />
              <span>Traveler Information ({totalPaxCount} Traveler{totalPaxCount > 1 ? 's' : ''})</span>
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {adultCount} Adult{adultCount > 1 ? 's' : ''} {childCount > 0 ? `• ${childCount} Child` : ''} {infantCount > 0 ? `• ${infantCount} Infant` : ''}
            </span>
          </div>

          {passengers.map((pax, idx) => (
            <div key={pax.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#0B1E3D] text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </span>
                  <span className="font-extrabold text-sm text-slate-900">
                    Passenger {idx + 1} ({pax.type})
                  </span>
                </div>
                {pax.firstName && pax.lastName && pax.gender && pax.dob ? (
                  <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full">
                    Required
                  </span>
                )}
              </div>

              {/* Title & Names Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Title *</label>
                  <select
                    value={pax.title}
                    onChange={(e) => updatePassenger(idx, 'title', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                  >
                    {pax.type === 'Adult' ? (
                      <>
                        <option value="Mr">Mr.</option>
                        <option value="Ms">Ms.</option>
                        <option value="Mrs">Mrs.</option>
                      </>
                    ) : (
                      <>
                        <option value="Mstr">Master</option>
                        <option value="Ms">Miss</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="sm:col-span-1.5">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">First & Middle Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul"
                    value={pax.firstName}
                    onChange={(e) => updatePassenger(idx, 'firstName', e.target.value)}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none ${
                      errors[`pax_${idx}_firstName`] ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-rose-500'
                    }`}
                  />
                  {errors[`pax_${idx}_firstName`] && (
                    <span className="text-[10px] font-bold text-rose-500 mt-1 block">
                      {errors[`pax_${idx}_firstName`]}
                    </span>
                  )}
                </div>

                <div className="sm:col-span-1.5">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Last Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma"
                    value={pax.lastName}
                    onChange={(e) => updatePassenger(idx, 'lastName', e.target.value)}
                    className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none ${
                      errors[`pax_${idx}_lastName`] ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-rose-500'
                    }`}
                  />
                  {errors[`pax_${idx}_lastName`] && (
                    <span className="text-[10px] font-bold text-rose-500 mt-1 block">
                      {errors[`pax_${idx}_lastName`]}
                    </span>
                  )}
                </div>
              </div>

              {/* Gender & DOB Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Gender *</label>
                  <div className="flex gap-2">
                    {(['Male', 'Female', 'Other'] as const).map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => updatePassenger(idx, 'gender', g)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          pax.gender === g
                            ? 'bg-rose-50 border-rose-500 text-rose-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {errors[`pax_${idx}_gender`] && (
                    <span className="text-[10px] font-bold text-rose-500 mt-1 block">
                      {errors[`pax_${idx}_gender`]}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Date of Birth * ({pax.type === 'Adult' ? '12+ yrs' : pax.type === 'Child' ? '2-12 yrs' : '< 2 yrs'})
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={pax.dob}
                      onChange={(e) => updatePassenger(idx, 'dob', e.target.value)}
                      className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none ${
                        errors[`pax_${idx}_dob`] ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-rose-500'
                      }`}
                    />
                  </div>
                  {errors[`pax_${idx}_dob`] && (
                    <span className="text-[10px] font-bold text-rose-500 mt-1 block">
                      {errors[`pax_${idx}_dob`]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Details Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Phone className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-sm font-black text-slate-900">Primary Contact Information</h3>
              <p className="text-[11px] text-slate-500">Booking confirmation, PNR, and e-Tickets will be sent here</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Mobile Number *</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-rose-500">
                <span className="bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-600 flex items-center border-r border-slate-200">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9820012345"
                  value={contactInfo.phone}
                  onChange={(e) => updateContact('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>
              {errors.phone && (
                <span className="text-[10px] font-bold text-rose-500 mt-1 block">{errors.phone}</span>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Email Address *</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-rose-500">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={contactInfo.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                  className="w-full bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>
              {errors.email && (
                <span className="text-[10px] font-bold text-rose-500 mt-1 block">{errors.email}</span>
              )}
            </div>
          </div>

          {/* GST Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={contactInfo.hasGST}
                onChange={(e) => updateContact('hasGST', e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs font-bold text-slate-700">I have a GST number for business tax credit</span>
            </label>

            {contactInfo.hasGST && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-dashed border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    placeholder="Registered Legal Entity Name"
                    value={contactInfo.companyName || ''}
                    onChange={(e) => updateContact('companyName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                  {errors.companyName && (
                    <span className="text-[10px] font-bold text-rose-500 mt-1 block">{errors.companyName}</span>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">GSTIN *</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="27AABCU9603R1ZM"
                    value={contactInfo.gstNumber || ''}
                    onChange={(e) => updateContact('gstNumber', e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 uppercase"
                  />
                  {errors.gstNumber && (
                    <span className="text-[10px] font-bold text-rose-500 mt-1 block">{errors.gstNumber}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar with Validation Gate */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-xl z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
              Total Fare ({totalPaxCount} Traveler{totalPaxCount > 1 ? 's' : ''})
            </span>
            <span className="text-2xl font-black text-slate-900">
              ₹{(state?.totalAmount || selectedPlan?.inrPrice || 4890).toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="button"
            disabled={!isFormValid}
            onClick={handleContinueToSeats}
            className={`flex-1 max-w-xs font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
              isFormValid
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:brightness-105 active:scale-98 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
            }`}
          >
            <span>{isFormValid ? 'Continue to Seats' : 'Fill All Required Details'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightPassengerDetailsPage;
