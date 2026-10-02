import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Globe,
  User,
  Shield,
  CheckCircle2,
  X,
  ArrowRight
} from "lucide-react";
import { BRAND_NAME } from "../theme/tokens";

export type SocialProvider = "google" | "truecaller";

export interface LoginPayload {
  mode: "login" | "signup";
  identifier: string;
  password?: string;
  name?: string;
  role?: "user" | "agent" | "admin";
  remember?: boolean;
  provider?: "truecaller" | "google" | "demo";
}

export interface TruecallerUser {
  phone: string;
  name: string;
  role?: "user" | "agent" | "admin";
}

export interface LoginScreenProps {
  brandName?: string;
  onSubmit?: (payload: LoginPayload) => void;
  onSocial?: (provider: string) => void;
  onTruecaller?: (payload: TruecallerUser) => void;
  onForgotPassword?: (identifier: string) => void;
  onContinueAsGuest?: () => void;
}

// Truecaller icon exactly as in Google Stitch
const TruecallerIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={`fill-current ${className}`} viewBox="0 0 24 24">
    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.21 2.2z" />
  </svg>
);

// Google 4-color Vector Icon exactly as in Google Stitch
const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={`flex-shrink-0 ${className}`} viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

// Vendor Store Icon from Google Stitch SVG
const VendorIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({
  brandName = BRAND_NAME,
  onSubmit,
  onSocial,
  onTruecaller,
  onContinueAsGuest
}) => {
  const { i18n } = useTranslation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Truecaller Verification State
  const [isTruecallerSheetOpen, setIsTruecallerSheetOpen] = useState(false);
  const [isVerifyingTruecaller, setIsVerifyingTruecaller] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Demo portals as defined in Google Stitch
  const handleDemoSelect = (role: "user" | "agent" | "admin") => {
    if (role === "user") {
      showToast("Accessing Traveller Portal...");
      onSubmit?.({
        mode: "login",
        identifier: "user@routripo.app",
        name: "Aditi Sharma",
        role: "user",
        remember: true,
        provider: "demo"
      });
    } else if (role === "agent") {
      showToast("Accessing Vendor Partner Portal...");
      onSubmit?.({
        mode: "login",
        identifier: "vendor@routripo.app",
        name: "Shree Ganesh Travels (Vendor)",
        role: "agent",
        remember: true,
        provider: "demo"
      });
    } else {
      showToast("Accessing Admin Dashboard...");
      onSubmit?.({
        mode: "login",
        identifier: "admin@routripo.app",
        name: "System Administrator",
        role: "admin",
        remember: true,
        provider: "demo"
      });
    }
  };

  const handleTruecallerConfirm = () => {
    setIsVerifyingTruecaller(true);
    setTimeout(() => {
      setIsVerifyingTruecaller(false);
      setIsTruecallerSheetOpen(false);

      const phone = "+91 98765 43210";
      const name = "Aditi Sharma";

      showToast(`✓ Truecaller verified: ${phone}`);

      if (onTruecaller) {
        onTruecaller({ phone, name, role: "user" });
      } else {
        onSubmit?.({
          mode: "login",
          identifier: phone,
          name: `${name} (Truecaller)`,
          role: "user",
          remember: true,
          provider: "truecaller"
        });
      }
    }, 450);
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen flex justify-center selection:bg-sky-100 selection:text-sky-700">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 text-white text-[13px] font-bold rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Phone Frame Container */}
      <main className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col shadow-2xl relative overflow-hidden justify-center" data-purpose="mobile-screen-wrapper">
        
        {/* Top & Ambient Decorative Gradient Glow Orbs (Google Stitch) */}
        <div aria-hidden="true" className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-72 bg-gradient-to-b from-sky-200/50 via-sky-100/30 to-transparent rounded-full blur-3xl pointer-events-none animate-orb-1" />
        <div aria-hidden="true" className="absolute top-1/3 -right-20 w-64 h-64 bg-purple-200/25 rounded-full blur-3xl pointer-events-none animate-orb-2" />
        <div aria-hidden="true" className="absolute bottom-10 -left-16 w-60 h-60 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none animate-orb-1" />

        <div className="relative z-10 px-6 pt-5 pb-8 flex-1 flex flex-col justify-center">
          <div>
            {/* BEGIN: HeaderSection */}
            <div className="absolute top-5 right-5 z-20 enter-header" data-purpose="language-selector-container">
              <div className="relative inline-block text-left" data-purpose="language-selector">
                <button
                  type="button"
                  aria-label="Select Language"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-white active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none"
                  onClick={() => i18n.changeLanguage(i18n.language === "mr" ? "en" : "mr")}
                >
                  <Globe className="w-3.5 h-3.5 text-sky-500 transition-transform duration-300 hover:rotate-12" />
                  <span>{i18n.language === "mr" ? "मराठी" : "English"}</span>
                </button>
              </div>
            </div>
            {/* END: HeaderSection */}

            {/* BEGIN: HeroWelcomeSection */}
            <section className="mb-7 text-center mt-6" data-purpose="welcome-headline">
              <div className="enter-logo">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 select-none">
                  <span className="text-[#2563EB] inline-block transition-transform duration-300 hover:-translate-y-0.5">ROU</span>
                  <span className="text-[#F97316] inline-block transition-transform duration-300 hover:-translate-y-0.5">T</span>
                  <span className="text-[#EC4899] inline-block transition-transform duration-300 hover:-translate-y-0.5">RIPO</span>
                </h2>
              </div>
              <p className="mt-1.5 text-sm font-medium text-slate-500 enter-tagline">
                Plan, Bargain & Travel Together
              </p>
            </section>
            {/* END: HeroWelcomeSection */}

            {/* BEGIN: PrimaryActionsSection */}
            <section className="space-y-4" data-purpose="authentication-options">
              {/* Social Login Icon Buttons Row (Truecaller & Google) */}
              <div className="text-center text-sm font-medium text-slate-500 pt-2 enter-login-label">
                Login with
              </div>
              <div className="flex items-center justify-center gap-4 py-2 enter-social-row" data-purpose="social-login-row">
                
                {/* Truecaller Icon Button */}
                <button
                  type="button"
                  title="Login with Truecaller"
                  aria-label="Login with Truecaller"
                  onClick={() => setIsTruecallerSheetOpen(true)}
                  className="w-14 h-14 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-2xl flex items-center justify-center shadow-md shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all duration-300 ease-out cursor-pointer focus:outline-none group"
                  data-purpose="truecaller-login-button"
                >
                  <TruecallerIcon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                </button>

                {/* Google Icon Button */}
                <button
                  type="button"
                  title="Login with Google"
                  aria-label="Login with Google"
                  onClick={() => onSocial?.("google")}
                  className="w-14 h-14 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-lg hover:shadow-slate-300/40 hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all duration-300 ease-out cursor-pointer focus:outline-none group"
                  data-purpose="google-login-button"
                >
                  <GoogleIcon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                </button>
              </div>

              {/* BEGIN: DemoAccessSection */}
              <div className="pt-4 enter-portals" data-purpose="demo-access-container">
                <div className="flex items-center justify-between mb-3 px-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    1-Click Demo Portals
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100 shadow-xs">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500" />
                    </span>
                    Instant Select
                  </span>
                </div>

                {/* Role Selector Cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  
                  {/* Traveller Demo Card */}
                  <button
                    type="button"
                    onClick={() => handleDemoSelect("user")}
                    data-purpose="demo-card-traveller"
                    className="group card-traveller-glow flex flex-col items-center justify-center p-3.5 bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 hover:-translate-y-1 rounded-xl shadow-sm active:scale-95 active:translate-y-0 transition-all duration-300 ease-out text-center cursor-pointer"
                  >
                    <div className="w-9 h-9 mb-2 rounded-lg bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <User className="w-4 h-4 transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors duration-200">
                      Traveller
                    </span>
                  </button>

                  {/* Vendor Partner Demo Card */}
                  <button
                    type="button"
                    onClick={() => handleDemoSelect("agent")}
                    data-purpose="demo-card-vendor"
                    className="group card-vendor-glow flex flex-col items-center justify-center p-3.5 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 hover:-translate-y-1 rounded-xl shadow-sm active:scale-95 active:translate-y-0 transition-all duration-300 ease-out text-center cursor-pointer"
                  >
                    <div className="w-9 h-9 mb-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <VendorIcon className="w-4 h-4 transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 leading-tight transition-colors duration-200">
                      Vendor Partner
                    </span>
                  </button>

                  {/* Admin Dashboard Demo Card */}
                  <button
                    type="button"
                    onClick={() => handleDemoSelect("admin")}
                    data-purpose="demo-card-admin"
                    className="group card-admin-glow flex flex-col items-center justify-center p-3.5 bg-white border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 hover:-translate-y-1 rounded-xl shadow-sm active:scale-95 active:translate-y-0 transition-all duration-300 ease-out text-center cursor-pointer"
                  >
                    <div className="w-9 h-9 mb-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <Shield className="w-4 h-4 transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700 leading-tight transition-colors duration-200">
                      Admin Dashboard
                    </span>
                  </button>
                </div>
              </div>
              {/* END: DemoAccessSection */}
            </section>
            {/* END: PrimaryActionsSection */}
          </div>

          {/* BEGIN: BottomDecoration */}
          <footer className="pt-6 text-center text-xs text-slate-400 enter-footer" data-purpose="screen-footer">
            <p className="font-medium text-slate-400/80">
              <span className="font-bold">
                <span className="text-[#2563EB]">ROU</span>
                <span className="text-[#F97316]">T</span>
                <span className="text-[#EC4899]">RIPO</span>
              </span> Travel Experience
            </p>
          </footer>
          {/* END: BottomDecoration */}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* TRUECALLER 1-TAP VERIFICATION POPUP (MATCHING DESIGN)                     */}
      {/* ========================================================================= */}
      {isTruecallerSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 animate-in fade-in duration-200">
          <div className="w-full max-w-[440px] rounded-t-[32px] bg-white shadow-2xl border-t border-slate-100 p-5 pb-8 animate-in slide-in-from-bottom duration-300">
            {/* Top Grab Bar */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto -mt-2 mb-3" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0087FF] flex items-center justify-center text-white">
                  <TruecallerIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-extrabold text-[#0087FF]">truecaller</span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsTruecallerSheetOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-sky-500 text-white flex items-center justify-center font-black text-[16px] shadow-sm shrink-0">
                  AS
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[15px] font-black text-slate-900 truncate">Aditi Sharma</h4>
                    <CheckCircle2 className="w-4 h-4 text-sky-500" />
                  </div>
                  <p className="text-[13px] font-extrabold text-sky-600">+91 98765 43210</p>
                  <p className="text-[11px] font-medium text-slate-500">1-Tap Verified Profile</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isVerifyingTruecaller}
              onClick={handleTruecallerConfirm}
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-white font-extrabold text-[15px] shadow-md transition active:scale-98 cursor-pointer bg-sky-500 hover:bg-sky-600"
            >
              {isVerifyingTruecaller ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <>
                  <TruecallerIcon className="w-5 h-5" />
                  <span>Continue as Aditi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsTruecallerSheetOpen(false)}
              className="w-full mt-2 py-2 text-center text-[12px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
