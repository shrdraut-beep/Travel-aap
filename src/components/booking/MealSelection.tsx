// src/components/booking/MealSelection.tsx
import React, { useState } from 'react';
import { useBookingFlow } from '../../context/BookingFlowContext';
import { HoldTimer } from './HoldTimer';
import { Plus, Check, Utensils, Sparkles, ArrowLeft } from 'lucide-react';

export type MealOption = {
  id: string;
  label: string;
  dietType: 'veg' | 'non-veg' | 'special';
  calories?: string;
  price: number;
  description: string;
};

const DEFAULT_MEALS: MealOption[] = [
  {
    id: 'meal-paneer-tikka',
    label: 'Paneer Tikka Kathi Roll & Beverage',
    dietType: 'veg',
    calories: '420 kcal',
    price: 350,
    description: 'Grilled cottage cheese wrapped in roomali roti served with refreshing juice',
  },
  {
    id: 'meal-chicken-junglee',
    label: 'Junglee Chicken Sandwich & Cookies',
    dietType: 'non-veg',
    calories: '510 kcal',
    price: 400,
    description: 'Succulent spiced shredded chicken breast in multi-grain bread with butter cookies',
  },
  {
    id: 'meal-south-indian',
    label: 'Idli Vada with Sambar & Filter Coffee Premix',
    dietType: 'veg',
    calories: '340 kcal',
    price: 299,
    description: 'Steamed rice cakes and crispy lentil fritter with piping hot sambar dip',
  },
  {
    id: 'meal-croissant',
    label: 'Butter Croissant with Hazelnut Dip',
    dietType: 'veg',
    calories: '280 kcal',
    price: 250,
    description: 'Flaky baked French croissant with Belgian hazelnut chocolate spread',
  },
  {
    id: 'meal-biryani',
    label: 'Dum Awadhi Chicken Biryani Box',
    dietType: 'non-veg',
    calories: '640 kcal',
    price: 450,
    description: 'Fragrant basmati rice slow-cooked with tender chicken and mint raita',
  },
];

export interface MealSelectionProps {
  legs?: { id: string; label: string }[];
  onSkip: () => void;
  onNext: () => void;
  onBack?: () => void;
}

export const MealSelection: React.FC<MealSelectionProps> = ({
  legs = [{ id: 'leg-1', label: 'Departure Flight' }],
  onSkip,
  onNext,
  onBack,
}) => {
  const { state, dispatch, totals } = useBookingFlow();
  const [activeLeg, setActiveLeg] = useState(legs[0]?.id || 'leg-1');
  const [filter, setFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  const selectedMealsForLeg = state.meals.filter((m) => m.legId === activeLeg);

  const handleToggleMeal = (opt: MealOption) => {
    dispatch({
      type: 'TOGGLE_MEAL',
      meal: {
        legId: activeLeg,
        mealId: opt.id,
        label: opt.label,
        price: state.selectedFare?.mealsIncluded === 'complimentary' ? 0 : opt.price,
        legLabel: legs.find((l) => l.id === activeLeg)?.label,
      },
    });
  };

  const isComplimentary = state.selectedFare?.mealsIncluded === 'complimentary';

  const filteredMeals = DEFAULT_MEALS.filter((m) => {
    if (filter === 'all') return true;
    return m.dietType === filter;
  });

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
              <h3 className="font-extrabold text-base text-slate-900">Pre-Book Hot Meals & Snacks</h3>
              <p className="text-xs text-slate-500">
                {isComplimentary ? '🎉 Included free in your selected fare' : 'Save up to 25% vs buying on-board'}
              </p>
            </div>
          </div>
          <HoldTimer />
        </div>

        {/* Multi-Leg Tabs if connecting */}
        {legs.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {legs.map((leg) => (
              <button
                key={leg.id}
                onClick={() => setActiveLeg(leg.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeLeg === leg.id
                    ? 'bg-[#D4AF37] text-slate-950 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {leg.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-[#0B1E3D] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => setFilter('veg')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              filter === 'veg' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Vegetarian
          </button>
          <button
            type="button"
            onClick={() => setFilter('non-veg')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              filter === 'non-veg' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Non-Veg
          </button>
        </div>

        <span className="text-[11px] font-bold text-slate-500">
          Selected: {selectedMealsForLeg.length} meal{selectedMealsForLeg.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Meal List */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[460px]">
        {filteredMeals.map((meal) => {
          const isSelected = state.meals.some(
            (m) => m.legId === activeLeg && m.mealId === meal.id
          );
          const effectivePrice = isComplimentary ? 0 : meal.price;

          return (
            <div
              key={meal.id}
              className={`p-4 rounded-2xl border bg-white transition-all shadow-xs flex items-center justify-between gap-4 ${
                isSelected
                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20 bg-amber-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                    meal.dietType === 'veg' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}
                >
                  {meal.dietType === 'veg' ? '🟢' : '🔴'}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="font-black text-sm text-[#0B1E3D]">{meal.label}</h5>
                    {meal.calories && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.2 rounded-md">
                        {meal.calories}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {meal.description}
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="font-black text-sm text-[#0B1E3D]">
                      {effectivePrice === 0 ? 'FREE (Complimentary)' : `₹${effectivePrice.toLocaleString('en-IN')}`}
                    </span>
                    {isComplimentary && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Fare Benefit
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Add / Added Button */}
              <button
                type="button"
                onClick={() => handleToggleMeal(meal)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                    : 'bg-[#0B1E3D] hover:bg-[#1C3358] text-white shadow-xs active:scale-95'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">
              Meals Total:
            </span>
            <span className="text-sm font-black text-[#0B1E3D]">
              ₹{totals.meals.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {state.meals.length === 0 ? 'No meals chosen' : `${state.meals.length} meal(s) pre-booked`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-xs hover:bg-slate-50 cursor-pointer"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2.5 bg-[#FF5A5F] hover:bg-[#ff4046] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
          >
            Next: Baggage →
          </button>
        </div>
      </div>
    </div>
  );
};
