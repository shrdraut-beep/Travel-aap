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
  Sparkles, 
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
import { BookingItemPayload } from '../travel/UniversalBookingCheckoutModal';
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

  const [step, setStep] = useState<'fare' | 'addons' | 'details'>('details');
  const [activeAddonTab, setActiveAddonTab] = useState<'seats' | 'meals' | 'baggage'>('seats');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isFareSheetOpen, setIsFareSheetOpen] = useState(false);

  // Razorpay & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any | null>(null);
  const [pnrNumber, setPnrNumber] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Initialize legs & fare on mount
  useEffect(() => {
    console.log("BookingFlowModal received item:", item);
    if (item) {
      const baseFare = item.amount || 4850;
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
      if (item.vertical === 'flight' || item.vertical === 'train') {
        // Start at fare selection or details
        setStep('details');
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

  const handleConfirmRazorpayPayment = async () => {
    if (!currentUser) {
      useAuthStore.getState().openAuthModal(() => handleConfirmRazorpayPayment());
      return;
    }

    setIsReviewOpen(false);
    setIsProcessing(true);

    try {
      if (!(window as any).Razorpay) {
        throw new Error('Razorpay SDK not loaded.');
      }

      const checkoutPayload = buildCheckoutPayload();
      const deviceId = await getDeviceFingerprint();
      const idempotencyKey = `IDEM_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${state.passengerCount}`;
      const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

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

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      const rzpOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123',
        amount: data.order.amount,
        currency: data.order.currency || 'INR',
        name: 'RouTripO Travel Bookings',
        description: `${item.title} (${state.passengerCount} Pax)`,
        order_id: data.order.id,
        handler: async function (response: any) {
          const pnr = Math.random().toString(36).substring(2, 10).toUpperCase();
          setPnrNumber(pnr);

          // Save enriched payload into Firestore bookings
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
            paymentId: response.razorpay_payment_id,
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
        },
        prefill: {
          name: `${state.passengers[0]?.firstName} ${state.passengers[0]?.lastName}`.trim(),
          email: state.billingEmail,
          contact: state.billingPhone,
        },
        theme: { color: '#0B1E3D' },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', function (resp: any) {
        alert('Payment failed: ' + resp.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Booking Failed: ' + (err.message || 'Server error'));
      setIsProcessing(false);
    }
  };

  const handleDownloadTicket = async () => {
    const el = document.getElementById('ticketReceiptContainer');
    if (!el) return;
    setIsDownloading(true);
    try {
      await exportElementToPdf(el, `RouTripO_Ticket_${pnrNumber || 'Booking'}.pdf`);
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
                onClick={step !== 'details' ? () => setStep('details') : onClose}
                className="p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
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
                  onClick={() => setIsFareSheetOpen(true)}
                  className={`px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    state.selectedFare ? 'bg-amber-50 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Fare: {state.selectedFare?.label.split(' ')[0] || 'Saver'}</span>
                </button>
              )}

              {/* Add-ons Tab */}
              {(item.vertical === 'flight' || item.vertical === 'train') && (
                <button
                  type="button"
                  onClick={() => setStep('addons')}
                  className={`px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    step === 'addons' ? 'bg-[#FF5A5F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Armchair className="w-3.5 h-3.5" />
                  <span>
                    Add-ons ({state.seats.length} Seats • {state.meals.length} Meals)
                  </span>
                </button>
              )}

              {/* Passenger Details Step */}
              <button
                type="button"
                onClick={() => setStep('details')}
                className={`px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  step === 'details' ? 'bg-[#FF5A5F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>
                  Passengers ({state.passengerCount})
                </span>
              </button>
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
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
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
                    <span className="text-xl font-mono font-black text-slate-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-xl inline-block">
                      {pnrNumber || completedBooking.PNR_Number}
                    </span>
                  </div>
                </div>

                {/* Journey & Passenger Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Journey Details</span>
                    <h5 className="font-black text-slate-900 text-sm">{completedBooking.itemTitle || item.title}</h5>
                    <p className="text-slate-600 font-medium">{item.subtitle || item.location}</p>
                    <p className="font-bold text-slate-900">{item.date || 'Scheduled Travel Date'} • {item.time || 'On Time'}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
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
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div>
                    <span>Selected Seats: {state.seats.length > 0 ? state.seats.map((s) => s.seatCode).join(', ') : 'Free Assigned'}</span>
                    <span className="block text-slate-500 text-[11px]">
                      Meals: {state.meals.length} items | Extra Baggage: {state.baggage.reduce((acc, b) => acc + b.kg, 0)} kg
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Paid Amount</span>
                    <span className="text-base font-black text-emerald-600">
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
                  className="px-6 py-3 bg-[#FF5A5F] hover:bg-[#ff4046] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{isDownloading ? 'Generating PDF...' : 'Download E-Ticket & GST Invoice'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : step === 'addons' ? (
            /* Addons Step (Multi-tab: Seat / Meal / Baggage) */
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveAddonTab('seats')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeAddonTab === 'seats' ? 'bg-[#FF5A5F] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Armchair className="w-4 h-4" />
                  <span>Seats ({state.seats.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAddonTab('meals')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeAddonTab === 'meals' ? 'bg-[#FF5A5F] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  <span>Meals ({state.meals.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAddonTab('baggage')}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeAddonTab === 'baggage' ? 'bg-[#FF5A5F] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Luggage className="w-4 h-4" />
                  <span>Baggage ({state.baggage.length})</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeAddonTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeAddonTab === 'seats' && (
                    <SeatSelection
                      legs={state.legs.map((l) => ({ id: l.id, label: `${l.from} → ${l.to}` }))}
                      onSkip={() => setActiveAddonTab('meals')}
                      onNext={() => setActiveAddonTab('meals')}
                      onBack={() => setStep('details')}
                    />
                  )}

                  {activeAddonTab === 'meals' && (
                    <MealSelection
                      legs={state.legs.map((l) => ({ id: l.id, label: `${l.from} → ${l.to}` }))}
                      onSkip={() => setActiveAddonTab('baggage')}
                      onNext={() => setActiveAddonTab('baggage')}
                      onBack={() => setActiveAddonTab('seats')}
                    />
                  )}

                  {activeAddonTab === 'baggage' && (
                    <BaggageSelection
                      legs={state.legs.map((l) => ({ id: l.id, label: `${l.from} → ${l.to}` }))}
                      onSkip={() => setIsReviewOpen(true)}
                      onNext={() => setIsReviewOpen(true)}
                      onBack={() => setActiveAddonTab('meals')}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            /* Details Step (Passenger Form with strict N validation + Policy Table + Billing & Breakup) */
            <div className="space-y-6">
              {/* Selected Fare summary banner */}
              {state.selectedFare && (
                <div className="bg-white rounded-3xl p-4 border border-amber-300 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-900 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-700 block">Selected Fare Flexibility</span>
                      <h4 className="font-black text-sm text-slate-900">{state.selectedFare.label}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {state.selectedFare.cabinBaggageKg}kg Cabin + {state.selectedFare.checkinBaggageKg}kg Check-in • {state.selectedFare.seatsIncluded === 'free' ? 'Free Seats' : 'Paid Seats'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFareSheetOpen(true)}
                    className="px-3 py-1.5 rounded-xl border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs transition-colors cursor-pointer"
                  >
                    Change Fare
                  </button>
                </div>
              )}

              {/* Dynamic N-Passenger Form */}
              <PassengerForm />

              {/* Fare Policy Rules & Cancellation Slabs Table */}
              <PolicyTable />

              {/* Billing, GST & Fare Breakup Card */}
              <BillingAndFareBreakup onReviewClick={() => {
                if (item.vertical === 'flight' || item.vertical === 'train') {
                  setStep('addons');
                  setActiveAddonTab('seats');
                } else {
                  setIsReviewOpen(true);
                }
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
          setStep('details');
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
