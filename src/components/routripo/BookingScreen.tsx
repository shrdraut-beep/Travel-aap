import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plane, Hotel, Train, Bus, Car, SlidersHorizontal, Star, BadgeCheck, MessageCircle } from "lucide-react";
import { useCurrencyStore, CURRENCIES } from "../../store/useCurrencyStore";
import { TopBar, SectionTitle, useScrolled, Card, Pills, RippleButton, LogoName } from "./SharedUI";
import { FlightSearchTab } from "../travel/FlightSearchTab";
import { HotelSearchTab } from "../travel/HotelSearchTab";
import { TrainInfoTab } from "../travel/TrainInfoTab";
import { BusSearchTab } from "../travel/BusSearchTab";
import { CarSearchTab } from "../travel/CarSearchTab";

interface BookingScreenProps {
  onLogout: () => void;
  initialTab?: string;
  onOpenSos?: () => void;
  onSOS?: () => void;
  onOpenSettings?: () => void;
}

export function BookingScreen({ onLogout, initialTab = "Packages", onOpenSos, onSOS, onOpenSettings }: BookingScreenProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(scrollRef);
  const [tab, setTab] = useState(initialTab);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);

  const handleBook = () => { setBooked(true); setTimeout(() => setBooked(false), 1200); };

  const tabs = [
    { id: "Packages", label: "Packages", icon: Package, color: "text-rose-600", activeBg: "bg-rose-600 text-white shadow-lg shadow-rose-500/30" },
    { id: "Flights", label: "Flights", icon: Plane, color: "text-blue-600", activeBg: "bg-blue-600 text-white shadow-lg shadow-blue-500/30" },
    { id: "Hotels", label: "Hotels", icon: Hotel, color: "text-purple-600", activeBg: "bg-purple-600 text-white shadow-lg shadow-purple-500/30" },
    { id: "Trains", label: "Trains", icon: Train, color: "text-amber-600", activeBg: "bg-amber-600 text-white shadow-lg shadow-amber-500/30" },
    { id: "Bus", label: "Bus", icon: Bus, color: "text-emerald-600", activeBg: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30" },
    { id: "Cars", label: "Cars", icon: Car, color: "text-orange-600", activeBg: "bg-orange-600 text-white shadow-lg shadow-orange-500/30" }
  ];

  

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50 relative">
      <TopBar sub="Book your journey" title={<LogoName />} scrolled={scrolled} onLogout={onLogout} onSOS={onSOS || onOpenSos || (() => {})} onOpenSettings={onOpenSettings} />
      <div className="px-4 mt-4">
        <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-3 gap-1.5 shadow-inner border border-slate-200">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-2 px-1 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? `${t.activeBg} scale-[1.02]`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : t.color}`} />
                <span className="truncate max-w-full">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-3 space-y-4">
                
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {tab === "Flights" && <FlightSearchTab lang="en" currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹"} />}
            {tab === "Hotels" && <HotelSearchTab lang="en" currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹"} />}
            {tab === "Trains" && <TrainInfoTab lang="en" currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹"} />}
            {tab === "Bus" && <BusSearchTab lang="en" currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹"} />}
            {tab === "Cars" && <CarSearchTab lang="en" currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹"} />}
            {tab === "Packages" && (
              <div className="space-y-4">
                <Card className="p-3.5">
                  <SectionTitle icon={SlidersHorizontal} right={<span className="text-[11px] text-red-500 font-semibold cursor-pointer" onClick={() => alert("Reset filters!")}>Reset</span>}>Filters</SectionTitle>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-pointer" onClick={() => alert("Select destination!")}>Destination: All</div>
                    <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-pointer" onClick={() => alert("Select sort!")}>Sort: Recommended</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Max price {CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹"}30,000</span>
                    <input type="range" className="flex-1 accent-red-500" />
                  </div>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer"><input type="checkbox" className="accent-red-500" /><span className="text-xs text-slate-500">Verified agents only</span></label>
                </Card>
                <div className="py-12 text-center text-slate-500 text-sm font-medium">
                  No holiday packages available at the moment.
                </div>
              </div>)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

