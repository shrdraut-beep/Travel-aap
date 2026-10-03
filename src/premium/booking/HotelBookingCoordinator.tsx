import React, { useState, useEffect } from "react";
import {
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Users,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Check,
  Plus,
  Minus,
  Sparkles,
  Edit2,
  Phone,
  Mail,
  Receipt
} from "lucide-react";
import { RazorpayPaymentModal } from "./RazorpayPaymentModal";

export interface HotelSearchParams {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  rooms: number;
}

export interface HotelBookingCoordinatorProps {
  initialSearchParams: HotelSearchParams;
  onClose: () => void;
  initialStep?: "results" | "rooms" | "guests" | "addons" | "checkout";
  preselectedHotel?: any;
}

export const HotelBookingCoordinator: React.FC<HotelBookingCoordinatorProps> = ({
  initialSearchParams,
  onClose,
  initialStep = "results",
  preselectedHotel = null
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState<"results" | "rooms" | "guests" | "addons" | "checkout">(
    preselectedHotel ? "rooms" : initialStep
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [step]);

  const [hotels, setHotels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(preselectedHotel);

  // Step 1: Room Selection
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [roomFilter, setRoomFilter] = useState<string>("all");

  // Step 2: Guest Details
  const [salutation, setSalutation] = useState<string>("Mr");
  const [firstName, setFirstName] = useState("Rohan");
  const [lastName, setLastName] = useState("Deshmukh");
  const [primaryPhone, setPrimaryPhone] = useState("+91 98765 43210");
  const [primaryEmail, setPrimaryEmail] = useState("rohan.deshmukh@example.com");
  const [whatsAppUpdates, setWhatsAppUpdates] = useState(true);
  const [selectedSpecialRequests, setSelectedSpecialRequests] = useState<string[]>(["High Floor", "Quiet Room"]);
  const [specialRequestText, setSpecialRequestText] = useState("");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [gstCompanyName, setGstCompanyName] = useState("");

  // Step 3: Hotel Add-ons & Meal Plans
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [wellnessExperiences, setWellnessExperiences] = useState<any[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({
    meal_combo: false,
    meal_chef: false,
    exp_spa: false,
    exp_dinner: false
  });

  // Step 4: Review & Payment
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<any | null>(null);

  // Calculate nights
  const nights = React.useMemo(() => {
    try {
      const d1 = new Date(initialSearchParams.checkInDate).getTime();
      const d2 = new Date(initialSearchParams.checkOutDate).getTime();
      const diff = Math.round((d2 - d1) / (1000 * 3600 * 24));
      return diff > 0 ? diff : 3;
    } catch {
      return 3;
    }
  }, [initialSearchParams.checkInDate, initialSearchParams.checkOutDate]);

  // 1. Fetch Hotels List
  useEffect(() => {
    if (preselectedHotel) return;
    const fetchHotels = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/hotels/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initialSearchParams)
        });
        const data = await res.json();
        if (data.success && (data.results || data.hotels)) {
          setHotels(data.results || data.hotels);
        }
      } catch (err) {
        console.warn("Failed to fetch hotels:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHotels();
  }, [initialSearchParams, preselectedHotel]);

  // 2. Fetch Rooms for Selected Hotel
  useEffect(() => {
    if (!selectedHotel) return;
    const fetchRooms = async () => {
      try {
        const res = await fetch(`/api/hotels/rooms?propertyId=${selectedHotel.id}&nights=${nights}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.rooms) && data.rooms.length > 0) {
          setRoomsList(data.rooms);
          setSelectedRoom(data.rooms[0]);
        }
      } catch (err) {
        console.warn("Failed to fetch rooms:", err);
      }
    };

    fetchRooms();
  }, [selectedHotel, nights]);

  // 3. Fetch Add-ons & Meal Plans
  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const res = await fetch("/api/hotels/addons");
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.mealPlans)) setMealPlans(data.mealPlans);
          if (Array.isArray(data.wellnessExperiences)) setWellnessExperiences(data.wellnessExperiences);
        }
      } catch (err) {
        console.warn("Failed to fetch hotel addons:", err);
      }
    };
    fetchAddons();
  }, []);

  // Pricing calculations
  const guestsCount = initialSearchParams.adults || 2;
  const baseRoomTotal = selectedRoom ? selectedRoom.totalPrice || selectedRoom.pricePerNight * nights : 24500;

  const mealAddonsTotal = React.useMemo(() => {
    let sum = 0;
    if (selectedAddons.meal_combo) sum += 1800 * guestsCount * nights;
    if (selectedAddons.meal_chef) sum += 3200 * guestsCount * nights;
    if (selectedAddons.exp_spa) sum += 4500;
    if (selectedAddons.exp_dinner) sum += 6500;
    return sum;
  }, [selectedAddons, guestsCount, nights]);

  const taxesGst = Math.round((baseRoomTotal + mealAddonsTotal) * 0.12);
  const stayShieldFee = 398;
  const grandTotal = baseRoomTotal + mealAddonsTotal + taxesGst + stayShieldFee;

  const handleExecutePayment = async (paymentDetails: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string }) => {
    try {
      const res = await fetch("/api/hotels/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedHotel?.id || "htl_grand_hyatt",
          propertyName: selectedHotel?.name || "Grand Hyatt Resort & Spa, Goa",
          roomId: selectedRoom?.id || "rm_deluxe_sea",
          roomName: selectedRoom?.name || "Deluxe Sea View King Room",
          checkInDate: initialSearchParams.checkInDate,
          checkOutDate: initialSearchParams.checkOutDate,
          nights,
          roomsCount: initialSearchParams.rooms || 1,
          leadGuest: {
            name: `${salutation}. ${firstName} ${lastName}`.trim(),
            phone: primaryPhone,
            email: primaryEmail
          },
          specialRequests: selectedSpecialRequests,
          gst: gstEnabled ? { gstNumber, gstCompanyName } : null,
          addons: selectedAddons,
          totalAmount: grandTotal,
          payment: {
            paymentId: paymentDetails.razorpay_payment_id,
            orderId: paymentDetails.razorpay_order_id,
            signature: paymentDetails.razorpay_signature,
            method: "razorpay"
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setBookingConfirmation(data);
        setIsPaid(true);
      } else {
        console.error("Booking API error:", data.error);
        alert("Booking confirmation failed after payment. Please contact support with your payment ID: " + paymentDetails.razorpay_payment_id);
      }
    } catch (err) {
      console.error("Booking submission error:", err);
      alert("Network error during booking confirmation. Please contact support.");
    }
  };


  // Header component with 4-step progress tracker
  const renderHeader = (stepNum: number, stepTitle: string, progressPct: string) => (
    <header className="fixed top-0 w-full z-50 pt-safe bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] text-[#0F172A] rounded-b-[24px] border-b border-sky-200/80 shadow-[0_4px_20px_rgba(2,132,199,0.08)] backdrop-blur-xl">
      <div className="px-4 py-2 flex flex-col justify-between max-w-lg mx-auto">
        <div className="flex items-center justify-between w-full">
          <button
            aria-label="Go Back"
            onClick={() => {
              if (step === "results") onClose();
              else if (step === "rooms") setStep("results");
              else if (step === "guests") setStep("rooms");
              else if (step === "addons") setStep("guests");
              else if (step === "checkout") setStep("addons");
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all text-slate-700 shadow-xs border border-sky-200/80 shrink-0 cursor-pointer active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          </button>

          <div className="flex flex-col items-center text-center px-2 flex-1 min-w-0">
            <h1 className="font-bold text-xs sm:text-sm text-[#0F172A] truncate max-w-[240px] leading-tight">
              {selectedHotel?.name || "Grand Hyatt Resort & Spa, Goa"}
            </h1>
            <span className="text-[10px] text-[#0369a1] font-semibold truncate max-w-[260px] leading-none mt-0.5">
              {initialSearchParams.checkInDate}–{initialSearchParams.checkOutDate} • {nights}N/{nights + 1}D • {guestsCount} Guests
            </span>
          </div>

          <button
            aria-label="Close"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all text-slate-700 shadow-xs border border-sky-200/80 shrink-0 cursor-pointer active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-1 w-full mt-1">
          <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono',monospace] text-white font-bold">
            <span className="tracking-wider uppercase">
              STEP {stepNum} OF 4: {stepTitle}
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[12px]">timer</span> 14:45 left
            </span>
          </div>
          <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-sky-600 h-full rounded-full transition-all duration-300"
              style={{ width: progressPct }}
            ></div>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#F8FAFC] text-[#171c20] font-['Outfit',sans-serif] antialiased flex flex-col overflow-y-auto"
    >
      {/* ============================================================== */}
      {/* STEP 0: RESULTS SELECTION (If not directly on a hotel)         */}
      {/* ============================================================== */}
      {step === "results" && (
        <div className="min-h-screen bg-[#f6faff] flex flex-col">
          <header className="fixed top-0 w-full z-50 pt-safe bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] backdrop-blur-xl rounded-b-[24px] shadow-[0_4px_20px_rgba(2,132,199,0.08)] border-b border-sky-200/80">
            <div className="h-20 px-4 flex items-center justify-between gap-2 max-w-4xl mx-auto">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-xs border border-sky-200/80 flex items-center justify-center text-[#0F172A] hover:bg-[#eaeef4] active:scale-95 transition-all shrink-0 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>

              <div className="flex flex-col items-center justify-center text-center flex-1 min-w-0 px-2">
                <div className="flex items-center justify-center gap-1.5 truncate max-w-full">
                  <span className="font-bold text-[16px] text-[#0F172A] truncate">
                    {initialSearchParams.destination}
                  </span>
                  <span className="material-symbols-outlined text-[#006591] text-[16px] shrink-0 font-bold">arrow_forward</span>
                  <span className="font-bold text-[16px] text-[#006591] truncate">Stays & Resorts</span>
                </div>
                <span className="text-[11px] font-medium text-[#475569] font-['JetBrains_Mono',monospace] truncate mt-0.5">
                  {initialSearchParams.checkInDate} – {initialSearchParams.checkOutDate} • {guestsCount} Guests
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-xs border border-sky-200/80 flex items-center justify-center text-[#006591] shrink-0 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </header>

          <main className="flex-1 w-full pt-24 pb-28 px-4 max-w-4xl mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-['JetBrains_Mono',monospace] text-slate-500 font-bold">
                AVAILABLE PROPERTIES ({hotels.length})
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-3">
                <Sparkles className="w-8 h-8 text-[#0ea5e9] animate-spin" />
                <p className="text-slate-500 font-semibold text-sm">Searching verified resort & stay inventory...</p>
              </div>
            ) : (
              hotels.map((hotel, idx) => (
                <article
                  key={hotel.id || idx}
                  onClick={() => {
                    setSelectedHotel(hotel);
                    setStep("rooms");
                  }}
                  className="flex flex-col bg-white rounded-2xl shadow-[0_4px_18px_rgba(0,101,145,0.08)] overflow-hidden transition-all hover:shadow-lg active:scale-[0.99] cursor-pointer border border-slate-100"
                >
                  <div className="relative w-full h-48 sm:h-52 overflow-hidden">
                    <img
                      alt={hotel.name}
                      src={hotel.image || hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/75 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-[#de8712] text-white px-2.5 py-1 rounded-full font-['JetBrains_Mono',monospace] text-[11px] font-bold tracking-wide uppercase shadow-sm">
                        {hotel.tag || "Bestseller"}
                      </span>
                      <span className="bg-white/90 backdrop-blur-md text-[#006591] font-['JetBrains_Mono',monospace] text-[11px] px-2 py-1 rounded-full font-semibold">
                        5-Star Luxury
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#6ffbbe] text-[16px]">location_on</span>
                        <span className="text-[13px] font-medium drop-shadow-sm truncate max-w-[200px]">
                          {hotel.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md text-[#0F172A] px-2 py-0.5 rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-[#de8712] text-[15px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                          star
                        </span>
                        <span className="font-['JetBrains_Mono',monospace] text-xs font-bold">{hotel.rating || 4.8}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <h2 className="text-base sm:text-lg font-bold text-[#0F172A] leading-snug">{hotel.name}</h2>

                    <div className="pt-2 flex items-end justify-between border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-['JetBrains_Mono',monospace] text-slate-400">Per night incl. taxes</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-[#0F172A]">
                            ₹{(hotel.pricePerNight || 8500).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <button
                        className="px-5 py-2.5 rounded-xl bg-[#0ea5e9] text-white text-xs sm:text-sm font-bold shadow-[0_3px_12px_rgba(14,165,233,0.35)] hover:bg-[#0284c7] transition-all flex items-center gap-1 cursor-pointer"
                        type="button"
                      >
                        <span>Select Rooms</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </main>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 1: ROOM SELECTION                                         */}
      {/* ============================================================== */}
      {step === "rooms" && (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
          {renderHeader(1, "ROOM SELECTION", "25%")}

          <main className="flex flex-col relative w-full pb-32 px-4 bg-[#F8FAFC] min-h-screen pt-24 max-w-lg mx-auto">
            <div className="flex flex-col w-full gap-3">
              {/* SafeStay Guarantee Pill */}
              <section className="flex items-center justify-between px-3.5 py-2.5 bg-[#f0f4fa] rounded-xl shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[#006c49] text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified_user
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-slate-900 truncate">RouTripo SafeStay Guarantee</span>
                    <span className="text-[11px] text-slate-500 truncate">Verified 5-Star Luxury Resort • Instant Confirmation</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 bg-[#6cf8bb]/30 px-2 py-0.5 rounded-full text-[#00714d] text-xs font-bold font-mono">
                  5.0 Stars
                </div>
              </section>

              {/* Filter / Sort Quick Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 font-['JetBrains_Mono',monospace]">
                <button
                  type="button"
                  onClick={() => setRoomFilter("all")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer ${
                    roomFilter === "all" ? "bg-[#c9e6ff] text-[#004c6e] font-bold" : "bg-[#f0f4fa] text-slate-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">tune</span>
                  <span>All Rooms ({roomsList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoomFilter("seaview")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer ${
                    roomFilter === "seaview" ? "bg-[#c9e6ff] text-[#004c6e] font-bold" : "bg-[#f0f4fa] text-slate-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">waves</span>
                  <span>Sea View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoomFilter("pool")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer ${
                    roomFilter === "pool" ? "bg-[#c9e6ff] text-[#004c6e] font-bold" : "bg-[#f0f4fa] text-slate-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">pool</span>
                  <span>Private Pool</span>
                </button>
              </div>

              {/* Rooms List */}
              {roomsList.map((room) => {
                const isSelected = selectedRoom?.id === room.id;

                return (
                  <article
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs transition-all border cursor-pointer ${
                      isSelected ? "border-[#0ea5e9] shadow-[0_8px_24px_rgba(14,165,233,0.15)] ring-2 ring-sky-200" : "border-slate-200 hover:border-sky-200"
                    }`}
                  >
                    <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                      <img alt={room.name} src={room.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20" />

                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wide shadow-xs ${room.tagBg}`}>
                          <span className="material-symbols-outlined text-[13px]">bolt</span> {room.tag}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-slate-900 font-mono text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[13px] text-[#006591]">photo_camera</span> {room.photosCount} Photos
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between text-white">
                        <div>
                          <h2 className="text-base font-bold text-white drop-shadow-sm">{room.name}</h2>
                          <p className="text-xs text-white/90 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px]">landscape</span> {room.view}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col p-3.5 gap-2.5">
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap text-xs font-mono text-slate-600">
                        <span className="inline-flex items-center gap-1 text-[#006591]">
                          <span className="material-symbols-outlined text-[14px]">king_bed</span> {room.bed}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-[#006c49]">
                          <span className="material-symbols-outlined text-[14px]">restaurant</span> Free Breakfast
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-rose-600">
                          <span className="material-symbols-outlined text-[14px]">priority_high</span> {room.roomsLeft} Left
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 py-1 text-xs text-slate-600">
                        {(room.inclusions || []).slice(0, 4).map((inc: any, iIdx: number) => (
                          <div key={iIdx} className="flex items-center gap-1.5 truncate">
                            <span className="material-symbols-outlined text-[15px] text-[#006c49]">
                              {inc.icon || "check"}
                            </span>
                            <span className="truncate">{inc.name}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-slate-900 leading-tight">
                            Total ₹{(room.totalPrice || room.pricePerNight * nights).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            for {nights}N/{nights + 1}D (Includes all taxes)
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`h-10 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#0ea5e9] text-white shadow-md"
                              : "bg-[#f0f4fa] text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isSelected ? "check" : "radio_button_unchecked"}
                          </span>
                          <span>{isSelected ? "Selected" : "Select Room"}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </main>

          <footer className="fixed bottom-0 w-full z-50 pb-safe bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-slate-100">
            <div className="h-16 px-4 flex items-center justify-between gap-3 max-w-lg mx-auto">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Total Payable</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  ₹{baseRoomTotal.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  {nights}N/{nights + 1}D • {guestsCount} Guests (Incl. taxes)
                </span>
              </div>

              <button
                disabled={!selectedRoom}
                onClick={() => setStep("guests")}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl py-3 px-5 text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(14,165,233,0.3)] active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span>Continue to Guest Details</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: GUEST DETAILS                                          */}
      {/* ============================================================== */}
      {step === "guests" && (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
          {renderHeader(2, "GUEST DETAILS", "50%")}

          <main className="flex flex-col relative w-full pb-28 px-4 bg-[#F8FAFC] pt-24 max-w-lg mx-auto">
            <div className="flex flex-col w-full gap-3">
              {/* Selected Stay Recap */}
              <section className="bg-white rounded-xl p-3 shadow-xs flex flex-col gap-1.5 border border-slate-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[#0ea5e9] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">hotel</span>SELECTED STAY
                      </span>
                      <span className="text-slate-400 text-[10px]">•</span>
                      <span className="text-emerald-700 font-mono text-[10px] font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>Confirmed
                      </span>
                    </div>
                    <h2 className="font-bold text-sm text-slate-900 leading-tight truncate">
                      {selectedRoom?.name || "Deluxe Sea View King Room"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      {nights}N/{nights + 1}D • {guestsCount} Guests • {selectedRoom?.bed || "1 King Bed"}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                    <img
                      alt="Room"
                      src={selectedRoom?.image}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </section>

              {/* Primary Guest Form */}
              <section className="bg-white rounded-xl p-3.5 shadow-xs flex flex-col gap-3 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-bold text-xs font-mono">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Adult 1 (Primary)</h3>
                      <p className="text-[10px] text-slate-400">Lead Guest (Booking & Check-in)</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono font-medium">Adult (18+)</span>
                </div>

                {/* Salutation */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Salutation</label>
                  <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-1">
                    {["Mr", "Mrs", "Ms"].map((sal) => (
                      <button
                        key={sal}
                        type="button"
                        onClick={() => setSalutation(sal)}
                        className={`py-1 px-3 text-center text-xs font-bold transition-all cursor-pointer ${
                          salutation === sal
                            ? "text-[#0ea5e9] border-b-2 border-[#0ea5e9]"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {salutation === sal ? `• ${sal}.` : `${sal}.`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Names */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="border-b border-slate-200 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#0ea5e9]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="border-b border-slate-200 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#0ea5e9]"
                    />
                  </div>
                </div>

                {/* Contact info */}
                <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006c49] text-[16px]">call</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400">Primary Phone</span>
                        <input
                          type="text"
                          value={primaryPhone}
                          onChange={(e) => setPrimaryPhone(e.target.value)}
                          className="text-xs text-slate-900 font-medium focus:outline-none bg-transparent"
                        />
                      </div>
                    </div>
                    <span className="text-[11px] text-[#006c49] font-bold font-mono">Verified</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#0ea5e9] text-[16px]">mail</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400">E-mail for Vouchers</span>
                        <input
                          type="email"
                          value={primaryEmail}
                          onChange={(e) => setPrimaryEmail(e.target.value)}
                          className="text-xs text-slate-900 font-medium focus:outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp updates */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[#006c49] text-[18px]">chat</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-slate-900 font-bold">Send Booking Updates on WhatsApp</span>
                        <span className="text-[10px] text-slate-500">Instant confirmation card & web check-in guide</span>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={whatsAppUpdates}
                        onChange={(e) => setWhatsAppUpdates(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Special Requests */}
              <section className="bg-white rounded-xl p-3.5 shadow-xs flex flex-col gap-2 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">Special Requests (Optional)</h3>
                    <p className="text-[10px] text-slate-400">Subject to hotel availability at check-in</p>
                  </div>
                  <span className="material-symbols-outlined text-[#0ea5e9] text-[18px]">room_service</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1 no-scrollbar">
                  {["Smoking Room", "High Floor", "Quiet Room", "Late Check-out"].map((req) => {
                    const isSelected = selectedSpecialRequests.includes(req);
                    return (
                      <button
                        key={req}
                        type="button"
                        onClick={() => {
                          setSelectedSpecialRequests((prev) =>
                            isSelected ? prev.filter((r) => r !== req) : [...prev, req]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#0ea5e9] text-white font-bold"
                            : "bg-[#f0f4fa] text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {isSelected && <span className="material-symbols-outlined text-[13px]">check</span>}
                        <span>{req}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-b border-slate-200 py-1 flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">edit_note</span>
                  <input
                    type="text"
                    value={specialRequestText}
                    onChange={(e) => setSpecialRequestText(e.target.value)}
                    placeholder="Enter special request for resort reception..."
                    className="w-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </section>

              {/* GST Details */}
              <section className="bg-white rounded-xl p-3.5 shadow-xs flex flex-col gap-2 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-[18px]">receipt_long</span>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900">GST Details for Business (Optional)</h3>
                      <p className="text-[10px] text-slate-400">Claim input tax credit on hotel invoices</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={gstEnabled}
                      onChange={(e) => setGstEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {gstEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold">GST Number</label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        placeholder="27AADCR9876K1Z9"
                        className="border-b border-slate-200 py-1 text-xs font-mono uppercase text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold">Company Name</label>
                      <input
                        type="text"
                        value={gstCompanyName}
                        onChange={(e) => setGstCompanyName(e.target.value)}
                        placeholder="Tripo Tech India LLP"
                        className="border-b border-slate-200 py-1 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </section>
            </div>
          </main>

          <footer className="fixed bottom-0 w-full z-50 pb-safe bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-slate-100">
            <div className="h-16 px-4 flex items-center justify-between gap-3 max-w-lg mx-auto">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Total Payable</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  ₹{baseRoomTotal.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                onClick={() => setStep("addons")}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl py-3 px-5 text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(14,165,233,0.3)] active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span>Continue to Add-ons</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: HOTEL ADD-ONS & MEAL PLANS                             */}
      {/* ============================================================== */}
      {step === "addons" && (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
          {renderHeader(3, "HOTEL ADD-ONS & MEALS", "75%")}

          <main className="flex flex-col relative w-full pb-32 px-4 bg-[#F8FAFC] min-h-screen pt-24 max-w-lg mx-auto">
            <div className="flex flex-col w-full gap-3">
              {/* Confirmed Room Specs Pill */}
              <section className="w-full bg-white rounded-xl p-3 shadow-xs flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#f0f4fa] flex items-center justify-center shrink-0 text-[#006591]">
                    <span className="material-symbols-outlined text-[20px]">hotel</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {selectedRoom?.name || "Deluxe Sea View King"}
                      </span>
                      <span className="text-[#006c49] font-mono text-[10px] font-bold">Confirmed</span>
                    </div>
                    <span className="text-[11px] text-slate-500 truncate">
                      {nights}N/{nights + 1}D • {guestsCount} Guests • Free High-Speed Wi-Fi
                    </span>
                  </div>
                </div>
              </section>

              {/* Concession Notice */}
              <div className="w-full rounded-xl bg-[#f0f4fa] p-2.5 px-3 flex items-center gap-2 text-xs text-slate-600">
                <span className="material-symbols-outlined text-[#de8712] text-[18px]">verified_user</span>
                <span>Lock special online concession rates up to 35% off before checking in.</span>
              </div>

              {/* Meal Plans Section */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-[18px]">restaurant</span>
                    <h2 className="font-bold text-sm text-slate-900">Meal Plans & Dining</h2>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Optional upgrades</span>
                </div>

                {mealPlans.map((plan) => {
                  const isAdded = Boolean(selectedAddons[plan.id]);
                  return (
                    <article
                      key={plan.id}
                      className={`w-full bg-white rounded-xl p-3 shadow-xs flex flex-col gap-2 border transition-all ${
                        isAdded ? "border-[#0ea5e9] ring-2 ring-sky-200" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img alt={plan.title} src={plan.image} className="w-18 h-18 rounded-lg object-cover shrink-0" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <h3 className="font-bold text-xs text-slate-900 truncate">{plan.title}</h3>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="font-bold text-sm text-slate-900 font-mono">₹{plan.pricePerDayPerGuest}</span>
                            <span className="text-[10px] text-slate-400">/ day per guest</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{plan.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500">{plan.inclusions}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAddons((prev) => ({
                              ...prev,
                              [plan.id]: !prev[plan.id]
                            }))
                          }
                          className={`h-8 px-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer ${
                            isAdded
                              ? "bg-[#0ea5e9] text-white shadow-xs"
                              : "bg-[#f0f4fa] text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isAdded ? "check" : "add"}
                          </span>
                          <span>{isAdded ? "Added" : "Add Plan"}</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Wellness & Experiences */}
              <div className="flex flex-col gap-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-[18px]">spa</span>
                    <h2 className="font-bold text-sm text-slate-900">Wellness & Experiences</h2>
                  </div>
                </div>

                {wellnessExperiences.map((exp) => {
                  const isAdded = Boolean(selectedAddons[exp.id]);
                  return (
                    <article
                      key={exp.id}
                      className={`w-full bg-white rounded-xl p-3 shadow-xs flex flex-col gap-2 border transition-all ${
                        isAdded ? "border-[#0ea5e9] ring-2 ring-sky-200" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img alt={exp.title} src={exp.image} className="w-18 h-18 rounded-lg object-cover shrink-0" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <h3 className="font-bold text-xs text-slate-900 truncate">{exp.title}</h3>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="font-bold text-sm text-slate-900 font-mono">₹{exp.price}</span>
                            <span className="text-[10px] text-slate-400">({exp.duration})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{exp.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500">Concierge reservation</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAddons((prev) => ({
                              ...prev,
                              [exp.id]: !prev[exp.id]
                            }))
                          }
                          className={`h-8 px-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer ${
                            isAdded
                              ? "bg-[#0ea5e9] text-white shadow-xs"
                              : "bg-[#f0f4fa] text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isAdded ? "check" : "add"}
                          </span>
                          <span>{isAdded ? "Added" : "Add Experience"}</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </main>

          <footer className="fixed bottom-0 w-full z-50 pb-safe bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-slate-100">
            <div className="h-16 px-4 flex items-center justify-between gap-3 max-w-lg mx-auto">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Total Payable</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  ₹{(baseRoomTotal + mealAddonsTotal).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  Add-ons: ₹{mealAddonsTotal}
                </span>
              </div>

              <button
                onClick={() => setStep("checkout")}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl py-3 px-5 text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(14,165,233,0.3)] active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span>Continue to Review & Pay</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: HOTEL REVIEW & PAYMENT                                 */}
      {/* ============================================================== */}
      {step === "checkout" && (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
          {renderHeader(4, "HOTEL REVIEW & PAYMENT", "100%")}

          <main className="flex flex-col relative w-full pb-32 px-4 bg-[#F8FAFC] min-h-screen pt-24 max-w-lg mx-auto">
            <div className="flex flex-col w-full gap-3">
              {/* Hotel Summary Showcase Card */}
              <div className="w-full bg-white rounded-xl overflow-hidden shadow-xs border border-slate-100 flex flex-col">
                <div className="relative w-full h-44 overflow-hidden">
                  <img
                    alt="Resort"
                    src={selectedHotel?.image || selectedRoom?.image}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[#de8712]">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                      star
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono">5-Star Luxury Resort</span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex flex-col text-white">
                    <h2 className="text-base font-bold leading-tight drop-shadow-sm">
                      {selectedHotel?.name || "Grand Hyatt Resort & Spa, Goa"}
                    </h2>
                    <p className="text-xs text-white/90 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#89ceff]">location_on</span>
                      {selectedHotel?.location || "Bambolim Beach, North Goa"}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#c9e6ff] flex items-center justify-center text-[#004c6e]">
                        <span className="material-symbols-outlined text-[16px]">king_bed</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">{selectedRoom?.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {nights} Nights • 1 Room • {guestsCount} Guests
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 font-mono text-[10px] text-[#006c49] font-bold">
                      Confirmed
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#f0f4fa] text-xs text-slate-600">
                    <span className="material-symbols-outlined text-[16px] text-[#0ea5e9]">group</span>
                    <span>
                      Lead Guest: <strong className="font-bold text-slate-900">{salutation}. {firstName} {lastName}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Check-in & Check-out Balanced Cards */}
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-[#006c49] mb-1">
                    <span className="material-symbols-outlined text-[16px]">flight_land</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">CHECK-IN</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5">{initialSearchParams.checkInDate}</span>
                  <span className="text-[10px] text-slate-500 font-mono">From 2:00 PM</span>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-[#de8712] mb-1">
                    <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">CHECK-OUT</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5">{initialSearchParams.checkOutDate}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Until 11:00 AM</span>
                </div>
              </div>

              {/* Risk-Free Cancellation Banner */}
              <div className="w-full bg-[#6cf8bb]/15 border border-[#6cf8bb]/40 p-3 rounded-xl flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#6cf8bb]/30 text-[#00714d] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[#00714d]">
                    Risk-Free Cancellation • FastSettle™
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Cancel without penalty with 100% instant refund straight to your original payment mode.
                  </p>
                </div>
              </div>

              {/* Fare Breakdown Card */}
              <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0ea5e9] text-[16px]">receipt_long</span>
                    Fare Breakdown
                  </h3>
                  <span className="text-[10px] text-[#00714d] font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded-full">
                    Guaranteed Final
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Base Room ({nights} Nights)</span>
                    <span className="font-mono font-bold text-slate-900">₹{baseRoomTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {mealAddonsTotal > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Dining & Wellness Add-ons</span>
                      <span className="font-mono font-bold text-slate-900">₹{mealAddonsTotal.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Taxes & GST (12%)</span>
                    <span className="font-mono font-bold text-slate-900">₹{taxesGst.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>StayShield™ Escrow Protection</span>
                    <span className="font-mono font-bold text-slate-900">₹{stayShieldFee}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Grand Total</span>
                    <span className="text-[10px] text-emerald-700">All taxes included</span>
                  </div>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Escrow Guarantee */}
              <div className="w-full bg-[#f0f4fa] rounded-xl p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-[#006591] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">RouTripo SafeStay™ Escrow Guarantee</span>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Payment remains in 100% RBI-regulated nodal escrow account until check-in is complete.
                  </p>
                </div>
              </div>

              {/* Booking Success Card */}
              {isPaid && bookingConfirmation && (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-md flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                      
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-emerald-900">Reservation Confirmed!</h4>
                      <p className="text-[11px] text-emerald-700 font-mono">
                        Voucher PNR: {bookingConfirmation.pnr || bookingConfirmation.confirmationNumber}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Your digital check-in voucher has been generated and dispatched to {primaryPhone} and {primaryEmail}.
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`Downloading Hotel Voucher PDF: ${bookingConfirmation.pnr}`)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Voucher PDF
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
            <footer className="fixed bottom-0 w-full z-50 pb-safe bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
              <div className="h-16 px-4 flex items-center justify-between gap-3 max-w-lg mx-auto">
                <div className="flex flex-col justify-center shrink-0">
                  <span className="text-[9px] text-slate-400 uppercase font-bold font-mono">TOTAL PAYABLE</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {nights}N/{nights + 1}D • All taxes included
                  </span>
                </div>

                <button
                  onClick={() => setIsRazorpayOpen(true)}
                  className="flex-1 h-11 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(14,165,233,0.3)] active:scale-95 transition-all cursor-pointer px-4"
                  type="button"
                >
                  <Lock className="w-4 h-4" />
                  <span className="truncate">Proceed to Secure Pay</span>
                </button>
              </div>
            </footer>
          )}

          {/* Razorpay Payment Modal */}
          {isRazorpayOpen && (
            <RazorpayPaymentModal
              isOpen={isRazorpayOpen}
              amount={grandTotal}
              title={`Hotel Reservation • ${selectedHotel?.name || "Resort"}`}
              description={`${selectedRoom?.name || "Room"} (${nights} Nights) for ${firstName} ${lastName}`}
              customerName={`${firstName} ${lastName}`}
              customerEmail={primaryEmail}
              customerPhone={primaryPhone}
              onSuccess={(details) => {
                setIsRazorpayOpen(false);
                handleExecutePayment(details);
              }}
              onClose={() => setIsRazorpayOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};
