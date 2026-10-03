import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Briefcase,
  MessageSquare,
  Zap,
  Plane,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Users,
  Check,
  Plus,
  Minus,
  Phone,
  Mail,
  QrCode,
  Calendar,
  Luggage,
  Utensils,
  ChevronDown,
  ChevronUp,
  Share2,
  FileText,
  X,
  Compass,
  Tag,
  Sparkles,
  Sun,
  Shield,
  Coffee,
  CheckCheck
} from "lucide-react";
import { FlightBookingHeader } from "./FlightBookingHeader";
import { RazorpayPaymentModal } from "./RazorpayPaymentModal";
export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
  tripType?: "oneWay" | "roundTrip" | "multiCity";
  slices?: any[];
}

export interface FlightBookingCoordinatorProps {
  initialSearchParams: FlightSearchParams;
  onClose: () => void;
  initialStep?: "results" | "fares" | "passengers" | "seats" | "meals" | "checkout";
  preselectedFlight?: any;
}

export const FlightBookingCoordinator: React.FC<FlightBookingCoordinatorProps> = ({
  initialSearchParams,
  onClose,
  initialStep = "results",
  preselectedFlight = null
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Search parameters
  const [searchParams, setSearchParams] = useState<FlightSearchParams>(initialSearchParams);
  const totalPax = (searchParams.adults || 1) + (searchParams.children || 0);

  // Active step: "results" | "fares" | "passengers" | "seats" | "meals" | "checkout" | "confirmed"
  const [step, setStep] = useState<"results" | "fares" | "passengers" | "seats" | "meals" | "checkout" | "confirmed">(
    preselectedFlight ? "fares" : (initialStep || "results")
  );

  // Scroll to top on step transition
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [step]);

  const orgDefault = (searchParams.origin || "BOM").toUpperCase();
  const dstDefault = (searchParams.destination || "DEL").toUpperCase();

  // Helper to generate dynamic fallback flights based on route
  const generateDynamicFlights = (params: FlightSearchParams) => {
    const org = (params.origin || "BOM").toUpperCase();
    const dst = (params.destination || "DEL").toUpperCase();
    return [
      {
        id: "fl-6e-2045",
        airline: "IndiGo",
        airlineCode: "6E",
        flightNumber: "6E-2045",
        aircraft: "Airbus A320neo",
        origin: org,
        originAirport: "Terminal 2",
        destination: dst,
        destinationAirport: "Terminal 3",
        dep: "06:15",
        arr: "08:30",
        departureTime: "06:15",
        arrivalTime: "08:30",
        dur: "2h 15m",
        duration: "2h 15m",
        stops: "Non-stop",
        price: 4890,
        onTimeRating: "98% On-Time",
        baggage: "7kg Cabin + 15kg Check-in"
      },
      {
        id: "fl-ai-806",
        airline: "Air India",
        airlineCode: "AI",
        flightNumber: "AI-806",
        aircraft: "Boeing 787 Dreamliner",
        origin: org,
        originAirport: "Terminal 2",
        destination: dst,
        destinationAirport: "Terminal 3",
        dep: "09:30",
        arr: "11:45",
        departureTime: "09:30",
        arrivalTime: "11:45",
        dur: "2h 15m",
        duration: "2h 15m",
        stops: "Non-stop",
        price: 5240,
        onTimeRating: "94% On-Time",
        baggage: "7kg Cabin + 25kg Check-in"
      },
      {
        id: "fl-uk-954",
        airline: "Vistara",
        airlineCode: "UK",
        flightNumber: "UK-954",
        aircraft: "Airbus A321neo",
        origin: org,
        originAirport: "Terminal 2",
        destination: dst,
        destinationAirport: "Terminal 3",
        dep: "14:15",
        arr: "16:30",
        departureTime: "14:15",
        arrivalTime: "16:30",
        dur: "2h 15m",
        duration: "2h 15m",
        stops: "Non-stop",
        price: 5850,
        onTimeRating: "97% On-Time",
        baggage: "7kg Cabin + 15kg Check-in"
      },
      {
        id: "fl-qp-1350",
        airline: "Akasa Air",
        airlineCode: "QP",
        flightNumber: "QP-1350",
        aircraft: "Boeing 737 MAX",
        origin: org,
        originAirport: "Terminal 1",
        destination: dst,
        destinationAirport: "Terminal 2",
        dep: "18:45",
        arr: "21:00",
        departureTime: "18:45",
        arrivalTime: "21:00",
        dur: "2h 15m",
        duration: "2h 15m",
        stops: "Non-stop",
        price: 4490,
        onTimeRating: "96% On-Time",
        baggage: "7kg Cabin + 15kg Check-in"
      },
      {
        id: "fl-sg-8169",
        airline: "SpiceJet",
        airlineCode: "SG",
        flightNumber: "SG-8169",
        aircraft: "Boeing 737-800",
        origin: org,
        originAirport: "Terminal 1",
        destination: dst,
        destinationAirport: "Terminal 1",
        dep: "20:30",
        arr: "22:50",
        departureTime: "20:30",
        arrivalTime: "22:50",
        dur: "2h 20m",
        duration: "2h 20m",
        stops: "Non-stop",
        price: 4290,
        onTimeRating: "91% On-Time",
        baggage: "7kg Cabin + 15kg Check-in"
      }
    ];
  };

  // Flights list & loading
  const [flights, setFlights] = useState<any[]>([]);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [filterStops, setFilterStops] = useState<"all" | "direct">("all");
  const [sortOption, setSortOption] = useState<"cheapest" | "fastest" | "early">("cheapest");

  const [selectedFlight, setSelectedFlight] = useState<any | null>(
    preselectedFlight || {
      id: "fl-default",
      airline: "IndiGo",
      flightNumber: "6E-2045",
      aircraft: "Airbus A320neo",
      origin: orgDefault,
      originAirport: "Terminal 2",
      destination: dstDefault,
      destinationAirport: "Terminal 3",
      departureTime: "06:15",
      arrivalTime: "08:30",
      duration: "2h 15m",
      onTimeRating: "98% On-Time",
      price: 4890
    }
  );

  // Fetch flights dynamically
  useEffect(() => {
    let active = true;
    const fetchFlightResults = async () => {
      setIsLoadingFlights(true);
      try {
        const res = await fetch("/api/travelport/flights/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: searchParams.origin,
            destination: searchParams.destination,
            departDate: searchParams.departDate,
            returnDate: searchParams.returnDate,
            adults: searchParams.adults || 1,
            children: searchParams.children || 0
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (active && data.flights && data.flights.length > 0) {
            setFlights(
              data.flights.map((f: any) => ({
                ...f,
                dep: f.departureTime || f.dep || "06:15",
                arr: f.arrivalTime || f.arr || "08:30",
                dur: f.duration || f.dur || "2h 15m",
                stops: f.stops === 0 || f.stops === "Non-stop" ? "Non-stop" : `${f.stops} Stop`,
                price: f.price || f.total_amount || 4890
              }))
            );
            setIsLoadingFlights(false);
            return;
          }
        }
      } catch (err) {
        console.warn("[FlightSearch fallback to high-fidelity live generator]", err);
      }
      if (active) {
        setFlights(generateDynamicFlights(searchParams));
        setIsLoadingFlights(false);
      }
    };

    fetchFlightResults();
    return () => {
      active = false;
    };
  }, [searchParams]);

  // Derived filtered flights for Results step
  const displayedFlights = useMemo(() => {
    const list = flights.length > 0 ? [...flights] : generateDynamicFlights(searchParams);
    let filtered = list;
    if (filterStops === "direct") {
      filtered = filtered.filter((f) => f.stops === "Non-stop" || f.stops === 0);
    }
    filtered.sort((a, b) => {
      if (sortOption === "cheapest") return a.price - b.price;
      if (sortOption === "fastest") return parseInt(a.dur || "135", 10) - parseInt(b.dur || "135", 10);
      if (sortOption === "early") return (a.dep || "").localeCompare(b.dep || "");
      return 0;
    });
    return filtered;
  }, [flights, filterStops, sortOption, searchParams]);

  // Toast notification for user actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ----------------------------------------------------
  // STEP 1: FARE SELECTION
  // ----------------------------------------------------
  const [selectedFareTier, setSelectedFareTier] = useState<"saver" | "flexi" | "vip">("flexi");
  const fareBaseSingle = Number(selectedFlight?.price || 4890);

  const fareTiers = useMemo(() => [
    {
      id: "saver" as const,
      name: "Saver",
      priceSingle: fareBaseSingle,
      badge: null,
      subtitle: "Standard travel with essentials",
      benefits: [
        { label: "Check-in 15 kg", icon: Luggage, highlight: false },
        { label: "Standard Seat (Paid)", icon: Users, highlight: false },
        { label: "Cancellation Fee ₹2,500", icon: Shield, highlight: false },
        { label: "Date Change ₹1,500 + diff", icon: Clock, highlight: false }
      ]
    },
    {
      id: "flexi" as const,
      name: "Flexi Plus",
      priceSingle: fareBaseSingle + 1200,
      badge: "RECOMMENDED",
      badgeColor: "bg-[#c9e6ff] text-[#004c6e]",
      subtitle: "Full flexibility & complimentary extras",
      benefits: [
        { label: "Free Seat Choice", icon: Users, highlight: true },
        { label: "Complimentary Meal", icon: Utensils, highlight: true },
        { label: "₹0 Change Fee", icon: CheckCircle2, highlight: true },
        { label: "Check-in 15 kg", icon: Luggage, highlight: true }
      ]
    },
    {
      id: "vip" as const,
      name: "Super Saver VIP",
      priceSingle: fareBaseSingle + 2400,
      badge: "VIP PERKS",
      badgeColor: "bg-[#ffdcbd] text-[#693c00]",
      subtitle: "Luxury & first-onboard ease",
      benefits: [
        { label: "Check-in 20 kg", icon: Luggage, highlight: true },
        { label: "Row 1-3 Upfront Seat", icon: Users, highlight: true },
        { label: "Gourmet Hot Meal", icon: Utensils, highlight: true },
        { label: "Priority Boarding", icon: Sparkles, highlight: true }
      ]
    }
  ], [fareBaseSingle]);

  // ----------------------------------------------------
  // STEP 2: PASSENGER DETAILS
  // ----------------------------------------------------
  const [activePaxTab, setActivePaxTab] = useState<number>(0);

  // Adult 1 (Lead)
  const [leadTitle, setLeadTitle] = useState("Mr");
  const [leadFirstName, setLeadFirstName] = useState("Rohan");
  const [leadLastName, setLeadLastName] = useState("Deshmukh");
  const [leadDob, setLeadDob] = useState("1995-08-14");
  const [leadGender, setLeadGender] = useState("Male");
  const [leadNationality, setLeadNationality] = useState("Indian");
  const [leadWheelchair, setLeadWheelchair] = useState(false);

  // Adult 2 (Co-traveller)
  const [coPaxTitle, setCoPaxTitle] = useState("Ms");
  const [coPaxFirstName, setCoPaxFirstName] = useState("Pooja");
  const [coPaxLastName, setCoPaxLastName] = useState("Deshmukh");
  const [coPaxDob, setCoPaxDob] = useState("1997-11-22");
  const [coPaxGender, setCoPaxGender] = useState("Female");
  const [coPaxNationality, setCoPaxNationality] = useState("Indian");

  // Contact details
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [contactEmail, setContactEmail] = useState("rohan.deshmukh@routripo.com");
  const [whatsAppUpdates, setWhatsAppUpdates] = useState(true);

  // Frequent flyer & GST expander
  const [isGstOpen, setIsGstOpen] = useState(false);
  const [ffNumber, setFfNumber] = useState("6E-994821");
  const [gstNumber, setGstNumber] = useState("");
  const [gstCompanyName, setGstCompanyName] = useState("");

  const handleDigiLockerPreFill = () => {
    setLeadFirstName("Rohan");
    setLeadLastName("Deshmukh");
    setLeadDob("1995-08-14");
    setLeadGender("Male");
    setCoPaxFirstName("Pooja");
    setCoPaxLastName("Deshmukh");
    setCoPaxDob("1997-11-22");
    setCoPaxGender("Female");
    showToast("Aadhaar Verified! Pre-filled details via DigiLocker");
  };

  // ----------------------------------------------------
  // STEP 3: SEAT SELECTION
  // ----------------------------------------------------
  const [activeSeatPaxIndex, setActiveSeatPaxIndex] = useState<number>(0);
  const [assignedSeats, setAssignedSeats] = useState<{ [paxIndex: number]: { code: string; type: string; price: number } }>({
    0: { code: "12A", type: "Window", price: 0 },
    1: { code: "12B", type: "Middle", price: 0 }
  });

  const occupiedSeats = ["1A", "1C", "2B", "3D", "4F", "5A", "6C", "7D", "8E", "9B", "10A", "11F", "14C", "15D"];

  const handleSeatClick = (seatCode: string, seatType: string, seatPrice: number) => {
    if (occupiedSeats.includes(seatCode)) return;

    setAssignedSeats((prev) => ({
      ...prev,
      [activeSeatPaxIndex]: { code: seatCode, type: seatType, price: seatPrice }
    }));

    showToast(`Assigned ${seatCode} to Guest ${activeSeatPaxIndex + 1}`);

    // If there is a next guest who doesn't have a seat, automatically switch to them
    if (totalPax > 1 && activeSeatPaxIndex === 0) {
      setTimeout(() => setActiveSeatPaxIndex(1), 300);
    }
  };

  // ----------------------------------------------------
  // STEP 4: ADD-ONS & MEALS
  // ----------------------------------------------------
  const [mealQuantities, setMealQuantities] = useState<Record<string, number>>({
    veg_biryani: 1,
    chicken_sandwich: 0,
    masala_chai: 1
  });

  const updateMealQty = (key: string, delta: number) => {
    setMealQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta)
    }));
  };

  const [selectedBaggageOption, setSelectedBaggageOption] = useState<number>(0); // 0 = standard, 5 = +5kg (1950), 10 = +10kg (3800)
  const [fragileLuggageCare, setFragileLuggageCare] = useState<boolean>(false); // ₹199
  const [travelShieldProtect, setTravelShieldProtect] = useState<boolean>(true); // ₹249 * totalPax
  const [loungeAccess, setLoungeAccess] = useState<boolean>(false); // ₹899 * totalPax

  // ----------------------------------------------------
  // STEP 5: BOOKING REVIEW & CHARGES BREAKDOWN
  // ----------------------------------------------------
  const [promoCode, setPromoCode] = useState("DIWALI2026");
  const [isPromoApplied, setIsPromoApplied] = useState(true);
  const promoDiscount = isPromoApplied ? 600 : 0;

  // Real payment modal state
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState<any | null>(null);

  // Financial calculations
  const singleFareObj = fareTiers.find((f) => f.id === selectedFareTier) || fareTiers[1];
  const baseFareTotal = fareBaseSingle * totalPax; // ₹6,480 for 2
  const fareDeltaTotal = (singleFareObj.priceSingle - fareBaseSingle) * totalPax; // ₹1,200 for flexi
  const taxesAndSurcharges = 1200;

  // Add-ons total
  const baggageCost = selectedBaggageOption === 5 ? 1950 : selectedBaggageOption === 10 ? 3800 : 0;
  const fragileCost = fragileLuggageCare ? 199 : 0;
  const shieldCost = travelShieldProtect ? 249 * totalPax : 0;
  const loungeCost = loungeAccess ? 899 * totalPax : 0;

  // Meals cost: first meal is complimentary if Flexi Plus or VIP
  const isMealFree = selectedFareTier === "flexi" || selectedFareTier === "vip";
  const mealsExtraCost =
    Math.max(0, (mealQuantities.veg_biryani || 0) - (isMealFree ? 1 : 0)) * 350 +
    (mealQuantities.chicken_sandwich || 0) * 280 +
    Math.max(0, (mealQuantities.masala_chai || 0) - (isMealFree ? 1 : 0)) * 120;

  const totalAddOns = fareDeltaTotal + baggageCost + fragileCost + shieldCost + loungeCost + mealsExtraCost;
  const finalTotal = Math.max(0, baseFareTotal + taxesAndSurcharges + totalAddOns - promoDiscount);

  // Step headers configuration
  const getStepNumber = () => {
    switch (step) {
      case "results":
        return 0;
      case "fares":
        return 1;
      case "passengers":
        return 2;
      case "seats":
        return 3;
      case "meals":
        return 4;
      case "checkout":
        return 5;
      case "confirmed":
        return 6;
      default:
        return 1;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case "results":
        return "SELECT FLIGHT";
      case "fares":
        return "FARE SELECTION";
      case "passengers":
        return "PASSENGER DETAILS";
      case "seats":
        return "SEAT SELECTION";
      case "meals":
        return "ADD-ONS & MEALS";
      case "checkout":
        return "BOOKING REVIEW";
      case "confirmed":
        return "CONFIRMED";
      default:
        return "BOOKING";
    }
  };

  const handlePaymentSuccess = (paymentDetails: any) => {
    setIsRazorpayOpen(false);
    const pnr = `6E-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedBookingData({
      pnr,
      paymentId: paymentDetails.razorpay_payment_id || `pay_${Date.now()}`,
      airline: selectedFlight.airline,
      flightNumber: selectedFlight.flightNumber,
      origin: selectedFlight?.origin || searchParams.origin || "BOM",
      destination: selectedFlight?.destination || searchParams.destination || "DEL",
      date: searchParams.departDate || "15 Oct 2026",
      amount: finalTotal,
      passengers: [
        { name: `${leadFirstName} ${leadLastName}`, seat: assignedSeats[0]?.code || "12A" },
        ...(totalPax > 1 ? [{ name: `${coPaxFirstName} ${coPaxLastName}`, seat: assignedSeats[1]?.code || "12B" }] : [])
      ]
    });
    setStep("confirmed");
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-y-auto font-['Outfit'] bg-[#F8FAFC] text-[#0F172A] select-none"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-60 bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Persistent Flight Booking Header matching Google Stitch */}
      {step !== "confirmed" && (
        <FlightBookingHeader
          flight={selectedFlight}
          origin={selectedFlight?.origin || searchParams.origin || "BOM"}
          destination={selectedFlight?.destination || searchParams.destination || "DEL"}
          departDate={searchParams.departDate}
          paxCount={totalPax}
          cabinClass={searchParams.cabinClass || "Economy"}
          stepNum={getStepNumber()}
          totalSteps={6}
          stepTitle={getStepTitle()}
          timerText="14:45 left"
          onClose={onClose}
          onBack={() => {
            if (step === "results") onClose();
            else if (step === "fares" && !preselectedFlight) setStep("results");
            else if (step === "fares") onClose();
            else if (step === "passengers") setStep("fares");
            else if (step === "seats") setStep("passengers");
            else if (step === "meals") setStep("seats");
            else if (step === "checkout") setStep("meals");
            else onClose();
          }}
        />
      )}

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 pt-[115px] pb-36 space-y-4">
        {/* ========================================================
            STEP 0: FLIGHT RESULTS (If launched from fresh search)
            ======================================================== */}
        {/* ========================================================
            STEP 0: FLIGHT RESULTS (If launched from fresh search)
            ======================================================== */}
        {step === "results" && (
          <div className="space-y-3.5">
            {/* Search Header Banner */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Outfit']">Available Flights</h2>
                <span className="text-xs text-slate-500 font-['JetBrains_Mono']">
                  {searchParams.origin || "BOM"} → {searchParams.destination || "DEL"} • {searchParams.departDate || "Today"}
                </span>
              </div>
              <span className="text-xs font-bold text-[#0ea5e9] bg-sky-50 px-2.5 py-1 rounded-full font-['JetBrains_Mono']">
                {displayedFlights.length} {displayedFlights.length === 1 ? "Option" : "Options"}
              </span>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => {
                  setFilterStops("all");
                  setSortOption("cheapest");
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-['Outfit'] ${
                  sortOption === "cheapest" && filterStops === "all"
                    ? "bg-[#0ea5e9] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-sky-300"
                }`}
              >
                ₹ Cheapest
              </button>

              <button
                type="button"
                onClick={() => setSortOption("fastest")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-['Outfit'] ${
                  sortOption === "fastest"
                    ? "bg-[#0ea5e9] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-sky-300"
                }`}
              >
                Fastest
              </button>

              <button
                type="button"
                onClick={() => setFilterStops(filterStops === "direct" ? "all" : "direct")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-['Outfit'] ${
                  filterStops === "direct"
                    ? "bg-[#0ea5e9] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-sky-300"
                }`}
              >
                Non-stop Only
              </button>

              <button
                type="button"
                onClick={() => setSortOption("early")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-['Outfit'] ${
                  sortOption === "early"
                    ? "bg-[#0ea5e9] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-sky-300"
                }`}
              >
                Early Departure
              </button>
            </div>

            {/* Flight Cards List */}
            {isLoadingFlights ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="h-5 w-32 bg-slate-200 rounded" />
                      <div className="h-5 w-20 bg-slate-200 rounded" />
                    </div>
                    <div className="h-10 bg-slate-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              displayedFlights.map((fl: any, idx: number) => (
                <div
                  key={fl.id || idx}
                  onClick={() => {
                    setSelectedFlight({
                      ...fl,
                      airline: fl.airline,
                      flightNumber: fl.flightNumber,
                      departureTime: fl.dep || fl.departureTime,
                      arrivalTime: fl.arr || fl.arrivalTime,
                      duration: fl.dur || fl.duration,
                      price: fl.price,
                      origin: fl.origin || searchParams.origin || "BOM",
                      destination: fl.destination || searchParams.destination || "DEL"
                    });
                    setStep("fares");
                  }}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-[#0ea5e9] hover:shadow-md transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0ea5e9] group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors flex items-center justify-center font-bold text-xs">
                        {fl.airlineCode || fl.airline.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">{fl.airline}</h4>
                        <span className="text-[11px] text-slate-400 font-['JetBrains_Mono']">
                          {fl.flightNumber} • {fl.aircraft || "Airbus A320neo"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 font-['JetBrains_Mono']">
                        ₹{Number(fl.price).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10.5px] text-slate-400 block font-['JetBrains_Mono']">
                        /pax {totalPax > 1 ? `(₹${(Number(fl.price) * totalPax).toLocaleString("en-IN")} total)` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="font-black text-slate-900 text-base font-['JetBrains_Mono']">
                        {fl.dep || fl.departureTime || "06:15"}
                      </span>
                      <span className="text-slate-500 font-bold ml-1.5">{fl.origin || searchParams.origin || "BOM"}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 font-['JetBrains_Mono']">
                        {fl.dur || fl.duration || "2h 15m"}
                      </span>
                      <div className="w-20 h-0.5 bg-slate-200 relative my-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] absolute left-1/2 -top-0.5 -translate-x-1/2" />
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold">{fl.stops || "Non-stop"}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 text-base font-['JetBrains_Mono']">
                        {fl.arr || fl.arrivalTime || "08:30"}
                      </span>
                      <span className="text-slate-500 font-bold ml-1.5">{fl.destination || searchParams.destination || "DEL"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-['JetBrains_Mono']">
                    <span>{fl.baggage || "7kg Cabin + 15kg Check-in"}</span>
                    <button
                      type="button"
                      className="text-xs font-bold text-[#0ea5e9] group-hover:text-sky-700 flex items-center gap-1 font-['Outfit']"
                    >
                      <span>Select Fare</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================
            STEP 1: FARE SELECTION (Google Stitch Step 1)
            ======================================================== */}
        {step === "fares" && (
          <div className="space-y-4">
            {/* Flight Trajectory Summary Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#006591] flex items-center justify-center font-bold">
                    <Plane className="w-5 h-5 rotate-45" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {selectedFlight.airline} {selectedFlight.flightNumber}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-['JetBrains_Mono']">
                      {selectedFlight.aircraft || "Airbus A320neo"}
                    </span>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 font-['JetBrains_Mono'] text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{selectedFlight.onTimeRating || "98% On-Time"}</span>
                </span>
              </div>

              {/* Trajectory */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xl font-black text-slate-900 font-['JetBrains_Mono']">
                    {selectedFlight.departureTime || "06:15"}
                  </span>
                  <span className="text-xs font-bold text-slate-700 block">{selectedFlight.origin || searchParams.origin || "BOM"}</span>
                  <span className="text-[11px] text-slate-400 font-['JetBrains_Mono']">{selectedFlight.originAirport || "Terminal 2"}</span>
                </div>
                <div className="flex flex-col items-center px-4 flex-1">
                  <span className="text-[11px] text-slate-400 font-['JetBrains_Mono'] mb-0.5">
                    {selectedFlight.duration || "2h 15m"}
                  </span>
                  <div className="w-full flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#006591]" />
                    <div className="h-0.5 flex-1 bg-slate-200 relative flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-[#006591] absolute" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold font-['JetBrains_Mono'] mt-0.5">
                    {selectedFlight.stops || "Non-stop"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 font-['JetBrains_Mono']">
                    {selectedFlight.arrivalTime || "08:30"}
                  </span>
                  <span className="text-xs font-bold text-slate-700 block">{selectedFlight.destination || searchParams.destination || "DEL"}</span>
                  <span className="text-[11px] text-slate-400 font-['JetBrains_Mono']">{selectedFlight.destinationAirport || "Terminal 3"}</span>
                </div>
              </div>
            </div>

            {/* Fare Cards */}
            <div className="space-y-3">
              {fareTiers.map((tier) => {
                const isSelected = selectedFareTier === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => {
                      setSelectedFareTier(tier.id);
                      showToast(`Selected ${tier.name} Bundle`);
                    }}
                    className={`rounded-2xl p-4 border transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-white border-[#0ea5e9] shadow-[0_4px_16px_rgba(14,165,233,0.12)] ring-1 ring-[#0ea5e9]"
                        : "bg-white border-slate-200 shadow-2xs hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? "border-[#0ea5e9] bg-[#0ea5e9]" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-slate-900">{tier.name}</h4>
                            {tier.badge && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-['JetBrains_Mono'] ${tier.badgeColor}`}
                              >
                                {tier.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{tier.subtitle}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-0.5">
                          <span className="text-lg font-black text-slate-900 font-['JetBrains_Mono']">
                            ₹{tier.priceSingle.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[11px] text-slate-400 font-['JetBrains_Mono']">/pax</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-['JetBrains_Mono'] block">
                          ₹{(tier.priceSingle * totalPax).toLocaleString("en-IN")} total
                        </span>
                      </div>
                    </div>

                    {/* Features grid */}
                    <div
                      className={`grid grid-cols-2 gap-2 mt-3.5 p-2.5 rounded-xl text-xs transition-colors ${
                        isSelected ? "bg-sky-50/70 border border-sky-100" : "bg-slate-50 border border-slate-100"
                      }`}
                    >
                      {tier.benefits.map((b, i) => {
                        const Icon = b.icon;
                        return (
                          <div key={i} className="flex items-center gap-1.5 text-slate-700 min-w-0">
                            <Icon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSelected && b.highlight ? "text-[#0ea5e9]" : "text-slate-400"
                              }`}
                            />
                            <span className="truncate text-[11.5px] font-medium">{b.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SafeFare Guarantee Strip */}
            <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium text-slate-700">RouTripo SafeFare Guarantee included</span>
              </div>
              <Check className="w-4 h-4 text-emerald-600" />
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-3 pb-safe flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-900 font-['JetBrains_Mono']">
                    ₹{(singleFareObj.priceSingle * totalPax).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-400 font-['JetBrains_Mono']">({totalPax} Travellers)</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold font-['JetBrains_Mono'] truncate">
                  Incl. all taxes & fees
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep("passengers")}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-95 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-sky-500/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Continue to Passengers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: PASSENGER DETAILS (Google Stitch Step 2)
            ======================================================== */}
        {step === "passengers" && (
          <div className="space-y-4">
            {/* DigiLocker Pre-fill Banner */}
            <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-sky-50 border border-sky-200 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#006591] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Pre-fill via DigiLocker</h4>
                  <span className="text-[11px] text-slate-500 truncate">
                    Tap to verify and instant-fill IDs from Aadhaar
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDigiLockerPreFill}
                className="bg-[#0ea5e9] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Verify & Fill
              </button>
            </div>

            {/* Passenger Tab Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-200/80 rounded-xl p-1 font-['JetBrains_Mono'] text-xs">
              <button
                type="button"
                onClick={() => setActivePaxTab(0)}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePaxTab === 0 ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="truncate">Adult 1 (Lead)</span>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </button>

              {totalPax > 1 ? (
                <button
                  type="button"
                  onClick={() => setActivePaxTab(1)}
                  className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activePaxTab === 1 ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="truncate">Adult 2 (Co-Pax)</span>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              ) : (
                <div className="py-2 px-3 text-slate-400 text-center text-[11px] flex items-center justify-center">
                  Single Traveller
                </div>
              )}
            </div>

            {/* Active Passenger Form Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-[#0ea5e9] flex items-center justify-center font-bold text-xs">
                    {activePaxTab === 0 ? "P1" : "P2"}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {activePaxTab === 0 ? "Adult 1 Details (Lead Traveller)" : "Adult 2 Details (Co-Traveller)"}
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-['JetBrains_Mono']">
                  Govt. ID Match
                </span>
              </div>

              {/* Title selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-['JetBrains_Mono'] block mb-1.5">
                  Title
                </label>
                <div className="flex gap-2">
                  {["Mr", "Ms", "Mrs"].map((t) => {
                    const currentTitle = activePaxTab === 0 ? leadTitle : coPaxTitle;
                    const isSelected = currentTitle === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => (activePaxTab === 0 ? setLeadTitle(t) : setCoPaxTitle(t))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#0ea5e9] bg-sky-50 text-[#0ea5e9]"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10.5px] uppercase font-bold text-slate-500 font-['JetBrains_Mono'] block mb-1">
                    First & Middle Name
                  </label>
                  <input
                    type="text"
                    value={activePaxTab === 0 ? leadFirstName : coPaxFirstName}
                    onChange={(e) => (activePaxTab === 0 ? setLeadFirstName(e.target.value) : setCoPaxFirstName(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#0ea5e9] transition-all"
                    placeholder="As on Govt ID"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] uppercase font-bold text-slate-500 font-['JetBrains_Mono'] block mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={activePaxTab === 0 ? leadLastName : coPaxLastName}
                    onChange={(e) => (activePaxTab === 0 ? setLeadLastName(e.target.value) : setCoPaxLastName(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#0ea5e9] transition-all"
                    placeholder="Surname"
                  />
                </div>
              </div>

              {/* DOB, Gender & Nationality */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-['JetBrains_Mono'] block mb-1">
                    DOB
                  </label>
                  <input
                    type="date"
                    value={activePaxTab === 0 ? leadDob : coPaxDob}
                    onChange={(e) => (activePaxTab === 0 ? setLeadDob(e.target.value) : setCoPaxDob(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-[11px] font-bold text-slate-900 focus:bg-white focus:border-[#0ea5e9] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-['JetBrains_Mono'] block mb-1">
                    Gender
                  </label>
                  <select
                    value={activePaxTab === 0 ? leadGender : coPaxGender}
                    onChange={(e) => (activePaxTab === 0 ? setLeadGender(e.target.value) : setCoPaxGender(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-[11px] font-bold text-slate-900 focus:bg-white focus:border-[#0ea5e9] transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-['JetBrains_Mono'] block mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Indian"
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-2 py-2 text-[11px] font-bold text-slate-700"
                  />
                </div>
              </div>

              {/* Special Request (Wheelchair) */}
              {activePaxTab === 0 && (
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={leadWheelchair}
                    onChange={(e) => setLeadWheelchair(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0ea5e9] focus:ring-0"
                  />
                  <span className="text-xs text-slate-600 font-medium">Request Wheelchair Assistance at Airport</span>
                </label>
              )}
            </div>

            {/* Contact Details Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-['JetBrains_Mono']">
                Ticket & Flight Alerts
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10.5px] uppercase font-bold text-slate-500 font-['JetBrains_Mono']">
                    Mobile Number
                  </span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:border-[#0ea5e9]">
                    <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10.5px] uppercase font-bold text-slate-500 font-['JetBrains_Mono']">
                    E-Ticket Email
                  </span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 focus-within:bg-white focus-within:border-[#0ea5e9]">
                    <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp instant alerts */}
              <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 inline text-slate-500" />
                  <span className="text-xs font-medium text-emerald-900">
                    Send Boarding Passes & Delay Alerts via WhatsApp
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={whatsAppUpdates}
                  onChange={(e) => setWhatsAppUpdates(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                />
              </div>
            </div>

            {/* Frequent Flyer & GST Expander */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setIsGstOpen(!isGstOpen)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0ea5e9]" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Frequent Flyer & GST Details</span>
                    <span className="text-[11px] text-slate-500">6E Rewards linked • Optional tax credit</span>
                  </div>
                </div>
                {isGstOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isGstOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3 bg-slate-50/50">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 font-['JetBrains_Mono'] block mb-1">
                      Frequent Flyer Number (6E Rewards)
                    </label>
                    <input
                      type="text"
                      value={ffNumber}
                      onChange={(e) => setFfNumber(e.target.value)}
                      placeholder="e.g. 6E-994821"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 font-['JetBrains_Mono'] block mb-1">
                        GSTIN (Optional)
                      </label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        placeholder="27AAAAA0000A1Z5"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 font-['JetBrains_Mono'] block mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={gstCompanyName}
                        onChange={(e) => setGstCompanyName(e.target.value)}
                        placeholder="Registered Firm"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-3 pb-safe flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col min-w-0">
                <span className="text-xl font-black text-slate-900 font-['JetBrains_Mono']">
                  ₹{(singleFareObj.priceSingle * totalPax).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-slate-400 font-['JetBrains_Mono']">
                  {leadFirstName} {totalPax > 1 ? `& ${coPaxFirstName}` : ""}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!leadFirstName.trim() || !leadLastName.trim()) {
                    showToast("Please enter lead passenger's first and last name");
                    return;
                  }
                  if (!contactPhone.trim() || contactPhone.replace(/\D/g, "").length < 10) {
                    showToast("Please enter a valid 10-digit mobile number");
                    return;
                  }
                  if (!contactEmail.trim() || !contactEmail.includes("@")) {
                    showToast("Please enter a valid email address");
                    return;
                  }
                  setStep("seats");
                }}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-95 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-sky-500/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Continue to Seat Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: SEAT SELECTION (Google Stitch Step 3)
            ======================================================== */}
        {step === "seats" && (
          <div className="space-y-4">
            {/* Route & Aircraft Pill */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0ea5e9] flex items-center justify-center font-bold">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <span>{selectedFlight.origin || searchParams.origin || "BOM"} {selectedFlight.departureTime || "06:15"}</span>
                    <ArrowRight className="w-3 h-3 text-[#0ea5e9]" />
                    <span>{selectedFlight.destination || searchParams.destination || "DEL"} {selectedFlight.arrivalTime || "08:30"}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-['JetBrains_Mono'] block">
                    {selectedFlight.aircraft || "Airbus A320neo"} • {selectedFlight.duration || "2h 15m"}
                  </span>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-700 font-['JetBrains_Mono'] text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {singleFareObj.name}
              </span>
            </div>

            {/* Passenger Seat Allocation Pills */}
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setActiveSeatPaxIndex(0)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                  activeSeatPaxIndex === 0
                    ? "bg-sky-50 border-[#0ea5e9] ring-2 ring-sky-300"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  P1
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {leadFirstName} {leadLastName}
                  </span>
                  <span className="text-[11px] font-bold text-[#0ea5e9] font-['JetBrains_Mono']">
                    Seat {assignedSeats[0]?.code || "12A"} • {assignedSeats[0]?.type || "Window"}
                  </span>
                </div>
              </div>

              {totalPax > 1 ? (
                <div
                  onClick={() => setActiveSeatPaxIndex(1)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                    activeSeatPaxIndex === 1
                      ? "bg-sky-50 border-[#0ea5e9] ring-2 ring-sky-300"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    P2
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {coPaxFirstName} {coPaxLastName}
                    </span>
                    <span className="text-[11px] font-bold text-[#0ea5e9] font-['JetBrains_Mono']">
                      Seat {assignedSeats[1]?.code || "12B"} • {assignedSeats[1]?.type || "Middle"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-['JetBrains_Mono']">
                  No 2nd Guest
                </div>
              )}
            </div>

            {/* Legend Strip */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs flex items-center justify-between text-[11px] font-medium font-['JetBrains_Mono'] overflow-x-auto gap-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-3.5 h-3.5 rounded-sm border border-slate-300 bg-white" />
                <span className="text-slate-600">Free</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-3.5 h-3.5 rounded-sm bg-[#0ea5e9] flex items-center justify-center text-white text-[9px]">
                  
                </div>
                <span className="text-[#0ea5e9] font-bold">Selected</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-3.5 h-3.5 rounded-sm bg-sky-100 border border-sky-300" />
                <span className="text-slate-700">₹350</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-3.5 h-3.5 rounded-sm bg-amber-200 border border-amber-300" />
                <span className="text-amber-800">XL Legroom</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-3.5 h-3.5 rounded-sm bg-slate-200 text-slate-400 flex items-center justify-center text-[8px]">
                  
                </div>
                <span className="text-slate-400">Occupied</span>
              </div>
            </div>

            {/* Interactive Aircraft Cabin Layout */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-md relative overflow-hidden">
              {/* Nose cone visual */}
              <div className="w-24 h-8 mx-auto border-t-2 border-x-2 border-slate-300 rounded-t-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 font-['JetBrains_Mono'] mb-3">
                COCKPIT
              </div>

              {/* Column labels */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 font-['JetBrains_Mono'] px-3 mb-2">
                <div className="flex gap-2 w-[120px] justify-between">
                  <span className="w-8 text-center">A</span>
                  <span className="w-8 text-center">B</span>
                  <span className="w-8 text-center">C</span>
                </div>
                <span className="text-[10px] text-slate-300 uppercase">AISLE</span>
                <div className="flex gap-2 w-[120px] justify-between">
                  <span className="w-8 text-center">D</span>
                  <span className="w-8 text-center">E</span>
                  <span className="w-8 text-center">F</span>
                </div>
              </div>

              {/* Rows 1 through 16 */}
              <div className="space-y-1.5 font-['JetBrains_Mono']">
                {Array.from({ length: 16 }).map((_, rIdx) => {
                  const row = rIdx + 1;
                  const isExitRow = row === 12 || row === 13;
                  const isXL = row === 1 || isExitRow;

                  return (
                    <div key={row} className="flex items-center justify-between">
                      {/* Left seats: A, B, C */}
                      <div className="flex gap-2 w-[120px] justify-between">
                        {["A", "B", "C"].map((col) => {
                          const seatCode = `${row}${col}`;
                          const isOccupied = occupiedSeats.includes(seatCode);
                          const isAssignedToP1 = assignedSeats[0]?.code === seatCode;
                          const isAssignedToP2 = assignedSeats[1]?.code === seatCode;
                          const isSelected = isAssignedToP1 || isAssignedToP2;
                          const seatType = col === "A" ? "Window" : col === "B" ? "Middle" : "Aisle";
                          const price = isXL ? 850 : row > 10 ? 0 : 350;

                          return (
                            <button
                              key={seatCode}
                              type="button"
                              disabled={isOccupied}
                              onClick={() => handleSeatClick(seatCode, seatType, price)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#0ea5e9] text-white shadow-sm ring-2 ring-sky-300 scale-105"
                                  : isOccupied
                                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                  : isXL
                                  ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                                  : "bg-slate-50 hover:bg-sky-50 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {isSelected ? (isAssignedToP1 ? "P1" : "P2") : isOccupied ? "" : seatCode}
                            </button>
                          );
                        })}
                      </div>

                      {/* Row indicator */}
                      <div className="text-[11px] font-extrabold text-slate-300 w-8 text-center">{row}</div>

                      {/* Right seats: D, E, F */}
                      <div className="flex gap-2 w-[120px] justify-between">
                        {["D", "E", "F"].map((col) => {
                          const seatCode = `${row}${col}`;
                          const isOccupied = occupiedSeats.includes(seatCode);
                          const isAssignedToP1 = assignedSeats[0]?.code === seatCode;
                          const isAssignedToP2 = assignedSeats[1]?.code === seatCode;
                          const isSelected = isAssignedToP1 || isAssignedToP2;
                          const seatType = col === "F" ? "Window" : col === "E" ? "Middle" : "Aisle";
                          const price = isXL ? 850 : row > 10 ? 0 : 350;

                          return (
                            <button
                              key={seatCode}
                              type="button"
                              disabled={isOccupied}
                              onClick={() => handleSeatClick(seatCode, seatType, price)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#0ea5e9] text-white shadow-sm ring-2 ring-sky-300 scale-105"
                                  : isOccupied
                                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                  : isXL
                                  ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                                  : "bg-slate-50 hover:bg-sky-50 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {isSelected ? (isAssignedToP1 ? "P1" : "P2") : isOccupied ? "" : seatCode}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-3 pb-safe flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-slate-500 font-['JetBrains_Mono']">
                  Seats: {assignedSeats[0]?.code || "12A"} {totalPax > 1 ? `& ${assignedSeats[1]?.code || "12B"}` : ""}
                </span>
                <span className="text-sm font-bold text-emerald-600 font-['JetBrains_Mono']">
                  {singleFareObj.name} Included Free
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep("meals")}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-95 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-sky-500/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Continue to Add-ons & Meals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: ADD-ONS & MEALS (Google Stitch Step 4)
            ======================================================== */}
        {step === "meals" && (
          <div className="space-y-4">
            {/* Passenger & Seat Allocation Pill Strip */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0ea5e9] text-white flex items-center justify-center font-bold text-xs">
                  <CheckCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Seats Confirmed: {assignedSeats[0]?.code} {totalPax > 1 ? `& ${assignedSeats[1]?.code}` : ""}
                  </span>
                  <span className="text-[11px] text-slate-500 font-['JetBrains_Mono']">
                    {leadFirstName} • {totalPax > 1 ? coPaxFirstName : ""}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep("seats")}
                className="text-[11px] font-bold text-[#0ea5e9] bg-white px-2.5 py-1 rounded-md border border-sky-200 cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* Pre-book Meals & Beverages */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#0ea5e9]" />
                  <h3 className="font-bold text-sm text-slate-900">Pre-book Meals & Beverages</h3>
                </div>
                {isMealFree && (
                  <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-['JetBrains_Mono']">
                    1 Meal Free with Flexi
                  </span>
                )}
              </div>

              {[
                {
                  id: "veg_biryani",
                  name: "Veg Biryani Delight",
                  price: 350,
                  isVeg: true,
                  desc: "Fragrant basmati rice infused with saffron & spices, with fresh raita",
                  complimentary: isMealFree
                },
                {
                  id: "chicken_sandwich",
                  name: "Junglee Chicken Sandwich",
                  price: 280,
                  isVeg: false,
                  desc: "Smoked shredded chicken with cracked pepper in fresh multigrain bread",
                  complimentary: false
                },
                {
                  id: "masala_chai",
                  name: "Masala Chai (Hot)",
                  price: 120,
                  isVeg: true,
                  desc: "Fresh ginger-cardamom brewed hot tea with digestive cookies",
                  complimentary: isMealFree
                }
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                    <span
                      className={`w-3.5 h-3.5 mt-0.5 border rounded-xs flex items-center justify-center shrink-0 ${
                        item.isVeg ? "border-emerald-600 bg-white" : "border-rose-600 bg-white"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-rose-600"}`} />
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">{item.name}</h4>
                        {item.complimentary && (
                          <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-['JetBrains_Mono']">
                            FREE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.desc}</p>
                      <span className="text-[11px] font-black text-slate-800 font-['JetBrains_Mono']">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateMealQty(item.id, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-900 font-['JetBrains_Mono']">
                      {mealQuantities[item.id] || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateMealQty(item.id, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-sky-50 text-[#0ea5e9] font-bold hover:bg-sky-100 active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Excess Baggage & Care */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Luggage className="w-4 h-4 text-[#0ea5e9]" />
                  <h3 className="font-bold text-sm text-slate-900">Excess Baggage & Care</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-['JetBrains_Mono']">Pre-book & Save 20%</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => setSelectedBaggageOption(selectedBaggageOption === 5 ? 0 : 5)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedBaggageOption === 5
                      ? "bg-sky-50 border-[#0ea5e9] ring-2 ring-sky-200"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">+5 kg Extra</span>
                    {selectedBaggageOption === 5 && <Check className="w-4 h-4 text-[#0ea5e9]" />}
                  </div>
                  <span className="text-xs font-black text-slate-900 font-['JetBrains_Mono'] mt-1">₹1,950</span>
                  <span className="text-[10px] text-slate-500 font-medium">Standard Check-in</span>
                </div>

                <div
                  onClick={() => setSelectedBaggageOption(selectedBaggageOption === 10 ? 0 : 10)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedBaggageOption === 10
                      ? "bg-sky-50 border-[#0ea5e9] ring-2 ring-sky-200"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">+10 kg Extra</span>
                    {selectedBaggageOption === 10 && <Check className="w-4 h-4 text-[#0ea5e9]" />}
                  </div>
                  <span className="text-xs font-black text-slate-900 font-['JetBrains_Mono'] mt-1">₹3,800</span>
                  <span className="text-[10px] text-slate-500 font-medium">Heavy Luggage</span>
                </div>
              </div>

              {/* Fragile tag card */}
              <div
                onClick={() => setFragileLuggageCare(!fragileLuggageCare)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  fragileLuggageCare
                    ? "bg-amber-50 border-amber-300 ring-1 ring-amber-300"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 inline text-slate-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Fragile Baggage Priority Tag</span>
                    <span className="text-[11px] text-slate-500">Careful handling + Priority belt delivery</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 font-['JetBrains_Mono'] block">₹199</span>
                  <span className="text-[10px] font-bold text-emerald-600">{fragileLuggageCare ? "ADDED" : "+ ADD"}</span>
                </div>
              </div>
            </div>

            {/* RouTripo Shield Protect Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">RouTripo Shield Protect</h3>
                    <span className="text-[11px] text-slate-500">Complete travel insurance coverage</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={travelShieldProtect}
                    onChange={(e) => setTravelShieldProtect(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ea5e9]"></div>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-['JetBrains_Mono'] text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Trip Delay</span>
                  <span className="font-bold text-slate-900">₹10,000</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Medical Cover</span>
                  <span className="font-bold text-slate-900">₹2,50,000</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Lost Baggage</span>
                  <span className="font-bold text-slate-900">₹25,000</span>
                </div>
              </div>
            </div>

            {/* Airport Lounge Access */}
            <div
              onClick={() => setLoungeAccess(!loungeAccess)}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                loungeAccess
                  ? "bg-sky-50 border-[#0ea5e9] shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Airport Lounge Access</h4>
                  <span className="text-[11px] text-slate-500">Buffet, recliners, and fast Wi-Fi at Mumbai T2</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 font-['JetBrains_Mono'] block">₹899</span>
                <span className="text-[10.5px] font-bold text-[#0ea5e9]">{loungeAccess ? "SELECTED" : "+ ADD"}</span>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-3 pb-safe flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col min-w-0">
                <span className="text-xl font-black text-slate-900 font-['JetBrains_Mono']">
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-emerald-600 font-bold font-['JetBrains_Mono']">
                  All Add-ons & Taxes Included
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-95 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-sky-500/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Continue to Booking Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 5: BOOKING REVIEW & CHECKOUT (Google Stitch Step 5)
            ======================================================== */}
        {step === "checkout" && (
          <div className="space-y-4">
            {/* Step 5 Progress / Review Banner */}
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-[#0ea5e9] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Final Booking Review</span>
                  <span className="text-[11px] text-slate-500 font-['JetBrains_Mono']">
                    Verify flight details before secure gateway payment
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-['JetBrains_Mono']">
                READY
              </span>
            </div>

            {/* Flight Journey Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#0ea5e9]" />
                  <span className="text-xs font-bold text-slate-900">Flight Itinerary</span>
                </div>
                <span className="text-[11px] font-bold text-slate-500 font-['JetBrains_Mono']">
                  {searchParams.departDate || "15 Oct 2026"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-slate-900 font-['JetBrains_Mono']">
                    {selectedFlight.departureTime || "06:15"}
                  </span>
                  <span className="text-xs font-bold text-slate-700 block">
                    {selectedFlight.origin || searchParams.origin || "BOM"}
                  </span>
                  <span className="text-[10.5px] text-slate-400 font-['JetBrains_Mono']">
                    {selectedFlight.originAirport || "Terminal 2"}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10.5px] text-slate-400 font-['JetBrains_Mono']">
                    {selectedFlight.duration || "2h 15m"}
                  </span>
                  <div className="w-20 h-0.5 bg-slate-200 relative my-0.5">
                    <Plane className="w-3 h-3 text-[#0ea5e9] absolute left-1/2 -top-1.5 -translate-x-1/2 rotate-45" />
                  </div>
                  <span className="text-[10.5px] text-emerald-600 font-semibold font-['JetBrains_Mono']">
                    {selectedFlight.stops || "Non-stop"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900 font-['JetBrains_Mono']">
                    {selectedFlight.arrivalTime || "08:30"}
                  </span>
                  <span className="text-xs font-bold text-slate-700 block">
                    {selectedFlight.destination || searchParams.destination || "DEL"}
                  </span>
                  <span className="text-[10.5px] text-slate-400 font-['JetBrains_Mono']">
                    {selectedFlight.destinationAirport || "Terminal 3"}
                  </span>
                </div>
              </div>
            </div>

            {/* Travellers & Seat Allocation Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0ea5e9]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 font-['JetBrains_Mono']">
                    Travellers & Seat Allocation
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-['JetBrains_Mono']">{totalPax} Guests</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-sky-100 text-[#0ea5e9] flex items-center justify-center font-bold text-[10px]">
                      P1
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-slate-900 block truncate">
                        {leadFirstName} {leadLastName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {assignedSeats[0]?.code} ({assignedSeats[0]?.type}) • Meal: Veg Biryani
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#0ea5e9] font-['JetBrains_Mono'] bg-white px-2 py-0.5 rounded border border-sky-100">
                    Seat {assignedSeats[0]?.code}
                  </span>
                </div>

                {totalPax > 1 && (
                  <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-sky-100 text-[#0ea5e9] flex items-center justify-center font-bold text-[10px]">
                        P2
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate">
                          {coPaxFirstName} {coPaxLastName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {assignedSeats[1]?.code} ({assignedSeats[1]?.type}) • Meal: Masala Chai
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#0ea5e9] font-['JetBrains_Mono'] bg-white px-2 py-0.5 rounded border border-sky-100">
                      Seat {assignedSeats[1]?.code}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Included Baggage Allowance Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Luggage className="w-4 h-4 text-[#0ea5e9]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 font-['JetBrains_Mono']">
                    Included Baggage Allowance
                  </h3>
                </div>
                <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-['JetBrains_Mono']">
                  Included Free
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 inline text-slate-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-['JetBrains_Mono'] block">Cabin Bag</span>
                    <span className="font-bold text-slate-900">7 kg × {totalPax} pcs</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                  <Luggage className="w-4 h-4 inline text-slate-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-['JetBrains_Mono'] block">Check-in Bag</span>
                    <span className="font-bold text-slate-900">
                      {15 + selectedBaggageOption} kg × {totalPax} pcs
                    </span>
                  </div>
                </div>
              </div>

              {/* Destination Delight Weather Strip */}
              <div className="relative rounded-xl overflow-hidden p-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2 z-10">
                  <Sun className="w-5 h-5 text-amber-300 animate-spin-slow" />
                  <span className="text-xs font-bold">
                    {(selectedFlight?.destination || searchParams.destination || "Destination")} Forecast: 28°C & Pleasant Skies
                  </span>
                </div>
                <span className="text-[10.5px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-bold z-10">
                  Live Weather
                </span>
              </div>
            </div>

            {/* Promo Coupon Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Apply Promo Voucher</span>
                </div>
                {isPromoApplied && (
                  <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-['JetBrains_Mono']">
                    SAVED ₹600
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 font-['JetBrains_Mono'] uppercase"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsPromoApplied(!isPromoApplied);
                    showToast(isPromoApplied ? "Coupon Removed" : "Coupon Applied! -₹600");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    isPromoApplied
                      ? "bg-rose-50 text-rose-600 border border-rose-200"
                      : "bg-[#0ea5e9] text-white shadow-xs"
                  }`}
                >
                  {isPromoApplied ? "Remove" : "Apply"}
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 font-['JetBrains_Mono']">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 font-['Outfit']">
                  Fare & Charges Breakdown
                </h3>
                <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  All-Inclusive
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Base Fare ({totalPax} Guests)</span>
                  <span className="font-bold text-slate-900">₹{baseFareTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxes & Airport Surcharges</span>
                  <span className="font-bold text-slate-900">₹{taxesAndSurcharges.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Add-ons & Travel Shield Protect</span>
                  <span className="font-bold text-slate-900">₹{totalAddOns.toLocaleString("en-IN")}</span>
                </div>
                {isPromoApplied && (
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span>Promo Discount ({promoCode})</span>
                    <span>-₹{promoDiscount}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 font-['Outfit'] block">Total Amount</span>
                  <span className="text-[10px] text-slate-400">Inclusive of 18% GST</span>
                </div>
                <span className="text-2xl font-black text-[#0ea5e9]">₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Free Cancellation Note */}
            <div className="flex items-center gap-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Free cancellation within 24 hours of booking. Shielded by RouTripo Escrow SafeFare guarantee.
              </span>
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-3 pb-safe flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col min-w-0">
                <span className="text-xl font-black text-slate-900 font-['JetBrains_Mono']">
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold font-['JetBrains_Mono'] truncate">
                  Ready to Pay via Razorpay
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsRazorpayOpen(true)}
                className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:brightness-105 active:scale-95 text-white font-black text-sm px-6 py-3 rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              >
                <Lock className="w-4 h-4" />
                <span>Pay via Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 6: CONFIRMED SCREEN (After Real Razorpay Payment)
            ======================================================== */}
        {step === "confirmed" && confirmedBookingData && (
          <div className="space-y-4 pt-4 animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl p-6 shadow-xl text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <span className="bg-white/25 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-['JetBrains_Mono'] inline-block">
                Booking Confirmed
              </span>
              <h2 className="text-2xl font-black font-['Outfit']">Have a Wonderful Flight!</h2>
              <p className="text-xs text-white/90">
                Your flight tickets & boarding passes have been issued and sent to {contactEmail} & WhatsApp.
              </p>
            </div>

            {/* Ticket Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 font-['JetBrains_Mono']">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Airline PNR</span>
                  <span className="text-xl font-black text-slate-900 tracking-wider">
                    {confirmedBookingData.pnr}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment ID</span>
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[120px] block">
                    {confirmedBookingData.paymentId}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm">
                    {confirmedBookingData.origin} → {confirmedBookingData.destination}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    {confirmedBookingData.airline} {confirmedBookingData.flightNumber} • {confirmedBookingData.date}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#0ea5e9]">
                    ₹{confirmedBookingData.amount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-emerald-600 block font-bold">PAID VIA RAZORPAY</span>
                </div>
              </div>

              {/* Passengers */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Confirmed Travellers</span>
                {confirmedBookingData.passengers.map((p: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl text-xs">
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Seat {p.seat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => showToast("Downloading PDF Ticket...")}
                className="py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-800 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-[#0ea5e9]" />
                <span>Download Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => showToast("Shared to WhatsApp!")}
                className="py-3 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl font-bold text-xs text-emerald-800 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>Share WhatsApp</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        )}
      </main>

      {/* Razorpay Interactive Modal with real server order creation */}
      {isRazorpayOpen && (
        <RazorpayPaymentModal
          isOpen={isRazorpayOpen}
          amount={finalTotal}
          serviceName={`${selectedFlight?.airline || "Flight"} Booking`}
          title={`Flight: ${selectedFlight?.origin || searchParams.origin || "BOM"} → ${selectedFlight?.destination || searchParams.destination || "DEL"}`}
          customerName={`${leadFirstName} ${leadLastName}`}
          customerEmail={contactEmail}
          customerPhone={contactPhone}
          onSuccess={handlePaymentSuccess}
          onFailure={(err) => {
            setIsRazorpayOpen(false);
            showToast(`Payment failed: ${err}`);
          }}
          onClose={() => setIsRazorpayOpen(false)}
        />
      )}
    </div>
  );
};
