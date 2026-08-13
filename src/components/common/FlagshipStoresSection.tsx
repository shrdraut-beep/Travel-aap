import React from 'react';
import { Building2, Tag, ArrowRight } from 'lucide-react';
import { useOfferStore } from '../../store/useOfferStore';

interface FlagshipStoresSectionProps {
  tab?: string;
}

export const FlagshipStoresSection: React.FC<FlagshipStoresSectionProps> = ({ tab = 'all' }) => {
  const offers = useOfferStore(state => state.offers);

  const flagshipStores = offers.filter(o => {
    if (!o.isActive || o.category !== 'Flagship Store') return false;
    if (tab && tab !== 'all' && o.targetTab && o.targetTab !== 'all' && o.targetTab !== tab) return false;
    return true;
  });

  const pocketFriendlyStays = offers.filter(o => {
    if (!o.isActive || o.category !== 'Pocket Friendly') return false;
    if (tab && tab !== 'all' && o.targetTab && o.targetTab !== 'all' && o.targetTab !== tab) return false;
    return true;
  });

  return (
    <div className="my-6 space-y-8">
      {/* 1. Flagship Hotel Stores */}
      {flagshipStores.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Flagship Hotel Stores
            </h2>
            <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline flex items-center gap-0.5">
              Explore All <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {flagshipStores.map((store) => (
              <div
                key={store.id}
                className="relative h-44 rounded-2xl overflow-hidden shadow-xs border border-slate-200 group cursor-pointer"
              >
                <img
                  src={store.imageUrl}
                  alt={store.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 flex flex-col justify-between">
                  {store.priceTag && (
                    <span className="self-end bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-xs">
                      {store.priceTag}
                    </span>
                  )}
                  <div className="space-y-0.5">
                    <h4 className="text-sm sm:text-base font-black text-white drop-shadow-xs">
                      {store.title}
                    </h4>
                    <p className="text-xs text-slate-200 font-medium line-clamp-1">
                      {store.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Pocket-Friendly Stays at Best Price */}
      {pocketFriendlyStays.length > 0 && (
        <div className="space-y-3 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-indigo-500/10 p-4 sm:p-5 rounded-3xl border border-amber-200/60">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-rose-600" />
              Affordable Stays at Best Price
            </h2>
            <p className="text-xs font-medium text-slate-600">
              Pocket-friendly stays for your next trip
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {pocketFriendlyStays.map((stay) => (
              <div
                key={stay.id}
                className="relative h-40 rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-white group cursor-pointer"
              >
                <img
                  src={stay.imageUrl}
                  alt={stay.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent p-3.5 flex flex-col justify-between">
                  <span className="self-start bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                    {stay.priceTag || 'BEST VALUE'}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-white leading-tight">
                      {stay.title}
                    </h4>
                    <p className="text-[11px] text-slate-200 font-medium leading-tight line-clamp-1">
                      {stay.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
