import React, { useState, useRef } from "react";
import { Globe, Check, Shield, Lock, ArrowLeft, RefreshCw, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { BrandLogo } from "./SharedUI";
import { signInWithGoogle } from "../../firebase";
import { privacyTranslations } from "../../data/privacyTranslations";

interface LoginScreenProps {
  onLogin: (role: string) => void;
}

type LoginStep = 'main' | 'captcha' | 'terms';
type DragDirection = 'RIGHT' | 'LEFT' | 'UP' | 'DOWN';

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [step, setStep] = useState<LoginStep>('main');
  const [selectedRole, setSelectedRole] = useState<'user' | 'agent'>('user');
  const [currentLang, setCurrentLang] = useState<'en' | 'mr' | 'hi'>('en');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- CAPTCHA STATE ---
  const DIRECTIONS: DragDirection[] = ['RIGHT', 'LEFT', 'UP', 'DOWN'];
  const [targetDirection, setTargetDirection] = useState<DragDirection>('RIGHT');
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [captchaSuccess, setCaptchaSuccess] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // --- TERMS STATE ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Initialize random direction on captcha open
  const resetCaptcha = () => {
    const randomDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    setTargetDirection(randomDir);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setCaptchaSuccess(false);
    setCaptchaError(false);
  };

  const handleStartLoginFlow = (role: 'user' | 'agent' = 'user') => {
    setSelectedRole(role);
    resetCaptcha();
    setHasScrolledToBottom(false);
    setConsentAccepted(false);
    setAuthError(null);
    setStep('captcha');
  };

  // --- CAPTCHA DRAG LOGIC (MOUSE & TOUCH) ---
  const handleDragStart = (clientX: number, clientY: number) => {
    if (captchaSuccess) return;
    setIsDragging(true);
    setCaptchaError(false);
    dragStartRef.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || captchaSuccess) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 70;
    if (distance > maxRadius) {
      const angle = Math.atan2(dy, dx);
      setDragOffset({
        x: Math.cos(angle) * maxRadius,
        y: Math.sin(angle) * maxRadius,
      });
    } else {
      setDragOffset({ x: dx, y: dy });
    }
  };

  const handleDragEnd = () => {
    if (!isDragging || captchaSuccess) return;
    setIsDragging(false);

    const threshold = 38;
    let success = false;

    if (targetDirection === 'RIGHT' && dragOffset.x > threshold && Math.abs(dragOffset.y) < 35) {
      success = true;
    } else if (targetDirection === 'LEFT' && dragOffset.x < -threshold && Math.abs(dragOffset.y) < 35) {
      success = true;
    } else if (targetDirection === 'UP' && dragOffset.y < -threshold && Math.abs(dragOffset.x) < 35) {
      success = true;
    } else if (targetDirection === 'DOWN' && dragOffset.y > threshold && Math.abs(dragOffset.x) < 35) {
      success = true;
    }

    if (success) {
      setCaptchaSuccess(true);
      setCaptchaError(false);
      // Automatically transition to Terms page upon success
      setTimeout(() => {
        setStep('terms');
      }, 500);
    } else {
      setCaptchaError(true);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // --- TERMS SCROLL ENFORCER ---
  const handleScroll = () => {
    const element = scrollContainerRef.current;
    if (!element) return;

    const threshold = 16;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + threshold;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleConsentAgreement = (checked: boolean) => {
    setConsentAccepted(checked);
    if (checked) {
      // Auto-Trigger Google Authentication immediately on acceptance (no button required)
      triggerGoogleAuth();
    }
  };

  const triggerGoogleAuth = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onLogin(selectedRole);
      } else {
        setLoading(false);
        setConsentAccepted(false);
      }
    } catch (err: any) {
      console.error("Google login failed:", err);
      setAuthError(err?.message || "Google authentication failed. Please try again.");
      setLoading(false);
      setConsentAccepted(false);
    }
  };

  const handleTestLogin = (role: string) => {
    setLoading(true);
    setTimeout(() => {
      onLogin(role);
    }, 300);
  };

  const tPrivacy = privacyTranslations[currentLang] || privacyTranslations['en'];

  // ==========================================
  // PAGE 1: MAIN LOGIN SCREEN
  // ==========================================
  if (step === 'main') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-sky-50 to-sky-100 flex flex-col justify-between items-center px-4 py-8 relative font-[Inter]">
        
        {/* TOP BAR: Language Selector */}
        <div className="w-full max-w-sm flex justify-end items-center gap-1.5 z-10">
          <Globe className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={currentLang}
            onChange={(e) => setCurrentLang(e.target.value as 'en' | 'mr' | 'hi')}
            className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-none cursor-pointer hover:bg-white transition-all shadow-xs"
          >
            <option value="en">English</option>
            <option value="mr">मराठी</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>

        {/* CENTER CONTENT */}
        <div className="w-full max-w-sm flex flex-col items-center my-auto py-6">
          
          {/* LOGO & TITLE */}
          <BrandLogo className="text-4xl sm:text-5xl justify-center mb-2" />
          <p className="text-slate-500 text-sm font-medium tracking-tight mb-8">
            Login / Signup with
          </p>

          {/* GOOGLE SIGN IN BUTTON */}
          <button
            type="button"
            onClick={() => handleStartLoginFlow('user')}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-6 rounded-2xl shadow-lg shadow-sky-900/5 border border-slate-100 flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer active:scale-[0.98] hover:shadow-xl"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm font-semibold text-slate-700">Google</span>
          </button>

          {/* DEVELOPER / TESTING MODE */}
          <div className="w-full mt-10 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                DEVELOPER / TESTING MODE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 w-full">
              <button
                type="button"
                onClick={() => handleTestLogin('user')}
                className="bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-2 rounded-xl transition-all shadow-sm active:scale-95 text-center cursor-pointer"
              >
                Test as User
              </button>
              <button
                type="button"
                onClick={() => handleTestLogin('agent')}
                className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-2 rounded-xl transition-all shadow-sm active:scale-95 text-center cursor-pointer"
              >
                Test as Partner
              </button>
              <button
                type="button"
                onClick={() => handleTestLogin('admin')}
                className="bg-[#e11d48] hover:bg-rose-700 text-white text-xs font-semibold py-2.5 px-2 rounded-xl transition-all shadow-sm active:scale-95 text-center cursor-pointer"
              >
                Test as Admin
              </button>
            </div>
          </div>

        </div>

        {/* FOOTER: Partner Login */}
        <div className="w-full text-center pb-2 z-10">
          <button
            type="button"
            onClick={() => handleStartLoginFlow('agent')}
            className="text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            Partner Login
          </button>
        </div>

        {/* AUTH LOADING OVERLAY */}
        {loading && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs flex flex-col items-center justify-center z-50">
            <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // PAGE 2: CAPTCHA / HUMAN VERIFICATION (BOX-FREE, CLEAN, THEME-MATCHED)
  // ==========================================
  if (step === 'captcha') {
    return (
      <div 
        className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-sky-50 to-sky-100 flex flex-col justify-between items-center px-4 py-8 relative font-[Inter] select-none"
        onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
        onMouseUp={handleDragEnd}
        onTouchMove={(e) => {
          if (e.touches.length > 0) {
            handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchEnd={handleDragEnd}
      >
        {/* TOP BAR */}
        <div className="w-full max-w-sm flex justify-between items-center z-10">
          <button
            type="button"
            onClick={() => setStep('main')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" /> Back
          </button>
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value as 'en' | 'mr' | 'hi')}
              className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none cursor-pointer shadow-xs"
            >
              <option value="en">English</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>

        {/* CENTER CONTENT: BOX-FREE, SEAMLESS */}
        <div className="w-full max-w-sm flex flex-col items-center my-auto py-2">
          
          <BrandLogo className="text-4xl sm:text-5xl justify-center mb-6" />

          {/* CAPTCHA SECTION */}
          <div className="w-full flex flex-col items-center">
            
            <div className="text-center mb-6">
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wider">
                Human Verification
              </h3>
              <p className="text-xs text-slate-700 font-medium mt-1">
                Drag the lock in the requested direction
              </p>
            </div>

            {/* TARGET CIRCULAR AREA */}
            <div className="relative w-44 h-44 flex items-center justify-center my-2">
              {/* Outer Subtle Guide */}
              <div className="absolute inset-0 rounded-full border-2 border-sky-300/80 bg-white/40 backdrop-blur-xs flex items-center justify-center pointer-events-none shadow-xs">
                {/* Cross lines */}
                <div className="absolute w-full h-[1px] bg-sky-200" />
                <div className="absolute h-full w-[1px] bg-sky-200" />
              </div>

              {/* Direction Indicator */}
              {targetDirection === 'RIGHT' && (
                <div className="absolute right-3 text-rose-500 font-black text-lg animate-pulse pointer-events-none">▶</div>
              )}
              {targetDirection === 'LEFT' && (
                <div className="absolute left-3 text-rose-500 font-black text-lg animate-pulse pointer-events-none">◀</div>
              )}
              {targetDirection === 'UP' && (
                <div className="absolute top-3 text-rose-500 font-black text-lg animate-pulse pointer-events-none">▲</div>
              )}
              {targetDirection === 'DOWN' && (
                <div className="absolute bottom-3 text-rose-500 font-black text-lg animate-pulse pointer-events-none">▼</div>
              )}

              {/* DRAGGABLE LOCK BUTTON */}
              <div
                onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
                onTouchStart={(e) => {
                  if (e.touches.length > 0) {
                    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                style={{
                  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                  transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
                className={`w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg border border-slate-200 cursor-grab active:cursor-grabbing z-20 transition-colors ${
                  captchaSuccess ? 'bg-emerald-50 border-emerald-500 text-emerald-600 scale-110 shadow-emerald-500/20' : 'text-slate-800'
                }`}
              >
                {captchaSuccess ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-bounce" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-800" />
                )}
              </div>
            </div>

            {/* INSTRUCTION PILL & REFRESH */}
            <div className="flex items-center gap-2 mt-4">
              <div className="py-2.5 px-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200 flex items-center justify-center shadow-sm">
                {captchaSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-4 h-4" /> Verified!
                  </span>
                ) : (
                  <span className="text-xs font-black text-black uppercase tracking-wide flex items-center gap-2">
                    {targetDirection === 'RIGHT' && <ArrowRight className="w-4 h-4 text-rose-500 stroke-[3]" />}
                    {targetDirection === 'LEFT' && <ArrowLeft className="w-4 h-4 text-rose-500 stroke-[3]" />}
                    {targetDirection === 'UP' && <span className="text-rose-500 text-sm font-black">↑</span>}
                    {targetDirection === 'DOWN' && <span className="text-rose-500 text-sm font-black">↓</span>}
                    DRAG {targetDirection}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={resetCaptcha}
                className="p-2.5 rounded-2xl bg-white/90 border border-slate-200 text-slate-600 hover:text-black hover:bg-white transition-all shadow-sm cursor-pointer"
                title="Change Direction"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {captchaError && !captchaSuccess && (
              <p className="text-xs font-bold text-rose-600 mt-3 text-center">
                Incorrect direction. Please drag {targetDirection.toLowerCase()}.
              </p>
            )}

          </div>

        </div>

        {/* BOTTOM HELPER */}
        <div className="w-full text-center pb-2 z-10">
          <p className="text-xs text-slate-500 font-medium">
            Step 1 of 2 • Human Verification
          </p>
        </div>

      </div>
    );
  }

  // ==========================================
  // PAGE 3: TERMS & DPDPA CONSENT SCREEN (BOX-FREE, DARK BLACK WORDS, AUTO-AUTH)
  // ==========================================
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-sky-50 to-sky-100 flex flex-col justify-between items-center px-4 py-8 relative font-[Inter]">
      
      {/* TOP BAR */}
      <div className="w-full max-w-sm flex justify-between items-center z-10">
        <button
          type="button"
          onClick={() => setStep('captcha')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" /> Back
        </button>
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={currentLang}
            onChange={(e) => setCurrentLang(e.target.value as 'en' | 'mr' | 'hi')}
            className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none cursor-pointer shadow-xs"
          >
            <option value="en">English</option>
            <option value="mr">मराठी</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>

      {/* CENTER CONTENT: BOX-FREE, CRISP BLACK TEXT */}
      <div className="w-full max-w-sm flex flex-col items-center my-auto py-2">
        
        <BrandLogo className="text-4xl sm:text-5xl justify-center mb-4" />

        <div className="w-full flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5 text-black font-extrabold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Terms & DPDPA Consent</span>
          </div>

          {hasScrolledToBottom ? (
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-700" /> Read
            </span>
          ) : (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full animate-pulse">
              Scroll down to read
            </span>
          )}
        </div>

        {/* SCROLLABLE TERMS CONTAINER DIRECTLY ON THEME BACKGROUND WITH CLEAN FROST */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full h-64 overflow-y-auto p-4 bg-white/75 backdrop-blur-md rounded-2xl border border-sky-200/80 text-xs text-black leading-relaxed space-y-3.5 select-none scroll-smooth shadow-sm"
        >
          <p className="font-extrabold text-black text-[13px]">
            Welcome to RouTripO. We guarantee 100% compliance with India's Digital Personal Data Protection Act (DPDPA 2023).
          </p>

          <p className="text-black font-semibold">
            {tPrivacy.welcome || "We are strictly committed to keeping your personal data safe, transparent, and completely under your control."}
          </p>

          <div className="space-y-2.5 text-black pt-1">
            <div>
              <p className="font-black text-black text-[12px]">• {tPrivacy.h1 || "1. Data Collection & Purpose"}</p>
              <p className="text-black font-medium text-[11px] pl-3 mt-0.5">
                We process profile names, Google authentication tokens, trip itineraries, and shared bills strictly for travel expense calculations and coordination.
              </p>
            </div>
            
            <div>
              <p className="font-black text-black text-[12px]">• {tPrivacy.h3 || "2. Zero-Sale & Strict Privacy Policy"}</p>
              <p className="text-black font-medium text-[11px] pl-3 mt-0.5">
                We never sell, rent, or trade your personal records, itineraries, or private location data to any third-party advertisers.
              </p>
            </div>
            
            <div>
              <p className="font-black text-black text-[12px]">• {tPrivacy.h8 || "3. User Data Rights & Full Ownership"}</p>
              <p className="text-black font-medium text-[11px] pl-3 mt-0.5">
                You retain complete ownership of your data. You have the right to review, export, or permanently delete your account and records at any time.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-sky-100/60 rounded-xl border border-sky-200/70 text-[11px] text-black font-bold mt-3">
            ✦ End of Agreement. By ticking the checkbox below, you accept these terms under Indian jurisdiction and will automatically authenticate with Google.
          </div>
        </div>

        {/* CHECKBOX AGREEMENT (DARK BOLD BLACK, AUTO AUTHENTICATION) */}
        <div className="w-full mt-4 flex items-start gap-3 px-1">
          <input
            type="checkbox"
            id="terms-checkbox-page"
            disabled={!hasScrolledToBottom}
            checked={consentAccepted}
            onChange={(e) => handleConsentAgreement(e.target.checked)}
            className={`mt-0.5 w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-2 border-slate-500 transition-all ${
              hasScrolledToBottom ? 'cursor-pointer hover:border-indigo-600' : 'cursor-not-allowed opacity-40'
            }`}
          />
          <label
            htmlFor="terms-checkbox-page"
            className={`text-xs leading-snug select-none ${
              hasScrolledToBottom 
                ? 'text-black cursor-pointer font-black' 
                : 'text-slate-400 cursor-not-allowed font-medium'
            }`}
          >
            I am 18+ and agree to the Terms of Service & Privacy Policy under DPDPA 2023.
          </label>
        </div>

        {/* AUTH ERROR NOTICE IF ANY */}
        {authError && (
          <div className="w-full mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="w-full text-center pb-2 z-10">
        <p className="text-xs text-slate-500 font-medium">
          Step 2 of 2 • Terms & DPDPA Agreement
        </p>
      </div>

      {/* AUTH LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center z-50">
          <div className="bg-white p-5 rounded-2xl shadow-2xl flex flex-col items-center gap-3 max-w-xs mx-4">
            <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-black text-center">
              Authenticating with Google...
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
