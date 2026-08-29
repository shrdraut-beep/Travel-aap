import React, { useState } from "react";
import {
  Apple,
  Eye,
  EyeOff,
  Facebook,
  Chrome,
  Lock,
  Mail,
  Plane,
  User,
  type LucideIcon
} from "lucide-react";

export type LoginMode = "login" | "signup";
export type SocialProvider = "google" | "facebook" | "apple";

export interface LoginPayload {
  mode: LoginMode;
  identifier: string;
  password: string;
  name?: string;
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
  { id: "facebook", label: "Facebook", Icon: Facebook },
  { id: "apple", label: "Apple", Icon: Apple }
];

/**
 * Login / sign-up screen in the reference kit language: sky panel with cloud
 * silhouettes, white sheet, violet outlined controls and D-DIN typography.
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({
  brandName = "RouTripO",
  onSubmit,
  onSocial,
  onForgotPassword,
  onContinueAsGuest
}) => {
  const [mode, setMode] = useState<LoginMode>("login");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const trimmedId = identifier.trim();

    if (mode === "signup" && name.trim().length < 2) {
      next.name = "Enter your full name";
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit?.({
      mode,
      identifier: identifier.trim(),
      password,
      name: mode === "signup" ? name.trim() : undefined,
      remember
    });
  };

  const switchMode = (next: LoginMode) => {
    setMode(next);
    setErrors({});
  };

  const fieldClass =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-11 text-[15px] font-medium text-[var(--premium-ink)] outline-none placeholder:text-[var(--premium-muted)] focus:border-[var(--premium-violet)]";

  return (
    <div className="premium-root mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-white">
      <header className="premium-sky-panel relative h-56 shrink-0 px-6 pt-10">
        <div className="flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/25">
            <Plane className="h-5 w-5" />
          </span>
          <span className="text-[17px] font-bold tracking-tight">{brandName}</span>
        </div>
        <h1 className="pt-6 text-[30px] font-bold leading-[1.15] tracking-tight text-white">
          {mode === "login" ? "Welcome back" : "Let's get you"}
          <br />
          {mode === "login" ? "Let's Go Travel" : "on board"}
        </h1>
      </header>

      <main className="-mt-8 flex-1 rounded-t-[32px] bg-white px-6 pb-10 pt-7 shadow-[0_-18px_40px_-30px_rgba(40,32,79,0.6)]">
        <div className="flex rounded-full bg-[var(--premium-violet-soft)] p-1">
          {(["login", "signup"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => switchMode(value)}
              className={`h-10 flex-1 rounded-full text-[14px] font-bold transition ${
                mode === value
                  ? "bg-[var(--premium-violet)] text-white"
                  : "text-[var(--premium-violet)]"
              }`}
            >
              {value === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <form className="pt-6" onSubmit={handleSubmit} noValidate>
          {mode === "signup" && (
            <label className="block pb-4">
              <span className="block pb-1.5 text-[12px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                Full name
              </span>
              <span className="relative block">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--premium-violet)]" />
                <input
                  type="text"
                  value={name}
                  autoComplete="name"
                  placeholder="Cara Sharma"
                  onChange={(event) => setName(event.target.value)}
                  className={fieldClass}
                />
              </span>
              {errors.name && (
                <span className="block pt-1 text-[12px] font-medium text-[var(--premium-pink)]">
                  {errors.name}
                </span>
              )}
            </label>
          )}

          <label className="block pb-4">
            <span className="block pb-1.5 text-[12px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
              Email or phone
            </span>
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
              <span className="block pt-1 text-[12px] font-medium text-[var(--premium-pink)]">
                {errors.identifier}
              </span>
            )}
          </label>

          <label className="block">
            <span className="block pb-1.5 text-[12px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
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
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--premium-muted)]"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </span>
            {errors.password && (
              <span className="block pt-1 text-[12px] font-medium text-[var(--premium-pink)]">
                {errors.password}
              </span>
            )}
          </label>

          <div className="flex items-center justify-between pt-4">
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
                  className={`h-4 w-4 rounded-full bg-white transition ${
                    remember ? "translate-x-4" : ""
                  }`}
                />
              </span>
              Remember me
            </button>
            <button
              type="button"
              onClick={() => onForgotPassword?.(identifier.trim())}
              className="text-[13px] font-bold text-[var(--premium-violet)]"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="premium-pill mt-6 flex h-13 w-full items-center justify-center text-[16px] font-bold active:bg-[var(--premium-violet-soft)]"
          >
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        <div className="flex items-center gap-3 py-6">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[12px] font-medium text-[var(--premium-muted)]">
            or continue with
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {SOCIALS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={`Continue with ${label}`}
              onClick={() => onSocial?.(id)}
              className="flex h-13 flex-col items-center justify-center gap-0.5 rounded-2xl border border-slate-200 bg-white py-2 active:bg-slate-50"
            >
              <Icon className="h-5 w-5 text-[var(--premium-violet)]" />
              <span className="text-[11px] font-medium text-[var(--premium-muted)]">
                {label}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onContinueAsGuest}
          className="mt-6 w-full text-center text-[13px] font-bold text-[var(--premium-muted)]"
        >
          Continue as guest
        </button>

        <p className="pt-4 text-center text-[12px] font-medium leading-relaxed text-[var(--premium-muted)]">
          {mode === "login" ? "New to " : "Already with "}
          {brandName}?{" "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            className="font-bold text-[var(--premium-pink)]"
          >
            {mode === "login" ? "Create an account" : "Log in instead"}
          </button>
        </p>
      </main>
    </div>
  );
};
