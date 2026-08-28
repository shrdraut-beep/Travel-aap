import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  Utensils, 
  ChevronRight, 
  Compass as Sparkles, 
  Info, 
  Plus, 
  Minus,
  CheckCircle2,
  Salad
} from 'lucide-react';
import { BrandHeader } from '../components/common/BrandHeader';

export interface SelectedMealItem {
  mealId: string;
  label: string;
  dietType: 'veg' | 'non-veg';
  price: number;
  qty: number;
}

interface MealItemDef {
  id: string;
  name: string;
  description: string;
  dietType: 'veg' | 'non-veg';
  calories: string;
  price: number;
  badge?: string;
  image?: string;
}

const AVAILABLE_MEALS: MealItemDef[] = [
  {
    id: 'meal-paneer-tikka',
    name: 'Paneer Tikka Kathi Roll & Mango Nectar',
    description: 'Char-grilled cottage cheese cubes tossed in mint mayonnaise, wrapped in flaky flatbread.',
    dietType: 'veg',
    calories: '420 kcal',
    price: 350,
    badge: 'Chef Special'
  },
  {
    id: 'meal-chicken-junglee',
    name: 'Junglee Spiced Chicken Sandwich & Almond Cookies',
    description: 'Succulent spiced shredded chicken breast in multi-grain sourdough with artisan butter cookies.',
    dietType: 'non-veg',
    calories: '510 kcal',
    price: 420,
    badge: 'Most Popular'
  },
  {
    id: 'meal-south-indian',
    name: 'Idli Vada with Gunpowder, Sambar & Filter Coffee',
    description: 'Traditional steamed rice cakes & crispy lentil medu vada served with piping hot dal sambar.',
    dietType: 'veg',
    calories: '340 kcal',
    price: 299,
  },
  {
    id: 'meal-biryani',
    name: 'Dum Awadhi Murgh Biryani Box & Mint Raita',
    description: 'Fragrant aged basmati rice layered with saffron chicken pieces and caramelized fried onions.',
    dietType: 'non-veg',
    calories: '640 kcal',
    price: 480,
    badge: 'Bestseller'
  },
  {
    id: 'meal-croissant',
    name: 'Warm Butter Croissant with Belgian Chocolate Spread',
    description: 'Flaky baked Parisian croissant accompanied by gourmet hazelnut cocoa spread.',
    dietType: 'veg',
    calories: '280 kcal',
    price: 260,
  },
  {
    id: 'meal-pasta',
    name: 'Tuscan Sun-Dried Tomato & Herb Penne Pasta',
    description: 'Al dente penne in a rich herb-infused arrabbiata sauce topped with parmesan cheese.',
    dietType: 'veg',
    calories: '390 kcal',
    price: 380,
  }
];

export const FlightMealsSelectionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    flight?: any;
    selectedPlan?: any;
    selectedSeats?: any[];
    passengerCount?: number;
    item?: any;
    totalAmount?: number;
    seatAddonTotal?: number;
    offer_id?: string;
    currency?: string;
    currencySymbol?: string;
    lang?: string;
  };

  const flight = state?.flight;
  const selectedPlan = state?.selectedPlan;
  const selectedSeats = state?.selectedSeats || [];
  const passengerCount = state?.passengerCount || 1;
  const baseFarePrice = state?.totalAmount || selectedPlan?.inrPrice || 6914;
  const seatAddonTotal = state?.seatAddonTotal || 0;

  const isComplimentaryMeals = selectedPlan?.mealsIncluded === 'complimentary';

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

  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [selectedMeals, setSelectedMeals] = useState<Record<string, number>>({});

  const filteredMeals = useMemo(() => {
    if (dietFilter === 'all') return AVAILABLE_MEALS;
    return AVAILABLE_MEALS.filter(m => m.dietType === dietFilter);
  }, [dietFilter]);

  const updateMealQty = (mealId: string, delta: number) => {
    setSelectedMeals(prev => {
      const current = prev[mealId] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[mealId];
      } else {
        updated[mealId] = next;
      }
      return updated;
    });
  };

  // Calculate meal total
  const mealAddonTotal = useMemo(() => {
    if (isComplimentaryMeals) return 0;
    return Object.entries(selectedMeals).reduce((sum, [mealId, qty]) => {
      const meal = AVAILABLE_MEALS.find(m => m.id === mealId);
      return sum + (meal?.price || 0) * qty;
    }, 0);
  }, [selectedMeals, isComplimentaryMeals]);

  const totalMealCount = useMemo(() => {
    return Object.values(selectedMeals).reduce((a, b) => a + b, 0);
  }, [selectedMeals]);

  const grandTotal = baseFarePrice + seatAddonTotal + mealAddonTotal;

  // Selected meals formatted array for downstream
  const selectedMealsList: SelectedMealItem[] = useMemo(() => {
    return Object.entries(selectedMeals).map(([mealId, qty]) => {
      const meal = AVAILABLE_MEALS.find(m => m.id === mealId)!;
      return {
        mealId,
        label: meal.name,
        dietType: meal.dietType,
        price: isComplimentaryMeals ? 0 : meal.price,
        qty
      };
    });
  }, [selectedMeals, isComplimentaryMeals]);

  const proceedToBaggage = () => {
    navigate('/flights/baggage', {
      state: {
        ...state,
        flight,
        item: state?.item,
        selectedPlan,
        selectedSeats,
        selectedMeals: selectedMealsList,
        totalAmount: baseFarePrice,
        seatAddonTotal,
        mealAddonTotal,
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
        title="Step 3 of 5: Select Meals"
        subtitle={`${airlineName} ${flightNumber} • ${originCode} ➔ ${destCode} • ${passengerCount} Traveler${passengerCount > 1 ? 's' : ''}`}
        onBack={() => navigate(-1)}
        rightElement={
          <div className="hidden sm:flex items-center gap-1.5 text-xs bg-white/15 px-3 py-1.5 rounded-full font-bold">
            <Utensils className="w-3.5 h-3.5" />
            <span>In-Flight Dining</span>
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
          <div className="flex items-center gap-1 text-rose-600 font-black">
            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-red-600 to-pink-600 text-white flex items-center justify-center text-[10px]">3</span>
            <span>Meals Selection</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1 text-slate-400">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">4</span>
            <span>Baggage</span>
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
        
        {/* Complimentary Notice or Info Banner */}
        {isComplimentaryMeals ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-emerald-900">
            <Utensils className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm">Complimentary Hot Meals Included</h4>
              <p className="text-xs text-emerald-700">
                Your selected fare tier ({selectedPlan?.label}) includes complimentary gourmet meals for all passengers at ₹0.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-900">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm">Pre-Book Meals & Save Up to 25%</h4>
              <p className="text-xs text-amber-700">
                In-flight meal purchase on board is subject to limited stock. Pre-book your hot meals now for guaranteed service.
              </p>
            </div>
          </div>
        )}

        {/* Dietary Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDietFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              dietFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Choices ({AVAILABLE_MEALS.length})
          </button>
          <button
            onClick={() => setDietFilter('veg')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              dietFilter === 'veg'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Pure Veg ({AVAILABLE_MEALS.filter(m => m.dietType === 'veg').length})
          </button>
          <button
            onClick={() => setDietFilter('non-veg')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              dietFilter === 'non-veg'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Non-Veg ({AVAILABLE_MEALS.filter(m => m.dietType === 'non-veg').length})
          </button>
        </div>

        {/* Meals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMeals.map((meal) => {
            const currentQty = selectedMeals[meal.id] || 0;
            const isSelected = currentQty > 0;
            const effectivePrice = isComplimentaryMeals ? 0 : meal.price;

            return (
              <div
                key={meal.id}
                className={`bg-white rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-rose-600 ring-2 ring-rose-500/20 shadow-md bg-rose-50/10'
                    : 'border-slate-200/90 shadow-sm hover:border-slate-300'
                }`}
              >
                {meal.badge && (
                  <span className="absolute top-4 right-4 bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-amber-300">
                    {meal.badge}
                  </span>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center p-0.5 ${
                        meal.dietType === 'veg'
                          ? 'border-emerald-600 text-emerald-600'
                          : 'border-rose-600 text-rose-600'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          meal.dietType === 'veg' ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      ></span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">{meal.calories}</span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug pr-16">
                    {meal.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {meal.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-slate-900">
                      {isComplimentaryMeals ? 'FREE' : `₹${meal.price}`}
                    </span>
                    {!isComplimentaryMeals && (
                      <span className="text-[10px] text-slate-400 ml-1">/ meal</span>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    {currentQty > 0 ? (
                      <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => updateMealQty(meal.id, -1)}
                          className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black w-4 text-center text-slate-900">
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateMealQty(meal.id, 1)}
                          className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateMealQty(meal.id, 1)}
                        className="px-4 py-2 bg-slate-100 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:text-white text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Meal</span>
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
              Total Amount (Fare + Seats + Meals)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
              {mealAddonTotal > 0 && (
                <span className="text-xs font-bold text-rose-600">
                  (+₹{mealAddonTotal} for {totalMealCount} meals)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={proceedToBaggage}
              className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={proceedToBaggage}
              className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:brightness-105 text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-98"
            >
              <span>Continue to Baggage</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightMealsSelectionPage;
