import React, { useState } from "react";
import { User, Briefcase, Plane } from "lucide-react";
import { RippleButton, BrandLogo } from "./SharedUI";
import { signInWithGoogle } from "../../firebase";

const ROLES = {
  user: { label: "User", icon: User, grad: "from-red-500 via-rose-500 to-pink-500", ring: "ring-rose-400", text: "text-rose-600", soft: "bg-rose-50", glow: "shadow-rose-500/30", hex: "#e11d48" },
  agent: { label: "Partner", icon: Briefcase, grad: "from-red-500 via-rose-500 to-pink-500", ring: "ring-rose-400", text: "text-rose-600", soft: "bg-rose-50", glow: "shadow-rose-500/30", hex: "#e11d48" },
};

export function LoginScreen({ onLogin }: { onLogin: (role: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async (role: string = 'user') => {
    setLoading(true);
    console.log("Starting Google login...");
    try {
      const user = await signInWithGoogle();
      console.log("Google login success:", user);
      if (user) {
        onLogin(role);
      } else {
        console.log("No user returned, assuming redirect fallback.");
      }
    } catch (e) {
      console.error("Google login failed:", e);
      setLoading(false);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-200 to-sky-100 opacity-50" />
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <BrandLogo className="text-4xl mb-2" />
        <p className="text-slate-500 mb-8">Login / Signup with</p>

        <button 
          onClick={() => handleGoogleLogin('user')} 
          className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:border-slate-300 transition-all"
        >
          {loading ? <span className="w-4.5 h-4.5 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" /> : 
            <>
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#EA4335" d="M12.53,10.64l4.57-4.57c-1.39-2.03-3.76-3.37-6.42-3.37C6.18,2.7,2.7,6.18,2.7,10.45s3.48,7.75,7.75,7.75 c3.76,0,6.9-2.61,7.66-6.11H12.53V10.64z"/><path fill="#4285F4" d="M22.5,12c0-0.74-0.07-1.45-0.2-2.14H12.5v4.28h5.65c-0.24,1.28-0.97,2.37-2.05,3.09l4.54,3.52C21.46,17.58,22.5,15.1,22.5,12z"/><path fill="#FBBC05" d="M7.74,15.22c-0.54-0.16-1.04-0.42-1.48-0.75l-4.24,3.31c2.1,2.8,5.4,4.59,9.15,4.59c3.75,0,7.05-1.79,9.15-4.59l-4.54-3.52c-1.08,0.72-2.19,1.15-3.39,1.15C10.15,15.22,8.83,14.89,7.74,15.22z"/><path fill="#34A853" d="M2.7,10.45c0-1.33,0.35-2.58,0.97-3.66l4.24,3.31c-0.2,0.47-0.31,0.99-0.31,1.55c0,0.56,0.11,1.08,0.31,1.55L3.67,14.11C3.05,13.03,2.7,11.78,2.7,10.45z"/></svg>
              Google
            </>
          }
        </button>

        {/* Developer / Testing Mode */}
        <div className="w-full mt-8 pt-6 border-t border-slate-200/80 flex flex-col items-center space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Developer / Testing Mode
          </div>
          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              type="button"
              onClick={() => onLogin('user')}
              className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              Test as User
            </button>
            <button
              type="button"
              onClick={() => onLogin('agent')}
              className="py-2.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              Test as Partner
            </button>
            <button
              type="button"
              onClick={() => onLogin('admin')}
              className="py-2.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              Test as Admin
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={() => handleGoogleLogin('agent')}
        className="fixed bottom-6 text-slate-500 font-semibold text-xs hover:text-slate-800 transition-colors"
      >
        Partner Login
      </button>
    </div>
  );
}
