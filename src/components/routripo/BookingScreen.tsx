import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Plane, Hotel, Train, Bus, Car, SlidersHorizontal, Star, BadgeCheck, MessageCircle,
  X, Check, Copy, QrCode, ArrowRight, ShieldCheck, Ticket, Building2, CarFront, Percent, CalendarDays,
  CheckSquare, Compass as Sparkles, Compass, MapPin, Eye, Info, Flame, Clock, Tag, RefreshCw, Plus, Sparkles as SparklesIcon
} from "lucide-react";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useOfferStore } from "../../store/useOfferStore";
import { useCurrencyStore, CURRENCIES } from "../../store/useCurrencyStore";
import { TopBar, SectionTitle, useScrolled, Card, Pills, RippleButton, LogoName } from "./SharedUI";
import { TabDashboardLayout } from "./TabDashboardLayout";
import { FlightSearchTab } from "../travel/FlightSearchTab";
import { HotelSearchTab } from "../travel/HotelSearchTab";
import { TrainInfoTab } from "../travel/TrainInfoTab";
import { BusSearchTab } from "../travel/BusSearchTab";
import { CarSearchTab } from "../travel/CarSearchTab";
import { ExplorePackagesView } from "../views/ExplorePackagesView";

import { BookingItemPayload } from "../../pages/CheckoutPage";
import { BookingFlowProvider } from "../../context/BookingFlowContext";
import { BookingFlowModal } from "../booking/BookingFlowModal";

interface BookingScreenProps {
  onLogout: () => void;
  initialTab?: string;
  onOpenSos?: () => void;
  onSOS?: () => void;
  onOpenSettings?: () => void;
  onOpenMyTickets?: () => void;
  onBack?: () => void;
  lang?: string;
}

export function BookingScreen({ onLogout, initialTab = "Menu", onOpenSos, onSOS, onOpenSettings, onOpenMyTickets, onBack, lang = "en" }: BookingScreenProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(scrollRef);
  const [tab, setTab] = useState(initialTab);
  const [booked, setBooked] = useState(false);
  const isMr = lang === "mr";
  const [checkoutModalItem, setCheckoutModalItem] = useState<BookingItemPayload | null>(null);

  // Coupons & Ads State (wired to Firestore & Zustand)
  const [firestoreCoupons, setFirestoreCoupons] = useState<any[]>([]);
  const offersStore = useOfferStore(state => state.offers);
  const addStoreOffer = useOfferStore(state => state.addOffer);
  
  const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);
  const [newCouponForm, setNewCouponForm] = useState({
    code: "",
    title: "",
    discountBadge: "FLAT 20% OFF",
    subtitle: "",
    category: "All",
    validTill: "31 Dec 2026",
    createdBy: "Admin & Verified Agent"
  });

  // Real-logic interactive state
  const [activeSection, setActiveSection] = useState<'none' | 'my-bookings' | 'travel-deals'>('none');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Listen to Firestore coupons collection
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const q = collection(db, "coupons");
      unsubscribe = onSnapshot(q, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setFirestoreCoupons(list);
      }, (error) => {
        console.warn("Firestore coupons error:", error);
      });
    } catch (err) {
      console.warn("Firestore listener init error:", err);
    }
    return () => unsubscribe();
  }, []);

  // Combined approved active coupons/ads (without dummy photos)
  const activeCouponsAndAds = React.useMemo(() => {
    const combined: any[] = [...firestoreCoupons];
    offersStore.forEach(o => {
      if (o.isActive && !combined.some(c => c.id === o.id || (c.code && c.code === o.couponCode))) {
        combined.push({
          id: o.id,
          code: o.couponCode || "PROMO",
          title: o.title,
          subtitle: o.subtitle,
          discountBadge: o.discountBadge || "SPECIAL DEAL",
          category: o.category || "All",
          validTill: o.validTill || "Valid for limited time",
          createdBy: o.createdBy || "Admin Approved",
          approved: true
        });
      }
    });
    return combined;
  }, [firestoreCoupons, offersStore]);

  const handleAddCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponForm.code.trim() || !newCouponForm.title.trim()) {
      showToast(isMr ? "कृपया कूपन कोड आणि टायटल प्रविष्ट करा" : "Please enter coupon code and title");
      return;
    }
    setIsSubmittingCoupon(true);
    const cleanCode = newCouponForm.code.trim().toUpperCase();
    const couponData = {
      code: cleanCode,
      title: newCouponForm.title.trim(),
      discountBadge: newCouponForm.discountBadge.trim() || "SPECIAL OFFER",
      subtitle: newCouponForm.subtitle.trim() || `${cleanCode} - Verified promo code`,
      category: newCouponForm.category,
      validTill: newCouponForm.validTill.trim() || "Limited Time Offer",
      createdBy: newCouponForm.createdBy || "Admin Approved",
      approved: true,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "coupons"), couponData);
    } catch (err) {
      console.warn("Firestore coupon save failed, using store fallback:", err);
    }

    addStoreOffer({
      title: couponData.title,
      subtitle: couponData.subtitle,
      imageUrl: "",
      category: couponData.category as any,
      couponCode: cleanCode,
      discountBadge: couponData.discountBadge,
      validTill: couponData.validTill,
      isActive: true,
      createdBy: couponData.createdBy
    });

    setIsSubmittingCoupon(false);
    setIsAddCouponModalOpen(false);
    setNewCouponForm({
      code: "",
      title: "",
      discountBadge: "FLAT 20% OFF",
      subtitle: "",
      category: "All",
      validTill: "31 Dec 2026",
      createdBy: "Admin & Verified Agent"
    });
    showToast(isMr ? "कूपन कोड व जाहिरात यशस्वीरीत्या अपलोड झाली!" : "Coupon & Ad uploaded & approved successfully!");
  };

  useEffect(() => {
    if (initialTab) {
      if (initialTab === "Car & Cabs" || initialTab === "Cab" || initialTab === "Cabs") {
        setTab("Cars");
      } else if (initialTab === "Holiday Pkgs" || initialTab === "Holiday Packages" || initialTab === "Package") {
        setTab("Packages");
      } else {
        setTab(initialTab);
      }
    } else {
      setTab("Menu");
    }
  }, [initialTab]);

  const handleBook = () => { setBooked(true); setTimeout(() => setBooked(false), 1200); };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const tabs = [
    { id: "Flights", label: isMr ? "विमान" : "Flights", icon: Plane, color: "from-blue-500 to-indigo-600" },
    { id: "Hotels", label: isMr ? "हॉटेल" : "Hotels", icon: Hotel, color: "from-amber-500 to-orange-600" },
    { id: "Trains", label: isMr ? "ट्रेन्स" : "Trains", icon: Train, color: "from-rose-500 to-red-600" },
    { id: "Bus", label: isMr ? "बस" : "Bus", icon: Bus, color: "from-emerald-500 to-teal-600" },
    { id: "Cars", label: isMr ? "कार व टॅक्सी" : "Car & Cabs", icon: Car, color: "from-orange-500 to-amber-600" },
    { id: "Packages", label: isMr ? "हॉलिडे पॅकेजेस" : "Holiday Packages", icon: Package, color: "from-purple-500 to-pink-600" }
  ];

  // Simulated Booking Records with interactive QR Code boarding passes
  const myBookingRecords = [
    {
      id: "BK-FL-8392",
      type: "flight",
      title: isMr ? "एअर इंडिया AI-101" : "Air India AI-101",
      subtitle: "Mumbai (BOM) ➔ Goa (GOI)",
      date: "Oct 20, 2026 • 08:30 AM",
      pnr: "AI984X7",
      status: "CONFIRMED",
      statusLabel: isMr ? "कन्फर्म" : "CONFIRMED",
      seat: "14F (Window)",
      gate: "A12",
      terminal: "2",
      class: "Economy",
      passenger: "Shrd Raut"
    },
    {
      id: "BK-HT-2849",
      type: "hotel",
      title: isMr ? "ताज एक्झॉटिका रिसॉर्ट आणि स्पा" : "Taj Exotica Resort & Spa, Goa",
      subtitle: isMr ? "लक्झरी विला - सी व्ह्यू (३ रात्री)" : "Luxury Villa - Sea View (3 Nights)",
      date: "Check-in: Oct 20 • Check-out: Oct 23",
      pnr: "TAJ-98241",
      status: "CONFIRMED",
      statusLabel: isMr ? "कन्फर्म" : "CONFIRMED",
      room: "Luxury Villa (King Bed)",
      address: "Sinquerim, Candolim, Goa, 403515"
    },
    {
      id: "BK-CB-3742",
      type: "cab",
      title: isMr ? "प्रीमियम एसी सेडान (राउट्रिपो डायरेक्ट)" : "Premium AC Sedan (RouTriO Direct)",
      subtitle: "BOM Airport ➔ Taj Exotica",
      date: "Oct 20, 2026 • 10:15 AM",
      pnr: "MH-02-CD-5678",
      status: "ASSIGNED",
      statusLabel: isMr ? "चालक नियुक्त" : "DRIVER ASSIGNED",
      driver: "Vijay Kamble (★ 4.9)",
      otp: "4819"
    }
  ];

  // Simulated Tailored High-Value Deals & Coupons
  const travelCoupons = [
    {
      code: "FLIGHT500",
      badge: "₹500 OFF",
      title: isMr ? "विमान तिकीट सवलत" : "Flight Ticket Discount",
      desc: isMr ? "सर्व विमान बुकिंगवर फ्लॅट ₹५०० सूट मिळवा" : "Get flat ₹500 discount on any flight booking.",
      till: "31 Oct, 2026"
    },
    {
      code: "HOTEL15",
      badge: "15% OFF",
      title: isMr ? "प्रीमियम स्टे सूट" : "Premium Stay Discount",
      desc: isMr ? "आमच्या भागीदार प्रीमियम हॉटेल्समध्ये अतिरिक्त १५% सूट" : "Get an extra 15% off at our partner premium hotels.",
      till: "15 Nov, 2026"
    },
    {
      code: "CABFREE",
      badge: "FREE FEE",
      title: isMr ? "मोफत कॅब बुकिंग" : "Zero Booking Fee Cab",
      desc: isMr ? "पहिल्या राउट्रिपो डायरेक्ट टॅक्सी प्रवासावर शून्य बुकिंग शुल्क" : "Pay absolutely zero service charges on your first direct cab ride.",
      till: "30 Nov, 2026"
    },
    {
      code: "POCKET10",
      badge: "10% BACK",
      title: isMr ? "वॉलेट कॅशबॅक" : "Wallet Cashback Offer",
      desc: isMr ? "बजेट ट्रिप नियोजनावर थेट १०% कॅशबॅक क्रेडिट मिळवा" : "Receive a direct 10% cashback credited to your travel wallet.",
      till: "31 Dec, 2026"
    }
  ];

  const handleHeaderBack = () => {
    if (checkoutModalItem) {
      setCheckoutModalItem(null);
    } else if (activeSection !== 'none') {
      setActiveSection('none');
    } else if (tab !== "Menu") {
      setTab("Menu");
    } else if (onBack) {
      onBack();
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    showToast(isMr ? `${code} कोड कॉपी केला!` : `Code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCoupon(null), 1500);
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50 relative">
      <TopBar 
        sub={isMr ? "तुमचा बुकिंग आणि प्रवासाचा केंद्र" : "Book your journey"} 
        title={<LogoName />} 
        scrolled={scrolled} 
        onLogout={onLogout} 
        onSOS={onSOS || onOpenSos || (() => {})} 
        onOpenSettings={onOpenSettings}
        onOpenMyTickets={onOpenMyTickets}
        onBack={handleHeaderBack}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 z-[2000] bg-slate-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-800"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="pt-3 pb-8">
        {/* Quick Action Badges / Smart Features */}
        <div className="px-5 mb-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveSection(activeSection === 'my-bookings' ? 'none' : 'my-bookings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all border cursor-pointer ${
              activeSection === 'my-bookings'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-indigo-500" />
            <span>{isMr ? "माझी तिकिटे आणि पास" : "My Tickets & Passes"}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          </button>

          <button
            onClick={() => setActiveSection(activeSection === 'travel-deals' ? 'none' : 'travel-deals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all border cursor-pointer ${
              activeSection === 'travel-deals'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-purple-500" />
            <span>{isMr ? "सवलत कूपन्स आणि डील्स" : "Coupons & Flash Deals"}</span>
            <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-md">
              15% OFF
            </span>
          </button>
        </div>

        <TabDashboardLayout
          gridTitle={isMr ? "बुकिंग सर्व्हिसेस" : "Booking Services"}
          gridIcon={Package}
          gridItems={tabs.map(t => ({
            icon: t.icon,
            label: t.label,
            color: t.color,
            isActive: tab === t.id,
            onClick: () => {
              setTab(t.id);
            }
          }))}
        >
          {/* INLINE DYNAMIC CONTENT (OPENS DIRECTLY UNDER CARDS/BUTTONS) */}
          <AnimatePresence mode="wait">
            {activeSection === 'my-bookings' && (
              <motion.div
                key="my-bookings-panel"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-white border border-slate-200/80 rounded-3xl shadow-md overflow-hidden flex flex-col p-4 sm:p-5">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                        <Ticket className="w-4 h-4 text-indigo-600" />
                        {isMr ? "माझ्या प्रवासाच्या बुकिंग्ज" : "My Trip Bookings"}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                        {isMr ? "सक्रिय आणि आगामी तिकिटे" : "Active & Upcoming Reservation Receipts"}
                      </p>
                    </div>
                    <button 
                      onClick={() => { setActiveSection('none'); setSelectedTicketId(null); }} 
                      className="p-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 active:scale-95 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {myBookingRecords.map((booking) => {
                      const isExpanded = selectedTicketId === booking.id;
                      return (
                        <div 
                          key={booking.id} 
                          className="bg-slate-50/50 border border-slate-100 rounded-2xl shadow-xs overflow-hidden"
                        >
                          <div className="p-3.5 flex items-start justify-between gap-2">
                            <div className="flex gap-3">
                              <div className={`p-2.5 rounded-xl shrink-0 ${
                                booking.type === "flight" ? "bg-blue-50 text-blue-600" :
                                booking.type === "hotel" ? "bg-amber-50 text-amber-600" :
                                "bg-emerald-50 text-emerald-600"
                              }`}>
                                {booking.type === "flight" && <Plane className="w-4 h-4" />}
                                {booking.type === "hotel" && <Hotel className="w-4 h-4" />}
                                {booking.type === "cab" && <Car className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0 text-left">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block">{booking.id}</span>
                                <h4 className="text-xs font-black text-slate-800 truncate">{booking.title}</h4>
                                <p className="text-[10px] text-slate-500 font-bold truncate">{booking.subtitle}</p>
                                <p className="text-[9px] text-indigo-600 font-bold mt-1">{booking.date}</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                              {booking.statusLabel}
                            </span>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-4 pb-4 pt-1 border-t border-slate-100 bg-white"
                              >
                                <div className="grid grid-cols-2 gap-3 py-3 text-[11px] border-b border-dashed border-slate-100 text-left">
                                  <div>
                                    <span className="text-slate-600 font-black block uppercase text-[8px] tracking-wider">{isMr ? "कन्फर्मेशन कोड" : "CONFIRMATION / PNR"}</span>
                                    <span className="font-mono font-bold text-slate-800 text-xs">{booking.pnr}</span>
                                  </div>
                                  {booking.passenger && (
                                    <div>
                                      <span className="text-slate-600 font-black block uppercase text-[8px] tracking-wider">{isMr ? "प्रवासी" : "PASSENGER"}</span>
                                      <span className="font-bold text-slate-800">{booking.passenger}</span>
                                    </div>
                                  )}
                                  {booking.seat && (
                                    <div>
                                      <span className="text-slate-600 font-black block uppercase text-[8px] tracking-wider">{isMr ? "सीट नंबर" : "ASSIGNED SEAT"}</span>
                                      <span className="font-bold text-slate-800">{booking.seat}</span>
                                    </div>
                                  )}
                                  {booking.gate && (
                                    <div>
                                      <span className="text-slate-600 font-black block uppercase text-[8px] tracking-wider">{isMr ? "गेट / टर्मिनल" : "GATE / TERMINAL"}</span>
                                      <span className="font-bold text-slate-800">Gate {booking.gate} (T{booking.terminal})</span>
                                    </div>
                                  )}
                                  {booking.room && (
                                    <div>
                                      <span className="text-slate-600 font-black block uppercase text-[8px] tracking-wider">{isMr ? "खोलीचा प्रकार" : "ROOM TYPE"}</span>
                                      <span className="font-bold text-slate-800 truncate block">{booking.room}</span>
                                    </div>
                                  )}
                                  {booking.address && (
                                    <div className="col-span-2">
                                      <span className="text-slate-600 font-black block uppercase text-[8px] tracking-wider">{isMr ? "पत्ता" : "ADDRESS"}</span>
                                      <span className="text-slate-600 truncate block">{booking.address}</span>
                                    </div>
                                  )}
                                  {booking.driver && (
                                    <div>
                                      <span className="text-slate-600 font-black block uppercase text-[8px] tracking-wider">{isMr ? "चालक तपशील" : "DRIVER DETAILS"}</span>
                                      <span className="font-bold text-slate-800">{booking.driver}</span>
                                    </div>
                                  )}
                                  {booking.otp && (
                                    <div>
                                      <span className="text-slate-600 font-black block uppercase text-[8px] tracking-wider">{isMr ? "सुरक्षा ओटीपी" : "START OTP"}</span>
                                      <span className="font-mono font-black text-rose-600 text-xs">{booking.otp}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-4 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                  <QrCode className="w-24 h-24 text-slate-800 stroke-[1.5]" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 mt-2">{isMr ? "बोर्डिंग पास स्कॅन करा" : "Scan boarding pass QR"}</span>
                                  <span className="text-[10px] text-slate-500 font-bold mt-0.5">{booking.id} • RouTriPo Verified</span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <button 
                            onClick={() => setSelectedTicketId(isExpanded ? null : booking.id)}
                            className="w-full py-2 bg-slate-100/50 hover:bg-slate-100 text-[9px] font-black uppercase tracking-widest text-indigo-600 border-t border-slate-200/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {isExpanded 
                              ? (isMr ? "तपशील बंद करा" : "Hide Details") 
                              : (isMr ? "तपशील आणि बोर्डिंग पास" : "View Details & Boarding Pass")
                            }
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-center flex items-center justify-center gap-2 text-[9px] font-bold text-slate-500 uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    {isMr ? "सर्व तिकिटे अधिकृत एजंटद्वारे सुरक्षित आणि पडताळलेली आहेत" : "All tickets are direct network secured & verified"}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'travel-deals' && (
              <motion.div
                key="travel-deals-panel"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-white border border-slate-200/80 rounded-3xl shadow-md overflow-hidden flex flex-col p-4 sm:p-5">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-purple-600" />
                        {isMr ? "भागीदार डील्स आणि ऑफर्स" : "Exclusive Partner Deals"}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                        {isMr ? "प्रवासावरील सवलती व प्रोमो कोड" : "Copy Codes and Claim Travel Discounts"}
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveSection('none')} 
                      className="p-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 active:scale-95 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  <div className="bg-purple-50/50 rounded-2xl p-3 border border-purple-100 text-[11px] text-purple-950 flex gap-2.5 mb-4 text-left">
                    <Info className="w-4.5 h-4.5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-purple-900 uppercase tracking-wider mb-0.5">
                        {isMr ? "पार्टनर डिस्काउंट कसे वापरावे?" : "How to use partner discounts?"}
                      </span>
                      {isMr 
                        ? "कूपन कोड कॉपी करा आणि विमान, हॉटेल किंवा टॅक्सी पेमेंट करताना अप्लाय करा." 
                        : "Simply copy any coupon code below and apply it inside the checkout flows of Flights, Hotels, or Cabs."
                      }
                    </div>
                  </div>

                  <div className="space-y-3 text-left">
                    {travelCoupons.map((coupon) => {
                      const isCopied = copiedCoupon === coupon.code;
                      return (
                        <div 
                          key={coupon.code}
                          className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs relative overflow-hidden"
                        >
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-purple-600" />

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[8px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md">
                                {coupon.badge}
                              </span>
                              <span className="text-[8px] text-slate-400 font-bold">
                                {isMr ? "वैधता:" : "Valid till:"} {coupon.till}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-xs pt-0.5 truncate">{coupon.title}</h4>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed truncate max-w-[160px] sm:max-w-[240px]">
                              {coupon.desc}
                            </p>
                          </div>

                          <div className="flex flex-col items-center justify-center pl-2 border-l border-dashed border-slate-200 shrink-0">
                            <span className="font-mono font-bold text-[8px] text-slate-400 block uppercase mb-1 tracking-wider">
                              {isMr ? "कोड" : "CODE"}
                            </span>
                            <span className="font-mono font-black text-indigo-700 text-[10px] tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 shadow-inner select-all mb-1.5">
                              {coupon.code}
                            </span>
                            
                            <button 
                              onClick={() => handleCopyCoupon(coupon.code)}
                              className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer ${
                                isCopied 
                                  ? "bg-emerald-600 text-white border border-emerald-400" 
                                  : "bg-slate-900 hover:bg-slate-800 text-white"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  {isMr ? "कॉपी!" : "COPIED!"}
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  {isMr ? "कॉपी" : "COPY"}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-center flex items-center justify-center gap-2 text-[9px] font-bold text-slate-500 uppercase">
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                    {isMr ? "सर्व डील्स आमच्या प्रवासाच्या भागीदारांद्वारे हमीकृत आहेत" : "Deals are guaranteed by direct service partners"}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                {tab === "Menu" && (
                  <div className="space-y-4 py-1">
                    {/* Compact Coupons & Ads Card Container */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4 text-left relative overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                            <Tag className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 leading-tight">
                              {isMr ? "कूपन्स आणि जाहिराती" : "Coupons & Offers"}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                              <BadgeCheck className="w-3.5 h-3.5 text-indigo-500 inline" />
                              <span>{isMr ? "ॲडमिन व एजंट कडून मंजूर" : "Admin & Agent Approved"}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Content Area - Display ONLY */}
                      {activeCouponsAndAds.length === 0 ? (
                        <div className="py-6 px-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                          <div className="w-10 h-10 rounded-2xl bg-slate-200/60 text-slate-400 flex items-center justify-center mx-auto">
                            <Ticket className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">
                              {isMr ? "कोणतेही सक्रिय कूपन उपलब्ध नाही" : "No active coupons or ads"}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                              {isMr 
                                ? "ॲडमिन किंवा व्हेरिफाइड एजंट्स कडून अपलोड केलेले कूपन्स व जाहिराती येथे आपोआप दिसतील." 
                                : "Approved coupon codes and promotional deals uploaded by Admin will appear here."}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeCouponsAndAds.map((item, idx) => {
                            const isCopied = copiedCoupon === item.code;
                            return (
                              <div 
                                key={item.id || idx}
                                className="bg-gradient-to-r from-amber-500/5 via-indigo-500/5 to-purple-500/5 p-4 rounded-2xl border border-amber-500/20 shadow-2xs relative flex flex-col justify-between gap-3 text-left"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 text-[9px] font-black uppercase tracking-wider">
                                        {item.discountBadge || "PROMO OFFER"}
                                      </span>
                                      {item.category && (
                                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 text-[9px] font-bold">
                                          {item.category}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-xs font-black text-slate-900 leading-snug">
                                      {item.title}
                                    </h4>
                                    {item.subtitle && (
                                      <p className="text-[10px] text-slate-500 font-medium leading-normal">
                                        {item.subtitle}
                                      </p>
                                    )}
                                  </div>

                                  {/* Coupon Code Pill & Copy Button */}
                                  {item.code && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard?.writeText(item.code);
                                        setCopiedCoupon(item.code);
                                        showToast(isMr ? `कूपन कोड ${item.code} कॉपी झाला!` : `Coupon ${item.code} copied!`);
                                        setTimeout(() => setCopiedCoupon(null), 2000);
                                      }}
                                      className="px-3 py-2 bg-white rounded-xl border border-dashed border-amber-400 text-slate-900 shadow-xs flex items-center gap-1.5 shrink-0 hover:bg-amber-50 transition-all cursor-pointer active:scale-95"
                                    >
                                      <span className="text-xs font-black tracking-wider text-amber-600 font-mono">
                                        {item.code}
                                      </span>
                                      {isCopied ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5 text-amber-500" />
                                      )}
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 border-t border-slate-100 pt-2 mt-1">
                                  <span className="flex items-center gap-1 text-slate-500">
                                    <BadgeCheck className="w-3 h-3 text-indigo-500" />
                                    {item.createdBy || "Admin Approved"}
                                  </span>
                                  <span>{item.validTill || "Valid for limited period"}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {tab === "Flights" && <FlightSearchTab lang={lang} currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹"} onBookNow={setCheckoutModalItem} onBack={() => setTab("Menu")} />}
                {tab === "Hotels" && <HotelSearchTab lang={lang} currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹"} onBookNow={setCheckoutModalItem} onBack={() => setTab("Menu")} />}
                {tab === "Trains" && <TrainInfoTab lang={lang} currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹"} onBookNow={setCheckoutModalItem} onBack={() => setTab("Menu")} />}
                {tab === "Bus" && <BusSearchTab lang={lang} currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹"} onBookNow={setCheckoutModalItem} onBack={() => setTab("Menu")} />}
                {tab === "Cars" && <CarSearchTab lang={lang} currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹"} onBookNow={setCheckoutModalItem} onBack={() => setTab("Menu")} />}
                {tab === "Packages" && (
                  <div className="space-y-4">
                    <ExplorePackagesView 
                      lang={lang} 
                      onBookNow={(pkgItem) => {
                        setCheckoutModalItem({
                          id: pkgItem.id,
                          title: pkgItem.title,
                          vertical: 'package',
                          subtitle: `${pkgItem.durationDays || 3}D/${pkgItem.durationNights || 2}N • ${pkgItem.destination}`,
                          location: pkgItem.destination,
                          amount: pkgItem.price,
                          image: pkgItem.image,
                          provider: pkgItem.agentName || 'Verified Tour Partner',
                          meta: { rating: pkgItem.rating || 4.8, reviews: pkgItem.reviewsCount || 100 }
                        });
                      }}
                      onBack={() => setTab("Menu")}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </TabDashboardLayout>
      </div>

      {checkoutModalItem && (
        <BookingFlowProvider>
          <BookingFlowModal
            isOpen={true}
            onClose={() => setCheckoutModalItem(null)}
            item={checkoutModalItem}
            currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || "₹"}
            lang={lang}
            onBookingSuccess={(receipt) => {
              showToast(`🎉 Booking verified: ${receipt.bookingId || receipt.pnr}`);
            }}
          />
        </BookingFlowProvider>
      )}

      {/* Admin / Agent Coupon & Ad Upload Modal */}
      {isAddCouponModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-left space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {isMr ? "कूपन किंवा जाहिरात जोडा (ॲडमिन / एजंट)" : "Upload Coupon / Ad (Admin/Agent)"}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500">
                    {isMr ? "मंजूर कूपन कोड त्वरित बुकिंग मेनूवर दिसेल" : "Approved promo codes will instantly show on Booking Menu"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCouponModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCouponSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isMr ? "कूपन कोड *" : "Coupon Code *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON500"
                  value={newCouponForm.code}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-mono font-bold focus:bg-white focus:border-indigo-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isMr ? "शीर्षक / डील नाव *" : "Offer Title / Headline *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isMr ? "उदा. कोकण प्रवास विशेष सवलत" : "e.g. Special Domestic Flight Discount"}
                  value={newCouponForm.title}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isMr ? "सवलत बॅज" : "Discount Badge"}
                  </label>
                  <input
                    type="text"
                    placeholder="FLAT ₹500 OFF"
                    value={newCouponForm.discountBadge}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, discountBadge: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isMr ? "वर्ग" : "Category"}
                  </label>
                  <select
                    value={newCouponForm.category}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="All">All Services</option>
                    <option value="Flights">Flights</option>
                    <option value="Hotels">Hotels</option>
                    <option value="Trains">Trains</option>
                    <option value="Bus">Bus</option>
                    <option value="Cars">Cabs</option>
                    <option value="Packages">Packages</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isMr ? "वर्णन / अटी" : "Description / Subtitle"}
                </label>
                <input
                  type="text"
                  placeholder={isMr ? "उदा. सर्व बुकिंगवर रु. ५०० सवलत मिळवा" : "e.g. Applicable on min booking of ₹2,500"}
                  value={newCouponForm.subtitle}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isMr ? "वैधता" : "Valid Till"}
                  </label>
                  <input
                    type="text"
                    placeholder="31 Dec 2026"
                    value={newCouponForm.validTill}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, validTill: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isMr ? "अपलोडकर्ता" : "Creator Badge"}
                  </label>
                  <select
                    value={newCouponForm.createdBy}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, createdBy: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Admin Approved">Admin Approved</option>
                    <option value="Verified Agent">Verified Agent</option>
                    <option value="Partner Deal">Partner Deal</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {isMr ? "रद्द करा" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCoupon}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCoupon 
                    ? (isMr ? "अपलोड होत आहे..." : "Uploading...") 
                    : (isMr ? "कूपन मंजूर व प्रकाशित करा" : "Approve & Publish Coupon")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}


