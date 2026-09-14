import React, { useState } from "react";
import { 
  Search, Plane, Hotel, Train, Bus, Car, Package, Plus, 
  MapPin, Calendar, Users, Trash2, Share2, ShieldCheck, Copy, Check, 
  AlertTriangle, X, CreditCard, ArrowRight, ArrowLeft, Siren
} from "lucide-react";
import { useTripContext } from "../../context/TripContext";
import { useLanguage } from "../../context/LanguageContext";

export function AllTripsScreen({ hideHeader,  
  onBack, 
  setActive,
  onLogout,
  onSOS
}: { 
  hideHeader?: boolean,
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

  // Map destination categories to scenic, high-quality images
  const getDestinationPhoto = (destination?: string) => {
    const d = (destination || "").toLowerCase();
    if (d.includes("goa") || d.includes("beach") || d.includes("sea") || d.includes("alibag") || d.includes("konkan")) {
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"; // Beach
    }
    if (d.includes("mountain") || d.includes("shimla") || d.includes("manali") || d.includes("himalaya") || d.includes("hill") || d.includes("mahabaleshwar") || d.includes("lonavala")) {
      return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"; // Mountains
    }
    if (d.includes("desert") || d.includes("rajasthan") || d.includes("jaipur") || d.includes("jaisalmer") || d.includes("fort")) {
      return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80"; // Desert
    }
    if (d.includes("city") || d.includes("mumbai") || d.includes("delhi") || d.includes("pune") || d.includes("bangalore")) {
      return "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80"; // City
    }
    return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80";
  };

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
      ? `🚩 माझ्यासोबत '${trip.name}' प्रवासाचे हिशोब मॅनेज करा!\n🔐 सिक्युरिटी कोड: #${code}\n👉 RoutTripo ॲपमध्ये हा कोड वापरून तुम्ही खर्च पाहू व टाकू शकता.`
      : `🌍 Manage trip expenses with me for '${trip.name}'!\n🔐 Security Code: #${code}\n👉 Enter this secure code in RoutTripo app to view & add expenses.`;
    
    navigator.clipboard.writeText(shareMessage);
    setCopiedTripId(trip.id);
    setTimeout(() => setCopiedTripId(null), 2000);
  };

  return (
    <div className="premium-root min-h-screen bg-[var(--premium-page)] pb-28">
      {/* Luxury Sky-to-Indigo Header */}
      <header className="sticky top-0 z-30 premium-gradient text-white shadow-[0_8px_20px_-8px_rgba(2,132,199,0.5)]">
        <div className="max-w-[520px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border border-white/20 shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  {isMr ? "सहली व्यवस्थापन" : "Trip Vault"}
                </span>
              </div>
              <h1 className="text-base font-black text-white leading-tight mt-0.5">
                {isMr ? "माझ्या सर्व सहली" : "My Trips & Itineraries"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onSOS && (
              <button
                type="button"
                onClick={onSOS}
                className="w-8 h-8 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white flex items-center justify-center transition-all cursor-pointer border border-white/30 shadow-xs"
              >
                <Siren className="w-4 h-4 text-white animate-pulse" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto px-2 pt-2 space-y-2">
        {/* Quick Action Bento Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActive('smart-planner')}
            className="group relative overflow-hidden premium-card p-4 bg-white border border-slate-200 text-slate-800 shadow-sm text-left hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-[20px] bg-slate-50 flex items-center justify-center mb-3 text-premium-pink border border-slate-100">
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">
              {isMr ? "AI स्मार्ट प्लॅनर" : "AI Smart Planner"}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isMr ? "सहल त्वरित तयार करा" : "Auto generate itinerary"}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActive('new-trip')}
            className="group relative overflow-hidden premium-card p-4 bg-white border border-slate-200 text-slate-800 shadow-sm text-left hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-[20px] bg-slate-50 flex items-center justify-center mb-3 text-sky-600 border border-slate-100">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">
              {isMr ? "नवीन सहल जोडा" : "Create New Trip"}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isMr ? "मॅन्युअल प्लॅनिंग" : "Custom trip setup"}
            </p>
          </button>
        </div>

        {/* Search Filter Bar */}
        <div className="premium-card p-3 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-premium-violet shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isMr ? "नाव किंवा शहर शोधा..." : "Search trip by name or city..."}
            className="w-full text-sm font-bold text-slate-800 placeholder-slate-400 outline-none bg-transparent"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Active Trips Header */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            {isMr ? `सर्व सहली (${filteredTrips.length})` : `Saved Trips (${filteredTrips.length})`}
          </span>
          <button 
            type="button"
            onClick={() => setActive('planning')} 
            className="text-xs font-bold text-premium-violet hover:text-premium-violet flex items-center gap-1"
          >
            {isMr ? "सक्रिय वर्कस्पेस →" : "Active Workspace →"}
          </button>
        </div>

        {/* Trips List */}
        <div className="space-y-2">
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
                className="premium-card overflow-hidden cursor-pointer active:scale-[0.99] transition-transform group flex flex-col"
              >
                {/* Photo Banner Component */}
                <div className="h-32 w-full relative overflow-hidden shrink-0">
                  <img 
                    src={photoUrl} 
                    alt={t.destination || t.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
                  
                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-md border ${
                      t.status === 'COMPLETED' || t.status === 'SETTLED'
                        ? 'bg-slate-900/70 text-slate-200 border-slate-600/50'
                        : t.status === 'ACTIVE'
                        ? 'bg-premium-sky-deep/90 text-white border-premium-sky-deep/50'
                        : 'bg-[var(--premium-violet)]/90 text-white border-premium-violet/50'
                    }`}>
                      {isMr 
                        ? (t.status === 'COMPLETED' || t.status === 'SETTLED' ? 'पूर्ण' : t.status === 'ACTIVE' ? 'चालू' : 'नियोजित') 
                        : (t.status || 'PLANNED')
                      }
                    </span>
                  </div>

                  {/* Floating Action Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleShareClick(e, t)}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-md text-premium-violet hover:bg-white active:scale-90 transition-all shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] cursor-pointer border border-white/40"
                      title={isMr ? "कोडद्वारे शेअर करा" : "Share via Code"}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, t)}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-md text-rose-600 hover:bg-white active:scale-90 transition-all shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] cursor-pointer border border-white/40"
                      title={isMr ? "ट्रिप काढा" : "Delete Trip"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Destination overlay */}
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between">
                    <div className="flex items-center gap-1.5 text-white text-xs font-bold">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{t.destination || "Scenic Destination"}</span>
                    </div>
                  </div>
                </div>

                {/* Trip Details Section */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-black text-slate-900 text-base leading-none group-hover:text-premium-violet transition-colors">
                      {t.name}
                    </h3>

                    {/* Info Pills */}
                    <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold mt-0 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-premium-violet shrink-0" />
                        {formatDateRange(t.startDate, t.endDate)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        {friendsCount} {isMr ? "मित्र" : "Travelers"}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-slate-400 font-bold">
                        {daysCount} {isMr ? "दिवस" : "Days"}
                      </span>
                    </div>
                  </div>

                  {/* Budget & Expense bar */}
                  <div className="bg-slate-50 rounded-[20px] p-3 border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-premium-sky-deep" />
                        {isMr ? "झालेला खर्च:" : "Spent:"} <span className={isOverBudget ? "text-rose-600 font-black" : "text-slate-900 font-black"}>₹{totalSpent.toLocaleString()}</span>
                      </span>
                      <span>
                        {isMr ? "बजेट:" : "Budget:"} <span className="text-slate-900 font-black">₹{budget.toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget 
                            ? "bg-rose-500" 
                            : percentSpent > 85 
                            ? "bg-[var(--premium-pink)]" 
                            : "premium-gradient"
                        }`}
                        style={{ width: `${percentSpent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 mt-1 uppercase">
                      <span>{percentSpent}% {isMr ? "वापरले" : "used"}</span>
                      {isOverBudget && (
                        <span className="text-rose-600 font-black animate-pulse">
                          ⚠️ {isMr ? "बजेट संपले!" : "LIMIT EXCEEDED!"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-premium-violet flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isMr ? "सुरक्षित प्रवास हिशोब" : "Secure Travel Vault"}
                    </span>
                    <span className="text-xs font-black text-premium-violet flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      {isMr ? "पहा" : "Open Trip"} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTrips.length === 0 && (
            <div className="text-center py-12 premium-card border border-slate-200 shadow-sm p-6">
              <p className="text-slate-700 font-bold text-sm">
                {isMr ? "कोणतीही सहल सापडली नाही" : "No saved trips found"}
              </p>
              <button
                type="button"
                onClick={() => setActive('smart-planner')}
                className="mt-3 px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 text-xs font-bold rounded-full shadow-sm hover:bg-slate-50 transition-colors"
              >
                {isMr ? "AI द्वारे नवीन सहल प्लॅन करा" : "Plan with AI Smart Planner"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SHARE MODAL */}
      {sharingTrip && (
        <div className="fixed inset-0 z-[3000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-sm border border-slate-200 shadow-2xl p-5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSharingTrip(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-2">
              <div className="w-12 h-12 rounded-full bg-premium-violet-soft flex items-center justify-center mx-auto mb-3 border border-premium-violet">
                <ShieldCheck className="w-6 h-6 text-premium-violet animate-pulse" />
              </div>
              <h3 className="font-black text-slate-800 text-base">
                {isMr ? "🔒 सुरक्षित ट्रिप कोड" : "🔒 Secure Trip Code"}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {sharingTrip.name}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-[20px] p-3.5 my-4 text-center">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                {isMr ? "एनक्रिप्शन कोड" : "ENCRYPTION PASSCODE"}
              </span>
              <span className="font-mono font-black text-slate-950 text-lg tracking-widest select-all">
                {`RT-EXP-${sharingTrip.id.replace("trip-", "").substring(0, 6).toUpperCase()}`}
              </span>
            </div>

            <button
              onClick={() => handleCopyCode(sharingTrip)}
              className={`w-full py-3 rounded-[20px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer ${
                copiedTripId === sharingTrip.id 
                  ? "bg-premium-sky-deep hover:bg-[var(--premium-sky-deep)] text-white" 
                  : "premium-gradient text-white"
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
          <div className="premium-card w-full max-w-xs border border-slate-200 shadow-2xl p-5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>

            <h3 className="font-black text-slate-800 text-sm">
              {isMr ? "नक्की डिलीट करायची?" : "Confirm Trip Deletion?"}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-2 px-1">
              {isMr 
                ? `तुम्हाला '${deletingTrip.name}' सहल डिलीट करायची आहे का?` 
                : `Are you sure you want to permanently delete '${deletingTrip.name}'?`
              }
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-1">
              <button
                onClick={() => setDeletingTrip(null)}
                className="py-2.5 rounded-[20px] border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {isMr ? "रद्द करा" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2.5 rounded-[20px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
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

