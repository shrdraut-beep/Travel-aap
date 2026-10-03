import React, { useState } from "react";
import {
  ArrowRight,
  Users,
  User,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  Globe
} from "lucide-react";
import { FlightBookingHeader } from "./FlightBookingHeader";
import { MasterPassengerService, type Passenger } from "../../services/MasterPassengerService";
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

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

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

  const [passengers, setPassengers] = useState<PassengerDetail[]>(() => {
    if (initialPassengers && initialPassengers.length === count) {
      return initialPassengers;
    }
    const list: PassengerDetail[] = [];
    let paxNum = 1;

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
  const [whatsappDelivery, setWhatsappDelivery] = useState(true);
  const [savedPassengers, setSavedPassengers] = useState<Passenger[]>(() => {
    try {
      return MasterPassengerService.getPassengers();
    } catch {
      return [];
    }
  });

  const handleAutofillSavedPax = (saved: Passenger) => {
    const parts = (saved.fullName || "").trim().split(" ");
    const first = parts[0] || "";
    const last = parts.slice(1).join(" ") || "";
    const gen = saved.gender || "Male";
    const inferredTitle = gen === "Female" ? "Ms" : "Mr";

    setPassengers((prev) => {
      const copy = [...prev];
      copy[activePaxIndex] = {
        ...copy[activePaxIndex],
        firstName: first,
        lastName: last,
        gender: gen,
        title: inferredTitle as any
      };
      return copy;
    });

    setToastMessage(`Autofilled details for ${saved.fullName}!`);
  };

  const basePrice = Number(flight?.price || flight?.total_amount || 6480);
  const totalAmount = (basePrice + (selectedFare?.priceDelta || 0)) * count;

  const validateField = (paxIndex: number, field: keyof PassengerDetail, val: any): string | null => {
    const strVal = (val || "").toString().trim();

    if (field === "firstName") {
      if (!strVal) return "First name is required";
      if (strVal.length < 2) return "First name must be at least 2 characters";
      if (!/^[a-zA-Z\s'-]+$/.test(strVal)) return "Only English letters allowed";
    }
    if (field === "lastName") {
      if (!strVal) return "Last name is required";
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
        if (!/^[6-9]\d{9}$/.test(digits)) return "Please enter a valid 10-digit mobile number";
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

    const err = validateField(paxIndex, field, sanitized);
    setErrors((prev) => {
      const copy = { ...prev };
      if (err) copy[key] = err;
      else delete copy[key];
      return copy;
    });
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    let firstErrorPaxIndex: number | null = null;

    passengers.forEach((pax, i) => {
      const fieldsToCheck: (keyof PassengerDetail)[] = ["firstName", "lastName", "gender", "dob"];
      if (i === 0) fieldsToCheck.push("email", "phone");

      fieldsToCheck.forEach((field) => {
        const key = `pax_${i}_${field}`;
        newTouched[key] = true;
        const err = validateField(i, field, pax[field]);
        if (err) {
          newErrors[key] = err;
          if (firstErrorPaxIndex === null) firstErrorPaxIndex = i;
        }
      });
    });

    setErrors(newErrors);
    setTouched(newTouched);

    if (Object.keys(newErrors).length > 0) {
      if (firstErrorPaxIndex !== null) setActivePaxIndex(firstErrorPaxIndex);
      setToastMessage("Please fill in all required passenger fields before proceeding.");
      return false;
    }

    setToastMessage(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateAll();
    if (!isValid) return;
    onConfirmPassengers(passengers);
  };

  const isPaxComplete = (i: number) => {
    const pax = passengers[i];
    if (!pax) return false;
    const hasRequired = Boolean(pax.firstName?.trim().length >= 2) &&
      Boolean(pax.lastName?.trim().length >= 1) &&
      Boolean(pax.gender) &&
      Boolean(pax.dob && !validateField(i, "dob", pax.dob));

    if (i === 0) {
      return hasRequired &&
        Boolean(pax.email && !validateField(i, "email", pax.email)) &&
        Boolean(pax.phone && !validateField(i, "phone", pax.phone));
    }
    return hasRequired;
  };

  const currentPax = passengers[activePaxIndex] || passengers[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-28">
      {toastMessage && (
        <div className="fixed top-[120px] left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-rose-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-100" />
          <div className="flex-1 text-xs font-semibold leading-snug">{toastMessage}</div>
          <button type="button" onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white shrink-0 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <FlightBookingHeader 
        flight={flight} 
        stepNum={2} 
        stepTitle="Traveller Details" 
        onClose={onBack} 
        onBack={onBack} 
      />

      <main className="max-w-4xl mx-auto pt-[100px] pb-6">
        {/* Passenger Tabs */}
        {count > 1 && (
          <div className="px-4 py-2">
            <div className="flex overflow-x-auto gap-2 bg-[#eaeef4] rounded-xl p-1 no-scrollbar">
              {passengers.map((pax, i) => {
                const isActive = activePaxIndex === i;
                const complete = isPaxComplete(i);
                return (
                  <button
                    key={pax.id}
                    onClick={() => setActivePaxIndex(i)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-['Outfit'] font-bold text-[12px] transition-all whitespace-nowrap min-w-0 flex-1 ${
                      isActive ? "bg-white text-[#171c20] shadow-sm" : "bg-transparent text-[#475569] hover:bg-white/50"
                    }`}
                  >
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#006c49] shrink-0"></span>}
                    <span className="truncate">{pax.type} {i + 1} {i === 0 ? "(Lead)" : "(Mandatory)"}</span>
                    {complete && <CheckCircle2 className="w-3.5 h-3.5 text-[#006c49] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Autofill from Saved Travellers (Google Stitch feature) */}
        {savedPassengers.length > 0 && (
          <div className="px-4 pb-2">
            <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5 whitespace-nowrap shrink-0">
                  <Users className="w-3.5 h-3.5 text-sky-600" />
                  <span>Saved Travellers (1-Click Autofill)</span>
                </span>
                <span className="text-[10px] text-sky-800 font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 whitespace-nowrap shrink-0">
                  Verified KYC
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-1">
                {savedPassengers.map((saved) => (
                  <button
                    key={saved.id}
                    type="button"
                    onClick={() => handleAutofillSavedPax(saved)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/70 text-slate-800 transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                      {saved.fullName.charAt(0).toUpperCase()}
                    </span>
                    <div className="text-left min-w-0">
                      <span className="block text-xs font-bold text-slate-900 truncate">
                        {saved.fullName}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-medium truncate">
                        {saved.gender} · {saved.mealPreference || "Veg"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="px-4 pt-2 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#0ea5e9]/20 text-[#0ea5e9] flex items-center justify-center font-['Outfit'] text-[14px] font-bold">
                  {activePaxIndex + 1}
                </span>
                <div>
                  <h2 className="font-['Outfit'] text-[16px] font-bold text-[#0F172A]">{currentPax.type} {activePaxIndex + 1} Details</h2>
                  <p className="font-['Outfit'] text-[12px] text-[#94A3B8]">Must match Gov. Photo ID exactly</p>
                </div>
              </div>
              {isPaxComplete(activePaxIndex) && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-[12px] font-['Outfit'] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-['Outfit'] text-[12px] uppercase tracking-wider text-[#475569] font-semibold">Title</label>
              <div className="grid grid-cols-3 gap-2">
                {["Mr", "Ms", "Mrs"].map(t => (
                  <label key={t} className={`relative flex items-center justify-center py-2 px-3 rounded-lg font-['Outfit'] text-[14px] cursor-pointer transition-all text-center ${currentPax.title === t ? "bg-[#c9e6ff] text-[#001e2f] shadow-sm font-bold" : "bg-[#f0f4fa] text-[#475569] hover:bg-[#eaeef4]"}`}>
                    <input type="radio" name={`title_${activePaxIndex}`} className="sr-only" checked={currentPax.title === t} onChange={() => handleUpdate(activePaxIndex, "title", t)} />
                    <span>{t}.</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className={`flex flex-col gap-1 border bg-white p-2.5 rounded-xl shadow-xs focus-within:border-sky-500 ${errors[`pax_${activePaxIndex}_firstName`] && touched[`pax_${activePaxIndex}_firstName`] ? "border-rose-400" : "border-slate-300"}`}>
                <label className="font-['JetBrains_Mono',monospace] text-[12px] text-[#475569] font-medium">First & Middle Name</label>
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="First Name" value={currentPax.firstName} onChange={(e) => handleUpdate(activePaxIndex, "firstName", e.target.value)} className="w-full bg-transparent font-['Outfit'] text-[16px] text-[#0F172A] font-semibold focus:outline-none" />
                </div>
                {errors[`pax_${activePaxIndex}_firstName`] && touched[`pax_${activePaxIndex}_firstName`] && <span className="text-[10px] text-rose-500">{errors[`pax_${activePaxIndex}_firstName`]}</span>}
              </div>
              <div className={`flex flex-col gap-1 border bg-white p-2.5 rounded-xl shadow-xs focus-within:border-sky-500 ${errors[`pax_${activePaxIndex}_lastName`] && touched[`pax_${activePaxIndex}_lastName`] ? "border-rose-400" : "border-slate-300"}`}>
                <label className="font-['JetBrains_Mono',monospace] text-[12px] text-[#475569] font-medium">Last Name</label>
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Last Name" value={currentPax.lastName} onChange={(e) => handleUpdate(activePaxIndex, "lastName", e.target.value)} className="w-full bg-transparent font-['Outfit'] text-[16px] text-[#0F172A] font-semibold focus:outline-none" />
                </div>
                {errors[`pax_${activePaxIndex}_lastName`] && touched[`pax_${activePaxIndex}_lastName`] && <span className="text-[10px] text-rose-500">{errors[`pax_${activePaxIndex}_lastName`]}</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className={`flex flex-col gap-1 border bg-slate-50/80 p-2 rounded-xl ${errors[`pax_${activePaxIndex}_dob`] && touched[`pax_${activePaxIndex}_dob`] ? "border-rose-400" : "border-slate-200"}`}>
                <label className="font-['JetBrains_Mono',monospace] text-[10px] uppercase text-[#475569]">Date of Birth</label>
                <input type="date" value={currentPax.dob} max={new Date().toISOString().split("T")[0]} onChange={(e) => handleUpdate(activePaxIndex, "dob", e.target.value)} className="w-full bg-transparent font-['Outfit'] text-[14px] font-semibold text-[#0F172A] focus:outline-none" />
              </div>
              <div className={`flex flex-col gap-1 border bg-slate-50/80 p-2 rounded-xl ${errors[`pax_${activePaxIndex}_gender`] && touched[`pax_${activePaxIndex}_gender`] ? "border-rose-400" : "border-slate-200"}`}>
                <label className="font-['JetBrains_Mono',monospace] text-[10px] uppercase text-[#475569]">Gender</label>
                <select value={currentPax.gender} onChange={(e) => handleUpdate(activePaxIndex, "gender", e.target.value)} className="w-full bg-transparent font-['Outfit'] text-[14px] font-semibold text-[#0F172A] focus:outline-none appearance-none">
                  <option value="" disabled>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 border border-slate-200 bg-slate-50/80 p-2 rounded-xl">
                <label className="font-['JetBrains_Mono',monospace] text-[10px] uppercase text-[#475569]">Nationality</label>
                <div className="flex items-center gap-1 font-['Outfit'] text-[14px] font-semibold text-[#0F172A] truncate">
                  <Globe className="w-4 h-4 text-[#475569] shrink-0" />
                  <span className="truncate">Indian (IND)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details (Lead Passenger only) */}
          {activePaxIndex === 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <h2 className="font-['Outfit'] text-[16px] font-bold text-[#0F172A]">Ticket & Flight Alerts</h2>
                </div>
                <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#94A3B8]">Primary Booking Contact</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className={`bg-[#F8FAFC] border p-2.5 rounded-lg flex items-center justify-between ${errors["pax_0_phone"] && touched["pax_0_phone"] ? "border-rose-400" : "border-[#E2E8F0]"}`}>
                  <div className="flex flex-col min-w-0 w-full">
                    <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#475569]">Mobile Number</span>
                    <div className="flex items-center gap-1.5 w-full">
                      <Phone className="w-4 h-4 text-[#475569] shrink-0" />
                      <span className="font-['Outfit'] text-[14px] font-semibold text-[#0F172A]">+91</span>
                      <input type="tel" maxLength={10} placeholder="Enter 10 digit number" value={currentPax.phone || ""} onChange={(e) => handleUpdate(0, "phone", e.target.value)} className="bg-transparent font-['Outfit'] text-[14px] font-semibold text-[#0F172A] focus:outline-none w-full" />
                    </div>
                    {errors["pax_0_phone"] && touched["pax_0_phone"] && <span className="text-[10px] text-rose-500 mt-1">{errors["pax_0_phone"]}</span>}
                  </div>
                </div>

                <div className={`bg-[#F8FAFC] border p-2.5 rounded-lg flex items-center justify-between ${errors["pax_0_email"] && touched["pax_0_email"] ? "border-rose-400" : "border-[#E2E8F0]"}`}>
                  <div className="flex flex-col min-w-0 w-full">
                    <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#475569]">Official E-Ticket Destination</span>
                    <input type="email" placeholder="Enter email address" value={currentPax.email || ""} onChange={(e) => handleUpdate(0, "email", e.target.value)} className="w-full bg-transparent font-['Outfit'] text-[14px] font-semibold text-[#0F172A] focus:outline-none truncate" />
                    {errors["pax_0_email"] && touched["pax_0_email"] && <span className="text-[10px] text-rose-500 mt-1">{errors["pax_0_email"]}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#10B981]/5 rounded-lg border border-[#10B981]/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </div>
                  <div>
                    <p className="font-['Outfit'] text-[14px] font-bold text-[#0F172A]">Instant WhatsApp Boarding Pass</p>
                    <p className="font-['Outfit'] text-[12px] text-[#475569]">Receive web check-in links & gate updates</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer" checked={whatsappDelivery} onChange={(e) => setWhatsappDelivery(e.target.checked)} />
                  <div className="w-11 h-6 bg-[#dee3e9] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                </label>
              </div>
            </div>
          )}
        </form>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-[0_-6px_20px_rgba(0,0,0,0.06)] px-4 py-3 pb-safe flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-['Outfit'] text-[24px] font-extrabold text-[#0F172A]">₹{totalAmount.toLocaleString("en-IN")}</span>
              <span className="bg-[#6ffbbe]/50 text-[#005236] font-['JetBrains_Mono',monospace] text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold">Best Fare</span>
            </div>
            <span className="font-['Outfit'] text-[12px] text-[#475569]">Total ({count} Travellers) • Incl. all taxes</span>
          </div>
          <button onClick={handleSubmit} type="button" className="bg-[#0ea5e9] hover:opacity-90 text-white font-['Outfit'] text-[14px] font-bold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 shrink-0">
            <span>Continue to Seat Selection</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
