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
  <section id="top" className="relative isolate bg-gradient-to-b from-sky-50 via-rose-50/40 to-white">
    {/* Backdrop: ships with the app, so it renders offline too. Kept faint so
        the section stays light and the copy reads as dark-on-white. */}
    <div className="absolute inset-0 -z-20 overflow-hidden">
      <img
        src="/wallpaper.png"
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover opacity-[0.10]"
      />
      <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-[var(--color-coral)]/15 blur-3xl" />
      <div className="absolute -right-16 top-24 h-[380px] w-[380px] rounded-full bg-[var(--color-emerald)]/15 blur-3xl" />
    </div>
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/40 via-white/20 to-white" />

    <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-[136px] sm:px-8 sm:pb-24 sm:pt-[168px]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <Pill
          icon={<Sparkles className="h-3.5 w-3.5" />}
          className="mb-5 bg-white/80 text-slate-700 ring-1 ring-slate-200 backdrop-blur"
        >
          AI trip planning, now built in
        </Pill>

        <h1 className="text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-slate-900 sm:text-[62px]">
          Every journey,
          <br className="hidden sm:block" />{" "}
          <span className="bg-gradient-to-r from-[var(--color-coral)] to-[#FF9166] bg-clip-text text-transparent">
            beautifully planned.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-slate-600 sm:text-[18px]">
          Flights, stays, trains and cabs in one place — with fares you can
          trust and itineraries that build themselves.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            4.8 · 12,400+ trips booked
          </span>
          <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
            <ShieldCheck className="h-4 w-4 text-[var(--color-emerald)]" />
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
