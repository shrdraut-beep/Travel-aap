import React from 'react';
import { ShieldCheck, Check, AlertCircle, Sparkles } from 'lucide-react';

export interface TripProtectionCardProps {
  vertical: 'flight' | 'hotel';
  unitCount: number; // e.g. 2 passengers or 2 nights/rooms
  selected: boolean;
  onToggle: (selected: boolean) => void;
  pricePerUnit?: number; // e.g. 199 for flight, 99 for hotel
}

export const TripProtectionCard: React.FC<TripProtectionCardProps> = ({
  vertical,
  unitCount,
  selected,
  onToggle,
  pricePerUnit = vertical === 'flight' ? 199 : 99
}) => {
  const totalPrice = pricePerUnit * Math.max(1, unitCount);

  const benefits = vertical === 'flight' ? [
    { title: '100% Refund on Medical Emergencies', desc: 'No questions asked, full refund if unable to fly due to illness.' },
    { title: 'Baggage Delay & Loss Protection', desc: 'Coverage up to ₹20,000 for lost or delayed luggage.' },
    { title: 'Flight Delay Allowance', desc: 'Instant ₹2,500 compensation if flight is delayed by > 2 hours.' },
    { title: '24/7 Dedicated Travel Helpline', desc: 'Priority assistance for re-routing and emergency support.' }
  ] : [
    { title: 'Emergency Cancellation Guarantee', desc: '100% refund up to 2 hours before standard check-in time.' },
    { title: 'Accidental Property Damage Coverage', desc: 'Protection against accidental room damages up to ₹25,000.' },
    { title: 'Local Medical & Doctor Support', desc: 'Instant concierge connection to nearby accredited clinics.' }
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>RoutTripo Trip Assurance & Refund Shield</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                RECOMMENDED
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Comprehensive travel protection & zero-loss emergency guarantee</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-base font-extrabold text-slate-900">₹{totalPrice.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-400 block font-semibold">
            (₹{pricePerUnit}/unit · {unitCount} {vertical === 'flight' ? 'Pax' : 'Nights'})
          </span>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
        {benefits.map((b, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">{b.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Choice Radio Buttons */}
      <div className="space-y-2 pt-1">
        {/* Yes Protect Option */}
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
            selected
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              selected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
            }`}>
              {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Yes, protect my travel with RoutTripo Shield (+₹{totalPrice.toLocaleString('en-IN')})
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                87% of smart travellers choose protection for complete peace of mind.
              </span>
            </div>
          </div>
        </button>

        {/* No Option */}
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
            !selected
              ? 'bg-slate-50 border-slate-300'
              : 'bg-white border-slate-200/60 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              !selected ? 'border-slate-600 bg-slate-600' : 'border-slate-300 bg-white'
            }`}>
              {!selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <span className="text-xs font-medium text-slate-600">
              No, I will take the risk and bear all cancellation and delay penalties myself.
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
