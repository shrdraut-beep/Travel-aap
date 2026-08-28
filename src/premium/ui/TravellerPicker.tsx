import React from "react";
import { Minus, Plus } from "lucide-react";

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
}

export const TravellerPicker: React.FC<TravellerPickerProps> = ({
  counts,
  cabin,
  showCabin = true,
  onChange,
  onCabinChange
}) => {
  const step = (key: keyof TravellerCounts, delta: number, min: number) => {
    const next = Math.min(9, Math.max(min, counts[key] + delta));
    onChange({ ...counts, [key]: next });
  };

  return (
    <div className="px-5 py-5">
      <div className="space-y-6">
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
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors active:bg-slate-100 disabled:opacity-30"
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
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors active:bg-slate-100 disabled:opacity-30"
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
                    ? "bg-[var(--color-coral)] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
