// src/components/booking/FarePlansSheet.tsx
import React from 'react';
import { X, Luggage, ShieldCheck, CalendarClock, XCircle, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useBookingFlow, FareTier } from '../../context/BookingFlowContext';

export interface FarePlansSheetProps {
  isOpen: boolean;
  onClose: () => void;
  flightLabel: string;   // e.g. "BOM → DEL" or "ISK → DEL"
  airline: string;       // e.g. "IndiGo 6E 7219"
  departDate: string;
  arriveDate: string;
  departTime: string;
  arriveTime: string;
  basePrice?: number;
  onSelectFare?: (fare: FareTier) => void;
}

export const DEFAULT_FARE_TIERS = (basePrice: number = 4850): FareTier[] => [
  {
    id: 'saver',
    label: 'Saver (Regular)',
    pricePerAdult: basePrice,
    cabinBaggageKg: 7,
    checkinBaggageKg: 15,
    refundable: true,
    cancellationSlabs: [
      { window: '4 hrs to 4 days', fee: 3500, platformFee: 300 },
      { window: '4 days to 365 days', fee: 3000, platformFee: 300 }
    ],
    dateChangeSlabs: [
      { window: '4 hrs to 4 days', fee: 3250, platformFee: 300 },
      { window: '4 days to 365 days', fee: 2750, platformFee: 300 }
    ],
    seatsIncluded: 'chargeable',
    mealsIncluded: 'chargeable',
  },
  {
    id: 'flexi',
    label: 'Flexi Plus',
    pricePerAdult: basePrice + 750,
    cabinBaggageKg: 7,
    checkinBaggageKg: 15,
    refundable: true,
    cancellationSlabs: [
      { window: '4 hrs to 4 days', fee: 500, platformFee: 300 },
      { window: '4 days to 365 days', fee: 0, platformFee: 300 }
    ],
    dateChangeSlabs: [
      { window: '4 hrs to 4 days', fee: 0, platformFee: 300 },
      { window: '4 days to 365 days', fee: 0, platformFee: 300 }
    ],
    seatsIncluded: 'free',
    mealsIncluded: 'complimentary',
  },
  {
    id: 'corporate',
    label: 'Corporate Fare',
    pricePerAdult: basePrice + 1200,
    cabinBaggageKg: 7,
    checkinBaggageKg: 20,
    refundable: true,
    cancellationSlabs: [
      { window: '4 hrs to 4 days', fee: 0, platformFee: 300 },
      { window: '4 days to 365 days', fee: 0, platformFee: 300 }
    ],
    dateChangeSlabs: [
      { window: 'Up to 2 hrs before', fee: 0, platformFee: 0 }
    ],
    seatsIncluded: 'free',
    mealsIncluded: 'complimentary',
  },
  {
    id: 'upfront',
    label: 'UpFront (Premium)',
    pricePerAdult: basePrice + 1850,
    cabinBaggageKg: 10,
    checkinBaggageKg: 25,
    refundable: true,
    cancellationSlabs: [
      { window: '4 hrs to 4 days', fee: 0, platformFee: 0 },
      { window: '4 days to 365 days', fee: 0, platformFee: 0 }
    ],
    dateChangeSlabs: [
      { window: 'Unlimited free changes', fee: 0, platformFee: 0 }
    ],
    seatsIncluded: 'free',
    mealsIncluded: 'complimentary',
  }
];

export const FarePlansSheet: React.FC<FarePlansSheetProps> = ({
  isOpen,
  onClose,
  flightLabel,
  airline,
  departDate,
  arriveDate,
  departTime,
  arriveTime,
  basePrice = 4850,
  onSelectFare,
}) => {
  const { state, dispatch } = useBookingFlow();
  const fareTiers = DEFAULT_FARE_TIERS(basePrice);

  if (!isOpen) return null;

  const handleSelect = (fare: FareTier) => {
    dispatch({ type: 'SELECT_FARE', fare });
    dispatch({ type: 'START_HOLD', minutes: 15 });
    if (onSelectFare) {
      onSelectFare(fare);
    }
  };

  const selectedFareId = state.selectedFare?.id || 'saver';

  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#F7F8FA] w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-amber-500 font-bold">
              ✈️
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Flight Details and Fare Plans</h3>
              <p className="text-xs text-slate-500">Choose the best fare flexibility for your trip</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Flight summary banner */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                {airline}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Non-stop flight
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 items-center">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">{departDate}</span>
                <span className="text-2xl font-black text-[#0B1E3D] block">{departTime}</span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  {flightLabel.split('→')[0]?.trim() || 'ORIGIN'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 block">{arriveDate || departDate}</span>
                <span className="text-2xl font-black text-[#0B1E3D] block">{arriveTime}</span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  {flightLabel.split('→')[1]?.trim() || 'DEST'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <h4 className="text-sm font-black uppercase tracking-wider text-[#0B1E3D]">
              Select Fare Tier
            </h4>
            <span className="text-xs font-bold text-slate-500">
              Prices per adult passenger
            </span>
          </div>

          {/* Fare Tiers List */}
          <div className="space-y-3">
            {fareTiers.map((fare) => {
              const isSelected = selectedFareId === fare.id;
              return (
                <div
                  key={fare.id}
                  onClick={() => handleSelect(fare)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white relative ${
                    isSelected
                      ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {fare.id === 'flexi' && (
                    <span className="absolute -top-2.5 right-4 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Most Popular
                    </span>
                  )}
                  {fare.id === 'corporate' && (
                    <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                      Corporate Choice
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h5 className="text-base font-black text-[#0B1E3D] flex items-center gap-2">
                        {fare.label}
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </h5>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {fare.id === 'saver' ? 'Best for fixed schedules' : fare.id === 'flexi' ? 'Free seats + free meal with date flexibility' : 'Maximum baggage & zero cancellation penalty'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xl font-black text-[#0B1E3D] block">
                        ₹{fare.pricePerAdult.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">per adult</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                    {/* Baggage */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Baggage</span>
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium text-[11px]">
                        <Luggage className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{fare.cabinBaggageKg}kg Cabin + {fare.checkinBaggageKg}kg Check-in</span>
                      </div>
                    </div>

                    {/* Flexibility */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Flexibility</span>
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium text-[11px]">
                        <CalendarClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Date Change: {fare.dateChangeSlabs[0]?.fee === 0 ? 'NIL / Free' : `₹${fare.dateChangeSlabs[0]?.fee}`}</span>
                      </div>
                    </div>

                    {/* In-Flight */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Seats & Meals</span>
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{fare.seatsIncluded === 'free' ? 'Free Seats' : 'Paid Seats'} • {fare.mealsIncluded === 'complimentary' ? 'Free Meal' : 'Paid Meal'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer sticky action */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Selected Fare</span>
            <span className="font-black text-slate-900 text-base">
              ₹{(state.selectedFare?.pricePerAdult || basePrice).toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">/ pax</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!state.selectedFare) {
                handleSelect(fareTiers[0]);
              }
              onClose();
            }}
            className="px-6 py-3 bg-[#FF5A5F] hover:bg-[#ff4046] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Confirm & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
