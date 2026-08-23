import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Luggage, 
  ChevronRight, 
  Sparkles, 
  Info, 
  Plus, 
  Minus,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { BrandHeader } from '../components/common/BrandHeader';

export interface SelectedBaggageItem {
  optionId: string;
  label: string;
  kg: number;
  price: number;
  qty: number;
}

interface BaggageOptionDef {
  id: string;
  kg: number;
  title: string;
  description: string;
  price: number;
  airportCounterPrice: number;
  badge?: string;
}

const BAGGAGE_OPTIONS: BaggageOptionDef[] = [
  {
    id: 'bag-3kg',
    kg: 3,
    title: '+3 KG Additional Check-in',
    description: 'Perfect for small gifts, souvenirs, or a couple extra outfits.',
    price: 1350,
    airportCounterPrice: 1650,
    badge: 'Save ₹300'
  },
  {
    id: 'bag-5kg',
    kg: 5,
    title: '+5 KG Additional Check-in',
    description: 'Most popular add-on. Recommended for business trips & short vacations.',
    price: 2250,
    airportCounterPrice: 2750,
    badge: 'Save ₹500 • Popular'
  },
  {
    id: 'bag-10kg',
    kg: 10,
    title: '+10 KG Additional Check-in',
    description: 'Ideal for long family vacations, shopping hauls, or heavy winter wear.',
    price: 4500,
    airportCounterPrice: 5500,
    badge: 'Save ₹1,000'
  },
  {
    id: 'bag-15kg',
    kg: 15,
    title: '+15 KG Additional Check-in',
    description: 'Heavy luggage allowance with priority handling and fast-track baggage claim.',
    price: 6500,
    airportCounterPrice: 8250,
    badge: 'Save ₹1,750'
  },
  {
    id: 'bag-20kg',
    kg: 20,
    title: '+20 KG Additional Check-in',
    description: 'Maximum prepaid check-in capacity for international transitions or relocation luggage.',
    price: 8500,
    airportCounterPrice: 11000,
    badge: 'Save ₹2,500'
  }
];

export const FlightBaggageSelectionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    flight?: any;
    selectedPlan?: any;
    selectedSeats?: any[];
    selectedMeals?: any[];
    passengerCount?: number;
    item?: any;
    totalAmount?: number;
    seatAddonTotal?: number;
    mealAddonTotal?: number;
    offer_id?: string;
    currency?: string;
    currencySymbol?: string;
    lang?: string;
  };

  const flight = state?.flight;
  const selectedPlan = state?.selectedPlan;
  const selectedSeats = state?.selectedSeats || [];
  const selectedMeals = state?.selectedMeals || [];
  const passengerCount = state?.passengerCount || 1;
  const baseFarePrice = state?.totalAmount || selectedPlan?.inrPrice || 6914;
  const seatAddonTotal = state?.seatAddonTotal || 0;
  const mealAddonTotal = state?.mealAddonTotal || 0;

  // Standard included allowance from fare
  const cabinKg = selectedPlan?.cabinBaggageKg || 7;
  const checkinKg = selectedPlan?.checkinBaggageKg || 15;

  // Flight Info details
  const firstSlice = flight?.slices?.[0] || {};
  const firstSegment = firstSlice.segments?.[0] || {};
  const lastSegment = firstSlice.segments?.[firstSlice.segments?.length - 1] || firstSegment;

  const originCode = firstSegment.origin?.iata_code || 'DEL';
  const destCode = lastSegment.destination?.iata_code || 'BOM';
  const airlineName = flight?.owner?.name || firstSegment.marketing_carrier?.name || 'IndiGo';
  const flightNumber = firstSegment.marketing_carrier_flight_number 
    ? `${firstSegment.marketing_carrier?.iata_code || '6E'} ${firstSegment.marketing_carrier_flight_number}` 
    : '6E 7219';

  const [selectedBaggage, setSelectedBaggage] = useState<Record<string, number>>({});

  const updateBaggageQty = (optionId: string, delta: number) => {
    setSelectedBaggage(prev => {
      const current = prev[optionId] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[optionId];
      } else {
        updated[optionId] = next;
      }
      return updated;
    });
  };

  // Calculate Baggage total
  const baggageAddonTotal = useMemo(() => {
    return Object.entries(selectedBaggage).reduce((sum, [optId, qty]) => {
      const opt = BAGGAGE_OPTIONS.find(b => b.id === optId);
      return sum + (opt?.price || 0) * qty;
    }, 0);
  }, [selectedBaggage]);

  const totalExtraKg = useMemo(() => {
    return Object.entries(selectedBaggage).reduce((sum, [optId, qty]) => {
      const opt = BAGGAGE_OPTIONS.find(b => b.id === optId);
      return sum + (opt?.kg || 0) * qty;
    }, 0);
  }, [selectedBaggage]);

  const grandTotal = baseFarePrice + seatAddonTotal + mealAddonTotal + baggageAddonTotal;

  // Selected baggage formatted array for downstream checkout
  const selectedBaggageList: SelectedBaggageItem[] = useMemo(() => {
    return Object.entries(selectedBaggage).map(([optionId, qty]) => {
      const opt = BAGGAGE_OPTIONS.find(b => b.id === optionId)!;
      return {
        optionId,
        label: opt.title,
        kg: opt.kg,
        price: opt.price,
        qty
      };
    });
  }, [selectedBaggage]);

  const proceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        ...state,
        flight,
        item: state?.item,
        selectedFare: selectedPlan,
        selectedSeats: selectedSeats.length > 0 ? selectedSeats : [{ seatCode: '12A', price: 0, type: 'free', paxIndex: 0 }],
        selectedMeals,
        selectedBaggage: selectedBaggageList,
        totalAmount: baseFarePrice,
        seatAddonTotal,
        mealAddonTotal,
        baggageAddonTotal,
        passengerCount,
        offer_id: state?.offer_id,
        currency: 'INR',
        currencySymbol: '₹',
        lang: 'en'
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-[Inter]">
      {/* Top Brand Header */}
      <BrandHeader
        title="Step 4 of 5: Extra Baggage"
        subtitle={`${airlineName} ${flightNumber} • ${originCode} ➔ ${destCode} • ${passengerCount} Traveler${passengerCount > 1 ? 's' : ''}`}
        onBack={() => navigate(-1)}
        rightElement={
          <div className="hidden sm:flex items-center gap-1.5 text-xs bg-white/15 px-3 py-1.5 rounded-full font-bold">
            <Luggage className="w-3.5 h-3.5" />
            <span>Pre-Paid Baggage</span>
          </div>
        }
      />

      {/* Step Progress Indicator */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs font-bold text-slate-500 overflow-x-auto gap-2">
          <div className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>1. Fare</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Seats</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Meals</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1 text-rose-600 font-black">
            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white flex items-center justify-center text-[10px]">4</span>
            <span>Extra Baggage</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1 text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">5</span>
            <span>Billing</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6 pb-36 overflow-y-auto">
        
        {/* Included Allowance Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Luggage className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Standard Included Free Allowance
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">
                {cabinKg} KG Cabin Bag + {checkinKg} KG Check-In Bag
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Included with your {selectedPlan?.label || 'selected'} fare per passenger.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs font-bold text-amber-900 self-start sm:self-center">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Airport counter fee: ₹550/kg</span>
          </div>
        </div>

        {/* Baggage Cards List */}
        <div className="space-y-3">
          {BAGGAGE_OPTIONS.map((opt) => {
            const currentQty = selectedBaggage[opt.id] || 0;
            const isSelected = currentQty > 0;

            return (
              <div
                key={opt.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-rose-600 ring-2 ring-rose-500/20 shadow-md bg-rose-50/10'
                    : 'border-slate-200/90 shadow-sm hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm ${
                    isSelected ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    +{opt.kg}k
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{opt.title}</h4>
                      {opt.badge && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 max-w-lg">
                      {opt.description}
                    </p>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Airport Price: <span className="line-through">₹{opt.airportCounterPrice}</span> • RouTripO Prepaid: <span className="font-bold text-slate-800">₹{opt.price}</span>
                    </div>
                  </div>
                </div>

                {/* Right price and stepper */}
                <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <div className="sm:text-right">
                    <span className="text-lg font-black text-slate-900">
                      ₹{opt.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Prepaid rate</span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    {currentQty > 0 ? (
                      <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => updateBaggageQty(opt.id, -1)}
                          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-black w-5 text-center text-slate-900">
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateBaggageQty(opt.id, 1)}
                          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateBaggageQty(opt.id, 1)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:text-white text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Bag</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
              Total Amount (Fare + Seats + Meals + Baggage)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
              {baggageAddonTotal > 0 && (
                <span className="text-xs font-bold text-rose-600">
                  (+₹{baggageAddonTotal} for +{totalExtraKg}kg)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={proceedToCheckout}
              className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={proceedToCheckout}
              className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:brightness-105 text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-98"
            >
              <span>Continue to Billing & Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightBaggageSelectionPage;
