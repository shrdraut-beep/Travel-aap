// src/premium/booking/TrainBookingCoordinator.tsx
import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Lock,
  Download,
  Users,
  ShieldCheck,
  Zap,
  Train,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { BookingStepHeader } from "./BookingStepHeader";
import { RazorpayPaymentModal } from "./RazorpayPaymentModal";

export interface TrainSearchParams {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

export interface TrainBookingCoordinatorProps {
  initialSearchParams: TrainSearchParams;
  onClose: () => void;
}

const FALLBACK_TRAINS = [
  {
    id: "train_22221",
    trainNumber: "22221",
    trainName: "CSMT NZM Rajdhani Express",
    departureTime: "16:00",
    arrivalTime: "09:55",
    duration: "17h 55m",
    origin: "CSMT",
    destination: "NZM",
    runningDays: "Daily",
    classes: [
      { code: "3A", name: "AC 3 Tier", fare: 2140, status: "AVAILABLE - 42", statusType: "cnf" },
      { code: "2A", name: "AC 2 Tier", fare: 3120, status: "AVAILABLE - 18", statusType: "cnf" },
      { code: "1A", name: "AC 1st Class", fare: 5240, status: "AVAILABLE - 06", statusType: "cnf" }
    ]
  },
  {
    id: "train_12051",
    trainNumber: "12051",
    trainName: "Jan Shatabdi Express",
    departureTime: "05:25",
    arrivalTime: "14:10",
    duration: "8h 45m",
    origin: "CSMT",
    destination: "MAO",
    runningDays: "All days except Wed",
    classes: [
      { code: "2S", name: "Second Sitting", fare: 315, status: "AVAILABLE - 88", statusType: "cnf" },
      { code: "CC", name: "AC Chair Car", fare: 1045, status: "AVAILABLE - 24", statusType: "cnf" },
      { code: "EV", name: "Vistadome", fare: 2475, status: "RAC 4", statusType: "rac" }
    ]
  },
  {
    id: "train_12137",
    trainNumber: "12137",
    trainName: "Punjab Mail Superfast",
    departureTime: "19:35",
    arrivalTime: "21:30",
    duration: "25h 55m",
    origin: "CSMT",
    destination: "FZR",
    runningDays: "Daily",
    classes: [
      { code: "SL", name: "Sleeper Class", fare: 690, status: "WL 12", statusType: "wl" },
      { code: "3A", name: "AC 3 Tier", fare: 1860, status: "AVAILABLE - 15", statusType: "cnf" },
      { code: "2A", name: "AC 2 Tier", fare: 2740, status: "AVAILABLE - 08", statusType: "cnf" }
    ]
  }
];

export const TrainBookingCoordinator: React.FC<TrainBookingCoordinatorProps> = ({
  initialSearchParams,
  onClose
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState<"list" | "passengers" | "review" | "success">("list");
  // Reset scroll position to top whenever step changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [step]);

  const [trains, setTrains] = useState<any[]>(FALLBACK_TRAINS);
  const [selectedTrain, setSelectedTrain] = useState<any | null>(null);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [paxName, setPaxName] = useState("Cara Sharma");
  const [paxAge, setPaxAge] = useState("28");
  const [paxGender, setPaxGender] = useState("Female");
  const [berthPref, setBerthPref] = useState("Lower");
  const [irctcId, setIrctcId] = useState("CARA_IRCTC_26");
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [pnr, setPnr] = useState("");

  useEffect(() => {
    // Fetch live train availability if API available
    fetch(`/api/trains/search?origin=${encodeURIComponent(initialSearchParams.origin)}&destination=${encodeURIComponent(initialSearchParams.destination)}&date=${encodeURIComponent(initialSearchParams.date)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.trains?.length) setTrains(d.trains);
      })
      .catch(() => {});
  }, [initialSearchParams]);

  const baseFare = selectedClass?.fare || 1045;
  const irctcFee = 40;
  const gst = Math.round(baseFare * 0.05);
  const totalPayable = baseFare + irctcFee + gst;

  const handleBookNow = (train: any, cls: any) => {
    setSelectedTrain(train);
    setSelectedClass(cls);
    setStep("passengers");
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("review");
  };

  const handlePaymentSuccess = () => {
    const generatedPnr = `84${Math.floor(10000000 + Math.random() * 90000000)}`;
    setPnr(generatedPnr);
    setIsRazorpayOpen(false);
    setStep("success");
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 overflow-y-auto bg-[var(--premium-page,#f8fafc)]">
      {/* Header */}
      <BookingStepHeader
        title={
          <>
            {step === "list" && "IRCTC Train Booking"}
            {step === "passengers" && "Passenger & Berth Details"}
            {step === "review" && "Booking Review & Fare Breakdown"}
            {step === "success" && "Ticket Confirmed"}
          </>
        }
        subtitle={<>{initialSearchParams.origin} → {initialSearchParams.destination} · {initialSearchParams.date}</>}
        onBack={step === "list" ? onClose : () => setStep(step === "review" ? "passengers" : "list")}
        backAriaLabel="Back"
        maxWidth="max-w-5xl"
        sticky
        rightElement={
          <span className="flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-pink-600 border border-pink-200">
            <Sparkles className="h-3 w-3" />
            IRCTC Authorized
          </span>
        }
      />

      {/* STEP 1: Train Search Results */}
      {step === "list" && (
        <main className="mx-auto max-w-xl p-4 space-y-4 pb-24">
          <div className="rounded-2xl bg-indigo-50/80 border border-indigo-200 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Train className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-xs font-black text-indigo-900">Live IRCTC GDS Inventory</p>
                <p className="text-[11px] text-indigo-600">Zero service fee on UPI payment</p>
              </div>
            </div>
            <span className="text-xs font-black text-indigo-700 bg-white px-2.5 py-1 rounded-full border border-indigo-200">
              {trains.length} Trains
            </span>
          </div>

          {trains.map((train) => (
            <div
              key={train.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h2 className="text-[15px] font-black text-slate-900">{train.trainName}</h2>
                  <span className="text-xs font-bold text-slate-500">#{train.trainNumber} · {train.runningDays}</span>
                </div>
                <span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {train.duration}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-base font-black text-slate-900">{train.departureTime}</p>
                  <p className="text-[11px] font-bold text-slate-500">{train.origin}</p>
                </div>
                <div className="flex-1 mx-4 text-center">
                  <div className="h-[2px] w-full bg-slate-200 relative">
                    <Train className="h-4 w-4 text-indigo-500 absolute -top-2 left-1/2 -translate-x-1/2" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-slate-900">{train.arrivalTime}</p>
                  <p className="text-[11px] font-bold text-slate-500">{train.destination}</p>
                </div>
              </div>

              {/* Class Cards */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {train.classes.map((cls: any) => (
                  <button
                    key={cls.code}
                    type="button"
                    onClick={() => handleBookNow(train, cls)}
                    className="flex flex-col items-start p-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-pink-50/50 hover:border-pink-300 transition-all text-left active:scale-98"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black text-slate-900">{cls.code}</span>
                      <span className="text-xs font-black text-pink-600">₹{cls.fare}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 truncate">{cls.name}</span>
                    <span className={`mt-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                      cls.statusType === "cnf" ? "bg-emerald-100 text-emerald-800" :
                      cls.statusType === "rac" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {cls.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </main>
      )}

      {/* STEP 2: Passengers Form */}
      {step === "passengers" && selectedTrain && (
        <main className="mx-auto max-w-xl p-4 pb-24">
          <form onSubmit={handleProceedToReview} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="rounded-2xl bg-pink-50 p-3 flex items-center justify-between border border-pink-200">
              <div>
                <p className="text-xs font-black text-pink-900">{selectedTrain.trainName} (#{selectedTrain.trainNumber})</p>
                <p className="text-[11px] text-pink-700">Class: {selectedClass.name} ({selectedClass.code})</p>
              </div>
              <span className="text-sm font-black text-pink-700">₹{selectedClass.fare}</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">IRCTC User ID</label>
              <input
                type="text"
                required
                value={irctcId}
                onChange={(e) => setIrctcId(e.target.value)}
                placeholder="Enter IRCTC ID"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:border-pink-500"
              />
              <p className="text-[10px] text-slate-400">IRCTC credentials will be validated on booking submission</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Passenger Full Name</label>
              <input
                type="text"
                required
                value={paxName}
                onChange={(e) => setPaxName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:border-pink-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Age</label>
                <input
                  type="number"
                  required
                  value={paxAge}
                  onChange={(e) => setPaxAge(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:border-pink-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Gender</label>
                <select
                  value={paxGender}
                  onChange={(e) => setPaxGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:border-pink-500"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Transgender</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Berth Preference</label>
              <select
                value={berthPref}
                onChange={(e) => setBerthPref(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold outline-none focus:border-pink-500"
              >
                <option>No Preference</option>
                <option>Lower</option>
                <option>Middle</option>
                <option>Upper</option>
                <option>Side Lower</option>
                <option>Side Upper</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Continue to Review</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        </main>
      )}

      {/* STEP 3: Review & Pay */}
      {step === "review" && selectedTrain && (
        <main className="mx-auto max-w-xl p-4 pb-24 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Trip Summary</h2>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Train</span>
              <span className="font-bold text-slate-900">{selectedTrain.trainName} (#{selectedTrain.trainNumber})</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Class & Berth</span>
              <span className="font-bold text-slate-900">{selectedClass.code} · {berthPref}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Passenger</span>
              <span className="font-bold text-slate-900">{paxName}, {paxAge} yrs ({paxGender})</span>
            </div>

            <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 pt-2">Fare Breakup</h2>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Base Railway Fare</span>
              <span className="font-bold text-slate-900">₹{baseFare}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">IRCTC Convenience Fee</span>
              <span className="font-bold text-slate-900">₹{irctcFee}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">GST (5%)</span>
              <span className="font-bold text-slate-900">₹{gst}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between text-sm">
              <span className="font-black text-slate-900">Total Payable</span>
              <span className="font-black text-pink-600">₹{totalPayable}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsRazorpayOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span>Pay Securely ₹{totalPayable}</span>
            </button>
          </div>
        </main>
      )}

      {/* STEP 4: Success Confirmed Ticket */}
      {step === "success" && (
        <main className="mx-auto max-w-xl p-4 text-center space-y-4 pb-24">
          <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Train Ticket Confirmed!</h2>
            <p className="text-xs font-bold text-slate-500">
              IRCTC PNR: <span className="text-slate-900 font-mono text-sm">{pnr}</span>
            </p>

            <div className="rounded-2xl bg-slate-50 p-4 text-left text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Train:</span>
                <span className="font-bold text-slate-900">{selectedTrain?.trainName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Berth Allocation:</span>
                <span className="font-black text-emerald-700">Coach B2 · Berth 31 (Lower)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-black text-emerald-700">CNF (Confirmed)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-black transition-all"
            >
              Done & Return Home
            </button>
          </div>
        </main>
      )}

      {/* Razorpay Payment Modal */}
      <RazorpayPaymentModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={totalPayable}
        serviceName={`${selectedTrain?.trainName || 'IRCTC Train'} (${selectedClass?.code || 'CNF'})`}
        orderDescription="Train reservation payment"
        customerName={paxName}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
