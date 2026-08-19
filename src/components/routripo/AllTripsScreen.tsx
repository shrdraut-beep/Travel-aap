import React, { useState } from "react";
import { 
  Search, Compass, Plane, Hotel, Train, Bus, Car, Package, Plus, Sparkles, 
  MapPin, Calendar, Users, Trash2, Share2, ShieldCheck, Copy, Check, 
  AlertTriangle, X, CreditCard, ArrowRight 
} from "lucide-react";
import { TopBar, SectionTitle, LogoName } from "./SharedUI";
import { useTripContext } from "../../context/TripContext";
import { TabDashboardLayout } from "./TabDashboardLayout";
import { useLanguage } from "../../context/LanguageContext";

export function AllTripsScreen({ 
  onBack, 
  setActive,
  onLogout,
  onSOS
}: { 
  onBack?: () => void, 
  setActive: (tab: string, subTab?: string) => void,
  onLogout: () => void,
  onSOS: () => void
}) {
  const { trips, selectTripById, deleteTrip } = useTripContext();
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  const [searchQuery, setSearchQuery] = useState("");
  const [sharingTrip, setSharingTrip] = useState<any | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<any | null>(null);
  const [copiedTripId, setCopiedTripId] = useState<string | null>(null);

  const filteredTrips = trips.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.startDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bookingServices = [
    { icon: Plane, label: "Flights", category: "Flights", color: "from-blue-500 to-indigo-600" },
    { icon: Hotel, label: "Hotels", category: "Hotels", color: "from-amber-500 to-orange-600" },
    { icon: Train, label: "Trains", category: "Trains", color: "from-rose-500 to-red-600" },
    { icon: Bus, label: "Bus", category: "Bus", color: "from-emerald-500 to-teal-600" },
    { icon: Car, label: "Car & Cabs", category: "Cars", color: "from-orange-500 to-amber-600" },
    { icon: Package, label: "Holiday Pkgs", category: "Packages", color: "from-purple-500 to-pink-600" }
  ];

  // Map destination categories to scenic, high-quality, lightweight images
  const getDestinationPhoto = (destination?: string) => {
    const d = (destination || "").toLowerCase();
    if (d.includes("goa") || d.includes("beach") || d.includes("sea") || d.includes("alibag") || d.includes("konkan")) {
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"; // Beach
    }
    if (d.includes("mountain") || d.includes("shimla") || d.includes("manali") || d.includes("himalaya") || d.includes("hill") || d.includes("mahabaleshwar") || d.includes("lonavala")) {
      return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"; // Mountains/Hills
    }
    if (d.includes("desert") || d.includes("rajasthan") || d.includes("jaipur") || d.includes("jaisalmer") || d.includes("fort")) {
      return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80"; // Desert/Fort
    }
    if (d.includes("city") || d.includes("mumbai") || d.includes("delhi") || d.includes("pune") || d.includes("bangalore")) {
      return "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80"; // City
    }
    // Beautiful default highway/roadtrip scenic photo
    return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80";
  };

  // Calculate days between two ISO dates
  const calculateDays = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = Math.abs(e.getTime() - s.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diffDays) ? 1 : diffDays;
    } catch {
      return 1;
    }
  };

  // Format date range beautifully
  const formatDateRange = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const optStart: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
      const optEnd: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
      return `${s.toLocaleDateString(isMr ? "mr-IN" : "en-US", optStart)} - ${e.toLocaleDateString(isMr ? "mr-IN" : "en-US", optEnd)}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  const handleShareClick = (e: React.MouseEvent, trip: any) => {
    e.stopPropagation();
    setSharingTrip(trip);
  };

  const handleDeleteClick = (e: React.MouseEvent, trip: any) => {
    e.stopPropagation();
    setDeletingTrip(trip);
  };

  const handleConfirmDelete = () => {
    if (deletingTrip) {
      deleteTrip(deletingTrip.id);
      setDeletingTrip(null);
    }
  };

  const handleCopyCode = (trip: any) => {
    const code = `RT-EXP-${trip.id.replace("trip-", "").substring(0, 6).toUpperCase()}`;
    const shareMessage = isMr
      ? `🚩 माझ्यासोबत '${trip.name}' प्रवासाचे हिशोब मॅनेज करा!\n🔐 सिक्युरिटी कोड: #${code}\n👉 RouTriPo ॲपमध्ये हा कोड वापरून तुम्ही खर्च पाहू व टाकू शकता (एडिट/डिलीट करू शकत नाही).`
      : `🌍 Manage trip expenses with me for '${trip.name}'!\n🔐 Security Code: #${code}\n👉 Enter this secure code in RouTriPo app to view & add expenses (no edit/delete access).`;
    
    navigator.clipboard.writeText(shareMessage);
    setCopiedTripId(trip.id);
    setTimeout(() => setCopiedTripId(null), 2000);
  };

  return (
    <div className="h-full overflow-y-auto pb-28 bg-slate-50 relative">
      <TopBar 
        title={<LogoName />} 
        sub={isMr ? "सर्व सहली आणि नियोजन" : "All Trips & Explore"} 
        scrolled={false} 
        onLogout={onLogout} 
        onSOS={onSOS} 
        onOpenSettings={() => setActive('settings')}
      />

      <div className="px-5 mt-2 mb-2 flex items-center justify-between">
        <button 
          type="button"
          onClick={() => setActive('planning')} 
          className="text-xs font-bold text-rose-600 cursor-pointer flex items-center gap-1 hover:underline"
        >
          {isMr ? "सक्रिय ट्रिप वर्कस्पेस वर जा →" : "Go to Active Trip Workspace →"}
        </button>
      </div>

      <TabDashboardLayout
        cards={[
          {
            title: isMr ? "नवीन ट्रिप" : "NEW TRIP",
            subtitle: isMr ? "सहलीचे नियोजन करा" : "Start a new trip",
            icon: Plus,
            iconColor: "text-white",
            gradient: "from-rose-500 via-rose-600 to-pink-600 border border-rose-400/30 shadow-rose-200/60",
            subtitleColorClass: "text-rose-100",
            onClick: () => setActive('new-trip')
          },
          {
            title: isMr ? "स्मार्ट प्लॅनर" : "SMART PLANNER",
            subtitle: isMr ? "AI ट्रिप जनरेटर" : "AI trip generator",
            icon: Sparkles,
            iconColor: "text-amber-300",
            gradient: "from-indigo-600 via-indigo-700 to-purple-700 border border-indigo-400/30 shadow-indigo-200/60",
            subtitleColorClass: "text-indigo-100",
            onClick: () => setActive('smart-planner')
          }
        ]}
        gridTitle={isMr ? "प्रवास सेवा बुक करा" : "Book Travel Services"}
        gridIcon={Compass}
        gridItems={bookingServices.map(b => ({
          label: isMr ? (b.category === "Flights" ? "विमान" : b.category === "Hotels" ? "हॉटेल" : b.category === "Trains" ? "ट्रेन" : b.category === "Bus" ? "बस" : b.category === "Cars" ? "टॅक्सी" : "पॅकेज") : b.label,
          icon: b.icon,
          color: b.color,
          onClick: () => setActive("booking", b.category)
        }))}
      >
        <div className="space-y-4">
          {/* Featured Destinations & Travely Deals Showcase */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-black text-sm text-white tracking-tight">
                    {isMr ? "लोकप्रिय सहली व वीकेंड डील्स" : "Trending Holiday Packages"}
                  </h3>
                  <p className="text-[10px] font-bold text-indigo-300">
                    {isMr ? "पडताळलेले टूर्स आणि झटपट तिकीट बुकिंग" : "Verified operators with instant e-passes"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActive("booking", "Packages")}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <span>{isMr ? "सर्व पहा" : "View All"}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: isMr ? "रत्नागिरी बीच" : "Ratnagiri Beach", days: "3D/2N", price: "₹3,800", img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80", rating: "4.8" },
                { name: isMr ? "गोवा कोस्टल" : "Goa Escapade", days: "4D/3N", price: "₹8,900", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80", rating: "4.9" },
                { name: isMr ? "महाबळेश्वर हिल्स" : "Mahabaleshwar", days: "3D/2N", price: "₹5,500", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", rating: "4.7" },
                { name: isMr ? "शिर्डी दर्शन" : "Shirdi Darshan", days: "2D/1N", price: "₹2,500", img: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=400&q=80", rating: "4.9" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActive("booking", "Packages")}
                  className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-2 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group"
                >
                  <div className="h-16 rounded-xl overflow-hidden relative mb-1.5">
                    <img src={item.img} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <span className="absolute top-1 right-1 bg-slate-950/70 backdrop-blur-xs text-amber-300 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      ★ {item.rating}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white truncate">{item.name}</h4>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="text-slate-300 font-bold">{item.days}</span>
                      <span className="text-amber-400 font-black">{item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SectionTitle icon={Search}>{isMr ? "शोध सहली" : "Search Trips"}</SectionTitle>
          <div className="bg-white rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-sm border border-slate-200">
            <Search className="w-4 h-4 text-red-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isMr ? "जुने आणि चालू प्रवास शोधा..." : "Search old & current trips..."}
              className="w-full text-sm font-extrabold text-slate-900 placeholder-slate-400 outline-none bg-transparent"
            />
          </div>

          {/* TRIPS LIST */}
          <div className="space-y-4">
            {filteredTrips.map((t) => {
              const daysCount = calculateDays(t.startDate, t.endDate);
              const friendsCount = t.members?.length || 0;
              const totalSpent = t.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
              const budget = t.totalBudget || 0;
              const percentSpent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
              const isOverBudget = totalSpent > budget;

              const photoUrl = getDestinationPhoto(t.destination || t.name);

              return (
                <div 
                  key={t.id} 
                  onClick={() => {
                    selectTripById(t.id);
                    setActive('planning');
                  }}
                  className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all active:scale-[0.99] group flex flex-col"
                >
                  {/* Photo Banner Component */}
                  <div className="h-28 w-full relative overflow-hidden shrink-0">
                    <img 
                      src={photoUrl} 
                      alt={t.destination || t.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
                    
                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md backdrop-blur-md border ${
                        t.status === 'COMPLETED' || t.status === 'SETTLED'
                          ? 'bg-slate-900/60 text-slate-300 border-slate-500/30'
                          : t.status === 'ACTIVE'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : 'bg-indigo-950/60 text-indigo-400 border-indigo-500/30'
                      }`}>
                        {isMr 
                          ? (t.status === 'COMPLETED' || t.status === 'SETTLED' ? 'पूर्ण' : t.status === 'ACTIVE' ? 'सुरू' : 'नियोजित') 
                          : (t.status || 'PLANNED')
                        }
                      </span>
                    </div>

                    {/* Floating Delete & Share Action Buttons inside photo */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleShareClick(e, t)}
                        className="p-1.5 rounded-lg bg-white/90 backdrop-blur-md text-indigo-600 hover:bg-white active:scale-90 transition-all shadow-xs cursor-pointer border border-slate-200"
                        title={isMr ? "कोडद्वारे शेअर करा" : "Share via Code"}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, t)}
                        className="p-1.5 rounded-lg bg-white/90 backdrop-blur-md text-rose-600 hover:bg-white active:scale-90 transition-all shadow-xs cursor-pointer border border-slate-200"
                        title={isMr ? "ट्रिप काढा" : "Delete Trip"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Destination name Overlay on Photo */}
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-white/90 text-[10px] font-semibold uppercase tracking-wider">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="truncate">{t.destination || "Scenic Destination"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details Section */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                        {t.name}
                      </h3>

                      {/* Info Pills Row */}
                      <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          {formatDateRange(t.startDate, t.endDate)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          {daysCount} {isMr ? "दिवस" : "Days"}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                          {friendsCount} {isMr ? "मित्र" : "Friends"}
                        </span>
                      </div>
                    </div>

                    {/* Expenses & Budget Progress Visual */}
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 mt-1">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-emerald-500" />
                          {isMr ? "झालेला खर्च:" : "Actual Spent:"} <span className={isOverBudget ? "text-rose-600 font-extrabold" : "text-slate-800 font-extrabold"}>₹{totalSpent.toLocaleString()}</span>
                        </span>
                        <span>
                          {isMr ? "बजेट:" : "Budget:"} <span className="text-slate-800">₹{budget.toLocaleString()}</span>
                        </span>
                      </div>

                      {/* Modern progress bar */}
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverBudget 
                              ? "bg-rose-500" 
                              : percentSpent > 85 
                              ? "bg-amber-500" 
                              : "bg-gradient-to-r from-emerald-500 to-teal-500"
                          }`}
                          style={{ width: `${percentSpent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 mt-1 uppercase">
                        <span>{percentSpent}% {isMr ? "वापरले" : "used"}</span>
                        {isOverBudget && (
                          <span className="text-rose-500 font-black tracking-wider animate-pulse">
                            ⚠️ {isMr ? "बजेट संपले!" : "LIMIT EXCEEDED!"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Access level helper pill */}
                    <div className="mt-3 flex items-center justify-between pt-1 border-t border-dashed border-slate-100">
                      <span className="text-[9px] font-extrabold text-indigo-600 uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {isMr ? "सह-सदस्य: फक्त पहा आणि खर्च टाका" : "Members: View & Add Expense Only"}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 flex items-center gap-0.5 group-hover:text-indigo-600 transition-all">
                        {isMr ? "प्रवेश" : "Enter"} <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTrips.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <span className="text-slate-400 text-sm font-semibold">{isMr ? "कोणतीही ट्रिप सापडली नाही." : "No trips found."}</span>
              </div>
            )}
          </div>
        </div>
      </TabDashboardLayout>

      {/* SHARE (ENCRYPTION CODE) MODAL */}
      {sharingTrip && (
        <div className="fixed inset-0 z-[3000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm border border-slate-200 shadow-2xl p-5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSharingTrip(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-2">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3 border border-indigo-100">
                <ShieldCheck className="w-6 h-6 text-indigo-600 animate-pulse" />
              </div>
              <h3 className="font-black text-slate-800 text-base">
                {isMr ? "🔒 सुरक्षित ट्रिप कोड" : "🔒 Secure Trip Code"}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {sharingTrip.name}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 my-4 text-center">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                {isMr ? "एनक्रिप्शन कोड" : "ENCRYPTION PASSCODE"}
              </span>
              <span className="font-mono font-black text-slate-950 text-lg tracking-widest select-all">
                {`RT-EXP-${sharingTrip.id.replace("trip-", "").substring(0, 6).toUpperCase()}`}
              </span>
            </div>

            {/* Warning regarding access control requested by user */}
            <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100 text-[10.5px] text-indigo-950 flex gap-2 mb-4 text-left leading-relaxed">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-indigo-900 block uppercase tracking-wider mb-0.5">
                  {isMr ? "सुरक्षित प्रवेश हमी" : "Secure Access Guarantee"}
                </span>
                {isMr 
                  ? "या एनक्रिप्शन कोडद्वारे ट्रिपमधील इतर सदस्य खर्च पाहू व भरू शकतील. पण ते मूळ ट्रिप माहिती किंवा कोणाचाही खर्च एडिट/डिलीट करू शकत नाहीत." 
                  : "Using this encryption code, shared members can view and add expenses securely. They are strictly restricted from editing or deleting any trip details."
                }
              </div>
            </div>

            <button
              onClick={() => handleCopyCode(sharingTrip)}
              className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer ${
                copiedTripId === sharingTrip.id 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {copiedTripId === sharingTrip.id ? (
                <>
                  <Check className="w-4 h-4" />
                  {isMr ? "कोड कॉपी झाला!" : "INVITE COPIED!"}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {isMr ? "आमंत्रण कोड कॉपी करा" : "COPY INVITE CODE"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingTrip && (
        <div className="fixed inset-0 z-[3000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs border border-slate-200 shadow-2xl p-5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>

            <h3 className="font-black text-slate-800 text-sm">
              {isMr ? "नक्की डिलीट करायची?" : "Confirm Trip Deletion?"}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-2 px-1">
              {isMr 
                ? `तुम्हाला '${deletingTrip.name}' सहल डिलीट करायची आहे का? त्यातील सर्व खर्च व इतिहास कायमचा निघून जाईल.` 
                : `Are you sure you want to permanently delete '${deletingTrip.name}'? This action is irreversible.`
              }
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-1">
              <button
                onClick={() => setDeletingTrip(null)}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {isMr ? "रद्द करा" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {isMr ? "डिलीट" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
