import React, { useState, useEffect } from "react";
import { Package, Plane, Hotel, Train, Bus, Car, SlidersHorizontal, Star, BadgeCheck, MessageCircle } from "lucide-react";
import { TopBar, SectionTitle, useScrolled, Card, Pills, RippleButton, LogoName } from "./SharedUI";
import { FlightSearchTab } from "../travel/FlightSearchTab";
import { HotelSearchTab } from "../travel/HotelSearchTab";
import { TrainInfoTab } from "../travel/TrainInfoTab";
import { BusSearchTab } from "../travel/BusSearchTab";
import { CarSearchTab } from "../travel/CarSearchTab";
import { TopBannerCarousel } from "../common/TopBannerCarousel";
import { OffersForYouSection } from "../common/OffersForYouSection";

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

  const tabs = ["Packages", "Flights", "Hotels", "Trains", "Bus", "Cars"];

  const PACKAGES = [
    {
      id: 1,
      title: "Nashik to Ratnagiri Konkan Beach & Temple Special",
      price: "₹12,500",
      rating: "4.9",
      reviews: "128",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600"
    },
    {
      id: 2,
      title: "Mahakaleshwar & Omkareshwar Ujjain Darshan Package",
      price: "₹8,900",
      rating: "4.8",
      reviews: "95",
      image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600"
    },
    {
      id: 3,
      title: "Goa 5 Days Luxury Beach Resort & Cruise Tour",
      price: "₹18,200",
      rating: "5.0",
      reviews: "210",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"
    }
  ];

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50 relative">
      <TopBar sub="Book your journey" title={<LogoName />} scrolled={scrolled} onLogout={onLogout} onSOS={onSOS || onOpenSos || (() => {})} onOpenSettings={onOpenSettings} />
      <div className="mt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-1">
          {tabs.map((it) => (
            <button key={it} onClick={() => setTab(it)} className={`px-2 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all duration-300 shrink-0 ${tab === it ? `bg-red-500 text-white shadow-md scale-105` : "bg-white text-slate-500 border border-slate-200"}`}>{it}</button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-3 space-y-4">
        <TopBannerCarousel tab="booking" />
        <OffersForYouSection tab="booking" />

        {tab === "Flights" && <FlightSearchTab lang="en" currencySymbol="₹" />}
        {tab === "Hotels" && <HotelSearchTab lang="en" currencySymbol="₹" />}
        {tab === "Trains" && <TrainInfoTab lang="en" currencySymbol="₹" />}
        {tab === "Bus" && <BusSearchTab lang="en" currencySymbol="₹" />}
        {tab === "Cars" && <CarSearchTab lang="en" currencySymbol="₹" />}

        {tab === "Packages" && (
          <div className="space-y-4">
            <Card className="p-3.5">
              <SectionTitle icon={SlidersHorizontal} right={<span className="text-[11px] text-red-500 font-semibold cursor-pointer" onClick={() => alert("Reset filters!")}>Reset</span>}>Filters</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-pointer" onClick={() => alert("Select destination!")}>Destination: All</div>
                <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-pointer" onClick={() => alert("Select sort!")}>Sort: Recommended</div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Max price ₹30,000</span>
                <input type="range" className="flex-1 accent-red-500" />
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer"><input type="checkbox" className="accent-red-500" /><span className="text-xs text-slate-500">Verified agents only</span></label>
            </Card>

            <SectionTitle icon={Package}>Available Holiday Packages</SectionTitle>

            <div className="space-y-4">
              {PACKAGES.map((pkg) => (
                <Card key={pkg.id} className="overflow-hidden relative shadow-md">
                  <div className="relative h-36">
                    <img src={pkg.image} className="w-full h-full object-cover" alt="pkg" />
                    <div className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-1 text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />VERIFIED
                    </div>
                  </div>
                  <div className="p-3.5">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{pkg.title}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-slate-600">{pkg.rating}</span>
                      <span className="text-[11px] text-slate-400">({pkg.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-[10px] text-slate-400">Total per person</p>
                        <p className="text-base font-bold text-slate-800">{pkg.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center" onClick={() => alert("Messaging verified travel agent...")}>
                          <MessageCircle className="w-4 h-4 text-white" />
                        </button>
                        <RippleButton onClick={handleBook} className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold shadow-md">
                          {booked ? "Booked ✓" : "Book now"}
                        </RippleButton>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

