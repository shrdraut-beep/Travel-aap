import { ScrollView } from '../ScrollView';
import React, { useState, useEffect } from 'react';
import { X, Fuel, Calculator, ArrowRight, DollarSign, Navigation, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { motion } from "motion/react";

import { geocodePlace, fetchOptimizedRoute } from '../../services/api/routing';


interface FuelCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  currencySymbol?: string;
  onAddAsExpense: (calculatedCost: number) => void;
}


export const FuelCalculatorModal: React.FC<FuelCalculatorModalProps> = ({
  isOpen,
  onClose,
  lang,
  currencySymbol = '₹',
  onAddAsExpense
}) => {
  const isMr = lang === 'mr';
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [distance, setDistance] = useState<string>('300');
  const [mileage, setMileage] = useState<string>('15');
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'CNG'>('Petrol');
  const [fuelPrice, setFuelPrice] = useState<string>('105');
  const [tollCharges, setTollCharges] = useState<string>('250');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Auto-update fuel price based on type
  useEffect(() => {
    if (fuelType === 'Petrol') setFuelPrice('106');
    else if (fuelType === 'Diesel') setFuelPrice('92');
    else if (fuelType === 'CNG') setFuelPrice('85');
  }, [fuelType]);

  if (!isOpen) return null;

  const d = parseFloat(distance) || 0;
  const m = parseFloat(mileage) || 0;
  const f = parseFloat(fuelPrice) || 0;
  const t = parseFloat(tollCharges) || 0;

  const fuelLiters = m > 0 ? d / m : 0;
  const fuelCost = fuelLiters * f;
  const totalCost = Math.round(fuelCost + t);

  const handleFetchDistance = async () => {
    if (!origin.trim() || !destination.trim()) return;
    setIsCalculatingRoute(true);
    try {
      const p1 = await geocodePlace(origin);
      const p2 = await geocodePlace(destination);
      if (p1 && p2) {
        const route = await fetchOptimizedRoute([p1, p2], 'driving');
        if (route) {
          const distKm = route.distance / 1000;
          setDistance(distKm.toFixed(1));
          
          // Smart Toll Estimation (~₹1.8 per km for driving long distance)
          if (distKm > 50) {
             const estimatedToll = Math.round(distKm * 1.8);
             setTollCharges(estimatedToll.toString());
          } else {
             setTollCharges('0');
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleAddExpense = () => {
    onAddAsExpense(totalCost);
  };

  return (
    <div className="overflow-y-auto fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4    ">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-t-[32px] sm:rounded-[28px] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-auto max-h-[85vh]"
      >
        {/* Header */}
        <div className="relative p-6 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-lg">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {isMr ? 'स्मार्ट इंधन आणि टोल कॅल्क्युलेटर' : 'Smart Fuel & Toll Calculator'}
              </h3>
              <p className="text-xs text-cyan-100 font-semibold mt-0.5">
                {isMr ? 'प्रवासाचा अचूक इंधन आणि टोल खर्च काढा' : 'Calculate accurate journey fuel & toll cost'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="overflow-y-auto p-6 space-y-5 max-h-[75vh]    ">
          
          {/* Smart Route Calculator */}
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-3">
             <div className="text-xs font-bold text-indigo-700 uppercase flex items-center gap-1.5">
               <MapPin className="w-3.5 h-3.5" />
               {isMr ? 'मार्गानुसार अंतर काढा' : 'Calculate by Route'}
             </div>
             <div className="grid grid-cols-2 gap-3">
               <input 
                 type="text" 
                 placeholder={isMr ? 'कुठून' : 'Origin'} 
                 value={origin} 
                 onChange={e => setOrigin(e.target.value)}
                 className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-400"
               />
               <input 
                 type="text" 
                 placeholder={isMr ? 'कुठे' : 'Destination'} 
                 value={destination} 
                 onChange={e => setDestination(e.target.value)}
                 className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-400"
               />
             </div>
             <button
               onClick={handleFetchDistance}
               disabled={isCalculatingRoute || !origin || !destination}
               className="w-full bg-indigo-600 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {isCalculatingRoute ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
               {isMr ? 'अंतर आणि टोल काढा' : 'Fetch Route Distance & Toll'}
             </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Distance */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-cyan-600" />
                {isMr ? 'एकूण अंतर (किमी)' : 'Total Distance (km)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="300"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">km</span>
              </div>
            </div>

            {/* Mileage */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-cyan-600" />
                {isMr ? 'गाडीचे मायलेज (किमी/लीटर)' : 'Vehicle Mileage (km/L)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="15"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">km/L</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fuel Type/Price */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-cyan-600" />
                  {isMr ? 'इंधन दर' : 'Fuel Price'}
                </div>
                <select 
                  value={fuelType} 
                  onChange={e => setFuelType(e.target.value as any)}
                  className="text-[10px] bg-white border border-slate-200 rounded-lg outline-none font-bold p-1"
                >
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>CNG</option>
                </select>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(e.target.value)}
                  placeholder="105"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹/L</span>
              </div>
            </div>

            {/* Toll Charges */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-cyan-600" />
                {isMr ? 'अंदाजित टोल खर्च (₹)' : 'Toll Charges (₹)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={tollCharges}
                  onChange={(e) => setTollCharges(e.target.value)}
                  placeholder="250"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
              </div>
            </div>
          </div>

          {/* Realtime Breakdown Card */}
          <div className="bg-gradient-to-br from-slate-50 to-cyan-50/50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              {isMr ? 'हिशोब तपशील' : 'Calculation Breakdown'}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-xs">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">{isMr ? 'लागणारे इंधन' : 'Fuel Needed'}</span>
                <span className="font-extrabold text-slate-800 text-sm">{fuelLiters.toFixed(1)} {fuelType === 'CNG' ? 'kg' : 'L'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-xs">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">{isMr ? 'इंधन खर्च' : 'Fuel Cost'}</span>
                <span className="font-extrabold text-cyan-700 text-sm">{currencySymbol}{Math.round(fuelCost)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-xs">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">{isMr ? 'टोल खर्च' : 'Toll Charges'}</span>
                <span className="font-extrabold text-indigo-700 text-sm">{currencySymbol}{Math.round(t)}</span>
              </div>
            </div>
          </div>

          {/* Prominent Total Cost Display */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                {isMr ? 'एकूण अंदाजित खर्च' : 'Total Estimated Cost'}
              </span>
              <p className="text-3xl font-black text-white mt-0.5 tracking-tight">
                {currencySymbol}{totalCost.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Fuel className="w-6 h-6" />
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleAddExpense}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isMr ? 'खर्चात जोडा (Add as Trip Expense)' : 'Add as Trip Expense'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
