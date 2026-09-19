import React, { useState } from 'react';
import { Tag, Copy, Check, Ticket, Sparkles, Percent, Clock } from 'lucide-react';

export interface OfferCouponItem {
  code: string;
  category: 'ALL' | 'FLIGHTS' | 'HOTELS' | 'CABS' | 'BUSES' | 'PACKAGES' | 'B2B';
  discountText: string;
  discountTextMr?: string;
  title: string;
  titleMr?: string;
  description: string;
  descriptionMr?: string;
  validUntil: string;
  minBooking?: string;
  tagColor?: string;
}

export interface ActiveOfferCouponsGridProps {
  variant?: 'user' | 'vendor';
  isMr?: boolean;
  className?: string;
  onApplyCoupon?: (code: string) => void;
  onApplyOffer?: (code: string) => void;
}

export const ActiveOfferCouponsGrid: React.FC<ActiveOfferCouponsGridProps> = ({
  variant = 'user',
  isMr = false,
  className = '',
  onApplyCoupon,
  onApplyOffer
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const userCoupons: OfferCouponItem[] = [
    {
      code: 'ROUTRIPO500',
      category: 'PACKAGES',
      discountText: 'FLAT ₹500 OFF',
      discountTextMr: 'थेट ₹५०० सूट',
      title: 'Family & Group Holiday Special',
      titleMr: 'कुटुंब व ग्रुप हॉलिडे ऑफर',
      description: 'Applicable on all multi-day curated tour packages across India.',
      descriptionMr: 'भारतातील सर्व टूर पॅकेजेसवर लागू.',
      validUntil: '31 Oct 2026',
      minBooking: 'Min booking ₹8,000',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      code: 'FLYROUT12',
      category: 'FLIGHTS',
      discountText: '12% CASHBACK',
      discountTextMr: '१२% कॅशबॅक',
      title: 'Domestic Air Travel Pass',
      titleMr: 'देशांतर्गत विमानांवर कॅशबॅक',
      description: 'Direct wallet cashback on domestic flights booked on Travelport GDS.',
      descriptionMr: 'RoutTripo वॉलेटमध्ये थेट कॅशबॅक जमा.',
      validUntil: '15 Nov 2026',
      minBooking: 'No min booking',
      tagColor: 'bg-sky-50 text-sky-800 border-sky-200'
    },
    {
      code: 'STAYLUX15',
      category: 'HOTELS',
      discountText: 'FLAT 15% OFF',
      discountTextMr: '१५% थेट सवलत',
      title: 'Curated 4-Star & 5-Star Stays',
      titleMr: 'लक्झरी हॉटेल व रिसॉर्ट मुक्काम',
      description: 'Save on luxury resorts, heritage palaces & boutique hotel bookings.',
      descriptionMr: 'प्रीमियम हॉटेल्स व हेरिटेज मुक्कामावर सवलत.',
      validUntil: '30 Dec 2026',
      minBooking: 'Min booking ₹4,500',
      tagColor: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    },
    {
      code: 'CABRIDE50',
      category: 'CABS',
      discountText: 'SAVE ₹250',
      discountTextMr: 'बचत ₹२५०',
      title: 'Outstation Cab Rides',
      titleMr: 'आऊटस्टेशन कॅब प्रवास',
      description: 'Save on intercity round-trips & airport transfers.',
      descriptionMr: 'आंतरशहरी फेऱ्यांवर व विमानतळ प्रवासावर सूट.',
      validUntil: 'Ongoing',
      minBooking: 'Min booking ₹2,000',
      tagColor: 'bg-amber-50 text-amber-900 border-amber-200'
    }
  ];

  const vendorCoupons: OfferCouponItem[] = [
    {
      code: 'ZEROCOMM50',
      category: 'B2B',
      discountText: '0% COMMISSION',
      discountTextMr: '०% कमिशन',
      title: 'Tour Operator Starter Benefit',
      titleMr: 'टूर ऑपरेटर मोफत लाँच पास',
      description: 'Zero platform facilitation fee for the first 50 holiday packages uploaded.',
      descriptionMr: 'पहिल्या ५० पॅकेजेसवर प्लॅटफॉर्म सेवा शुल्क पूर्ण माफ.',
      validUntil: '31 Dec 2026',
      minBooking: 'Verified Vendors',
      tagColor: 'bg-violet-50 text-violet-800 border-violet-200'
    },
    {
      code: 'FLEETBOOST10',
      category: 'B2B',
      discountText: '+10% PAYOUT',
      discountTextMr: '+१०% पेआऊट',
      title: 'Weekend Cab Fleet Incentive',
      titleMr: 'आठवडाअखेर कॅब बोनस पेआऊट',
      description: 'Earn 10% extra take-home payouts on Friday-Sunday outstation trips.',
      descriptionMr: 'शुक्रवार ते रविवार आऊटस्टेशन ट्रिप्सवर १०% अतिरिक्त नक्त रक्कम.',
      validUntil: 'Ongoing',
      minBooking: 'Min 5 trips',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      code: 'HOTELPRIORITY',
      category: 'B2B',
      discountText: 'FREE FEATURED',
      discountTextMr: 'मोफत टॉप रँक',
      title: 'First Month Featured Placement',
      titleMr: 'पहिला महिना मोफत जाहिरात',
      description: 'New verified hotel partners get guaranteed homepage carousel rank.',
      descriptionMr: 'नवीन हॉटेल भागीदारांना होमपेजवर हमखास टॉप रँक.',
      validUntil: 'Limited Batch',
      minBooking: 'New Onboardings',
      tagColor: 'bg-sky-50 text-sky-800 border-sky-200'
    }
  ];

  const coupons = variant === 'vendor' ? vendorCoupons : userCoupons;

  const handleCopy = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
    onApplyCoupon?.(code);
    onApplyOffer?.(code);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <Ticket className="w-4 h-4 text-indigo-600" />
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
            {variant === 'vendor'
              ? (isMr ? '🏷️ सक्रिय वेंडर कूपन्स व प्रोमो कोड्स' : '🏷️ Active Vendor Coupons & Promo Codes')
              : (isMr ? '🏷️ सक्रिय डिस्काउंट कूपन्स व प्रोमो कोड्स' : '🏷️ Active Discount Coupons & Promo Codes')}
          </h2>
        </div>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
          {coupons.length} {isMr ? 'उपलब्ध' : 'Active'}
        </span>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {coupons.map((c) => {
          const isCopied = copiedCode === c.code;

          return (
            <div
              key={c.code}
              className="relative p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              {/* Top Row: Tag & Discount */}
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${c.tagColor || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                  {isMr ? (c.discountTextMr || c.discountText) : c.discountText}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {c.validUntil}
                </span>
              </div>

              {/* Title & Description */}
              <div className="my-2">
                <h4 className="text-xs font-black text-slate-900 leading-snug">
                  {isMr ? (c.titleMr || c.title) : c.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-1">
                  {isMr ? (c.descriptionMr || c.description) : c.description}
                </p>
              </div>

              {/* Bottom Row: Copy Code Voucher Box */}
              <div className="pt-2 border-t border-dashed border-slate-200 flex items-center justify-between gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs font-black text-slate-800 tracking-wider">
                  {c.code}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(c.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 active:scale-95 border border-indigo-200'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isMr ? 'कॉपी झाले!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isMr ? 'कोड कॉपी' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveOfferCouponsGrid;
