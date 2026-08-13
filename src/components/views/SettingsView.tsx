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
  Download,
  Share2
} from 'lucide-react';
import { TripGroup } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { deleteUserAccountAndData, signOutUser } from '../../firebase';
import { enablePushNotifications } from '../../utils/push';
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

  const handleTogglePushNotifications = async (val: boolean) => {
    setPushNotifications(val);
    localStorage.setItem('pref_push_notifications', String(val));
    if (!val) return;

    // enablePushNotifications handles permission prompting and picks the right
    // mechanism per platform (native FCM on Android, web push in the browser/PWA).
    // Gating on window.Notification here would have skipped registration entirely
    // inside the Capacitor WebView.
    const result = await enablePushNotifications(currentUser?.id);
    if (result.status === 'registered') return;

    // Leaving the switch on while push is silently inactive would be misleading.
    setPushNotifications(false);
    localStorage.setItem('pref_push_notifications', 'false');
    console.warn('[settings] push notifications not enabled:', result);
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
    <div className="pt-6 pb-24 px-5 space-y-6 max-w-2xl mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-[Poppins] text-slate-800">{t('settings') || 'Settings'}</h2>
          <p className="text-xs text-slate-500">{lang === 'mr' ? 'तुमची प्राधान्ये व्यवस्थापित करा' : 'Manage your preferences'}</p>
        </div>
      </div>

      <div className="space-y-4">
        
        {/* Settings Options */}
        <div 
          onClick={onOpenLanguageModal}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{t('language') || 'Language'}</p>
              <p className="text-[11px] text-slate-500">{lang === 'mr' ? 'मराठी' : 'English'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{lang === 'mr' ? 'सूचना (Notifications)' : 'Notifications'}</p>
              <p className="text-[11px] text-slate-500">{lang === 'mr' ? 'ॲलर्ट्स आणि अपडेट्स व्यवस्थापित करा' : 'Manage alerts and updates'}</p>
            </div>
          </div>
          <ToggleSwitch checked={pushNotifications} onChange={handleTogglePushNotifications} />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{lang === 'mr' ? 'सुरक्षा व आपत्कालीन' : 'Privacy & Security'}</p>
              <p className="text-[11px] text-slate-500">{lang === 'mr' ? 'एसओएस व अलर्ट्स' : 'Data and permissions'}</p>
            </div>
          </div>
          <ToggleSwitch checked={sosAlerts} onChange={handleToggleSosAlerts} />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{t('currency') || 'Currency'}</p>
              <p className="text-[11px] text-slate-500">{currency || 'INR'}</p>
            </div>
          </div>
          <select 
            value={currency}
            onChange={(e) => onSetCurrency(e.target.value)}
            className="bg-slate-50 border-none rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
            <option value="AED">د.إ AED</option>
            <option value="AUD">A$ AUD</option>
          </select>
        </div>
        
        <div 
          onClick={onExportPDF}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{lang === 'mr' ? 'PDF डाउनलोड' : 'Export PDF'}</p>
              <p className="text-[11px] text-slate-500">{lang === 'mr' ? 'सहलीचा अहवाल डाउनलोड करा' : 'Download trip report'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => setShowLogoutModal(true)}
          className="w-full mt-8 py-3.5 bg-rose-50 hover:bg-rose-100 active:scale-95 transition-all text-rose-600 font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-sm"
        >
          <LogOut className="w-4 h-4" /> {lang === 'mr' ? 'लॉग आऊट' : 'Log Out'}
        </button>
      </div>

      {/* Support & Legal */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 px-2">{lang === 'mr' ? 'मदत व सपोर्ट' : 'Help & Support'}</h3>

        <div 
          onClick={() => shareAppOnWhatsApp(lang)}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{lang === 'mr' ? 'WhatsApp वर ॲप शेअर करा' : 'Share App on WhatsApp'}</p>
              <p className="text-[11px] text-slate-500">{lang === 'mr' ? 'मित्रांना ॲप डाऊनलोड लिंक पाठवा' : 'Send app download link to friends'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div 
          onClick={() => setShowFeedbackModal(true)}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{t('sendFeedback') || 'Send Feedback'}</p>
              <p className="text-[11px] text-slate-500">{lang === 'mr' ? 'तुमचा अनुभव व सूचना शेअर करा' : 'Rate us and share your suggestions'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div 
          onClick={() => setShowPrivacyModal(true)}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{lang === 'mr' ? 'गोपनीयता आणि क्रेडिट्स' : 'Privacy Policy & Credits'}</p>
              <p className="text-[11px] text-slate-500">{lang === 'mr' ? 'डेटा सुरक्षा आणि मुक्त-स्रोत क्रेडिट्स पाहा' : 'Read privacy policy & open-source credits'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
        
        {/* Red Delete Account Button */}
        <button 
          onClick={() => {
            setDeleteError(null);
            setShowDeleteAccountModal(true);
          }}
          className="w-full mt-2 py-3.5 bg-red-50 hover:bg-red-100 active:scale-95 transition-all text-red-600 font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-sm"
        >
          <UserX className="w-4 h-4" /> {lang === 'mr' ? 'खाते व डेटा कायमचा हटवा' : 'Delete Account & All Data'}
        </button>
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
                  {lang === 'mr' ? 'राऊट्रिपो मधील तुमचा अनुभव कसा होता?' : 'How is your experience with Routripo?'}
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
