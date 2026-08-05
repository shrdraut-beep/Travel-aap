import { ScrollView } from '../ScrollView';
import React, { useState, useEffect, useMemo } from 'react';
import { X, Calculator, Car, Train, Plane, Bus, Hotel, Utensils, Coffee, ShieldCheck, Ticket } from 'lucide-react';

interface SmartBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  destination: string;
  days: number;
  persons: number;
  transportMode: string; // 'car', 'train', 'air', 'bus'
  onApplyBudget: (total: number) => void;
}

export const SmartBudgetModal: React.FC<SmartBudgetModalProps> = ({
  isOpen, onClose, lang, destination, days, persons, transportMode, onApplyBudget
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Base realistic rates (INR)
  const RATES = {
    hotelPerNight: 2500, // Average decent hotel per room (2 people)
    foodPerDay: 800, // Per person per day
    localTransportPerDay: 400, // Per person
    activityPerDay: 500, // Per person
    
    // Transport base rates
    flightPerPerson: 5500, // Round trip average
    trainPerPerson: 1200, // Round trip 3AC
    busPerPerson: 1000, // Round trip AC Sleeper
    
    // Car specific
    carRentalPerDay: 2500,
    petrolPerDay: 1500,
    tollsTotal: 800
  };

  const breakdown = useMemo(() => {
    const validDays = Math.max(1, days);
    const validPersons = Math.max(1, persons);
    
    // Calculate rooms needed (assume 2 per room)
    const rooms = Math.ceil(validPersons / 2);
    const hotelCost = rooms * RATES.hotelPerNight * validDays;
    
    const foodCost = validPersons * RATES.foodPerDay * validDays;
    const localTransportCost = validPersons * RATES.localTransportPerDay * validDays;
    const activitiesCost = validPersons * RATES.activityPerDay * validDays;
    
    let travelCost = 0;
    let travelItems: {name: string; cost: number; icon: any}[] = [];
    
    const tMode = transportMode.toLowerCase();
    if (tMode === 'air' || tMode === 'flight') {
      const c = validPersons * RATES.flightPerPerson;
      travelCost += c;
      travelItems.push({ name: lang === 'mr' ? 'विमान तिकीट' : 'Flight Tickets (Round Trip)', cost: c, icon: Plane });
    } else if (tMode === 'train') {
      const c = validPersons * RATES.trainPerPerson;
      travelCost += c;
      travelItems.push({ name: lang === 'mr' ? 'ट्रेन तिकीट' : 'Train Tickets (Round Trip)', cost: c, icon: Train });
    } else if (tMode === 'bus') {
      const c = validPersons * RATES.busPerPerson;
      travelCost += c;
      travelItems.push({ name: lang === 'mr' ? 'बस तिकीट' : 'Bus Tickets (Round Trip)', cost: c, icon: Bus });
    } else if (tMode === 'car' || tMode === 'road') {
      const rental = RATES.carRentalPerDay * validDays;
      const petrol = RATES.petrolPerDay * validDays;
      travelCost += rental + petrol + RATES.tollsTotal;
      travelItems.push({ name: lang === 'mr' ? 'कार भाडे' : 'Car Rental', cost: rental, icon: Car });
      travelItems.push({ name: lang === 'mr' ? 'पेट्रोल/इंधन' : 'Petrol / Fuel', cost: petrol, icon: Coffee });
      travelItems.push({ name: lang === 'mr' ? 'टोल' : 'Tolls', cost: RATES.tollsTotal, icon: Ticket });
    } else {
      // Default fallback
      const c = validPersons * RATES.busPerPerson;
      travelCost += c;
      travelItems.push({ name: lang === 'mr' ? 'प्रवास खर्च' : 'Travel Cost', cost: c, icon: Bus });
    }

    const miscBuffer = Math.round((hotelCost + foodCost + localTransportCost + activitiesCost + travelCost) * 0.1); // 10% buffer
    const total = hotelCost + foodCost + localTransportCost + activitiesCost + travelCost + miscBuffer;

    return {
      hotelCost, foodCost, localTransportCost, activitiesCost, travelItems, miscBuffer, total
    };
  }, [days, persons, transportMode, lang]);

  useEffect(() => {
    if (isOpen) {
      setIsCalculating(true);
      const t = setTimeout(() => setIsCalculating(false), 600);
      return () => clearTimeout(t);
    }
  }, [isOpen, destination, days, persons, transportMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <Calculator className="w-5 h-5" />
            <h3 className="font-black text-lg uppercase tracking-wider">{lang === 'mr' ? 'अंदाजित बजेट' : 'Smart Budget'}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-5  space-y-4   ">
          {isCalculating ? (
            <div className="py-10 flex flex-col items-center justify-center gap-3">
              <Calculator className="w-8 h-8 text-indigo-400 animate-pulse" />
              <p className="text-sm font-bold text-slate-500 animate-pulse">Calculating realistic costs...</p>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>{lang === 'mr' ? 'सहल' : 'Trip Context'}</span>
                  <span className="uppercase">{destination || 'Anywhere'}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-white p-2 rounded-xl border border-slate-200 text-center shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Days</div>
                    <div className="font-black text-indigo-600">{days}</div>
                  </div>
                  <div className="flex-1 bg-white p-2 rounded-xl border border-slate-200 text-center shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Travelers</div>
                    <div className="font-black text-indigo-600">{persons}</div>
                  </div>
                  <div className="flex-1 bg-white p-2 rounded-xl border border-slate-200 text-center shadow-sm">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Mode</div>
                    <div className="font-black text-indigo-600 uppercase">{transportMode}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{lang === 'mr' ? 'खर्च विभागणी' : 'Cost Breakdown'}</h4>
                
                <div className="space-y-2">
                  {breakdown.travelItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <item.icon className="w-4 h-4 text-emerald-500" />
                        {item.name}
                      </div>
                      <div className="font-black text-slate-900">₹{item.cost.toLocaleString('en-IN')}</div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Hotel className="w-4 h-4 text-blue-500" />
                      {lang === 'mr' ? 'हॉटेल (राहणे)' : 'Hotel & Stay'}
                    </div>
                    <div className="font-black text-slate-900">₹{breakdown.hotelCost.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Utensils className="w-4 h-4 text-orange-500" />
                      {lang === 'mr' ? 'जेवण' : 'Food & Dining'}
                    </div>
                    <div className="font-black text-slate-900">₹{breakdown.foodCost.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-purple-500" />
                      {lang === 'mr' ? 'इतर (बफर)' : 'Misc & Buffer (10%)'}
                    </div>
                    <div className="font-black text-slate-900">₹{breakdown.miscBuffer.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-3xl mt-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-black text-slate-500 uppercase tracking-widest">{lang === 'mr' ? 'एकूण अंदाजित खर्च' : 'Total Estimate'}</span>
            <span className="text-2xl font-black text-indigo-600">₹{breakdown.total.toLocaleString('en-IN')}</span>
          </div>
          <button
            onClick={() => {
              onApplyBudget(breakdown.total);
              onClose();
            }}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all"
          >
            {lang === 'mr' ? 'हे बजेट सेट करा' : 'Apply This Budget'}
          </button>
        </div>
      </div>
    </div>
  );
};
