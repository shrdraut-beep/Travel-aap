import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Apple,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Chrome,
  Crown,
  Eye,
  EyeOff,
  Facebook,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Plane,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  type LucideIcon
} from "lucide-react";

export type LoginMode = "login" | "signup";
export type SocialProvider = "google" | "facebook" | "apple";

export interface LoginPayload {
  mode: LoginMode;
  identifier: string;
  password: string;
  name?: string;
  role?: "user" | "agent" | "admin";
  remember: boolean;
}

export interface LoginScreenProps {
  brandName?: string;
  onSubmit?: (payload: LoginPayload) => void;
  onSocial?: (provider: SocialProvider) => void;
  onForgotPassword?: (identifier: string) => void;
  onContinueAsGuest?: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{7,14}$/;

const SOCIALS: { id: SocialProvider; label: string; Icon: LucideIcon }[] = [
  { id: "google", label: "Google", Icon: Chrome },
  { id: "apple", label: "Apple", Icon: Apple },
  { id: "facebook", label: "Facebook", Icon: Facebook }
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  brandName = "RoutTripo",
  onSubmit,
  onSocial,
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

  const DEMO_ACCOUNTS = [
    {
      role: "user" as const,
      label: "Traveller",
      tag: "Demo User",
      email: "user@routripo.app",
      password: "demo@user123",
      name: "Demo Traveller (Aditi)",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      btnColor: "bg-purple-600 hover:bg-purple-700 text-white",
      borderColor: "border-purple-200/80 hover:border-purple-400",
      iconSrc: "/icons/profile.png",
      actionText: "Login User →"
    },
    {
      role: "agent" as const,
      label: "Vendor",
      tag: "Demo Vendor",
      email: "vendor@routripo.app",
      password: "demo@vendor123",
      name: "Shree Ganesh Travels (Vendor)",
      badgeColor: "bg-sky-100 text-sky-700 border-sky-200",
      btnColor: "bg-sky-600 hover:bg-sky-700 text-white",
      borderColor: "border-sky-200/80 hover:border-sky-400",
      iconSrc: "/icons/cab_hotel_package_v1.png",
      actionText: "Login Vendor →"
    },
    {
      role: "admin" as const,
      label: "Admin",
      tag: "Demo Admin",
      email: "admin@routripo.app",
      password: "demo@admin123",
      name: "System Administrator",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
      borderColor: "border-emerald-200/80 hover:border-emerald-400",
      iconSrc: "/icons/secret.png",
      actionText: "Login Admin →"
    }
  ];

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[number]) => {
    setIdentifier(account.email);
    setPassword(account.password);
    setName(account.name);
    setSelectedRole(account.role);
    setMode("login");
    setErrors({});
    showToast(`Accessing as ${account.tag}...`);

    onSubmit?.({
      mode: "login",
      identifier: account.email,
      password: account.password,
      name: account.name,
      role: account.role,
      remember: true
    });
  };

  const handleFillDemo = (account: typeof DEMO_ACCOUNTS[number], e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIdentifier(account.email);
    setPassword(account.password);
    setName(account.name);
    setSelectedRole(account.role);
    setMode("login");
    setErrors({});
    showToast(`Form filled with ${account.tag} credentials`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
      remember
    });
  };

  const switchMode = (next: LoginMode) => {
    setMode(next);
    setErrors({});
  };

  const fieldClass =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-11 text-[15px] font-medium text-[var(--premium-ink)] outline-none placeholder:text-[var(--premium-muted)] focus:border-[var(--premium-violet)] transition shadow-xs";

  return (
    <div className="premium-root mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-slate-50">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 text-white text-[13px] font-bold rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Sky Panel */}
      <header className="premium-sky-panel relative h-32 shrink-0 px-6 pt-4 flex flex-col justify-between pb-5">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-md shadow-sm">
              <Plane className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[19px] font-black tracking-tight block leading-none">{brandName}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Premium Travel SuperApp</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-md border border-white/30">
              <Globe className="w-3.5 h-3.5 text-white/90" />
              <select
                value={i18n.language || 'en'}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer text-[11px]"
              >
                <option value="en" className="text-slate-800">English</option>
                <option value="mr" className="text-slate-800">मराठी</option>
              </select>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-md border border-white/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Escrow</span>
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-[28px] font-black leading-[1.15] tracking-tight text-white drop-shadow-sm">
            {mode === "login" ? "Welcome back!" : "Join RoutTripo"}
            <br />
            <span className="text-white/90 text-[20px] font-semibold">
              {mode === "login" ? "Plan, Bargain & Travel Together" : "Start your smart travel journey"}
            </span>
          </h1>
        </div>
      </header>

      {/* Main Form Sheet */}
      <main className="-mt-8 flex-1 rounded-t-[32px] bg-white px-6 pb-12 pt-6 shadow-[0_-18px_40px_-30px_rgba(40,32,79,0.6)]">
        
        {/* ONE-CLICK DEMO ACCOUNTS PANEL */}
        <div className="mb-5 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 p-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] text-white font-black shadow-xs">
                ⚡
              </span>
              <span className="text-[12px] font-black uppercase tracking-wide text-slate-800">
                Quick Demo Login
              </span>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Instant 1-Click Access
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.role}
                className={`group flex flex-col justify-between p-2 rounded-xl bg-white border ${acc.borderColor} shadow-2xs transition-all relative`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-100">
                    <img src={acc.iconSrc} alt={acc.label} className="w-5 h-5 object-contain shrink-0 drop-shadow-xs" />
                    <span className="text-[10.5px] font-black text-slate-800 truncate">{acc.label}</span>
                  </div>
                  <p className="text-[9.5px] font-medium text-slate-500 pt-1 truncate">{acc.email}</p>
                </div>
                <div className="pt-2 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin(acc)}
                    className={`w-full py-1 text-center text-[10px] font-black rounded-lg ${acc.btnColor} shadow-xs active:scale-95 transition cursor-pointer`}
                  >
                    {acc.actionText}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleFillDemo(acc, e)}
                    className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition text-center py-0.5"
                  >
                    Auto-fill
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium px-0.5">
            <span>Pass: <code className="text-slate-700 font-bold bg-slate-100 px-1 py-0.5 rounded">demo@user123 / vendor123 / admin123</code></span>
            <span className="text-emerald-600 font-bold">● Ready to test</span>
          </div>
        </div>

        {/* Navigation Switcher: Mode Tabs (Login / Sign Up) */}
        <div className="flex items-center justify-between gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`h-9 flex-1 rounded-xl text-[13px] font-bold transition-all ${
              mode === "login"
                ? "bg-white text-[var(--premium-violet)] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`h-9 flex-1 rounded-xl text-[13px] font-bold transition-all ${
              mode === "signup"
                ? "bg-white text-[var(--premium-violet)] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Account Role Selector */}
        <div className="pt-4 pb-1">
          <span className="block pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
            Account Type
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole("user")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[12px] font-bold border transition-all ${
                selectedRole === "user"
                  ? "bg-purple-50 text-purple-700 border-purple-300 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Traveller</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("agent")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[12px] font-bold border transition-all ${
                selectedRole === "agent"
                  ? "bg-sky-50 text-sky-700 border-sky-300 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Agent</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("admin")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[12px] font-bold border transition-all ${
                selectedRole === "admin"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* STANDARD LOGIN / SIGNUP FORM */}
        <div className="pt-3 animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="block pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                  Full name
                </span>
                <span className="relative block">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--premium-violet)]" />
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
                <span className="block pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                  Agency / Business name
                </span>
                <span className="relative block">
                  <Briefcase className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--premium-violet)]" />
                  <input
                    type="text"
                    value={agencyName}
                    placeholder="e.g. Dream Vacations Ltd"
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
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                    Email address or phone
                  </span>
                  {/* Quick role indicator if recognized */}
                  {identifier.includes("agent") && (
                    <span className="text-[10px] font-bold text-premium-sky-deep bg-premium-sky-soft px-2 py-0.5 rounded-full">
                      Agent Account
                    </span>
                  )}
                  {identifier.includes("admin") && (
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      Admin Account
                    </span>
                  )}
                </div>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--premium-violet)]" />
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
                <span className="block pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                  Password
                </span>
                <span className="relative block">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--premium-violet)]" />
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
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--premium-muted)] hover:text-slate-800"
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

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setRemember((value) => !value)}
                  className="flex items-center gap-2 text-[13px] font-medium text-[var(--premium-muted)]"
                >
                  <span
                    className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                      remember ? "bg-[var(--premium-violet)]" : "bg-slate-200"
                    }`}
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
                  className="text-[13px] font-bold text-[var(--premium-violet)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="premium-gradient-pink mt-3 flex h-13 w-full items-center justify-center rounded-2xl text-[16px] font-black text-white shadow-lg active:scale-98 transition-all hover:opacity-95"
              >
                {mode === "login" ? "Login to RoutTripo" : "Create My Account"}
              </button>
            </form>

            <div className="flex items-center gap-3 py-5">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                or continue with
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-3 gap-2.5">
              {SOCIALS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={`Continue with ${label}`}
                  onClick={() => onSocial?.(id)}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2 shadow-2xs hover:bg-slate-50 active:scale-95 transition"
                >
                  <Icon className="h-4.5 w-4.5 text-slate-800" />
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
              className="mt-4 w-full h-11 rounded-2xl border border-dashed border-slate-300 text-center text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Continue as Guest Traveller
            </button>

            {/* Mode toggle */}
            <p className="pt-5 text-center text-[13px] font-medium leading-relaxed text-slate-500">
              {mode === "login" ? "New to " : "Already registered with "}
              {brandName}?{" "}
              <button
                type="button"
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="font-bold text-[var(--premium-pink)] hover:underline"
              >
                {mode === "login" ? "Create an account" : "Log in instead"}
              </button>
            </p>
          </div>

        {/* Security & Regulatory Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-premium-sky-deep" />
            <span>256-bit AES Encrypted</span>
          </span>
          <span>•</span>
          <span>RBI Escrow Regulated</span>
          <span>•</span>
          <span>24x7 SOS Support</span>
        </div>
      </main>
    </div>
  );
};
