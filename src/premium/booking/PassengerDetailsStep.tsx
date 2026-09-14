import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plane,
  X
} from "lucide-react";
import type { SelectedFare } from "./FareSelectionStep";

export interface PassengerDetail {
  id: string;
  paxNumber: number;
  type: "Adult" | "Child" | "Infant";
  title: "Mr" | "Ms" | "Mrs" | "Mstr";
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other" | "";
  dob: string;
  email?: string;
  phone?: string;
}

export interface PassengerDetailsStepProps {
  flight: any;
  searchParams: any;
  selectedFare?: SelectedFare | null;
  selectedSeats?: any[];
  selectedBaggage?: any[];
  selectedMeals?: any[];
  passengerCount?: number;
  initialPassengers?: PassengerDetail[];
  onConfirmPassengers: (passengers: PassengerDetail[]) => void;
  onBack: () => void;
  onSessionExpired?: () => void;
}

export const formatTime = (totalSeconds: number): string => {
  const mm = String(Math.floor(Math.max(0, totalSeconds) / 60)).padStart(2, "0");
  const ss = String(Math.floor(Math.max(0, totalSeconds) % 60)).padStart(2, "0");
  return `${mm}:${ss}`;
};

export const PassengerDetailsStep: React.FC<PassengerDetailsStepProps> = ({
  flight,
  searchParams,
  selectedFare,
  passengerCount,
  initialPassengers,
  onConfirmPassengers,
  onBack
}) => {
  const adultCount = Math.max(1, searchParams?.adults || 1);
  const childCount = Math.max(0, searchParams?.children || 0);
  const infantCount = Math.max(0, searchParams?.infants || 0);
  const calculatedTotal = adultCount + childCount + infantCount;
  const count = Math.max(1, passengerCount || calculatedTotal);

  // Initialize passengers strictly matching Adults, Children, and Infants counts
  const [passengers, setPassengers] = useState<PassengerDetail[]>(() => {
    if (initialPassengers && initialPassengers.length === count) {
      return initialPassengers;
    }
    const list: PassengerDetail[] = [];
    let paxNum = 1;

    // Adults
    for (let i = 0; i < adultCount; i++) {
      list.push({
        id: `pax-${paxNum}`,
        paxNumber: paxNum,
        type: "Adult",
        title: "Mr",
        firstName: "",
        lastName: "",
        gender: "",
        dob: "",
        email: paxNum === 1 ? "" : undefined,
        phone: paxNum === 1 ? "" : undefined
      });
      paxNum++;
    }

    // Children
    for (let i = 0; i < childCount; i++) {
      list.push({
        id: `pax-${paxNum}`,
        paxNumber: paxNum,
        type: "Child",
        title: "Mstr",
        firstName: "",
        lastName: "",
        gender: "",
        dob: ""
      });
      paxNum++;
    }

    // Infants
    for (let i = 0; i < infantCount; i++) {
      list.push({
        id: `pax-${paxNum}`,
        paxNumber: paxNum,
        type: "Infant",
        title: "Mstr",
        firstName: "",
        lastName: "",
        gender: "",
        dob: ""
      });
      paxNum++;
    }

    // If count exceeds adults+children+infants (e.g. manual count passed)
    while (list.length < count) {
      list.push({
        id: `pax-${paxNum}`,
        paxNumber: paxNum,
        type: "Adult",
        title: "Mr",
        firstName: "",
        lastName: "",
        gender: "",
        dob: ""
      });
      paxNum++;
    }

    return list;
  });

  const [activePaxIndex, setActivePaxIndex] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const org = flight?.origin || flight?.originCode || searchParams.origin || "BOM";
  const dst = flight?.destination || flight?.destinationCode || searchParams.destination || "DEL";
  const airline = flight?.airline || "IndiGo";
  const flightNo = flight?.flightNumber || "6E-2045";

  // Field validation logic
  const validateField = (
    paxIndex: number,
    field: keyof PassengerDetail,
    val: any
  ): string | null => {
    const strVal = (val || "").toString().trim();

    if (field === "firstName") {
      if (!strVal) return "First name is required";
      if (strVal.length < 2) return "First name must be at least 2 characters";
      if (!/^[a-zA-Z\s'-]+$/.test(strVal)) return "Only English letters allowed";
    }

    if (field === "lastName") {
      if (!strVal) return "Last name is required";
      if (strVal.length < 1) return "Last name is required";
      if (!/^[a-zA-Z\s'-]+$/.test(strVal)) return "Only English letters allowed";
    }

    if (field === "gender") {
      if (!strVal || !["Male", "Female", "Other"].includes(strVal)) {
        return "Please select a gender";
      }
    }

    if (field === "dob") {
      if (!strVal) return "Date of Birth is required";
      const dateObj = new Date(strVal);
      if (isNaN(dateObj.getTime())) return "Please enter a valid date (YYYY-MM-DD)";
      const now = new Date();
      if (dateObj > now) return "Date of Birth cannot be in the future";
      // Age sanity check (not older than 120 years)
      const ageDiff = (now.getTime() - dateObj.getTime()) / (1000 * 3600 * 24 * 365.25);
      if (ageDiff > 120) return "Please enter a valid Date of Birth";
    }

    if (paxIndex === 0) {
      if (field === "email") {
        if (!strVal) return "Email address is required for ticket delivery";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) {
          return "Please enter a valid email address";
        }
      }

      if (field === "phone") {
        if (!strVal) return "Mobile phone is required for flight updates";
        const digits = strVal.replace(/\D/g, "");
        if (digits.length !== 10) return "Please enter exactly 10 digits";
        if (!/^[6-9]\d{9}$/.test(digits)) return "Please enter a valid 10-digit mobile number (starts with 6, 7, 8, or 9)";
      }
    }

    return null;
  };

  const handleUpdate = (paxIndex: number, field: keyof PassengerDetail, value: any) => {
    let sanitized = value;
    if (field === "phone") {
      sanitized = (value || "").toString().replace(/\D/g, "").slice(0, 10);
    }

    setPassengers((prev) => {
      const copy = [...prev];
      copy[paxIndex] = { ...copy[paxIndex], [field]: sanitized };
      return copy;
    });

    const key = `pax_${paxIndex}_${field}`;
    setTouched((prev) => ({ ...prev, [key]: true }));

    // Real-time validation
    const err = validateField(paxIndex, field, sanitized);
    setErrors((prev) => {
      const copy = { ...prev };
      if (err) {
        copy[key] = err;
      } else {
        delete copy[key];
      }
      return copy;
    });
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    let firstErrorPaxIndex: number | null = null;

    passengers.forEach((pax, i) => {
      const fieldsToCheck: (keyof PassengerDetail)[] = ["firstName", "lastName", "gender", "dob"];
      if (i === 0) {
        fieldsToCheck.push("email", "phone");
      }

      fieldsToCheck.forEach((field) => {
        const key = `pax_${i}_${field}`;
        newTouched[key] = true;
        const err = validateField(i, field, pax[field]);
        if (err) {
          newErrors[key] = err;
          if (firstErrorPaxIndex === null) {
            firstErrorPaxIndex = i;
          }
        }
      });
    });

    setErrors(newErrors);
    setTouched(newTouched);

    if (Object.keys(newErrors).length > 0) {
      if (firstErrorPaxIndex !== null) {
        setActivePaxIndex(firstErrorPaxIndex);
      }
      setToastMessage(
        "Please fill in all required passenger fields (First Name, Last Name, Gender, DOB) before proceeding."
      );
      return false;
    }

    setToastMessage(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateAll();
    if (!isValid) {
      return;
    }
    onConfirmPassengers(passengers);
  };

  const isPaxComplete = (i: number) => {
    const pax = passengers[i];
    if (!pax) return false;
    const hasRequired =
      Boolean(pax.firstName && pax.firstName.trim().length >= 2) &&
      Boolean(pax.lastName && pax.lastName.trim().length >= 1) &&
      Boolean(pax.gender) &&
      Boolean(pax.dob && !validateField(i, "dob", pax.dob));

    if (i === 0) {
      return (
        hasRequired &&
        Boolean(pax.email && !validateField(i, "email", pax.email)) &&
        Boolean(pax.phone && !validateField(i, "phone", pax.phone))
      );
    }
    return hasRequired;
  };

  const currentPax = passengers[activePaxIndex] || passengers[0];

  return (
    <div className="min-h-screen bg-[var(--premium-page)] text-[var(--premium-ink)] pb-28">
      {/* Toast Notification for validation errors */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-rose-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-100" />
          <div className="flex-1 text-xs font-semibold leading-snug">
            {toastMessage}
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white shrink-0 p-1"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="relative z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 -ml-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Back to fare selection"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Passenger Details
                </h1>
                <span className="text-xs font-bold text-[var(--premium-violet)] bg-violet-50 px-2 py-0.5 rounded-full">
                  Step 2 of 6
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span>{airline} {flightNo}</span>
                <span>•</span>
                <span>{org} ➔ {dst}</span>
                {selectedFare && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{selectedFare.name}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Passenger Tab Switcher */}
        {count > 1 && (
          <div className="max-w-4xl mx-auto px-4 py-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {passengers.map((pax, i) => {
              const complete = isPaxComplete(i);
              const isActive = activePaxIndex === i;
              const hasErrors = Object.keys(errors).some((k) => k.startsWith(`pax_${i}_`));

              return (
                <button
                  key={pax.id}
                  type="button"
                  onClick={() => setActivePaxIndex(i)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-[var(--premium-violet)] text-white shadow-xs"
                      : complete
                      ? "bg-pink-50 text-pink-700 border border-pink-200"
                      : hasErrors
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>
                    Traveler {i + 1} ({pax.type})
                    {pax.firstName ? `: ${pax.firstName}` : ""}
                  </span>
                  {complete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-pink-500" />
                  ) : hasErrors ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Form */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Government ID Warning Banner */}
        <div className="bg-sky-50 text-sky-900 rounded-2xl p-4 border border-sky-100 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-sky-950">Strict Airline ID Verification Rule</h4>
            <p className="text-slate-600 leading-relaxed">
              Please ensure first and last names, gender, and date of birth match your government-issued ID
              (Passport, Aadhaar, Voter ID, or Driver's License) exactly. Airlines do not permit ticket name changes after issuance.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Passenger Form Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 text-[var(--premium-violet)] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Traveler {activePaxIndex + 1} of {count} ({currentPax.type})
                    {activePaxIndex === 0 ? " • Primary Contact" : ""}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter details as per government-issued photo ID
                  </p>
                </div>
              </div>
              {isPaxComplete(activePaxIndex) ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : (
                <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                  Required
                </span>
              )}
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              {/* Salutation / Title */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Title <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentPax.title}
                  onChange={(e) => handleUpdate(activePaxIndex, "title", e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[var(--premium-violet)] focus:outline-none bg-white"
                >
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Mstr">Mstr</option>
                </select>
              </div>

              {/* First Name (Strictly Required) */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cara"
                  value={currentPax.firstName}
                  onChange={(e) => handleUpdate(activePaxIndex, "firstName", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none ${
                    errors[`pax_${activePaxIndex}_firstName`] && touched[`pax_${activePaxIndex}_firstName`]
                      ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-slate-200 focus:ring-2 focus:ring-[var(--premium-violet)]"
                  }`}
                />
                {errors[`pax_${activePaxIndex}_firstName`] && touched[`pax_${activePaxIndex}_firstName`] && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors[`pax_${activePaxIndex}_firstName`]}</span>
                  </p>
                )}
              </div>

              {/* Last Name (Strictly Required) */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharma"
                  value={currentPax.lastName}
                  onChange={(e) => handleUpdate(activePaxIndex, "lastName", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none ${
                    errors[`pax_${activePaxIndex}_lastName`] && touched[`pax_${activePaxIndex}_lastName`]
                      ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-slate-200 focus:ring-2 focus:ring-[var(--premium-violet)]"
                  }`}
                />
                {errors[`pax_${activePaxIndex}_lastName`] && touched[`pax_${activePaxIndex}_lastName`] && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors[`pax_${activePaxIndex}_lastName`]}</span>
                  </p>
                )}
              </div>

              {/* Gender (Strictly Required) */}
              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={currentPax.gender}
                  onChange={(e) => handleUpdate(activePaxIndex, "gender", e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none bg-white ${
                    errors[`pax_${activePaxIndex}_gender`] && touched[`pax_${activePaxIndex}_gender`]
                      ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-slate-200 focus:ring-2 focus:ring-[var(--premium-violet)]"
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
                {errors[`pax_${activePaxIndex}_gender`] && touched[`pax_${activePaxIndex}_gender`] && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors[`pax_${activePaxIndex}_gender`]}</span>
                  </p>
                )}
              </div>

              {/* Date of Birth (DOB) (Strictly Required) */}
              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Date of Birth (DOB) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={currentPax.dob}
                    onChange={(e) => handleUpdate(activePaxIndex, "dob", e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none ${
                      errors[`pax_${activePaxIndex}_dob`] && touched[`pax_${activePaxIndex}_dob`]
                        ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-200 focus:ring-2 focus:ring-[var(--premium-violet)]"
                    }`}
                  />
                </div>
                {errors[`pax_${activePaxIndex}_dob`] && touched[`pax_${activePaxIndex}_dob`] ? (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors[`pax_${activePaxIndex}_dob`]}</span>
                  </p>
                ) : (
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Required for airline security check-in & e-ticket
                  </span>
                )}
              </div>
            </div>

            {/* Contact Details (Lead Passenger only) */}
            {activePaxIndex === 0 && (
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Primary Booking Contact Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. cara@routripo.app"
                      value={currentPax.email || ""}
                      onChange={(e) => handleUpdate(0, "email", e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none ${
                        errors["pax_0_email"] && touched["pax_0_email"]
                          ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                          : "border-slate-200 focus:ring-2 focus:ring-[var(--premium-violet)]"
                      }`}
                    />
                    {errors["pax_0_email"] && touched["pax_0_email"] && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors["pax_0_email"]}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Mobile Phone <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-slate-400">
                        {(currentPax.phone || "").length}/10 digits
                      </span>
                    </div>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-[var(--premium-violet)] focus-within:ring-2 focus-within:ring-[var(--premium-violet)]/20">
                      <span className="bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-600 flex items-center border-r border-slate-200 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="9820012345"
                        value={currentPax.phone || ""}
                        onChange={(e) => handleUpdate(0, "phone", e.target.value)}
                        className={`w-full px-3.5 py-2.5 text-sm font-medium focus:outline-none bg-white ${
                          errors["pax_0_phone"] && touched["pax_0_phone"]
                            ? "bg-rose-50/20 text-rose-900"
                            : ""
                        }`}
                      />
                    </div>
                    {errors["pax_0_phone"] && touched["pax_0_phone"] && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors["pax_0_phone"]}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {count > 1 && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={activePaxIndex === 0}
                  onClick={() => setActivePaxIndex(Math.max(0, activePaxIndex - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous Traveler
                </button>
                {activePaxIndex < count - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActivePaxIndex(activePaxIndex + 1)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--premium-violet)] hover:opacity-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Next: Traveler {activePaxIndex + 2} ({passengers[activePaxIndex + 1]?.type})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-pink-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> All {count} Travelers Reviewed
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Sticky Bottom Bar with Action Button */}
          <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-4 shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Passengers
                </span>
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {passengers.filter((_, i) => isPaxComplete(i)).length} of {count} Completed
                </div>
              </div>

              <button
                type="submit"
                disabled={passengers.filter((_, i) => isPaxComplete(i)).length !== count}
                className="px-6 sm:px-8 py-3.5 rounded-xl bg-[var(--premium-violet)] text-white font-bold text-sm shadow-xs hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Proceed to Seat Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </footer>
        </form>
      </main>
    </div>
  );
};
