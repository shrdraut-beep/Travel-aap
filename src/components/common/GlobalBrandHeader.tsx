import React from "react";

export interface GlobalBrandHeaderProps {
  subtitle: string;
  theme?: "ocean" | "orange" | "green";
  badge?: string;
  onNotifications?: () => void;
  onOpenProfile?: () => void;
  avatarSrc?: string;
  className?: string;
  actionButton?: React.ReactNode;
}

export const DEFAULT_USER_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCrpoo9TS_6cmaVeLdwULdoIxXnqUc7kiMjcogApxX8bK9Bxf6FS43lVapLEMAX-Gsw4Wb69nVWicYBN-c2w16eNsvsPhoDogdM6JsWDcpUGbk_2Yk01BKYyqw5WIyeOhL6pIxaJxufKw7Ro6KxjMMtH-Rz97Eqz89d30FI94qlM4Cg9eeDzFJHnAwFLspLn3x_Q1ACItDJF_TJbybwgnVs-ZNtN549TXpwingObAtkbKfNy7nZhGwF";

export const GlobalBrandHeader: React.FC<GlobalBrandHeaderProps> = ({
  subtitle,
  theme = "ocean",
  badge,
  onNotifications,
  onOpenProfile,
  avatarSrc = DEFAULT_USER_AVATAR,
  className = "",
  actionButton
}) => {
  // Theme Configs
  const themeStyles = {
    ocean: {
      headerBg: "bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa]",
      border: "border-b border-sky-200/70",
      rouColor: "text-[#0284C7]",
      tBg: "bg-[#FF5722]",
      ripoColor: "text-[#EC4899]",
      subtitleColor: "text-[#0369a1]",
      btnBorder: "border-sky-200/80",
      btnBg: "bg-white/90 hover:bg-white",
      bellColor: "text-rose-500 hover:text-rose-600",
      badgeStyle: "bg-sky-100/90 text-sky-800 border-sky-300/60"
    },
    orange: {
      // Vendor Theme
      headerBg: "bg-gradient-to-r from-[#ffedd5] via-[#fff7ed] to-[#fed7aa]",
      border: "border-b border-orange-200/80",
      rouColor: "text-[#ea580c]",
      tBg: "bg-[#c2410c]",
      ripoColor: "text-[#f97316]",
      subtitleColor: "text-[#9a3412]",
      btnBorder: "border-orange-200/80",
      btnBg: "bg-white/90 hover:bg-white",
      bellColor: "text-rose-500 hover:text-rose-600",
      badgeStyle: "bg-orange-100 text-orange-900 border-orange-300"
    },
    green: {
      // Admin Theme
      headerBg: "bg-gradient-to-r from-[#dcfce7] via-[#f0fdf4] to-[#bbf7d0]",
      border: "border-b border-emerald-300/70",
      rouColor: "text-[#059669]",
      tBg: "bg-[#047857]",
      ripoColor: "text-[#10b981]",
      subtitleColor: "text-[#065f46]",
      btnBorder: "border-emerald-200/80",
      btnBg: "bg-white/90 hover:bg-white",
      bellColor: "text-rose-500 hover:text-rose-600",
      badgeStyle: "bg-emerald-100 text-emerald-900 border-emerald-300"
    }
  };

  const currentTheme = themeStyles[theme];

  return (
    <header
      className={`w-full ${currentTheme.headerBg} ${currentTheme.border} px-4 pt-3.5 pb-4 rounded-b-[24px] shadow-xs sticky top-0 z-40 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Brand Identity + Subtitle / Badge */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center tracking-tight text-[1.35rem] font-extrabold leading-none select-none">
              <span className={currentTheme.rouColor}>ROU</span>
              <span
                className={`${currentTheme.tBg} text-white text-[0.95rem] px-1.5 py-0.5 rounded-md mx-0.5 font-black leading-none shadow-xs`}
              >
                T
              </span>
              <span className={currentTheme.ripoColor}>RIPO</span>
            </div>

            {badge && (
              <span
                className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs ${currentTheme.badgeStyle}`}
              >
                {badge}
              </span>
            )}
          </div>

          <span
            className={`text-[0.68rem] font-bold ${currentTheme.subtitleColor} tracking-wide mt-1 truncate flex items-center gap-1`}
          >
            {subtitle}
          </span>
        </div>

        {/* Right: Actions (Notification Bell + Booking User Photo) */}
        <div className="flex items-center gap-2 shrink-0">
          {actionButton}

          {/* Emergency / Notification Bell */}
          <button
            type="button"
            onClick={onNotifications}
            aria-label="Emergency SOS & Alerts"
            className={`relative size-9 rounded-full ${currentTheme.btnBg} border ${currentTheme.btnBorder} flex items-center justify-center ${currentTheme.bellColor} active:scale-95 transition-all shadow-xs cursor-pointer`}
          >
            <span className="material-symbols-outlined text-[20px]">
              notifications_active
            </span>
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          </button>

          {/* User Photo / Profile Avatar (Same as in Booking Tab) */}
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open Profile & Settings"
            className={`size-9 rounded-xl overflow-hidden ring-2 ring-white active:scale-95 transition-all bg-slate-100 flex items-center justify-center shadow-xs cursor-pointer border ${currentTheme.btnBorder}`}
          >
            <img
              className="size-full object-cover"
              alt="User Profile"
              src={avatarSrc || DEFAULT_USER_AVATAR}
              onError={(e) => {
                // Fallback to default avatar if image fails to load
                (e.target as HTMLImageElement).src = DEFAULT_USER_AVATAR;
              }}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
