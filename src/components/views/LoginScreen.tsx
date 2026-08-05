import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, RefreshCw, Loader2, Globe, Sparkles, UserCheck, ChevronRight, X, Share2, Plane } from 'lucide-react';
import { useAuthStore, User } from '../../store/useAuthStore';
import { useLanguage } from '../../context/LanguageContext';
import { shareAppOnWhatsApp } from '../../utils/shareUtils';
import { LANGUAGE_OPTIONS } from '../QuirkyLanguageSelector';

// Full Screen 3D Flying Jet Component
const Full3DFlyingAirplane: React.FC<{ isLoaded: boolean }> = ({ isLoaded }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5] perspective-[1200px]">
      {/* Dynamic 3D Floating Clouds in background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-amber-500/10 pointer-events-none"
      />

      {/* Atmospheric Cloud Layer 1 */}
      <motion.div
        animate={{ x: [-120, 350], y: [40, 90], opacity: [0, 0.45, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/4 -left-28 w-72 h-24 bg-white/10 backdrop-blur-md rounded-full filter blur-xl"
      />

      {/* Atmospheric Cloud Layer 2 */}
      <motion.div
        animate={{ x: [450, -250], y: [180, 230], opacity: [0, 0.5, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-2/3 -right-28 w-96 h-32 bg-amber-100/10 backdrop-blur-md rounded-full filter blur-2xl"
      />

      {/* Main 3D Jet Airplane Full-Screen Trajectory */}
      <motion.div
        initial={{ x: '-20vw', y: '75vh', scale: 0.75, rotateX: 25, rotateY: -15, rotateZ: -18 }}
        animate={
          !isLoaded
            ? {
                x: ['-25vw', '15vw', '55vw', '115vw'],
                y: ['80vh', '48vh', '28vh', '-12vh'],
                scale: [0.75, 1.25, 1.1, 0.85],
                rotateX: [25, 15, 8, 2],
                rotateY: [-20, -10, -4, 0],
                rotateZ: [-22, -14, -6, -2],
              }
            : {
                x: '125vw',
                y: '-20vh',
                scale: 0.7,
                opacity: 0,
              }
        }
        transition={
          !isLoaded
            ? {
                duration: 4.8,
                repeat: Infinity,
                ease: [0.25, 0.1, 0.25, 1],
              }
            : { duration: 0.8, ease: 'easeOut' }
        }
        className="absolute top-0 left-0 w-40 h-40 sm:w-56 sm:h-56 transform-gpu filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.75)]"
      >
        {/* Glowing Contrail Engine Smoke Trail */}
        <div className="absolute top-1/2 -left-44 w-52 h-3.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-200/50 to-white/95 rounded-full blur-[2px] animate-pulse origin-right transform -rotate-6" />
        <div className="absolute top-1/2 -left-56 w-64 h-6 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/20 to-teal-300/60 rounded-full blur-md origin-right transform -rotate-3" />

        {/* High Precision 3D Jet Vector SVG */}
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full transform hover:scale-105 transition-transform">
          <defs>
            <linearGradient id="fuselage3d" x1="20" y1="100" x2="180" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="35%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id="wing3d" x1="60" y1="40" x2="120" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="glassCockpit" x1="130" y1="90" x2="160" y2="105" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="tailFin" x1="30" y1="60" x2="60" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <filter id="jetGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Main Fuselage 3D Specular Tube */}
          <path d="M 25 100 C 50 82, 130 80, 175 96 C 182 98, 185 102, 175 104 C 130 120, 50 118, 25 100 Z" fill="url(#fuselage3d)" filter="url(#jetGlow)" />
          
          {/* Main Wing Top (3D Perspective Angle) */}
          <path d="M 75 92 L 115 35 C 120 28, 128 30, 126 38 L 110 90 Z" fill="url(#wing3d)" />
          
          {/* Main Wing Bottom (Swept back with shadow) */}
          <path d="M 80 108 L 130 165 C 134 170, 140 168, 136 160 L 118 106 Z" fill="url(#wing3d)" opacity="0.9" />

          {/* Engine Turbines */}
          <rect x="90" y="112" width="22" height="8" rx="4" fill="#334155" />
          <rect x="86" y="78" width="22" height="8" rx="4" fill="#475569" />
          <circle cx="110" cy="116" r="3" fill="#38BDF8" />
          <circle cx="106" cy="82" r="3" fill="#38BDF8" />

          {/* Tail Fin Vertical Stabilizer */}
          <path d="M 32 98 L 52 55 C 55 50, 62 52, 60 58 L 50 97 Z" fill="url(#tailFin)" />

          {/* Cockpit Glass Canopy */}
          <path d="M 145 92 C 158 92, 168 96, 170 100 C 168 102, 155 102, 145 98 Z" fill="url(#glassCockpit)" />

          {/* Wingtip Beacon Lights */}
          <circle cx="125" cy="32" r="3" fill="#EF4444" className="animate-ping" />
          <circle cx="138" cy="166" r="3" fill="#10B981" className="animate-ping" />
        </svg>
      </motion.div>
    </div>
  );
};

interface LoginScreenProps {
  isAdminLogin?: boolean;
  wallpaperUrl?: string;
  logoUrl?: string;
  onLoginSuccess?: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  wallpaperUrl = '/AppIcons/android/wallpaper1.jpeg',
  logoUrl = '/logo.svg',
  onLoginSuccess,
  isAdminLogin = false
}) => {
  const { login, loginWithUser } = useAuthStore();
  const { language: lang, setLanguage: setLang } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountChooser, setShowAccountChooser] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // Simulated fast launch loading progress (0 to 100% in 600ms for fast performance)
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAgentLogin, setShowAgentLogin] = useState(false);
  const [agentId, setAgentId] = useState('');
  const [agentPassword, setAgentPassword] = useState('');

  useEffect(() => {
    // Preload image assets instantly so they render without pop-in or flickering
    const logoImg = new Image();
    logoImg.src = '/logo.svg';
    const bgImg = new Image();
    bgImg.src = '/AppIcons/android/wallpaper1.jpeg';

    let start: number | null = null;
    const duration = 600; // Fast & smooth 600ms loading duration

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const current = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(current);

      if (elapsed < duration) {
        requestAnimationFrame(step);
      } else {
        setIsLoaded(true);
      }
    };

    const anim = requestAnimationFrame(step);
    return () => cancelAnimationFrame(anim);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await login();
      if (user) {
        if (onLoginSuccess) onLoginSuccess(user);
        return;
      }
    } catch (err) {
      console.log('Firebase popup blocked or restricted, displaying Google Account Selector modal');
    } finally {
      setIsLoading(false);
    }
    // Fallback account chooser modal for iframe / preview sandbox compatibility
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
    if (onLoginSuccess) onLoginSuccess(user);
  };

  const handleCustomAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const name = customName.trim() || customEmail.split('@')[0];
    handleSelectAccount(customEmail.trim().toLowerCase(), name);
  };

  const handleAgentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentPassword === '1234') {
      const user: User = {
        id: 'agent_' + Date.now(),
        name: agentId || 'Demo Agent',
        email: agentId + '@agent.com',
        avatar: `https://ui-avatars.com/api/?name=Agent&background=f59e0b&color=fff&bold=true`,
        role: 'agent'
      };
      loginWithUser(user);
      if (onLoginSuccess) onLoginSuccess(user);
    } else {
      alert('Invalid credentials. Use password "1234" for demo.');
    }
  };

if (isAdminLogin) {
    return (
      <div className="min-h-screen w-full fixed inset-0 flex items-center justify-center bg-slate-950 font-sans z-[200]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-950/20" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-sm mx-auto flex flex-col p-8 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl max-h-[85vh]"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
            <p className="text-sm text-slate-400 mt-1">Pravas Wataghati Management</p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 px-4 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-70"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Authorize as Administrator</span>
              </>
            )}
          </button>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Secure Enterprise Login</span>
          </div>
        </motion.div>

        {/* Fallback Google Account selector Modal for local dev/preview */}
        <AnimatePresence>
        {showAccountChooser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 border border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white">Select Admin Account</h3>
                <button
                  type="button"
                  onClick={() => setShowAccountChooser(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSelectAccount('shrd.raut@gmail.com', 'Shraddha Raut')}
                  className="w-full p-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://ui-avatars.com/api/?name=Shraddha+Raut&background=6366f1&color=fff&bold=true"
                      alt="Admin"
                      className="w-10 h-10 rounded-full border border-indigo-500/50"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">Shraddha Raut</span>
                        <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[9px] font-black uppercase rounded">Admin</span>
                      </div>
                      <span className="text-xs text-indigo-300 font-mono">shrd.raut@gmail.com</span>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    );
  }
  return (
    <div
      className="min-h-screen w-full fixed inset-0 flex flex-col items-center justify-start pt-10 sm:pt-14 pb-8 p-6 text-white font-sans overflow-y-auto bg-cover bg-center bg-no-repeat z-[200] flex-1 [&::-webkit-scrollbar]:hidden"
      style={{ backgroundImage: `url('/AppIcons/android/wallpaper1.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      {/* Full Screen 3D Flying Jet Flight Effect */}
      <Full3DFlyingAirplane isLoaded={isLoaded} />

      {/* Subtle vignette/gradient tint to maintain text readability without blocking background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-black/70 z-0 pointer-events-none" />

      {/* Floating Transparent Content Area - Fast Instant Load */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-5 max-h-[85vh]"
      >
        {/* Transparent Logo & Drop Shadow App Title */}
        <div className="flex flex-col items-center space-y-2.5">
          <div className="relative flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="App Logo"
              loading="eager"
              decoding="async"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] transition-all duration-200 relative z-10"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('ic_launcher.png')) {
                  target.src = '/AppIcons/android/mipmap-xxxhdpi/ic_launcher.png';
                } else {
                  target.src = '/logo.png';
                }
              }}
            />
            <div className="absolute -bottom-0.5 -right-0.5 z-20 w-5 h-5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center font-black text-[10px] shadow-md border border-slate-950">
              ✨
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              {lang === 'mr' ? 'प्रवास वाटाघाटी' : lang === 'hi' ? 'प्रवास वाटाघाटी' : 'Pravas Wataghati'}
            </h1>
            <p className="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-widest mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Smart Group Travel & Expense Hub
            </p>
          </div>
        </div>

        {/* LAUNCH LOADING PROGRESS BAR WITH ANIMATED TRAVELING PLANE */}
        {!isLoaded ? (
          <motion.div
            key="loading-bar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full space-y-2 py-4 px-2"
          >
            <div className="flex items-center justify-between text-xs font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{lang === 'mr' ? 'ॲप सुरू होत आहे...' : 'Launching App...'}</span>
              </span>
              <span className="font-mono text-amber-300 flex items-center gap-1">
                <span>{progress}%</span>
              </span>
            </div>
            {/* Sleek Animated Progress Bar with Plane Indicator */}
            <div className="w-full h-3 bg-black/50 backdrop-blur-md rounded-full border border-white/30 p-0.5 shadow-inner relative overflow-visible">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-teal-400 to-emerald-400 rounded-full transition-all duration-75 shadow-md relative"
                style={{ width: `${progress}%` }}
              >
                {/* Leading Traveling Plane Indicator */}
                <div className="absolute -right-3 -top-2 z-20 pointer-events-none">
                  <motion.div
                    animate={{ y: [-1, 1, -1] }}
                    transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                  >
                    <Plane className="w-5 h-5 text-amber-300 fill-amber-400 transform rotate-45 filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ACTION BUTTONS REVEALED AFTER LOADING COMPLETES */
          <motion.div
            key="action-buttons"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full space-y-3 pt-2"
          >
            {/* Description */}
            <p className="text-xs font-medium text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] leading-relaxed max-w-xs mx-auto mb-2">
              {lang === 'mr' 
                ? 'सहलीचे नियोजन करा, खर्चाचे बिल स्कॅन करा आणि मित्रांसोबत हिशोब सुरक्षितपणे सेव्ह करा.'
                : lang === 'hi'
                ? 'यात्रा का नियोजन करें, बिल स्कैन करें और दोस्तों के साथ खर्च सुरक्षित रखें।'
                : 'Plan group trips, scan bill receipts, and settle shared expenses seamlessly.'}
            </p>

            {/* Language Selection */}
            <div className="flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 w-fit mx-auto shadow-lg">
              <Globe className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer max-w-[210px] truncate"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code} className="bg-slate-900 text-white">
                    {opt.label} ({opt.vibe})
                  </option>
                ))}
              </select>
            </div>

            {/* User Login Section */}
            <div className="space-y-3 pt-2 pb-2">
              <h3 className="text-[10px] font-black text-amber-300 uppercase tracking-widest text-left pl-1">Traveler Access</h3>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-950 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-2xl transition-all flex items-center justify-center gap-3 font-extrabold text-sm cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    <span>Connecting to Google Auth...</span>
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
                    <span>{lang === 'mr' ? 'Google द्वारे लॉगिन करा' : lang === 'hi' ? 'Google से लॉगिन करें' : 'User Login (Traveler)'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Partner/Agent Login Section */}
            <div className="space-y-3 pb-2">
              <h3 className="text-[10px] font-black text-emerald-300 uppercase tracking-widest text-left pl-1">B2B Partner Access</h3>
              <button
                type="button"
                onClick={() => setShowAgentLogin(true)}
                className="w-full py-4 px-6 bg-slate-900/80 hover:bg-slate-800 active:scale-[0.98] text-emerald-400 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-emerald-500/30 transition-all flex items-center justify-center gap-3 font-extrabold text-sm cursor-pointer backdrop-blur-sm"
              >
                <UserCheck className="w-5 h-5" />
                <span>Partner / Agent Login</span>
              </button>
            </div>

            {/* Prominent WhatsApp Share Button */}
            <button
              type="button"
              onClick={() => shareAppOnWhatsApp(lang)}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 hover:from-emerald-400 hover:to-green-500 active:scale-[0.98] text-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center gap-2.5 font-extrabold text-xs uppercase tracking-wider border border-emerald-300/40 cursor-pointer group"
            >
              <svg className="w-5 h-5 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.281.449-1.156 4.225 4.315-1.132.303.175z" />
              </svg>
              <span className="truncate">{lang === 'mr' ? 'WhatsApp वर ॲप शेअर करा' : 'Share App on WhatsApp'}</span>
              <Share2 className="w-4 h-4 text-emerald-100 ml-auto shrink-0" />
            </button>

            {/* Security Badge */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-white/90 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{lang === 'mr' ? '२५६-बिट एनक्रिप्टेड आणि सुरक्षित' : 'OAuth 2.0 Encrypted & Verified'}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Partner / Agent Login Modal */}
      <AnimatePresence>
        {showAgentLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 border border-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Partner / Agent Login</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAgentLogin(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAgentLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Agent ID / Phone</label>
                  <input
                    type="text"
                    placeholder="Enter Agent ID or Phone"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Password / OTP</label>
                  <input
                    type="password"
                    placeholder="Enter Password (1234 for demo)"
                    value={agentPassword}
                    onChange={(e) => setAgentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Login as Partner
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Account Selector Modal (Fallback for iframe preview environments) */}
      <AnimatePresence>
        {showAccountChooser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4"
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
                Select your verified Google Account to continue to Pravas Wataghati:
              </p>

              <div className="space-y-2.5">
                {/* Admin Account Option */}
                <button
                  type="button"
                  onClick={() => handleSelectAccount('shrd.raut@gmail.com', 'Shraddha Raut')}
                  className="w-full p-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-300 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://ui-avatars.com/api/?name=Shraddha+Raut&background=d97706&color=fff&bold=true"
                      alt="Shraddha Raut"
                      className="w-9 h-9 rounded-full border border-amber-400 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-slate-900">Shraddha Raut</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase">
                          Admin
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-amber-800">shrd.raut@gmail.com</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Tester Account Option */}
                <button
                  type="button"
                  onClick={() => handleSelectAccount('traveler.demo@gmail.com', 'Beta Traveler')}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://ui-avatars.com/api/?name=Beta+Traveler&background=4f46e5&color=fff&bold=true"
                      alt="Beta Traveler"
                      className="w-9 h-9 rounded-full border border-slate-300 object-cover"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Beta Traveler</span>
                      <span className="text-[11px] font-mono text-slate-500">traveler.demo@gmail.com</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Custom Google Email Input */}
              <form onSubmit={handleCustomAccountSubmit} className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">Or sign in with another Google email:</span>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Continue with Google
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
