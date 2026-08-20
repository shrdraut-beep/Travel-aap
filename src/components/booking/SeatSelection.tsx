// src/components/booking/SeatSelection.tsx
import React, { useState } from 'react';
import { useBookingFlow, SelectedSeat } from '../../context/BookingFlowContext';
import { HoldTimer } from './HoldTimer';
import { ArrowLeft, Check, Users } from 'lucide-react';

type SeatStatus = 'free' | 'xl' | 'paid' | 'disabled';
type SeatCell = { code: string; status: SeatStatus; price: number };

function generateSeats(): SeatCell[][] {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  return Array.from({ length: 18 }, (_, r) => {
    const rowNum = r + 1;
    return cols.map((col) => {
      let status: SeatStatus = 'paid';
      let price = 350;

      if (rowNum === 1 || rowNum === 12 || rowNum === 13) {
        status = 'xl';
        price = 850;
      } else if (rowNum >= 14 && (col === 'B' || col === 'E')) {
        status = 'free';
        price = 0;
      } else if (rowNum >= 6 && rowNum <= 10 && (col === 'A' || col === 'F')) {
        status = 'paid';
        price = 450;
      } else if (rowNum % 4 === 0 && (col === 'C' || col === 'D')) {
        status = 'disabled';
        price = 0;
      }

      return {
        code: `${rowNum}${col}`,
        status,
        price,
      };
    });
  });
}

export interface SeatSelectionProps {
  legs?: { id: string; label: string }[];
  onSkip: () => void;
  onNext: () => void;
  onBack?: () => void;
}

export const SeatSelection: React.FC<SeatSelectionProps> = ({
  legs = [{ id: 'leg-1', label: 'Departure Flight' }],
  onSkip,
  onNext,
  onBack,
}) => {
  const { state, dispatch, totals } = useBookingFlow();
  const [activeLeg, setActiveLeg] = useState(legs[0]?.id || 'leg-1');
  const [rows] = useState(() => generateSeats());

  const selectedForLeg = state.seats.filter((s) => s.legId === activeLeg);

  const handleSeatClick = (seat: SeatCell) => {
    if (seat.status === 'disabled') return;
    dispatch({
      type: 'TOGGLE_SEAT',
      seat: {
        legId: activeLeg,
        seatCode: seat.code,
        type: seat.status === 'free' ? 'free' : seat.status === 'xl' ? 'xl' : 'paid',
        price: seat.price,
      },
    });
  };

  const statusColor: Record<SeatStatus, { bg: string; text: string; border: string }> = {
    free: { bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
    xl: { bg: 'bg-blue-50 hover:bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    paid: { bg: 'bg-amber-50 hover:bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    disabled: { bg: 'bg-slate-100 cursor-not-allowed', text: 'text-slate-400', border: 'border-slate-200' },
  };

  return (
    <div className="bg-[#F7F8FA] min-h-full flex flex-col">
      {/* Top Bar with Leg Selector */}
      <div className="bg-white border-b border-slate-200 text-slate-900 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Select Your Preferred Seats</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>{state.passengerCount} passenger{state.passengerCount > 1 ? 's' : ''} • Max {state.passengerCount} seat{state.passengerCount > 1 ? 's' : ''} per sector</span>
              </p>
            </div>
          </div>
          <HoldTimer />
        </div>

        {/* Leg Tabs if multi-leg */}
        {legs.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {legs.map((leg) => (
              <button
                key={leg.id}
                onClick={() => setActiveLeg(leg.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeLeg === leg.id
                    ? 'bg-[#FF5A5F] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {leg.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend & Seat Rules */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-slate-600 font-bold">Free (₹0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-blue-500 inline-block" />
            <span className="text-slate-600 font-bold">XL Extra Legroom (₹850)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-amber-500 inline-block" />
            <span className="text-slate-600 font-bold">Standard Paid (₹350 - ₹450)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-slate-300 inline-block" />
            <span className="text-slate-400 font-bold">Occupied</span>
          </div>
        </div>
        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          Selected: {selectedForLeg.length}/{state.passengerCount}
        </span>
      </div>

      {/* Interactive Aircraft Fuselage */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[480px]">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          {/* Airplane Cockpit Indicator */}
          <div className="text-center pb-2 border-b border-dashed border-slate-200">
            <div className="w-16 h-8 mx-auto bg-slate-100 rounded-t-full border-t-2 border-x-2 border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
              FRONT
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
              Cockpit & Galley Area
            </span>
          </div>

          {/* Column Letters */}
          <div className="flex items-center justify-between text-xs font-black text-slate-400 px-3">
            <div className="flex items-center gap-2">
              <span className="w-7 text-center">A</span>
              <span className="w-7 text-center">B</span>
              <span className="w-7 text-center">C</span>
            </div>
            <span className="text-[10px] text-slate-300">AISLE</span>
            <div className="flex items-center gap-2">
              <span className="w-7 text-center">D</span>
              <span className="w-7 text-center">E</span>
              <span className="w-7 text-center">F</span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="space-y-2">
            {rows.map((row, rIdx) => {
              const rowNum = rIdx + 1;
              const leftSeats = row.slice(0, 3);
              const rightSeats = row.slice(3, 6);

              return (
                <div key={rIdx} className="flex items-center justify-between gap-1">
                  {/* Left 3 seats (A, B, C) */}
                  <div className="flex items-center gap-1.5">
                    {leftSeats.map((seat) => {
                      const isSelected = state.seats.some(
                        (s) => s.legId === activeLeg && s.seatCode === seat.code
                      );
                      const styles = statusColor[seat.status];

                      return (
                        <button
                          key={seat.code}
                          type="button"
                          disabled={seat.status === 'disabled'}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-9 h-10 rounded-lg text-xs font-black flex items-center justify-center border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-xs scale-105'
                              : `${styles.bg} ${styles.text} ${styles.border}`
                          }`}
                          title={`${seat.code} • ${seat.status.toUpperCase()} • ₹${seat.price}`}
                        >
                          {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : seat.code}
                        </button>
                      );
                    })}
                  </div>

                  {/* Row Number in Aisle */}
                  <span className="text-[10px] font-mono font-black text-slate-300 w-6 text-center">
                    {rowNum}
                  </span>

                  {/* Right 3 seats (D, E, F) */}
                  <div className="flex items-center gap-1.5">
                    {rightSeats.map((seat) => {
                      const isSelected = state.seats.some(
                        (s) => s.legId === activeLeg && s.seatCode === seat.code
                      );
                      const styles = statusColor[seat.status];

                      return (
                        <button
                          key={seat.code}
                          type="button"
                          disabled={seat.status === 'disabled'}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-9 h-10 rounded-lg text-xs font-black flex items-center justify-center border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-xs scale-105'
                              : `${styles.bg} ${styles.text} ${styles.border}`
                          }`}
                          title={`${seat.code} • ${seat.status.toUpperCase()} • ₹${seat.price}`}
                        >
                          {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : seat.code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Panel */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">
              Seats ({state.seats.length}/{state.passengerCount * legs.length})
            </span>
            <span className="text-sm font-black text-slate-900">
              ₹{totals.seats.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {state.seats.length === 0
              ? 'No seats chosen (auto-assigned free)'
              : state.seats.map((s) => s.seatCode).join(', ')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-xs hover:bg-slate-50 cursor-pointer"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2.5 bg-[#FF5A5F] hover:bg-[#ff4046] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
          >
            Next: Meals →
          </button>
        </div>
      </div>
    </div>
  );
};
