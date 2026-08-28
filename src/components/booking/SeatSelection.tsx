import React, { useState, useMemo } from 'react';
import { useBookingFlow } from '../../context/BookingFlowContext';
import { HoldTimer } from './HoldTimer';
import { 
  ArrowLeft, 
  Check, 
  Users, 
  Plane, 
  Compass as Sparkles, 
  CheckCircle2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export type SeatStatus = 'free' | 'xl' | 'paid' | 'disabled';
export interface SeatCell {
  code: string;
  status: SeatStatus;
  price: number;
}

export interface FlightSliceLeg {
  id: string;
  label: string;
  origin?: string;
  destination?: string;
  flightNumber?: string;
}

function generateAircraftSeatMap(): SeatCell[][] {
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
  legs?: FlightSliceLeg[];
  offer?: any;
  passengerCount?: number;
  onSkip?: () => void;
  onNext?: () => void;
  onBack?: () => void;
}

export const SeatSelection: React.FC<SeatSelectionProps> = ({
  legs: propLegs,
  offer,
  passengerCount: propPaxCount,
  onSkip,
  onNext,
  onBack,
}) => {
  const { state, dispatch } = useBookingFlow();

  // Derive legs dynamically from offer.slices if available
  const slices: any[] = offer?.slices || [];
  const derivedLegs: FlightSliceLeg[] = useMemo(() => {
    if (propLegs && propLegs.length > 0) return propLegs;
    if (slices.length > 0) {
      return slices.map((slice: any, idx: number) => {
        const segs = slice.segments || [];
        const firstSeg = segs[0] || {};
        const lastSeg = segs[segs.length - 1] || firstSeg;
        const orig = firstSeg.origin?.iata_code || firstSeg.origin?.name || '---';
        const dest = lastSeg.destination?.iata_code || lastSeg.destination?.name || '---';
        const fltNum = firstSeg.marketing_carrier_flight_number 
          ? `${firstSeg.marketing_carrier?.iata_code || ''} ${firstSeg.marketing_carrier_flight_number}`.trim()
          : '';

        return {
          id: slice.id || `slice-${idx}`,
          label: slices.length > 1
            ? (idx === 0 ? `Flight 1 (${orig} ➔ ${dest})` : idx === 1 ? `Flight 2 (${orig} ➔ ${dest})` : `Flight ${idx + 1} (${orig} ➔ ${dest})`)
            : `${orig} ➔ ${dest}`,
          origin: orig,
          destination: dest,
          flightNumber: fltNum
        };
      });
    }
    return [{ id: 'leg-1', label: 'Flight 1 (Departure Flight)', origin: 'BOM', destination: 'DEL' }];
  }, [propLegs, slices]);

  const [activeLegIndex, setActiveLegIndex] = useState<number>(0);
  const activeLeg = derivedLegs[activeLegIndex] || derivedLegs[0];

  // Dynamic Passenger Count limit
  const passengerCount = propPaxCount || state?.passengerCount || (state?.passengers?.length > 0 ? state.passengers.length : 1);

  // Selected seats strictly grouped by slice / legId
  const [selectedSeatsByLeg, setSelectedSeatsByLeg] = useState<Record<string, Array<{ seatCode: string; price: number; type: string }>>>(() => {
    // Populate from global context if available
    const initialMap: Record<string, Array<{ seatCode: string; price: number; type: string }>> = {};
    if (state?.seats && state.seats.length > 0) {
      state.seats.forEach(s => {
        if (!initialMap[s.legId]) initialMap[s.legId] = [];
        initialMap[s.legId].push({
          seatCode: s.seatCode,
          price: s.price,
          type: s.type
        });
      });
    }
    return initialMap;
  });

  const rows = useMemo(() => generateAircraftSeatMap(), []);
  const activeLegSelectedSeats = selectedSeatsByLeg[activeLeg.id] || [];

  // Total seat cost calculation for current leg
  const currentLegSeatCost = useMemo(() => {
    return activeLegSelectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
  }, [activeLegSelectedSeats]);

  // Total seat cost calculation across all flight legs
  const allLegsSeatCost = useMemo(() => {
    return Object.values(selectedSeatsByLeg).reduce((sum, seatList) => {
      return sum + seatList.reduce((lSum, s) => lSum + (s.price || 0), 0);
    }, 0);
  }, [selectedSeatsByLeg]);

  const handleSeatClick = (seat: SeatCell) => {
    if (seat.status === 'disabled') return;

    setSelectedSeatsByLeg(prev => {
      const currentList = prev[activeLeg.id] || [];
      const existsIndex = currentList.findIndex(s => s.seatCode === seat.code);

      let updatedList: Array<{ seatCode: string; price: number; type: string }>;
      if (existsIndex !== -1) {
        // Deselect
        updatedList = currentList.filter(s => s.seatCode !== seat.code);
      } else {
        const newSeat = {
          seatCode: seat.code,
          price: seat.price,
          type: seat.status,
        };
        if (currentList.length >= passengerCount) {
          // If already reached limit, replace the earliest selected seat
          updatedList = [...currentList.slice(1), newSeat];
        } else {
          updatedList = [...currentList, newSeat];
        }
      }

      return {
        ...prev,
        [activeLeg.id]: updatedList,
      };
    });

    // Also dispatch to global context
    dispatch({
      type: 'TOGGLE_SEAT',
      seat: {
        legId: activeLeg.id,
        seatCode: seat.code,
        type: seat.status === 'free' ? 'free' : seat.status === 'xl' ? 'xl' : 'paid',
        price: seat.price,
      },
    });
  };

  const isCurrentLegComplete = activeLegSelectedSeats.length === passengerCount;

  const handleNextSliceOrCheckout = () => {
    if (!isCurrentLegComplete) return;

    if (activeLegIndex < derivedLegs.length - 1) {
      // Proceed to next flight leg/slice tab
      setActiveLegIndex(prev => prev + 1);
    } else {
      // Completed all flight legs, proceed to next step in checkout
      if (onNext) {
        onNext();
      }
    }
  };

  const statusColor: Record<SeatStatus, { bg: string; text: string; border: string }> = {
    free: { bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
    xl: { bg: 'bg-blue-50 hover:bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    paid: { bg: 'bg-amber-50 hover:bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    disabled: { bg: 'bg-slate-100 cursor-not-allowed', text: 'text-slate-400', border: 'border-slate-200' },
  };

  return (
    <div className="bg-[#F7F8FA] min-h-full flex flex-col font-[Inter]">
      {/* Top Header with Multi-Slice Tabs */}
      <div className="bg-white border-b border-slate-200 text-slate-900 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                type="button" 
                onClick={onBack} 
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Select Seats</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                <Users className="w-3.5 h-3.5 text-[#e11d48]" />
                <span>
                  <strong>{passengerCount} Traveler{passengerCount > 1 ? 's' : ''}</strong> • Please choose exactly {passengerCount} seat{passengerCount > 1 ? 's' : ''} on the map
                </span>
              </p>
            </div>
          </div>
          <HoldTimer />
        </div>

        {/* Multi-Slice Flight Tabs */}
        {derivedLegs.length > 1 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Select Flight Sector to Assign Seats:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {derivedLegs.map((leg, idx) => {
                const isActive = activeLegIndex === idx;
                const legSeats = selectedSeatsByLeg[leg.id] || [];
                const isLegFull = legSeats.length === passengerCount;

                return (
                  <button
                    key={leg.id || idx}
                    type="button"
                    onClick={() => setActiveLegIndex(idx)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#e11d48] text-white shadow-md ring-2 ring-[#e11d48]/20'
                        : isLegFull
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Plane className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="whitespace-nowrap">{leg.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white text-[#e11d48]' : isLegFull ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}>
                      {legSeats.length}/{passengerCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Sector Status */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-slate-700 font-bold">Free (₹0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-blue-500 inline-block" />
            <span className="text-slate-700 font-bold">XL Legroom (₹850)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-amber-500 inline-block" />
            <span className="text-slate-700 font-bold">Standard Paid (₹350 - ₹450)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-slate-300 inline-block" />
            <span className="text-slate-400 font-bold">Occupied</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
            Sector: <strong className="text-slate-900">{activeLeg.origin || 'Origin'} ➔ {activeLeg.destination || 'Destination'}</strong>
          </span>
          <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg border ${
            isCurrentLegComplete 
              ? 'text-emerald-800 bg-emerald-50 border-emerald-200' 
              : 'text-amber-800 bg-amber-50 border-amber-200'
          }`}>
            Selected: {activeLegSelectedSeats.length}/{passengerCount}
          </span>
        </div>
      </div>

      {/* Selected Seat Assignments Banner */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500">Passenger Seat Allocation:</span>
          {Array.from({ length: passengerCount }).map((_, pIdx) => {
            const seat = activeLegSelectedSeats[pIdx];
            return (
              <span
                key={pIdx}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${
                  seat
                    ? 'bg-white border-[#e11d48] text-[#e11d48] shadow-xs'
                    : 'bg-slate-200/60 border-dashed border-slate-300 text-slate-400'
                }`}
              >
                <span>Pax {pIdx + 1}:</span>
                <strong>{seat ? `${seat.seatCode} (₹${seat.price})` : 'Unassigned'}</strong>
              </span>
            );
          })}
        </div>

        <div className="text-right font-bold text-slate-700">
          Total Seat Addon: <span className="text-sm font-black text-[#e11d48]">₹{currentLegSeatCost.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Interactive Aircraft Fuselage */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto max-h-[500px]">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          {/* Airplane Cockpit Indicator */}
          <div className="text-center pb-2 border-b border-dashed border-slate-200">
            <div className="w-20 h-9 mx-auto bg-slate-100 rounded-t-full border-t-2 border-x-2 border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase tracking-wider">
              FRONT
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
              Cockpit & Galley Area • {activeLeg.label}
            </span>
          </div>

          {/* Column Letters */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-slate-400">
            <div>A</div>
            <div>B</div>
            <div>C</div>
            <div className="text-[9px] text-slate-300 uppercase">AISLE</div>
            <div>D</div>
            <div>E</div>
            <div>F</div>
          </div>

          {/* Seat Grid */}
          <div className="space-y-1.5">
            {rows.map((row, rIdx) => {
              const rowNum = rIdx + 1;
              return (
                <div key={rowNum} className="grid grid-cols-7 gap-1 items-center">
                  {/* Seats A, B, C */}
                  {row.slice(0, 3).map((seat) => {
                    const isSelected = activeLegSelectedSeats.some(s => s.seatCode === seat.code);
                    const cfg = statusColor[seat.status];

                    return (
                      <button
                        key={seat.code}
                        type="button"
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === 'disabled'}
                        className={`h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#e11d48] text-white border-[#e11d48] shadow-md scale-105 ring-2 ring-[#e11d48]/20'
                            : `${cfg.bg} ${cfg.text} ${cfg.border}`
                        }`}
                        title={`${seat.code} • ₹${seat.price}`}
                      >
                        {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : seat.code}
                      </button>
                    );
                  })}

                  {/* Aisle Row Number */}
                  <div className="text-center text-[10px] font-black text-slate-300 select-none">
                    {rowNum}
                  </div>

                  {/* Seats D, E, F */}
                  {row.slice(3, 6).map((seat) => {
                    const isSelected = activeLegSelectedSeats.some(s => s.seatCode === seat.code);
                    const cfg = statusColor[seat.status];

                    return (
                      <button
                        key={seat.code}
                        type="button"
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === 'disabled'}
                        className={`h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#e11d48] text-white border-[#e11d48] shadow-md scale-105 ring-2 ring-[#e11d48]/20'
                            : `${cfg.bg} ${cfg.text} ${cfg.border}`
                        }`}
                        title={`${seat.code} • ₹${seat.price}`}
                      >
                        {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : seat.code}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="bg-white border-t border-slate-200 p-4 shadow-md flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
            Total Seat Addons
          </span>
          <span className="text-lg font-black text-slate-900">
            ₹{allLegsSeatCost.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Skip
            </button>
          )}

          <button
            type="button"
            disabled={!isCurrentLegComplete}
            onClick={handleNextSliceOrCheckout}
            className={`px-6 py-2.5 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 ${
              isCurrentLegComplete
                ? 'bg-[#e11d48] hover:bg-[#be123c] text-white cursor-pointer active:scale-98'
                : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
            }`}
          >
            <span>
              {!isCurrentLegComplete
                ? `Select ${passengerCount - activeLegSelectedSeats.length} more seat(s)`
                : activeLegIndex < derivedLegs.length - 1
                ? `Next: Flight ${activeLegIndex + 2} Seats ➔`
                : 'Save Seats & Continue ➔'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
