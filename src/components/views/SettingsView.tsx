import { safeStorage } from '../../utils/storage';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Languages, 
  Coins, 
  Mail, 
  MessageSquare, 
  Star, 
  X, 
  Send, 
  Check, 
  ChevronRight, 
  Bell, 
  ShieldCheck, 
  FileText, 
  Info,
  Smartphone,
  Siren,
  Camera,
  Mic,
  MapPin,
  Lock,
  Database,
  EyeOff,
  Trash2,
  AlertTriangle,
  Loader2,
  UserX,
  LogOut,
  Download
} from 'lucide-react';
import { TripGroup } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { deleteUserAccountAndData, signOutUser, requestAndSaveFCMToken } from '../../firebase';
import { shareAppOnWhatsApp } from '../../utils/shareUtils';
import { PrivacyAndCreditsModal } from '../modals/PrivacyAndCreditsModal';

interface SettingsViewProps {
  trip: TripGroup;
  isAdmin: boolean;
  lang: string;
  setLang: (l: any) => void;
  currency: string;
  onSetCurrency: (c: string) => void;
  onUpdateTrip?: (trip: TripGroup) => void;
  onUpdateMemberAvatar?: (memberId: string, avatarUrl: string) => void;
  onShare?: () => void;
  onShareApp?: () => void;
  onDelete?: () => void;
  onLeave?: () => void;
  onExportPDF?: () => void;
  onBackToTrips: () => void;
  onOpenLanguageModal?: () => void;
  t: (key: string) => string;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; id?: string }> = ({ checked, onChange, id }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? 'bg-indigo-600' : 'bg-slate-300'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  trip, 
  lang, 
  setLang, 
  currency, 
  onSetCurrency, 
  onBackToTrips, 
  onOpenLanguageModal,
  onExportPDF,
  t 
}) => {
  // Notification Preferences
  const [budgetAlerts, setBudgetAlerts] = useState(() => {
    return localStorage.getItem('pref_budget_alerts') !== 'false';
  });

  const [pushNotifications, setPushNotifications] = useState(() => {
    return localStorage.getItem('pref_push_notifications') !== 'false';
  });

  const [sosAlerts, setSosAlerts] = useState(() => {
    return localStorage.getItem('pref_sos_alerts') !== 'false';
  });

  // Modals State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyModalTab, setPrivacyModalTab] = useState<'mr' | 'hi' | 'en'>(lang === 'mr' ? 'mr' : 'en');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const { currentUser, logout } = useAuthStore();

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      // Step 1: Firebase Auth signOut & local storage purge
      await signOutUser();

      // Step 2: Clear local auth state
      logout();

      setIsLoggingOut(false);
      setShowLogoutModal(false);

      if (onBackToTrips) {
        onBackToTrips();
      }
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      // Perform asynchronous backend deletion (Firebase Auth + Firestore documents + local cache)
      await deleteUserAccountAndData(currentUser?.id);

      // Reset local auth state and logout
      logout();
      setIsDeletingAccount(false);
      setShowDeleteAccountModal(false);

      if (onBackToTrips) {
        onBackToTrips();
      }
      window.location.reload();
    } catch (err: any) {
      console.error('Account deletion error:', err);
      setIsDeletingAccount(false);
      if (err?.message === 'REAUTH_REQUIRED') {
        setDeleteError(
          lang === 'mr'
            ? 'सुरक्षेच्या कारणास्तव, खाते हटवण्यापूर्वी पुन्हा लॉग इन करणे आवश्यक आहे.'
            : 'For security reasons, please re-authenticate before deleting your account.'
        );
      } else {
        setDeleteError(
          lang === 'mr'
            ? 'खाते हटवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
            : 'Failed to delete account. Please try again or contact support.'
        );
      }
    }
  };

  const handleToggleBudgetAlerts = (val: boolean) => {
    setBudgetAlerts(val);
    localStorage.setItem('pref_budget_alerts', String(val));
  };

  const handleTogglePushNotifications = (val: boolean) => {
    setPushNotifications(val);
    localStorage.setItem('pref_push_notifications', String(val));
    if (val && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            requestAndSaveFCMToken(currentUser?.id);
          }
        });
      } else {
        requestAndSaveFCMToken(currentUser?.id);
      }
    }
  };

  const handleToggleSosAlerts = (val: boolean) => {
    setSosAlerts(val);
    localStorage.setItem('pref_sos_alerts', String(val));
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: feedbackRating, feedback: feedbackText, tripName: trip.name })
    }).catch(err => console.log('Feedback log:', err));

    setFeedbackSubmitted(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSubmitted(false);
      setFeedbackText('');
    }, 2000);
  };

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6 max-w-3xl mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBackToTrips}
          className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-1.5 border border-indigo-500 active:scale-95 transition-all shadow-md shadow-indigo-200"
        >
          <ChevronRight className="w-4 h-4 rotate-180 text-white" />
          <span className="text-xs font-black uppercase tracking-wider">{t('back') || 'मागे'}</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {t('settings') || 'अ‍ॅप सेटिंग्ज'}
          </h2>
        </div>
      </div>

      {/* 1. Language & Regional Settings */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest px-2">
          {lang === 'mr' ? '१. भाषा व प्रादेशिक सेटिंग्ज' : '1. Language & Regional'}
        </h3>

        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm divide-y divide-slate-100">
          {/* Language Preference Card */}
          <div className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Languages className="w-5 h-5" />
              </div>
              <span className="text-sm font-extrabold text-slate-800">{lang === 'mr' ? 'ॲप भाषा' : 'App Language'}</span>
            </div>

            <div className="flex items-center gap-2">
              <select 
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 max-w-[190px] shadow-2xs"
              >
                <option value="mr">मराठी (गावठी मोड 🚩)</option>
                <option value="en">English (Nawab Mode 🎩)</option>
                <option value="hi">हिंदी (भाईगिरी मोड 💪)</option>
                <option value="gu">ગુજરાતી (Bapu Mode 👓)</option>
                <option value="ta">தமிழ் (Thalaiva Mode 🕶️)</option>
                <option value="te">తెలుగు (Mass Mode ⚡)</option>
                <option value="kn">ಕನ್ನಡ (Boss Mode 👑)</option>
                <option value="bn">বাংলা (Roshogolla Mode 🍯)</option>
                <option value="pa">ਪੰਜਾਬੀ (Swagger Mode 👳)</option>
                <option value="ml">മലയാളം (Mallu Mode 🌴)</option>
                <option value="es">Español (Amigo Mode 🌮)</option>
                <option value="fr">Français (Oui Oui Mode 🥖)</option>
                <option value="de">Deutsch (Pro Mode 🍺)</option>
                <option value="ja">日本語 (Anime Mode 🥷)</option>
              </select>

              {onOpenLanguageModal && (
                <button
                  type="button"
                  onClick={onOpenLanguageModal}
                  className="px-3 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 text-xs font-black shadow-sm transition-all shrink-0 active:scale-95"
                  title={lang === 'mr' ? 'मोड निवडा' : 'Change Vibe'}
                >
                  {lang === 'mr' ? 'मोड बदला 🚩' : 'Change Vibe'}
                </button>
              )}
            </div>
          </div>

          {/* Currency Selector */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-sm font-extrabold text-slate-800">{t('currency') || 'चलण (Currency)'}</span>
            </div>
            <select 
              value={currency}
              onChange={(e) => onSetCurrency(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="INR">₹ INR (भारतीय रुपये)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="AED">AED (Emirati Dirham)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Notifications & Alerts */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest px-2">
          {lang === 'mr' ? '२. सूचना व अलर्ट्स (Notifications)' : '2. Notifications & Alerts'}
        </h3>

        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm divide-y divide-slate-100">
          {/* Budget Alerts Switch */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-800 block">
                  {lang === 'mr' ? 'बजेट ओव्हरफ्लो अलर्ट्स' : 'Budget & Overflow Alerts'}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {lang === 'mr' ? 'हिशोब बजेटपेक्षा जास्त झाल्यास लगेच अलर्ट पाठवा' : 'Notify when expenses exceed planned trip budget'}
                </span>
              </div>
            </div>

            <ToggleSwitch checked={budgetAlerts} onChange={handleToggleBudgetAlerts} />
          </div>

          {/* Push Notifications Switch */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-800 block">
                  {lang === 'mr' ? 'पुश नोटिफिकेशन्स (Real-time Push)' : 'Push Notifications'}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {lang === 'mr' ? 'नवीन खर्च जोडल्यास किंवा मित्रांनी पेमेंट केल्यास कळवा' : 'Get instant alerts when members add new expenses'}
                </span>
              </div>
            </div>

            <ToggleSwitch checked={pushNotifications} onChange={handleTogglePushNotifications} />
          </div>

          {/* Emergency & SOS Alerts Switch */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                <Siren className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-800 block">
                  {lang === 'mr' ? 'आपत्कालीन SOS अलर्ट्स' : 'Emergency & SOS Alerts'}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {lang === 'mr' ? 'मित्रांनी SOS दाबल्यास सायरन व लोकेशन अलर्ट मिळवा' : 'Receive instant location broadcast if SOS is triggered'}
                </span>
              </div>
            </div>

            <ToggleSwitch checked={sosAlerts} onChange={handleToggleSosAlerts} />
          </div>
        </div>
      </div>

      {/* 4. About & Legal Support */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest px-2">
          {lang === 'mr' ? '४. मदत आणि अ‍ॅपबद्दल (About & Support)' : '4. About & Support'}
        </h3>

        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm divide-y divide-slate-100">
          {/* WhatsApp Share App Option */}
          <button
            type="button"
            onClick={() => shareAppOnWhatsApp(lang)}
            className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-emerald-50/90 via-teal-50/90 to-emerald-50/90 hover:bg-emerald-100/70 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.281.449-1.156 4.225 4.315-1.132.303.175z" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>{lang === 'mr' ? 'WhatsApp वर ॲप शेअर करा' : 'Share App on WhatsApp'}</span>
                  <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Instant</span>
                </span>
                <span className="text-xs font-semibold text-emerald-700 block">
                  {lang === 'mr' ? 'मित्रांना ॲप डाऊनलोड व इन्स्टॉल करण्यासाठी मेसेज पाठवा' : 'Send app download & install link to friends on WhatsApp'}
                </span>
              </div>
            </div>
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Send In-App Feedback */}
          <button 
            type="button"
            onClick={() => setShowFeedbackModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-800 block">{t('sendFeedback') || 'अभिप्राय नोंदवा'}</span>
                <span className="text-xs font-medium text-slate-500">{lang === 'mr' ? 'तुमचा अनुभव व सूचना शेअर करा' : 'Rate us and share your suggestions'}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Send Feedback / Report Bug (Mailto Direct Contact) */}
          <a 
            href="mailto:shrd.raut@gmail.com?subject=Send%20Feedback%20%2F%20Report%20Bug%20-%20Pravas%20Wataghati&body=Hi%20Developer%2C%0A%0AFeedback%2FBug%20Details%3A%0A"
            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-800 block">
                  {lang === 'mr' ? 'फीडबॅक द्या / त्रुटी नोंदवा (Send Feedback / Report Bug)' : 'Send Feedback / Report Bug'}
                </span>
                <span className="text-xs font-medium text-slate-500">shrd.raut@gmail.com</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>

          {/* Privacy Policy & Open-Source Credits */}
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-800 block">
                  {lang === 'mr' ? 'गोपनीयता आणि क्रेडिट्स (Privacy Policy & Credits)' : 'Privacy Policy & Credits'}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {lang === 'mr' ? 'डेटा सुरक्षा आणि मुक्त-स्रोत क्रेडिट्स पाहा' : 'Read privacy policy & open-source credits'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Credits & Data Sources */}
          <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-800 block">
                  {lang === 'mr' ? 'क्रेडिट्स व डेटा स्रोत' : 'Credits & Data Sources'}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {lang === 'mr' ? 'उड्डाण ट्रॅकिंग डेटा: ' : 'Flight data provided by '}
                  <a href="https://opensky-network.org" target="_blank" rel="noreferrer" className="underline hover:text-slate-800 text-blue-600">
                    The OpenSky Network
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70">
            <button
              type="button"
              id="logout-trigger-btn"
              onClick={() => setShowLogoutModal(true)}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md shadow-slate-200 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
              <span>{lang === 'mr' ? 'लॉगआउट करा (Logout)' : 'Logout / Sign Out'}</span>
            </button>
          </div>

          {/* Red Delete Account Button Section (Google Play Data Safety Compliant) */}
          <div className="p-4 border-t border-red-100 bg-red-50/60">
            <button
              type="button"
              id="delete-account-trigger-btn"
              onClick={() => {
                setDeleteError(null);
                setShowDeleteAccountModal(true);
              }}
              className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md shadow-red-200 transition-all cursor-pointer"
            >
              <UserX className="w-4 h-4 stroke-[2.5]" />
              <span>{lang === 'mr' ? 'खाते व डेटा कायमचा हटवा (Delete Account)' : 'Delete Account & All Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* App Version & Branding */}
      <div className="pt-6 pb-4 text-center space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black">
          <Info className="w-3.5 h-3.5" />
          <span>प्रवास वाटाघाटी (Pravas Wataghati)</span>
        </div>
        <p className="text-xs font-extrabold text-slate-400">
          Version 2.0.4 • Native Android Edition
        </p>
      </div>

      {/* PRIVACY POLICY & OPEN-SOURCE CREDITS MODAL */}
      <PrivacyAndCreditsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        lang={lang}
      />

      {/* IN-APP FEEDBACK REVIEW MODAL */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]"
            >
              <div className="p-6 bg-slate-900 text-white relative">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
                <h3 className="text-xl font-black">
                  {lang === 'mr' ? 'तुमचा अभिप्राय नोंदवा' : 'Send In-App Feedback'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 font-medium">
                  {lang === 'mr' ? 'प्रवास वाटाघाटी मधील तुमचा अनुभव कसा होता?' : 'How is your experience with Pravas Wataghati?'}
                </p>
              </div>

              {feedbackSubmitted ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-800">
                    {lang === 'mr' ? 'अभिप्रायाबद्दल धन्यवाद!' : 'Thank you for your feedback!'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === 'mr' ? 'तुमच्या अभिप्रायामुळे अ‍ॅप सुधारण्यास मदत होते.' : 'Your review helps us make the app better for everyone.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-5">
                  {/* Rating Stars */}
                  <div className="space-y-2 text-center">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                      {lang === 'mr' ? 'रेटिंग द्या' : 'Rating'}
                    </label>
                    <div className="flex justify-center items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 transition-transform active:scale-125 focus:outline-none"
                        >
                          <Star 
                            className={`w-8 h-8 ${
                              star <= feedbackRating 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                      {lang === 'mr' ? 'तुमचे अभिप्राय / सूचना' : 'Detailed Feedback / Suggestions'}
                    </label>
                    <textarea
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder={lang === 'mr' ? 'येथे लिहा...' : 'Tell us what you loved or how we can improve...'}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
                  >
                    <Send className="w-4 h-4" />
                    {lang === 'mr' ? 'अभिप्राय पाठवा' : 'Submit Feedback'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STRICT ACCOUNT & DATA DELETION CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-red-100 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-5 bg-red-600 text-white relative shrink-0">
                <button
                  type="button"
                  onClick={() => !isDeletingAccount && setShowDeleteAccountModal(false)}
                  disabled={isDeletingAccount}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center mb-2">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-black tracking-tight">
                  {lang === 'mr' ? 'खाते व डेटा कायमचा हटवा?' : 'Delete Account & Data?'}
                </h3>
                <p className="text-xs text-red-100 font-medium mt-0.5">
                  {lang === 'mr' ? 'गूगल प्ले स्टोअर डेटा सेफ्टी धोरण नियमन' : 'Google Play Store Data Safety Policy'}
                </p>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 text-slate-700">
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-950 space-y-1">
                  <p className="text-xs font-black leading-relaxed">
                    {lang === 'mr'
                      ? 'तुम्हाला नक्की तुमचे खाते हटवायचे आहे का? तुमचे खाते, सर्व सहली, खर्चाचे हिशोब आणि अपलोड केलेली बिले कायमची हटवली जातील. ही क्रिया मागे घेता येणार नाही.'
                      : 'Are you sure? Your account, all trips, expenses, and uploaded bills will be permanently deleted. This action cannot be undone.'}
                  </p>
                </div>

                <div className="text-xs font-semibold text-slate-600 space-y-2">
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    {lang === 'mr' ? 'कायमचे हटवले जाणारे घटक:' : 'Items to be permanently removed:'}
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>{lang === 'mr' ? 'तुमचे ऑथेंटिकेशन व युझर प्रोफाईल रेकॉर्ड' : 'Your User Account & Authentication profile'}</li>
                    <li>{lang === 'mr' ? 'सर्व सहलींची माहिती, मेंबर्स व प्लॅन' : 'All created trips, itineraries & member records'}</li>
                    <li>{lang === 'mr' ? 'खर्चाचे हिशोब, बिले व पावत्या (Scanned Receipts)' : 'All logged expenses & uploaded receipt images'}</li>
                    <li>{lang === 'mr' ? 'स्थानिक डिव्हाइस स्टोरेज व ऑफलाईन डेटा कॅश' : 'Local device cache & indexed database records'}</li>
                  </ul>
                </div>

                {deleteError && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-bold space-y-2">
                    <p>{deleteError}</p>
                    {deleteError.includes('re-authenticate') || deleteError.includes('पुन्हा लॉग इन') ? (
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setShowDeleteAccountModal(false);
                          window.location.reload();
                        }}
                        className="px-3 py-1.5 bg-amber-800 text-white rounded-lg font-black text-[10px] uppercase tracking-wider hover:bg-amber-900 transition-all"
                      >
                        {lang === 'mr' ? 'पुन्हा लॉग इन करा' : 'Sign In Again'}
                      </button>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountModal(false)}
                  disabled={isDeletingAccount}
                  className="flex-1 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>

                <button
                  type="button"
                  id="confirm-delete-account-btn"
                  onClick={handleDeleteAccountConfirm}
                  disabled={isDeletingAccount}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'mr' ? 'हटवत आहे...' : 'Deleting...'}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{lang === 'mr' ? 'कायमचे हटवा' : 'Confirm Delete'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-5 bg-slate-900 text-white relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-3">
                  <LogOut className="w-6 h-6 text-rose-300" />
                </div>
                <h3 className="text-lg font-black tracking-tight">
                  {lang === 'mr' ? 'लॉगआउट निश्चिती' : 'Confirm Logout'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">
                  {lang === 'mr' ? 'तुम्हाला नक्की तुमचे खाते लॉगआउट करायचे आहे का?' : 'Are you sure you want to logout?'}
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-3 text-xs text-slate-600 leading-relaxed font-medium">
                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-100 text-rose-950 flex items-start gap-3">
                  <LogOut className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-900">
                      {lang === 'mr' ? 'सुरक्षित सेशन एक्झिट (Logout)' : 'Secure Session Sign Out'}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {lang === 'mr' 
                        ? 'तुमचा स्थानिक कॅश डेटा साफ केला जाईल आणि तुम्हाला सुरक्षितपणे लॉगिन स्क्रीनवर रिडायरेक्ट केले जाईल.' 
                        : 'Your local session data will be cleared and you will be safely redirected to the Login Screen.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {lang === 'mr' ? 'रद्द करा (Cancel)' : 'Cancel'}
                </button>

                <button
                  type="button"
                  id="confirm-logout-btn"
                  onClick={handleLogoutConfirm}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'mr' ? 'लॉगआउट होत आहे...' : 'Logging out...'}</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>{lang === 'mr' ? 'लॉगआउट (Logout)' : 'Logout'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
