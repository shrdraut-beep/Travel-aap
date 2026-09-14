// src/components/booking/BaggageSelection.tsx
import React, { useState } from 'react';
import { useBookingFlow } from '../../context/BookingFlowContext';
import { HoldTimer } from './HoldTimer';
import { Minus, Plus, Luggage, ShoppingCart, ArrowLeft, ShieldCheck } from 'lucide-react';

export type BaggageOption = {
  id: string;
  label: string;
  kg: number;
  price: number;
  icon: 'cabin' | 'checkin';
  description: string;
};

const DEFAULT_BAGGAGE_OPTIONS: BaggageOption[] = [
  {
    id: 'bag-3kg',
    label: 'Additional 3 KG Excess Baggage',
    kg: 3,
    price: 1350,
    icon: 'checkin',
    description: 'Pre-book excess weight to avoid airport counter penalties (₹550/kg at counter)',
  },
  {
    id: 'bag-5kg',
    label: 'Additional 5 KG Excess Baggage',
    kg: 5,
    price: 2250,
    icon: 'checkin',
    description: 'Save 30% on standard check-in baggage rates',
  },
  {
    id: 'bag-10kg',
    label: 'Additional 10 KG Excess Baggage',
    kg: 10,
    price: 4500,
    icon: 'checkin',
    description: 'Ideal for long stays, family shopping, or bulky luggage',
  },
  {
    id: 'bag-15kg',
    label: 'Additional 15 KG Excess Baggage',
    kg: 15,
    price: 6500,
    icon: 'checkin',
    description: 'Heavy luggage allowance with priority handling tag',
  },
];

export interface BaggageSelectionProps {
  legs?: { id: string; label: string }[];
  onSkip: () => void;
  onNext: () => void;
  onBack?: () => void;
}

export const BaggageSelection: React.FC<BaggageSelectionProps> = ({
  legs = [{ id: 'leg-1', label: 'Departure Flight' }],
  onSkip,
  onNext,
  onBack,
}) => {
  const { state, dispatch, totals } = useBookingFlow();
  const [activeLeg, setActiveLeg] = useState(legs[0]?.id || 'leg-1');

  const getQty = (optionId: string) => {
    const item = state.baggage.find((b) => b.legId === activeLeg && b.optionId === optionId);
    return item?.qty || (item ? 1 : 0);
  };

  const handleQtyChange = (opt: BaggageOption, delta: number) => {
    const currentQty = getQty(opt.id);
    const nextQty = Math.max(0, currentQty + delta);
    dispatch({
      type: 'SET_BAGGAGE_QTY',
      legId: activeLeg,
      optionId: opt.id,
      label: opt.label,
      kg: opt.kg,
      unitPrice: opt.price,
      qty: nextQty,
    });
  };

  const selectedBaggageForLeg = state.baggage.filter((b) => b.legId === activeLeg);

  return (
    <div className="bg-[#F7F8FA] min-h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Add Extra Check-In Baggage</h3>
              <p className="text-xs text-slate-500">
                Included in fare: {state.selectedFare?.cabinBaggageKg || 7}kg Cabin + {state.selectedFare?.checkinBaggageKg || 15}kg Check-in
              </p>
            </div>
          </div>
          <HoldTimer />
        </div>

        {/* Multi-Leg Tabs */}
        {legs.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {legs.map((leg) => (
              <button
                key={leg.id}
                onClick={() => setActiveLeg(leg.id)}
                className={`px-4 py-1.5 rounded-[16px] text-xs font-black transition-all cursor-pointer ${
                  activeLeg === leg.id
                    ? 'bg-[#D4AF37] text-slate-950 shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {leg.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Free Allowance Highlight Card */}
      <div className="p-4 bg-premium-sky-soft border-b border-premium-sky-deep flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[16px] bg-premium-sky-deep text-white flex items-center justify-center font-bold">
            <Luggage className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-[var(--premium-sky-deep)] block">Standard Included Allowance</span>
            <span className="text-premium-sky-deep text-[11px] font-medium">
              1 Check-in bag (15 kg) + 1 Hand bag (7 kg) per traveller
            </span>
          </div>
        </div>
        <span className="text-xs font-black text-premium-sky-deep bg-premium-sky-soft px-2.5 py-1 rounded-full border border-premium-sky-deep">
          FREE
        </span>
      </div>

      {/* Baggage Slabs List */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[460px]">
        {DEFAULT_BAGGAGE_OPTIONS.map((opt) => {
          const qty = getQty(opt.id);
          const isSelected = qty > 0;

          return (
            <div
              key={opt.id}
              className={`p-4 rounded-[20px] border bg-white transition-all shadow-xs flex items-center justify-between gap-4 ${
                isSelected
                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20 bg-premium-pink-soft/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-[20px] bg-premium-pink-soft border border-premium-pink text-premium-pink flex items-center justify-center font-bold shrink-0">
                  <Luggage className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="font-black text-sm text-[#0B1E3D]">{opt.label}</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {opt.description}
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="font-black text-sm text-[#0B1E3D]">
                      ₹{opt.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      (₹{Math.round(opt.price / opt.kg)}/kg)
                    </span>
                  </div>
                </div>
              </div>

              {/* Counter +/- */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-[16px] border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => handleQtyChange(opt, -1)}
                  disabled={qty === 0}
                  className="w-8 h-8 rounded-lg bg-white shadow-xs text-slate-700 disabled:opacity-30 flex items-center justify-center font-black hover:bg-transparent active:scale-95 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-black text-xs text-[#0B1E3D]">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => handleQtyChange(opt, 1)}
                  disabled={qty >= 3}
                  className="w-8 h-8 rounded-lg bg-[#0B1E3D] text-white flex items-center justify-center font-black hover:bg-[#1C3358] active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">
              Extra Baggage Total:
            </span>
            <span className="text-sm font-black text-[#0B1E3D]">
              ₹{totals.baggage.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {state.baggage.length === 0
              ? 'No extra baggage added'
              : `${state.baggage.reduce((acc, b) => acc + b.kg, 0)} kg additional weight added`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2.5 rounded-[16px] border border-slate-200 text-slate-600 font-black text-xs hover:bg-transparent cursor-pointer"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2.5 bg-[#FF5A5F] hover:bg-[#ff4046] text-white font-black text-xs uppercase tracking-wider rounded-[16px] transition-all shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] cursor-pointer active:scale-95"
          >
            Next: Passenger Details →
          </button>
        </div>
      </div>
    </div>
  );
};
