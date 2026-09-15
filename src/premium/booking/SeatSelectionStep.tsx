import React, { useState } from "react";
import { Check, Plane, Users, ShieldCheck, ChevronRight } from "lucide-react";
import { BookingStepHeader } from "./BookingStepHeader";

export interface SelectedSeat {
  seatCode: string;
  price: number;
  type: "free" | "xl" | "paid";
  paxIndex: number;
}

export interface SeatSelectionStepProps {
  flight: any;
  passengerCount: number;
  selectedSeats: SelectedSeat[];
  onConfirmSeats: (seats: SelectedSeat[]) => void;
  onBack: () => void;
}

export const SeatSelectionStep: React.FC<SeatSelectionStepProps> = ({
  flight,
  passengerCount = 1,
  selectedSeats: initialSeats = [],
  onConfirmSeats,
  onBack
}) => {
  const [seats, setSeats] = useState<SelectedSeat[]>(initialSeats);
  const [currentPaxIndex, setCurrentPaxIndex] = useState<number>(0);

  const org = flight?.origin || flight?.originCode || "BOM";
  const dst = flight?.destination || flight?.destinationCode || "DEL";
  const airline = flight?.airline || "IndiGo";
  const flightNo = flight?.flightNumber || "6E-2045";

  // Rows 1 to 18, columns A-F
  const rows = Array.from({ length: 18 }, (_, i) => i + 1);
  const colsLeft = ["A", "B", "C"];
  const colsRight = ["D", "E", "F"];

  const getSeatStatus = (row: number, col: string) => {
    // Some occupied seats
    if ((row === 2 && col === "C") || (row === 5 && col === "A") || (row === 8 && col === "D") || (row === 14 && col === "F")) {
      return { status: "occupied", price: 0, type: "disabled" };
    }
    if (row === 1 || row === 12 || row === 13) {
      return { status: "xl", price: 850, type: "xl" };
    }
    if (row >= 14 && (col === "B" || col === "E")) {
      return { status: "free", price: 0, type: "free" };
    }
    return { status: "paid", price: 350, type: "paid" };
  };

  const handleSeatClick = (seatCode: string, price: number, type: any) => {
    const existingIndex = seats.findIndex((s) => s.seatCode === seatCode);

    if (existingIndex >= 0) {
      // Unselect
      setSeats(seats.filter((s) => s.seatCode !== seatCode));
    } else {
      // Select for current pax
      const updated = seats.filter((s) => s.paxIndex !== currentPaxIndex);
      updated.push({ seatCode, price, type, paxIndex: currentPaxIndex });
      setSeats(updated);

      // Auto advance to next passenger if more exist
      if (currentPaxIndex < passengerCount - 1) {
        setCurrentPaxIndex(currentPaxIndex + 1);
      }
    }
  };

  const totalSeatsPrice = seats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="min-h-screen bg-[var(--premium-page)] text-[var(--premium-ink)] pb-28">
      {/* Header */}
      <BookingStepHeader
        title="Select Seats"
        step="Step 3 of 6"
        subtitle={<>{airline} {flightNo} • {org} ➔ {dst}</>}
        onBack={onBack}
        backAriaLabel="Back to passenger details"
        rightElement={
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Passenger
            </span>
            <span className="text-xs font-bold text-slate-800">
              {currentPaxIndex + 1} of {passengerCount}
            </span>
          </div>
        }
      >
        {/* Passenger Switcher if multiple pax */}
        {passengerCount > 1 && (
          <div className="max-w-3xl mx-auto px-4 py-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {Array.from({ length: passengerCount }, (_, i) => {
              const assigned = seats.find((s) => s.paxIndex === i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPaxIndex(i)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                    currentPaxIndex === i
                      ? "bg-[var(--premium-violet)] text-white shadow-xs"
                      : assigned
                      ? "bg-pink-50 text-pink-700 border border-pink-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Passenger {i + 1}
                  {assigned && ` (${assigned.seatCode})`}
                </button>
              );
            })}
          </div>
        )}
      </BookingStepHeader>

      {/* Main Seat Map Area */}
      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Seat Legend */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-around text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-pink-100 border border-pink-300" />
            <span className="text-slate-600">Free (₹0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-sky-100 border border-sky-300" />
            <span className="text-slate-600">Standard (₹350)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-pink-100 border border-pink-400" />
            <span className="text-slate-600">XL Legroom (₹850)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-slate-200" />
            <span className="text-slate-400">Occupied</span>
          </div>
        </div>

        {/* Aircraft Fuselage Container */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
          {/* Plane Nose / Cockpit Graphic */}
          <div className="w-44 h-16 border-t-2 border-x-2 border-slate-300 rounded-t-full mx-auto flex items-center justify-center mb-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
            Front of Aircraft
          </div>

          {/* Seat Grid */}
          <div className="space-y-2.5">
            {rows.map((rowNum) => (
              <div key={rowNum} className="flex items-center justify-between gap-2">
                {/* Left Side: A B C */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {colsLeft.map((col) => {
                    const code = `${rowNum}${col}`;
                    const { status, price, type } = getSeatStatus(rowNum, col);
                    const isOccupied = status === "occupied";
                    const isSelected = seats.some((s) => s.seatCode === code);

                    return (
                      <button
                        key={code}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => handleSeatClick(code, price, type)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? "bg-[var(--premium-violet)] text-white ring-2 ring-[var(--premium-violet)] ring-offset-2 scale-105"
                            : isOccupied
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : status === "xl"
                            ? "bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100"
                            : status === "free"
                            ? "bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100"
                            : "bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100"
                        }`}
                        title={`${code} • ₹${price}`}
                      >
                        <span>{col}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Aisle Row Number */}
                <div className="w-6 text-center text-[11px] font-bold text-slate-400">
                  {rowNum}
                </div>

                {/* Right Side: D E F */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {colsRight.map((col) => {
                    const code = `${rowNum}${col}`;
                    const { status, price, type } = getSeatStatus(rowNum, col);
                    const isOccupied = status === "occupied";
                    const isSelected = seats.some((s) => s.seatCode === code);

                    return (
                      <button
                        key={code}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => handleSeatClick(code, price, type)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? "bg-[var(--premium-violet)] text-white ring-2 ring-[var(--premium-violet)] ring-offset-2 scale-105"
                            : isOccupied
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : status === "xl"
                            ? "bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100"
                            : status === "free"
                            ? "bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100"
                            : "bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100"
                        }`}
                        title={`${code} • ₹${price}`}
                      >
                        <span>{col}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-4 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Selected ({seats.length}/{passengerCount})
            </span>
            <div className="text-base font-bold text-slate-900">
              {seats.length > 0 ? (
                <span>
                  {seats.map((s) => s.seatCode).join(", ")} • ₹{totalSeatsPrice}
                </span>
              ) : (
                <span className="text-slate-400 font-normal text-sm">No seats selected</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onConfirmSeats([])}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => onConfirmSeats(seats)}
              className="px-5 py-2.5 rounded-xl bg-[var(--premium-violet)] text-white font-bold text-xs shadow-xs hover:opacity-95 transition-opacity flex items-center gap-1.5"
            >
              <span>Continue to Baggage</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
