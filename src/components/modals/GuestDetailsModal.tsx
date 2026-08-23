import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

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

const Stepper = ({
  label,
  sublabel,
  value,
  min,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-200">
    <div className="flex-1">
      <div className="text-2xl font-semibold text-navy-900">{value}</div>
      <div className="text-sm font-medium text-gray-900 mt-1">{label}</div>
      {sublabel ? <p className="text-xs text-gray-500 mt-1 max-w-[220px]">{sublabel}</p> : null}
    </div>
    <div className="flex items-center gap-3">
      <button
        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${value <= min ? 'border-gray-300' : 'border-gold-500'}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={18} color={value <= min ? '#D8DBE2' : '#C89B4A'} />
      </button>
      <button
        className="w-9 h-9 rounded-full border-2 border-gold-500 flex items-center justify-center"
        onClick={() => onChange(value + 1)}
      >
        <Plus size={18} color="#C89B4A" />
      </button>
    </div>
  </div>
);

export default function GuestDetailsModal({
  visible,
  initialValue = { rooms: 1, adults: 2, children: 0 },
  onClose,
  onConfirm,
}: Props) {
  if (!visible) return null;
  const [guests, setGuests] = useState<GuestCounts>(initialValue);

  return (
    <div className="fixed inset-0 bg-navy-900/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 h-[80%] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <button onClick={onClose}><X size={24} className="text-navy-900" /></button>
          <h2 className="text-lg font-medium text-navy-900">Guest details</h2>
          <div className="w-6" />
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <Stepper
            label="Rooms"
            sublabel="Select 1 room for 1–4 guests, or split across multiple rooms"
            value={guests.rooms}
            min={1}
            onChange={(v) => setGuests((g) => ({ ...g, rooms: Math.max(1, v) }))}
          />
          <Stepper
            label="Adults"
            value={guests.adults}
            min={1}
            onChange={(v) => setGuests((g) => ({ ...g, adults: Math.max(1, v) }))}
          />
          <Stepper
            label="Children"
            value={guests.children}
            min={0}
            onChange={(v) => setGuests((g) => ({ ...g, children: Math.max(0, v) }))}
          />
        </div>

        <button
          className="w-full bg-navy-900 text-white font-semibold py-3 rounded-full mt-4"
          onClick={() => {
            onConfirm(guests);
            onClose();
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
