import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  CreditCard,
  QrCode,
  Download,
  Plane,
  Clock,
  Sparkles,
  User,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  X,
  ArrowRight
} from "lucide-react";
import { BookingStepHeader } from "./BookingStepHeader";
import { loadRazorpayScript } from "../../utils/razorpay";
import { RazorpayCheckoutModal } from "../../components/common/RazorpayCheckoutModal";
import type { SelectedSeat } from "./SeatSelectionStep";
import type { SelectedBaggageItem } from "./BaggageSelectionStep";
import type { SelectedMealItem } from "./MealsSelectionStep";
import type { SelectedFare } from "./FareSelectionStep";
import type { PassengerDetail } from "./PassengerDetailsStep";
import { formatTime } from "./PassengerDetailsStep";

export interface FlightPricingAPIResponse {
  priceToken: string;
  expiresAt: string;
  offerId: string;
  baseFare: number;
  paxBreakdown?: {
    adults: { count: number; perPaxBase: number; totalBase: number };
    children: { count: number; perPaxBase: number; totalBase: number };
    infants: { count: number; perPaxFee: number; totalFee: number };
    totalPax: number;
  };
  fuelSurcharge: number;
  airportFees: number;
  gstTax: number;
  ancillaryBreakdown?: {
    seats: { items: Array<{ seatCode: string; price: number }>; total: number };
    baggage: { items: Array<{ name: string; price: number; qty: number }>; total: number };
    meals: { items: Array<{ name: string; price: number; qty: number }>; total: number };
    total: number;
  };
  ancillaryTotal: number;
  fareDelta: number;
  discount: number;
  totalPayable: number;
  currency: string;
  fareRules: {
    cancellationFee: number;
    cancellationPolicy?: string;
    dateChangeFee: number;
    dateChangePolicy?: string;
    isRefundable: boolean;
    freeCancellationHours: number;
    baggageAllowance?: string;
    cabinBaggage?: string;
    checkInBaggage?: string;
  };
  priceGuaranteed: boolean;
}

export interface CheckoutStepProps {
  flight: any;
  searchParams: any;
  selectedFare?: SelectedFare | null;
  selectedSeats: SelectedSeat[];
  selectedBaggage: SelectedBaggageItem[];
  selectedMeals: SelectedMealItem[];
  passengers?: PassengerDetail[];
  onBack: () => void;
  onFinishBooking: () => void;
  onRestartSearch?: () => void;
}

export const CheckoutStep: React.FC<CheckoutStepProps> = ({
  flight,
  searchParams,
  selectedFare,
  selectedSeats,
  selectedBaggage,
  selectedMeals,
  passengers,
  onBack,
  onFinishBooking,
  onRestartSearch
}) => {
  const leadPax = passengers && passengers.length > 0 ? passengers[0] : null;

  const [firstName, setFirstName] = useState(leadPax?.firstName || "");
  const [lastName, setLastName] = useState(leadPax?.lastName || "");
  const [gender, setGender] = useState<string>(leadPax?.gender || "");
  const [dob, setDob] = useState(leadPax?.dob || "");
  const [passengerEmail, setPassengerEmail] = useState(leadPax?.email || "");
  const [passengerPhone, setPassengerPhone] = useState(leadPax?.phone || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [razorpayPaymentId, setRazorpayPaymentId] = useState("");
  const [pnrNumber, setPnrNumber] = useState("");
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

  const passengerName = `${firstName} ${lastName}`.trim();

  const org = flight?.origin || flight?.originCode || searchParams.origin || "BOM";
  const dst = flight?.destination || flight?.destinationCode || searchParams.destination || "DEL";
  const airline = flight?.airline || "IndiGo";
  const flightNo = flight?.flightNumber || "6E-2045";
  const departureTime = flight?.departureTime || "06:00";
  const arrivalTime = flight?.arrivalTime || "08:15";

  // Multi-Passenger Counts
  const adultCount = Math.max(1, searchParams?.adults || 1);
  const childCount = Math.max(0, searchParams?.children || 0);
  const infantCount = Math.max(0, searchParams?.infants || 0);
  const totalPax = adultCount + childCount + infantCount;

  // Live Travelport GDS Pricing from API
  const [pricing, setPricing] = useState<FlightPricingAPIResponse | null>(null);
  const [isPricingLoading, setIsPricingLoading] = useState<boolean>(true);
  const [pricingError, setPricingError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLivePricing = async () => {
      setIsPricingLoading(true);
      setPricingError(null);
      try {
        const res = await fetch("/api/travelport/flights/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offerId: flight?.id,
            flightOffer: flight,
            passengerCount: totalPax,
            adults: adultCount,
            children: childCount,
            infants: infantCount,
            selectedFareCode: selectedFare?.id,
            fareDelta: selectedFare?.priceDelta || 0,
            selectedSeats: selectedSeats.map((s) => ({
              seatCode: s.seatCode,
              price: s.price
            })),
            selectedBaggage: selectedBaggage.map((b) => ({
              code: b.id,
              name: b.title || `Extra Baggage (+${b.kg}kg)`,
              price: b.price,
              qty: b.qty
            })),
            selectedMeals: selectedMeals.map((m) => ({
              code: m.id,
              name: m.name,
              price: m.price,
              qty: m.qty
            }))
          })
        });

        const data = await res.json();
        if (isMounted) {
          if (data.success && data.data) {
            setPricing(data.data);
          } else {
            setPricingError(data.error || "Unable to retrieve live fare from API.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setPricingError(err?.message || "Failed to load live GDS pricing.");
        }
      } finally {
        if (isMounted) {
          setIsPricingLoading(false);
        }
      }
    };

    fetchLivePricing();
    return () => {
      isMounted = false;
    };
  }, [flight, selectedFare, selectedSeats, selectedBaggage, selectedMeals, adultCount, childCount, infantCount, totalPax]);

  // Authoritative Grand Total directly from API pricing response
  const grandTotal = pricing ? pricing.totalPayable : Math.max(0, (Number(flight?.price || 4890) * adultCount) + (selectedSeats.reduce((s, x) => s + x.price, 0)));

  // Field validation helper
  const validateField = (field: string, val: string): string | null => {
    const str = val.trim();
    if (field === "firstName") {
      if (!str) return "First name is required";
      if (str.length < 2) return "First name must be at least 2 characters";
      if (!/^[a-zA-Z\s'-]+$/.test(str)) return "Only English letters allowed";
    }
    if (field === "lastName") {
      if (!str) return "Last name is required";
      if (!/^[a-zA-Z\s'-]+$/.test(str)) return "Only English letters allowed";
    }
    if (field === "gender") {
      if (!str || !["Male", "Female", "Other"].includes(str)) return "Please select a gender";
    }
    if (field === "dob") {
      if (!str) return "Date of birth is required";
      const d = new Date(str);
      if (isNaN(d.getTime())) return "Valid date required (YYYY-MM-DD)";
      if (d > new Date()) return "Date of birth cannot be in future";
    }
    if (field === "email") {
      if (!str) return "Email is required for ticket delivery";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return "Please enter a valid email address";
    }
    if (field === "phone") {
      if (!str) return "Mobile phone is required";
      const digits = str.replace(/\D/g, "");
      if (digits.length !== 10) return "Valid 10-digit mobile number required";
      if (!/^[6-9]\d{9}$/.test(digits)) return "Please enter a valid 10-digit mobile number (starts with 6-9)";
    }
    return null;
  };

  const handleFieldChange = (field: string, val: string, setter: (v: string) => void) => {
    let sanitized = val;
    if (field === "phone") {
      sanitized = val.replace(/\D/g, "").slice(0, 10);
    }
    setter(sanitized);
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, sanitized);
    setErrors((prev) => {
      const copy = { ...prev };
      if (err) copy[field] = err;
      else delete copy[field];
      return copy;
    });
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fErr = validateField("firstName", firstName);
    if (fErr) newErrors.firstName = fErr;
    const lErr = validateField("lastName", lastName);
    if (lErr) newErrors.lastName = lErr;
    const gErr = validateField("gender", gender);
    if (gErr) newErrors.gender = gErr;
    const dErr = validateField("dob", dob);
    if (dErr) newErrors.dob = dErr;
    const eErr = validateField("email", passengerEmail);
    if (eErr) newErrors.email = eErr;
    const pErr = validateField("phone", passengerPhone);
    if (pErr) newErrors.phone = pErr;

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      gender: true,
      dob: true,
      email: true,
      phone: true
    });

    if (Object.keys(newErrors).length > 0) {
      setToastMessage("Please fill in all required passenger fields (First Name, Last Name, Gender, DOB) before proceeding.");
      return false;
    }
    setToastMessage(null);
    return true;
  };

  const processBookingSuccess = async (paymentId: string) => {
    setIsProcessing(true);
    setRazorpayPaymentId(paymentId);
    
    try {
      const res = await fetch("/api/travelport/flights/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceToken: pricing?.priceToken || `prc_tok_${Date.now()}`,
          offerId: flight?.id,
          flightOffer: flight,
          passengers: passengers && passengers.length > 0
            ? passengers.map((p) => ({
                title: p.title,
                firstName: p.firstName,
                lastName: p.lastName,
                email: p.email || passengerEmail,
                phone: p.phone || passengerPhone,
                gender: p.gender as any,
                dateOfBirth: p.dob,
                type: p.type === "Child" ? "CHD" : p.type === "Infant" ? "INF" : "ADT"
              }))
            : [
                {
                  firstName: passengerName.split(" ")[0] || "Traveler",
                  lastName: passengerName.split(" ").slice(1).join(" ") || "One",
                  email: passengerEmail,
                  phone: passengerPhone,
                  gender: gender as any,
                  dateOfBirth: dob,
                  type: "ADT"
                }
              ],
          pricingBreakdown: pricing || {
            priceToken: `prc_tok_${Date.now()}`,
            expiresAt: new Date(Date.now() + 900000).toISOString(),
            offerId: flight?.id || "fl-offer",
            baseFare: grandTotal,
            fuelSurcharge: 0,
            airportFees: 0,
            gstTax: 0,
            ancillaryTotal: 0,
            fareDelta: 0,
            discount: 0,
            totalPayable: grandTotal,
            currency: "INR",
            fareRules: {
              cancellationFee: 2500,
              dateChangeFee: 1500,
              isRefundable: true,
              freeCancellationHours: 24
            },
            priceGuaranteed: true
          },
          paymentDetails: {
            gateway: "Razorpay",
            paymentId: paymentId,
            amount: grandTotal,
            currency: "INR",
            status: "PAID"
          }
        })
      });
      const data = await res.json();
      if (data.success && data.pnr) {
        setPnrNumber(data.pnr);
        setIsConfirmed(true);
      } else {
        setToastMessage(`Booking Status: Payment verified (ID: ${paymentId}), but airline response: ${data.error || "PNR could not be confirmed"}. Please contact support.`);
      }
    } catch (err: any) {
      setToastMessage(`Booking error after payment (ID: ${paymentId}): ${err?.message || "Failed to confirm ticket with airline"}. Please contact support.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePay = async () => {
    if (!validateAll()) {
      return;
    }

    setIsProcessing(true);
    setToastMessage(null);
    let orderData: any = null;

    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          supplierBaseFare: grandTotal,
          supplierTaxes: 0,
          serviceType: 'direct_booking',
          buyerState: 'MH' 
        })
      });
      
      orderData = await orderRes.json();
      if (!orderRes.ok || !orderData?.success || !orderData?.orderId) {
        setIsProcessing(false);
        setToastMessage(`Razorpay Error: ${orderData?.error || "Could not create Razorpay order"}`);
        return;
      }
    } catch (e: any) {
      setIsProcessing(false);
      setToastMessage(`Connection Error: ${e?.message || "Failed to reach Razorpay order service"}`);
      return;
    }

    const effectiveKey = orderData.keyId || orderData.key || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
    const hasLiveMerchantKey = Boolean(
      effectiveKey && 
      effectiveKey.length > 8 && 
      !effectiveKey.includes("dummy") && 
      !effectiveKey.includes("Mock") && 
      !orderData.isSandbox
    );

    if (typeof (window as any).Razorpay === "undefined") {
      await loadRazorpayScript();
    }

    if (!hasLiveMerchantKey || typeof (window as any).Razorpay === "undefined") {
      setIsProcessing(false);
      setCreatedOrderId(orderData.id || orderData.orderId || `order_${Date.now()}`);
      setShowRazorpayModal(true);
      return;
    }

    try {
      const RazorpayConstructor = (window as any).Razorpay;
      const options = {
        key: effectiveKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "RouTripO Flights",
        description: `Flight Booking - ${airline} ${flightNo}`,
        order_id: orderData.orderId || orderData.id,
        prefill: {
          name: passengerName,
          email: passengerEmail,
          contact: passengerPhone
        },
        theme: {
          color: "#072654"
        },
        handler: async (response: any) => {
          setIsProcessing(true);
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
              setIsProcessing(false);
              setToastMessage(`Payment Verification Failed: ${verifyData.error || "Untrusted signature"}`);
            }
          } catch (vErr: any) {
            setIsProcessing(false);
            setToastMessage(`Verification Network Error: ${vErr?.message || "Could not verify signature"}`);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setToastMessage("Payment window was closed. No booking was made.");
          }
        }
      };

      const rzp = new RazorpayConstructor(options);
      rzp.on("payment.failed", (resp: any) => {
        setIsProcessing(false);
        setToastMessage(`Payment Failed: ${resp.error?.description || resp.error?.reason || "Declined by gateway"}`);
      });
      rzp.open();
    } catch (e: any) {
      console.warn("Opening interactive Razorpay modal:", e);
      setIsProcessing(false);
      setCreatedOrderId(orderData?.id || orderData?.orderId || `order_${Date.now()}`);
      setShowRazorpayModal(true);
    }
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-[var(--premium-page)] text-[var(--premium-ink)] py-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200">
              Booking Confirmed
            </span>
            <h2 className="text-2xl font-bold text-slate-900 pt-2">Ticket Issued!</h2>
            <p className="text-xs text-slate-500">
              Confirmed on Travelport GDS. PNR: <span className="font-bold text-slate-900">{pnrNumber}</span>
            </p>
          </div>

          {/* Ticket Card Details */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Flight</span>
                <span className="font-bold text-slate-800 text-sm">{airline} {flightNo}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                <span className="font-bold text-slate-800">{searchParams.departDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-slate-900">{departureTime}</span>
                <span className="text-[11px] font-semibold text-slate-500 block">{org}</span>
              </div>
              <div className="flex flex-col items-center">
                <Plane className="w-4 h-4 text-sky-500" />
                <span className="text-[10px] text-slate-400">Non-stop</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-slate-900">{arrivalTime}</span>
                <span className="text-[11px] font-semibold text-slate-500 block">{dst}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-slate-600">
              <span>Passenger: <strong>{passengerName}</strong></span>
              {selectedSeats.length > 0 && (
                <span>Seat: <strong>{selectedSeats.map(s => s.seatCode).join(", ")}</strong></span>
              )}
            </div>

            {razorpayPaymentId && (
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Razorpay Payment ID:</span>
                <span className="font-mono font-bold text-sky-700">{razorpayPaymentId}</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => alert(`Downloading E-Ticket for PNR: ${pnrNumber}...`)}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download E-Ticket (PDF)</span>
            </button>
            <button
              type="button"
              onClick={onFinishBooking}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Header */}
      <BookingStepHeader
        title="Review & Pay"
        step="Step 6 of 6"
        subtitle="Instant confirmation & secure checkout"
        inlineSubtitle
        onBack={onBack}
        backAriaLabel="Back to baggage"
      />

      {/* Form and Summary Container */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Flight summary card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-6">
            <span className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm shrink-0">
              {airline.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>{airline} {flightNo}</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {searchParams.departDate} • {searchParams.cabinClass}
              </p>
              <span className="inline-block mt-1 text-[9px] font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-sm">
                {flight?.refundable !== false ? "Refundable" : "Standard Fare"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between flex-1 w-full px-2">
            <div>
              <span className="text-base font-bold text-slate-900 block">{departureTime}</span>
              <span className="text-xs text-slate-600 font-bold">{org}</span>
              <span className="text-[10px] text-slate-400 block font-semibold">T{flight?.departureTerminal || "2"}</span>
            </div>
            <div className="flex flex-col items-center flex-1 px-4 max-w-[150px]">
              <span className="text-[10px] text-slate-500 font-bold mb-1">
                {flight?.stops > 0 ? (flight?.layoverInfo || "1 Stop") : "Non-stop"}
              </span>
              <div className="w-full relative flex items-center justify-center">
                <div className="w-full h-px border-t border-dashed border-slate-300" />
                <Plane className="w-3.5 h-3.5 text-slate-400 absolute bg-white px-0.5" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1">{flight?.duration || "2h 15m"}</span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-slate-900 block">{arrivalTime}</span>
              <span className="text-xs text-slate-600 font-bold">{dst}</span>
              <span className="text-[10px] text-slate-400 block font-semibold">T{flight?.arrivalTerminal || "3"}</span>
            </div>
          </div>
        </div>

        {/* Passenger Information Form with Strict Validation */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              Lead Passenger & Contact Details
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              Must match Gov. ID
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* First Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cara"
                value={firstName}
                onChange={(e) => handleFieldChange("firstName", e.target.value, setFirstName)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none ${
                  errors.firstName && touched.firstName
                    ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-2 focus:ring-[var(--premium-violet)]"
                }`}
              />
              {errors.firstName && touched.firstName && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.firstName}</span>
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sharma"
                value={lastName}
                onChange={(e) => handleFieldChange("lastName", e.target.value, setLastName)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none ${
                  errors.lastName && touched.lastName
                    ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-2 focus:ring-[var(--premium-violet)]"
                }`}
              />
              {errors.lastName && touched.lastName && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.lastName}</span>
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => handleFieldChange("gender", e.target.value, setGender)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none bg-white ${
                  errors.gender && touched.gender
                    ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-2 focus:ring-[var(--premium-violet)]"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && touched.gender && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.gender}</span>
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={dob}
                onChange={(e) => handleFieldChange("dob", e.target.value, setDob)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none ${
                  errors.dob && touched.dob
                    ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-2 focus:ring-[var(--premium-violet)]"
                }`}
              />
              {errors.dob && touched.dob && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.dob}</span>
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="cara@routripo.app"
                value={passengerEmail}
                onChange={(e) => handleFieldChange("email", e.target.value, setPassengerEmail)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none ${
                  errors.email && touched.email
                    ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-2 focus:ring-[var(--premium-violet)]"
                }`}
              />
              {errors.email && touched.email && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-bold text-slate-400">
                  {passengerPhone.length}/10 digits
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
                  value={passengerPhone}
                  onChange={(e) => handleFieldChange("phone", e.target.value, setPassengerPhone)}
                  className={`w-full px-3.5 py-2.5 text-sm font-medium focus:outline-none bg-white ${
                    errors.phone && touched.phone
                      ? "bg-rose-50/20 text-rose-900"
                      : ""
                  }`}
                />
              </div>
              {errors.phone && touched.phone && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>
          </div>

          {passengers && passengers.length > 1 && (
            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                All Passengers ({passengers.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {passengers.map((p, idx) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    <User className="w-3 h-3 text-slate-400" />
                    <span>
                      {p.title} {p.firstName} {p.lastName}
                    </span>
                    <span className="text-[10px] text-slate-400">({p.gender}, {p.dob})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add-ons & Fare Breakdown with Hold Timer Banner */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Fare & Fee Breakdown</h3>
            <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              Travelport GDS Verified
            </span>
          </div>

          {isPricingLoading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-500">
                Verifying live airline inventory, taxes, and baggage charges with Travelport API...
              </p>
            </div>
          ) : pricingError ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">Fare Pricing Notice</p>
                <p>{pricingError}</p>
              </div>
            </div>
          ) : pricing ? (
            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              {/* 1. Base Fare Section with Passenger Breakdown */}
              <div className="pt-1 space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>Base Airfare ({pricing.paxBreakdown?.totalPax || totalPax} Passengers)</span>
                  <span>₹{pricing.baseFare.toLocaleString("en-IN")}</span>
                </div>
                {pricing.paxBreakdown && (
                  <div className="text-[11px] text-slate-500 space-y-0.5 pl-2 border-l-2 border-slate-200">
                    <div className="flex justify-between">
                      <span>{pricing.paxBreakdown.adults.count} Adult{pricing.paxBreakdown.adults.count > 1 ? "s" : ""} (₹{pricing.paxBreakdown.adults.perPaxBase.toLocaleString("en-IN")} each)</span>
                      <span>₹{pricing.paxBreakdown.adults.totalBase.toLocaleString("en-IN")}</span>
                    </div>
                    {pricing.paxBreakdown.children.count > 0 && (
                      <div className="flex justify-between">
                        <span>{pricing.paxBreakdown.children.count} Child{pricing.paxBreakdown.children.count > 1 ? "ren" : ""} (Dedicated seat · ₹{pricing.paxBreakdown.children.perPaxBase.toLocaleString("en-IN")} each)</span>
                        <span>₹{pricing.paxBreakdown.children.totalBase.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    {pricing.paxBreakdown.infants.count > 0 && (
                      <div className="flex justify-between">
                        <span>{pricing.paxBreakdown.infants.count} Infant{pricing.paxBreakdown.infants.count > 1 ? "s" : ""} (DGCA Lap Fee · ₹{pricing.paxBreakdown.infants.perPaxFee.toLocaleString("en-IN")} each)</span>
                        <span>₹{pricing.paxBreakdown.infants.totalFee.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Fare Tier Upgrade */}
              {pricing.fareDelta > 0 && (
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <span className="text-slate-800 font-semibold block">{selectedFare?.name || "Fare Brand"} Upgrade</span>
                    <span className="text-[10px] text-slate-400">₹{selectedFare?.priceDelta} per seated traveler</span>
                  </div>
                  <span className="font-bold text-slate-900">+₹{pricing.fareDelta.toLocaleString("en-IN")}</span>
                </div>
              )}

              {/* 3. Mandatory Aviation Taxes & Airport Surcharges (Travelport GDS Breakdown) */}
              <div className="pt-2 space-y-1">
                <div className="flex justify-between items-center text-slate-700">
                  <span>Airline Fuel Surcharge (YQ/YR)</span>
                  <span className="font-semibold text-slate-900">+₹{pricing.fuelSurcharge.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>Airport Development & Passenger Service Fee (UDF/PSF)</span>
                  <span className="font-semibold text-slate-900">+₹{pricing.airportFees.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>Aviation GST (K3 Tax - 5%)</span>
                  <span className="font-semibold text-slate-900">+₹{pricing.gstTax.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* 4. Selected Seats Itemized Breakdown */}
              {pricing.ancillaryBreakdown?.seats && pricing.ancillaryBreakdown.seats.items.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 font-semibold">
                      Selected Seats ({pricing.ancillaryBreakdown.seats.items.map(s => s.seatCode).join(", ")})
                    </span>
                    <span className="font-bold text-slate-900">+₹{pricing.ancillaryBreakdown.seats.total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-2 border-l-2 border-slate-200 space-y-0.5">
                    {pricing.ancillaryBreakdown.seats.items.map((seat, i) => (
                      <div key={i} className="flex justify-between">
                        <span>Seat {seat.seatCode}</span>
                        <span>₹{seat.price.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Pre-booked Baggage Itemized Breakdown */}
              {pricing.ancillaryBreakdown?.baggage && pricing.ancillaryBreakdown.baggage.items.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 font-semibold">Pre-booked Extra Baggage</span>
                    <span className="font-bold text-slate-900">+₹{pricing.ancillaryBreakdown.baggage.total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-2 border-l-2 border-slate-200 space-y-0.5">
                    {pricing.ancillaryBreakdown.baggage.items.map((bag, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{bag.name} {bag.qty > 1 ? `(×${bag.qty})` : ""}</span>
                        <span>₹{(bag.price * bag.qty).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Gourmet In-flight Meals Itemized Breakdown */}
              {pricing.ancillaryBreakdown?.meals && pricing.ancillaryBreakdown.meals.items.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 font-semibold">In-flight Gourmet Meals</span>
                    <span className="font-bold text-slate-900">+₹{pricing.ancillaryBreakdown.meals.total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-2 border-l-2 border-slate-200 space-y-0.5">
                    {pricing.ancillaryBreakdown.meals.items.map((meal, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{meal.name} {meal.qty > 1 ? `(×${meal.qty})` : ""}</span>
                        <span>₹{(meal.price * meal.qty).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Verified Discount (only if > 0) */}
              {pricing.discount > 0 && (
                <div className="flex justify-between items-center pt-2 text-pink-600 font-medium">
                  <span>Verified Airline Discount</span>
                  <span>-₹{pricing.discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              {/* 8. Total Payable */}
              <div className="flex justify-between items-center pt-3 text-base font-bold text-slate-900">
                <div>
                  <span className="block leading-tight">Total Amount Payable</span>
                  <span className="text-[10px] text-slate-400 font-normal">Includes all taxes, airport fees & add-ons</span>
                </div>
                <span className="text-xl text-[var(--premium-violet)] font-black">
                  ₹{pricing.totalPayable.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Cancellation, Baggage & Rescheduling Policy Card */}
        {pricing && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-pink-600" />
                <span>Airline Cancellation & Baggage Policy</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                DGCA & Travelport Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Cancellation Charge
                </span>
                <p className="text-sm font-extrabold text-slate-900">
                  {pricing.fareRules.cancellationFee === 0 ? (
                    <span className="text-pink-600 font-black">ZERO Cancellation Fee (100% Refund)</span>
                  ) : (
                    `₹${pricing.fareRules.cancellationFee.toLocaleString("en-IN")} per passenger`
                  )}
                </p>
                <p className="text-[10px] text-slate-500">
                  {pricing.fareRules.cancellationPolicy}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Date Rescheduling Fee
                </span>
                <p className="text-sm font-extrabold text-slate-900">
                  {pricing.fareRules.dateChangeFee === 0 ? (
                    <span className="text-pink-600 font-black">ZERO Change Fee (Pay fare diff only)</span>
                  ) : (
                    `₹${pricing.fareRules.dateChangeFee.toLocaleString("en-IN")} + fare diff`
                  )}
                </p>
                <p className="text-[10px] text-slate-500">
                  {pricing.fareRules.dateChangePolicy}
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg font-semibold">
                🧳 Baggage Allowance: <strong>{pricing.fareRules.baggageAllowance || "7kg Cabin + 15kg Check-in"}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 px-3 py-1 rounded-lg font-semibold border border-pink-200">
                ⏱️ Free 24h cancellation window from booking
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-4 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Grand Total
            </span>
            <div className="text-xl font-bold text-slate-900">
              ₹{grandTotal.toLocaleString("en-IN")}
            </div>
          </div>

          <button
            type="button"
            disabled={isProcessing || isPricingLoading}
            onClick={handlePay}
            className="px-6 py-3 rounded-xl bg-[var(--premium-violet)] text-white font-bold text-sm shadow-xs hover:opacity-95 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Issuing PNR...</span>
              </>
            ) : isPricingLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Fare...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{grandTotal.toLocaleString("en-IN")}</span>
              </>
            )}
          </button>
        </div>
      </footer>

      {showRazorpayModal && (
        <RazorpayCheckoutModal
          isOpen={showRazorpayModal}
          onClose={() => {
            setShowRazorpayModal(false);
            setToastMessage("Payment window was closed. No booking was made.");
          }}
          amount={grandTotal}
          orderId={createdOrderId}
          serviceName="RouTripO Flights"
          orderDescription={`Flight Booking - ${airline} ${flightNo}`}
          customerName={passengerName}
          customerEmail={passengerEmail}
          customerPhone={passengerPhone}
          onSuccess={async (details) => {
            setShowRazorpayModal(false);
            await processBookingSuccess(details.razorpay_payment_id);
          }}
          onFailure={(err) => {
            setShowRazorpayModal(false);
            setToastMessage(`Payment Failed: ${err}`);
          }}
        />
      )}
    </div>
  );
};
