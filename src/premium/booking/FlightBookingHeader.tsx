import React from "react";
import { ArrowLeft, X, Plane, Clock } from "lucide-react";

export interface FlightBookingHeaderProps {
  flight?: any;
  origin?: string;
  originCity?: string;
  destination?: string;
  destinationCity?: string;
  departDate?: string;
  paxCount?: number;
  cabinClass?: string;
  stepNum: number;
  totalSteps?: number;
  stepTitle: string;
  timerText?: string;
  onClose: () => void;
  onBack: () => void;
}

/**
 * FlightBookingHeader - Standardized with the curved bus-booking layout (rounded-b-[24px])
 * and the RouTripo Brand Ocean Palette (from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa]).
 */
export const FlightBookingHeader: React.FC<FlightBookingHeaderProps> = ({
  flight,
  origin,
  originCity,
  destination,
  destinationCity,
  departDate,
  paxCount = 2,
  cabinClass = "Economy",
  stepNum,
  totalSteps = 6,
  stepTitle,
  timerText = "14:45 left",
  onClose,
  onBack
}) => {
  const progressPct = Math.min(100, Math.max(0, (stepNum / totalSteps) * 100));

  const CITY_MAP: Record<string, string> = {
    BOM: "Mumbai",
    DEL: "Delhi",
    BLR: "Bengaluru",
    GOI: "Goa",
    GOX: "Goa (Mopa)",
    CCU: "Kolkata",
    HYD: "Hyderabad",
    MAA: "Chennai",
    PNQ: "Pune",
    AMD: "Ahmedabad",
    JAI: "Jaipur",
    COK: "Kochi",
    DXB: "Dubai",
    SIN: "Singapore",
    BKK: "Bangkok"
  };

  const orgCode = origin || flight?.origin || "BOM";
  const dstCode = destination || flight?.destination || "DEL";
  const orgName = originCity || CITY_MAP[orgCode.toUpperCase()] || orgCode;
  const dstName = destinationCity || CITY_MAP[dstCode.toUpperCase()] || dstCode;

  const formattedDate = departDate
    ? (() => {
        try {
          return new Date(departDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
        } catch {
          return departDate;
        }
      })()
    : "15 Oct";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] text-[#0F172A] rounded-b-[24px] border-b border-sky-200/80 shadow-[0_4px_20px_rgba(2,132,199,0.08)] pb-1 pt-safe font-['Outfit',sans-serif] select-none backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 h-14 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-xs border border-sky-200/80 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
        </button>

        <div className="flex flex-col items-center min-w-0 px-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-[15px] font-black tracking-tight text-[#0F172A] truncate">
              {orgName} ({orgCode})
            </h1>
            <Plane className="w-3.5 h-3.5 text-sky-600 rotate-45 shrink-0" />
            <h1 className="text-[15px] font-black tracking-tight text-[#0F172A] truncate">
              {dstName} ({dstCode})
            </h1>
          </div>
          <div className="font-['Outfit',sans-serif] text-[11px] font-semibold text-[#0369a1] mt-0.5 tracking-wide truncate">
            {formattedDate} · {paxCount} Traveller{paxCount > 1 ? "s" : ""} · {cabinClass}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-xs border border-sky-200/80 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <X className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      <div className="px-4 pb-2.5 pt-1 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10.5px] font-black tracking-[0.08em] uppercase text-sky-900 whitespace-nowrap shrink-0">
            STEP {stepNum} OF {totalSteps}: {stepTitle}
          </span>
          <div className="flex items-center gap-1 text-sky-800 bg-sky-100/90 border border-sky-300/60 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 shadow-2xs">
            <Clock className="w-3 h-3 text-sky-700" />
            <span>{timerText}</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-sky-200/60 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-sky-600 rounded-full transition-all duration-500 ease-out shadow-xs"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </header>
  );
};
