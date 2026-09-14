import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Plane, 
  Clock, 
  Luggage, 
  CalendarClock, 
  Tag, 
  Compass as  
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { useCurrency } from '../components/booking/useCurrency';
import { BrandHeader } from '../components/common/BrandHeader';
import { getAirlineFareTiers } from '../utils/airlineFareBrands';

interface FareTierPlan {
  id: string;
  label: string;
  fare_name: string;
  total_amount: number;
  total_currency: string;
  inrPrice: number;
  cabinBaggageKg: number;
  checkinBaggageKg: number;
  refundable: boolean;
  cancellationSummary: string;
  cancellationSlabs: { window: string; fee: number; platformFee: number }[];
  dateChangeSummary: string;
  dateChangeSlabs: { window: string; fee: number; platformFee: number }[];
  seatsIncluded: 'free' | 'chargeable';
  mealsIncluded: 'complimentary' | 'chargeable';
  badge?: string;
  rawOffer?: any;
}

export const FlightFareSelectionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { convertToINR, formatToINRDisplay, rate } = useCurrency();

  const state = location.state as { 
    flight?: any; 
    searchParams?: any;
    passengerCount?: number;
    adults?: number;
    children?: number;
    infants?: number;
  };
  const flight = state?.flight;
  const searchParams = state?.searchParams || flight?.searchParams;
  const adultCount = state?.adults ?? searchParams?.adults ?? 1;
  const childCount = state?.children ?? searchParams?.children ?? 0;
  const infantCount = state?.infants ?? searchParams?.infants ?? 0;
  const passengerCount = adultCount + childCount + infantCount;

  // Extract flight info safely
  const slices = flight?.slices || [];
  const firstSlice = slices[0] || {};
  const segments = firstSlice.segments || [];
  const firstSegment = segments[0] || {};
  const lastSegment = segments[segments.length - 1] || firstSegment;

  const originCode = firstSegment.origin?.iata_code || firstSegment.origin?.name || 'DEL';
  const originName = firstSegment.origin?.name || originCode;
  const destCode = lastSegment.destination?.iata_code || lastSegment.destination?.name || 'BOM';
  const destName = lastSegment.destination?.name || destCode;

  const departTime = firstSegment.departing_at 
    ? new Date(firstSegment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) 
    : '17:20';
  const arriveTime = lastSegment.arriving_at 
    ? new Date(lastSegment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) 
    : '02:00';
  const departDate = firstSegment.departing_at 
    ? new Date(firstSegment.departing_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
    : '21st Aug, 2026';
  const arriveDate = lastSegment.arriving_at 
    ? new Date(lastSegment.arriving_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
    : departDate;

  const airlineName = flight?.owner?.name || firstSegment.marketing_carrier?.name || 'IndiGo';
  const flightNumber = firstSegment.marketing_carrier_flight_number 
    ? `${firstSegment.marketing_carrier?.iata_code || '6E'} ${firstSegment.marketing_carrier_flight_number}` 
    : (flight?.title || '6E 7219');
  const airlineLogo = flight?.owner?.logo_symbol_url;
  const stopsCount = segments.length > 1 ? segments.length - 1 : 0;
  const stopText = stopsCount === 0 ? 'Non-Stop' : `${stopsCount} Stop via ${segments[0]?.destination?.iata_code || 'AMD'}`;

  // Parse raw flight base price
  const rawBaseAmount = useMemo(() => {
    if (flight?.offers && flight.offers.length > 0) {
      const minOffer = flight.offers.reduce((prev: any, curr: any) => 
        parseFloat(curr.total_amount) < parseFloat(prev.total_amount) ? curr : prev
      );
      return parseFloat(minOffer.total_amount) || 120;
    }
    const topPrice = parseFloat(flight?.total_amount);
    return !isNaN(topPrice) && topPrice > 0 ? topPrice : 120;
  }, [flight]);

  const rawCurrency = flight?.total_currency || flight?.offers?.[0]?.total_currency || 'USD';

  // Base converted INR price strictly calculated using Math.ceil(usd * exchangeRate * 1.03)
  const baseInrPrice = useMemo(() => {
    if (rawCurrency === 'INR') {
      return Math.ceil(rawBaseAmount);
    }
    const bufferedRate = (rate || 85) * 1.03;
    return Math.ceil(rawBaseAmount * bufferedRate);
  }, [rawBaseAmount, rawCurrency, rate]);

  // Helper to convert any USD/currency penalty amount to INR
  const convertPenaltyToINR = (penaltyObj: any, defaultText: string = 'Non-refundable') => {
    if (!penaltyObj) return defaultText;
    if (penaltyObj.allowed === false) return 'Non-refundable';
    if (penaltyObj.penalty_amount === null || penaltyObj.penalty_amount === undefined) {
      if (penaltyObj.allowed === true) return 'NIL / Free';
      return defaultText;
    }
    const penaltyAmt = parseFloat(penaltyObj.penalty_amount);
    if (isNaN(penaltyAmt) || penaltyAmt <= 0) {
      return penaltyObj.allowed === true ? 'NIL / Free' : defaultText;
    }
    const penaltyCurrency = penaltyObj.penalty_currency || rawCurrency;
    if (penaltyCurrency === 'INR') {
      return `INR ${Math.ceil(penaltyAmt).toLocaleString('en-IN')}`;
    }
    const inrVal = Math.ceil(penaltyAmt * (rate || 85) * 1.03);
    return `INR ${inrVal.toLocaleString('en-IN')}`;
  };

  const getPenaltyAmountNumber = (penaltyObj: any): number | null => {
    if (!penaltyObj || penaltyObj.allowed === false) return null;
    if (penaltyObj.penalty_amount === null || penaltyObj.penalty_amount === undefined) {
      return penaltyObj.allowed === true ? 0 : null;
    }
    const penaltyAmt = parseFloat(penaltyObj.penalty_amount);
    if (isNaN(penaltyAmt)) return null;
    const penaltyCurrency = penaltyObj.penalty_currency || rawCurrency;
    if (penaltyCurrency === 'INR') return Math.ceil(penaltyAmt);
    return Math.ceil(penaltyAmt * (rate || 85) * 1.03);
  };

  // Build Fare Tiers with dynamic branded conditions extracted directly or generated for airline
  const farePlans: FareTierPlan[] = useMemo(() => {
    // If Duffel or GDS provides multiple offers
    if (flight?.offers && flight.offers.length > 1) {
      return flight.offers.map((offer: any, idx: number) => {
        const rawAmt = parseFloat(offer.total_amount) || rawBaseAmount;
        const offerInr = rawCurrency === 'INR' 
          ? Math.ceil(rawAmt) 
          : Math.ceil(rawAmt * ((rate || 85) * 1.03));

        const isSaver = idx === 0 || offer.fare_name?.toLowerCase().includes('saver');
        const isFlexi = offer.fare_name?.toLowerCase().includes('flexi') || idx === 1;

        const condRefund = offer.conditions?.refund_before_departure;
        const condChange = offer.conditions?.change_before_departure;

        const isRefundable = condRefund ? condRefund.allowed !== false : (offer.conditions ? false : true);
        const cancellationDisplay = convertPenaltyToINR(condRefund, 'Non-refundable');
        const changeDisplay = convertPenaltyToINR(condChange, 'Non-changeable');

        const refundFeeNum = getPenaltyAmountNumber(condRefund);
        const changeFeeNum = getPenaltyAmountNumber(condChange);

        return {
          id: offer.id || `offer_${idx}`,
          label: offer.fare_name || (idx === 0 ? 'Saver (Regular)' : idx === 1 ? 'Flexi Plus' : 'UpFront (Premium)'),
          fare_name: offer.fare_name || 'Standard',
          total_amount: rawAmt,
          total_currency: offer.total_currency || rawCurrency,
          inrPrice: offerInr,
          cabinBaggageKg: offer.slices?.[0]?.segments?.[0]?.passengers?.[0]?.baggages?.find((b: any) => b.type === 'carry_on')?.quantity ? 7 : (isSaver ? 7 : isFlexi ? 7 : 10),
          checkinBaggageKg: offer.slices?.[0]?.segments?.[0]?.passengers?.[0]?.baggages?.find((b: any) => b.type === 'checked')?.quantity ? 15 : (isSaver ? 15 : isFlexi ? 15 : 20),
          refundable: isRefundable,
          cancellationSummary: cancellationDisplay === 'Non-refundable' ? 'Non-refundable' : `Cancellation: ${cancellationDisplay}`,
          cancellationSlabs: condRefund !== undefined ? [
            { window: 'Before departure', fee: refundFeeNum ?? 0, platformFee: 0 }
          ] : [
            { window: 'Before departure', fee: 0, platformFee: 0 }
          ],
          dateChangeSummary: changeDisplay === 'Non-changeable' ? 'Non-changeable' : `Date Change: ${changeDisplay}`,
          dateChangeSlabs: condChange !== undefined ? [
            { window: 'Before departure', fee: changeFeeNum ?? 0, platformFee: 0 }
          ] : [
            { window: 'Before departure', fee: 0, platformFee: 0 }
          ],
          seatsIncluded: isSaver ? 'chargeable' : 'free',
          mealsIncluded: isSaver ? 'chargeable' : 'complimentary',
          badge: isFlexi ? 'Most Popular' : idx === 2 ? 'Best Value' : undefined,
          rawOffer: offer
        };
      });
    }

    // Default: Get official airline branded fare tiers (IndiGo, Air India, Vistara, SpiceJet, Akasa Air, etc.)
    const airlineBrandedTiers = getAirlineFareTiers(airlineName, baseInrPrice);
    return airlineBrandedTiers.map(tier => ({
      id: tier.id,
      label: tier.label,
      fare_name: tier.fare_name,
      total_amount: tier.pricePerAdult,
      total_currency: 'INR',
      inrPrice: tier.pricePerAdult,
      cabinBaggageKg: tier.cabinBaggageKg,
      checkinBaggageKg: tier.checkinBaggageKg,
      refundable: tier.refundable,
      cancellationSummary: tier.cancellationSummary || 'Cancellation: Standard Fee',
      cancellationSlabs: tier.cancellationSlabs,
      dateChangeSummary: tier.dateChangeSummary || 'Date Change: Standard Fee',
      dateChangeSlabs: tier.dateChangeSlabs,
      seatsIncluded: tier.seatsIncluded,
      mealsIncluded: tier.mealsIncluded,
      badge: tier.badge,
      rawOffer: flight
    }));
  }, [flight, rawBaseAmount, baseInrPrice, rawCurrency, rate, airlineName]);

  const [selectedPlanId, setSelectedPlanId] = useState<string>(farePlans[0]?.id || 'saver');

  const selectedPlan = useMemo(() => {
    return farePlans.find(p => p.id === selectedPlanId) || farePlans[0];
  }, [farePlans, selectedPlanId]);

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 ">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Flight Details Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">We could not load the selected flight details. Please pick a flight again from the search results.</p>
          <button 
            onClick={() => navigate(-1)}
            className="w-full bg-[#0B1E3D] hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Back to Flight Results
          </button>
        </div>
      </div>
    );
  }

  const handleProceedToCheckout = () => {
    const selectedOffer = selectedPlan.rawOffer || {
      id: selectedPlan.id,
      fare_name: selectedPlan.label,
      total_amount: selectedPlan.total_amount,
      total_currency: selectedPlan.total_currency
    };

    console.log("Proceeding to checkout with:", selectedOffer);

    // Guaranteed converted INR total
    const finalInrAmount = Math.ceil(selectedPlan.inrPrice);

    const checkoutItem = {
      id: selectedOffer.id || flight.id || `flt_${Date.now()}`,
      offer_id: selectedOffer.id || flight.id,
      title: `${airlineName} ${flightNumber} • ${selectedPlan.label}`,
      vertical: 'flight' as const,
      amount: finalInrAmount, // Pure converted INR amount
      originalAmount: selectedPlan.total_amount,
      originalCurrency: selectedPlan.total_currency,
      location: `${originName} to ${destName}`,
      subtitle: `${originCode} → ${destCode}`,
      date: departDate,
      time: departTime,
      duration: '3h 15m',
      airline: airlineName,
      provider: airlineName,
      image: airlineLogo,
      meta: {
        flight,
        selectedOffer,
        farePlan: selectedPlan,
        offer_id: selectedOffer.id || flight.id,
        fare_name: selectedPlan.label,
        flightNumber,
        originCode,
        destCode,
        originName,
        destName,
        departTime,
        arriveTime,
        departDate,
        arriveDate,
        stopsCount,
        stopText,
        cabinBaggageKg: selectedPlan.cabinBaggageKg,
        checkinBaggageKg: selectedPlan.checkinBaggageKg,
      }
    };

    navigate('/flights/passengers', {
      state: {
        flight,
        item: checkoutItem,
        selectedPlan: selectedPlan,
        selectedFare: selectedPlan,
        totalAmount: finalInrAmount,
        passengerCount,
        adults: adultCount,
        children: childCount,
        infants: infantCount,
        searchParams,
        offer_id: selectedOffer.id || flight.id,
        currency: 'INR',
        currencySymbol: '₹',
        lang: 'en'
      }
    });
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col ">
      {/* Top Brand Header */}
      <BrandHeader
        title="Flight Details & Fare Plans"
        subtitle={`${originCode} ➔ ${destCode} • ${departDate}`}
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 pb-36 sm:pb-40 space-y-4 overflow-y-auto">
        {/* Flight Overview Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              {airlineLogo ? (
                <img src={airlineLogo} alt={airlineName} className="w-8 h-8 object-contain rounded-lg p-1 bg-transparent border border-slate-100" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 font-black text-xs">
                  <Plane className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="font-black text-slate-900 text-sm block">{airlineName}</span>
                <span className="text-xs text-slate-400 font-semibold">{flightNumber}</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              Economy
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 items-center py-4">
            <div>
              <span className="text-2xl font-black text-slate-900 block">{departTime}</span>
              <span className="text-xs font-bold text-slate-700 block">{originCode}</span>
              <span className="text-[11px] text-slate-400 truncate block">{originName}</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> 3h 15m
              </span>
              <div className="w-full relative flex items-center justify-center">
                <div className="h-px bg-slate-200 w-full absolute top-1/2"></div>
                <div className="w-2 h-2 rounded-full bg-slate-400 absolute left-0"></div>
                <div className="w-2 h-2 rounded-full bg-slate-400 absolute right-0"></div>
                <div className="bg-white px-2 z-10 text-[10px] font-bold text-slate-600 border border-slate-200 rounded-full">
                  {stopText}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 block">{arriveTime}</span>
              <span className="text-xs font-bold text-slate-700 block">{destCode}</span>
              <span className="text-[11px] text-slate-400 truncate block">{destName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="flex items-center gap-1 bg-pink-50 text-pink-700 px-2.5 py-1 rounded-md font-semibold text-[11px]">
              <Luggage className="w-3.5 h-3.5" /> 7 kg Cabin
            </span>
            <span className="flex items-center gap-1 bg-pink-50 text-pink-700 px-2.5 py-1 rounded-md font-semibold text-[11px]">
              <Luggage className="w-3.5 h-3.5" /> 15 kg Check-in
            </span>
            <span className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Refundable
            </span>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between pt-2 px-1">
          <h2 className="text-lg font-black text-slate-900">Select Fare</h2>
          <span className="text-xs text-slate-500 font-semibold">Per adult passenger</span>
        </div>

        {/* Fare Tier Plans */}
        <div className="space-y-4">
          {farePlans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`bg-white rounded-2xl p-5 border-2 transition-all cursor-pointer relative overflow-hidden shadow-xs ${
                  isSelected 
                    ? 'border-rose-600 ring-2 ring-rose-500/20 shadow-md bg-rose-50/10' 
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Ribbon Tag */}
                {plan.badge && (
                  <span className="absolute top-0 right-0 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow-xs">
                    {plan.badge}
                  </span>
                )}

                {/* Price & Name Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-rose-600 bg-rose-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="text-xl font-black text-slate-900 block">
                        ₹{plan.inrPrice.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">per adult</span>
                      </span>
                      <span className="text-sm font-bold text-slate-800">{plan.label}</span>
                    </div>
                  </div>
                </div>

                {/* Feature Details Group */}
                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  {/* Baggage */}
                  <div className="space-y-1.5">
                    <span className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider block">Baggage</span>
                    <div className="space-y-1 text-slate-700">
                      <div className="flex items-center gap-2">
                        <Luggage className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{plan.cabinBaggageKg} KG Cabin bag allowance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Luggage className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{plan.checkinBaggageKg} KG Check-in bag allowance</span>
                      </div>
                    </div>
                  </div>

                  {/* Flexibility */}
                  <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-100">
                    <span className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider block">Flexibility</span>
                    <div className="space-y-1.5 text-slate-700">
                      {plan.cancellationSlabs.map((slab, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                            Cancellation – {slab.window}
                          </span>
                          <span className="font-bold text-slate-900">
                            {slab.fee === 0 ? 'NIL / Free' : `INR ${slab.fee.toLocaleString('en-IN')}`}
                          </span>
                        </div>
                      ))}

                      {plan.dateChangeSlabs.map((slab, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Date change – {slab.window}
                          </span>
                          <span className="font-bold text-slate-900">
                            {slab.fee === 0 ? 'NIL / Free' : `INR ${slab.fee.toLocaleString('en-IN')}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* In-Flight Services */}
                  <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-100">
                    <span className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider block">Seats, Meals and More</span>
                    <div className="flex items-center gap-4 text-slate-700 font-semibold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${plan.seatsIncluded === 'free' ? 'text-pink-600' : 'text-slate-400'}`} />
                        {plan.seatsIncluded === 'free' ? 'Free Seats' : 'Chargeable Seats'}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${plan.mealsIncluded === 'complimentary' ? 'text-pink-600' : 'text-slate-400'}`} />
                        {plan.mealsIncluded === 'complimentary' ? 'Complimentary Meals' : 'Chargeable Meals'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-xl z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Total Base Fare</span>
            <span className="text-2xl font-black text-slate-900">
              ₹{selectedPlan.inrPrice.toLocaleString('en-IN')}
              <span className="text-xs font-semibold text-slate-500 ml-1">/ adult</span>
            </span>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="flex-1 max-w-xs bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:brightness-105 active:scale-98 text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
