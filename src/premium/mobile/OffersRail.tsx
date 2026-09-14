import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Copy, Sparkles, Tag } from "lucide-react";

export interface Offer {
  id: string;
  code: string;
  title: string;
  detail: string;
  badge?: string;
  expiry?: string;
  tone?: "accent" | "sky" | "amber" | "pink";
}

const DEFAULT_OFFERS: Offer[] = [
  {
    id: "first",
    code: "FIRSTTRIP",
    title: "Flat ₹1,200 off",
    detail: "On your first flight booking",
    badge: "Welcome Deal",
    expiry: "Valid 30 days",
    tone: "accent"
  },
  {
    id: "stay",
    code: "STAY20",
    title: "20% off luxury stays",
    detail: "Boutique villas & 5-star resorts",
    badge: "Limited Offer",
    expiry: "Expires in 3 days",
    tone: "amber"
  },
  {
    id: "rail",
    code: "ESCROWFREE",
    title: "Zero Escrow Fee",
    detail: "100% money protection at ₹0",
    badge: "Verified Shield",
    expiry: "All bookings",
    tone: "pink"
  },
  {
    id: "group",
    code: "GROUPSPLIT",
    title: "Flat ₹2,500 group cash",
    detail: "For trips with 4+ members",
    badge: "Group Saver",
    expiry: "Popular",
    tone: "sky"
  }
];

export interface OffersRailProps {
  offers?: Offer[];
  onSelect?: (offer: Offer) => void;
}

/** Swipeable offer cards with modern travel app micro-interactions */
export const OffersRail: React.FC<OffersRailProps> = ({
  offers = DEFAULT_OFFERS,
  onSelect
}) => {
  const { t } = useTranslation();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="pt-5">
      <div className="mb-3 flex items-baseline justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-[17px] font-extrabold tracking-tight text-slate-900">
            Exclusive Travel Deals
          </h2>
        </div>
        <span className="text-[11px] font-bold text-slate-400">
          Swipe for promo codes →
        </span>
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {offers.map((offer) => {
          const isCopied = copiedCode === offer.code;
          return (
            <div
              key={offer.id}
              onClick={() => onSelect?.(offer)}
              className="group relative w-[260px] shrink-0 snap-start cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_25px_-16px_rgba(2,132,199,0.1)] transition-all hover:border-sky-300 hover:shadow-[0_12px_32px_-14px_rgba(2,132,199,0.16)] active:scale-[0.99]"
            >
              {/* Subtle corner glow */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-sky-400/15 to-transparent blur-xl transition-all group-hover:scale-125" />

              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">
                  <Tag className="h-3 w-3 text-sky-600" />
                  {offer.badge || "Special"}
                </span>
                {offer.expiry && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    {offer.expiry}
                  </span>
                )}
              </div>

              <div className="my-2.5">
                <p className="text-[16px] font-black leading-tight tracking-tight text-slate-900">
                  {offer.title}
                </p>
                <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-relaxed text-slate-500">
                  {offer.detail}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#f0ebe1]">
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, offer.code)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-sky-300 bg-sky-50 px-3 py-1.5 text-[12px] font-black tracking-wider text-sky-700 hover:bg-sky-100 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-pink-600" />
                      <span className="text-pink-700">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-sky-600" />
                      <span>{offer.code}</span>
                    </>
                  )}
                </button>
                <span className="text-[11px] font-bold text-sky-700 group-hover:translate-x-0.5 transition-transform">
                  Apply →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
