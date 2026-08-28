import React from "react";
import { Minus, Plus } from "lucide-react";
import { PremiumButton } from "./primitives";

export interface TravellerCounts {
  adults: number;
  children: number;
  infants: number;
}

export type CabinClass = "Economy" | "Premium Economy" | "Business" | "First";

const CABINS: CabinClass[] = ["Economy", "Premium Economy", "Business", "First"];

const ROWS: Array<{
  key: keyof TravellerCounts;
  label: string;
  caption: string;
  min: number;
}> = [
  { key: "adults", label: "Adults", caption: "12 years and above", min: 1 },
  { key: "children", label: "Children", caption: "2 - 12 years", min: 0 },
  { key: "infants", label: "Infants", caption: "Under 2 years", min: 0 }
];

export const summariseTravellers = (
  counts: TravellerCounts,
  cabin: CabinClass
) => {
  const total = counts.adults + counts.children + counts.infants;
  return `${total} Traveller${total > 1 ? "s" : ""} · ${cabin}`;
};

export interface TravellerPickerProps {
  counts: TravellerCounts;
  cabin: CabinClass;
  showCabin?: boolean;
  onChange: (counts: TravellerCounts) => void;
  onCabinChange: (cabin: CabinClass) => void;
  onClose: () => void;
}

export const TravellerPicker: React.FC<TravellerPickerProps> = ({
  counts,
  cabin,
  showCabin = true,
  onChange,
  onCabinChange,
  onClose
}) => {
  const step = (key: keyof TravellerCounts, delta: number, min: number) => {
    const next = Math.min(9, Math.max(min, counts[key] + delta));
    onChange({ ...counts, [key]: next });
  };

  return (
    <div className="w-[min(360px,calc(100vw-3rem))] rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_30px_80px_-25px_rgba(15,23,42,0.4)]">
      <div className="space-y-5">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-slate-900">
                {row.label}
              </p>
              <p className="text-[12px] font-medium text-slate-400">
                {row.caption}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={`Remove one ${row.label}`}
                disabled={counts[row.key] <= row.min}
                onClick={() => step(row.key, -1, row.min)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-all hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 disabled:hover:border-slate-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-5 text-center text-[15px] font-bold text-slate-900">
                {counts[row.key]}
              </span>
              <button
                type="button"
                aria-label={`Add one ${row.label}`}
                disabled={counts[row.key] >= 9}
                onClick={() => step(row.key, 1, row.min)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-all hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 disabled:hover:border-slate-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCabin ? (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Travel class
          </p>
          <div className="flex flex-wrap gap-2">
            {CABINS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onCabinChange(option)}
                className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${
                  option === cabin
                    ? "bg-[var(--color-coral)] text-white shadow-md shadow-[var(--color-coral)]/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <PremiumButton className="mt-6 w-full" onClick={onClose}>
        Apply
      </PremiumButton>
    </div>
  );
};
