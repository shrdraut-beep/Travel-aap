import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguage } from '../../context/LanguageContext';
import { Plane, Compass, User, Briefcase, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  isAdminLogin?: boolean;
  wallpaperUrl?: string;
  logoUrl?: string;
  onLoginSuccess?: (user: any) => void;
}

const ROLES = {
  admin: { label: "Admin", icon: ShieldCheck, grad: "from-emerald-500 to-emerald-700", ring: "ring-emerald-400", text: "text-emerald-600", glow: "shadow-emerald-500/30" },
  user: { label: "User", icon: User, grad: "from-orange-400 to-orange-600", ring: "ring-orange-400", text: "text-orange-600", glow: "shadow-orange-500/30" },
  agent: { label: "Partner", icon: Briefcase, grad: "from-sky-400 to-sky-600", ring: "ring-sky-400", text: "text-sky-600", glow: "shadow-sky-500/30" },
};

export const LoginScreen: React.FC<LoginScreenProps> = ({
  isAdminLogin = false,
  wallpaperUrl = '/wallpaper.png',
  logoUrl = '/logobg.png',
  onLoginSuccess
}) => {
  const { login } = useAuthStore();
  const { language: lang } = useLanguage();
  const [role, setRole] = useState<keyof typeof ROLES>(isAdminLogin ? "admin" : "user");
  
  const theme = ROLES[role];
  const Icon = theme.icon;

  const handleLogin = async () => {
    try {
      const user = await login();
      if (user && onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden font-[Inter]">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.grad} transition-colors duration-700`} />
      
      {/* Background decorations */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-8 opacity-10">
        <Plane className="w-48 h-48 text-white rotate-45" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-white/70 text-xs tracking-[0.2em] font-bold uppercase font-[Poppins]">RouTripO</p>
            <h1 className="text-white text-3xl font-bold font-[Poppins] mt-2 flex items-center gap-2">
              Welcome back <Compass className="w-6 h-6 text-white/80" />
            </h1>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30 shadow-xl">
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
        
        <p className="text-white/80 text-sm mb-10 max-w-[85%] leading-relaxed font-medium">
          Sign in to plan trips, split expenses & book everything in one seamless place.
        </p>

        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-900/20 border border-white p-8 mt-auto">
          <div className="flex bg-slate-100 rounded-2xl p-1.5 mb-8">
            {(Object.entries(ROLES) as [keyof typeof ROLES, typeof ROLES[keyof typeof ROLES]][]).map(([key, r]) => {
              const RIcon = r.icon;
              const active = role === key;
              return (
                <button 
                  key={key} 
                  onClick={() => setRole(key)} 
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    active ? `bg-gradient-to-r ${r.grad} text-white shadow-lg ${r.glow}` : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <RIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-5">
            <button 
              onClick={handleLogin} 
              className={`w-full py-4 rounded-2xl bg-gradient-to-r ${theme.grad} text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl ${theme.glow} hover:scale-[1.02] active:scale-[0.98] transition-all`}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm">
                 <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                 </svg>
              </div>
              Continue as {theme.label} with Google <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-center text-sm font-medium text-slate-500 mt-8">
            New to RouTripO? <span className={`${theme.text} font-bold cursor-pointer hover:underline`}>Create account</span>
          </p>
        </div>
      </div>
    </div>
  );
};
