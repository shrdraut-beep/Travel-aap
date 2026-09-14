import React from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

export const SectionHeader: React.FC<{
  title: string;
  action?: string;
  onAction?: () => void;
}> = ({ title, action, onAction }) => (
  <div className="flex items-end justify-between px-5 pb-3 pt-6">
    <h3 className="text-[17px] font-bold tracking-tight text-[var(--premium-ink)]">
      {title}
    </h3>
    {action && (
      <button
        type="button"
        onClick={onAction}
        className="text-[13px] font-bold text-[var(--premium-sky-deep)] hover:underline active:scale-95 transition-all cursor-pointer"
      >
        {action}
      </button>
    )}
  </div>
);

export const ListRow: React.FC<{
  Icon?: LucideIcon;
  imgSrc?: string;
  label: string;
  caption?: string;
  tone?: "violet" | "pink" | "sky";
  value?: string;
  onClick: () => void;
}> = ({ Icon, imgSrc, label, caption, tone = "sky", value, onClick }) => {
  const tones: Record<string, string> = {
    violet: "bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]",
    pink: "bg-[var(--premium-pink-soft)] text-[var(--premium-pink)]",
    sky: "bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)]"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left active:bg-slate-50/50 cursor-pointer group transition-all"
    >
      {imgSrc ? (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100 group-hover:scale-105 transition-transform">
          <img
            src={imgSrc}
            alt=""
            className="h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]"
          />
        </span>
      ) : (
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs ${tones[tone]} group-hover:scale-105 transition-transform`}
        >
          {Icon ? <Icon className="h-5 w-5 drop-shadow-xs" /> : null}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold tracking-tight text-[var(--premium-ink)] leading-snug">
          {label}
        </span>
        {caption && (
          <span className="block truncate text-[12px] font-medium text-[var(--premium-muted)] leading-tight mt-0.5">
            {caption}
          </span>
        )}
      </span>
      {value && (
        <span className="shrink-0 text-[13px] font-bold text-[var(--premium-muted)]">
          {value}
        </span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
    </button>
  );
};

export const PillButton: React.FC<{
  label: string;
  onClick?: () => void;
  variant?: "outline" | "solid" | "pink" | "emerald" | "secondary" | "danger";
  icon?: React.ReactNode;
  Icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({
  label,
  onClick,
  variant = "outline",
  icon,
  Icon,
  size = "md",
  fullWidth = false,
  disabled = false,
  className = ""
}) => {
  const sizeClasses: Record<string, string> = {
    sm: "h-8 px-3.5 text-[12px]",
    md: "h-10 px-5 text-[13px]",
    lg: "h-12 px-6 text-[14px]"
  };

  const variantClasses: Record<string, string> = {
    // 3D Elevated Sky/Indigo Gradient
    solid:
      "bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 text-white font-extrabold shadow-[0_4px_14px_rgba(2,132,199,0.32)] hover:shadow-[0_6px_20px_rgba(2,132,199,0.42)] border-t border-white/25",
    // 3D Elevated Radiant Pink Gradient
    pink:
      "bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 text-white font-extrabold shadow-[0_4px_14px_rgba(236,72,153,0.32)] hover:shadow-[0_6px_20px_rgba(236,72,153,0.42)] border-t border-white/25",
    // 3D Elevated Emerald Gradient
    emerald:
      "bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold shadow-[0_4px_14px_rgba(16,185,129,0.32)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.42)] border-t border-white/25",
    // 3D Elevated Rose Danger
    danger:
      "bg-gradient-to-r from-rose-500 to-red-600 text-white font-extrabold shadow-[0_4px_14px_rgba(244,63,94,0.32)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.42)] border-t border-white/25",
    // 3D White Card with Sky Border
    outline:
      "bg-white border-2 border-sky-300 text-sky-700 font-extrabold shadow-[0_2px_8px_rgba(2,132,199,0.12)] hover:bg-sky-50/70 hover:border-sky-400",
    // 3D White Card with Neutral Slate Border
    secondary:
      "bg-white border-2 border-slate-200 text-slate-800 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-slate-50 hover:border-slate-300"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full transition-all cursor-pointer active:scale-95 ${
        fullWidth ? "w-full" : ""
      } ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.outline} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {Icon && <Icon className="h-4 w-4 shrink-0 stroke-[2.5]" />}
      <span>{label}</span>
    </button>
  );
};

export const StatCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
  tone?: "violet" | "pink" | "sky";
}> = ({ label, value, hint, tone = "sky" }) => {
  const tones: Record<string, string> = {
    violet: "text-[var(--premium-violet)]",
    pink: "text-[var(--premium-pink)]",
    sky: "text-[var(--premium-sky-deep)]"
  };

  return (
    <div className="premium-card flex-1 px-4 py-3.5 border border-slate-100 shadow-[0_4px_16px_rgba(2,132,199,0.06)] hover:shadow-md transition-all hover:scale-[1.01]">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
        {label}
      </p>
      <p className={`pt-1 text-[20px] font-black leading-none ${tones[tone]}`}>
        {value}
      </p>
      {hint && (
        <p className="pt-1 text-[11px] font-medium text-[var(--premium-muted)]">
          {hint}
        </p>
      )}
    </div>
  );
};
