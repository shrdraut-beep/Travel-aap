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
        className="text-[13px] font-bold text-[var(--premium-violet)]"
      >
        {action}
      </button>
    )}
  </div>
);

export const ListRow: React.FC<{
  Icon: LucideIcon;
  label: string;
  caption?: string;
  tone?: "violet" | "pink" | "sky";
  value?: string;
  onClick: () => void;
}> = ({ Icon, label, caption, tone = "violet", value, onClick }) => {
  const tones: Record<string, string> = {
    violet: "bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]",
    pink: "bg-[var(--premium-pink-soft)] text-[var(--premium-pink)]",
    sky: "bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)]"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-5 py-3 text-left active:bg-slate-50"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold tracking-tight text-[var(--premium-ink)]">
          {label}
        </span>
        {caption && (
          <span className="block truncate text-[12px] font-medium text-[var(--premium-muted)]">
            {caption}
          </span>
        )}
      </span>
      {value && (
        <span className="shrink-0 text-[13px] font-bold text-[var(--premium-muted)]">
          {value}
        </span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </button>
  );
};

export const PillButton: React.FC<{
  label: string;
  onClick: () => void;
  variant?: "outline" | "solid" | "pink";
}> = ({ label, onClick, variant = "outline" }) => {
  const styles: Record<string, string> = {
    outline: "premium-pill",
    solid: "bg-[var(--premium-violet)] text-white border border-transparent",
    pink: "bg-[var(--premium-pink)] text-white border border-transparent"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-full px-5 text-[13px] font-bold ${styles[variant]}`}
    >
      {label}
    </button>
  );
};

export const StatCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
  tone?: "violet" | "pink" | "sky";
}> = ({ label, value, hint, tone = "violet" }) => {
  const tones: Record<string, string> = {
    violet: "text-[var(--premium-violet)]",
    pink: "text-[var(--premium-pink)]",
    sky: "text-[var(--premium-sky-deep)]"
  };

  return (
    <div className="premium-card flex-1 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
        {label}
      </p>
      <p className={`pt-1 text-[20px] font-bold leading-none ${tones[tone]}`}>
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
