import React, { useState, useEffect } from "react";
import {
  Star,
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
  Zap,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Check,
  Plus,
  Minus,
  Sparkles
} from "lucide-react";
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
  initialStep?: "results" | "seatmap" | "points" | "passengers" | "addons" | "checkout";
  preselectedBus?: any;
}

export const BusBookingCoordinator: React.FC<BusBookingCoordinatorProps> = ({
  initialSearchParams,
  onClose,
  initialStep = "results",
  preselectedBus = null
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState<"results" | "seatmap" | "points" | "passengers" | "addons" | "checkout">(
    preselectedBus ? "seatmap" : initialStep
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [step]);

  const [buses, setBuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState<any | null>(preselectedBus);

  // Deck & Seat Selection (Step 1)
  const [selectedDeck, setSelectedDeck] = useState<"lower" | "upper">("lower");
  const [lowerSeats, setLowerSeats] = useState<any[]>([]);
  const [upperSeats, setUpperSeats] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const maxSeats = Math.max(1, initialSearchParams.passengers || 1);

  // Boarding & Dropping Points (Step 2)
  const [pointsTab, setPointsTab] = useState<"boarding" | "dropping">("boarding");
  const [boardingPoints, setBoardingPoints] = useState<any[]>([]);
  const [droppingPoints, setDroppingPoints] = useState<any[]>([]);
  const [selectedBoarding, setSelectedBoarding] = useState<any | null>(null);
  const [selectedDropping, setSelectedDropping] = useState<any | null>(null);

  // Passenger Details (Step 3)
  const [passengersList, setPassengersList] = useState<any[]>([
    { title: "Mr.", firstName: "Rohan", lastName: "Deshmukh", age: "29", gender: "Male", nationality: "IND" }
  ]);
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [contactEmail, setContactEmail] = useState("rohan.deshmukh@example.com");
  const [whatsAppUpdates, setWhatsAppUpdates] = useState(true);
  const [gstNumber, setGstNumber] = useState("");
  const [gstName, setGstName] = useState("");
  const [isGstOpen, setIsGstOpen] = useState(false);

  // Add-ons & Refreshments (Step 4)
  const [addonsList, setAddonsList] = useState<any[]>([]);
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({
    addon_water_snack: 1,
    addon_chai: 1
  });

  // Review & Payment (Step 5)
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<any | null>(null);

  // 1. Fetch Buses
  useEffect(() => {
    if (preselectedBus) return;
    const fetchBuses = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/buses/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initialSearchParams)
        });
        const data = await res.json();
        if (data.success && (data.results || data.buses)) {
          setBuses(data.results || data.buses);
        }
      } catch (err) {
        console.warn("Failed to fetch buses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuses();
  }, [initialSearchParams, preselectedBus]);

  // 2. Fetch Seat Layout when Bus is chosen
  useEffect(() => {
    if (!selectedBus) return;
    const fetchSeatLayout = async () => {
      try {
        const res = await fetch("/api/buses/seatlayout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            busId: selectedBus.id,
            origin: initialSearchParams.origin,
            destination: initialSearchParams.destination,
            date: initialSearchParams.date
          })
        });
        const data = await res.json();
        if (data.success && data.layout) {
          if (Array.isArray(data.layout.lowerDeck) && data.layout.lowerDeck.length > 0) {
            setLowerSeats(data.layout.lowerDeck);
          }
          if (Array.isArray(data.layout.upperDeck) && data.layout.upperDeck.length > 0) {
            setUpperSeats(data.layout.upperDeck);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch seat layout:", err);
      }
    };

    // Default sleeper layout fallback if API returns empty
    const generateDefaultSeats = (prefix: string, basePrice: number) => {
      const seats = [];
      for (let i = 1; i <= 15; i++) {
        const isBooked = [2, 5, 8, 11].includes(i);
        const isLadies = [3, 9].includes(i);
        seats.push({
          id: `${prefix}${i}`,
          seatNumber: `${prefix}${i}`,
          price: basePrice + (prefix === "U" ? 100 : 0),
          isAvailable: !isBooked,
          isBooked,
          isLadies,
          type: "sleeper"
        });
      }
      return seats;
    };

    setLowerSeats(generateDefaultSeats("L", selectedBus.price || 1850));
    setUpperSeats(generateDefaultSeats("U", selectedBus.price || 1850));
    fetchSeatLayout();
  }, [selectedBus]);

  // 3. Fetch Boarding/Dropping Points
  useEffect(() => {
    if (!selectedBus) return;
    const fetchPoints = async () => {
      try {
        const res = await fetch("/api/buses/points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            busId: selectedBus.id,
            origin: initialSearchParams.origin,
            destination: initialSearchParams.destination
          })
        });
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.boardingPoints)) {
            setBoardingPoints(data.boardingPoints);
            setSelectedBoarding(data.boardingPoints[0] || null);
          }
          if (Array.isArray(data.droppingPoints)) {
            setDroppingPoints(data.droppingPoints);
            setSelectedDropping(data.droppingPoints[0] || null);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch points:", err);
      }
    };
    fetchPoints();
  }, [selectedBus]);

  // 4. Fetch Add-ons
  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const res = await fetch("/api/buses/addons");
        const data = await res.json();
        if (data.success && Array.isArray(data.addons)) {
          setAddonsList(data.addons);
        }
      } catch (err) {
        console.warn("Failed to fetch bus addons:", err);
      }
    };
    fetchAddons();
  }, []);

  // Sync passengers list length with selectedSeats count
  useEffect(() => {
    const count = Math.max(1, selectedSeats.length);
    setPassengersList(prev => {
      const copy = [...prev];
      while (copy.length < count) {
        copy.push({
          title: "Mr.",
          firstName: "",
          lastName: "",
          age: "25",
          gender: "Male",
          nationality: "IND"
        });
      }
      return copy.slice(0, count);
    });
  }, [selectedSeats.length]);

  const toggleSeat = (seat: any) => {
    if (seat.isBooked) return;
    const isAlready = selectedSeats.some(s => s.id === seat.id);
    if (isAlready) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= maxSeats) {
        // Replace first
        setSelectedSeats(prev => [...prev.slice(1), seat]);
      } else {
        setSelectedSeats(prev => [...prev, seat]);
      }
    }
  };

  const seatsTotal = selectedSeats.reduce((sum, s) => sum + (s.price || selectedBus?.price || 1850), 0);
  const addonsTotal = Object.entries(addonQuantities).reduce((sum, [id, qty]) => {
    const item = addonsList.find(a => a.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const baseTotal = seatsTotal > 0 ? seatsTotal : (selectedBus?.price || 1850) * maxSeats;
  const gstTaxes = Math.round((baseTotal + addonsTotal) * 0.05);
  const grandTotal = baseTotal + addonsTotal + gstTaxes;

  const handleExecutePayment = async () => {
    try {
      const res = await fetch("/api/buses/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bus: selectedBus,
          seats: selectedSeats,
          boardingPoint: selectedBoarding,
          droppingPoint: selectedDropping,
          passengers: passengersList,
          addons: addonQuantities,
          gst: isGstOpen ? { gstNumber, gstName } : null,
          totalAmount: grandTotal
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingConfirmation(data);
        setIsPaid(true);
      }
    } catch (err) {
      console.error("Booking error:", err);
    }
  };

  // Step Header Component
  const renderStepHeader = (currentStepNum: number, stepTitle: string, progressPct: string) => {
    return (
      <header className="fixed top-0 w-full z-50 pt-safe bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] text-[#0F172A] rounded-b-[24px] border-b border-sky-200/80 shadow-[0_4px_20px_rgba(2,132,199,0.08)] backdrop-blur-xl">
        <div className="px-4 pt-2.5 pb-2 flex flex-col justify-between max-w-lg mx-auto">
          <div className="flex items-center justify-between gap-2">
            <button
              aria-label="Go back"
              onClick={() => {
                if (step === "results") onClose();
                else if (step === "seatmap") setStep("results");
                else if (step === "points") setStep("seatmap");
                else if (step === "passengers") setStep("points");
                else if (step === "addons") setStep("passengers");
                else if (step === "checkout") setStep("addons");
              }}
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-xs border border-sky-200/80 flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>

            <div className="flex-1 flex flex-col items-center justify-center min-w-0 px-1 text-center">
              <div className="flex items-center justify-center gap-1 w-full truncate">
                <span className="font-bold text-sm text-[#0F172A] truncate">
                  {initialSearchParams.origin} ⇄ {initialSearchParams.destination}
                </span>
              </div>
              <p className="text-[10px] text-[#0369a1] font-semibold truncate mt-0.5 font-['JetBrains_Mono',monospace]">
                {initialSearchParams.date} • {maxSeats} Traveller{maxSeats > 1 ? "s" : ""} • AC Sleeper
              </p>
            </div>

            <button
              aria-label="Close booking"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-xs border border-sky-200/80 flex items-center justify-center active:scale-95 shrink-0 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex flex-col gap-1 w-full mt-1.5 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between text-white font-['JetBrains_Mono',monospace] text-[10px] whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                <span className="uppercase tracking-wider font-bold">
                  STEP {currentStepNum} OF 5: {stepTitle}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-90">
                <span className="material-symbols-outlined text-[12px]">timer</span>
                <span>14:20 left</span>
              </div>
            </div>
            <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-sky-600 h-full rounded-full transition-all duration-300"
                style={{ width: progressPct }}
              ></div>
            </div>
          </div>
        </div>
      </header>
    );
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#F8FAFC] text-[#171c20] font-['Outfit',sans-serif] antialiased flex flex-col overflow-y-auto"
    >
      {/* ============================================================== */}
      {/* STEP 0: RESULTS SELECTION (If not directly on a bus)           */}
      {/* ============================================================== */}
      {step === "results" && (
        <div className="min-h-screen bg-[#f6faff] flex flex-col">
          <header className="fixed top-0 w-full z-50 pt-safe bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] backdrop-blur-xl rounded-b-[24px] shadow-[0_4px_20px_rgba(2,132,199,0.08)] border-b border-sky-200/80">
            <div className="h-20 px-4 flex items-center justify-between gap-2 max-w-4xl mx-auto">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-xs border border-sky-200/80 flex items-center justify-center text-[#0F172A] hover:bg-[#eaeef4] active:scale-95 transition-all shrink-0 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
              <div className="flex flex-col items-center justify-center text-center flex-1 min-w-0 px-2">
                <div className="flex items-center justify-center gap-1.5 truncate max-w-full">
                  <span className="font-bold text-[16px] text-[#0F172A] truncate">{initialSearchParams.origin}</span>
                  <span className="material-symbols-outlined text-[#006591] text-[16px] shrink-0 font-bold">arrow_forward</span>
                  <span className="font-bold text-[16px] text-[#006591] truncate">{initialSearchParams.destination}</span>
                </div>
                <span className="text-[11px] font-medium text-[#475569] font-['JetBrains_Mono',monospace] truncate mt-0.5">
                  {initialSearchParams.date} • {maxSeats} Travellers
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-xs border border-sky-200/80 flex items-center justify-center text-[#006591] shrink-0 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </header>

          <main className="flex-1 w-full pt-24 pb-28 px-4 max-w-4xl mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-['JetBrains_Mono',monospace] text-slate-500 font-bold">
                AVAILABLE BUSES ({buses.length})
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-3">
                <Zap className="w-8 h-8 text-[#0ea5e9] animate-bounce" />
                <p className="text-slate-500 font-semibold text-sm">Loading verified buses...</p>
              </div>
            ) : (
              buses.map((bus, idx) => (
                <div
                  key={bus.id || idx}
                  onClick={() => {
                    setSelectedBus(bus);
                    setStep("seatmap");
                  }}
                  className="w-full bg-white rounded-2xl shadow-[0_4px_18px_rgba(0,101,145,0.08)] p-4 sm:p-5 flex flex-col gap-3 transition-all hover:shadow-lg border border-slate-100 cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-base text-[#0F172A]">{bus.operatorName || bus.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#6cf8bb]/30 text-[#00714d] font-['JetBrains_Mono',monospace] text-[10px] font-bold">
                          Verified
                        </span>
                      </div>
                      <span className="text-[12px] text-[#475569]">{bus.busType || bus.type}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#006c49] text-white px-2 py-0.5 rounded-md text-xs font-bold font-['JetBrains_Mono',monospace]">
                      Rating {bus.rating || 4.8}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-[#f0f4fa] p-3 rounded-xl text-sm font-['JetBrains_Mono',monospace]">
                    <div>
                      <div className="font-bold text-slate-900">
                        {bus.departure?.time || String(bus.departureTime || "21:00").split("T")[1]?.slice(0, 5) || "21:00"}
                      </div>
                      <div className="text-[11px] text-slate-500">{initialSearchParams.origin}</div>
                    </div>
                    <div className="text-center text-xs text-slate-400">
                      <span>{bus.duration || "10h 30m"}</span>
                      <div className="w-16 h-0.5 bg-slate-300 mx-auto my-1"></div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        {bus.arrival?.time || String(bus.arrivalTime || "07:30").split("T")[1]?.slice(0, 5) || "07:30"}
                      </div>
                      <div className="text-[11px] text-slate-500">{initialSearchParams.destination}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Starting from</span>
                      <div className="text-xl font-black text-slate-900">₹{(bus.price || 1850).toLocaleString("en-IN")}</div>
                    </div>
                    <button className="px-5 py-2.5 rounded-xl bg-[#0ea5e9] text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                      <span>Select Seats</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </main>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 1: SEAT SELECTION (Lower & Upper Deck)                    */}
      {/* ============================================================== */}
      {step === "seatmap" && (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
          {renderStepHeader(1, "SELECT SEATS", "20%")}

          <main className="flex-1 flex flex-col relative w-full pt-24 px-4 bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#F8FAFC] pb-32 max-w-lg mx-auto">
            <div className="flex flex-col w-full gap-y-3">
              {/* Operator Card */}
              <div className="w-full bg-white rounded-xl shadow-xs p-3.5 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                        {selectedBus?.operatorName || selectedBus?.name || "IntrCity SmartBus"}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#6cf8bb]/30 text-[#00714d] font-['JetBrains_Mono',monospace] text-[10px] font-bold">
                        <span className="material-symbols-outlined text-[12px] mr-0.5">verified</span>Verified
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 truncate mt-0.5">
                      {selectedBus?.busType || "Volvo 9600 Multi-Axle AC Sleeper (2+1)"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-1">
                    <div className="flex items-center gap-1 bg-[#006c49] text-white px-2 py-0.5 rounded-md shadow-xs">
                      <span className="material-symbols-outlined text-[13px]">star</span>
                      <span className="font-['JetBrains_Mono',monospace] text-[12px] font-bold">
                        {selectedBus?.rating || 4.8}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap font-['JetBrains_Mono',monospace]">
                      1,240 reviews
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center justify-between bg-[#f0f4fa] p-2.5 rounded-lg text-xs font-['JetBrains_Mono',monospace]">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">21:00</span>
                    <span className="block text-[10px] text-slate-500">{initialSearchParams.origin}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400">10h 30m</span>
                    <div className="w-16 h-0.5 bg-slate-300 my-0.5"></div>
                    <span className="text-[9px] text-[#006c49] font-bold">96% On-time</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-sm">07:30</span>
                    <span className="block text-[10px] text-slate-500">{initialSearchParams.destination}</span>
                  </div>
                </div>
              </div>

              {/* Deck Switcher Tabs */}
              <div className="w-full bg-white rounded-xl shadow-xs p-3 flex flex-col gap-2">
                <div className="grid grid-cols-2 p-1 bg-[#f0f4fa] rounded-lg gap-1">
                  <button
                    onClick={() => setSelectedDeck("lower")}
                    className={`py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedDeck === "lower"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">layers</span>
                    <span>Lower Deck ({selectedSeats.filter(s => s.id.startsWith("L")).length} Selected)</span>
                  </button>
                  <button
                    onClick={() => setSelectedDeck("upper")}
                    className={`py-2 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedDeck === "upper"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">keyboard_double_arrow_up</span>
                    <span>Upper Deck ({selectedSeats.filter(s => s.id.startsWith("U")).length} Selected)</span>
                  </button>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-4 gap-1 pt-1 text-[11px] font-['JetBrains_Mono',monospace]">
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-sm bg-white border border-slate-300"></div>
                    <span className="text-slate-600">Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-sm bg-[#0ea5e9] flex items-center justify-center text-white text-[9px] font-bold">
                      
                    </div>
                    <span className="text-slate-600">Selected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-sm bg-rose-100 text-rose-600 flex items-center justify-center text-[9px] font-bold">
                      F
                    </div>
                    <span className="text-slate-600">Female</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-sm bg-slate-200"></div>
                    <span className="text-slate-400">Booked</span>
                  </div>
                </div>
              </div>

              {/* Fuselage Seat Layout Container */}
              <div className="w-full bg-white rounded-xl shadow-xs p-4 flex flex-col items-center border border-slate-100">
                <div className="w-full flex items-center justify-between pb-3 px-2 border-b border-slate-100 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">door_front</span>
                    <span>Entry Door</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#f0f4fa] px-2 py-0.5 rounded-full text-slate-700 font-bold">
                    <span>Driver Cabin</span>
                    <span className="material-symbols-outlined text-[16px]">sports_tennis</span>
                  </div>
                </div>

                {/* Berths Grid */}
                <div className="w-full py-4 flex flex-col gap-3">
                  {(selectedDeck === "lower" ? lowerSeats : upperSeats).reduce((rows: any[][], seat, idx) => {
                    const rowIdx = Math.floor(idx / 3);
                    if (!rows[rowIdx]) rows[rowIdx] = [];
                    rows[rowIdx].push(seat);
                    return rows;
                  }, []).map((rowGroup, rIdx) => (
                    <div key={rIdx} className="flex items-center justify-between gap-3">
                      {/* Left Single Sleeper Berth */}
                      {rowGroup[0] && (
                        <button
                          type="button"
                          onClick={() => toggleSeat(rowGroup[0])}
                          disabled={rowGroup[0].isBooked}
                          className={`w-28 h-14 rounded-lg flex flex-col justify-between p-1.5 transition-all text-left cursor-pointer border ${
                            selectedSeats.some(s => s.id === rowGroup[0].id)
                              ? "bg-[#0ea5e9] text-white border-[#0ea5e9] shadow-sm scale-102"
                              : rowGroup[0].isBooked
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                              : rowGroup[0].isLadies
                              ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              : "bg-[#f0f4fa] text-slate-700 border-slate-200 hover:border-sky-300"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-['JetBrains_Mono',monospace] text-[11px] font-bold">
                              {rowGroup[0].seatNumber}
                            </span>
                            {selectedSeats.some(s => s.id === rowGroup[0].id) ? (
                              <span className="text-[10px] font-bold"></span>
                            ) : rowGroup[0].isLadies ? (
                              <span className="text-[10px]">F</span>
                            ) : (
                              <span className="material-symbols-outlined text-[13px] opacity-60">airline_seat_flat</span>
                            )}
                          </div>
                          <span className="text-[10px] font-['JetBrains_Mono',monospace] font-semibold opacity-90">
                            ₹{rowGroup[0].price}
                          </span>
                        </button>
                      )}

                      {/* Aisle */}
                      <div className="flex-1 flex justify-center text-[10px] text-slate-300 uppercase tracking-widest font-mono">
                        aisle
                      </div>

                      {/* Right Double Sleeper Berths */}
                      <div className="flex items-center gap-2">
                        {rowGroup.slice(1, 3).map((seat) => (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => toggleSeat(seat)}
                            disabled={seat.isBooked}
                            className={`w-20 h-14 rounded-lg flex flex-col justify-between p-1.5 transition-all text-left cursor-pointer border ${
                              selectedSeats.some(s => s.id === seat.id)
                                ? "bg-[#0ea5e9] text-white border-[#0ea5e9] shadow-sm scale-102"
                                : seat.isBooked
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                : seat.isLadies
                                ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                : "bg-[#f0f4fa] text-slate-700 border-slate-200 hover:border-sky-300"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-['JetBrains_Mono',monospace] text-[11px] font-bold">
                                {seat.seatNumber}
                              </span>
                              {selectedSeats.some(s => s.id === seat.id) ? (
                                <span className="text-[10px] font-bold"></span>
                              ) : seat.isLadies ? (
                                <span className="text-[10px]">F</span>
                              ) : (
                                <span className="material-symbols-outlined text-[13px] opacity-60">airline_seat_flat</span>
                              )}
                            </div>
                            <span className="text-[10px] font-['JetBrains_Mono',monospace] font-semibold opacity-90">
                              ₹{seat.price}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Footer CTA */}
          <footer className="fixed bottom-0 w-full z-50 pb-safe bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-slate-100">
            <div className="h-20 px-4 flex items-center justify-between gap-3 max-w-lg mx-auto">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-['JetBrains_Mono',monospace]">
                  TOTAL AMOUNT
                </span>
                <span className="text-xl font-black text-slate-900">
                  ₹{(baseTotal).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  {selectedSeats.length > 0
                    ? `Berths: ${selectedSeats.map(s => s.seatNumber).join(", ")}`
                    : `Please select ${maxSeats} berth(s)`}
                </span>
              </div>

              <button
                disabled={selectedSeats.length === 0}
                onClick={() => setStep("points")}
                className={`flex-1 max-w-[240px] h-12 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer ${
                  selectedSeats.length === 0 ? "bg-slate-300 cursor-not-allowed" : "bg-[#0ea5e9] hover:bg-[#0284c7]"
                }`}
                type="button"
              >
                <span>Continue to Pickup Points</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: PICKUP & DROPOFF POINTS                                */}
      {/* ============================================================== */}
      {step === "points" && (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
          {renderStepHeader(2, "PICKUP & DROPOFF POINTS", "40%")}

          <main className="flex-1 flex flex-col relative w-full pt-24 px-4 bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#F8FAFC] pb-32 max-w-lg mx-auto">
            <div className="flex flex-col w-full gap-y-3">
              {/* Context Overview Card */}
              <div className="w-full bg-white rounded-xl p-3.5 shadow-xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-sky-50 text-[#0ea5e9] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">directions_bus</span>
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {selectedBus?.operatorName || "IntrCity SmartBus"}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        Berths: {selectedSeats.map(s => s.seatNumber).join(", ")}
                      </span>
                    </div>
                  </div>
                  <span className="bg-[#6cf8bb]/30 text-[#00714d] px-2 py-0.5 rounded-full text-[10px] font-bold font-['JetBrains_Mono',monospace]">
                    Confirmed
                  </span>
                </div>
              </div>

              {/* Segment Tab Navigation */}
              <div className="w-full bg-[#f0f4fa] p-1 rounded-xl flex items-center gap-1 shadow-xs">
                <button
                  onClick={() => setPointsTab("boarding")}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    pointsTab === "boarding"
                      ? "bg-white text-[#006591] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  type="button"
                >
                  <span className="w-4 h-4 rounded-full bg-[#006591] text-white text-[10px] flex items-center justify-center">
                    1
                  </span>
                  <span className="truncate">Boarding ({initialSearchParams.origin})</span>
                </button>
                <button
                  onClick={() => setPointsTab("dropping")}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    pointsTab === "dropping"
                      ? "bg-white text-[#006591] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  type="button"
                >
                  <span className="w-4 h-4 rounded-full bg-[#dee3e9] text-slate-700 text-[10px] flex items-center justify-center">
                    2
                  </span>
                  <span className="truncate">Dropping ({initialSearchParams.destination})</span>
                </button>
              </div>

              {/* Points List */}
              <div className="flex flex-col gap-2.5">
                {(pointsTab === "boarding" ? boardingPoints : droppingPoints).map((pt) => {
                  const isSelected =
                    pointsTab === "boarding"
                      ? selectedBoarding?.id === pt.id
                      : selectedDropping?.id === pt.id;

                  return (
                    <label
                      key={pt.id}
                      onClick={() => {
                        if (pointsTab === "boarding") setSelectedBoarding(pt);
                        else setSelectedDropping(pt);
                      }}
                      className={`w-full p-3.5 rounded-xl shadow-xs flex flex-col gap-1 cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-white border-[#0ea5e9] ring-2 ring-sky-200"
                          : "bg-white border-slate-200 hover:border-sky-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-1 w-4 h-4 text-[#0ea5e9] accent-[#0ea5e9]"
                          />
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-slate-900 truncate">{pt.name}</span>
                              {pt.isOriginStop && (
                                <span className="bg-[#f0f4fa] text-slate-600 text-[10px] px-1.5 py-0.2 rounded font-mono">
                                  Origin Stop
                                </span>
                              )}
                              {pt.isFinalStop && (
                                <span className="bg-[#f0f4fa] text-slate-600 text-[10px] px-1.5 py-0.2 rounded font-mono">
                                  Final Stop
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{pt.location}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 text-right">
                          <span className="font-['JetBrains_Mono',monospace] text-sm font-bold text-[#006591]">
                            {pt.time}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">IST</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-1 truncate">
                          <span className="material-symbols-outlined text-[#de8712] text-[15px]">signpost</span>
                          <span className="truncate">{pt.landmark}</span>
                        </div>
                        <span className="text-[#0ea5e9] font-bold text-[11px] shrink-0 ml-1">View Map</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </main>

          <footer className="fixed bottom-0 w-full z-50 pb-safe bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-slate-100">
            <div className="h-20 px-4 flex items-center justify-between gap-3 max-w-lg mx-auto">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-['JetBrains_Mono',monospace]">
                  SELECTED STOPS
                </span>
                <span className="text-xs font-bold text-slate-900 truncate">
                  {selectedBoarding?.name?.split("(")[1]?.replace(")", "") || "Boarding"} →{" "}
                  {selectedDropping?.name?.split("(")[1]?.replace(")", "") || "Dropping"}
                </span>
              </div>

              <button
                onClick={() => setStep("passengers")}
                className="flex-1 max-w-[240px] h-12 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span>Continue to Passenger Info</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: PASSENGER DETAILS                                      */}
      {/* ============================================================== */}
      {step === "passengers" && (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
          {renderStepHeader(3, "PASSENGER DETAILS", "60%")}

          <main className="flex-1 flex flex-col relative w-full pt-24 px-4 bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#F8FAFC] pb-32 max-w-lg mx-auto">
            <div className="flex flex-col w-full gap-y-3">
              {/* Berth Allocation Card */}
              <div className="bg-white rounded-xl p-3.5 shadow-xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-[20px]">airline_seat_flat</span>
                    <span className="font-bold text-sm text-slate-900">Reserved Berths ({selectedSeats.length})</span>
                  </div>
                  <span className="bg-[#6cf8bb]/30 text-[#00714d] px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                    LOWER / UPPER
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  {selectedSeats.map((seat, sIdx) => (
                    <div key={seat.id} className="p-2.5 rounded-xl bg-[#f0f4fa] border border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-[#0ea5e9] text-white flex items-center justify-center font-bold text-xs font-mono shrink-0">
                          {seat.seatNumber}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-900 truncate">
                            {passengersList[sIdx]?.firstName || `Passenger ${sIdx + 1}`}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">Berth {seat.seatNumber}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#006591] font-mono shrink-0">
                        ₹{seat.price || 1850}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per Passenger Forms */}
              {passengersList.map((pax, pIdx) => (
                <div key={pIdx} className="bg-white rounded-xl p-3.5 shadow-xs flex flex-col gap-2.5 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#006591] text-white flex items-center justify-center text-[10px] font-bold font-mono">
                        {pIdx + 1}
                      </div>
                      <span className="font-bold text-sm text-slate-900">
                        {pIdx === 0 ? "Passenger 1 (Lead)" : `Passenger ${pIdx + 1}`}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#0ea5e9] bg-sky-50 px-2 py-0.5 rounded">
                      Berth {selectedSeats[pIdx]?.seatNumber || `S${pIdx + 1}`}
                    </span>
                  </div>

                  {/* Title Selector */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["Mr.", "Ms.", "Mrs."].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            const copy = [...passengersList];
                            copy[pIdx].title = t;
                            setPassengersList(copy);
                          }}
                          className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            pax.title === t
                              ? "bg-[#0ea5e9] text-white shadow-xs"
                              : "bg-[#eaeef4] text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500">First & Middle Name</label>
                      <input
                        type="text"
                        value={pax.firstName}
                        onChange={(e) => {
                          const copy = [...passengersList];
                          copy[pIdx].firstName = e.target.value;
                          setPassengersList(copy);
                        }}
                        placeholder="First Name"
                        className="h-10 px-3 rounded-lg bg-[#f8fafc] text-xs font-medium text-slate-900 border border-slate-200 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500">Last Name</label>
                      <input
                        type="text"
                        value={pax.lastName}
                        onChange={(e) => {
                          const copy = [...passengersList];
                          copy[pIdx].lastName = e.target.value;
                          setPassengersList(copy);
                        }}
                        placeholder="Last Name"
                        className="h-10 px-3 rounded-lg bg-[#f8fafc] text-xs font-medium text-slate-900 border border-slate-200 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  {/* Age, Gender & Nationality */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500">Age</label>
                      <input
                        type="number"
                        value={pax.age}
                        onChange={(e) => {
                          const copy = [...passengersList];
                          copy[pIdx].age = e.target.value;
                          setPassengersList(copy);
                        }}
                        className="h-10 px-2 rounded-lg bg-[#f8fafc] text-xs text-center font-bold text-slate-900 border border-slate-200 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500">Gender</label>
                      <div className="grid grid-cols-2 gap-1 h-10">
                        {["Male", "Female"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              const copy = [...passengersList];
                              copy[pIdx].gender = g;
                              setPassengersList(copy);
                            }}
                            className={`rounded-lg text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                              pax.gender === g
                                ? "bg-[#0ea5e9] text-white shadow-xs"
                                : "bg-[#eaeef4] text-slate-600"
                            }`}
                          >
                            {g === "Male" ? "M" : "F"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500">Nationality</label>
                      <div className="h-10 px-2 rounded-lg bg-[#f8fafc] text-xs font-bold text-slate-800 border border-slate-200 flex items-center justify-center gap-1 font-mono">
                        <span className="material-symbols-outlined text-[15px] text-[#0ea5e9]">public</span>
                        <span>IND</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Contact Information & WhatsApp toggle */}
              <div className="bg-white rounded-xl p-3.5 shadow-xs flex flex-col gap-2.5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-[18px]">contact_mail</span>
                    <span className="font-bold text-sm text-slate-900">Ticket & Trip Updates</span>
                  </div>
                  <span className="text-[10px] text-[#006c49] font-bold font-mono">Verified</span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#f0f4fa] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500 text-[16px]">phone_iphone</span>
                      <span className="font-medium text-slate-900">{contactPhone}</span>
                    </div>
                    <span className="bg-[#6cf8bb]/30 text-[#00714d] text-[10px] px-2 py-0.5 rounded font-bold font-mono">
                      SMS Ready
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#f0f4fa] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500 text-[16px]">mail</span>
                      <span className="font-medium text-slate-900">{contactEmail}</span>
                    </div>
                    <span className="text-[#0ea5e9] font-bold text-[11px]">Verified</span>
                  </div>
                </div>

                {/* WhatsApp Boarding Pass Toggle */}
                <div className="p-2.5 rounded-lg bg-[#f0f4fa] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-full bg-[#6cf8bb]/30 text-[#00714d] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 leading-tight">WhatsApp Boarding Pass</span>
                      <span className="text-[10px] text-slate-500 leading-tight">
                        Live driver GPS & QR ticket delivery
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={whatsAppUpdates}
                      onChange={(e) => setWhatsAppUpdates(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#006c49]"></div>
                  </label>
                </div>
              </div>

              {/* GST Accordion */}
              <div className="bg-white rounded-xl p-3.5 shadow-xs flex flex-col gap-2 border border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGstOpen(!isGstOpen)}
                  className="flex items-center justify-between w-full cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-slate-500 text-[18px]">receipt_long</span>
                    <span className="font-bold text-xs sm:text-sm text-slate-900">Add GST Details (Optional)</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">
                    {isGstOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {isGstOpen && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500">GST Identification Number</label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        placeholder="27AAAAA0000A1Z5"
                        className="h-10 px-3 rounded-lg bg-[#f8fafc] text-xs font-mono uppercase text-slate-900 border border-slate-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500">Registered Company Name</label>
                      <input
                        type="text"
                        value={gstName}
                        onChange={(e) => setGstName(e.target.value)}
                        placeholder="Acme Technologies Pvt Ltd"
                        className="h-10 px-3 rounded-lg bg-[#f8fafc] text-xs text-slate-900 border border-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          <footer className="fixed bottom-0 w-full z-50 pb-safe bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-slate-100">
            <div className="h-20 px-4 flex items-center justify-between gap-3 max-w-lg mx-auto">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-['JetBrains_Mono',monospace]">
                  TOTAL AMOUNT
                </span>
                <span className="text-xl font-black text-slate-900">
                  ₹{(baseTotal).toLocaleString("en-IN")}
                </span>
              </div>

              <button
                onClick={() => setStep("addons")}
                className="flex-1 max-w-[240px] h-12 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span>Continue to Add-ons</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: ADD-ONS & REFRESHMENTS                                 */}
      {/* ============================================================== */}
      {step === "addons" && (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
          {renderStepHeader(4, "ADD-ONS & REFRESHMENTS", "80%")}

          <main className="flex-1 flex flex-col relative w-full pt-24 px-4 bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#F8FAFC] pb-32 max-w-lg mx-auto">
            <div className="flex flex-col w-full gap-y-3">
              {/* Context Summary */}
              <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0ea5e9] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {selectedBus?.operatorName || "IntrCity SmartBus"} • {initialSearchParams.date}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate">
                      Berths: {selectedSeats.map(s => s.seatNumber).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 font-mono">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  <span>Verified</span>
                </div>
              </div>

              {/* Title Section */}
              <div className="flex flex-col">
                <h2 className="text-sm font-bold text-slate-800">On-Board Refreshments & Travel Kit</h2>
                <p className="text-xs text-slate-500">Handed over by bus captain at boarding</p>
              </div>

              {/* Add-ons List */}
              <div className="flex flex-col gap-2.5">
                {addonsList.map((addon) => {
                  const qty = addonQuantities[addon.id] || 0;

                  return (
                    <div
                      key={addon.id}
                      className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                    >
                      <img
                        alt={addon.name}
                        src={addon.image}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div className="flex items-center gap-1.5">
                          {addon.veg && (
                            <span className="w-3 h-3 rounded-xs border border-emerald-600 flex items-center justify-center shrink-0 p-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-900 truncate">{addon.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{addon.subtitle}</p>
                        <div className="text-xs font-bold text-[#0ea5e9] mt-1 font-mono">
                          ₹{addon.price} <span className="text-[10px] text-slate-400 font-normal">per item</span>
                        </div>
                      </div>

                      {/* Quantity Counter */}
                      <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-800 shrink-0 font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            setAddonQuantities(prev => ({
                              ...prev,
                              [addon.id]: Math.max(0, (prev[addon.id] || 0) - 1)
                            }));
                          }}
                          className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 active:scale-90 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-3 text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAddonQuantities(prev => ({
                              ...prev,
                              [addon.id]: (prev[addon.id] || 0) + 1
                            }));
                          }}
                          className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 active:scale-90 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>

          <footer className="fixed bottom-0 w-full z-50 pb-safe bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-slate-100">
            <div className="h-20 px-4 flex items-center justify-between gap-3 max-w-lg mx-auto">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-['JetBrains_Mono',monospace]">
                  TOTAL PAYABLE
                </span>
                <span className="text-xl font-black text-slate-900">
                  ₹{(baseTotal + addonsTotal).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  Add-ons: ₹{addonsTotal}
                </span>
              </div>

              <button
                onClick={() => setStep("checkout")}
                className="flex-1 max-w-[240px] h-12 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span>Continue to Review</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 5: REVIEW & PAYMENT                                       */}
      {/* ============================================================== */}
      {step === "checkout" && (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
          {renderStepHeader(5, "REVIEW & PAYMENT", "100%")}

          <main className="flex-1 flex flex-col relative w-full pt-24 px-4 bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#F8FAFC] pb-32 max-w-lg mx-auto">
            <div className="flex flex-col w-full gap-y-3">
              {/* Journey Summary Card */}
              <div className="bg-white rounded-xl shadow-xs p-4 flex flex-col gap-2.5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-[#006591] font-bold text-[11px]">
                    <span className="material-symbols-outlined text-[14px]">directions_bus</span>
                    {selectedBus?.operatorName || "IntrCity SmartBus"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006c49] font-bold text-[11px]">
                    <span className="material-symbols-outlined text-[13px]">bolt</span>
                    Express Non-stop
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {selectedBus?.busType || "Volvo 9600 AC Sleeper"}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {initialSearchParams.date} • 10h 30m Journey • Lower/Upper Berths
                  </p>
                </div>

                <div className="bg-[#f0f4fa] rounded-lg p-2.5 flex items-center justify-between text-xs font-['JetBrains_Mono',monospace]">
                  <div>
                    <span className="font-bold text-[#006591] text-sm">{selectedBoarding?.time || "21:00"}</span>
                    <span className="block font-bold text-slate-900">{initialSearchParams.origin}</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[100px] block">
                      {selectedBoarding?.name?.split("(")[1]?.replace(")", "") || "Main Stand"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400">Direct Route</span>
                    <div className="w-16 h-0.5 bg-slate-300 my-0.5"></div>
                    <span className="text-[10px] text-[#006c49] font-bold">Confirmed</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#006c49] text-sm">{selectedDropping?.time || "07:30"}</span>
                    <span className="block font-bold text-slate-900">{initialSearchParams.destination}</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[100px] block">
                      {selectedDropping?.name?.split("(")[1]?.replace(")", "") || "Circle"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-[16px]">airline_seat_flat</span>
                    <span className="text-slate-500">Reserved Berths:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {selectedSeats.map(s => s.seatNumber).join(", ")}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Single Window Deck</span>
                </div>
              </div>

              {/* Weather Forecast Banner */}
              <div className="relative w-full rounded-xl overflow-hidden shadow-xs">
                <div
                  className="bg-cover bg-center w-full h-24 flex flex-col justify-end p-3 relative"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBKuNsOEsxbcFRqeoIZwkV3A-3dZ63ZDXdQ2sejolp0oe5musm_rffG88ekeZTCfG39WWco_SPKPhnjoZ57MEEKTXoWVwJ8ddCEExjJWw5VORCWEH64iyqbXfqig87zTtmcOsxP0ilbmVKzBv3Ut_USUY3RW_vkI3qwfE2fbL-qLkDB2zw90aSHiQSSMQJwGV5j12L_LBNJhTxGvIIM19prQtEodV5WQr7yk_CmlZh5zK4TJ_DVL1Je")'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  <div className="relative z-10 flex items-center justify-between text-white">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-amber-400">wb_sunny</span>
                        Goa Forecast
                      </span>
                      <span className="text-[11px] text-white/90">29°C & Pleasant Coastal Breeze</span>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Ideal for Travel
                    </span>
                  </div>
                </div>
              </div>

              {/* Travellers & Inclusions */}
              <div className="bg-white rounded-xl shadow-xs p-3.5 flex flex-col gap-2.5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-[18px]">group</span>
                    <span className="font-bold text-xs sm:text-sm text-slate-900">Travellers & Inclusions</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                    {selectedSeats.length} Berths
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {passengersList.map((pax, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#f0f4fa] flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {pax.title} {pax.firstName} {pax.lastName}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-[#004c6e] font-mono font-bold text-[10px]">
                          Berth {selectedSeats[idx]?.seatNumber || `L${idx + 3}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="material-symbols-outlined text-[#006c49] text-[13px]">restaurant</span>
                        <span>Refreshment Kit</span>
                        <span>•</span>
                        <span>Sanitised Linen Kit</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-xl shadow-xs p-3.5 flex flex-col gap-2 border border-slate-100">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">Fare Breakdown</span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Guaranteed Final
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Base Seat Berths ({selectedSeats.length})</span>
                    <span className="font-mono font-bold text-slate-900">₹{baseTotal.toLocaleString("en-IN")}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Refreshments & Travel Kits</span>
                      <span className="font-mono font-bold text-slate-900">₹{addonsTotal.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>GST & Bus Operator Taxes</span>
                    <span className="font-mono font-bold text-slate-900">₹{gstTaxes.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Grand Total</span>
                    <span className="text-[10px] text-emerald-700">All taxes included</span>
                  </div>
                  <span className="text-xl font-black text-slate-900 font-['JetBrains_Mono',monospace]">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Success Screen Card if Paid */}
              {isPaid && bookingConfirmation && (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-md flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                      
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-emerald-900">Ticket Reserved Successfully!</h4>
                      <p className="text-[11px] text-emerald-700 font-mono">
                        PNR: {bookingConfirmation.bookingPnr || bookingConfirmation.pnr} • E-Ticket Delivered
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Your Volvo sleeper ticket and WhatsApp live tracking link have been dispatched to {contactPhone} and{" "}
                    {contactEmail}. Show the digital QR pass to the bus captain at boarding.
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`Downloading E-Ticket PDF for PNR: ${bookingConfirmation.bookingPnr}`)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF Ticket
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-white text-slate-800 border border-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>

          {!isPaid && (
            <footer className="fixed bottom-0 w-full z-50 pb-safe bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-slate-100">
              <div className="h-20 px-4 flex items-center justify-between gap-3 max-w-lg mx-auto">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-['JetBrains_Mono',monospace]">
                    TOTAL PAYABLE
                  </span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate">Includes all taxes</span>
                </div>

                <button
                  onClick={() => setIsRazorpayOpen(true)}
                  className="flex-1 max-w-[240px] h-12 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  type="button"
                >
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Pay</span>
                </button>
              </div>
            </footer>
          )}

          {/* Razorpay Payment Modal */}
          {isRazorpayOpen && (
            <RazorpayPaymentModal
              isOpen={isRazorpayOpen}
              amount={grandTotal}
              title={`Bus Ticket • ${initialSearchParams.origin} to ${initialSearchParams.destination}`}
              description={`Berths: ${selectedSeats.map(s => s.seatNumber).join(", ")} (${passengersList[0]?.firstName || "Passenger"})`}
              onSuccess={() => {
                setIsRazorpayOpen(false);
                handleExecutePayment();
              }}
              onClose={() => setIsRazorpayOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};
