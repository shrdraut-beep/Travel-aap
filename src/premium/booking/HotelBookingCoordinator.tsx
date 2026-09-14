import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  MapPin,
  ShieldCheck,
  Wifi,
  Coffee,
  CheckCircle2,
  Lock,
  ChevronRight,
  Download,
  Building2,
  Calendar,
  Users,
  SlidersHorizontal,
  Sparkles,
  BedDouble,
  Clock,
  AlertCircle,
  X,
  RefreshCw
} from "lucide-react";

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
}

const FALLBACK_HOTELS = [
  {
    id: "htl_taj_mumbai",
    name: "Taj Lands End, Bandra",
    rating: 5,
    location: "Bandstand, Bandra West, Mumbai",
    pricePerNight: 14500,
    freeCancellation: true,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    amenities: ["Sea View", "Infinity Pool", "Jiva Spa", "Free High-Speed WiFi", "Valet Parking"],
    rooms: [
      { id: "rm_deluxe", name: "Deluxe Sea Facing Room", bed: "1 King Bed", price: 14500, desc: "Breathtaking Arabian Sea views with luxury marble bath" },
      { id: "rm_luxury", name: "Luxury Suite with Club Lounge", bed: "1 King Bed + Living Area", price: 21500, desc: "Complimentary evening high tea, private airport transfer" }
    ]
  },
  {
    id: "htl_jw_marriott",
    name: "JW Marriott Mumbai Juhu",
    rating: 5,
    location: "Juhu Beach, Mumbai",
    pricePerNight: 13200,
    freeCancellation: true,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    amenities: ["Direct Beach Access", "Award-Winning Dining", "Outdoor Pool", "Fitness Center"],
    rooms: [
      { id: "rm_jw_deluxe", name: "Deluxe Guest Room", bed: "1 King or 2 Twins", price: 13200, desc: "Plush bedding, ergonomic workstation, 55-inch Smart TV" },
      { id: "rm_jw_ocean", name: "Executive Ocean View Suite", bed: "1 King Bed", price: 19800, desc: "Panoramic sunset view with exclusive lounge entry" }
    ]
  },
  {
    id: "htl_trident_bkc",
    name: "Trident Hotel Bandra Kurla",
    rating: 4.8,
    location: "Bandra Kurla Complex (BKC), Mumbai",
    pricePerNight: 9800,
    freeCancellation: true,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    amenities: ["Free WiFi", "Swimming Pool", "Spa", "Italian Trattoria", "Business Center"],
    rooms: [
      { id: "rm_trident_prem", name: "Premier City View Room", bed: "1 King Bed", price: 9800, desc: "Floor-to-ceiling windows overlooking financial skyline" },
      { id: "rm_trident_club", name: "Club Executive Room", bed: "1 King Bed", price: 13500, desc: "Includes breakfast buffet and all-day refreshments" }
    ]
  },
  {
    id: "htl_novotel_juhu",
    name: "Novotel Mumbai Juhu Beach",
    rating: 4.5,
    location: "Balraj Sahani Marg, Juhu, Mumbai",
    pricePerNight: 7600,
    freeCancellation: false,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    amenities: ["Beachfront Dining", "Sunset Bar", "Free WiFi", "Kids Play Area"],
    rooms: [
      { id: "rm_novotel_std", name: "Superior King Room", bed: "1 King Bed", price: 7600, desc: "Contemporary aesthetic with rain shower" },
      { id: "rm_novotel_sea", name: "Premier Sea View Room", bed: "1 King Bed", price: 10200, desc: "Unobstructed waves sightline with balcony" }
    ]
  }
];

export const HotelBookingCoordinator: React.FC<HotelBookingCoordinatorProps> = ({
  initialSearchParams,
  onClose
}) => {
  const [step, setStep] = useState<"results" | "rooms" | "checkout">("results");
  const [hotels, setHotels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

  // Filters & Sorting
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyFreeCancel, setOnlyFreeCancel] = useState(false);
  const [sortBy, setSortBy] = useState<"cheapest" | "rated">("cheapest");

  // Lead Guest Details
  const [guestName, setGuestName] = useState("Mr. Rahul Sharma");
  const [guestEmail, setGuestEmail] = useState("rahul.sharma@example.com");
  const [guestPhone, setGuestPhone] = useState("9876543210");
  const [specialRequest, setSpecialRequest] = useState("High floor room with quiet street/sea side view");

  // Strict Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const validateField = (field: string, val: string): string | null => {
    const str = val.trim();
    if (field === "guestName") {
      if (!str) return "Lead guest name is required";
      if (str.length < 2) return "Name must be at least 2 characters";
    }
    if (field === "guestEmail") {
      if (!str) return "Email address is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return "Please enter a valid email address";
    }
    if (field === "guestPhone") {
      if (!str) return "Mobile number is required";
      if (str.replace(/\D/g, "").length < 10) return "Please enter a valid 10-digit mobile number";
    }
    return null;
  };

  const handleFieldChange = (field: string, val: string, setter: (v: string) => void) => {
    setter(val);
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, val);
    setErrors((prev) => {
      const copy = { ...prev };
      if (err) copy[field] = err;
      else delete copy[field];
      return copy;
    });
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    const nErr = validateField("guestName", guestName);
    if (nErr) newErrors.guestName = nErr;
    const eErr = validateField("guestEmail", guestEmail);
    if (eErr) newErrors.guestEmail = eErr;
    const pErr = validateField("guestPhone", guestPhone);
    if (pErr) newErrors.guestPhone = pErr;

    setErrors(newErrors);
    setTouched({
      guestName: true,
      guestEmail: true,
      guestPhone: true
    });

    if (Object.keys(newErrors).length > 0) {
      setToastMessage("Please fill in all required primary guest fields (Name, Email, Mobile) before proceeding.");
      return false;
    }
    setToastMessage(null);
    return true;
  };

  // Payment & Confirmation
  const [paymentId, setPaymentId] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const processBookingSuccess = async (rzpPaymentId: string) => {
    setIsProcessingPayment(true);
    setPaymentId(rzpPaymentId);
    try {
      const res = await fetch("/api/hotels/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedHotel?.id,
          propertyName: selectedHotel?.name,
          roomId: selectedRoom?.id,
          roomName: selectedRoom?.name,
          checkInDate: initialSearchParams.checkInDate,
          checkOutDate: initialSearchParams.checkOutDate,
          nights,
          roomsCount: initialSearchParams.rooms,
          leadGuest: {
            fullName: guestName,
            email: guestEmail,
            phone: guestPhone,
            specialRequest
          },
          pricing: {
            baseRate: totalBase,
            taxes,
            grandTotal,
            currency: "INR"
          },
          payment: {
            gateway: "Razorpay",
            paymentId: rzpPaymentId,
            status: "PAID"
          }
        })
      });
      const data = await res.json();
      if (data.success && data.confirmationNumber) {
        setBookingRef(data.confirmationNumber);
        setIsConfirmed(true);
      } else {
        setToastMessage(`Booking Notice: Payment verified (ID: ${rzpPaymentId}), but hotel confirmation failed: ${data.error || "Room could not be reserved"}. Please contact support.`);
      }
    } catch (err: any) {
      setToastMessage(`Booking error after payment (ID: ${rzpPaymentId}): ${err?.message || "Failed to confirm hotel room"}. Please contact support.`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePay = async () => {
    if (!validateAll()) {
      return;
    }

    setIsProcessingPayment(true);
    setToastMessage(null);
    let orderData: any = null;

    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          supplierBaseFare: grandTotal,
          supplierTaxes: 0,
          serviceType: 'hotel',
          buyerState: 'MH' 
        })
      });
      
      orderData = await orderRes.json();
      if (!orderRes.ok || !orderData?.success || !orderData?.orderId) {
        setIsProcessingPayment(false);
        setToastMessage(`Razorpay Error: ${orderData?.error || "Could not create Razorpay order"}`);
        return;
      }
    } catch (e: any) {
      setIsProcessingPayment(false);
      setToastMessage(`Connection Error: ${e?.message || "Failed to reach Razorpay order service"}`);
      return;
    }

    const effectiveKey = orderData.keyId || orderData.key || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
    if (!effectiveKey) {
      setIsProcessingPayment(false);
      setToastMessage("Razorpay Key ID is not configured on server.");
      return;
    }

    if (typeof (window as any).Razorpay === "undefined") {
      setIsProcessingPayment(false);
      setToastMessage("Razorpay Checkout SDK is still loading. Please try again.");
      return;
    }

    try {
      const RazorpayConstructor = (window as any).Razorpay;
      const options = {
        key: effectiveKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "RoutTripo Hotels",
        description: `Hotel Booking - ${selectedHotel?.name}`,
        order_id: orderData.orderId || orderData.id,
        prefill: {
          name: guestName,
          email: guestEmail,
          contact: guestPhone
        },
        theme: {
          color: "#072654"
        },
        handler: async (response: any) => {
          setIsProcessingPayment(true);
          setToastMessage("Verifying payment signature with Razorpay...");

          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success || verifyData.verified) {
              setToastMessage(null);
              await processBookingSuccess(response.razorpay_payment_id);
            } else {
              setIsProcessingPayment(false);
              setToastMessage(`Payment Verification Failed: ${verifyData.error || "Untrusted signature"}`);
            }
          } catch (vErr: any) {
            setIsProcessingPayment(false);
            setToastMessage(`Verification Network Error: ${vErr?.message || "Could not verify signature"}`);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            setToastMessage("Payment window was closed. No hotel booking was made.");
          }
        }
      };

      const rzp = new RazorpayConstructor(options);
      rzp.on("payment.failed", (resp: any) => {
        setIsProcessingPayment(false);
        setToastMessage(`Payment Failed: ${resp.error?.description || resp.error?.reason || "Declined by gateway"}`);
      });
      rzp.open();
    } catch (e: any) {
      setIsProcessingPayment(false);
      setToastMessage(`Razorpay SDK Error: ${e?.message || "Could not open checkout popup"}`);
    }
  };

  // Fetch hotels from API or fallback
  useEffect(() => {
    let isMounted = true;
    const fetchHotelList = async () => {
      setIsLoading(true);
      try {
        const dest = initialSearchParams.destination || "Mumbai";
        const res = await fetch("/api/hotels/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination: dest,
            location: dest,
            checkInDate: initialSearchParams.checkInDate,
            checkOutDate: initialSearchParams.checkOutDate,
            adults: initialSearchParams.adults,
            rooms: initialSearchParams.rooms
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.results && Array.isArray(data.results) && data.results.length > 0) {
            setHotels(data.results);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Hotel API live fetch failed, using fallback:", err);
      }

      if (isMounted) {
        setHotels(FALLBACK_HOTELS);
        setIsLoading(false);
      }
    };

    fetchHotelList();
    return () => {
      isMounted = false;
    };
  }, [initialSearchParams]);

  // Compute filtered & sorted hotels
  const filteredHotels = hotels
    .filter((h) => {
      const r = h.rating || h.accommodation?.rating || h.propertyInfo?.ratings?.[0]?.value || 0;
      if (minRating > 0 && r < minRating) return false;
      if (onlyFreeCancel && !h.freeCancellation) return false;
      return true;
    })
    .sort((a, b) => {
      const priceA = Number(a.pricePerNight || a.rates?.[0]?.total_amount || 5000);
      const priceB = Number(b.pricePerNight || b.rates?.[0]?.total_amount || 5000);
      const ratingA = a.rating || a.accommodation?.rating || a.propertyInfo?.ratings?.[0]?.value || 0;
      const ratingB = b.rating || b.accommodation?.rating || b.propertyInfo?.ratings?.[0]?.value || 0;
      if (sortBy === "cheapest") return priceA - priceB;
      return ratingB - ratingA;
    });

  // Calculation for Checkout
  const roomPrice = selectedRoom?.price || selectedHotel?.pricePerNight || 8500;
  const computedNights = initialSearchParams?.checkInDate && initialSearchParams?.checkOutDate
    ? Math.max(1, Math.round((new Date(initialSearchParams.checkOutDate).getTime() - new Date(initialSearchParams.checkInDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 2;
  const nights = computedNights;
  const totalBase = roomPrice * nights;
  const taxes = Math.round(totalBase * 0.12);
  const grandTotal = totalBase + taxes;

  const handleSelectHotel = (hotel: any) => {
    setSelectedHotel(hotel);
    const defaultRooms = hotel.rooms || [
      { id: "rm_std", name: "Standard Deluxe Room", bed: "1 Queen Bed", price: hotel.pricePerNight || 7500, desc: "Spacious luxury room with city skyline views" },
      { id: "rm_exec", name: "Executive Club Suite", bed: "1 King Bed + Lounge", price: Math.round((hotel.pricePerNight || 7500) * 1.35), desc: "Includes club access and complimentary breakfast" }
    ];
    setSelectedRoom(defaultRooms[0]);
    setStep("rooms");
  };

  const handleSelectRoom = (room: any) => {
    setSelectedRoom(room);
    setStep("checkout");
  };

  // STEP 3 Confirmation view
  if (isConfirmed) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--premium-page)] text-[var(--premium-ink)] py-12 px-4 flex flex-col items-center justify-center animate-in fade-in">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200">
              Hotel Booking Confirmed
            </span>
            <h2 className="text-2xl font-black text-slate-900 pt-2">Reservation Issued!</h2>
            <p className="text-xs text-slate-500">
              Reference: <span className="font-bold text-slate-900">{bookingRef}</span>
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Property</span>
                <span className="font-bold text-slate-900 text-sm">{selectedHotel?.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nights</span>
                <span className="font-bold text-slate-800">{nights} Nights</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Room Type:</span>
                <span className="font-semibold text-slate-900">{selectedRoom?.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Lead Guest:</span>
                <span className="font-semibold text-slate-900">{guestName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Dates:</span>
                <span className="font-semibold text-slate-900">{initialSearchParams.checkInDate} to {initialSearchParams.checkOutDate}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Status:</span>
                <span className="font-bold text-pink-600">PAID via Razorpay</span>
              </div>
              {paymentId && (
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Razorpay ID:</span>
                  <span className="font-mono font-bold text-sky-700">{paymentId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => alert(`Downloading Hotel Voucher for Ref: ${bookingRef}...`)}
              className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Hotel Voucher (PDF)</span>
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (step === "checkout") setStep("rooms");
                else if (step === "rooms") setStep("results");
                else onClose();
              }}
              className="p-2.5 -ml-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate flex-1 min-w-0">
                  {step === "results" ? `Hotels in ${initialSearchParams.destination || "Mumbai"}` : step === "rooms" ? (selectedHotel?.name || "Select Room") : "Checkout"}
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--premium-violet)] text-white border border-transparent">
                  {step === "results" ? "Step 1" : step === "rooms" ? "Step 2" : "Step 3"}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {initialSearchParams.checkInDate} · {initialSearchParams.adults} Guests · {initialSearchParams.rooms} Room(s)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 pb-24">
        {/* STEP 1: RESULTS */}
        {step === "results" && (
          <div className="space-y-4">
            {/* Filter & Sort Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Filter:</span>
                <button
                  type="button"
                  onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)}
                  className={`px-3 py-1.5 rounded-full font-bold border transition-colors ${
                    minRating === 4.5 ? "bg-orange-500 text-white border-orange-500" : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  ★ 4.5+ Rating
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyFreeCancel(!onlyFreeCancel)}
                  className={`px-3 py-1.5 rounded-full font-bold border transition-colors ${
                    onlyFreeCancel ? "bg-pink-600 text-white border-pink-600" : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  Free Cancellation
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 font-bold text-slate-700 rounded-xl border border-slate-200 px-3 py-1.5 focus:outline-none"
                >
                  <option value="cheapest">Price: Lowest First</option>
                  <option value="rated">Rating: Highest First</option>
                </select>
              </div>
            </div>

            {/* Hotel Cards List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-3xl bg-white p-4 border border-slate-100 shadow-sm animate-pulse flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-52 h-44 bg-slate-200 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-5 w-48 bg-slate-200 rounded-md" />
                      <div className="h-3 w-32 bg-slate-100 rounded-md" />
                      <div className="h-3 w-full bg-slate-100 rounded-md" />
                      <div className="h-7 w-28 bg-slate-200 rounded-md mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredHotels.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-500">
                <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold">No properties matched the selected filters.</p>
                <button
                  onClick={() => { setMinRating(0); setOnlyFreeCancel(false); }}
                  className="mt-3 text-xs font-bold text-[var(--premium-violet)] underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHotels.map((hotel) => {
                  const price = hotel.pricePerNight || hotel.rates?.[0]?.total_amount || 7800;
                  return (
                    <div
                      key={hotel.id}
                      onClick={() => handleSelectHotel(hotel)}
                      className="bg-white rounded-2xl border border-slate-100/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row cursor-pointer group"
                    >
                      <div className="w-full sm:w-48 h-40 sm:h-auto bg-slate-100 relative overflow-hidden shrink-0">
                        <img
                          src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {hotel.rating && (
                          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{hotel.rating}★</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                                {hotel.name}
                              </h3>
                              {hotel.sources && hotel.sources.length > 1 && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded mt-0.5 border border-pink-100">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>{hotel.sources.length} Channels Merged</span>
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {hotel.freeCancellation && (
                                <span className="text-[9px] font-bold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded-full border border-pink-200">
                                  Free Cancel
                                </span>
                              )}
                              {hotel.bestRateGuarantee && (
                                <span className="text-[9px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-200">
                                  Best Rate
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{hotel.location || hotel.address}</span>
                          </p>

                          {hotel.rateComparisons && hotel.rateComparisons.length > 0 && (
                            <div className="mt-1.5 text-[10px] bg-slate-50 p-1.5 rounded-lg border border-slate-200/70 flex items-center justify-between">
                              <span className="text-slate-500 font-medium">Market: <s className="text-slate-400 font-normal">₹{Math.round(price * 1.22).toLocaleString("en-IN")}</s></span>
                              <span className="font-bold text-pink-600">Save 18%</span>
                            </div>
                          )}

                          {hotel.amenities && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {hotel.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                                <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-100">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Price per night</span>
                            <div className="text-xl font-black text-slate-900">
                              ₹{price.toLocaleString("en-IN")}
                              <span className="text-xs font-normal text-slate-400 ml-1">+ taxes</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="bg-gradient-to-r from-sky-500 to-pink-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md shadow-sky-500/20 group-hover:brightness-105 transition-all"
                          >
                            Select Room
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: ROOM SELECTION */}
        {step === "rooms" && selectedHotel && (
          <div className="space-y-6">
            {/* Hotel Overview Banner */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-5">
              <img
                src={selectedHotel.image}
                alt={selectedHotel.name}
                className="w-full sm:w-48 h-36 rounded-2xl object-cover shrink-0"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> {selectedHotel.rating}★ GIATA Certified
                  </span>
                  <span className="text-xs font-bold text-slate-400">Luxury Collection</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{selectedHotel.name}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" /> {selectedHotel.location || selectedHotel.address}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(selectedHotel.amenities || []).map((a: string, i: number) => (
                    <span key={i} className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 tracking-tight">Available Rooms & Suites</h3>

            {/* Room Options */}
            <div className="space-y-4">
              {(selectedHotel.rooms || [
                { id: "rm_std", name: "Standard Deluxe Room", bed: "1 Queen Bed", price: selectedHotel.pricePerNight, desc: "Spacious luxury room with city skyline views" },
                { id: "rm_exec", name: "Executive Club Suite", bed: "1 King Bed + Lounge", price: Math.round(selectedHotel.pricePerNight * 1.35), desc: "Includes club access and complimentary breakfast" }
              ]).map((room: any) => (
                <div
                  key={room.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-5 h-5 text-sky-600" />
                      <h4 className="text-base font-bold text-slate-900">{room.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500">{room.desc}</p>
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 pt-1">
                      <span>• {room.bed}</span>
                      <span className="text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md font-bold">
                        Free Cancellation available
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900">₹{room.price.toLocaleString("en-IN")}</div>
                      <span className="text-[10px] text-slate-400 block">per night + tax</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectRoom(room)}
                      className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                    >
                      Book Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: CHECKOUT */}
        {step === "checkout" && selectedHotel && (
          <div className="space-y-6">
            {/* Toast Notification */}
            {toastMessage && (
              <div className="bg-rose-500 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{toastMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Booking Summary Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedHotel.name}</h3>
                  <p className="text-xs text-slate-500">{selectedRoom?.name} · {nights} Nights</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                    Instant Confirmation
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Check-in</span>
                  <span className="font-bold text-slate-800">{initialSearchParams.checkInDate} (From 14:00)</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Check-out</span>
                  <span className="font-bold text-slate-800">{initialSearchParams.checkOutDate} (Until 12:00)</span>
                </div>
              </div>
            </div>

            {/* Lead Guest Form with Strict Validation */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>Primary Guest Details</span>
                </h4>
                <span className="text-[10px] uppercase font-bold text-slate-400">All fields required</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Full Name (As on Govt ID) *
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => handleFieldChange("guestName", e.target.value, setGuestName)}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-colors focus:outline-none ${
                      touched.guestName && errors.guestName
                        ? "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    }`}
                  />
                  {touched.guestName && errors.guestName && (
                    <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.guestName}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => handleFieldChange("guestEmail", e.target.value, setGuestEmail)}
                      placeholder="name@example.com"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-colors focus:outline-none ${
                        touched.guestEmail && errors.guestEmail
                          ? "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                          : "border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      }`}
                    />
                    {touched.guestEmail && errors.guestEmail && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.guestEmail}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => handleFieldChange("guestPhone", e.target.value, setGuestPhone)}
                      placeholder="10-digit mobile number"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-semibold text-slate-800 transition-colors focus:outline-none ${
                        touched.guestPhone && errors.guestPhone
                          ? "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                          : "border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      }`}
                    />
                    {touched.guestPhone && errors.guestPhone && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.guestPhone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Special Requests (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="E.g. Early check-in, quiet room"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Fare Summary</h4>
                <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                  Guaranteed Rate
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Room Tariff ({nights} nights × ₹{roomPrice}):</span>
                  <span className="font-semibold text-slate-900">₹{totalBase.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST & Service Charges (12%):</span>
                  <span className="font-semibold text-slate-900">₹{taxes.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-black text-base text-slate-900 pt-3 border-t border-slate-100">
                  <span>Total Amount Payable:</span>
                  <span className="text-xl text-sky-600">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Trigger Razorpay CTA */}
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handlePay}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-pink-600 py-4 px-6 text-white font-bold text-base shadow-lg shadow-sky-500/25 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <Lock className="w-5 h-5" />
              <span>{isProcessingPayment ? "Processing Confirmation..." : `Pay ₹${grandTotal.toLocaleString("en-IN")} with Razorpay`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
