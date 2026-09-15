import React, { useState, useEffect } from "react";
import {
  Star,
  MapPin,
  Clock,
  Wifi,
  Coffee,
  CheckCircle2,
  Lock,
  Download,
  Users,
  Armchair,
  ShieldCheck,
  ChevronRight,
  Circle,
  Zap
} from "lucide-react";
import { BookingStepHeader } from "./BookingStepHeader";
import { RazorpayPaymentModal } from "./RazorpayPaymentModal";

export interface BusSearchParams {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

export interface BusBookingCoordinatorProps {
  initialSearchParams: BusSearchParams;
  onClose: () => void;
}

const FALLBACK_BUSES = [
  {
    id: "bus_vrl_01",
    operatorName: "VRL Travels",
    busType: "Volvo 9600 Multi-Axle Luxury Sleeper (2+1)",
    departureTime: "20:30",
    arrivalTime: "07:00",
    duration: "10h 30m",
    price: 1450,
    rating: 4.8,
    seatsAvailable: 14,
    amenities: ["AC", "Blanket", "Charging Point", "Reading Light", "Water Bottle"],
    boardingPoints: [
      { id: "bp1", location: "Borivali West (Gokul Hotel)", time: "20:30" },
      { id: "bp2", location: "Andheri East (Bisleri Compound)", time: "21:15" },
      { id: "bp3", location: "Vashi (Old Toll Plaza)", time: "22:00" }
    ],
    droppingPoints: [
      { id: "dp1", location: "Mapusa Bypass Circle", time: "06:15" },
      { id: "dp2", location: "Panjim Kadamba Bus Terminus", time: "07:00" }
    ]
  },
  {
    id: "bus_intrcity_02",
    operatorName: "IntrCity SmartBus",
    busType: "BharatBenz Executive AC Sleeper",
    departureTime: "21:45",
    arrivalTime: "08:15",
    duration: "10h 30m",
    price: 1350,
    rating: 4.9,
    seatsAvailable: 9,
    amenities: ["Live Speed Tracking", "AC", "WiFi", "Emergency SOS", "Private Cabins"],
    boardingPoints: [
      { id: "bp4", location: "Sion (Chunabhatti Circle)", time: "21:45" },
      { id: "bp5", location: "Chembur (Yogi Restaurant)", time: "22:15" }
    ],
    droppingPoints: [
      { id: "dp3", location: "Panjim (Near Patto Plaza)", time: "08:15" }
    ]
  },
  {
    id: "bus_zing_03",
    operatorName: "Zingbus Plus",
    busType: "Scania Multi-Axle Semi-Sleeper AC",
    departureTime: "18:00",
    arrivalTime: "05:00",
    duration: "11h 00m",
    price: 1100,
    rating: 4.7,
    seatsAvailable: 22,
    amenities: ["Free Lounge Access", "AC", "Water Bottle", "CCTV Surveillance"],
    boardingPoints: [
      { id: "bp6", location: "Dadar East (Swami Narayan Temple)", time: "18:00" }
    ],
    droppingPoints: [
      { id: "dp4", location: "Madgaon Railway Station", time: "05:00" }
    ]
  }
];

export const BusBookingCoordinator: React.FC<BusBookingCoordinatorProps> = ({
  initialSearchParams,
  onClose
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState<"results" | "seatmap" | "checkout">("results");
  // Reset scroll position to top whenever step changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [step]);

  const [buses, setBuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<any | null>(null);

  // Seat layout state
  const [activeDeck, setActiveDeck] = useState<"lower" | "upper">("lower");
  const [selectedSeats, setSelectedSeats] = useState<string[]>(["L2A"]);
  const [selectedBoarding, setSelectedBoarding] = useState<string>("");

  // Passenger state
  const [leadPassenger, setLeadPassenger] = useState({
    name: "Vikram Malhotra",
    age: "31",
    gender: "Male",
    phone: "9876543210",
    email: "vikram.m@example.com"
  });

  // Razorpay payment state
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [busPnr, setBusPnr] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Fetch buses
  useEffect(() => {
    let isMounted = true;
    const fetchBusList = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/buses/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: initialSearchParams.origin || "Mumbai",
            destination: initialSearchParams.destination || "Goa",
            date: initialSearchParams.date,
            passengers: initialSearchParams.passengers || 1
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.results && Array.isArray(data.results) && data.results.length > 0) {
            setBuses(data.results);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Bus API fetch fallback:", e);
      }

      if (isMounted) {
        setBuses(FALLBACK_BUSES);
        setIsLoading(false);
      }
    };
    fetchBusList();
    return () => {
      isMounted = false;
    };
  }, [initialSearchParams]);

  const handleSelectBus = (bus: any) => {
    setSelectedBus(bus);
    if (bus.boardingPoints && bus.boardingPoints.length > 0) {
      setSelectedBoarding(bus.boardingPoints[0].location);
    }
    setStep("seatmap");
  };

  const toggleSeat = (seatCode: string) => {
    if (selectedSeats.includes(seatCode)) {
      if (selectedSeats.length === 1) return; // keep at least 1
      setSelectedSeats(selectedSeats.filter((s) => s !== seatCode));
    } else {
      if (selectedSeats.length >= 6) {
        alert("Maximum 6 seats per booking");
        return;
      }
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  const baseSeatPrice = selectedBus?.price || 1200;
  const seatsTotal = selectedSeats.length * baseSeatPrice;
  const gst = Math.round(seatsTotal * 0.05); // 5% GST on bus
  const grandTotal = seatsTotal + gst;

  // STEP 3: Confirmed Ticket View
  if (isConfirmed) {
    return (
      <div ref={containerRef} className="fixed inset-0 z-50 overflow-y-auto bg-[var(--premium-page)] text-[var(--premium-ink)] py-12 px-4 flex flex-col items-center justify-center animate-in fade-in">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200">
              Bus Ticket Confirmed
            </span>
            <h2 className="text-2xl font-black text-slate-900 pt-2">E-Ticket Generated!</h2>
            <p className="text-xs text-slate-500">
              PNR / Ticket No: <span className="font-bold text-slate-900">{busPnr}</span>
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Operator</span>
                <span className="font-bold text-slate-900 text-sm">{selectedBus?.operatorName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Seats</span>
                <span className="font-bold text-slate-800">{selectedSeats.join(", ")}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Route:</span>
                <span className="font-semibold text-slate-900">{initialSearchParams.origin} → {initialSearchParams.destination}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Boarding Point:</span>
                <span className="font-semibold text-slate-900">{selectedBoarding || "Main Depot"}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Passenger:</span>
                <span className="font-semibold text-slate-900">{leadPassenger.name} ({leadPassenger.gender}, {leadPassenger.age})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className="font-bold text-pink-600">PAID via Razorpay</span>
              </div>
              {paymentId && (
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Razorpay Payment ID:</span>
                  <span className="font-mono font-bold text-sky-700">{paymentId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => alert(`Downloading Bus E-Ticket for PNR: ${busPnr}...`)}
              className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download E-Ticket & Boarding Pass</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--premium-page)] text-[var(--premium-ink)] flex flex-col">
      {/* Header */}
      <BookingStepHeader
        title={
          <>
            {step === "results" && `${initialSearchParams.origin || "Mumbai"} to ${initialSearchParams.destination || "Goa"}`}
            {step === "seatmap" && `Select Seats • ${selectedBus?.operatorName}`}
            {step === "checkout" && "Checkout"}
          </>
        }
        step={
          <span className="hidden sm:inline">
            {step === "results" ? "Step 1" : step === "seatmap" ? "Step 2" : "Step 3"}
          </span>
        }
        subtitle={<>{initialSearchParams.date} • {selectedSeats.length} Seat(s) selected</>}
        onBack={() => {
          if (step === "checkout") setStep("seatmap");
          else if (step === "seatmap") setStep("results");
          else onClose();
        }}
        backAriaLabel="Back"
        maxWidth="max-w-5xl"
        sticky
        rightElement={
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1 rounded-full hover:bg-slate-100 transition-colors shrink-0"
          >
            Exit
          </button>
        }
      />

      {/* Main Content Body */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 pb-24">
        {/* STEP 1: RESULTS */}
        {step === "results" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-3">
                    <div className="h-5 w-44 bg-slate-200 rounded-md" />
                    <div className="h-4 w-72 bg-slate-100 rounded-md" />
                    <div className="h-8 w-24 bg-slate-200 rounded-md mt-4" />
                  </div>
                ))}
              </div>
            ) : (
              buses.map((bus) => (
                <div
                  key={bus.id}
                  onClick={() => handleSelectBus(bus)}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                          {bus.operatorName}
                        </h3>
                        <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> {bus.rating}★
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{bus.busType}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Starting from</span>
                      <span className="text-xl font-black text-slate-900">₹{bus.price.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Route Timing Bar */}
                  <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{bus.departureTime}</span>
                      <span className="text-[11px] text-slate-500">{bus.origin || initialSearchParams.origin}</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 font-semibold">{bus.duration}</span>
                      <div className="w-20 sm:w-32 h-0.5 bg-slate-200 my-1 relative">
                        <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-sky-500" />
                      </div>
                      <span className="text-[10px] text-pink-600 font-bold">Confirmed Route</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 block">{bus.arrivalTime}</span>
                      <span className="text-[11px] text-slate-500">{bus.destination || initialSearchParams.destination}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full">
                      {bus.seatsAvailable || 12} Seats Left
                    </span>
                    <button
                      type="button"
                      className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full group-hover:bg-sky-600 transition-colors"
                    >
                      Select Seats
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* STEP 2: BUS SEAT MAP */}
        {step === "seatmap" && selectedBus && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">{selectedBus.operatorName}</h3>
                <p className="text-xs text-slate-500">{selectedBus.busType}</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-full">
                <button
                  type="button"
                  onClick={() => setActiveDeck("lower")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                    activeDeck === "lower" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500"
                  }`}
                >
                  Lower Deck
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeck("upper")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                    activeDeck === "upper" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500"
                  }`}
                >
                  Upper Deck
                </button>
              </div>
            </div>

            {/* Seat Map Legend */}
            <div className="flex justify-center gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border-2 border-slate-300 bg-white" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-slate-200" />
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-sky-600" />
                <span>Selected</span>
              </div>
            </div>

            {/* Bus Layout Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm max-w-sm mx-auto relative">
              <div className="text-right text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-wider">
                Front / Driver
              </div>

              {/* Deck Grid */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((row) => {
                  const seatA = `${activeDeck === "lower" ? "L" : "U"}${row}A`;
                  const seatB = `${activeDeck === "lower" ? "L" : "U"}${row}B`;
                  const seatC = `${activeDeck === "lower" ? "L" : "U"}${row}C`;
                  const isBookedA = row === 1 || row === 4;

                  return (
                    <div key={row} className="flex items-center justify-between gap-4">
                      {/* Left Sleeper Berths */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isBookedA}
                          onClick={() => toggleSeat(seatA)}
                          className={`w-14 h-9 rounded-xl border text-[11px] font-black flex items-center justify-center transition-all ${
                            isBookedA
                              ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed"
                              : selectedSeats.includes(seatA)
                              ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                              : "bg-white border-slate-300 text-slate-700 hover:border-sky-400"
                          }`}
                        >
                          {seatA}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleSeat(seatB)}
                          className={`w-14 h-9 rounded-xl border text-[11px] font-black flex items-center justify-center transition-all ${
                            selectedSeats.includes(seatB)
                              ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                              : "bg-white border-slate-300 text-slate-700 hover:border-sky-400"
                          }`}
                        >
                          {seatB}
                        </button>
                      </div>

                      {/* Aisle */}
                      <div className="text-[9px] text-slate-300 font-bold uppercase">Aisle</div>

                      {/* Right Single Berth */}
                      <button
                        type="button"
                        onClick={() => toggleSeat(seatC)}
                        className={`w-14 h-9 rounded-xl border text-[11px] font-black flex items-center justify-center transition-all ${
                          selectedSeats.includes(seatC)
                            ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                            : "bg-white border-slate-300 text-slate-700 hover:border-sky-400"
                        }`}
                      >
                        {seatC}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">
                  {selectedSeats.length} Seat(s) selected: {selectedSeats.join(", ")}
                </span>
                <span className="text-xl font-black text-slate-900">₹{seatsTotal.toLocaleString("en-IN")}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="bg-gradient-to-r from-sky-500 to-pink-600 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-md shadow-sky-500/20"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHECKOUT */}
        {step === "checkout" && selectedBus && (
          <div className="space-y-6">
            {/* Bus Summary */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedBus.operatorName}</h3>
                  <p className="text-xs text-slate-500">{selectedBus.busType}</p>
                </div>
                <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                  Confirmed Seats: {selectedSeats.join(", ")}
                </span>
              </div>

              {/* Boarding Point Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Select Boarding Point
                </label>
                <select
                  value={selectedBoarding}
                  onChange={(e) => setSelectedBoarding(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none"
                >
                  {(selectedBus.boardingPoints || [
                    { id: "bp_std", location: "Borivali West Gokul Hotel - 20:30", time: "20:30" }
                  ]).map((bp: any) => (
                    <option key={bp.id} value={bp.location}>
                      {bp.location} ({bp.time})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Passenger Form */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>Passenger Details</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={leadPassenger.name}
                    onChange={(e) => setLeadPassenger({ ...leadPassenger, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={leadPassenger.age}
                      onChange={(e) => setLeadPassenger({ ...leadPassenger, age: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Gender
                    </label>
                    <select
                      value={leadPassenger.gender}
                      onChange={(e) => setLeadPassenger({ ...leadPassenger, gender: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={leadPassenger.phone}
                      onChange={(e) => setLeadPassenger({ ...leadPassenger, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={leadPassenger.email}
                      onChange={(e) => setLeadPassenger({ ...leadPassenger, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Fare Summary</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Seats Fare ({selectedSeats.length} × ₹{baseSeatPrice}):</span>
                  <span className="font-semibold text-slate-900">₹{seatsTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST & Service Fee (5%):</span>
                  <span className="font-semibold text-slate-900">₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-black text-base text-slate-900 pt-3 border-t border-slate-100">
                  <span>Total Amount Payable:</span>
                  <span className="text-xl text-sky-600">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Razorpay CTA */}
            <button
              type="button"
              onClick={() => {
                if (!leadPassenger.name.trim()) {
                  alert("Please enter lead passenger name.");
                  return;
                }
                setIsRazorpayOpen(true);
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-pink-600 py-4 px-6 text-white font-bold text-base shadow-lg shadow-sky-500/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              <span>Pay ₹{grandTotal.toLocaleString("en-IN")} with Razorpay</span>
            </button>
          </div>
        )}
      </div>

      {/* Razorpay Gateway Modal */}
      <RazorpayPaymentModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={grandTotal}
        serviceName="Bus Ticket Booking"
        orderDescription={`${selectedBus?.operatorName} (${selectedSeats.join(", ")})`}
        customerName={leadPassenger.name}
        customerEmail={leadPassenger.email}
        customerPhone={leadPassenger.phone}
        onSuccess={(details) => {
          setIsRazorpayOpen(false);
          setPaymentId(details.razorpay_payment_id);
          const pnr = `BUS${Math.floor(100000 + Math.random() * 900000)}`;
          setBusPnr(pnr);
          setIsConfirmed(true);
        }}
        onFailure={(err) => {
          setIsRazorpayOpen(false);
          alert(`Bus payment failed: ${err}`);
        }}
      />
    </div>
  );
};
