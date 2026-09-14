import React from "react";
import { Bus, Car, Hotel, Plane, Palmtree, Train } from "lucide-react";
import type { SearchMode } from "./types";
import { useTranslation } from "react-i18next";

const MODES: Array<{ id: SearchMode; label: string; transKey: string; Icon: typeof Plane; imgSrc?: string }> = [
  { id: "flights", label: "Flights", transKey: "search_flights", Icon: Plane, imgSrc: "/icons/flight.png" },
  { id: "hotels", label: "Hotels", transKey: "search_hotels", Icon: Hotel, imgSrc: "/icons/hotel.png" },
  { id: "trains", label: "Trains", transKey: "search_trains", Icon: Train, imgSrc: "/icons/train.png" },
  { id: "buses", label: "Buses", transKey: "search_buses", Icon: Bus, imgSrc: "/icons/bus.png" },
  { id: "cabs", label: "Cabs", transKey: "search_cabs", Icon: Car, imgSrc: "/icons/cabs.png" },
  { id: "holidays", label: "Holidays", transKey: "search_holidays", Icon: Palmtree, imgSrc: "/icons/holiday.png" }
];

export interface ModeStripProps {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

export const ModeStrip: React.FC<ModeStripProps> = ({ mode, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {MODES.map(({ id, label, transKey, Icon, imgSrc }) => {
        const active = id === mode;
        const translatedLabel = String(t(transKey as any, label as any));
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className="flex min-w-[64px] shrink-0 snap-start flex-col items-center gap-1 p-1 transition-all duration-150 active:scale-95 border-none outline-none bg-transparent"
          >
            <div className="relative flex items-center justify-center p-1">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={label}
                  className={`h-11 w-11 object-contain transition-all duration-200 ${
                    active ? "scale-115 drop-shadow-lg" : "opacity-80 hover:opacity-100 hover:scale-105 drop-shadow-sm grayscale-[15%]"
                  }`}
                />
              ) : (
                <Icon className={`h-8 w-8 ${active ? "text-sky-600" : "text-slate-400"}`} />
              )}
            </div>
            <span
              className={`text-[11.5px] tracking-tight leading-tight transition-colors ${
                active ? "text-sky-600 font-black" : "text-slate-500 font-semibold hover:text-slate-700"
              }`}
            >
              {translatedLabel}
            </span>
            {active && (
              <span className="h-1 w-1.5 rounded-full bg-sky-600 -mt-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
};
