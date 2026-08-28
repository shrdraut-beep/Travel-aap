import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCurrency } from '../components/booking/useCurrency';

export const AncillariesFlow: React.FC<{ 
  flightOffer?: any, 
  onComplete?: (data: any) => void 
}> = ({ flightOffer = {}, onComplete = () => {} }) => {
  const { convertToINR, formatToINRDisplay } = useCurrency();
  const [step, setStep] = useState<'seats' | 'meals' | 'baggage'>('seats');
  const [selected, setSelected] = useState<{ seats: any[]; meals: any[]; baggage: any[] }>({ seats: [], meals: [], baggage: [] });
  const [total, setTotal] = useState(0);

  const handleSelect = (type: 'seats' | 'meals' | 'baggage', item: any, price: number) => {
    setSelected(prev => ({ ...prev, [type]: [...prev[type], item] }));
    setTotal(prev => prev + convertToINR(price, flightOffer?.total_currency || 'INR'));
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-6">
        {['seats', 'meals', 'baggage'].map(s => (
          <button key={s} onClick={() => setStep(s as any)} className={`font-bold ${step === s ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {step === 'seats' && <div className="text-center p-10">Aircraft Seat Map Rendering (Simplified)</div>}
        {step === 'meals' && flightOffer.available_services?.filter((s:any) => s.type === 'meal').map((m: any) => (
          <div key={m.id} className="flex justify-between p-3 border rounded-lg mb-2">
            <span>{m.name}</span>
            <button onClick={() => handleSelect('meals', m, m.total_amount)} className="text-blue-600 font-bold">+ Add</button>
          </div>
        ))}
        {step === 'baggage' && <div className="text-center p-10">Baggage List</div>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-between items-center">
        <span className="font-bold">Total Extra: {formatToINRDisplay(total)}</span>
        <button onClick={() => onComplete(selected)} className="bg-blue-600 text-white py-2 px-6 rounded-lg font-bold">Next</button>
      </div>
    </div>
  );
};
