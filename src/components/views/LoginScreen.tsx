import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguage } from '../../context/LanguageContext';
import { Phone, Globe, Apple } from 'lucide-react';

interface LoginScreenProps {
  isAdminLogin?: boolean;
  wallpaperUrl?: string;
  logoUrl?: string;
  onLoginSuccess?: (user: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  wallpaperUrl = '/wallpaper.png',
  logoUrl = '/logobg.png',
  onLoginSuccess
}) => {
  const { login } = useAuthStore();
  const { language: lang } = useLanguage();

  const handleLogin = async () => {
    try {
      const user = await login();
      if (user && onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: `url('${wallpaperUrl}')` }}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="relative z-10 flex flex-col items-center flex-1 justify-center">
        <img src={logoUrl} alt="Logo" className="w-32 h-32 object-contain mb-8" />
        <h1 className="text-4xl font-bold text-white mb-8">Pravas Wataghati</h1>
      </div>

      <div className="relative z-10 w-full flex justify-center pb-20">
        <button onClick={handleLogin} className="px-8 py-4 bg-white/90 rounded-full flex items-center justify-center shadow-lg font-bold text-slate-900 gap-3">
           <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm">
             <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
           </div> Sign in with Google
        </button>
      </div>
      
      <div className="absolute bottom-5 right-5 z-20">
        <button onClick={handleLogin} className="text-white/60 text-sm font-medium hover:text-white">Agent Login</button>
      </div>
    </div>
  );
};
