import React, { useState } from "react";
import { Utensils, ChevronRight, Plus, Minus, CheckCircle2 } from "lucide-react";
import { BookingStepHeader } from "./BookingStepHeader";

export interface SelectedMealItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  dietType: "veg" | "non-veg";
}

export interface MealsSelectionStepProps {
  flight: any;
  selectedMeals: SelectedMealItem[];
  onConfirmMeals: (meals: SelectedMealItem[]) => void;
  onBack: () => void;
}

const MEALS_MENU = [
  {
    id: "meal-paneer",
    name: "Paneer Tikka Kathi Roll & Drink",
    desc: "Tandoori marinated cottage cheese roll with mint chutney & mango nectar.",
    dietType: "veg" as const,
    calories: "420 kcal",
    price: 350,
    badge: "Chef Special"
  },
  {
    id: "meal-chicken",
    name: "Junglee Spiced Chicken Sandwich",
    desc: "Succulent shredded spiced chicken breast in multi-grain sourdough with butter cookies.",
    dietType: "non-veg" as const,
    calories: "510 kcal",
    price: 420,
    badge: "Most Popular"
  },
  {
    id: "meal-south-indian",
    name: "Idli Vada with Gunpowder & Sambar",
    desc: "Steamed fluffy rice cakes & crispy lentil medu vada served with hot dal sambar.",
    dietType: "veg" as const,
    calories: "340 kcal",
    price: 290
  },
  {
    id: "meal-fruits",
    name: "Seasonal Fresh Fruit Bowl & Nuts",
    desc: "Hand-picked exotic fruits with roasted California almonds & walnuts.",
    dietType: "veg" as const,
    calories: "180 kcal",
    price: 260
  },
  {
    id: "meal-jain",
    name: "Jain Dal Khichdi & Roasted Papad",
    desc: "Aromatic no-onion no-garlic moong dal khichdi served with pure cow ghee.",
    dietType: "veg" as const,
    calories: "360 kcal",
    price: 320,
    badge: "Strict Jain"
  }
];

export const MealsSelectionStep: React.FC<MealsSelectionStepProps> = ({
  flight,
  selectedMeals: initialMeals = [],
  onConfirmMeals,
  onBack
}) => {
  const [meals, setMeals] = useState<SelectedMealItem[]>(initialMeals);
  const [filterDiet, setFilterDiet] = useState<"all" | "veg" | "non-veg">("all");

  const handleUpdateQty = (item: typeof MEALS_MENU[0], delta: number) => {
    const existing = meals.find((m) => m.id === item.id);
    const currentQty = existing?.qty || 0;
    const newQty = Math.max(0, currentQty + delta);

    if (newQty === 0) {
      setMeals(meals.filter((m) => m.id !== item.id));
    } else if (existing) {
      setMeals(meals.map((m) => (m.id === item.id ? { ...m, qty: newQty } : m)));
    } else {
      setMeals([
        ...meals,
        { id: item.id, name: item.name, price: item.price, qty: 1, dietType: item.dietType }
      ]);
    }
  };

  const totalMealsPrice = meals.reduce((sum, m) => sum + m.price * m.qty, 0);
  const totalMealCount = meals.reduce((sum, m) => sum + m.qty, 0);

  const displayedMenu = MEALS_MENU.filter((m) => {
    if (filterDiet === "all") return true;
    return m.dietType === filterDiet;
  });

  return (
    <div className="min-h-screen bg-[var(--premium-page)] text-[var(--premium-ink)] pb-28">
      {/* Top Header */}
      <BookingStepHeader
        title="In-Flight Meals"
        step="Step 4 of 6"
        subtitle="Freshly prepared meals served hot on your flight"
        onBack={onBack}
        backAriaLabel="Back to seats"
      >
        {/* Veg / Non-Veg Diet Filter */}
        <div className="max-w-3xl mx-auto px-4 py-2 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterDiet("all")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              filterDiet === "all"
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => setFilterDiet("veg")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterDiet === "veg"
                ? "bg-pink-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            Pure Veg
          </button>
          <button
            type="button"
            onClick={() => setFilterDiet("non-veg")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterDiet === "non-veg"
                ? "bg-rose-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Non-Veg
          </button>
        </div>
      </BookingStepHeader>

      {/* Main Meals Menu List */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {displayedMenu.map((item) => {
          const selected = meals.find((m) => m.id === item.id);
          const qty = selected?.qty || 0;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-4.5 border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                qty > 0 ? "border-[var(--premium-violet)] ring-1 ring-[var(--premium-violet)]/30" : "border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                      item.dietType === "veg"
                        ? "border-pink-600"
                        : "border-rose-600"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.dietType === "veg" ? "bg-pink-600" : "bg-rose-600"
                      }`}
                    />
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{item.desc}</p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-base font-bold text-slate-900">₹{item.price}</span>
                  <span className="text-xs text-slate-400">• {item.calories}</span>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                {qty === 0 ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item, 1)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    + Add
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item, -1)}
                      className="w-8 h-8 rounded-lg bg-white shadow-xs text-slate-700 flex items-center justify-center font-bold hover:bg-slate-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-slate-900">{qty}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item, 1)}
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
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-4 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Meals Selected
            </span>
            <div className="text-base font-bold text-slate-900">
              {totalMealCount > 0 ? (
                <span>{totalMealCount} Item{totalMealCount > 1 ? "s" : ""} • ₹{totalMealsPrice}</span>
              ) : (
                <span className="text-slate-400 font-normal text-sm">No meals added</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onConfirmMeals([])}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => onConfirmMeals(meals)}
              className="px-5 py-2.5 rounded-xl bg-[var(--premium-violet)] text-white font-bold text-xs shadow-xs hover:opacity-95 transition-opacity flex items-center gap-1.5"
            >
              <span>Continue to Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
