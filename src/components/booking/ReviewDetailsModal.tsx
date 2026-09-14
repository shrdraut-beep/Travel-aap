// src/components/booking/ReviewDetailsModal.tsx
import React from 'react';
import { useBookingFlow } from '../../context/BookingFlowContext';
import { HoldTimer } from './HoldTimer';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, ArrowLeft, UserCheck, Utensils, Luggage, Armchair } from 'lucide-react';

export interface ReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: () => void;
  flightSummary?: {
    airline: string;
    route: string;
    date: string;
    time: string;
  };
}

export const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  isOpen,
  onClose,
  onConfirmPayment,
  flightSummary,
}) => {
  const { state, totals } = useBookingFlow();
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#F7F8FA] w-full max-w-xl rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-[16px] bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-[16px] bg-slate-100 flex items-center justify-center text-premium-pink font-bold hidden sm:flex">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Review Booking</h3>
              <p className="text-xs text-slate-500 hidden sm:block">Verify names against Government Photo IDs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HoldTimer />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Critical ID match warning */}
          <div className="p-4 bg-[var(--premium-pink)]/10 border border-premium-pink/40 rounded-[20px] flex items-start gap-3 text-xs text-premium-pink leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-premium-pink shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-slate-900 block mb-0.5">Government ID Match Required</span>
              <span>
                Please ensure passenger name spelling matches Passport / Aadhaar / Voter ID. Airlines do not allow ticket transfer or name corrections after issuance.
              </span>
            </div>
          </div>

          {/* Sector & Flight info if provided */}
          {flightSummary && (
            <div className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Flight Journey</span>
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-900">{flightSummary.airline} • {flightSummary.route}</span>
                <span className="font-bold text-slate-600">{flightSummary.date} ({flightSummary.time})</span>
              </div>
            </div>
          )}

          {/* Passenger List Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0B1E3D]">
              Passengers ({state.passengers.length})
            </h4>

            {state.passengers.map((pax, index) => (
              <div key={index} className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0B1E3D] text-white text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-black text-slate-900 text-sm">
                      {pax.salutation} {pax.firstName} {pax.lastName}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {pax.gender} • {pax.nationality}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Date of Birth</span>
                    <span className="font-bold text-slate-800">{pax.dob || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Category</span>
                    <span className="font-bold text-slate-800">
                      {pax.isUnaccompaniedMinor ? 'Unaccompanied Minor' : 'Adult Traveller'}
                    </span>
                  </div>
                </div>

                {pax.isUnaccompaniedMinor && pax.guardianName && (
                  <div className="pt-2 border-t border-dashed border-premium-pink text-xs text-premium-pink bg-premium-pink-soft/50 p-2.5 rounded-[16px]">
                    <span className="font-bold block">Guardian: {pax.guardianName} ({pax.guardianRelation || 'Parent'})</span>
                    <span className="text-slate-600">Contact: +91 {pax.guardianPhone}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add-ons Overview */}
          <div className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0B1E3D]">
              Selected Add-ons
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Seats */}
              <div className="bg-transparent p-3 rounded-[16px] border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Armchair className="w-3.5 h-3.5 text-rose-600" />
                  <span>Seats</span>
                </div>
                <span className="font-black text-slate-900 block text-xs">
                  {state.seats.length > 0 ? state.seats.map((s) => s.seatCode).join(', ') : 'Auto-assigned'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">₹{totals.seats}</span>
              </div>

              {/* Meals */}
              <div className="bg-transparent p-3 rounded-[16px] border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Utensils className="w-3.5 h-3.5 text-premium-sky-deep" />
                  <span>Meals</span>
                </div>
                <span className="font-black text-slate-900 block text-xs">
                  {state.meals.length > 0 ? `${state.meals.length} item(s)` : 'None'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">₹{totals.meals}</span>
              </div>

              {/* Baggage */}
              <div className="bg-transparent p-3 rounded-[16px] border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Luggage className="w-3.5 h-3.5 text-premium-pink" />
                  <span>Extra Baggage</span>
                </div>
                <span className="font-black text-slate-900 block text-xs">
                  {state.baggage.length > 0 ? `${state.baggage.reduce((acc, b) => acc + b.kg, 0)} kg` : 'Standard only'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">₹{totals.baggage}</span>
              </div>
            </div>
          </div>

          {/* Contact info summary */}
          <div className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">E-Ticket & Invoice Receiver</span>
              <span className="font-black text-slate-900">+91 {state.billingPhone} • {state.billingEmail}</span>
            </div>
            {state.hasGst && state.gstNumber && (
              <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                GST: {state.gstNumber}
              </span>
            )}
          </div>
        </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-white rounded-[20px] border border-slate-200 shadow-xs cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
            <input 
              type="checkbox" 
              checked={termsAccepted} 
              onChange={() => setTermsAccepted(!termsAccepted)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#FF5A5F] focus:ring-[#FF5A5F]"
            />
            <span className="text-xs text-slate-600 font-medium">
              I agree to the <span className="text-[#FF5A5F] underline font-bold">Terms & Conditions</span>, 
              <span className="text-[#FF5A5F] underline font-bold"> Privacy Policy</span>, and 
              <span className="text-[#FF5A5F] underline font-bold"> Refund Policy</span>.
            </span>
          </div>

          {/* Sticky Action Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Payable</span>
              <span className="font-black text-xl text-[#0B1E3D]">
                ₹{totals.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-[16px] border border-slate-200 text-slate-700 font-black text-xs hover:bg-transparent cursor-pointer"
              >
                Modify Details
              </button>
              <button
                type="button"
                onClick={onConfirmPayment}
                disabled={!termsAccepted}
                className={`px-6 py-3 bg-[#FF5A5F] hover:bg-[#ff4046] text-white font-black text-xs uppercase tracking-wider rounded-[16px] transition-all shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] flex items-center gap-2 cursor-pointer active:scale-95 ${!termsAccepted ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>Proceed to Pay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};
