import React, { useState } from "react";
import { Heart, Star } from "lucide-react";

export interface Destination {
  id: string;
  city: string;
  country: string;
  tagline: string;
  priceFrom: number;
  rating: number;
  nights: number;
  image: string;
}

const DEFAULT_DESTINATIONS: Destination[] = [
  {
    id: "goa",
    city: "Goa",
    country: "India",
    tagline: "Beach shacks & sunset cruises",
    priceFrom: 8499,
    rating: 4.8,
    nights: 3,
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=70"
  },
  {
    id: "manali",
    city: "Manali",
    country: "India",
    tagline: "Snow trails & pine valleys",
    priceFrom: 11250,
    rating: 4.7,
    nights: 4,
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=70"
  },
  {
    id: "jaipur",
    city: "Jaipur",
    country: "India",
    tagline: "Palaces, bazaars & forts",
    priceFrom: 6990,
    rating: 4.6,
    nights: 2,
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=70"
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "UAE",
    tagline: "Skylines & desert safaris",
    priceFrom: 32400,
    rating: 4.9,
    nights: 5,
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=70"
  },
  {
    id: "bali",
    city: "Bali",
    country: "Indonesia",
    tagline: "Rice terraces & reef dives",
    priceFrom: 41900,
    rating: 4.8,
    nights: 6,
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=70"
  }
];

const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

export interface DestinationRailProps {
  destinations?: Destination[];
  onSelect?: (destination: Destination) => void;
  onToggleWishlist?: (destination: Destination, wishlisted: boolean) => void;
  onViewAll?: () => void;
}

/** Horizontally scrolling destination cards sized for a one-hand swipe. */
export const DestinationRail: React.FC<DestinationRailProps> = ({
  destinations = DEFAULT_DESTINATIONS,
  onSelect,
  onToggleWishlist,
  onViewAll
}) => {
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const toggle = (destination: Destination) => {
    const next = !wishlist[destination.id];
    setWishlist((current) => ({ ...current, [destination.id]: next }));
    onToggleWishlist?.(destination, next);
  };

  return (
    <section className="pt-7">
      <div className="mb-3 flex items-baseline justify-between px-4">
        <h2 className="text-[17px] font-bold tracking-tight text-slate-900">
          Trending destinations
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[13px] font-semibold text-[var(--premium-accent)]"
        >
          View all
        </button>
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {destinations.map((destination) => (
          <article
            key={destination.id}
            className="w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-[0_12px_35px_-24px_rgba(15,23,42,0.7)]"
          >
            <div className="relative h-[140px]">
              <button
                type="button"
                onClick={() => onSelect?.(destination)}
                className="block h-full w-full"
              >
                <img
                  src={destination.image}
                  alt={`${destination.city}, ${destination.country}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/75 to-transparent p-3 text-left">
                  <span className="block text-[15px] font-bold text-white">
                    {destination.city}
                  </span>
                  <span className="block text-[11px] font-medium text-white/80">
                    {destination.country}
                  </span>
                </span>
              </button>

              <button
                type="button"
                aria-label={
                  wishlist[destination.id]
                    ? `Remove ${destination.city} from wishlist`
                    : `Save ${destination.city} to wishlist`
                }
                onClick={() => toggle(destination)}
                className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 active:bg-white"
              >
                <Heart
                  className={`h-4 w-4 ${
                    wishlist[destination.id]
                      ? "fill-[var(--premium-accent)] text-[var(--premium-accent)]"
                      : ""
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onSelect?.(destination)}
              className="block w-full px-3 py-3 text-left active:bg-slate-50"
            >
              <span className="flex items-center gap-1 text-[12px] font-semibold text-slate-500">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {destination.rating.toFixed(1)} · {destination.nights} nights
              </span>
              <span className="mt-1 block truncate text-[12px] font-medium text-slate-500">
                {destination.tagline}
              </span>
              <span className="mt-1.5 block text-[15px] font-bold tracking-tight text-slate-900">
                {inr(destination.priceFrom)}
                <span className="ml-1 text-[11px] font-semibold text-slate-400">
                  per person
                </span>
              </span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};
