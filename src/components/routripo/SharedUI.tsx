import React, { useState, useEffect, useRef } from "react";
import { Bell, LogOut, Siren, Settings, X, CheckCircle, Info, ChevronDown, ChevronRight, ArrowLeft, Ticket } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export function BrandLogo({ className = "text-2xl" }) {
  return (
    <div className={`font-bold font-[Poppins] flex items-center ${className}`}>
      <span className="text-red-600">Rou</span>
      <span className="bg-red-500 text-white px-1.5 mx-[1px] rounded-md shadow-sm">T</span>
      <span className="text-pink-500">rip</span>
      <span className="text-pink-500">O</span>
    </div>
  );
}

export function LogoName({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold font-[Poppins] ${className}`}>
      <span className="text-red-500">Rou</span>
      <span className="text-white bg-red-500 px-1 mx-0.5 rounded">T</span>
      <span className="text-pink-500">rip</span>
      <span className="text-pink-500">O</span>
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const hasPadding = className.includes('p-') || className.includes('px-') || className.includes('py-');
  const hasMargin = className.includes('m-') || className.includes('mx-') || className.includes('my-');
  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm ${!hasPadding ? 'p-4 sm:p-5' : ''} ${!hasMargin ? 'mx-1 my-3' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function Label({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <label className={`block text-xs font-black uppercase tracking-widest text-slate-800 mb-1.5 ${className}`}>
      {children}
    </label>
  );
}

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  containerClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function TextInput({ label, className = "", containerClassName = "", icon: Icon, ...props }: TextInputProps) {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <Label>{label}</Label>}
      <div className="relative bg-slate-50 border border-slate-200 hover:border-indigo-400 focus-within:border-indigo-500 focus-within:bg-white rounded-2xl p-3 transition-all flex items-center gap-2.5 shadow-xs">
        {Icon && (
          <div className="text-slate-500 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          {...props}
          className={`w-full bg-transparent font-extrabold text-sm text-slate-900 placeholder-slate-500 outline-none ${className}`}
        />
      </div>
    </div>
  );
}

export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  className?: string;
  containerClassName?: string;
}

export function Dropdown({ label, options, className = "", containerClassName = "", ...props }: DropdownProps) {
  return (
    <div className={`w-full relative ${containerClassName}`}>
      {label && <Label>{label}</Label>}
      <div className="relative bg-slate-50 border border-slate-200 hover:border-indigo-400 focus-within:border-indigo-500 focus-within:bg-white rounded-2xl p-3 transition-all flex items-center gap-2.5 shadow-xs">
        <select
          {...props}
          className={`w-full bg-transparent font-extrabold text-sm text-slate-900 outline-none cursor-pointer appearance-none ${className}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-slate-900 font-bold bg-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export function SectionTitle({ children, icon: Icon, right, accent = "text-red-500" }: { children: React.ReactNode, icon?: any, right?: React.ReactNode, accent?: string }) {
  return (
    <div className="flex items-center justify-between px-1 mb-2.5">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className={`w-4 h-4 ${accent}`} />}
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{children}</p>
      </div>
      {right}
    </div>
  );
}

export function useScrolled(scrollRef: React.RefObject<HTMLDivElement>) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 12);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);
  return scrolled;
}

export function TopBar({ 
  title, 
  sub, 
  scrolled, 
  avatarGrad = "from-red-400 to-pink-500", 
  initial = "S", 
  onLogout, 
  onSOS,
  onOpenSettings,
  onOpenMyTickets,
  onBack
}: { 
  title: React.ReactNode, 
  sub?: string, 
  scrolled: boolean, 
  avatarGrad?: string, 
  initial?: string, 
  onLogout: () => void, 
  onSOS?: () => void,
  onOpenSettings?: () => void,
  onOpenMyTickets?: () => void,
  onBack?: () => void
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const currentUser = useAuthStore(state => state.currentUser);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : initial;
  const userAvatar = currentUser?.avatar;
  const userName = currentUser?.name || "Traveler";
  const userEmail = currentUser?.email || "traveler@routripo.com";

  const [notifications, setNotifications] = useState<any[]>([]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="bg-white/90 backdrop-blur-md px-4 pt-4 pb-3 flex justify-between items-center sticky top-0 z-[999] shadow-sm">
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            type="button" 
            onClick={onBack} 
            className="p-1.5 rounded-full bg-slate-100 active:scale-95 transition-all text-slate-700 hover:bg-slate-200 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          {sub && <p className="text-[11px] text-slate-500 font-medium tracking-tight">{sub}</p>}
          <div className="text-lg font-bold text-slate-800 font-[Poppins]">{title}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 relative" ref={menuRef}>
        {/* SOS Emergency Button */}
        {onSOS && (
          <button 
            type="button"
            onClick={onSOS} 
            title="Emergency SOS"
            className="w-9 h-9 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center shadow-xs border border-rose-100 active:scale-95 transition-all cursor-pointer"
          >
            <Siren className="w-4 h-4 text-rose-600 animate-pulse" />
          </button>
        )}

        {/* Unified Profile Button (Merging Avatar, Notifications & Settings/Logout) */}
        <button 
          type="button"
          onClick={() => setShowProfileMenu(!showProfileMenu)} 
          title="Account Profile, Notifications & Actions"
          className="relative flex items-center gap-1.5 p-1 pl-1 pr-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-xs active:scale-95 transition-all cursor-pointer group"
        >
          <div className="relative">
            {userAvatar ? (
              <img 
                src={userAvatar} 
                alt="User" 
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-2xs border border-slate-200" 
              />
            ) : (
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white text-xs font-black ring-2 ring-white shadow-2xs`}>
                {userInitial}
              </div>
            )}
            {/* Unread Notification Badge Dot */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-pink-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </div>

          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`} />
        </button>

        {/* Profile Popover Menu containing Notifications, Settings & Logout */}
        {showProfileMenu && (
          <div className="absolute top-12 right-0 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 divide-y divide-slate-100">
            {/* 1. User Info Header */}
            <div className="pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {userAvatar ? (
                  <img src={userAvatar} alt="Profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-100 border border-slate-200" />
                ) : (
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white text-sm font-black shadow-sm`}>
                    {userInitial}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">{userName}</h4>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{userEmail}</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowProfileMenu(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Notifications Section */}
            <div className="py-3 space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-pink-500" />
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-pink-100 text-pink-600 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    type="button"
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-2 rounded-xl flex items-start gap-2.5 transition-colors text-left ${
                      n.unread ? "bg-rose-50/60 border border-rose-100/60" : "bg-slate-50 hover:bg-slate-100/80"
                    }`}
                  >
                    <n.icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${n.unread ? "text-pink-500" : "text-slate-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-slate-900 leading-tight">{n.title}</p>
                        <span className="text-[9px] text-slate-400 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{n.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Account Settings & Logout Actions */}
            <div className="pt-3 space-y-1">
              {onOpenMyTickets && (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenMyTickets();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-slate-500" />
                    <span>My Tickets</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Account Settings</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Log Out</span>
                </div>
                <span className="text-[10px] text-rose-400 font-medium">Exit Session</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Stagger({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  return <div className={`transition-all duration-500 ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>{children}</div>;
}

export function CountUp({ value, prefix = "", duration = 900 }: { value: number, prefix?: string, duration?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value, duration]);
  return <>{prefix}{n.toLocaleString("en-IN")}</>;
}

export function Pills({ items, active, onChange, accent = "bg-slate-900" }: { items: string[], active: string, onChange: (item: string) => void, accent?: string }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-5 py-1">
      {items.map((it) => (
        <button key={it} onClick={() => onChange(it)} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 shrink-0 ${active === it ? `${accent} text-white shadow-md scale-105` : "bg-white text-slate-500 border border-slate-200"}`}>{it}</button>
      ))}
    </div>
  );
}

export function RippleButton({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  const [ripples, setRipples] = useState<{id: number, x: number, y: number}[]>([]);
  const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
    onClick && onClick();
  };
  return (
    <button onClick={handle} className={`relative overflow-hidden active:scale-[0.96] transition-transform duration-150 ${className}`}>
      {children}
      {ripples.map((r) => <span key={r.id} className="absolute rounded-full bg-white/40 animate-[ripple_0.6s_ease-out] pointer-events-none" style={{ left: r.x, top: r.y, width: 10, height: 10, marginLeft: -5, marginTop: -5 }} />)}
    </button>
  );
}
