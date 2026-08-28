import React from "react";
import { Copy } from "lucide-react";

export interface Offer {
  id: string;
  code: string;
  title: string;
  detail: string;
}

const DEFAULT_OFFERS: Offer[] = [
  {
    id: "first",
    code: "FIRSTTRIP",
    title: "Flat ₹1,200 off",
    detail: "On your first flight booking"
  },
  {
    id: "stay",
    code: "STAY20",
    title: "20% off hotels",
    detail: "Weekend stays across India"
  },
  {
    id: "rail",
    code: "RAILZERO",
    title: "Zero convenience fee",
    detail: "On all train tickets"
  }
];

export interface OffersRailProps {
  offers?: Offer[];
  onSelect?: (offer: Offer) => void;
}

/** Swipeable offer cards - the strip travel apps put right under search. */
export const OffersRail: React.FC<OffersRailProps> = ({
  offers = DEFAULT_OFFERS,
  onSelect
}) => (
  <section className="pt-6">
    <div className="mb-3 flex items-baseline justify-between px-4">
      <h2 className="text-[17px] font-bold tracking-tight text-slate-900">
        Offers for you
      </h2>
      <span className="text-[12px] font-semibold text-slate-400">
        Swipe to see all
      </span>
    </div>

    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {offers.map((offer) => (
        <button
          key={offer.id}
          type="button"
          onClick={() => onSelect?.(offer)}
          className="w-[248px] shrink-0 snap-start rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-[0_10px_30px_-22px_rgba(15,23,42,0.6)] active:bg-slate-50"
        >
          <p className="text-[15px] font-bold tracking-tight text-slate-900">
            {offer.title}
          </p>
          <p className="mt-0.5 text-[12px] font-medium text-slate-500">
            {offer.detail}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--color-coral)]/40 bg-[var(--color-coral)]/5 px-2.5 py-1 text-[12px] font-bold tracking-wide text-[var(--color-coral)]">
            <Copy className="h-3.5 w-3.5" />
            {offer.code}
          </span>
        </button>
      ))}
    </div>
  </section>
);
