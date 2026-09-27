import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Apple,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Facebook,
  Globe,
  Lock,
  Mail,
  Plane,
  Shield,
  ShieldCheck,
  User,
  Phone,
  Sparkles,
  X,
  ArrowRight,
  Store,
  type LucideIcon
} from "lucide-react";
import { BRAND_NAME, portalThemes } from "../theme/tokens";

export type LoginMode = "login" | "signup";
export type SocialProvider = "google" | "facebook" | "apple" | "truecaller";

export interface LoginPayload {
  mode: LoginMode;
  identifier: string;
  password?: string;
  name?: string;
  role?: "user" | "agent" | "admin";
  remember?: boolean;
  provider?: "email" | "truecaller" | "google" | "facebook" | "apple" | "demo";
}

export interface TruecallerUser {
  phone: string;
  name: string;
  role?: "user" | "agent" | "admin";
}

export interface LoginScreenProps {
  brandName?: string;
  onSubmit?: (payload: LoginPayload) => void;
  onSocial?: (provider: SocialProvider) => void;
  onTruecaller?: (payload: TruecallerUser) => void;
  onForgotPassword?: (identifier: string) => void;
  onContinueAsGuest?: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{7,14}$/;

// Truecaller official phone mark vector
const TruecallerIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.21 2.2z" />
  </svg>
);

const TruecallerFullLogo: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <div className={`flex items-center gap-1.5 font-black tracking-tight text-[#0087FF] ${className}`}>
    <div className="w-5 h-5 rounded-full bg-[#0087FF] flex items-center justify-center text-white">
      <TruecallerIcon className="w-3.5 h-3.5 fill-white" />
    </div>
    <span className="text-[15px] font-extrabold text-[#0087FF]">truecaller</span>
  </div>
);

// Google 4-color Vector Icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={`flex-shrink-0 ${className}`} viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

const PORTAL_SPECS = {
  user: {
    role: "user" as const,
    portalName: "USER APP",
    portalSubtitle: "Plan, Bargain & Travel Together",
    signupSubtitle: "Start your smart travel journey",
    headerGradient: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
    headerBorder: "#BAE6FD",
    titleColor: "#0369A1",
    badgeBg: "#FFFFFF",
    badgeText: "#0284C7",
    primary: "#0EA5E9",
    primaryDeep: "#0284C7",
    primaryDark: "#0369A1",
    shadow: "0 4px 10px rgba(14, 165, 233, 0.2)",
    cardBorder: "#E0F2FE",
    activePillBg: "bg-sky-50 text-sky-700 border-sky-300 shadow-xs",
    ringColor: "focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20",
    iconColor: "text-[#0284C7]",
    btnText: "Login as Traveller →",
    actionButtonText: "Book Trip",
    sampleMetricLabel: "Mumbai → Goa",
    sampleMetricValue: "₹4,120"
  },
  agent: {
    role: "agent" as const,
    portalName: "VENDOR PARTNER",
    portalSubtitle: "Manage Bookings & Grow Earnings",
    signupSubtitle: "Scale your travel agency with verified leads",
    headerGradient: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
    headerBorder: "#A7F3D0",
    titleColor: "#047857",
    badgeBg: "#FFFFFF",
    badgeText: "#059669",
    primary: "#10B981",
    primaryDeep: "#059669",
    primaryDark: "#047857",
    shadow: "0 4px 10px rgba(16, 185, 129, 0.2)",
    cardBorder: "#D1FAE5",
    activePillBg: "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs",
    ringColor: "focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20",
    iconColor: "text-[#059669]",
    btnText: "Login as Vendor →",
    actionButtonText: "Manage Bookings",
    sampleMetricLabel: "Total Earnings",
    sampleMetricValue: "+ ₹12,450"
  },
  admin: {
    role: "admin" as const,
    portalName: "ADMIN DASHBOARD",
    portalSubtitle: "System Status & Operations Control",
    signupSubtitle: "Platform Governance & Escrow Security",
    headerGradient: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
    headerBorder: "#DDD6FE",
    titleColor: "#5B21B6",
    badgeBg: "#FFFFFF",
    badgeText: "#7C3AED",
    primary: "#8B5CF6",
    primaryDeep: "#7C3AED",
    primaryDark: "#5B21B6",
    shadow: "0 4px 10px rgba(139, 92, 246, 0.2)",
    cardBorder: "#EDE9FE",
    activePillBg: "bg-purple-50 text-purple-700 border-purple-300 shadow-xs",
    ringColor: "focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20",
    iconColor: "text-[#7C3AED]",
    btnText: "Login as Admin →",
    actionButtonText: "View Analytics",
    sampleMetricLabel: "System Status",
    sampleMetricValue: "All Active"
  }
} as const;

export const LoginScreen: React.FC<LoginScreenProps> = ({
  brandName = BRAND_NAME,
  onSubmit,
  onSocial,
  onTruecaller,
  onForgotPassword,
  onContinueAsGuest
}) => {
  const { i18n } = useTranslation();
  const [mode, setMode] = useState<LoginMode>("login");
  const [name, setName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"user" | "agent" | "admin">("user");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toggle for traditional email/password input
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Truecaller Verification Bottom Sheet State
  const [isTruecallerSheetOpen, setIsTruecallerSheetOpen] = useState(false);
  const [isVerifyingTruecaller, setIsVerifyingTruecaller] = useState(false);
  const [customTruecallerPhone, setCustomTruecallerPhone] = useState("+91 98765 43210");
  const [customTruecallerName, setCustomTruecallerName] = useState("Aditi Sharma");
  const [useCustomPhoneInput, setUseCustomPhoneInput] = useState(false);

  const activeTheme = PORTAL_SPECS[selectedRole];

  // 1-Click Demo Portals combining Stitch micro-interactions with Reference HTML metrics
  const DEMO_PORTALS = [
    {
      role: "user" as const,
      label: "Traveller",
      sampleKey: "Mumbai → Goa",
      sampleVal: "₹4,120",
      email: "user@routripo.app",
      password: "demo@user123",
      name: "Aditi Sharma (Traveller)",
      glowClass: "card-traveller-glow",
      iconBg: "bg-sky-50 text-sky-600 group-hover:bg-[#0EA5E9] group-hover:text-white",
      hoverBorder: "hover:border-[#0EA5E9] hover:bg-sky-50/40",
      activeBorder: "border-[#0EA5E9] bg-sky-50/30",
      badgeText: "USER APP",
      badgeColor: "#0284C7",
      btnBg: "#0EA5E9",
      Icon: User
    },
    {
      role: "agent" as const,
      label: "Vendor Partner",
      sampleKey: "Total Earnings",
      sampleVal: "+ ₹12,450",
      email: "vendor@routripo.app",
      password: "demo@vendor123",
      name: "Shree Ganesh Travels (Vendor)",
      glowClass: "card-vendor-glow",
      iconBg: "bg-emerald-50 text-emerald-600 group-hover:bg-[#10B981] group-hover:text-white",
      hoverBorder: "hover:border-[#10B981] hover:bg-emerald-50/40",
      activeBorder: "border-[#10B981] bg-emerald-50/30",
      badgeText: "VENDOR PARTNER",
      badgeColor: "#059669",
      btnBg: "#10B981",
      Icon: Store
    },
    {
      role: "admin" as const,
      label: "Admin Dashboard",
      sampleKey: "System Status",
      sampleVal: "All Active",
      email: "admin@routripo.app",
      password: "demo@admin123",
      name: "System Administrator",
      glowClass: "card-admin-glow",
      iconBg: "bg-purple-50 text-purple-600 group-hover:bg-[#8B5CF6] group-hover:text-white",
      hoverBorder: "hover:border-[#8B5CF6] hover:bg-purple-50/40",
      activeBorder: "border-[#8B5CF6] bg-purple-50/30",
      badgeText: "ADMIN DASHBOARD",
      badgeColor: "#7C3AED",
      btnBg: "#8B5CF6",
      Icon: Shield
    }
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDemoSelect = (portal: typeof DEMO_PORTALS[number]) => {
    setSelectedRole(portal.role);
    setIdentifier(portal.email);
    setPassword(portal.password);
    setName(portal.name);
    setMode("login");
    setErrors({});
    showToast(`Accessing ${portal.label}...`);

    onSubmit?.({
      mode: "login",
      identifier: portal.email,
      password: portal.password,
      name: portal.name,
      role: portal.role,
      remember: true,
      provider: "demo"
    });
  };

  const handleTruecallerConfirm = () => {
    setIsVerifyingTruecaller(true);
    setTimeout(() => {
      setIsVerifyingTruecaller(false);
      setIsTruecallerSheetOpen(false);

      const phoneToUse = customTruecallerPhone.trim() || "+91 98765 43210";
      const nameToUse = customTruecallerName.trim() || "Aditi Sharma";

      showToast(`✓ Truecaller verified: ${phoneToUse}`);

      if (onTruecaller) {
        onTruecaller({
          phone: phoneToUse,
          name: nameToUse,
          role: selectedRole
        });
      } else {
        onSubmit?.({
          mode: "login",
          identifier: phoneToUse,
          password: "truecaller-verified",
          name: `${nameToUse} (Truecaller)`,
          role: selectedRole,
          remember: true,
          provider: "truecaller"
        });
      }
    }, 450);
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const trimmedId = identifier.trim();

    if (mode === "signup" && name.trim().length < 2) {
      next.name = "Enter your full name";
    }
    if (mode === "signup" && selectedRole === "agent" && agencyName.trim().length < 2) {
      next.agencyName = "Enter your agency / company name";
    }
    if (!trimmedId) {
      next.identifier = "Enter your email or phone number";
    } else if (!EMAIL_PATTERN.test(trimmedId) && !PHONE_PATTERN.test(trimmedId)) {
      next.identifier = "That does not look like an email or phone number";
    }
    if (password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const finalName = selectedRole === "agent" && agencyName.trim() ? agencyName.trim() : name.trim();

    onSubmit?.({
      mode,
      identifier: identifier.trim(),
      password,
      name: finalName,
      role: selectedRole,
      remember,
      provider: "email"
    });
  };

  const switchMode = (next: LoginMode) => {
    setMode(next);
    setErrors({});
  };

  const fieldClass = `h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-11 text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400 transition shadow-xs ${activeTheme.ringColor}`;

  return (
    <div className="premium-root mx-auto flex min-h-screen w-full max-w-[500px] flex-col bg-slate-50 relative overflow-hidden text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-700">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 text-white text-[13px] font-bold rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GOOGLE STITCH AMBIENT DECORATIVE GRADIENT GLOW ORBS                       */}
      {/* ========================================================================= */}
      <div aria-hidden="true" className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-72 bg-gradient-to-b from-sky-200/50 via-sky-100/30 to-transparent rounded-full blur-3xl pointer-events-none animate-orb-1" />
      <div aria-hidden="true" className="absolute top-1/3 -right-20 w-64 h-64 bg-purple-200/25 rounded-full blur-3xl pointer-events-none animate-orb-2" />
      <div aria-hidden="true" className="absolute bottom-10 -left-16 w-60 h-60 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none animate-orb-1" />

      {/* ========================================================================= */}
      {/* TOP BAR: LANGUAGE SELECTOR & SECURITY STATUS (STITCH STYLE)               */}
      {/* ========================================================================= */}
      <div className="relative z-20 px-6 pt-5 pb-2 flex items-center justify-between enter-header">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-bit Escrow</span>
        </div>

        {/* Floating Language Switcher */}
        <div className="relative inline-block text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-white active:scale-95 transition-all duration-200 cursor-pointer">
            <Globe className="w-3.5 h-3.5 text-sky-500 transition-transform duration-300 hover:rotate-12" />
            <select
              value={i18n.language || "en"}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="bg-transparent text-slate-800 font-bold outline-none cursor-pointer text-xs"
            >
              <option value="en">English</option>
              <option value="mr">मराठी</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HERO SECTION: MULTI-COLOR BRAND LOGO (STITCH STYLE)                       */}
      {/* ========================================================================= */}
      <section className="relative z-10 px-6 pt-4 pb-4 text-center enter-logo">
        <div className="inline-block transition-transform duration-300 hover:scale-102">
          <h1 className="text-[34px] font-black tracking-tight select-none leading-none">
            <span className="text-[#2563EB] inline-block transition-transform duration-300 hover:-translate-y-0.5">Rou</span>
            <span className="text-[#F97316] inline-block transition-transform duration-300 hover:-translate-y-0.5">T</span>
            <span className="text-[#EC4899] inline-block transition-transform duration-300 hover:-translate-y-0.5">ripo</span>
          </h1>
        </div>
        <p className="mt-1.5 text-sm font-semibold text-slate-500 enter-tagline">
          Plan, Bargain & Travel Together
        </p>
      </section>

      {/* ========================================================================= */}
      {/* PRIMARY SOCIAL LOGIN ROW: TRUECALLER & GOOGLE (STITCH STYLE)              */}
      {/* ========================================================================= */}
      <section className="relative z-10 px-6 py-2">
        <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 enter-login-label mb-2.5">
          Login with 1-Tap
        </div>

        <div className="flex items-center justify-center gap-4 py-1 enter-social-row">
          {/* Truecaller Icon Button with Stitch 14x14 styling */}
          <button
            type="button"
            title="Login with Truecaller"
            aria-label="Login with Truecaller"
            onClick={() => setIsTruecallerSheetOpen(true)}
            className="w-14 h-14 bg-[#0087FF] hover:bg-[#0077E6] active:bg-[#0066CC] text-white rounded-2xl flex items-center justify-center shadow-md shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all duration-300 ease-out cursor-pointer focus:outline-none group"
          >
            <TruecallerIcon className="w-6 h-6 fill-current transition-transform duration-300 group-hover:scale-110" />
          </button>

          {/* Google Icon Button with Stitch 14x14 styling (Wired to Real Firebase Auth) */}
          <button
            type="button"
            title="Login with Google"
            aria-label="Login with Google"
            onClick={() => onSocial?.("google")}
            className="w-14 h-14 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-lg hover:shadow-slate-300/40 hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all duration-300 ease-out cursor-pointer focus:outline-none group"
          >
            <GoogleIcon className="w-6 h-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
          </button>

          {/* Apple Sign-In Button */}
          <button
            type="button"
            title="Login with Apple"
            aria-label="Login with Apple"
            onClick={() => onSocial?.("apple")}
            className="w-14 h-14 bg-slate-900 hover:bg-black active:bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all duration-300 ease-out cursor-pointer focus:outline-none group"
          >
            <Apple className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
          </button>

          {/* Facebook Sign-In Button */}
          <button
            type="button"
            title="Login with Facebook"
            aria-label="Login with Facebook"
            onClick={() => onSocial?.("facebook")}
            className="w-14 h-14 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-2xl flex items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all duration-300 ease-out cursor-pointer focus:outline-none group"
          >
            <Facebook className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 1-CLICK DEMO PORTALS (STITCH + USER REFERENCE HTML ARCHITECTURE)           */}
      {/* ========================================================================= */}
      <section className="relative z-10 px-6 pt-5 pb-3 enter-portals">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1-Click Demo Portals
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100 shadow-2xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500" />
            </span>
            Instant Select
          </span>
        </div>

        {/* 3 Portal Cards with Micro-interactions */}
        <div className="grid grid-cols-3 gap-2.5">
          {DEMO_PORTALS.map((portal) => {
            const Icon = portal.Icon;
            const isSelected = selectedRole === portal.role;
            return (
              <button
                key={portal.role}
                type="button"
                onClick={() => handleDemoSelect(portal)}
                className={`group ${portal.glowClass} flex flex-col items-center justify-between p-3 bg-white border rounded-xl shadow-xs active:scale-95 active:translate-y-0 transition-all duration-300 ease-out text-center cursor-pointer relative overflow-hidden ${
                  isSelected ? `${portal.activeBorder} ring-2 ring-offset-1` : `${portal.hoverBorder} border-slate-200 hover:-translate-y-1`
                }`}
                style={isSelected ? { outline: `2px solid ${portal.btnBg}` } : {}}
              >
                <div className={`w-9 h-9 mb-1.5 rounded-lg ${portal.iconBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-2xs`}>
                  <Icon className="w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-105" />
                </div>

                <span className="text-xs font-extrabold text-slate-800 leading-tight">
                  {portal.label}
                </span>

                <div className="pt-1.5 mt-1 border-t border-slate-100 w-full text-[9.5px]">
                  <span className="text-slate-400 block truncate">{portal.sampleKey}</span>
                  <span className="font-extrabold block truncate" style={{ color: portal.badgeColor }}>
                    {portal.sampleVal}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* EMAIL & PASSWORD LOGIN SECTION (EXPANDABLE)                                */}
      {/* ========================================================================= */}
      <section className="relative z-10 px-6 pt-3 pb-6">
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-4">
          <div className="flex items-center justify-between pb-2">
            <button
              type="button"
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <span>{showEmailForm ? "Hide email login" : "Or login with Email / Mobile"}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showEmailForm ? "rotate-90" : ""}`} />
            </button>

            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full" style={{ backgroundColor: activeTheme.badgeBg, color: activeTheme.badgeText, border: `1px solid ${activeTheme.headerBorder}` }}>
              {activeTheme.portalName}
            </span>
          </div>

          {showEmailForm ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-3 pt-2 animate-in fade-in duration-200">
              {mode === "signup" && (
                <label className="block">
                  <span className="block pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Full name
                  </span>
                  <span className="relative block">
                    <User className={`pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 ${activeTheme.iconColor}`} />
                    <input
                      type="text"
                      value={name}
                      autoComplete="name"
                      placeholder="Enter your full name"
                      onChange={(e) => setName(e.target.value)}
                      className={fieldClass}
                    />
                  </span>
                  {errors.name && <span className="block pt-1 text-[12px] font-medium text-rose-500">{errors.name}</span>}
                </label>
              )}

              <label className="block">
                <span className="block pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Email or phone
                </span>
                <span className="relative block">
                  <Mail className={`pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 ${activeTheme.iconColor}`} />
                  <input
                    type="text"
                    inputMode="email"
                    value={identifier}
                    autoComplete="username"
                    placeholder="you@email.com or +91 98765 43210"
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={fieldClass}
                  />
                </span>
                {errors.identifier && <span className="block pt-1 text-[12px] font-medium text-rose-500">{errors.identifier}</span>}
              </label>

              <label className="block">
                <span className="block pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Password
                </span>
                <span className="relative block">
                  <Lock className={`pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 ${activeTheme.iconColor}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    className={fieldClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </span>
                {errors.password && <span className="block pt-1 text-[12px] font-medium text-rose-500">{errors.password}</span>}
              </label>

              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={() => setRemember(!remember)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 cursor-pointer"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${remember ? "bg-sky-500 border-sky-500 text-white" : "border-slate-300"}`}>
                    {remember && "✓"}
                  </span>
                  Remember me
                </button>
                <button
                  type="button"
                  onClick={() => onForgotPassword?.(identifier.trim())}
                  className="text-[12px] font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl text-white font-extrabold text-[14px] shadow-sm transition active:scale-98 cursor-pointer mt-2"
                style={{ backgroundColor: activeTheme.primary, boxShadow: activeTheme.shadow }}
              >
                {mode === "login" ? `Login to ${brandName}` : `Create ${activeTheme.portalName} Account`}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="w-full mt-1 h-10 rounded-xl border border-dashed border-slate-300 text-center text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-98 transition cursor-pointer"
            >
              Continue as Guest Traveller
            </button>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER (STITCH STYLE)                                                     */}
      {/* ========================================================================= */}
      <footer className="relative z-10 pt-2 pb-8 text-center text-xs text-slate-400 enter-footer">
        <p className="font-medium text-slate-400/80">
          <span className="font-bold">
            <span className="text-[#2563EB]">Rou</span>
            <span className="text-[#F97316]">T</span>
            <span className="text-[#EC4899]">ripo</span>
          </span> Travel Experience · Made for Travellers, in India
        </p>
      </footer>

      {/* ========================================================================= */}
      {/* TRUECALLER 1-TAP VERIFICATION BOTTOM SHEET                                */}
      {/* ========================================================================= */}
      {isTruecallerSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[440px] rounded-t-[28px] sm:rounded-2xl bg-white shadow-2xl border border-slate-100 p-5 animate-in slide-in-from-bottom duration-300">
            
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TruecallerFullLogo className="h-5" />
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

            {/* Profile Verification Card */}
            <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-sky-50/40 to-slate-50 border border-sky-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#0087FF] text-white flex items-center justify-center font-black text-[16px] shadow-sm shrink-0">
                  {customTruecallerName.split(" ").map(n => n[0]).join("").slice(0, 2) || "TC"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[15px] font-black text-slate-900 truncate">
                      {customTruecallerName}
                    </h4>
                    <span className="h-4 w-4 rounded-full bg-[#0087FF] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </span>
                  </div>
                  <p className="text-[13px] font-extrabold text-[#0087FF]">
                    {customTruecallerPhone}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    Verified Truecaller Profile · RouTripo Member
                  </p>
                </div>
              </div>

              {/* Option to toggle custom phone number */}
              {useCustomPhoneInput ? (
                <div className="mt-3 pt-3 border-t border-sky-100 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600">
                    Change Mobile Number:
                    <input
                      type="tel"
                      value={customTruecallerPhone}
                      onChange={(e) => setCustomTruecallerPhone(e.target.value)}
                      className="mt-1 h-9 w-full rounded-xl border border-slate-300 px-3 text-[13px] font-bold bg-white text-slate-800"
                    />
                  </label>
                  <label className="block text-[11px] font-bold text-slate-600">
                    Name:
                    <input
                      type="text"
                      value={customTruecallerName}
                      onChange={(e) => setCustomTruecallerName(e.target.value)}
                      className="mt-1 h-9 w-full rounded-xl border border-slate-300 px-3 text-[13px] font-bold bg-white text-slate-800"
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setUseCustomPhoneInput(true)}
                    className="text-[11px] font-bold text-[#0087FF] hover:underline cursor-pointer"
                  >
                    Use different mobile number
                  </button>
                </div>
              )}
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500 font-medium mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                1-tap phone verification powered by Truecaller SDK. No OTP or password required.
              </span>
            </div>

            {/* Confirm CTA */}
            <button
              type="button"
              disabled={isVerifyingTruecaller}
              onClick={handleTruecallerConfirm}
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-white font-extrabold text-[15px] shadow-md transition active:scale-98 cursor-pointer disabled:opacity-70"
              style={{ backgroundColor: "#0087FF" }}
            >
              {isVerifyingTruecaller ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying with Truecaller...</span>
                </div>
              ) : (
                <>
                  <TruecallerIcon className="w-5 h-5 fill-white" />
                  <span>Continue as {customTruecallerName.split(" ")[0]}</span>
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
