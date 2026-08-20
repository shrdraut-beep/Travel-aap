import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Receipt, Ticket, Camera, Compass, Siren, User, Settings, Navigation, PhoneCall, X, AlertTriangle, ShieldAlert, Share2, Music, Radio, Building2, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguage } from '../../context/LanguageContext';
import { QuirkyLanguageSelector } from '../QuirkyLanguageSelector';
import { shareAppOnWhatsApp } from '../../utils/shareUtils';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
  lang: string;
  wallpaperUrl?: string;
  logoUrl?: string;
  tripName?: string;
  isCloudSynced?: boolean;
  isOffline?: boolean;
  onLogoClick?: () => void;
  onSOS?: () => void;
  onOpenLiveRadar?: () => void;
  onOpenMusicSearch?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ 
  children, activeTab, onTabChange, lang, wallpaperUrl, logoUrl, tripName, isCloudSynced, isOffline, onLogoClick, onSOS, onOpenLiveRadar, onOpenMusicSearch
}) => {
  const { currentUser, logout, openAuthModal } = useAuthStore();
  const { t } = useLanguage();
  const [customLogo, setCustomLogo] = React.useState<string | null>(null);
  const [showSosMenu, setShowSosMenu] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [isInputFocused, setIsInputFocused] = React.useState(false);

  React.useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        setIsInputFocused(true);
      }
    };
    const handleBlur = () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (!(active instanceof HTMLInputElement) && !(active instanceof HTMLTextAreaElement) && !(active instanceof HTMLSelectElement)) {
          setIsInputFocused(false);
        }
      }, 150);
    };

    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);
    return () => {
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
    };
  }, []);

  const getCleanTabLabel = (id: string, fallbackEn: string, fallbackMr: string) => {
    const raw = t(id + 'Tab') || t(id) || (lang === 'mr' ? fallbackMr : fallbackEn);
    if (!raw || raw.endsWith('Tab') || raw.includes('_')) return fallbackEn;
    return raw;
  };

  const tabs = [
    { 
      id: 'dashboard', label: getCleanTabLabel('hub', 'Hub', 'हब'), icon: LayoutDashboard, emoji: '🏠',
      activeText: 'text-orange-600', activeBg: 'bg-orange-50 border-orange-200', activeBorder: 'bg-orange-600'
    },
    { 
      id: 'planner', label: lang === 'mr' ? 'प्लॅनिंग' : 'Planning', icon: Compass, emoji: '📅',
      activeText: 'text-orange-600', activeBg: 'bg-orange-50 border-orange-200', activeBorder: 'bg-orange-600'
    },
    { 
      id: 'expenses', label: getCleanTabLabel('expenses', 'Expenses', 'खर्च'), icon: Receipt, emoji: '💸',
      activeText: 'text-white', activeBg: 'bg-orange-600', activeBorder: 'bg-orange-800', isCenter: true
    },
    { 
      id: 'bookings', label: getCleanTabLabel('bookings', 'Bookings', 'बुकिंग'), icon: Ticket, emoji: '🎟️',
      activeText: 'text-orange-600', activeBg: 'bg-orange-50 border-orange-200', activeBorder: 'bg-orange-600'
    },
    { 
      id: 'social', label: lang === 'mr' ? 'सोशल' : 'Social', icon: Camera, emoji: '📸',
      activeText: 'text-orange-600', activeBg: 'bg-orange-50 border-orange-200', activeBorder: 'bg-orange-600'
    },
    { 
      id: 'settings', label: getCleanTabLabel('settings', 'Settings', 'सेटिंग्ज'), icon: Settings, emoji: '⚙️',
      activeText: 'text-slate-700', activeBg: 'bg-slate-100 border-slate-200', activeBorder: 'bg-slate-600'
    },
  ];

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-full overflow-hidden font-sans relative bg-[#fcfcfd]">
      {/* Dynamic Wallpaper Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 transition-opacity duration-1000" 
        style={{ backgroundImage: `url(${wallpaperUrl || '/wallpaper.png'})`, opacity: 0.08 }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/40 pointer-events-none z-[1]" />

      {/* Global Header */}
      <header className="sticky top-0 left-0 right-0 bg-white border-b border-slate-200 px-3 py-2.5 flex items-center justify-between z-[60] shadow-sm shrink-0 gap-2">
        {/* Extreme Left: Routripo App Logo */}
        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (onLogoClick) onLogoClick();
          }}
          className="relative shrink-0 flex items-center gap-2 p-1 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 shadow-xs transition-all active:scale-95 cursor-pointer"
          title="राऊट्रिपो (Routripo)"
        >
          <img
            src={logoUrl || '/logobg.png'}
            alt="Routripo Logo"
            className="h-10 w-auto object-contain drop-shadow-xs"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/logobg.png';
            }}
          />
          <span className="font-black text-slate-900 text-xs sm:text-sm tracking-tight hidden lg:inline-block pr-1">
            राऊट्रिपो
          </span>
        </button>
        </div>

        {/* Center / Remaining Space: Trip Name */}
        <div className="flex-1 overflow-hidden relative min-h-9 mx-1 flex items-center justify-center">
          {tripName ? (
            <span className="font-black text-slate-900 text-xs sm:text-sm text-center whitespace-normal break-words line-clamp-2 px-1 max-w-full leading-tight">
              {tripName}
            </span>
          ) : (
            <span className="font-black text-slate-400 text-sm text-center">
              {lang === 'mr' ? 'माझी सहल' : 'My Trip'}
            </span>
          )}
        </div>

        {/* Right Header: Live Radar, Music Search, Profile Avatar & User Dropdown & SOS */}
        <div className="shrink-0 flex items-center gap-1.5">
          {onOpenLiveRadar && (
            <button
              type="button"
              onClick={onOpenLiveRadar}
              className="px-2 py-1.5 bg-emerald hover:bg-emerald/90 active:scale-95 text-white rounded-xl shadow-xs transition-all flex items-center gap-1 font-extrabold text-xs border border-emerald/50 cursor-pointer"
              title={lang === 'mr' ? 'थेट विमान रडार' : 'Live Air Radar'}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-white/80" />
              <span className="hidden sm:inline-block">{lang === 'mr' ? 'रडार' : 'Radar'}</span>
            </button>
          )}

          {onOpenMusicSearch && (
            <button
              type="button"
              onClick={onOpenMusicSearch}
              className="px-2 py-1.5 bg-coral hover:bg-coral/90 active:scale-95 text-white rounded-xl shadow-xs transition-all flex items-center gap-1 font-extrabold text-xs border border-coral/50 cursor-pointer"
              title={lang === 'mr' ? 'संगीत व गाणी' : 'Music Player & Search'}
            >
              <Music className="w-3.5 h-3.5 text-white/80" />
              <span className="hidden sm:inline-block">{lang === 'mr' ? 'संगीत' : 'Music'}</span>
            </button>
          )}

          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-0.5 rounded-full border-2 border-coral hover:border-emerald shadow-sm active:scale-95 transition-all shrink-0 bg-white cursor-pointer"
                title={currentUser.name || 'User Profile'}
              >
                <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl p-4 z-[200] space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full border border-coral object-cover" />
                    <div className="overflow-hidden">
                      <p className="font-extrabold text-xs text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded-md bg-emerald/10 text-emerald-700 border border-emerald/20 text-[9px] font-black uppercase">
                        Google Authenticated
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full py-2 px-3 bg-coral/10 hover:bg-coral/20 text-coral border border-coral/20 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{lang === 'mr' ? 'लॉगआउट (Sign Out)' : 'Sign Out'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => openAuthModal()} 
              className="p-2 bg-coral/10 hover:bg-coral/20 text-coral rounded-xl border border-coral/20 shadow-2xs active:scale-95 transition-all shrink-0"
              title="Profile"
            >
              <User className="w-4 h-4" />
            </button>
          )}

          {/* SOS Emergency Siren Icon & Dropdown Menu */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowSosMenu(!showSosMenu)}
              className="p-2 bg-gradient-to-br from-coral to-coral/80 text-white rounded-xl shadow-md active:scale-90 animate-pulse flex items-center justify-center border border-white/20 cursor-pointer"
              title={lang === 'mr' ? 'आणीबाणी मेनू' : 'SOS Emergency Menu'}
            >
              <Siren className="w-4 h-4" />
            </button>

            {/* Emergency Popover Menu */}
            <AnimatePresence>
              {showSosMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[140] bg-slate-900/20 backdrop-blur-xs" 
                    onClick={() => setShowSosMenu(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 top-12 z-[150] w-72 bg-white rounded-2xl shadow-2xl border-2 border-coral/20 p-3 space-y-2 overflow-hidden"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                      <div className="flex items-center gap-1.5 text-coral">
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                          {lang === 'mr' ? 'आपत्कालीन सेवा' : 'Emergency Options'}
                        </span>
                      </div>
                      <button 
                        onClick={() => setShowSosMenu(false)}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        setShowSosMenu(false);
                        if (onSOS) onSOS();
                      }}
                      className="w-full p-2.5 bg-coral hover:bg-coral/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Siren className="w-4 h-4 animate-pulse text-white shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="truncate leading-tight">{lang === 'mr' ? 'चाचणी आणीबाणी (SOS) अलर्ट' : 'Test Emergency Push Alert'}</p>
                        <p className="text-[9px] text-white/80 font-medium normal-case truncate">{lang === 'mr' ? 'पुश नोटिफिकेशन व सायरन' : 'Send push alert to members'}</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => {
                        setShowSosMenu(false);
                        onTabChange('map');
                      }}
                      className="w-full p-2.5 bg-emerald/10 hover:bg-emerald/20 text-slate-900 border border-emerald/20 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4 text-emerald shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="truncate leading-tight">{lang === 'mr' ? 'दोस्त शोधा - मॅपवर ट्रॅक करा' : 'Find Friends - Live Map'}</p>
                        <p className="text-[9px] text-emerald font-medium normal-case truncate">{lang === 'mr' ? 'मित्रांचे लाईव्ह लोकेशन' : 'Track group live locations'}</p>
                      </div>
                    </button>

                    <a 
                      href="tel:112"
                      onClick={() => setShowSosMenu(false)}
                      className="w-full p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200/80 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="truncate leading-tight">{lang === 'mr' ? 'आपत्कालीन हेल्पलाइन (११२)' : 'Call Emergency Helpline (112)'}</p>
                        <p className="text-[9px] text-emerald-700 font-medium normal-case truncate">{lang === 'mr' ? 'राष्ट्रीय पोलीस / मेडिकल मदत' : 'National Emergency Support'}</p>
                      </div>
                    </a>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-[120px] relative z-10 w-full no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      {activeTab !== 'trips-list' && !isInputFocused && (
        <motion.nav 
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed-bottom-nav fixed bottom-3 left-3 right-3 z-50 max-w-md mx-auto"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-[1.75rem] shadow-xl shadow-slate-300/40 border border-white flex items-center justify-between px-1.5 py-2">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="relative flex-1 flex flex-col items-center gap-1 py-1 cursor-pointer transition-all min-w-0"
                >
                  {isActive && <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-orange-500" />}
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? "bg-gradient-to-br from-orange-400 to-rose-500 shadow-md shadow-orange-500/30 scale-105" : "bg-transparent"}`}>
                    <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? "text-white" : "text-slate-400"}`} />
                  </div>
                  <span className={`text-[10px] font-bold tracking-wide ${isActive ? "text-slate-800" : "text-slate-400"}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.nav>
      )}
    </div>
  );
};
