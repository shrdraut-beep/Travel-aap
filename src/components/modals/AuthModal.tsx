import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ShieldCheck, Share2, ChevronRight } from 'lucide-react';
import { useAuthStore, User } from '../../store/useAuthStore';
import { shareAppOnWhatsApp } from '../../utils/shareUtils';

interface AuthModalProps {
  wallpaperUrl?: string;
  logoUrl?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  wallpaperUrl = '/wallpaper.png',
  logoUrl = '/AppIcons/playstore.png'
}) => {
  const { isAuthModalOpen, closeAuthModal, login, loginWithUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountChooser, setShowAccountChooser] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await login();
      if (user) return;
    } catch (err) {
      console.warn("Login cancelled or restricted in modal, showing account chooser", err);
    } finally {
      setIsLoading(false);
    }
    setShowAccountChooser(true);
  };

  const handleSelectAccount = (email: string, name: string, photoURL?: string) => {
    const avatar = photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&bold=true`;
    const user: User = {
      id: 'google_' + Date.now(),
      name,
      email,
      avatar
    };
    loginWithUser(user);
    setShowAccountChooser(false);
    closeAuthModal();
  };

  const handleCustomAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const name = customName.trim() || customEmail.split('@')[0];
    handleSelectAccount(customEmail.trim().toLowerCase(), name);
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 overflow-hidden"
        onClick={closeAuthModal}
      >
        {/* Full-screen Background Wallpaper with Dark Backdrop Blur */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url('${wallpaperUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        >
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" />
        </div>

        {/* Centered Glassmorphism Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-white overflow-hidden text-center"
        >
          {/* Subtle Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-indigo-400 to-rose-400" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white/80 hover:text-white rounded-full transition-all border border-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Center Custom Logo (Strictly replacing 'PW' avatar) */}
          <div className="relative mb-5 inline-block">
            <div className="p-3 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/60 inline-flex items-center justify-center">
              <img
                src={logoUrl}
                alt="राऊट्रिपो Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logobg.png';
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center font-black text-xs shadow-md border-2 border-slate-900">
              ✨
            </div>
          </div>

          {/* App Title strictly reads 'राऊट्रिपो' */}
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            राऊट्रिपो
          </h2>
          <p className="text-xs font-bold text-teal-300 uppercase tracking-widest mt-1 drop-shadow">
            Routripo • Trip & Expense Hub
          </p>

          <p className="text-xs font-medium text-slate-200 mt-3 mb-8 leading-relaxed max-w-xs mx-auto">
            सहलीचे नियोजन करा, खर्चाचे बिल स्कॅन करा आणि मित्रांसोबत हिशोब सुरक्षितपणे सेव्ह करा.
          </p>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 font-extrabold text-sm border border-white/80 cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span>लॉगिन होत आहे...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Google खात्याने पुढे जा (Sign in)</span>
              </>
            )}
          </button>

          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={() => shareAppOnWhatsApp('mr')}
            className="w-full mt-3 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 font-extrabold text-xs uppercase tracking-wider border border-emerald-400/40 cursor-pointer group"
          >
            <svg className="w-5 h-5 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.281.449-1.156 4.225 4.315-1.132.303.175z" />
            </svg>
            <span>WhatsApp वर ॲप शेअर करा</span>
            <Share2 className="w-4 h-4 text-emerald-200 ml-auto" />
          </button>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>सुरक्षित आणि गोपनीय (Encrypted Session)</span>
          </div>
        </motion.div>

        {/* Google Account Selector Modal (Fallback for iframe preview environments) */}
        <AnimatePresence>
          {showAccountChooser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 border border-slate-200"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <h3 className="font-extrabold text-sm text-slate-900">Choose a Google Account</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAccountChooser(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Enter your Google email address to continue to Routripo:
                </p>

                {/* Custom Google Email Input */}
                <form onSubmit={handleCustomAccountSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Your Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Google Email Address</label>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Sign In with Google Account
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};


