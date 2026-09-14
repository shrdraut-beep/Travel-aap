import React, { useState } from "react";
import { ArrowLeft, Luggage, CheckCircle2, ChevronRight, Plus, Minus, ShieldCheck } from "lucide-react";

export interface SelectedBaggageItem {
  id: string;
  kg: number;
  price: number;
  qty: number;
  title: string;
}

export interface BaggageSelectionStepProps {
  flight: any;
  selectedBaggage: SelectedBaggageItem[];
  onConfirmBaggage: (baggage: SelectedBaggageItem[]) => void;
  onBack: () => void;
}

const BAGGAGE_OPTIONS = [
  {
    id: "bag-3kg",
    kg: 3,
    title: "+3 KG Additional Check-in",
    desc: "Great for small gifts, shoes, or a couple extra outfits.",
    price: 1350,
    airportPrice: 1650,
    badge: "Save ₹300"
  },
  {
    id: "bag-5kg",
    kg: 5,
    title: "+5 KG Additional Check-in",
    desc: "Most popular choice. Recommended for weekend and business trips.",
    price: 2250,
    airportPrice: 2750,
    badge: "Most Popular • Save ₹500"
  },
  {
    id: "bag-10kg",
    kg: 10,
    title: "+10 KG Additional Check-in",
    desc: "Ideal for family vacations, winter gear, or heavy shopping bags.",
    price: 4500,
    airportPrice: 5500,
    badge: "Save ₹1,000"
  },
  {
    id: "bag-15kg",
    kg: 15,
    title: "+15 KG Additional Check-in",
    desc: "Maximum allowance add-on. Recommended for overseas relocations.",
    price: 6500,
    airportPrice: 8250,
    badge: "Save ₹1,750"
  }
];

export const BaggageSelectionStep: React.FC<BaggageSelectionStepProps> = ({
  flight,
  selectedBaggage: initialBaggage = [],
  onConfirmBaggage,
  onBack
}) => {
  const [baggage, setBaggage] = useState<SelectedBaggageItem[]>(initialBaggage);

  const handleUpdateQty = (option: typeof BAGGAGE_OPTIONS[0], delta: number) => {
    const existing = baggage.find((b) => b.id === option.id);
    const currentQty = existing?.qty || 0;
    const newQty = Math.max(0, currentQty + delta);

    if (newQty === 0) {
      setBaggage(baggage.filter((b) => b.id !== option.id));
    } else if (existing) {
      setBaggage(baggage.map((b) => (b.id === option.id ? { ...b, qty: newQty } : b)));
    } else {
      setBaggage([
        ...baggage,
        { id: option.id, kg: option.kg, price: option.price, qty: 1, title: option.title }
      ]);
    }
  };

  const totalBaggagePrice = baggage.reduce((sum, b) => sum + b.price * b.qty, 0);
  const totalExtraKg = baggage.reduce((sum, b) => sum + b.kg * b.qty, 0);

  return (
    <div className="min-h-screen bg-[var(--premium-page)] text-[var(--premium-ink)] pb-28">
      {/* Top Header */}
      <header className="relative z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 -ml-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center shrink-0"
              aria-label="Back to meals"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Add Extra Baggage
                </h1>
                <span className="text-xs font-bold text-[var(--premium-violet)] bg-violet-50 px-2 py-0.5 rounded-full">
                  Step 5 of 6
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-book online & save up to 40% vs airport counter rates
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Options Container */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Included Allowance Pill */}
        <div className="bg-pink-50/80 rounded-2xl p-4 border border-pink-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-pink-900 text-sm">Complimentary Allowance Included</p>
            <p className="text-pink-700 mt-0.5">
              7 KG Cabin Handbag + 15 KG Check-in Baggage per adult passenger
            </p>
          </div>
        </div>

        {/* Baggage Cards */}
        <div className="space-y-3">
          {BAGGAGE_OPTIONS.map((opt) => {
            const selected = baggage.find((b) => b.id === opt.id);
            const qty = selected?.qty || 0;

            return (
              <div
                key={opt.id}
                className={`bg-white rounded-2xl p-4.5 border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  qty > 0 ? "border-[var(--premium-violet)] ring-1 ring-[var(--premium-violet)]/30" : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{opt.title}</h3>
                    {opt.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-600 border border-sky-100">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-base font-bold text-slate-900">₹{opt.price}</span>
                    <span className="text-xs text-slate-400 line-through">₹{opt.airportPrice}</span>
                    <span className="text-[11px] font-semibold text-pink-600">at counter</span>
                  </div>
                </div>

                {/* Counter buttons */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  {qty === 0 ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(opt, 1)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                    >
                      + Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2.5 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(opt, -1)}
                        className="w-8 h-8 rounded-lg bg-white shadow-xs text-slate-700 flex items-center justify-center font-bold hover:bg-slate-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-slate-900">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(opt, 1)}
                        className="w-8 h-8 rounded-lg bg-[var(--premium-violet)] text-white shadow-xs flex items-center justify-center font-bold hover:opacity-90"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-4 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Extra Baggage
            </span>
            <div className="text-base font-bold text-slate-900">
              {totalExtraKg > 0 ? (
                <span>+{totalExtraKg} KG • ₹{totalBaggagePrice}</span>
              ) : (
                <span className="text-slate-400 font-normal text-sm">Included 15 KG only</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onConfirmBaggage([])}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => onConfirmBaggage(baggage)}
              className="px-5 py-2.5 rounded-xl bg-[var(--premium-violet)] text-white font-bold text-xs shadow-xs hover:opacity-95 transition-opacity flex items-center gap-1.5"
            >
              <span>Continue to Meals</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
