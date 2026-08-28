import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Star } from "lucide-react";
import { Pill } from "../ui/primitives";
import { SearchWidget, type SearchPayload } from "./SearchWidget";

export interface HeroProps {
  onSearch?: (payload: SearchPayload) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => (
  // No `overflow-hidden` on the section: the calendar and traveller popovers
  // overhang the hero and would otherwise be clipped.
  <section id="top" className="relative isolate">
    {/* Backdrop: ships with the app, so it renders offline too. */}
    <div className="absolute inset-0 -z-20 overflow-hidden">
      <img
        src="/wallpaper.png"
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover"
      />
    </div>
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/80 via-slate-900/65 to-slate-50" />

    <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-[136px] sm:px-8 sm:pb-24 sm:pt-[168px]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <Pill
          icon={<Sparkles className="h-3.5 w-3.5" />}
          className="mb-5 bg-white/15 text-white ring-1 ring-white/25 backdrop-blur"
        >
          AI trip planning, now built in
        </Pill>

        <h1 className="text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-[62px]">
          Every journey,
          <br className="hidden sm:block" /> beautifully planned.
        </h1>

        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/80 sm:text-[18px]">
          Flights, stays, trains and cabs in one place — with fares you can
          trust and itineraries that build themselves.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-white/85">
            <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
            4.8 · 12,400+ trips booked
          </span>
          <span className="flex items-center gap-2 text-[13px] font-semibold text-white/85">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Secure payments · Instant refunds
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
        className="mt-10 sm:mt-12"
      >
        <SearchWidget onSearch={onSearch} />
      </motion.div>
    </div>
  </section>
);
