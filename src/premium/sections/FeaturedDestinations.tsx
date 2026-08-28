import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Heart, Star } from "lucide-react";
import { PremiumButton, SectionHeading } from "../ui/primitives";

export interface Destination {
  id: string;
  city: string;
  country: string;
  tagline: string;
  priceFrom: number;
  rating: number;
  nights: number;
  image: string;
  /** Fallback wash shown while the photo loads or if it fails. */
  gradient: string;
}

/** Placeholder content - replace with the destinations API response. */
export const DEMO_DESTINATIONS: Destination[] = [
  {
    id: "goa",
    city: "Goa",
    country: "India",
    tagline: "Beach shacks & sunset cruises",
    priceFrom: 8499,
    rating: 4.8,
    nights: 3,
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=70",
    gradient: "from-amber-400 to-rose-500"
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
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=70",
    gradient: "from-sky-400 to-indigo-600"
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
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=70",
    gradient: "from-orange-400 to-pink-600"
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
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=70",
    gradient: "from-amber-300 to-slate-700"
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
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=70",
    gradient: "from-emerald-400 to-teal-700"
  },
  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    tagline: "Gardens, hawker food & lights",
    priceFrom: 38700,
    rating: 4.7,
    nights: 4,
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=70",
    gradient: "from-rose-400 to-violet-700"
  }
];

const inr = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const DestinationCard: React.FC<{
  destination: Destination;
  index: number;
  onSelect?: (destination: Destination) => void;
  onToggleWishlist?: (destination: Destination, wishlisted: boolean) => void;
}> = ({ destination, index, onSelect, onToggleWishlist }) => {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07 }}
      onClick={() => onSelect?.(destination)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_-18px_rgba(15,23,42,0.35)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-20px_rgba(15,23,42,0.4)]"
    >
      <div
        className={`relative h-[228px] overflow-hidden bg-gradient-to-br ${destination.gradient}`}
      >
        <img
          src={destination.image}
          alt={`${destination.city}, ${destination.country}`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent" />

        <button
          type="button"
          aria-label={
            wishlisted
              ? `Remove ${destination.city} from wishlist`
              : `Save ${destination.city} to wishlist`
          }
          onClick={(event) => {
            event.stopPropagation();
            const next = !wishlisted;
            setWishlisted(next);
            onToggleWishlist?.(destination, next);
          }}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-slate-700 backdrop-blur transition-all hover:bg-white active:scale-90"
        >
          <Heart
            className={`h-[18px] w-[18px] transition-colors ${
              wishlisted ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
          <div>
            <h3 className="text-[20px] font-bold leading-tight tracking-tight text-white">
              {destination.city}
            </h3>
            <p className="text-[13px] font-medium text-white/75">
              {destination.country}
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-bold text-slate-900 backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {destination.rating}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-slate-700">
            {destination.tagline}
          </p>
          <p className="mt-0.5 text-[12px] font-medium text-slate-400">
            {destination.nights} nights · flights + stay
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            From
          </p>
          <p className="text-[17px] font-bold tracking-tight text-slate-900">
            {inr(destination.priceFrom)}
          </p>
        </div>
      </div>
    </motion.article>
  );
};

export interface FeaturedDestinationsProps {
  destinations?: Destination[];
  onSelect?: (destination: Destination) => void;
  onToggleWishlist?: (destination: Destination, wishlisted: boolean) => void;
  onViewAll?: () => void;
}

export const FeaturedDestinations: React.FC<FeaturedDestinationsProps> = ({
  destinations = DEMO_DESTINATIONS,
  onSelect,
  onToggleWishlist,
  onViewAll
}) => (
  <section id="holidays" className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-24">
    <SectionHeading
      eyebrow="Trending now"
      title="Featured destinations"
      description="Hand-picked places our travellers are loving this season, with all-in prices per person."
      action={
        <PremiumButton
          variant="secondary"
          onClick={onViewAll}
          icon={<ArrowUpRight className="h-4 w-4" />}
        >
          View all
        </PremiumButton>
      }
    />

    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {destinations.map((destination, index) => (
        <DestinationCard
          key={destination.id}
          destination={destination}
          index={index}
          onSelect={onSelect}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  </section>
);
