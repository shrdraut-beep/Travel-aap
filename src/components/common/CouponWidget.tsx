import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Check, Sparkles, X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { CouponService, Coupon } from '../../services/CouponService';

export interface CouponWidgetProps {
  vertical: 'flight' | 'hotel';
  currentAmount: number;
  appliedCoupon: Coupon | null;
  appliedDiscount: number;
  onApplyCoupon: (coupon: Coupon, discount: number) => void;
  onRemoveCoupon: () => void;
}

export const CouponWidget: React.FC<CouponWidgetProps> = ({
  vertical,
  currentAmount,
  appliedCoupon,
  appliedDiscount,
  onApplyCoupon,
  onRemoveCoupon
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showAllOffers, setShowAllOffers] = useState(false);

  const availableCoupons = CouponService.getAvailableCoupons(vertical, currentAmount);

  const handleApply = (codeToApply?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const code = (codeToApply || inputCode).trim().toUpperCase();

    if (!code) {
      setErrorMsg('Please enter a coupon code.');
      return;
    }

    const result = CouponService.validateCoupon(code, currentAmount, vertical);
    if (result.isValid && result.coupon) {
      onApplyCoupon(result.coupon, result.discount);
      setSuccessMsg(result.message);
      setInputCode('');
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleRemove = () => {
    onRemoveCoupon();
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Offers & Promo Codes</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </h3>
            <p className="text-[11px] text-slate-500">Apply coupon for instant savings on your booking</p>
          </div>
        </div>

        {appliedCoupon && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>₹{appliedDiscount.toLocaleString('en-IN')} Saved</span>
          </span>
        )}
      </div>

      {/* Applied State */}
      {appliedCoupon ? (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-900 tracking-wide text-sm font-mono uppercase bg-emerald-100/70 px-2 py-0.5 rounded-lg border border-emerald-300">
                  {appliedCoupon.code}
                </span>
                <span className="text-xs font-bold text-emerald-800">
                  Applied Successfully!
                </span>
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                You saved <strong className="font-bold">₹{appliedDiscount.toLocaleString('en-IN')}</strong> on this booking.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors shrink-0 cursor-pointer"
          >
            Remove
          </button>
        </div>
      ) : (
        /* Input Box */
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                placeholder="Enter Coupon Code (e.g. WELCOME10)"
                className="w-full uppercase font-mono tracking-wider rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
              onClick={() => handleApply()}
              disabled={!inputCode.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              APPLY
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{successMsg}</span>
            </p>
          )}
        </div>
      )}

      {/* Available Coupons Accordion */}
      {!appliedCoupon && availableCoupons.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAllOffers(!showAllOffers)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>View Available Offers ({availableCoupons.length})</span>
            </span>
            {showAllOffers ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          <AnimatePresence>
            {showAllOffers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2.5 pt-3 overflow-hidden"
              >
                {availableCoupons.map((coupon) => {
                  const isEligible = currentAmount >= coupon.minAmount;
                  return (
                    <div
                      key={coupon.code}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isEligible
                          ? 'bg-slate-50/70 border-slate-200/90 hover:border-pink-300 hover:bg-pink-50/20'
                          : 'bg-slate-50/40 border-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs font-mono tracking-wider bg-white border border-slate-300 text-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
                              {coupon.code}
                            </span>
                            {coupon.badge && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded">
                                {coupon.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-900 mt-1">{coupon.title}</p>
                          <p className="text-[11px] text-slate-500">{coupon.description}</p>
                          {!isEligible && (
                            <p className="text-[10px] text-amber-600 font-bold">
                              * Add ₹{(coupon.minAmount - currentAmount).toLocaleString('en-IN')} more to unlock this offer
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApply(coupon.code)}
                          disabled={!isEligible}
                          className="text-xs font-extrabold text-pink-600 hover:text-pink-700 hover:bg-pink-50 disabled:opacity-40 disabled:hover:bg-transparent px-3 py-1.5 rounded-xl border border-pink-200 transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
                        >
                          APPLY
                        </button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
