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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0ea5e9] text-white rounded-b-[24px] shadow-[0_4px_20px_rgba(14,165,233,0.25)] pb-1 pt-safe font-['Outfit'] select-none">
      <div className="flex items-center justify-between px-4 h-14">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[15px] font-bold tracking-wide text-white">
              {orgName} ({orgCode})
            </h1>
            <Plane className="w-3.5 h-3.5 text-white rotate-45" />
            <h1 className="text-[15px] font-bold tracking-wide text-white">
              {dstName} ({dstCode})
            </h1>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[11px] font-medium opacity-90 mt-0.5 tracking-wide text-sky-100">
            {formattedDate} • {paxCount} Traveller{paxCount > 1 ? "s" : ""} • {cabinClass}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-4 pb-3 pt-1.5">
        <div className="flex items-end justify-between mb-1.5">
          <span className="font-['JetBrains_Mono',monospace] text-[10.5px] font-bold tracking-[0.1em] uppercase text-white">
            STEP {stepNum} OF {totalSteps}: {stepTitle}
          </span>
          <div className="flex items-center gap-1 text-sky-100 text-[10.5px] font-['JetBrains_Mono',monospace]">
            <Clock className="w-3 h-3" />
            <span>{timerText}</span>
          </div>
        </div>
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </header>
  );
};
