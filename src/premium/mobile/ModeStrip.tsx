import React from "react";
import { Bus, Car, Hotel, Plane, TrainFront } from "lucide-react";
import type { SearchMode } from "./types";

const MODES: Array<{ id: SearchMode; label: string; Icon: typeof Plane }> = [
  { id: "flights", label: "Flights", Icon: Plane },
  { id: "hotels", label: "Hotels", Icon: Hotel },
  { id: "trains", label: "Trains", Icon: TrainFront },
  { id: "buses", label: "Buses", Icon: Bus },
  { id: "cabs", label: "Cabs", Icon: Car }
];

export interface ModeStripProps {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

/**
 * Horizontal icon rail of booking verticals, the first thing a thumb reaches
 * for on the home screen.
 */
export const ModeStrip: React.FC<ModeStripProps> = ({ mode, onChange }) => (
  <div className="-mx-1 flex snap-x gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    {MODES.map(({ id, label, Icon }) => {
      const active = id === mode;
      return (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={active}
          className="flex min-w-[68px] shrink-0 snap-start flex-col items-center gap-1.5 rounded-2xl px-2 py-2"
        >
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
              active
                ? "bg-[var(--color-coral)] text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <span
            className={`text-[11px] font-semibold ${
              active ? "text-slate-900" : "text-slate-500"
            }`}
          >
            {label}
          </span>
        </button>
      );
    })}
  </div>
);
