import React, { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";

export interface PremiumShellProps {
  title: string;
  subtitle: string;
  avatarChar?: string;
  tabs: { id: string; label: string; Icon?: any; imgSrc?: string; stitchIcon?: string }[];
  activeTab: string;
  onChangeTab: (id: string) => void;
  onBack?: () => void;
  hideHeader?: boolean;
  children: React.ReactNode;
  renderFab?: React.ReactNode;
}

const DEFAULT_STITCH_ICONS: Record<string, string> = {
  home: "home",
  trips: "luggage",
  booking: "explore",
  explore: "explore",
  bargaining: "local_offer",
  offers: "local_offer",
  settings: "account_circle",
  account: "account_circle",
  plan: "calendar_month",
  expenses: "account_balance_wallet",
  social: "group",
  docs: "description"
};

export const PremiumShell: React.FC<PremiumShellProps> = ({
  title,
  subtitle,
  avatarChar,
  tabs,
  activeTab,
  onChangeTab,
  onBack,
  hideHeader = false,
  children,
  renderFab
}) => {
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  return (
    <div
      ref={bodyRef}
      className="mx-auto flex h-[100dvh] w-full max-w-[520px] flex-col bg-[#F8FAFC] overflow-y-auto overscroll-contain relative"
    >
      {!hideHeader && (
        <header className="premium-sky-panel px-5 py-4 shadow-sm shrink-0">
          {onBack ? (
            <div className="flex items-center gap-3 text-white">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors shadow-sm active:scale-95 text-white text-xs font-bold shrink-0 border border-white/25 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>All Trips</span>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[20px] font-extrabold leading-tight tracking-tight text-white font-['D-DIN','Outfit',sans-serif]">
                  {title}
                </h1>
                <p className="truncate text-[12px] font-medium text-white/85 mt-0.5">
                  {subtitle}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center gap-3 text-left">
              <span className="premium-gradient-pink flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-[17px] font-bold text-white shadow-md shrink-0">
                {avatarChar || title.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[19px] font-extrabold leading-tight tracking-tight text-white font-['D-DIN','Outfit',sans-serif]">
                  {title}
                </span>
                <span className="block truncate text-[12px] font-medium text-white/85 mt-0.5">
                  {subtitle}
                </span>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Screen Content with thumb-safe bottom clearance */}
      <main className="flex-1 pb-24">
        {children}
      </main>

      {/* Floating Action Button */}
      {renderFab && (
        <div className="fixed bottom-20 right-5 z-50">
          {renderFab}
        </div>
      )}

      {/* Google Stitch Bottom Floating Navigation Bar */}
      <nav 
        aria-label="Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-50 mx-auto flex w-full max-w-[520px] items-center justify-around border-t border-slate-200/90 bg-white/95 px-2 py-1.5 backdrop-blur-md shadow-[0_-4px_20px_rgba(15,23,42,0.06)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
      >
        {tabs.map(({ id, label, stitchIcon }) => {
          const isActive = activeTab === id;
          const iconName = stitchIcon || DEFAULT_STITCH_ICONS[id] || "home";
          const iconColor = 
            id === "bargaining" ? "text-sky-500" :
            id === "trips" ? "text-emerald-600" :
            id === "booking" ? "text-amber-500" :
            "text-sky-600";

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChangeTab(id)}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center justify-center transition-all duration-150 active:scale-95 outline-none cursor-pointer px-3 py-1"
            >
              <span
                className={`material-symbols-outlined text-[22px] ${iconColor} transition-transform ${
                  isActive ? "scale-110" : ""
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
              >
                {iconName}
              </span>
              <span
                className={`text-[10px] tracking-tight leading-tight mt-0.5 ${
                  isActive ? "font-bold text-sky-700" : "font-medium text-slate-500"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
