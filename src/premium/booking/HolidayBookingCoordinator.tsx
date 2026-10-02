import React, { useState, useEffect } from "react";
import { CheckCircle2, MapPin, Calendar, Star, Navigation, Palmtree, Users, Heart, ArrowRight } from "lucide-react";
import { RazorpayPaymentModal } from "./RazorpayPaymentModal";
import { packageService, type TourPackage } from "../../services/packages/PackageService";

export interface HolidaySearchParams {
  location: string;
  origin?: string;
  theme?: string;
  startDate?: string;
  travelers?: number;
}

export interface HolidayBookingCoordinatorProps {
  initialSearchParams: HolidaySearchParams;
  onExit: () => void;
}

const STITCH_PACKAGES = [
  {
    id: "pkg_stitch_01",
    name: "Exotic Goa Beach & Island Cruise Tour",
    location: "Calangute, Baga & Grand Island",
    destination: "Goa",
    duration: "4N / 5D",
    durationDays: 4,
    theme: "Beach & Cruise",
    badge: "ALL INCLUSIVE",
    badgeBg: "bg-emerald-600 text-white",
    price: 18500,
    originalPrice: 24000,
    rating: 4.9,
    reviews: 420,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlj0URuKlny30bg2g5Q4DOXKJI74m_WGEktOt8ZHEG5rWaCGYx8YMEP6eBPDHz1sk4NlLYuPFK1wWGUcT-g5Yvpv6rDQG0zmSdVVVyCPL2haOk_R--3ZSWJk9Uny_JzG08DJGjWrPGdF5QMecUYatK72bwXpHAdTj3CgATf9Q15uAXME22TiEaxzUMZYDXpprqWhzgTBxMf7I_Zp-b_jZYCfxfEhmi6JylCSen0UXXaH2qCC_bpKFH",
    inclusions: [
      { text: "Return Flights", icon: "flight" },
      { text: "4-Star Pool Villa", icon: "pool" },
      { text: "Scuba & Dolphin Cruise", icon: "sailing" },
      { text: "Daily Breakfast", icon: "restaurant" }
    ]
  },
  {
    id: "pkg_stitch_02",
    name: "South Goa Heritage & Dudhsagar Waterfall Trek",
    location: "Old Goa & Dudhsagar Falls",
    destination: "Goa",
    duration: "3N / 4D",
    durationDays: 3,
    theme: "Heritage & Churches",
    badge: "NATURE & CULTURE",
    badgeBg: "bg-amber-600 text-white",
    price: 14200,
    originalPrice: 17500,
    rating: 4.8,
    reviews: 290,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCV5jmnaRg-N_TWJI0x86cKYZ0Zd3UNQWXTIYwiHff1-3YOc_clnGu8uFuSeMYpaNQO54QR4guO0ObPwJ_FLJNiglVO6j3jrKUsBVD47CTGlwnnkFo27HhftP6E57vizcPMmy7dgmQd_LRQ2I8hldUmT6SzxGqTg9jcZ2GcnYHoPb2rx2_n7XtR2K3S-_zBRn13bLdmZ-65mla9mDHB-PpYMotAbSsK0Itx6_5kUtei-zpunBfi4Ec6",
    inclusions: [
      { text: "Heritage Stay", icon: "villa" },
      { text: "4x4 Jeep Safari", icon: "directions_car" },
      { text: "Spice Plantation", icon: "yard" },
      { text: "Buffet Lunch", icon: "lunch_dining" }
    ]
  },
  {
    id: "pkg_stitch_03",
    name: "Goa Water Sports & Catamaran Sunset Party",
    location: "Candolim & Mandovi River",
    destination: "Goa",
    duration: "2N / 3D",
    durationDays: 2,
    theme: "Water Sports",
    badge: "ADVENTURE",
    badgeBg: "bg-sky-600 text-white",
    price: 9800,
    originalPrice: 12500,
    rating: 4.7,
    reviews: 340,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMPQ4PViUvcVy5RSPwR-_a77VV43ZVK_igFT8LXctV6v22OgHXjw7SZyfpT8gxO2mLp0HQ6s-JwWAIzMZkD_B20IKNxYBzxOAxdFGYPwBwDjLWd3b5dRFI_yJXlxg7JoN4_M_tk2wZlPrTxIYH5-bgHcySkDcNMcZzVC2QEQYgK1jGUawmABlzwGxVdpelv_ppPcY9uOajQScrOWyzfO3MeGJ9_ssrlyzwMvQ_BrZ4obI5_HLaY6IX",
    inclusions: [
      { text: "Parasailing & Jet Ski", icon: "kitesurfing" },
      { text: "Banana Ride", icon: "kayaking" },
      { text: "Luxury Sunset Cruise", icon: "dinner_dining" }
    ]
  },
  {
    id: "pkg_stitch_04",
    name: "Kashmir Houseboat & Gondola Winter Tour",
    location: "Srinagar, Gulmarg & Pahalgam",
    destination: "Kashmir",
    duration: "5N / 6D",
    durationDays: 5,
    theme: "North Goa Nightlife",
    badge: "TOP RATED WINTER",
    badgeBg: "bg-purple-600 text-white",
    price: 22400,
    originalPrice: 28000,
    rating: 4.9,
    reviews: 510,
    image: "https://lh3.googleusercontent.com/aida/AEtjO1XL853S3QWZyG4l-WU7dZI7Y8ejQ_kYNdqmAVqfgmvFzjFzNB4LtK4ky9o7mgPCQJE-XEvfVUd0zODlxk9oFdXYaWmWMPxCo4A9GNxINLcpnhYTA2kvW-jub2f2k5iZ5u4yHWll9HQfuewM2W71gq9eFZOmezPki3TJrzOhfyjjTu-zb9lb_Q6i4qip_hTSJo6cQeR8s6JhthmG3o7zHJ0Jy9Ncc5sCocrk7IvUa5RMs-gPnEEBI405rQ",
    inclusions: [
      { text: "Deluxe Shikara Ride", icon: "houseboat" },
      { text: "Houseboat Stay", icon: "cabin" },
      { text: "Gondola Phase 1 Pass", icon: "downhill_skiing" },
      { text: "Private Cab", icon: "local_taxi" }
    ]
  }
];

export const HolidayBookingCoordinator: React.FC<HolidayBookingCoordinatorProps> = ({
  initialSearchParams,
  onExit
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState<"results" | "checkout">("results");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [step]);

  const [packages, setPackages] = useState<any[]>(STITCH_PACKAGES);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Traveler info form
  const [firstName, setFirstName] = useState("Cara");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("cara@routripo.app");
  const [phone, setPhone] = useState("9876543210");
  
  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchLivePackages = async () => {
      setIsLoading(true);
      try {
        const dest = initialSearchParams?.location || "Goa";
        const res = await fetch("/api/packages/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination: dest,
            theme: selectedTheme !== "all" ? selectedTheme : undefined,
            duration: selectedDuration !== "all" ? selectedDuration : undefined
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
            setPackages(data.packages);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Live /api/packages/search fetch error, checking packageService:", err);
      }

      try {
        const live = await packageService.getAll();
        if (isMounted && Array.isArray(live) && live.length > 0) {
          const formatted = live.map((pkg) => ({
            id: pkg.id,
            name: pkg.package_name || pkg.title || "Tour Package",
            location: pkg.destination ? (pkg.destination.charAt(0).toUpperCase() + pkg.destination.slice(1)) : "Goa",
            destination: pkg.destination || "Goa",
            duration: pkg.duration || `${pkg.duration_days || pkg.days || 3}N / ${(pkg.duration_days || pkg.days || 3) + 1}D`,
            durationDays: pkg.duration_days || pkg.days || 3,
            theme: "Beach & Cruise",
            badge: "FEATURED TOUR",
            badgeBg: "bg-sky-600 text-white",
            price: Number(pkg.price_per_person || pkg.price || 15000),
            originalPrice: Math.round(Number(pkg.price_per_person || pkg.price || 15000) * 1.25),
            rating: pkg.rating || 4.8,
            reviews: pkg.reviews || 84,
            image: pkg.image_url || pkg.imageUrl || pkg.image || STITCH_PACKAGES[0].image,
            inclusions: Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0
              ? pkg.inclusions.map((inc: any) => typeof inc === "string" ? { text: inc, icon: "verified" } : inc)
              : STITCH_PACKAGES[0].inclusions
          }));
          setPackages([...formatted, ...STITCH_PACKAGES.filter(s => !formatted.some(f => f.id === s.id))]);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Using fallback stitch packages:", err);
      }

      if (isMounted) {
        setPackages(STITCH_PACKAGES);
        setIsLoading(false);
      }
    };

    fetchLivePackages();
    return () => { isMounted = false; };
  }, [initialSearchParams?.location, selectedTheme, selectedDuration]);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBook = (pkg: any) => {
    setSelectedPkg(pkg);
    setStep("checkout");
  };

  const handlePaymentSuccess = (_response: any) => {
    setPaymentSuccess(true);
    setShowPayment(false);
  };

  const originName = initialSearchParams.origin || "Goa";
  const originCode = originName.includes("BOM") ? "(BOM)" : originName.includes("DEL") ? "(DEL)" : "(GOI)";
  const destinationTitle = initialSearchParams.location ? `${initialSearchParams.location} Getaways` : "Konkan Getaways";
  const dateFormatted = initialSearchParams.startDate || "15 Oct 2026";
  const travelersCount = initialSearchParams.travelers || 2;

  // Filtered packages
  const filteredPackages = packages.filter(pkg => {
    if (selectedTheme !== "all" && pkg.theme !== selectedTheme) return false;
    if (selectedDuration !== "all") {
      if (selectedDuration === "2" && !pkg.duration.includes("2N")) return false;
      if (selectedDuration === "3" && !pkg.duration.includes("3N")) return false;
      if (selectedDuration === "4" && !pkg.duration.includes("4N")) return false;
      if (selectedDuration === "5" && !pkg.duration.includes("5N")) return false;
    }
    return true;
  });

  if (paymentSuccess && selectedPkg) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#f8fafc] overflow-y-auto font-['Outfit',sans-serif]">
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-5 shadow-xs">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            Holiday Package Reserved
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">Booking Confirmed!</h1>
          <p className="text-xs text-slate-500 mb-6 max-w-sm">
            Your holiday package for {selectedPkg.location} has been successfully locked. Check your email for confirmed vouchers.
          </p>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 w-full max-w-md mb-6 text-left shadow-sm space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-semibold">Booking Reference</span>
              <span className="font-mono font-bold text-slate-900">HLD-{Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-semibold">Package Name</span>
              <span className="font-bold text-slate-900 max-w-[200px] truncate text-right">{selectedPkg.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-semibold">Travelers</span>
              <span className="font-semibold text-slate-900">{travelersCount} Guests ({firstName} {lastName})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Total Paid</span>
              <span className="text-base font-extrabold text-[#0ea5e9]">
                ₹{((selectedPkg.price * travelersCount) + Math.round(selectedPkg.price * 0.05)).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <button
            onClick={onExit}
            className="w-full max-w-md py-3.5 rounded-xl font-bold bg-[#0ea5e9] hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const baseTotal = (selectedPkg?.price || 18500) * travelersCount;
  const gstFee = Math.round(baseTotal * 0.05);
  const grandTotal = baseTotal + gstFee;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 overflow-y-auto font-['Outfit',sans-serif] flex flex-col antialiased">
      {/* 1. Curved Stitch Header (Matches zip3/code.html header) */}
      <header className="sticky top-0 inset-x-0 z-40 bg-gradient-to-b from-[#e8f4fc] via-[#f4f9fd] to-white shadow-sm rounded-b-[24px] border-b border-[#bae6fd]/50 pt-safe transition-all">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <button
            aria-label="Go back"
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center active:scale-95 transition-all hover:bg-slate-200 shrink-0 cursor-pointer"
            onClick={() => {
              if (step === "checkout") setStep("results");
              else onExit();
            }}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div className="flex-1 text-center min-w-0 px-1">
            <div className="flex items-center justify-center gap-1.5 leading-tight">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                {originName}
              </span>
              <span className="text-xs font-bold text-sky-600">
                {originCode}
              </span>
              <span className="material-symbols-outlined text-[15px] text-[#0ea5e9] font-bold shrink-0">
                arrow_forward
              </span>
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                {destinationTitle}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
              {dateFormatted} • 4N/5D • Flights + Resort
            </p>
          </div>

          <button
            aria-label="Modify Search"
            className="w-9 h-9 rounded-full bg-sky-50 text-[#0ea5e9] flex items-center justify-center active:scale-95 transition-all hover:bg-sky-100 shrink-0 cursor-pointer"
            onClick={onExit}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 pt-3 pb-28">
        {step === "results" ? (
          <div className="space-y-3.5">
            {/* Filter Strip: Destination & Theme Pills (Matches zip3/code.html lines 6-28) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: "all", label: "All Themes", icon: "explore" },
                  { id: "Beach & Cruise", label: "Beach & Cruise", icon: "waves" },
                  { id: "Water Sports", label: "Water Sports", icon: "scuba_diving" },
                  { id: "Heritage & Churches", label: "Heritage & Churches", icon: "church" },
                  { id: "North Goa Nightlife", label: "Nightlife & Clubs", icon: "nightlife" }
                ].map((th) => {
                  const isActive = selectedTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setSelectedTheme(th.id)}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-[#0ea5e9] text-white shadow-sm shadow-sky-500/20"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{th.icon}</span>
                      <span>{th.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Duration Filter Chips (Matches zip3/code.html lines 29-45) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
                  Duration:
                </span>
                {[
                  { id: "all", label: "All" },
                  { id: "2", label: "2N/3D" },
                  { id: "3", label: "3N/4D" },
                  { id: "4", label: "4N/5D" },
                  { id: "5", label: "5N/6D" }
                ].map((dur) => {
                  const isSel = selectedDuration === dur.id;
                  return (
                    <button
                      key={dur.id}
                      type="button"
                      onClick={() => setSelectedDuration(dur.id)}
                      className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                        isSel
                          ? "bg-sky-100 text-sky-700 font-bold border border-sky-300"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {dur.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tour Packages Cards List (Exact Google Stitch Layout from zip3/code.html) */}
            <div className="flex flex-col gap-3.5">
              {filteredPackages.map((pkg) => {
                const isSaved = wishlist[pkg.id];
                return (
                  <article
                    key={pkg.id}
                    className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200/90 group"
                  >
                    {/* Full-Width Image with Overlays */}
                    <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={pkg.name}
                        src={pkg.image}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20 pointer-events-none" />

                      {/* Top Left Badge */}
                      <div className={`absolute top-3 left-3 ${pkg.badgeBg || "bg-emerald-600 text-white"} px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-sm`}>
                        {pkg.badge || "ALL INCLUSIVE"}
                      </div>

                      {/* Rating Overlay Bottom Left */}
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] text-slate-900 font-bold shadow-xs">
                        <span
                          className="material-symbols-outlined text-amber-500 text-[14px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span>{pkg.rating}</span>
                        <span className="text-slate-500 font-normal text-[10px]">({pkg.reviews})</span>
                      </div>

                      {/* Wishlist Top Right */}
                      <button
                        type="button"
                        aria-label="Wishlist package"
                        onClick={(e) => toggleWishlist(pkg.id, e)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer ${
                          isSaved ? "text-rose-500" : "text-slate-700 hover:text-rose-500"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={isSaved ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          favorite
                        </span>
                      </button>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0ea5e9]">
                          {pkg.duration}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium truncate max-w-[240px]">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">location_on</span>
                          <span className="truncate">{pkg.location}</span>
                        </span>
                      </div>

                      <h2 className="font-extrabold text-[15px] sm:text-base text-slate-900 leading-snug">
                        {pkg.name}
                      </h2>

                      {/* Inclusions Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {pkg.inclusions.map((inc: any, i: number) => {
                          const iconName = inc.icon || "check_circle";
                          const labelText = inc.text || inc;
                          return (
                            <span
                              key={i}
                              className="bg-slate-100 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-700 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[13px] text-sky-600">{iconName}</span>
                              <span>{labelText}</span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Price & CTA Row */}
                      <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-slate-100">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-extrabold text-slate-900 leading-none">
                              ₹{pkg.price?.toLocaleString("en-IN")}
                            </span>
                            {pkg.originalPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{pkg.originalPrice?.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                            per person • incl. taxes
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBook(pkg)}
                          className="bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-sm shadow-sky-500/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <span>Book Now</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Bottom Trust Strip (Matches zip3/code.html lines 255-274) */}
            <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <span className="material-symbols-outlined text-[20px] text-emerald-600">verified_user</span>
                <span>RouTripo TourShield™</span>
              </div>
              <ul className="space-y-1.5 pt-1 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0">check_circle</span>
                  <span>100% customisable itineraries for group travels</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0">shield_with_heart</span>
                  <span>Zero cancellation penalty with TripProtect</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0">support_agent</span>
                  <span>24x7 dedicated local tour manager on call</span>
                </li>
              </ul>
            </section>
          </div>
        ) : selectedPkg && (
          <div className="space-y-4 animate-in fade-in">
            {/* Summary card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-4">
              <img
                src={selectedPkg.image}
                alt={selectedPkg.name}
                className="w-full sm:w-44 h-32 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold text-[#0ea5e9] uppercase tracking-wider">
                  {selectedPkg.duration} • {selectedPkg.location}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">{selectedPkg.name}</h3>
                <div className="text-xs text-slate-500 font-medium">
                  {travelersCount} Guests • Check-in: {dateFormatted}
                </div>
              </div>
            </div>

            {/* Lead Traveler Details Form */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-600" />
                <span>Lead Guest Information</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#0ea5e9]"
                    placeholder="Cara"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#0ea5e9]"
                    placeholder="Doe"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#0ea5e9]"
                    placeholder="cara@routripo.app"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#0ea5e9]"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 text-sm pb-1">Price Summary</h3>
              <div className="flex justify-between items-center text-slate-600">
                <span>Base Package (₹{selectedPkg.price?.toLocaleString("en-IN")} × {travelersCount} Guests)</span>
                <span className="font-bold text-slate-900">₹{baseTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Taxes &amp; Tourism Fees (5% GST)</span>
                <span className="font-bold text-slate-900">₹{gstFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-extrabold text-base text-slate-900">
                <span>Total Amount</span>
                <span className="text-lg text-[#0ea5e9]">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Pay CTA */}
            <button
              onClick={() => setShowPayment(true)}
              className="w-full py-3.5 bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
            >
              Proceed to Pay ₹{grandTotal.toLocaleString("en-IN")} via Razorpay
            </button>
          </div>
        )}
      </main>

      {/* Razorpay Modal */}
      <RazorpayPaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={grandTotal}
        serviceName="RouTripo Holidays"
        orderDescription={selectedPkg?.name || "Holiday Package"}
        customerName={`${firstName} ${lastName}`}
        customerEmail={email}
        customerPhone={phone}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
