import React, { useState } from 'react';
import { Tag, Copy, Check, ChevronRight, Gift, Calendar } from 'lucide-react';
import { useOfferStore } from '../../store/useOfferStore';
import { OfferCategory } from '../../types';

interface OffersForYouSectionProps {
  tab?: string;
}

export const OffersForYouSection: React.FC<OffersForYouSectionProps> = ({ tab = 'all' }) => {
  const offers = useOfferStore(state => state.offers);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const categories = ['All', 'Bank Offers', 'Flights', 'Hotels', 'Cabs'];

  const filteredOffers = offers.filter(o => {
    if (!o.isActive) return false;
    if (o.category === 'Banner' || o.category === 'Flagship Store' || o.category === 'Pocket Friendly') return false;
    if (tab && tab !== 'all' && o.targetTab && o.targetTab !== 'all' && o.targetTab !== tab) return false;
    if (selectedCategory === 'All') return true;
    return o.category === selectedCategory;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="my-6 space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-rose-500" />
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Offers For You</h2>
        </div>
        <button 
          onClick={() => setSelectedCategory('All')}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Offers Horizontal Scroll Container */}
      {filteredOffers.length === 0 ? (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-xs font-medium text-slate-500">
          No offers available for this category right now.
        </div>
      ) : (
        <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="w-72 sm:w-80 shrink-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Cover Image & Category Badge */}
              <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-md">
                  {offer.category}
                </span>
                {offer.discountBadge && (
                  <span className="absolute top-2.5 right-2.5 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-md shadow-xs">
                    {offer.discountBadge}
                  </span>
                )}
              </div>

              {/* Offer Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 line-clamp-1 leading-snug">
                    {offer.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {offer.subtitle}
                  </p>
                </div>

                {/* Footer Coupon & Validity */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {offer.couponCode ? (
                    <button
                      onClick={() => handleCopyCode(offer.couponCode!)}
                      className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-mono font-bold text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      title="Click to copy coupon code"
                    >
                      <Tag className="w-3.5 h-3.5 text-rose-500" />
                      <span>Code: {offer.couponCode}</span>
                      {copiedCode === offer.couponCode ? (
                        <span className="text-[10px] font-sans font-black text-emerald-600 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Copied!
                        </span>
                      ) : (
                        <Copy className="w-3 h-3 text-rose-400" />
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">Standard Discount</span>
                  )}

                  {offer.validTill && (
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {offer.validTill}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
