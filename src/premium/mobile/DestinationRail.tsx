import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CloudSun, Heart, MapPin, Sparkles, Star } from "lucide-react";

export interface Destination {
  id: string;
  city: string;
  country: string;
  tagline: string;
  priceFrom: number;
  rating: number;
  nights: number;
  image: string;
  weather?: string;
  badge?: string;
  category?: "beach" | "mountains" | "heritage" | "luxury";
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
    weather: "28°C · Sunny",
    badge: "Top Beach",
    category: "beach",
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
    weather: "12°C · Crisp",
    badge: "Snow & Peaks",
    category: "mountains",
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
    weather: "26°C · Pleasant",
    badge: "Royal Heritage",
    category: "heritage",
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
    weather: "31°C · Warm",
    badge: "Luxury Escape",
    category: "luxury",
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
    weather: "29°C · Tropical",
    badge: "Island Vibes",
    category: "beach",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=70"
  }
];

const VIBES = [
  { id: "all", label: "✨ All Picks" },
  { id: "beach", label: "🏖️ Beach" },
  { id: "mountains", label: "🏔️ Hills" },
  { id: "heritage", label: "🛕 Heritage" },
  { id: "luxury", label: "💎 Luxury" }
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

/** Horizontally scrolling destination cards with SaaS Travel modern aesthetic */
export const DestinationRail: React.FC<DestinationRailProps> = ({
  destinations = DEFAULT_DESTINATIONS,
  onSelect,
  onToggleWishlist,
  onViewAll
}) => {
  const [activeVibe, setActiveVibe] = useState<string>("all");
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const toggle = (e: React.MouseEvent, destination: Destination) => {
    e.stopPropagation();
    const next = !wishlist[destination.id];
    setWishlist((current) => ({ ...current, [destination.id]: next }));
    onToggleWishlist?.(destination, next);
  };

  const filtered = activeVibe === "all" 
    ? destinations 
    : destinations.filter(d => d.category === activeVibe);

  return (
    <section className="pt-6">
      <div className="mb-2.5 flex items-baseline justify-between px-4">
        <div>
          <h2 className="text-[18px] font-extrabold tracking-tight text-slate-900">
            Inspire Your Journey
          </h2>
          <p className="text-[12px] font-medium text-slate-500">
            Curated stays with guaranteed best fares
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[12px] font-bold text-sky-700 hover:text-sky-900"
        >
          View all →
        </button>
      </div>

      {/* Vibe Filter Pills */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VIBES.map((vibe) => (
          <button
            key={vibe.id}
            type="button"
            onClick={() => setActiveVibe(vibe.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold transition-all active:scale-95 ${
              activeVibe === vibe.id
                ? "bg-sky-600 text-white shadow-sm shadow-sky-600/20"
                : "bg-white border border-[#e8e2d5] text-slate-700 hover:bg-[#faf8f4]"
            }`}
          >
            {vibe.label}
          </button>
        ))}
      </div>

      <div className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filtered.map((destination) => (
          <article
            key={destination.id}
            onClick={() => onSelect?.(destination)}
            className="group w-[230px] shrink-0 snap-start cursor-pointer overflow-hidden rounded-3xl border border-[#e8e2d5] bg-white shadow-[0_8px_25px_-16px_rgba(2,132,199,0.1)] transition-all hover:border-sky-300 hover:shadow-[0_14px_35px_-14px_rgba(2,132,199,0.16)] active:scale-[0.99]"
          >
            <div className="relative h-[150px] overflow-hidden">
              <img
                src={destination.image}
                alt={`${destination.city}, ${destination.country}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

              {/* Weather Chip */}
              {destination.weather && (
                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-stone-900/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white">
                  <CloudSun className="h-3 w-3 text-amber-300" />
                  {destination.weather}
                </span>
              )}

              {/* Wishlist Heart */}
              <button
                type="button"
                aria-label={
                  wishlist[destination.id]
                    ? `Remove ${destination.city} from wishlist`
                    : `Save ${destination.city} to wishlist`
                }
                onClick={(e) => toggle(e, destination)}
                className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-stone-700 shadow-sm transition-all active:scale-90 hover:bg-white"
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    wishlist[destination.id]
                      ? "fill-rose-500 text-rose-500"
                      : "text-stone-600"
                  }`}
                />
              </button>

              {/* Bottom City Name on image */}
              <div className="absolute inset-x-0 bottom-0 p-3 text-left">
                <span className="block text-[17px] font-black text-white leading-tight">
                  {destination.city}
                </span>
                <span className="block text-[11px] font-medium text-white/80">
                  {destination.country} · {destination.badge || `${destination.nights} Nights`}
                </span>
              </div>
            </div>

            <div className="p-3.5 text-left">
              <div className="flex items-center justify-between gap-1">
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {destination.rating.toFixed(1)}
                  <span className="text-slate-400 font-normal">({destination.nights}N/{destination.nights + 1}D)</span>
                </span>
                <span className="text-[10px] font-bold text-pink-800 bg-pink-50 px-1.5 py-0.5 rounded-md border border-pink-200">
                  Escrow Verified
                </span>
              </div>

              <p className="mt-1.5 truncate text-[12px] font-medium text-slate-500">
                {destination.tagline}
              </p>

              <div className="mt-2.5 flex items-baseline justify-between border-t border-[#f0ebe1] pt-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Starts from
                  </span>
                  <span className="text-[15px] font-black tracking-tight text-slate-900">
                    {inr(destination.priceFrom)}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-sky-700 group-hover:translate-x-0.5 transition-transform">
                  Explore →
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
