import React, { useState, useEffect } from "react";
import {
  Star,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Car,
  Calendar,
  MapPin,
  Sparkles,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Heart,
  Phone,
  MessageSquare,
  Copy,
  Clock,
  Navigation,
  Check,
  Share2,
  AlertTriangle
} from "lucide-react";
import { RazorpayPaymentModal } from "./RazorpayPaymentModal";

export interface CarSearchParams {
  location: string;
  origin?: string;
  destination?: string;
  pickupDate: string;
  dropDate?: string;
  passengers: number;
}

export interface CarBookingCoordinatorProps {
  initialSearchParams: CarSearchParams;
  onClose: () => void;
  preselectedCar?: any;
  initialStep?: 1 | 2 | 3 | 4 | 5;
}

const STITCH_CABS = [
  {
    id: "cab_sedan_01",
    title: "Prime Sedan",
    subtitle: "Dzire, Etios, Aura with extra legroom",
    category: "AC Sedan",
    model: "Swift Dzire / Etios",
    tag: "Top Pick",
    badge: "RECOMMENDED",
    driverBadge: "Top Rated Driver",
    rating: 4.9,
    trips: "3.8k trips",
    seats: 4,
    bags: 3,
    ac: true,
    freeCancellation: "Free cancellation (up to 1h)",
    price: 2850,
    originalPrice: 3200,
    image: "https://lh3.googleusercontent.com/aida/AEtjO1VtlpQkLHy5KnzDGQribZxHBGIfvcYnCywqaLwzQIZdpQUUHuN5Hsy1lobRvk1oAaZMLxD57C1nClxvxaNgKvV7xgj05jQ9LZtDzhHDjr1g2ahhsp39V22kmJGI1AyYTTmhCLx2tRbcfkuU0oq0M5X4sjyjj1isQps8ccd4OsJcZb1TaYW5FPSOyxNJdxRmdSSi2OpBvTNwhKBTYQwjXwwLtETtzst7yQTwiRCkqMETC668ZBobRYNi5GM"
  },
  {
    id: "cab_ev_02",
    title: "Green EV SUV",
    subtitle: "Tata Nexon EV, BYD Atto 3",
    category: "EV SUV",
    model: "Tata Nexon EV",
    tag: "Eco Ride",
    badge: "Zero Emission",
    driverBadge: "Fast Charger Route Mapped",
    rating: 4.9,
    trips: "840 trips",
    seats: 4,
    bags: 3,
    ac: true,
    freeCancellation: "Free cancellation (up to 1h)",
    price: 3150,
    originalPrice: 3500,
    image: "https://lh3.googleusercontent.com/aida/AEtjO1WdSxvAf7lcI8NJ8Z5R8ZpsW57vYJGoAqYjs3cYxvzEPRyJbH_w4wVFYHfeVMDeZGH9J8ESSWAu9-YIh-6vGYY7hxjoX38-86Y8XAzl2mtyR5YJ8NRVFU0b0NsBzq3URSM_bildwwnP8GUaBUQUCHDPjG-V6gcBYgKfawAYZEZ7qEsImspudUf63-YPX-0jrbImcl_8oiTjVqdN1JyIAUovAthWwNwoQoVVWsa-PSyGRZA6quX4v1MIqbw"
  },
  {
    id: "cab_suv_03",
    title: "Prime SUV",
    subtitle: "Toyota Innova Crysta, Ertiga XL6",
    category: "SUV 6+ Seater",
    model: "Innova Crysta",
    tag: "6+1 Seater",
    badge: "Group Favorite",
    driverBadge: "Top Rated Chauffeur",
    rating: 4.9,
    trips: "2.4k trips",
    seats: 7,
    bags: 5,
    ac: true,
    freeCancellation: "Free cancellation (up to 2h)",
    price: 4200,
    originalPrice: 4700,
    image: "https://lh3.googleusercontent.com/aida/AEtjO1W6memQaFREN-GZuxHh61sY1INCftAd3TeZJ5yJY4SisFM-Kn1L9pFk0ZRHHF4qswhkMcF7pJUg7dX0u35Cda4B8GwCHJ_u3afWHGc00_so4IfrdLBHjA0SBMJ1Hr_6heU7ybViAXPUVRbbtyMuJSKHINA3bLkk1zVbPLnZQ1in-aT6-jiby-Ni8VgSl0jfBSOONJYtkQPJsWI8q6t2965_VZ21eVL72jxbbDMi1aTyOpXjuIrEq0I4k0M"
  },
  {
    id: "cab_mini_04",
    title: "Smart Hatchback",
    subtitle: "WagonR, Tiago, Celerio with fuel economy",
    category: "Hatchback",
    model: "Maruti WagonR",
    tag: "Budget Pick",
    badge: "Value Saver",
    driverBadge: "City Expert Driver",
    rating: 4.8,
    trips: "4.1k trips",
    seats: 4,
    bags: 2,
    ac: true,
    freeCancellation: "Free cancellation (up to 1h)",
    price: 2100,
    originalPrice: 2400,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFp_G6l-gG2c98K1B_Nl4sVv14Zk81tYQ35N_BcfR3M1c3gZ92K9aE6s2wXv78P3Vp111_g4q7wL"
  }
];

export const CarBookingCoordinator: React.FC<CarBookingCoordinatorProps> = ({
  initialSearchParams,
  onClose,
  preselectedCar,
  initialStep
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // 5 Funnel Steps matching MODULE/CAR
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(
    initialStep || (preselectedCar ? 2 : 1)
  );

  // Step 1: Vehicle selection
  const [cars, setCars] = useState<any[]>(
    preselectedCar
      ? [preselectedCar, ...STITCH_CABS.filter((c) => c.id !== preselectedCar.id)]
      : STITCH_CABS
  );
  const [selectedCar, setSelectedCar] = useState<any>(preselectedCar || STITCH_CABS[0]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  // Step 2: Trip & Location Details
  const [pickupLocation, setPickupLocation] = useState<string>(
    initialSearchParams.origin || initialSearchParams.location || "Dadar T.T. Circle, Mumbai"
  );
  const [pickupLandmark, setPickupLandmark] = useState<string>("Near Swami Narayan Temple");
  const [dropLocation, setDropLocation] = useState<string>(
    initialSearchParams.destination || "Koregaon Park / Pune Station"
  );
  const [dropLandmark, setDropLandmark] = useState<string>("Gate No. 2, IT Hub");
  const [pickupDate, setPickupDate] = useState<string>(
    initialSearchParams.pickupDate || new Date().toISOString().split("T")[0]
  );
  const [pickupTime, setPickupTime] = useState<string>("07:30 AM");
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    ac: true,
    silent: false,
    luggage: true
  });
  const [specialInstructions, setSpecialInstructions] = useState<string>("");

  // Step 3: Passenger & Addons
  const [passengerName, setPassengerName] = useState<string>("Rohan Deshmukh");
  const [passengerPhone, setPassengerPhone] = useState<string>("9876543210");
  const [passengerEmail, setPassengerEmail] = useState<string>("rohan@routtripo.com");
  const [shieldActive, setShieldActive] = useState<boolean>(true);
  const [tipAmount, setTipAmount] = useState<number>(100);
  const [dynamicAddons, setDynamicAddons] = useState<any[]>([]);

  // Step 4 & 5: Review, Booking & OTP Handshake
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [bookingResponse, setBookingResponse] = useState<any>(null);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);

  // Scroll to top on step change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [step]);

  // Fetch live cars from API
  useEffect(() => {
    let isMounted = true;
    const fetchLiveCars = async () => {
      try {
        const res = await fetch("/api/cars/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: initialSearchParams.location || "Goa",
            origin: initialSearchParams.origin,
            destination: initialSearchParams.destination,
            pickupDate: initialSearchParams.pickupDate,
            dropDate: initialSearchParams.dropDate,
            passengers: initialSearchParams.passengers
          })
        });

        if (res.ok) {
          const data = await res.json();
          const list = data.quotes || data.cars || data.results;
          if (isMounted && Array.isArray(list) && list.length > 0) {
            // merge with stitch images/metadata
            const merged = list.map((item: any, idx: number) => ({
              ...STITCH_CABS[idx % STITCH_CABS.length],
              ...item,
              price: item.price || item.totalPrice || STITCH_CABS[idx % STITCH_CABS.length].price,
              title: item.title || item.vehicleModel || STITCH_CABS[idx % STITCH_CABS.length].title
            }));
            setCars(merged);
            setSelectedCar(merged[0]);
            return;
          }
        }
      } catch (err) {
        console.warn("Live car search error, using Stitch catalog:", err);
      }
      if (isMounted) {
        setCars(STITCH_CABS);
        setSelectedCar(STITCH_CABS[0]);
      }
    };
    fetchLiveCars();
    return () => { isMounted = false; };
  }, [initialSearchParams]);

  // Fetch dynamic addons for Step 3
  useEffect(() => {
    fetch("/api/cabs/addons")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.addons)) {
          setDynamicAddons(d.addons);
        }
      })
      .catch((err) => console.warn("Failed to fetch cab addons:", err));
  }, []);

  // Compute live total fare
  const baseFare = selectedCar?.price || 2850;
  const shieldCost = shieldActive ? 49 : 0;
  const totalPayable = baseFare + shieldCost + tipAmount;

  // Filtered cars
  const filteredCars = cars.filter((c) => {
    if (activeFilter === "sedan") return c.category?.toLowerCase().includes("sedan");
    if (activeFilter === "suv") return c.category?.toLowerCase().includes("suv");
    if (activeFilter === "ev") return c.category?.toLowerCase().includes("ev") || c.tag?.includes("Eco");
    if (activeFilter === "topRated") return (c.rating || 4.8) >= 4.9;
    return true;
  });

  // Handle final booking submission
  const handlePaymentSuccess = async (paymentDetails: any) => {
    try {
      const res = await fetch("/api/cabs/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle: selectedCar,
          pickupLocation: `${pickupLocation} (${pickupLandmark})`,
          dropLocation: `${dropLocation} (${dropLandmark})`,
          pickupDateTime: `${pickupDate}, ${pickupTime}`,
          passenger: {
            name: passengerName,
            phone: passengerPhone,
            email: passengerEmail
          },
          addons: [
            ...(shieldActive ? [{ name: "RouTripo Cab Shield", price: 49 }] : []),
            ...(tipAmount > 0 ? [{ name: "Chauffeur Tip", price: tipAmount }] : [])
          ],
          totalAmount: totalPayable,
          paymentId: paymentDetails?.razorpay_payment_id || "PAY_TEST_" + Date.now()
        })
      });

      const data = await res.json();
      if (data.success) {
        setBookingResponse(data);
      } else {
        // Fallback live mock response
        setBookingResponse({
          bookingId: "CAB" + Math.floor(100000 + Math.random() * 900000),
          rideOtp: "4829",
          driver: {
            name: "Rajesh Shinde",
            rating: 4.9,
            tripsCount: 1420,
            phone: "+91 98201 44556",
            plateNumber: "MH 01 CR 4829",
            vehicleModel: selectedCar?.title || "White Swift Dzire Tour",
            photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSw5RxjsUkTiz8j5QkxMdQcHJxHnWnZp8ympoKWZRVBfRfMd3VHJ5gAJ0MxETQD9NQ9VtUVgzgciPnQWLr7Dm5rpjGWN3zXVn91AD6iczGr70OyN6KdqMOEVHDbebsPGz0D0iXEVAwFcmMjoM3otGrcW-Ez-pmwYNKWL_QPXIFVOovF1GaV-z0npllpCHyU_vc49OjZ9fZdd0tNdRf5_otRt-y17rPNtyHtd28rA0gqU1Yo7iNESom"
          }
        });
      }
    } catch (err) {
      console.error("Booking error:", err);
      setBookingResponse({
        bookingId: "CAB482901",
        rideOtp: "4829",
        driver: {
          name: "Rajesh Shinde",
          rating: 4.9,
          tripsCount: 1420,
          phone: "+91 98201 44556",
          plateNumber: "MH 01 CR 4829",
          vehicleModel: selectedCar?.title || "White Swift Dzire Tour",
          photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSw5RxjsUkTiz8j5QkxMdQcHJxHnWnZp8ympoKWZRVBfRfMd3VHJ5gAJ0MxETQD9NQ9VtUVgzgciPnQWLr7Dm5rpjGWN3zXVn91AD6iczGr70OyN6KdqMOEVHDbebsPGz0D0iXEVAwFcmMjoM3otGrcW-Ez-pmwYNKWL_QPXIFVOovF1GaV-z0npllpCHyU_vc49OjZ9fZdd0tNdRf5_otRt-y17rPNtyHtd28rA0gqU1Yo7iNESom"
        }
      });
    }

    setIsPaymentModalOpen(false);
    setStep(5); // Proceed to Step 5: Ride OTP & Driver Handshake
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC] text-slate-800 antialiased flex flex-col font-['Outfit',sans-serif]"
    >
      {/* 1. Curved Stitch Header */}
      <header className="sticky top-0 inset-x-0 z-40 bg-[#0ea5e9] text-white shadow-[0_4px_16px_rgba(14,165,233,0.18)] rounded-b-[20px] pt-safe transition-all">
        <div className="px-4 py-2.5 flex items-center justify-between gap-3 max-w-xl mx-auto">
          <button
            aria-label="Go back"
            className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center active:scale-95 transition-all hover:bg-white/30 shrink-0 cursor-pointer"
            onClick={() => {
              if (step > 1 && step < 5) setStep((s) => (s - 1) as any);
              else onClose();
            }}
            type="button"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex-1 text-center min-w-0 px-1">
            <h1 className="font-bold text-sm sm:text-base text-white tracking-tight truncate leading-tight">
              {pickupLocation.split(",")[0]} ⇄ {dropLocation.split("/")[0]}
            </h1>
            <p className="text-[11px] font-semibold text-white/90 truncate mt-0.5">
              {pickupDate} • Outstation One-Way • {selectedCar?.title || "Prime Sedan"}
            </p>
          </div>

          <button
            aria-label="Close booking"
            className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center active:scale-95 transition-all hover:bg-white/30 shrink-0 cursor-pointer"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-4 pb-2 max-w-xl mx-auto flex flex-col gap-1">
          <div className="flex items-center justify-between text-white/90 font-['JetBrains_Mono',monospace] text-[10px] sm:text-xs">
            <span className="font-bold uppercase tracking-wider">
              {step === 1 && "STEP 1 OF 5: SELECT VEHICLE"}
              {step === 2 && "STEP 2 OF 5: TRIP & LOCATION DETAILS"}
              {step === 3 && "STEP 3 OF 5: PASSENGER & ADD-ONS"}
              {step === 4 && "STEP 4 OF 5: REVIEW & PAYMENT"}
              {step === 5 && "STEP 5 OF 5: RIDE OTP & HANDSHAKE"}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-amber-300" />
              <span>{15 - step * 2}:30 left</span>
            </span>
          </div>
          <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 pt-4 pb-32">
        {/* ============================================================ */}
        {/* STEP 1: SELECT VEHICLE (routripo_cab_step_1_select_vehicle)   */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Quick Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === "all"
                    ? "bg-[#0ea5e9] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                All Fleet ({cars.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("sedan")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === "sedan"
                    ? "bg-[#0ea5e9] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Prime Sedan
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("ev")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === "ev"
                    ? "bg-[#0ea5e9] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Green EV SUV
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("suv")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-['JetBrains_Mono',monospace] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === "suv"
                    ? "bg-[#0ea5e9] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Prime SUV
              </button>
            </div>

            {/* Vehicle List */}
            <div className="space-y-4">
              {filteredCars.map((cab: any) => {
                const isSelected = selectedCar?.id === cab.id;
                const isSaved = wishlist[cab.id];

                return (
                  <article
                    key={cab.id}
                    onClick={() => setSelectedCar(cab)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 relative overflow-hidden bg-white border ${
                      isSelected
                        ? "border-[#0ea5e9] ring-2 ring-sky-300 shadow-md bg-gradient-to-b from-sky-50/50 via-white to-white"
                        : "border-slate-200 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    {/* Top Recommendation Badge */}
                    {cab.badge && (
                      <div className="absolute top-2.5 right-3 text-[#0ea5e9] font-['JetBrains_Mono',monospace] text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0ea5e9]" />
                        <span>{cab.badge}</span>
                      </div>
                    )}

                    {/* Title & Price Header */}
                    <div className="flex items-start justify-between gap-2 pt-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h2 className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
                            {cab.title}
                          </h2>
                          {cab.tag && (
                            <span className="text-[#0ea5e9] bg-sky-50 px-2 py-0.5 rounded-md text-[11px] font-bold font-['JetBrains_Mono',monospace]">
                              {cab.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                          {cab.subtitle}
                        </p>
                      </div>

                      <div className="text-right shrink-0 mt-1">
                        <div className="font-extrabold text-lg sm:text-xl text-[#006591] leading-tight">
                          ₹{cab.price.toLocaleString("en-IN")}
                        </div>
                        <span className="text-[10px] text-slate-400 font-['JetBrains_Mono',monospace]">
                          all inclusive
                        </span>
                      </div>
                    </div>

                    {/* Vehicle Image Preview */}
                    <div className="w-full h-36 rounded-xl overflow-hidden mt-3 relative bg-slate-100 border border-slate-100">
                      <img
                        alt={cab.title}
                        src={cab.image}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-xs text-slate-900">{cab.rating}</span>
                        <span className="text-[10px] text-slate-500">({cab.trips})</span>
                      </div>
                      <div className="absolute top-2 left-2 bg-emerald-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <ShieldCheck className="w-3 h-3 text-white" />
                        <span>{cab.driverBadge}</span>
                      </div>

                      {/* Wishlist Heart */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWishlist((prev) => ({ ...prev, [cab.id]: !prev[cab.id] }));
                        }}
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                          isSaved ? "bg-rose-50 text-rose-600" : "bg-white/80 text-slate-600 hover:bg-white"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-600" : ""}`} />
                      </button>
                    </div>

                    {/* Spec Chips Rail */}
                    <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar py-0.5">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs shrink-0 font-medium">
                        <Users className="w-3.5 h-3.5 text-[#006591]" />
                        <span>{cab.seats} Seater</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs shrink-0 font-medium">
                        <span className="material-symbols-outlined text-[15px] text-[#006591]">ac_unit</span>
                        <span>Dual AC</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs shrink-0 font-medium">
                        <span className="material-symbols-outlined text-[15px] text-[#006591]">luggage</span>
                        <span>{cab.bags} Luggage Bags</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs shrink-0 font-medium border border-emerald-100">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{cab.freeCancellation}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: TRIP & LOCATION DETAILS (routripo_cab_step_2)         */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Selected Vehicle Mini Summary */}
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img
                    alt={selectedCar?.title}
                    src={selectedCar?.image}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 truncate">
                    {selectedCar?.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-['JetBrains_Mono',monospace]">
                    {selectedCar?.seats} Seats • {selectedCar?.bags} Bags • Chilled AC
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[#0ea5e9] font-bold text-xs hover:underline shrink-0"
              >
                Change
              </button>
            </div>

            {/* Pickup & Drop Points Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="font-extrabold text-base text-slate-900">Pickup &amp; Drop Points</h2>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Toll Inclusive</span>
                </span>
              </div>

              {/* Connected Points with dashed line */}
              <div className="relative space-y-4">
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-sky-300 pointer-events-none" />

                {/* Pickup Point */}
                <div className="relative flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">trip_origin</span>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold font-['JetBrains_Mono',monospace] text-slate-400 uppercase">
                        PICKUP LOCATION
                      </label>
                      <button
                        type="button"
                        onClick={() => setPickupLocation("Current Location (GPS)")}
                        className="text-xs text-[#0ea5e9] font-bold flex items-center gap-0.5 hover:underline"
                      >
                        <Navigation className="w-3 h-3 text-[#0ea5e9]" />
                        <span>Current</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full bg-transparent font-bold text-sm text-slate-900 focus:outline-none"
                    />
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Landmark: e.g. Near Swami Narayan Temple"
                        value={pickupLandmark}
                        onChange={(e) => setPickupLandmark(e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-xs text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Drop Point */}
                <div className="relative flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold font-['JetBrains_Mono',monospace] text-slate-400 uppercase">
                        DROP LOCATION
                      </label>
                      <span className="text-[10px] font-['JetBrains_Mono',monospace] text-slate-400 font-semibold">
                        Approx. 154 km
                      </span>
                    </div>
                    <input
                      type="text"
                      value={dropLocation}
                      onChange={(e) => setDropLocation(e.target.value)}
                      className="w-full bg-transparent font-bold text-sm text-slate-900 focus:outline-none"
                    />
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Landmark: Gate number, society or tech park"
                        value={dropLandmark}
                        onChange={(e) => setDropLandmark(e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-xs text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Visualizer Card */}
              <div className="rounded-xl overflow-hidden bg-gradient-to-r from-sky-900 via-sky-800 to-sky-700 text-white p-3.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-sky-300 text-[24px]">alt_route</span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm">Via Mumbai-Pune Expressway</h4>
                    <p className="text-[11px] text-sky-200">Est. Travel Time: 3 hrs 15 mins</p>
                  </div>
                </div>
                <span className="bg-emerald-500 text-white font-['JetBrains_Mono',monospace] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  FASTEST
                </span>
              </div>
            </div>

            {/* Schedule Departure Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900">Schedule Departure</h3>
                <span className="text-xs text-[#006591] font-bold">Instant Dispatch Available</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <span className="text-[10px] font-['JetBrains_Mono',monospace] text-slate-400 font-bold uppercase block mb-1">
                    DATE
                  </span>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-transparent font-bold text-sm text-slate-900 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <span className="text-[10px] font-['JetBrains_Mono',monospace] text-slate-400 font-bold uppercase block mb-1">
                    PICKUP TIME
                  </span>
                  <input
                    type="text"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-transparent font-bold text-sm text-slate-900 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Time Pickers */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap mr-1">Quick:</span>
                {["06:00 AM", "07:30 AM", "09:00 AM", "04:30 PM", "10:00 PM"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPickupTime(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      pickupTime === t
                        ? "bg-[#0ea5e9] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Preferences */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-base text-slate-900">Trip Preferences</h3>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => setPreferences((p) => ({ ...p, ac: !p.ac }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    preferences.ac
                      ? "bg-[#0ea5e9] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">ac_unit</span>
                  <span>Keep AC on default</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreferences((p) => ({ ...p, silent: !p.silent }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    preferences.silent
                      ? "bg-[#0ea5e9] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">volume_off</span>
                  <span>Silent driver preferred</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreferences((p) => ({ ...p, luggage: !p.luggage }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    preferences.luggage
                      ? "bg-[#0ea5e9] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">front_loader</span>
                  <span>Luggage assistance</span>
                </button>
              </div>

              <input
                type="text"
                placeholder="Specific instructions: e.g. Gate 3, near visitor parking..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: PASSENGER & ADDONS (routripo_cab_step_3)             */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Route Mini Visualizer Card */}
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-[#006591] flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5 text-[#006591]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate">
                      {pickupLocation.split(",")[0]} ➔ {dropLocation.split("/")[0]}
                    </h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 truncate font-['JetBrains_Mono',monospace]">
                    {selectedCar?.title} • Sanitized • AC
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold font-['JetBrains_Mono',monospace] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                CONFIRMED
              </span>
            </div>

            {/* Lead Passenger Info Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-base text-slate-900">Lead Passenger Details</h3>
                <span className="text-[10px] font-bold font-['JetBrains_Mono',monospace] text-slate-400 uppercase">
                  REQUIRED
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold font-['JetBrains_Mono',monospace] text-slate-400 uppercase block mb-1">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-sm text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold font-['JetBrains_Mono',monospace] text-slate-400 uppercase block mb-1">
                      MOBILE NUMBER
                    </label>
                    <input
                      type="tel"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-sm text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold font-['JetBrains_Mono',monospace] text-slate-400 uppercase block mb-1">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      value={passengerEmail}
                      onChange={(e) => setPassengerEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-sm text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Add-ons & Security */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900">Trip Add-ons &amp; Security</h3>
                <span className="text-xs text-[#0ea5e9] font-bold">Recommended</span>
              </div>

              {/* 1. Cab Shield */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-[#006591] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#006591]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        RouTripo Cab Shield
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                        Active
                      </span>
                      <span className="text-xs font-black text-[#006591]">₹49</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      Accident, hospital &amp; luggage delay cover by ICICI Lombard
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={shieldActive}
                    onChange={(e) => setShieldActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0ea5e9]" />
                </label>
              </div>

              {/* 2. Toll & State Tax Pass */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-[#006591] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-[#006591]">toll</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        Toll &amp; State Tax Pass
                      </h4>
                      <span className="text-[10px] font-bold text-[#006591] bg-sky-50 px-1.5 py-0.5 rounded-sm">
                        Included
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      Expressway tolls &amp; border permit charges pre-paid
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              {/* 3. Chauffeur Tip */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Chauffeur Appreciation Tip</span>
                  <span className="text-[10px] text-slate-400 font-['JetBrains_Mono',monospace]">100% to driver</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 50, 100, 150].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTipAmount(amt)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        tipAmount === amt
                          ? "bg-[#0ea5e9] text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {amt === 0 ? "None" : `₹${amt}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Waiting Time Guarantee */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      Waiting Time Guarantee
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                      Free
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Free 30 mins buffer waiting at doorstep pickup
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned Chauffeur Preview Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-700 shrink-0 border-2 border-emerald-400">
                <img
                  alt="Chauffeur Rajesh"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSw5RxjsUkTiz8j5QkxMdQcHJxHnWnZp8ympoKWZRVBfRfMd3VHJ5gAJ0MxETQD9NQ9VtUVgzgciPnQWLr7Dm5rpjGWN3zXVn91AD6iczGr70OyN6KdqMOEVHDbebsPGz0D0iXEVAwFcmMjoM3otGrcW-Ez-pmwYNKWL_QPXIFVOovF1GaV-z0npllpCHyU_vc49OjZ9fZdd0tNdRf5_otRt-y17rPNtyHtd28rA0gqU1Yo7iNESom"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-white truncate">Rajesh Shinde</h4>
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-xs">
                    ★ 4.9
                  </span>
                </div>
                <p className="text-xs text-sky-200 truncate">
                  1,420+ trips • Police verified &amp; vaccinated
                </p>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: REVIEW & PAYMENT (routripo_cab_step_4)                */}
        {/* ============================================================ */}
        {step === 4 && (
          <div className="space-y-4">
            {/* Ride Details Summary Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-base text-slate-900">Trip Summary</h3>
                <span className="text-xs font-bold text-[#0ea5e9]">
                  {pickupDate} • {pickupTime}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  alt={selectedCar?.title}
                  src={selectedCar?.image}
                  className="w-20 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    {selectedCar?.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-['JetBrains_Mono',monospace]">
                    {selectedCar?.model} • Chilled Dual AC
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">trip_origin</span>
                  <div>
                    <strong className="text-slate-900">From:</strong> {pickupLocation} ({pickupLandmark})
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-rose-600 shrink-0 mt-0.5">location_on</span>
                  <div>
                    <strong className="text-slate-900">To:</strong> {dropLocation} ({dropLandmark})
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Passenger:</strong> {passengerName} (+91 {passengerPhone})
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown Table */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-2">
                Fare Breakdown
              </h3>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Base Fare ({selectedCar?.title}):</span>
                <span className="font-bold text-slate-900 font-['JetBrains_Mono',monospace]">
                  ₹{baseFare.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Expressway Tolls &amp; Taxes:</span>
                <span className="font-bold text-emerald-600 font-['JetBrains_Mono',monospace]">
                  INCLUDED (₹0)
                </span>
              </div>
              {shieldActive && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>RouTripo Cab Shield:</span>
                  <span className="font-bold text-slate-900 font-['JetBrains_Mono',monospace]">
                    ₹49
                  </span>
                </div>
              )}
              {tipAmount > 0 && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Driver Appreciation Tip:</span>
                  <span className="font-bold text-slate-900 font-['JetBrains_Mono',monospace]">
                    ₹{tipAmount}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-extrabold text-sm text-slate-900">Total Payable</span>
                <span className="font-extrabold text-xl text-[#006591] font-['JetBrains_Mono',monospace]">
                  ₹{totalPayable.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Safety & Cancellation Promise */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-emerald-900 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Zero Surge Guarantee:</strong> Pre-booked price remains 100% locked with free cancellation up to 1 hour before pickup.
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5: RIDE OTP & DRIVER HANDSHAKE (routripo_cab_step_5)     */}
        {/* ============================================================ */}
        {step === 5 && (
          <div className="space-y-4">
            {/* Top Arrival Status Banner */}
            <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">near_me</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <h3 className="font-extrabold text-sm text-emerald-950 truncate">
                    Driver Arrived at Pickup
                  </h3>
                </div>
                <p className="text-xs text-emerald-800 truncate">
                  Parked near {pickupLandmark} • 2 min wait
                </p>
              </div>
              <span className="bg-white text-emerald-700 font-['JetBrains_Mono',monospace] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                HERE NOW
              </span>
            </div>

            {/* Ride Start PIN / OTP Security Card */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 space-y-3 text-center">
              <div className="flex items-center justify-between text-left">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#006591]" />
                  <span className="text-[11px] font-bold font-['JetBrains_Mono',monospace] text-slate-500 uppercase tracking-wider">
                    RIDE START PIN
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>SOS &amp; GPS ACTIVE</span>
                </div>
              </div>

              {/* 4-Digit Box Layout */}
              <div className="flex items-center justify-center gap-3 py-2">
                {(bookingResponse?.rideOtp || "4829").split("").map((digit: string, i: number) => (
                  <div
                    key={i}
                    className="w-12 h-14 bg-slate-100 rounded-xl flex items-center justify-center font-['JetBrains_Mono',monospace] text-[#006591] text-2xl font-black shadow-inner border border-slate-200"
                  >
                    {digit}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 text-left">
                <span className="text-xs text-slate-500 truncate flex-1">
                  Share with chauffeur only after sitting inside vehicle
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(bookingResponse?.rideOtp || "4829");
                    setCopiedOtp(true);
                    setTimeout(() => setCopiedOtp(false), 2000);
                  }}
                  className="text-xs font-bold text-[#0ea5e9] hover:underline px-2 cursor-pointer font-['JetBrains_Mono',monospace]"
                >
                  {copiedOtp ? "COPIED!" : "COPY"}
                </button>
              </div>
            </div>

            {/* Assigned Driver & Vehicle Details Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <img
                    alt="Driver Profile"
                    src={bookingResponse?.driver?.photo || STITCH_CABS[0].image}
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-slate-900 truncate">
                      {bookingResponse?.driver?.name || "Rajesh Shinde"}
                    </h3>
                    <span className="bg-amber-100 text-amber-900 font-['JetBrains_Mono',monospace] text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      ★ {bookingResponse?.driver?.rating || 4.9}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {bookingResponse?.driver?.tripsCount || 1420} completed rides • English &amp; Marathi
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="bg-slate-900 text-white font-['JetBrains_Mono',monospace] text-xs font-black px-2 py-0.5 rounded-md">
                      {bookingResponse?.driver?.plateNumber || "MH 01 CR 4829"}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold truncate">
                      {bookingResponse?.driver?.vehicleModel || selectedCar?.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <a
                  href={`tel:${bookingResponse?.driver?.phone || "9820144556"}`}
                  className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Call Chauffeur</span>
                </a>
                <button
                  type="button"
                  onClick={() => alert(`Message sent to driver via in-app channel`)}
                  className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#0ea5e9]" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>

            {/* Safety & Share Links */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Live tracking link copied to clipboard!");
                }}
                className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-slate-50 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#0ea5e9]" />
                <span>Share Live Trip</span>
              </button>

              <button
                type="button"
                onClick={() => alert("Emergency SOS connected to 112 & Tourist Police")}
                className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-rose-100 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Emergency SOS</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* FIXED BOTTOM ACTION BAR                                      */}
      {/* ============================================================ */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          {/* Price Preview */}
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold font-['JetBrains_Mono',monospace] text-slate-400 uppercase">
              {step === 5 ? "TOTAL PAID" : "ESTIMATED TOTAL"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-['JetBrains_Mono',monospace]">
                ₹{totalPayable.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold truncate">
              Tolls &amp; GST included
            </span>
          </div>

          {/* Forward Action Buttons */}
          <div className="flex items-center gap-2">
            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(14,165,233,0.35)] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(14,165,233,0.35)] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <span>Add-ons</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(14,165,233,0.35)] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <span>Review &amp; Pay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Pay ₹{totalPayable.toLocaleString("en-IN")}</span>
              </button>
            )}

            {step === 5 && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-sm shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <span>Done</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Razorpay Payment Modal */}
      {isPaymentModalOpen && (
        <RazorpayPaymentModal
          isOpen={isPaymentModalOpen}
          amount={totalPayable}
          title={`Cab Booking — ${selectedCar?.title}`}
          description={`One-Way Cab: ${pickupLocation.split(",")[0]} to ${dropLocation.split("/")[0]}`}
          onSuccess={handlePaymentSuccess}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}
    </div>
  );
};
