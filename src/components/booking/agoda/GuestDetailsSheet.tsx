import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';

export interface GuestCounts {
  rooms: number;
  adults: number;
  children: number;
}

interface Props {
  visible: boolean;
  initialValue?: GuestCounts;
  onClose: () => void;
  onConfirm: (value: GuestCounts) => void;
}

const Stepper = ({ label, sublabel, value, min, onChange }: any) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex-1 pr-4">
      <div className="font-bold text-slate-800 text-lg">{label}</div>
      {sublabel && <div className="text-xs text-slate-500 mt-1 max-w-[220px]">{sublabel}</div>}
    </div>
    <div className="flex items-center gap-3">
      <button 
        className="w-9 h-9 rounded-full border-2 border-[var(--premium-violet)] flex items-center justify-center text-premium-violet disabled:border-slate-300 disabled:text-slate-300 active:scale-95 transition-transform"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-6 text-center font-bold text-xl text-slate-800">{value}</div>
      <button 
        className="w-9 h-9 rounded-full border-2 border-[var(--premium-violet)] flex items-center justify-center text-premium-violet active:scale-95 transition-transform"
        onClick={() => onChange(value + 1)}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export function GuestDetailsSheet({ visible, initialValue = { rooms: 1, adults: 2, children: 0 }, onClose, onConfirm }: Props) {
  const [guests, setGuests] = useState<GuestCounts>(initialValue);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/50 sm:items-center sm:justify-center">
      <div className="w-full bg-white rounded-t-2xl sm:rounded-[20px] sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex-1 text-center">Guest details</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          <Stepper label="Rooms" sublabel="Select 1 room for 1-4 guests, or split across multiple rooms" value={guests.rooms} min={1} onChange={(v: number) => setGuests(g => ({ ...g, rooms: Math.max(1, v) }))} />
          <Stepper label="Adults" value={guests.adults} min={1} onChange={(v: number) => setGuests(g => ({ ...g, adults: Math.max(1, v) }))} />
          <Stepper label="Children" value={guests.children} min={0} onChange={(v: number) => setGuests(g => ({ ...g, children: Math.max(0, v) }))} />
        </div>
        <div className="p-4 border-t border-slate-200">
          <button onClick={() => { onConfirm(guests); onClose(); }} className="w-full premium-gradient-pink text-white font-bold py-3 rounded-full hover:bg-premium-violet-soft active:scale-[0.98] transition-transform">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}