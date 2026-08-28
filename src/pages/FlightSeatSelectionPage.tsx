import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Plane, 
  Clock, 
  Luggage, 
  Compass as Sparkles, 
  CheckCircle2,
  ChevronRight,
  Info,
  Users,
  AlertCircle
} from 'lucide-react';
import { BrandHeader } from '../components/common/BrandHeader';

export type SeatStatus = 'free' | 'xl' | 'paid' | 'disabled';

export interface SeatCell {
  code: string;
  status: SeatStatus;
  basePrice: number;
}

export interface SelectedSeatInfo {
  seatCode: string;
  price: number;
  type: 'free' | 'xl' | 'paid';
  paxIndex?: number;
}

function generateAircraftSeatMap(): SeatCell[][] {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  return Array.from({ length: 18 }, (_, r) => {
    const rowNum = r + 1;
    return cols.map((col) => {
      let status: SeatStatus = 'paid';
      let basePrice = 350;

      if (rowNum === 1 || rowNum === 12 || rowNum === 13) {
        status = 'xl';
        basePrice = 850;
      } else if (rowNum >= 14 && (col === 'B' || col === 'E')) {
        status = 'free';
        basePrice = 0;
      } else if (rowNum >= 6 && rowNum <= 10 && (col === 'A' || col === 'F')) {
        status = 'paid';
        basePrice = 450;
      } else if (rowNum % 4 === 0 && (col === 'C' || col === 'D')) {
        status = 'disabled';
        basePrice = 0;
      }

      return {
        code: `${rowNum}${col}`,
        status,
        basePrice,
      };
    });
  });
}

export const FlightSeatSelectionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    flight?: any;
    selectedPlan?: any;
    passengerCount?: number;
    adults?: number;
    children?: number;
    infants?: number;
    searchParams?: any;
    item?: any;
    totalAmount?: number;
    seatAddonTotal?: number;
    offer_id?: string;
    currency?: string;
    currencySymbol?: string;
    lang?: string;
  };

  const flight = state?.flight;
  const selectedPlan = state?.selectedPlan;
  
  // Passenger count strictly derived from search context
  const searchParams = state?.searchParams || state?.flight?.searchParams;
  const adultCount = state?.adults ?? searchParams?.adults ?? (state?.passengerCount || 1);
  const childCount = state?.children ?? searchParams?.children ?? 0;
  const infantCount = state?.infants ?? searchParams?.infants ?? 0;
  const passengerCount = adultCount + childCount + infantCount;

  const baseFarePrice = state?.totalAmount || selectedPlan?.inrPrice || 6914;
  const seatsIncludedFree = selectedPlan?.seatsIncluded === 'free';

  // Slices & Carrier info
  const firstSlice = flight?.slices?.[0] || {};
  const firstSegment = firstSlice.segments?.[0] || {};
  const lastSegment = firstSlice.segments?.[firstSlice.segments?.length - 1] || firstSegment;

  const originCode = firstSegment.origin?.iata_code || 'DEL';
  const destCode = lastSegment.destination?.iata_code || 'BOM';
  const airlineName = flight?.owner?.name || firstSegment.marketing_carrier?.name || 'IndiGo';
  const flightNumber = firstSegment.marketing_carrier_flight_number 
    ? `${firstSegment.marketing_carrier?.iata_code || '6E'} ${firstSegment.marketing_carrier_flight_number}` 
    : '6E 7219';

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeatInfo[]>([]);
  const rows = useMemo(() => generateAircraftSeatMap(), []);

  // Compute actual price per seat depending on fare tier
  const getSeatActualPrice = (seat: SeatCell): number => {
    if (seat.status === 'disabled') return 0;
    if (seatsIncludedFree) {
      if (seat.status === 'xl') return 350; // Discounted XL
      return 0; // Standard & free seats are 0
    }
    return seat.basePrice;
  };

  const handleSeatClick = (seat: SeatCell) => {
    if (seat.status === 'disabled') return;

    const existingIdx = selectedSeats.findIndex((s) => s.seatCode === seat.code);

    if (existingIdx !== -1) {
      // Deselect
      setSelectedSeats((prev) => prev.filter((s) => s.seatCode !== seat.code));
    } else {
      const price = getSeatActualPrice(seat);
      const newSeat: SelectedSeatInfo = {
        seatCode: seat.code,
        price,
        type: seat.status === 'xl' ? 'xl' : seat.status === 'free' ? 'free' : 'paid',
        paxIndex: selectedSeats.length,
      };

      if (selectedSeats.length >= passengerCount) {
        // Replace first selected seat
        setSelectedSeats((prev) => [...prev.slice(1), newSeat]);
      } else {
        setSelectedSeats((prev) => [...prev, newSeat]);
      }
    }
  };

  // Task 3: Calculate sum of all selected seats prices
  const totalSeatPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const grandTotal = baseFarePrice + totalSeatPrice;
  const isSelectionComplete = selectedSeats.length === passengerCount;

  const proceedToMeals = () => {
    if (!isSelectionComplete) return;

    navigate('/flights/meals', {
      state: {
        ...state,
        flight,
        item: state?.item,
        selectedPlan: selectedPlan,
        selectedSeats: selectedSeats,
        totalAmount: baseFarePrice,
        seatAddonTotal: totalSeatPrice,
        passengerCount,
        adults: adultCount,
        children: childCount,
        infants: infantCount,
        searchParams,
        offer_id: state?.offer_id,
        currency: 'INR',
        currencySymbol: '₹',
        lang: 'en'
      }
    });
  };

  const handleAutoAssignFreeSeats = () => {
    const freeOrCheapSeats: SelectedSeatInfo[] = [];
    let paxIdx = 0;

    for (let r = 13; r < rows.length && paxIdx < passengerCount; r++) {
      const row = rows[r];
      for (const seat of row) {
        if (seat.status !== 'disabled' && paxIdx < passengerCount) {
          freeOrCheapSeats.push({
            seatCode: seat.code,
            price: getSeatActualPrice(seat),
            type: seat.status === 'xl' ? 'xl' : seat.status === 'free' ? 'free' : 'paid',
            paxIndex: paxIdx
          });
          paxIdx++;
        }
      }
    }

    setSelectedSeats(freeOrCheapSeats);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-[Inter]">
      {/* Top Brand Header */}
      <BrandHeader
        title="Select Seats"
        subtitle={`${airlineName} ${flightNumber} • ${originCode} ➔ ${destCode} • ${passengerCount} Traveler${passengerCount > 1 ? 's' : ''}`}
        onBack={() => navigate(-1)}
        rightElement={
          seatsIncludedFree ? (
            <span className="text-[10px] font-black bg-emerald-500/25 text-white border border-emerald-300/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-200" /> Free Seats Included
            </span>
          ) : undefined
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 pb-36 space-y-4 overflow-y-auto">
        {/* Selected Fare & Rules Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                Selected Fare Tier
              </span>
              <span className="text-sm font-black text-slate-900">
                {selectedPlan?.label || 'Saver Fare'} • ₹{baseFarePrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 block">Selected Seats ({selectedSeats.length}/{passengerCount})</span>
            <span className="text-sm font-black text-rose-600">
              {selectedSeats.length === 0
                ? 'None selected'
                : selectedSeats.map((s) => s.seatCode).join(', ')}
            </span>
          </div>
        </div>

        {/* Seat Color Legend */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-slate-700 font-bold">Free (₹0)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-blue-500 inline-block" />
              <span className="text-slate-700 font-bold">
                XL Legroom ({seatsIncludedFree ? '₹350' : '₹850'})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-amber-500 inline-block" />
              <span className="text-slate-700 font-bold">
                Standard Paid ({seatsIncludedFree ? '₹0' : '₹350'})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-slate-300 inline-block" />
              <span className="text-slate-400 font-bold">Occupied</span>
            </div>
          </div>

          <div className={`text-[11px] font-black px-2.5 py-1 rounded-lg border ${
            isSelectionComplete
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            Selected: {selectedSeats.length}/{passengerCount} Seats
          </div>
        </div>

        {/* Passenger Seat Allocation Badges */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-500">Seat Allocations:</span>
            {Array.from({ length: passengerCount }).map((_, idx) => {
              const seat = selectedSeats[idx];
              return (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                    seat
                      ? 'bg-white border-rose-600 text-rose-600 shadow-xs'
                      : 'bg-slate-100 border-dashed border-slate-300 text-slate-400'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span>Traveler {idx + 1}:</span>
                  <strong>{seat ? `${seat.seatCode} (₹${seat.price})` : 'Select on map'}</strong>
                </span>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAutoAssignFreeSeats}
            className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
          >
            Auto-assign available seats
          </button>
        </div>

        {/* Aircraft Cabin Fuselage */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto">
          {/* Airplane Cockpit Indicator */}
          <div className="text-center pb-3 border-b border-dashed border-slate-200">
            <div className="w-20 h-9 mx-auto bg-slate-100 rounded-t-full border-t-2 border-x-2 border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase tracking-wider">
              FRONT
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
              Cockpit & Forward Galley
            </span>
          </div>

          {/* Column A-B-C | AISLE | D-E-F Header */}
          <div className="flex items-center justify-between text-xs font-black text-slate-400 px-3">
            <div className="flex items-center gap-2">
              <span className="w-8 text-center">A</span>
              <span className="w-8 text-center">B</span>
              <span className="w-8 text-center">C</span>
            </div>
            <span className="text-[10px] text-slate-300 font-mono tracking-widest">AISLE</span>
            <div className="flex items-center gap-2">
              <span className="w-8 text-center">D</span>
              <span className="w-8 text-center">E</span>
              <span className="w-8 text-center">F</span>
            </div>
          </div>

          {/* Seat Grid Rows */}
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
                      const isSelected = selectedSeats.some((s) => s.seatCode === seat.code);
                      const price = getSeatActualPrice(seat);

                      let bgClass = 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed';
                      if (seat.status !== 'disabled') {
                        if (price === 0) {
                          bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100';
                        } else if (seat.status === 'xl') {
                          bgClass = 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100';
                        } else {
                          bgClass = 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100';
                        }
                      }

                      return (
                        <button
                          key={seat.code}
                          type="button"
                          disabled={seat.status === 'disabled'}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-8 h-9 sm:w-9 sm:h-10 rounded-lg text-xs font-black flex items-center justify-center border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white border-rose-600 ring-2 ring-rose-500/40 shadow-sm scale-105'
                              : bgClass
                          }`}
                          title={`${seat.code} • ₹${price}`}
                        >
                          {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : seat.code}
                        </button>
                      );
                    })}
                  </div>

                  {/* Row Number */}
                  <span className="text-[10px] font-mono font-black text-slate-400 w-6 text-center">
                    {rowNum}
                  </span>

                  {/* Right 3 seats (D, E, F) */}
                  <div className="flex items-center gap-1.5">
                    {rightSeats.map((seat) => {
                      const isSelected = selectedSeats.some((s) => s.seatCode === seat.code);
                      const price = getSeatActualPrice(seat);

                      let bgClass = 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed';
                      if (seat.status !== 'disabled') {
                        if (price === 0) {
                          bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100';
                        } else if (seat.status === 'xl') {
                          bgClass = 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100';
                        } else {
                          bgClass = 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100';
                        }
                      }

                      return (
                        <button
                          key={seat.code}
                          type="button"
                          disabled={seat.status === 'disabled'}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-8 h-9 sm:w-9 sm:h-10 rounded-lg text-xs font-black flex items-center justify-center border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white border-rose-600 ring-2 ring-rose-500/40 shadow-sm scale-105'
                              : bgClass
                          }`}
                          title={`${seat.code} • ₹${price}`}
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

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-xl z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
              Total Amount (Fare + Seats)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
              {totalSeatPrice > 0 && (
                <span className="text-xs font-bold text-rose-600">
                  (+₹{totalSeatPrice} for {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoAssignFreeSeats}
              className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Auto Assign
            </button>
            <button
              disabled={!isSelectionComplete}
              onClick={proceedToMeals}
              className={`font-extrabold py-3 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 text-xs sm:text-sm ${
                isSelectionComplete
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:brightness-105 text-white cursor-pointer active:scale-98'
                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
              }`}
            >
              <span>
                {!isSelectionComplete 
                  ? `Select ${passengerCount - selectedSeats.length} more seat(s)` 
                  : 'Continue to Meals'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSeatSelectionPage;
