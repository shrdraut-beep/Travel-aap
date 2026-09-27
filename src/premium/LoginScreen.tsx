import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Apple,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Chrome,
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
const TruecallerIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.5 16.5c-1.2 0-2.4-.2-3.5-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.7-6.5-6.5l2.2-2.2c.3-.3.4-.7.2-1-.4-1.1-.6-2.3-.6-3.5 0-.6-.4-1-1-1H3.5C2.9 4.1 2.4 4.6 2.5 5.2c.8 9.3 8.3 16.8 17.6 17.6.6.1 1.1-.4 1.1-1v-4.3c0-.6-.4-1-1-1z" />
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

const SOCIALS: { id: SocialProvider; label: string; Icon: LucideIcon }[] = [
  { id: "google", label: "Google", Icon: Chrome },
  { id: "apple", label: "Apple", Icon: Apple },
  { id: "facebook", label: "Facebook", Icon: Facebook }
];

/**
 * 3-Tier Portal Theme Specifications (Directly matched to user reference HTML)
 * 1. User App: Soft Sky Blue (#0EA5E9, #0284C7, #0369A1, gradient #E0F2FE -> #BAE6FD)
 * 2. Vendor Partner: Fresh Mint Green (#10B981, #059669, #047857, gradient #D1FAE5 -> #A7F3D0)
 * 3. Admin Dashboard: Soft Lavender (#8B5CF6, #7C3AED, #5B21B6, gradient #EDE9FE -> #DDD6FE)
 */
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

  // Truecaller Verification Bottom Sheet State
  const [isTruecallerSheetOpen, setIsTruecallerSheetOpen] = useState(false);
  const [isVerifyingTruecaller, setIsVerifyingTruecaller] = useState(false);
  const [customTruecallerPhone, setCustomTruecallerPhone] = useState("+91 98765 43210");
  const [customTruecallerName, setCustomTruecallerName] = useState("Aditi Sharma");
  const [useCustomPhoneInput, setUseCustomPhoneInput] = useState(false);

  const activeTheme = PORTAL_SPECS[selectedRole];

  // 1-Click Demo Accounts configured strictly following the user reference HTML layout
  const DEMO_ACCOUNTS = [
    {
      role: "user" as const,
      portalBadge: "USER APP",
      title: `✈ ${brandName}`,
      sampleKey: "Mumbai → Goa",
      sampleVal: "₹4,120",
      email: "user@routripo.app",
      password: "demo@user123",
      name: "Aditi Sharma (Traveller)",
      headerGrad: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
      headerBorder: "#BAE6FD",
      titleColor: "#0369A1",
      badgeColor: "#0284C7",
      cardBorder: "#E0F2FE",
      cardShadow: "0 4px 15px rgba(14, 165, 233, 0.08)",
      btnBg: "#0EA5E9",
      btnShadow: "0 4px 10px rgba(14, 165, 233, 0.2)",
      actionBtnText: "Book Trip",
      actionText: "Login User →"
    },
    {
      role: "agent" as const,
      portalBadge: "VENDOR PARTNER",
      title: `✈ ${brandName}`,
      sampleKey: "Total Earnings",
      sampleVal: "+ ₹12,450",
      email: "vendor@routripo.app",
      password: "demo@vendor123",
      name: "Shree Ganesh Travels (Vendor)",
      headerGrad: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
      headerBorder: "#A7F3D0",
      titleColor: "#047857",
      badgeColor: "#059669",
      cardBorder: "#D1FAE5",
      cardShadow: "0 4px 15px rgba(16, 185, 129, 0.08)",
      btnBg: "#10B981",
      btnShadow: "0 4px 10px rgba(16, 185, 129, 0.2)",
      actionBtnText: "Manage Bookings",
      actionText: "Login Vendor →"
    },
    {
      role: "admin" as const,
      portalBadge: "ADMIN DASHBOARD",
      title: `✈ ${brandName}`,
      sampleKey: "System Status",
      sampleVal: "All Active",
      email: "admin@routripo.app",
      password: "demo@admin123",
      name: "System Administrator",
      headerGrad: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
      headerBorder: "#DDD6FE",
      titleColor: "#5B21B6",
      badgeColor: "#7C3AED",
      cardBorder: "#EDE9FE",
      cardShadow: "0 4px 15px rgba(139, 92, 246, 0.08)",
      btnBg: "#8B5CF6",
      btnShadow: "0 4px 10px rgba(139, 92, 246, 0.2)",
      actionBtnText: "View Analytics",
      actionText: "Login Admin →"
    }
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[number]) => {
    setIdentifier(account.email);
    setPassword(account.password);
    setName(account.name);
    setSelectedRole(account.role);
    setMode("login");
    setErrors({});
    showToast(`Accessing as ${account.portalBadge}...`);

    onSubmit?.({
      mode: "login",
      identifier: account.email,
      password: account.password,
      name: account.name,
      role: account.role,
      remember: true,
      provider: "demo"
    });
  };

  // Truecaller Instant 1-Tap Login
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
    <div className="premium-root mx-auto flex min-h-screen w-full max-w-[540px] flex-col bg-slate-50 transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 text-white text-[13px] font-bold rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DYNAMIC PORTAL HEADER (Colors smoothly adapt based on user reference HTML) */}
      <header
        className="relative shrink-0 px-6 pt-5 pb-9 flex flex-col justify-between transition-all duration-300 shadow-sm"
        style={{
          background: activeTheme.headerGradient,
          borderBottom: `1px solid ${activeTheme.headerBorder}`
        }}
      >
        <div className="flex items-center justify-between pb-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform active:scale-95"
              style={{ color: activeTheme.titleColor }}
            >
              <Plane className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[21px] font-black tracking-tight leading-none"
                  style={{ color: activeTheme.titleColor }}
                >
                  {brandName}
                </span>
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs border tracking-wider uppercase"
                  style={{
                    backgroundColor: activeTheme.badgeBg,
                    color: activeTheme.badgeText,
                    borderColor: activeTheme.headerBorder
                  }}
                >
                  {activeTheme.portalName}
                </span>
              </div>
              <span className="text-[11px] font-bold opacity-80" style={{ color: activeTheme.titleColor }}>
                Premium Travel SuperApp
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white shadow-xs">
              <Globe className="w-3.5 h-3.5 text-slate-700" />
              <select
                value={i18n.language || "en"}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-transparent text-slate-800 font-bold outline-none cursor-pointer text-[11px]"
              >
                <option value="en">English</option>
                <option value="mr">मराठी</option>
              </select>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 text-slate-800 text-[11px] font-bold backdrop-blur-md border border-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Escrow</span>
            </span>
          </div>
        </div>

        {/* Dynamic Portal Greeting */}
        <div className="pt-2">
          <h1
            className="text-[26px] font-black leading-tight tracking-tight drop-shadow-xs"
            style={{ color: activeTheme.titleColor }}
          >
            {mode === "login" ? `Welcome to ${brandName}!` : `Join ${brandName}`}
          </h1>
          <p className="text-[14px] font-semibold opacity-90 pt-0.5" style={{ color: activeTheme.titleColor }}>
            {mode === "login" ? activeTheme.portalSubtitle : activeTheme.signupSubtitle}
          </p>
        </div>
      </header>

      {/* Main Form Sheet */}
      <main className="-mt-4 flex-1 rounded-t-[28px] bg-white px-5 pb-12 pt-5 shadow-[0_-12px_30px_-15px_rgba(0,0,0,0.1)] border-t border-slate-100">
        
        {/* 1. INSTANT 1-TAP LOGIN WITH TRUECALLER */}
        <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-sky-50/70 via-blue-50/50 to-indigo-50/60 border border-sky-100 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0087FF] text-white shadow-2xs">
                <TruecallerIcon className="w-3.5 h-3.5 fill-white" />
              </span>
              <span className="text-[12px] font-black uppercase tracking-wide text-slate-800">
                Truecaller 1-Tap Login
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-[#0087FF] bg-white px-2 py-0.5 rounded-full border border-sky-200 shadow-2xs">
              Zero OTP Required
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsTruecallerSheetOpen(true)}
            className="w-full h-11 rounded-xl flex items-center justify-between px-3.5 text-white font-bold transition shadow-sm hover:opacity-95 active:scale-98 cursor-pointer"
            style={{ backgroundColor: "#0087FF" }}
          >
            <div className="flex items-center gap-2">
              <TruecallerIcon className="w-4.5 h-4.5 fill-white shrink-0" />
              <span className="text-[13.5px] font-extrabold tracking-tight">Login with Truecaller</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-lg border border-white/20">
              <span>Instant Verify</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </button>
        </div>

        {/* 2. ONE-CLICK DEMO ACCOUNTS PANEL (Strictly matching reference HTML structure) */}
        <div className="mb-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] text-white font-black shadow-xs">
                ⚡
              </span>
              <span className="text-[12px] font-black uppercase tracking-wide text-slate-800">
                1-Click Portal Demo Access
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              Select & Enter
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.role}
                onClick={() => setSelectedRole(acc.role)}
                className={`group flex flex-col justify-between rounded-xl bg-white border overflow-hidden shadow-2xs transition-all cursor-pointer ${
                  selectedRole === acc.role ? "ring-2 ring-offset-1" : "hover:border-slate-300"
                }`}
                style={{
                  borderColor: acc.cardBorder,
                  ...(selectedRole === acc.role ? { outline: `2px solid ${acc.btnBg}` } : {})
                }}
              >
                {/* Mini Portal Header */}
                <div
                  className="px-2 py-1.5 text-center border-b"
                  style={{
                    background: acc.headerGrad,
                    borderBottomColor: acc.headerBorder
                  }}
                >
                  <h4
                    className="m-0 text-[11px] font-bold leading-tight truncate"
                    style={{ color: acc.titleColor }}
                  >
                    {acc.title}
                  </h4>
                  <span
                    className="inline-block text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full mt-0.5 tracking-wider uppercase bg-white"
                    style={{ color: acc.badgeColor }}
                  >
                    {acc.portalBadge}
                  </span>
                </div>

                {/* Card Content & Action Button */}
                <div className="p-2 flex flex-col justify-between flex-1">
                  <div className="pb-2 text-[10px]">
                    <div className="text-slate-500 font-medium truncate">{acc.sampleKey}</div>
                    <div className="font-extrabold truncate" style={{ color: acc.badgeColor }}>
                      {acc.sampleVal}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDemoLogin(acc);
                    }}
                    className="w-full py-1.5 text-center text-[10px] font-black rounded-lg text-white shadow-xs active:scale-95 transition cursor-pointer"
                    style={{
                      backgroundColor: acc.btnBg,
                      boxShadow: acc.btnShadow
                    }}
                  >
                    {acc.actionBtnText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. MODE TABS (Login / Sign Up) */}
        <div className="flex items-center justify-between gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 mb-3">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`h-9 flex-1 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            style={mode === "login" ? { color: activeTheme.primaryDark } : {}}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`h-9 flex-1 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            style={mode === "signup" ? { color: activeTheme.primaryDark } : {}}
          >
            Sign up
          </button>
        </div>

        {/* 4. ACCOUNT TYPE ROLE SELECTOR */}
        <div className="pt-1 pb-3">
          <span className="block pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Select Portal Account Type
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole("user")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                selectedRole === "user"
                  ? PORTAL_SPECS.user.activePillBg
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Traveller</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("agent")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                selectedRole === "agent"
                  ? PORTAL_SPECS.agent.activePillBg
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Vendor</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("admin")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
                selectedRole === "admin"
                  ? PORTAL_SPECS.admin.activePillBg
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* 5. STANDARD LOGIN / SIGNUP FORM */}
        <div className="animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
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
                    onChange={(event) => setName(event.target.value)}
                    className={fieldClass}
                  />
                </span>
                {errors.name && (
                  <span className="block pt-1 text-[12px] font-medium text-rose-500">
                    {errors.name}
                  </span>
                )}
              </label>
            )}

            {mode === "signup" && selectedRole === "agent" && (
              <label className="block">
                <span className="block pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Agency / Business name
                </span>
                <span className="relative block">
                  <Briefcase className={`pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 ${activeTheme.iconColor}`} />
                  <input
                    type="text"
                    value={agencyName}
                    placeholder="e.g. Shree Ganesh Travels Ltd"
                    onChange={(event) => setAgencyName(event.target.value)}
                    className={fieldClass}
                  />
                </span>
                {errors.agencyName && (
                  <span className="block pt-1 text-[12px] font-medium text-rose-500">
                    {errors.agencyName}
                  </span>
                )}
              </label>
            )}

            <label className="block">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Email address or mobile phone
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: activeTheme.badgeBg,
                    color: activeTheme.badgeText,
                    border: `1px solid ${activeTheme.headerBorder}`
                  }}
                >
                  {activeTheme.portalName}
                </span>
              </div>
              <span className="relative block">
                <Mail className={`pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 ${activeTheme.iconColor}`} />
                <input
                  type="text"
                  inputMode="email"
                  value={identifier}
                  autoComplete="username"
                  placeholder="you@email.com or +91 98765 43210"
                  onChange={(event) => setIdentifier(event.target.value)}
                  className={fieldClass}
                />
              </span>
              {errors.identifier && (
                <span className="block pt-1 text-[12px] font-medium text-rose-500">
                  {errors.identifier}
                </span>
              )}
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
                  onChange={(event) => setPassword(event.target.value)}
                  className={fieldClass}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </span>
              {errors.password && (
                <span className="block pt-1 text-[12px] font-medium text-rose-500">
                  {errors.password}
                </span>
              )}
            </label>

            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => setRemember((value) => !value)}
                className="flex items-center gap-2 text-[13px] font-medium text-slate-500 cursor-pointer"
              >
                <span
                  className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                    remember ? "bg-slate-800" : "bg-slate-200"
                  }`}
                  style={remember ? { backgroundColor: activeTheme.primary } : {}}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white shadow-xs transition ${
                      remember ? "translate-x-4" : ""
                    }`}
                  />
                </span>
                Remember me
              </button>
              <button
                type="button"
                onClick={() => onForgotPassword?.(identifier.trim())}
                className="text-[13px] font-bold hover:underline cursor-pointer"
                style={{ color: activeTheme.primaryDark }}
              >
                Forgot password?
              </button>
            </div>

            {/* Dynamic Portal CTA Button */}
            <button
              type="submit"
              className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-black text-white shadow-md active:scale-98 transition-all hover:opacity-95 cursor-pointer"
              style={{
                backgroundColor: activeTheme.primary,
                boxShadow: activeTheme.shadow
              }}
            >
              {mode === "login"
                ? `Login to ${brandName} (${activeTheme.portalName})`
                : `Create My ${activeTheme.portalName} Account`}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 py-4">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              or continue with
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-3 gap-2">
            {SOCIALS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-label={`Continue with ${label}`}
                onClick={() => onSocial?.(id)}
                className="flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-2 shadow-2xs hover:bg-slate-50 active:scale-95 transition cursor-pointer"
              >
                <Icon className="h-4 w-4 text-slate-700" />
                <span className="text-[12px] font-bold text-slate-700">
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Guest Action */}
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="mt-3 w-full h-11 rounded-2xl border border-dashed border-slate-300 text-center text-[13px] font-bold text-slate-600 hover:bg-slate-50 active:scale-98 transition cursor-pointer"
          >
            Continue as Guest Traveller
          </button>

          {/* Mode toggle */}
          <p className="pt-4 text-center text-[13px] font-medium leading-relaxed text-slate-500">
            {mode === "login" ? "New to " : "Already registered with "}
            {brandName}?{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="font-bold hover:underline cursor-pointer"
              style={{ color: activeTheme.primaryDeep }}
            >
              {mode === "login" ? "Create an account" : "Log in instead"}
            </button>
          </p>
        </div>

        {/* Security & Regulatory Footer */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit AES Encrypted</span>
          </span>
          <span>•</span>
          <span>Truecaller 1-Tap</span>
          <span>•</span>
          <span>RBI Escrow Regulated</span>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* TRUECALLER 1-TAP VERIFICATION BOTTOM SHEET / MODAL                        */}
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
