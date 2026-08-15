import React, { useRef, useState } from "react";
import { TopBar, useScrolled, LogoName } from "./SharedUI";
import { 
  Languages, 
  Coins, 
  Bell, 
  Smartphone, 
  Siren, 
  Share2, 
  MessageSquare, 
  Mail, 
  ShieldCheck, 
  Info, 
  LogOut, 
  UserX, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Star, 
  Check, 
  AlertTriangle, 
  Loader2,
  Send,
  Download,
  Settings as SettingsIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { useTripContext } from "../../context/TripContext";
import { useAuthStore } from "../../store/useAuthStore";
import { signOutUser, deleteUserAccountAndData } from "../../firebase";
import { enablePushNotifications } from "../../utils/push";
import { shareAppOnWhatsApp } from "../../utils/shareUtils";
import { LanguageOnboardingModal } from "../modals/LanguageOnboardingModal";
import { PrivacyAndCreditsModal } from "../modals/PrivacyAndCreditsModal";

interface SettingsScreenProps {
  onLogout: () => void;
  setActive?: (tab: string, subTab?: string) => void;
  onSOS?: () => void;
}

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English (Nawab Mode 🎩)" },
  { code: "mr", label: "Marathi (Local Mode 🚩)" },
  { code: "hi", label: "Hindi (Bhaigiri Mode 💪)" },
  { code: "gu", label: "ગુજરાતી (Bapu Mode 👓)" },
  { code: "ta", label: "தமிழ் (Thalaiva Mode 🕶️)" },
  { code: "te", label: "తెలుగు (Mass Mode ⚡)" },
  { code: "kn", label: "ಕನ್ನಡ (Boss Mode 👑)" },
  { code: "bn", label: "বাংলা (Roshogolla Mode 🍯)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Swagger Mode 👳)" },
  { code: "ml", label: "മലയാളം (Mallu Mode 🌴)" },
  { code: "es", label: "Español (Amigo Mode 🌮)" },
  { code: "fr", label: "Français (Oui Oui Mode 🥖)" },
  { code: "de", label: "Deutsch (Pro Mode 🍺)" },
  { code: "ja", label: "日本語 (Anime Mode 𥥷)" },
];

const CURRENCY_OPTIONS = [
  { code: "INR", label: "₹ INR (Indian Rupee)" },
  { code: "USD", label: "$ USD (US Dollar)" },
  { code: "EUR", label: "€ EUR (Euro)" },
  { code: "GBP", label: "£ GBP (British Pound)" },
  { code: "AED", label: "د.إ AED (UAE Dirham)" },
  { code: "AUD", label: "A$ AUD (Australian Dollar)" },
];

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? "bg-indigo-600" : "bg-slate-300"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

export function SettingsScreen({ onLogout, setActive, onSOS }: SettingsScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(scrollRef);
  const { lang, setLang, t } = useLanguage();
  const { activeTrip } = useTripContext();
  const { currentUser, logout } = useAuthStore();

  // Settings State
  const [currency, setCurrency] = useState(() => localStorage.getItem("routripo_currency") || "INR");

  // Notification Preferences
  const [budgetAlerts, setBudgetAlerts] = useState(() => localStorage.getItem("pref_budget_alerts") !== "false");
  const [pushNotifications, setPushNotifications] = useState(() => localStorage.getItem("pref_push_notifications") !== "false");
  const [sosAlerts, setSosAlerts] = useState(() => localStorage.getItem("pref_sos_alerts") !== "false");

  // Modals
  const [showVibeModal, setShowVibeModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form & Execution state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Handlers
  const handleCurrencyChange = (val: string) => {
    setCurrency(val);
    localStorage.setItem("routripo_currency", val);
  };

  const handleToggleBudgetAlerts = (val: boolean) => {
    setBudgetAlerts(val);
    localStorage.setItem("pref_budget_alerts", String(val));
  };

  const handleTogglePushNotifications = async (val: boolean) => {
    setPushNotifications(val);
    localStorage.setItem("pref_push_notifications", String(val));
    if (val) {
      await enablePushNotifications(currentUser?.id);
    }
  };

  const handleToggleSosAlerts = (val: boolean) => {
    setSosAlerts(val);
    localStorage.setItem("pref_sos_alerts", String(val));
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: feedbackRating, feedback: feedbackText, tripName: activeTrip.name })
    }).catch(err => console.log("Feedback log:", err));

    setFeedbackSubmitted(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSubmitted(false);
      setFeedbackText("");
    }, 2000);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await signOutUser();
      logout();
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      onLogout();
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      await deleteUserAccountAndData(currentUser?.id);
      logout();
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
      onLogout();
    } catch (err: any) {
      console.error("Account deletion error:", err);
      setIsDeletingAccount(false);
      if (err?.message === "REAUTH_REQUIRED") {
        setDeleteError(
          "For security reasons, please re-authenticate before deleting your account."
        );
      } else {
        setDeleteError(
          "Failed to delete account. Please try again."
        );
      }
    }
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-32 bg-slate-50 font-[Inter]">
      {/* Top Navigation Bar */}
      <TopBar 
        title={<LogoName />} 
        scrolled={scrolled} 
        onLogout={onLogout} 
        onSOS={onSOS || (() => alert("SOS Triggered!"))} 
      />

      {/* Settings Sub-Header with Back Button */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={() => setActive ? setActive("hub") : null}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3]" />
          <span>BACK</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-[Poppins]">Settings</h1>
        </div>
      </div>

      <div className="px-5 space-y-6 mt-3 max-w-2xl mx-auto">
        {/* 1. LANGUAGE & REGIONAL */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-indigo-600">
            1. LANGUAGE & REGIONAL
          </h2>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
            {/* App Language */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Languages className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">App Language</span>
                </div>

                <button
                  onClick={() => setShowVibeModal(true)}
                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Change Vibe
                </button>
              </div>

              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-[1px] bg-slate-100" />

            {/* Currency */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Currency</span>
              </div>

              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. NOTIFICATIONS & ALERTS */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-indigo-600">
            2. NOTIFICATIONS & ALERTS
          </h2>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
            {/* Budget Alerts */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Budget & Overflow Alerts</p>
                  <p className="text-[10px] text-slate-500 font-medium">Notify when expenses exceed planned trip budget</p>
                </div>
              </div>
              <ToggleSwitch checked={budgetAlerts} onChange={handleToggleBudgetAlerts} />
            </div>

            <div className="h-[1px] bg-slate-100" />

            {/* Push Notifications */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Push Notifications</p>
                  <p className="text-[10px] text-slate-500 font-medium">Get instant alerts when members add new expenses</p>
                </div>
              </div>
              <ToggleSwitch checked={pushNotifications} onChange={handleTogglePushNotifications} />
            </div>

            <div className="h-[1px] bg-slate-100" />

            {/* SOS Alerts */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Siren className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Emergency & SOS Alerts</p>
                  <p className="text-[10px] text-slate-500 font-medium">Receive instant location broadcast if SOS is triggered</p>
                </div>
              </div>
              <ToggleSwitch checked={sosAlerts} onChange={handleToggleSosAlerts} />
            </div>
          </div>
        </div>

        {/* 3. APP ACTIONS & ABOUT */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-indigo-600">
            3. APP ACTIONS & ABOUT
          </h2>

          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200/80 divide-y divide-slate-100">
            {/* Share App on WhatsApp */}
            <div 
              onClick={() => shareAppOnWhatsApp(lang)}
              className="p-3 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">Share App on WhatsApp</p>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase rounded">
                      INSTANT
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-medium">Send app download & install link to friends on WhatsApp</p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Send Feedback */}
            <div 
              onClick={() => setShowFeedbackModal(true)}
              className="p-3 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Send Feedback</p>
                  <p className="text-[10px] text-slate-500 font-medium">Rate us and share your suggestions</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Send Feedback / Report Bug */}
            <div 
              onClick={() => setShowFeedbackModal(true)}
              className="p-3 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Send Feedback / Report Bug</p>
                  <p className="text-[10px] text-sky-600 font-semibold underline">contact@raoutripo.com</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Privacy Policy & Credits */}
            <div 
              onClick={() => setShowPrivacyModal(true)}
              className="p-3 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Privacy Policy & Credits</p>
                  <p className="text-[10px] text-slate-500 font-medium">Read privacy policy & open-source credits</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Credits & Data Sources */}
            <div className="p-3 hover:bg-slate-50 rounded-xl flex items-center justify-between transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Credits & Data Sources</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Flight data provided by <a href="https://opensky-network.org" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">The OpenSky Network</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LOGOUT / SIGN OUT Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer mt-4"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT / SIGN OUT</span>
          </button>

          {/* DELETE ACCOUNT & ALL DATA Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <UserX className="w-4 h-4" />
            <span>DELETE ACCOUNT & ALL DATA</span>
          </button>

          {/* Footer Branding Tag */}
          <div className="pt-4 text-center">
            
            <p className="text-[10px] text-slate-400 font-medium mt-1">Version 2.0 Native Android Edition</p>
          </div>
        </div>
      </div>

      {/* Language / Vibe Modal */}
      <LanguageOnboardingModal 
        isOpen={showVibeModal} 
        onClose={() => setShowVibeModal(false)} 
      />

      {/* Privacy Policy & Credits Modal */}
      <PrivacyAndCreditsModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
        lang={lang} 
      />

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
            >
              <div className="p-6 bg-slate-900 text-white relative">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
                <h3 className="text-lg font-black">Send In-App Feedback</h3>
                <p className="text-xs text-slate-300 mt-1 font-medium">How is your experience with Routripo?</p>
              </div>

              {feedbackSubmitted ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-800">Thank you for your feedback!</h4>
                  <p className="text-xs text-slate-500 font-medium">Your review helps us make the app better.</p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-5">
                  <div className="space-y-2 text-center">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">Rating</label>
                    <div className="flex justify-center items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 cursor-pointer focus:outline-none"
                        >
                          <Star className={`w-8 h-8 ${star <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">Feedback / Suggestions</label>
                    <textarea
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tell us what you loved or how we can improve..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Feedback</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100"
            >
              <div className="p-5 bg-slate-900 text-white relative">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-3">
                  <LogOut className="w-6 h-6 text-rose-300" />
                </div>
                <h3 className="text-lg font-black">Confirm Logout</h3>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">Are you sure you want to logout?</p>
              </div>

              <div className="p-5 space-y-3 text-xs text-slate-600 font-medium">
                <p>Your local session data will be cleared and you will be safely redirected to the Login screen.</p>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogoutConfirm}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-red-100"
            >
              <div className="p-5 bg-red-600 text-white relative">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeletingAccount}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center mb-2">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black">Delete Account & Data?</h3>
                <p className="text-xs text-red-100 font-medium">Google Play Store Data Safety Policy</p>
              </div>

              <div className="p-5 space-y-3 text-xs text-slate-700">
                <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-red-950">
                  <p className="font-bold">Are you sure? Your account, trips, expenses, and uploaded receipts will be permanently removed.</p>
                </div>
                {deleteError && (
                  <p className="p-2.5 bg-amber-50 text-amber-900 rounded-xl font-bold">{deleteError}</p>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeletingAccount}
                  className="flex-1 py-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccountConfirm}
                  disabled={isDeletingAccount}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
