// src/components/booking/BookingFlowModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Building, 
  Compass as  
  Armchair, 
  Utensils, 
  Luggage, 
  UserCheck, 
  ShieldCheck, 
  ArrowLeft,
  ArrowRight,
  Receipt,
  CheckCircle2,
  FileText,
  Clock
} from 'lucide-react';
import { useBookingFlow, FareTier } from '../../context/BookingFlowContext';
import { HoldTimer } from './HoldTimer';
import { FarePlansSheet, DEFAULT_FARE_TIERS } from './FarePlansSheet';
import { SeatSelection } from './SeatSelection';
import { MealSelection } from './MealSelection';
import { BaggageSelection } from './BaggageSelection';
import { PassengerForm } from './PassengerForm';
import { PolicyTable } from './PolicyTable';
import { BillingAndFareBreakup } from './BillingAndFareBreakup';
import { ReviewDetailsModal } from './ReviewDetailsModal';
import { BookingItemPayload } from '../../pages/CheckoutPage';
import { apiClient } from '../../utils/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { getDeviceFingerprint } from '../../utils/deviceFingerprint';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { exportElementToPdf } from '../../utils/exportUtils';

export interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BookingItemPayload;
  currencySymbol?: string;
  lang?: string;
  onBookingSuccess?: (receipt: any) => void;
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  isOpen,
  onClose,
  item,
  currencySymbol = '₹',
  lang = 'en',
  onBookingSuccess,
}) => {
  const { state, dispatch, totals, isPassengerFormValid, buildCheckoutPayload } = useBookingFlow();
  const currentUser = useAuthStore((s) => s.currentUser);

  const [step, setStep] = useState<'fare' | 'passengers' | 'seats' | 'meals' | 'baggage' | 'review' | 'payment'>('fare');
  const [activeAddonTab, setActiveAddonTab] = useState<'seats' | 'meals' | 'baggage'>('seats');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isFareSheetOpen, setIsFareSheetOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Razorpay & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any | null>(null);
  const [pnrNumber, setPnrNumber] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Initialize legs & fare on mount
  useEffect(() => {
    console.log("BookingFlowModal received item:", item);
    if (item) {
      const baseFare = item.amount || 0;
      const defaultFare = DEFAULT_FARE_TIERS(baseFare)[0];
      dispatch({ type: 'SELECT_FARE', fare: defaultFare });
      dispatch({
        type: 'SET_LEGS',
        legs: [
          {
            id: 'leg-1',
            from: item.subtitle?.split('→')[0]?.trim() || item.location?.split('to')[0]?.trim() || 'ORIGIN',
            to: item.subtitle?.split('→')[1]?.trim() || item.location?.split('to')[1]?.trim() || 'DEST',
            date: item.date || new Date().toISOString().split('T')[0],
            flightNo: item.title,
            airline: item.provider || 'RoutTripo Verified',
          },
        ],
      });
      // Start at passengers selection
      setStep('passengers');
      if (item.vertical === 'flight' || item.vertical === 'train') {
        setIsFareSheetOpen(true);
      }
    }
  }, [item, dispatch]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (!isOpen) return null;

  const handleCompleteBookingWithPayment = async (paymentId: string) => {
    const pnr = Math.random().toString(36).substring(2, 10).toUpperCase();
    setPnrNumber(pnr);
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    try {
      const newDocRef = await addDoc(collection(db, 'bookings'), {
        userId: currentUser?.id || 'guest',
        bookingId: orderId,
        orderId,
        itemId: item.id,
        itemTitle: item.title,
        vertical: item.vertical,
        date: item.date || new Date().toISOString().split('T')[0],
        quantity: state.passengerCount,
        totalAmount: totals.grandTotal,
        status: 'Confirmed',
        paymentId,
        customer: {
          name: `${state.passengers[0]?.firstName} ${state.passengers[0]?.lastName}`,
          email: state.billingEmail,
          phone: state.billingPhone,
        },
        passengers: state.passengers,
        addons: {
          seats: state.seats,
          meals: state.meals,
          baggage: state.baggage,
          fareTier: state.selectedFare,
        },
        billing: {
          phone: state.billingPhone,
          email: state.billingEmail,
          gstNumber: state.hasGst ? state.gstNumber : null,
        },
        PNR_Number: pnr,
        createdAt: new Date().toISOString(),
      });

      setCompletedBooking({
        id: newDocRef.id,
        bookingId: orderId,
        status: 'Confirmed',
        totalAmount: totals.grandTotal,
        PNR_Number: pnr,
        passengers: state.passengers,
        seats: state.seats,
        meals: state.meals,
        baggage: state.baggage,
        fareTier: state.selectedFare,
        ...item,
      });
      setIsProcessing(false);
      if (onBookingSuccess) onBookingSuccess({ bookingId: orderId, pnr });
    } catch (e) {
      console.warn('Firestore booking save fallback:', e);
      setCompletedBooking({
        id: orderId,
        bookingId: orderId,
        status: 'Confirmed',
        totalAmount: totals.grandTotal,
        PNR_Number: pnr,
        passengers: state.passengers,
        seats: state.seats,
        meals: state.meals,
        baggage: state.baggage,
        fareTier: state.selectedFare,
        ...item,
      });
      setIsProcessing(false);
      if (onBookingSuccess) onBookingSuccess({ bookingId: orderId, pnr });
    }
  };

  const handleConfirmRazorpayPayment = async () => {
    if (!currentUser) {
      useAuthStore.getState().openAuthModal(() => handleConfirmRazorpayPayment());
      return;
    }

    setIsReviewOpen(false);

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    setIsProcessing(true);
    try {
      const deviceId = await getDeviceFingerprint();
      const idempotencyKey = `IDEM_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${state.passengerCount}`;

      const res = await apiClient.authedFetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          itemType: item.vertical,
          itemId: item.id,
          quantity: state.passengerCount,
          amount: totals.grandTotal,
          deviceId,
          idempotencyKey,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.order?.id) {
        setIsProcessing(false);
        alert(`Order creation failed: ${data.error || "Could not initialize Razorpay order"}`);
        return;
      }

      const effectiveKey = data.keyId || data.key || keyId;
      if (!effectiveKey) {
        setIsProcessing(false);
        alert("Razorpay Key ID is not configured.");
        return;
      }

      if (typeof (window as any).Razorpay === 'undefined') {
        setIsProcessing(false);
        alert("Razorpay Checkout SDK is still loading. Please try again.");
        return;
      }

      const rzpOptions = {
        key: effectiveKey,
        amount: data.order.amount,
        currency: data.order.currency || 'INR',
        name: 'RoutTripo Travel Bookings',
        description: `${item.title} (${state.passengerCount} Pax)`,
        order_id: data.order.id,
        handler: async function (response: any) {
          setIsProcessing(true);
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success || verifyData.verified) {
              await handleCompleteBookingWithPayment(response.razorpay_payment_id);
            } else {
              alert(`Payment verification failed: ${verifyData.error || "Untrusted signature"}`);
            }
          } catch (vErr: any) {
            alert(`Verification error: ${vErr?.message || "Could not verify payment"}`);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${state.passengers[0]?.firstName || ''} ${state.passengers[0]?.lastName || ''}`.trim(),
          email: state.billingEmail,
          contact: state.billingPhone,
        },
        theme: { color: '#072654' },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            alert("Payment cancelled. No booking was created.");
          }
        }
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', function (resp: any) {
        alert('Payment failed: ' + resp.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      alert(`Razorpay Error: ${err?.message || "Could not launch payment window"}`);
    }
  };

  const handleDownloadTicket = async () => {
    const el = document.getElementById('ticketReceiptContainer');
    if (!el) return;
    setIsDownloading(true);
    try {
      await exportElementToPdf(el, `RoutTripo_Ticket_${pnrNumber || 'Booking'}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-[#F7F8FA] w-full max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[92dvh] rounded-none sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border-t sm:border border-slate-200 animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200">
        {/* Top App Bar with Hold Timer */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {!completedBooking && (
              <button
                type="button"
                onClick={step !== 'passengers' ? () => setStep('passengers') : onClose}
                className="p-1 rounded-[16px] bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#FF5A5F] uppercase font-black block">
                {completedBooking ? 'Booking Confirmed' : `${item?.vertical?.toUpperCase() || 'BOOKING'} SECURE CHECKOUT`}
              </span>
              <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">{item.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!completedBooking && <HoldTimer />}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Navigation Pill Bar (if active checkout) */}
        {!completedBooking && (
          <div className="bg-white px-6 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Fare Plans Pill */}
              {(item.vertical === 'flight' || item.vertical === 'train') && (
                <button
                  type="button"
                  onClick={() => setStep('fare')}
                  className={`px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    step === 'fare' ? 'bg-[#FF5A5F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Fare: {state.selectedFare?.label.split(' ')[0] || 'Saver'}</span>
                </button>
              )}

              {/* Passenger Details Step */}
              <button
                type="button"
                onClick={() => setStep('passengers')}
                disabled={!state.selectedFare}
                className={`px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  step === 'passengers' ? 'bg-[#FF5A5F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                } ${!state.selectedFare ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Passengers ({state.passengerCount})</span>
              </button>

              {/* Seats Step */}
              {(item.vertical === 'flight' || item.vertical === 'train') && (
                <>
                  <button
                    type="button"
                    onClick={() => setStep('seats')}
                    disabled={!isPassengerFormValid}
                    className={`px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      step === 'seats' ? 'bg-[#FF5A5F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } ${!isPassengerFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Armchair className="w-3.5 h-3.5" />
                    <span>Seats</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('meals')}
                    disabled={!isPassengerFormValid}
                    className={`px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      step === 'meals' ? 'bg-[#FF5A5F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } ${!isPassengerFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Meals</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('baggage')}
                    disabled={!isPassengerFormValid}
                    className={`px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      step === 'baggage' ? 'bg-[#FF5A5F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } ${!isPassengerFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Luggage className="w-3.5 h-3.5" />
                    <span>Baggage</span>
                  </button>
                </>
              )}
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-black text-slate-900">
                Total: ₹{totals.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 [&::-webkit-scrollbar]:hidden">
          {completedBooking ? (
            /* Post Booking Confirmed Ticket Receipt View */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div
                id="ticketReceiptContainer"
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[20px] bg-premium-sky-soft text-premium-sky-deep flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Booking Confirmed!</h3>
                      <p className="text-xs text-slate-500 font-bold">
                        E-Ticket sent to {state.billingEmail} • +91 {state.billingPhone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      PNR Reference
                    </span>
                    <span className="text-xl font-mono font-black text-slate-900 bg-premium-pink-soft border border-premium-pink px-3 py-1 rounded-[16px] inline-block">
                      {pnrNumber || completedBooking.PNR_Number}
                    </span>
                  </div>
                </div>

                {/* Journey & Passenger Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-transparent p-4 rounded-[20px] border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Journey Details</span>
                    <h5 className="font-black text-slate-900 text-sm">{completedBooking.itemTitle || item.title}</h5>
                    <p className="text-slate-600 font-medium">{item.subtitle || item.location}</p>
                    <p className="font-bold text-slate-900">{item.date || 'Scheduled Travel Date'} • {item.time || 'On Time'}</p>
                  </div>

                  <div className="bg-transparent p-4 rounded-[20px] border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Passenger List</span>
                    {state.passengers.map((pax, idx) => (
                      <div key={idx} className="flex items-center justify-between font-bold text-slate-800">
                        <span>{idx + 1}. {pax.salutation} {pax.firstName} {pax.lastName}</span>
                        <span className="text-slate-500 text-[11px]">{pax.gender} • {pax.nationality}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add-ons & Fare summary */}
                <div className="bg-transparent p-4 rounded-[20px] border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div>
                    <span>Selected Seats: {state.seats.length > 0 ? state.seats.map((s) => s.seatCode).join(', ') : 'Free Assigned'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Paid Amount</span>
                    <span className="text-base font-black text-premium-sky-deep">
                      ₹{totals.grandTotal.toLocaleString('en-IN')} (PAID)
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadTicket}
                  disabled={isDownloading}
                  className="px-6 py-3 bg-[#FF5A5F] hover:bg-[#ff4046] text-white font-black text-xs uppercase tracking-wider rounded-[20px] transition-all shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] flex items-center gap-2 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{isDownloading ? 'Generating PDF...' : 'Download E-Ticket & GST Invoice'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs uppercase tracking-wider rounded-[20px] transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : step === 'seats' ? (
            <SeatSelection
              legs={state.legs.map((l) => ({ id: l.id, label: `${l.from} → ${l.to}` }))}
              onSkip={() => setStep('meals')}
              onNext={() => setStep('meals')}
              onBack={() => setStep('passengers')}
            />
          ) : step === 'meals' ? (
            <MealSelection
              onSkip={() => setStep('baggage')}
              onNext={() => setStep('baggage')}
              onBack={() => setStep('seats')}
            />
          ) : step === 'baggage' ? (
            <BaggageSelection
              onSkip={() => setStep('review')}
              onNext={() => setStep('review')}
              onBack={() => setStep('meals')}
            />
          ) : step === 'review' ? (
            <ReviewDetailsModal
              isOpen={isReviewOpen}
              onClose={() => {
                setStep('passengers');
              }}
              onConfirmPayment={handleConfirmRazorpayPayment}
              flightSummary={{
                airline: item.provider || item.title,
                route: item.subtitle || item.location || 'Journey Route',
                date: item.date || 'Scheduled Date',
                time: item.time || 'Timetable',
              }}
            />
          ) : (
            /* Passengers Step */
            <div className="space-y-6">
              {/* Selected Fare summary banner */}
              {state.selectedFare && (
                <div className="bg-white rounded-3xl p-4 border border-premium-pink shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[20px] bg-[var(--premium-pink)]/10 text-premium-pink flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5 text-premium-pink" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-premium-pink block">Selected Fare Flexibility</span>
                      <h4 className="font-black text-sm text-slate-900">{state.selectedFare.label}</h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFareSheetOpen(true)}
                    className="px-3 py-1.5 rounded-[16px] border border-premium-pink bg-premium-pink-soft hover:bg-orange-100 text-premium-pink font-black text-xs transition-colors cursor-pointer"
                  >
                    Change Fare
                  </button>
                </div>
              )}

              {/* Dynamic N-Passenger Form */}
              <PassengerForm />

              {/* Policy Table */}
              <PolicyTable />

              {/* Billing, GST & Fare Breakup Card */}
              <BillingAndFareBreakup onReviewClick={() => {
                setStep('seats');
              }} vertical={item.vertical} />
            </div>
          )}
        </div>
      </div>

      {/* Fare Plans Modal Sheet */}
      <FarePlansSheet
        isOpen={isFareSheetOpen}
        onClose={() => setIsFareSheetOpen(false)}
        flightLabel={item.subtitle || `${item.location || 'BOM → DEL'}`}
        airline={item.provider || item.title}
        departDate={item.date || 'Today'}
        arriveDate={item.date || 'Today'}
        departTime={item.time?.split('-')[0]?.trim() || '08:00 AM'}
        arriveTime={item.time?.split('-')[1]?.trim() || '10:30 AM'}
        basePrice={item.amount}
      />

      {/* Final Review & Verification Modal */}
      <ReviewDetailsModal
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setStep('passengers');
        }}
        onConfirmPayment={handleConfirmRazorpayPayment}
        flightSummary={{
          airline: item.provider || item.title,
          route: item.subtitle || item.location || 'Journey Route',
          date: item.date || 'Scheduled Date',
          time: item.time || 'Timetable',
        }}
      />
    </div>,
    document.body
  );
};
