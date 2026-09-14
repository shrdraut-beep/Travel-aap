// src/components/booking/BillingAndFareBreakup.tsx
import React, { useState } from 'react';
import { useBookingFlow } from '../../context/BookingFlowContext';
import { Phone, Mail, Building2, ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';

export interface BillingAndFareBreakupProps {
  onReviewClick: () => void;
  vertical?: string;
}

export const BillingAndFareBreakup: React.FC<BillingAndFareBreakupProps> = ({ onReviewClick, vertical }) => {
  const { state, dispatch, totals, isPassengerFormValid, validationErrors } = useBookingFlow();
  const [showErrors, setShowErrors] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_BILLING',
      phone: e.target.value,
      email: state.billingEmail,
      gstNumber: state.gstNumber,
      hasGst: state.hasGst,
    });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_BILLING',
      phone: state.billingPhone,
      email: e.target.value,
      gstNumber: state.gstNumber,
      hasGst: state.hasGst,
    });
  };

  const handleGstToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_BILLING',
      phone: state.billingPhone,
      email: state.billingEmail,
      gstNumber: state.gstNumber,
      hasGst: e.target.checked,
    });
  };

  const handleGstNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_BILLING',
      phone: state.billingPhone,
      email: state.billingEmail,
      gstNumber: e.target.value.toUpperCase(),
      hasGst: true,
    });
  };

  const handleProceed = () => {
    if (!isPassengerFormValid) {
      setShowErrors(true);
      return;
    }
    onReviewClick();
  };

  return (
    <div className="space-y-4">
      {/* Contact & GST Information */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#0B1E3D]" />
          <h4 className="font-black text-sm text-[#0B1E3D] uppercase tracking-wide">
            Contact & E-Ticket Details
          </h4>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Your booking confirmation, PNR, and tax invoice will be sent to these details.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Mobile Phone */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="h-11 px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs font-bold text-slate-600 flex items-center">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={state.billingPhone}
                onChange={handlePhoneChange}
                className="w-full h-11 px-3 bg-transparent border border-slate-200 rounded-r-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#0B1E3D] outline-hidden"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="e.g. traveller@example.com"
              value={state.billingEmail}
              onChange={handleEmailChange}
              className="w-full h-11 px-3 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:bg-white focus:border-[#0B1E3D] outline-hidden"
            />
          </div>
        </div>

        {/* GST Toggle */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={state.hasGst}
              onChange={handleGstToggle}
              className="w-4 h-4 rounded-md accent-[#0B1E3D] cursor-pointer"
            />
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>I have a GST number for business tax input credit</span>
          </label>

          {state.hasGst && (
            <div className="mt-3 p-3 bg-transparent rounded-[20px] border border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-600">
                15-Digit GSTIN <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={15}
                placeholder="e.g. 27AAAAA0000A1Z5"
                value={state.gstNumber || ''}
                onChange={handleGstNumberChange}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-[16px] text-xs font-mono font-bold uppercase text-slate-900 focus:border-[#0B1E3D] outline-hidden"
              />
            </div>
          )}
        </div>
      </div>

      {/* Insurance & CFAR Add-on */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-premium-sky-deep" />
          <h4 className="font-black text-sm text-[#0B1E3D] uppercase tracking-wide">
            Secure Your Trip
          </h4>
        </div>

        <label className="flex items-start gap-3 p-4 rounded-[20px] bg-premium-sky-soft/50 border border-premium-sky-deep cursor-pointer hover:bg-premium-sky-soft transition-colors">
          <input
            type="checkbox"
            className="w-5 h-5 mt-0.5 rounded-md accent-pink-600 cursor-pointer"
            checked={state.hasInsurance || false}
            onChange={() => dispatch({ type: 'TOGGLE_INSURANCE' })}
          />
          <div>
            <span className="font-black text-slate-900 block text-sm mb-1">
              Cancel For Any Reason (CFAR) + Travel Insurance
            </span>
            <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
              Get 100% refund on cancellations up to 24 hours before departure. Includes medical coverage up to ₹1,00,000 and baggage loss protection.
            </p>
            <div className="mt-2 text-xs font-black text-premium-sky-deep">
              ₹249 <span className="text-[10px] font-medium text-premium-sky-deep">/ passenger</span>
            </div>
          </div>
        </label>
      </div>

      {/* Fare Breakup Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-black text-sm text-[#0B1E3D] uppercase tracking-wide flex items-center justify-between">
          <span>Fare & Charges Breakup</span>
          <span className="text-[11px] font-bold text-slate-400">
            {state.passengerCount} Adult{state.passengerCount > 1 ? 's' : ''}
          </span>
        </h4>

        <div className="space-y-2.5 text-xs">
          {/* Base Fare */}
          <div className="flex items-center justify-between text-slate-700">
            <span>Base Fare ({state.passengerCount} × ₹{totals.farePerAdult.toLocaleString('en-IN')})</span>
            <span className="font-bold text-slate-900">₹{totals.baseFare.toLocaleString('en-IN')}</span>
          </div>

          {/* Taxes & Platform fees */}
          <div className="flex items-center justify-between text-slate-700">
            <span>Taxes & Airline Surcharges (K3 / YQ / GST)</span>
            <span className="font-bold text-slate-900">₹{totals.taxesAndFees.toLocaleString('en-IN')}</span>
          </div>

          {/* Seat selection */}
          {totals.seats > 0 && (
            <div className="flex items-center justify-between text-slate-700">
              <span>Seat Selection ({state.seats.length} seats)</span>
              <span className="font-bold text-slate-900">₹{totals.seats.toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Meals */}
          {totals.meals > 0 && (
            <div className="flex items-center justify-between text-slate-700">
              <span>Pre-Booked Meals ({state.meals.length} items)</span>
              <span className="font-bold text-slate-900">₹{totals.meals.toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Excess baggage */}
          {totals.baggage > 0 && (
            <div className="flex items-center justify-between text-slate-700">
              <span>Excess Baggage Add-on</span>
              <span className="font-bold text-slate-900">₹{totals.baggage.toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Insurance */}
          {totals.insurance > 0 && (
            <div className="flex items-center justify-between text-premium-sky-deep">
              <span>Travel Insurance ({state.passengerCount} × ₹249)</span>
              <span className="font-bold text-premium-sky-deep">₹{totals.insurance.toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Convenience Fee */}
          <div className="flex items-center justify-between text-slate-700 pt-1">
            <span>App Convenience Fee</span>
            <span className="font-bold text-slate-900">₹{totals.convenienceFee.toLocaleString('en-IN')}</span>
          </div>

          {/* GST on Conv Fee */}
          <div className="flex items-center justify-between text-slate-700">
            <span>GST on Convenience Fee (18%)</span>
            <span className="font-bold text-slate-900">₹{totals.gstOnConvFee.toLocaleString('en-IN')}</span>
          </div>

          {/* Total Divider */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Total Amount to Pay</span>
              <span className="text-xl font-black text-[#0B1E3D]">
                ₹{totals.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-premium-sky-deep bg-premium-sky-soft px-2.5 py-1 rounded-[16px] border border-premium-sky-deep text-[11px] font-bold">
              <ShieldCheck className="w-4 h-4 text-premium-sky-deep" />
              <span>Safe & Secure 256-Bit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Errors Alert if clicked prematurely */}
      {showErrors && !isPassengerFormValid && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-3xl space-y-2 text-xs text-rose-900 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-black">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Please complete the required details before proceeding:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] font-semibold text-rose-700">
            {validationErrors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Continue to Review Button */}
      <button
        type="button"
        onClick={handleProceed}
        disabled={!isPassengerFormValid}
        className={`w-full py-4 rounded-[20px] font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] ${
          isPassengerFormValid
            ? 'bg-[#FF5A5F] hover:bg-[#ff4046] text-white active:scale-98 shadow-rose-900/20 cursor-pointer'
            : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
        }`}
      >
        <span>{(vertical === 'flight' || vertical === 'train') ? 'Proceed to Add-ons' : 'Proceed to Payment (Review)'}</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
