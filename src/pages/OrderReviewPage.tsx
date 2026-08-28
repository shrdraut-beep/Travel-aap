import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Plane, 
  Clock, 
  Luggage, 
  Compass as Sparkles, 
  ChevronRight, 
  Info,
  Users,
  AlertCircle,
  CheckCircle2,
  Shield,
  Utensils,
  Armchair,
  AlertTriangle,
  X,
  CreditCard,
  Download,
  FileText
} from 'lucide-react';
import { BrandHeader } from '../components/common/BrandHeader';
import { useCurrency } from '../components/booking/useCurrency';
import { useBookingFlow } from '../context/BookingFlowContext';
import { TicketSuccess } from '../components/booking/TicketSuccess';
import { 
  downloadFlightTicketPDF, 
  TicketDetailsData 
} from '../utils/TicketPDFGenerator';

export const OrderReviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formatToINRDisplay, convertToINR } = useCurrency();
  const { state: flowState } = useBookingFlow();

  const state = (location.state || {}) as {
    flight?: any;
    selectedFare?: any;
    selectedPlan?: any;
    passengers?: any[];
    contactInfo?: any;
    selectedSeats?: any[];
    selectedMeals?: any[];
    selectedBaggage?: any[];
    totalAmount?: number;
    seatAddonTotal?: number;
    mealAddonTotal?: number;
    baggageAddonTotal?: number;
    passengerCount?: number;
    adults?: number;
    children?: number;
    infants?: number;
    searchParams?: any;
    offer_id?: string;
    currency?: string;
    currencySymbol?: string;
  };

  const flight = state?.flight || {};
  const selectedFare = state?.selectedFare || state?.selectedPlan || flowState.selectedFare;
  const rawPassengers = state?.passengers || (flowState.passengers.length > 0 ? flowState.passengers : [
    { id: 'pax-1', firstName: 'Sharad', lastName: 'Raut', gender: 'Male', type: 'Adult', nationality: 'India', dob: '13/08/1986', title: 'Mr' }
  ]);
  const contactInfo = state?.contactInfo || {
    phone: flowState.billingPhone || '9876543210',
    email: flowState.billingEmail || 'traveller@routripo.com',
    hasGST: flowState.hasGst,
    gstNumber: flowState.gstNumber || '',
    companyName: ''
  };

  const selectedSeats = state?.selectedSeats || [];
  const selectedMeals = state?.selectedMeals || [];
  const selectedBaggage = state?.selectedBaggage || [];

  // Flight Route details
  const slices = flight?.slices || [];
  const firstSlice = slices[0] || {};
  const segments = firstSlice.segments || [];
  const firstSegment = segments[0] || {};
  const lastSegment = segments[segments.length - 1] || firstSegment;

  const originCode = firstSegment.origin?.iata_code || firstSegment.origin?.name || 'ISK';
  const originCity = firstSegment.origin?.city_name || firstSegment.origin?.name || 'Nasik';
  const destCode = lastSegment.destination?.iata_code || lastSegment.destination?.name || 'DEL';
  const destCity = lastSegment.destination?.city_name || lastSegment.destination?.name || 'Delhi';

  const airlineName = flight?.owner?.name || firstSegment.marketing_carrier?.name || 'IndiGo';
  const flightNumber = firstSegment.marketing_carrier_flight_number 
    ? `${firstSegment.marketing_carrier?.iata_code || '6E'} ${firstSegment.marketing_carrier_flight_number}` 
    : (flight?.title || '6E 7219');
  
  const departTime = firstSegment.departing_at 
    ? new Date(firstSegment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) 
    : '17:20';
  const arriveTime = lastSegment.arriving_at 
    ? new Date(lastSegment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) 
    : '02:00';
  const departDate = firstSegment.departing_at 
    ? new Date(firstSegment.departing_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) 
    : 'Fri, 21 Aug, 26';

  const stopsCount = segments.length > 1 ? segments.length - 1 : 0;
  const stopText = stopsCount === 0 ? 'Non Stop' : `${stopsCount} Stop`;
  const durationText = firstSlice.duration ? firstSlice.duration.replace('PT', '').toLowerCase() : '3h 15m Flight';
  const layoverCity = segments[0]?.destination?.city_name || segments[0]?.destination?.iata_code || 'Ahmedabad (AMD)';

  // Passenger counts
  const adults = rawPassengers.filter(p => (p.type === 'Adult' || p.passengerType === 'Adult')).length || 1;
  const children = rawPassengers.filter(p => (p.type === 'Child' || p.passengerType === 'Child')).length || 0;
  const infants = rawPassengers.filter(p => (p.type === 'Infant' || p.passengerType === 'Infant')).length || 0;

  // Base per-adult fare
  const farePerAdult = selectedFare?.inrPrice || selectedFare?.pricePerAdult || state?.totalAmount || 10854;
  const baseFareTotal = farePerAdult * adults + Math.round(farePerAdult * 0.85) * children + Math.round(farePerAdult * 0.2) * infants;
  const taxesAndFees = Math.round(baseFareTotal * 0.165);

  // Add-on Totals
  const seatAddonTotal = state?.seatAddonTotal ?? selectedSeats.reduce((acc: number, s: any) => acc + (s.price || 0), 0);
  const mealAddonTotal = state?.mealAddonTotal ?? selectedMeals.reduce((acc: number, m: any) => acc + (m.price || 0) * (m.qty || 1), 0);
  const baggageAddonTotal = state?.baggageAddonTotal ?? selectedBaggage.reduce((acc: number, b: any) => acc + (b.price || 0) * (b.qty || 1), 0);
  const totalSSRCharges = seatAddonTotal + mealAddonTotal + baggageAddonTotal;

  // Insurance & CFAR choices (Mandatory radio selection)
  const [insuranceChoice, setInsuranceChoice] = useState<'yes' | 'no' | null>(null);
  const [cfarChoice, setCfarChoice] = useState<'yes' | 'no' | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Countdown timer: 10 mins
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s} Mins left`;
  };

  const insuranceCost = insuranceChoice === 'yes' ? 180 : 0;
  const cfarCost = cfarChoice === 'yes' ? 1047 : 0;

  const grandTotal = baseFareTotal + taxesAndFees + totalSSRCharges + insuranceCost + cfarCost;

  // Modals & Payment UI
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);

  const handleProceedToPay = () => {
    if (!insuranceChoice) {
      setValidationError('Please select a travel insurance option.');
      window.scrollTo({ top: document.getElementById('insurance-section')?.offsetTop || 400, behavior: 'smooth' });
      return;
    }
    if (!cfarChoice) {
      setValidationError('Please select whether you want CFAR cancellation protection.');
      window.scrollTo({ top: document.getElementById('cfar-section')?.offsetTop || 600, behavior: 'smooth' });
      return;
    }
    if (!termsAccepted) {
      setValidationError('Please accept the Terms & Conditions to continue.');
      return;
    }

    setValidationError(null);
    setIsPreparingPayment(true);

    // Simulate payment loading
    setTimeout(() => {
      setIsPreparingPayment(false);
      
      // Check for Razorpay
      if ((window as any).Razorpay) {
        const rzpOptions = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mockKey123',
          amount: grandTotal * 100,
          currency: 'INR',
          name: 'RouTripO Flights',
          description: `${airlineName} ${flightNumber} (${rawPassengers.length} Travellers)`,
          handler: function (response: any) {
            const pnr = `RTR${Math.floor(100000 + Math.random() * 900000)}`;
            setBookingSuccessData({
              pnr,
              paymentId: response.razorpay_payment_id || `PAY_${Date.now()}`,
              amount: grandTotal,
              passengers: rawPassengers,
              flight,
              bookedAt: new Date().toISOString()
            });
          },
          prefill: {
            name: `${rawPassengers[0]?.firstName} ${rawPassengers[0]?.lastName}`.trim(),
            email: contactInfo.email,
            contact: contactInfo.phone
          },
          theme: {
            color: '#E11D48'
          },
          modal: {
            ondismiss: function () {
              setShowExitConfirm(true);
            }
          }
        };

        const rzp = new (window as any).Razorpay(rzpOptions);
        rzp.open();
      } else {
        // Direct Success fallback for demo environments
        const pnr = `RTR${Math.floor(100000 + Math.random() * 900000)}`;
        setBookingSuccessData({
          pnr,
          paymentId: `PAY_MOCK_${Date.now()}`,
          amount: grandTotal,
          passengers: rawPassengers,
          flight,
          bookedAt: new Date().toISOString()
        });
      }
    }, 1200);
  };

  // If Booking is confirmed, render Official E-Ticket Screen
  if (bookingSuccessData) {
    const formattedPax = rawPassengers.map((p, idx) => ({
      title: p.title || (p.gender === 'Female' ? 'Mrs' : 'Mr'),
      firstName: p.firstName,
      lastName: p.lastName,
      type: p.type || 'Adult',
      gender: p.gender || 'Male',
      seat: selectedSeats[idx]?.seatCode || (idx === 0 ? '7A' : idx === 1 ? '7B' : '7C'),
      status: 'CONFIRMED'
    }));

    const ticketData: TicketDetailsData = {
      pnrNumber: bookingSuccessData.pnr,
      airlineName,
      flightNumber,
      fareName: selectedFare?.label || 'Saver (Regular)',
      originCode,
      originCity,
      originAirport: `${originCity} Airport`,
      originTerminal: 'T1',
      destCode,
      destCity,
      destAirport: `${destCity} Airport`,
      destTerminal: 'T2',
      departTime,
      departDate,
      arriveTime,
      arriveDate: departDate,
      duration: durationText,
      cabinClass: 'Economy',
      stopsText: stopText,
      cabinBaggage: '7 Kg',
      checkinBaggage: '15 Kg',
      passengers: formattedPax.map(p => ({
        name: `${p.title} ${p.firstName} ${p.lastName}`.trim(),
        type: p.type,
        seat: p.seat,
        cabinBaggage: '7 Kg',
        checkinBaggage: '15 Kg'
      })),
      contactEmail: contactInfo.email,
      contactPhone: contactInfo.phone,
      baseFare: baseFareTotal,
      taxesAndFees,
      seatFee: totalSSRCharges,
      convenienceFee: 0,
      totalPaid: grandTotal,
      paymentMethod: 'UPI / NetBanking (Online)',
      paymentId: bookingSuccessData.paymentId,
      bookedAt: bookingSuccessData.bookedAt
    };

    return (
      <div className="min-h-screen bg-[#F7F8FA] py-8">
        <TicketSuccess
          ticketData={ticketData}
          onDone={() => navigate('/')}
        />
      </div>
    );
  }

  // Payment Cancelled Screen
  if (paymentCancelled) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-[Inter]">
        <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-rose-500 mb-6 animate-in zoom-in-90">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Payment cancelled</h2>
        <div className="flex items-center gap-2 text-base font-bold text-slate-700 mb-1">
          <span>{originCode}</span>
          <span>→</span>
          <span>{destCode}</span>
        </div>
        <p className="text-xs text-slate-500 mb-8">
          {rawPassengers.length} Travellers • One-way • Economy Class
        </p>

        <button
          onClick={() => {
            setPaymentCancelled(false);
            navigate('/');
          }}
          className="w-full max-w-sm py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl transition-all cursor-pointer"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-[Inter]">
      {/* 1. Header with live hold timer */}
      <BrandHeader
        title="Review Details"
        subtitle={`${originCode} ➔ ${destCode}`}
        onBack={() => navigate(-1)}
        rightElement={
          <div className="bg-white/15 px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>
        }
      />

      <div className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-4 pb-36 overflow-y-auto">
        {/* Error notification */}
        {validationError && (
          <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs font-bold text-rose-800 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 2. Flight Overview Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-800 text-xs">
                ✈
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">{airlineName}</h3>
                <p className="text-[11px] font-semibold text-slate-500">{flightNumber}</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
              Economy
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-base font-extrabold text-slate-900 mb-1">
              <span>{originCity} ({originCode})</span>
              <span className="text-slate-400">→</span>
              <span>{destCity} ({destCode})</span>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Departure – {departDate} &nbsp;•&nbsp; {stopText} &nbsp;•&nbsp; {durationText} &nbsp;•&nbsp; {departTime} ➔ {arriveTime}
            </p>
          </div>
        </div>

        {/* 3. Passengers & Sector Breakdown */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Passenger</span>

          {rawPassengers.map((pax: any, idx: number) => {
            const fullName = `${pax.firstName || 'Traveller'} ${pax.lastName || (idx + 1)}`.trim();
            const genderLetter = (pax.gender || 'Male')[0];
            const paxType = pax.type || pax.passengerType || 'Adult';
            const assignedSeat = selectedSeats[idx]?.seatCode || (idx === 0 ? '7A' : '--');

            return (
              <div key={idx} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-black">
                      👤
                    </div>
                    <span className="font-black text-slate-900 text-sm">{fullName}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{genderLetter} &nbsp;&nbsp; {paxType}</span>
                </div>

                <div className="pl-8 space-y-1.5 text-xs text-slate-600">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="font-extrabold text-slate-900 block">{originCode} ➔ {segments[0]?.destination?.iata_code || 'AMD'}</span>
                    <span className="text-[11px] text-slate-500">Seat: <b className="text-slate-800">{assignedSeat}</b> &nbsp;•&nbsp; Meal: -- &nbsp;•&nbsp; Extra Baggage: --</span>
                  </div>
                  {segments.length > 1 && (
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="font-extrabold text-slate-900 block">{segments[0]?.destination?.iata_code || 'AMD'} ➔ {destCode}</span>
                      <span className="text-[11px] text-slate-500">Seat: <b className="text-slate-800">--</b> &nbsp;•&nbsp; Meal: -- &nbsp;•&nbsp; Extra Baggage: --</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-100">
            Booking Details will be sent to <b className="text-slate-800">{contactInfo.email}</b> and <b className="text-slate-800">+91 {contactInfo.phone}</b>
          </div>
        </div>

        {/* 4. Travel Insurance Card */}
        <div id="insurance-section" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
            <Shield className="w-4 h-4 text-rose-600" />
            <span>Travel Insurance</span>
          </div>

          <div className="text-sm font-black text-slate-900">
            ₹ 180/Total <span className="text-xs font-semibold text-slate-500">(18% GST included)</span>
          </div>

          <div className="space-y-2.5 pt-1">
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              insuranceChoice === 'yes' ? 'border-rose-600 bg-rose-50/30' : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="radio"
                name="insurance"
                checked={insuranceChoice === 'yes'}
                onChange={() => setInsuranceChoice('yes')}
                className="mt-0.5 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">Yes, Secure my trip for ₹ 180</span>
                <span className="text-[11px] text-slate-500">Comprehensive baggage loss, medical & delay coverage</span>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              insuranceChoice === 'no' ? 'border-rose-600 bg-rose-50/30' : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="radio"
                name="insurance"
                checked={insuranceChoice === 'no'}
                onChange={() => setInsuranceChoice('no')}
                className="mt-0.5 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">No, I will book without trip secure.</span>
              </div>
            </label>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight pt-1">
            Trip Secure is non-refundable. By selecting, I confirm all travellers are Indian nationals, aged 6 months to 90 years, and accept the T&Cs.
          </p>
        </div>

        {/* 5. Cancel For Any Reason (CFAR) Card */}
        <div id="cfar-section" className="bg-slate-950 text-white rounded-2xl overflow-hidden shadow-md">
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black tracking-wide">Cancel For Any Reason (CFAR)</span>
              <span className="text-sm font-black text-amber-400">₹ 1,047</span>
            </div>

            <p className="text-xs font-bold text-slate-200">
              Get refunded for airline cancellation charges if you cancel your flight for any reason.
            </p>

            <div className="space-y-1.5 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Cancellation refund upto <b>₹10,500</b> (₹3,500 per passenger)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Cancel up to 24 hours before departure, no paperwork required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Price (₹1,047) covers all passengers for this flight</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2.5 text-xs font-bold cursor-pointer">
                <input
                  type="radio"
                  name="cfar"
                  checked={cfarChoice === 'yes'}
                  onChange={() => setCfarChoice('yes')}
                  className="text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>Yes, protect my booking for ₹ 1,047</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-400 cursor-pointer">
                <input
                  type="radio"
                  name="cfar"
                  checked={cfarChoice === 'no'}
                  onChange={() => setCfarChoice('no')}
                  className="text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>No, I'll skip CFAR protection</span>
              </label>
            </div>

            <div className="text-[10px] text-slate-400 text-right pt-1">
              Powered By SanKash - CARE
            </div>
          </div>
        </div>

        {/* 6. Terms & Conditions Checkbox */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-700 leading-relaxed">
              I have read and agree to RouTripO's <a href="#" className="font-bold text-rose-600 underline">User Agreement / Terms of Use</a>, <a href="#" className="font-bold text-rose-600 underline">Privacy Policy</a>, and <a href="#" className="font-bold text-rose-600 underline">Cancellation & Refund Policy</a>.
            </span>
          </label>
        </div>

        {/* 7. Fare Breakup */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-2.5 text-xs">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Fare breakup</span>

          <div className="flex items-center justify-between text-slate-600 font-semibold">
            <span>Base Fare ({rawPassengers.length} Traveller{rawPassengers.length > 1 ? 's' : ''})</span>
            <span className="text-slate-900 font-bold">₹{baseFareTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 font-semibold">
            <span>Taxes & Fees</span>
            <span className="text-slate-900 font-bold">₹{taxesAndFees.toLocaleString('en-IN')}</span>
          </div>

          {seatAddonTotal > 0 && (
            <div className="flex items-center justify-between text-slate-600 font-semibold">
              <span>Seat Charges</span>
              <span className="text-slate-900 font-bold">₹{seatAddonTotal.toLocaleString('en-IN')}</span>
            </div>
          )}

          {totalSSRCharges > 0 && (
            <div className="flex items-center justify-between text-slate-600 font-semibold">
              <span>Total SSR Charges (Meals / Baggage)</span>
              <span className="text-slate-900 font-bold">₹{totalSSRCharges.toLocaleString('en-IN')}</span>
            </div>
          )}

          {insuranceChoice === 'yes' && (
            <div className="flex items-center justify-between text-emerald-700 font-semibold">
              <span>Travel Insurance</span>
              <span className="font-bold">₹180</span>
            </div>
          )}

          {cfarChoice === 'yes' && (
            <div className="flex items-center justify-between text-emerald-700 font-semibold">
              <span>CFAR Protection</span>
              <span className="font-bold">₹1,047</span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-600 font-semibold">
            <span className="flex items-center gap-1 text-emerald-700">
              <span>🏷️ Convenience fee off</span>
            </span>
            <span className="text-emerald-700 font-bold">₹ 0</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-black text-slate-900">
            <span>Total</span>
            <span className="text-base text-slate-900">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 8. Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-xl z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {originCode} → {destCode}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleProceedToPay}
            className="flex-1 max-w-xs bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:brightness-105 active:scale-98 text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{termsAccepted ? 'Proceed to Pay' : 'Accept Terms to Continue'}</span>
          </button>
        </div>
      </div>

      {/* Preparing Payment Loading Dialog */}
      <AnimatePresence>
        {isPreparingPayment && (
          <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-1">Preparing payment</h3>
            <p className="text-xs text-slate-500 font-medium">Fetching the latest booking details...</p>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Dialog */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl space-y-4 animate-in slide-in-from-bottom-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                🚪
              </div>
              <h3 className="text-base font-black text-slate-900">Are you sure you want to exit?</h3>
              <p className="text-xs text-slate-500">You will be taken back to RouTripO app</p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setShowExitConfirm(false);
                    handleProceedToPay();
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Continue to payment
                </button>
                <button
                  onClick={() => {
                    setShowExitConfirm(false);
                    setPaymentCancelled(true);
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Yes, exit
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
