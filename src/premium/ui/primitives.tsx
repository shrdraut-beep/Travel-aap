import React from "react";

/**
 * Shared visual primitives for the premium portal shell. Everything here is
 * presentational only - no data fetching, no app state - so the existing
 * backend can be wired straight onto the exposed props.
 */

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  // Accent is the app's existing brand coral, not black.
  primary:
    "bg-[var(--color-coral)] text-white shadow-lg shadow-[var(--color-coral)]/30 hover:brightness-95 hover:shadow-xl hover:shadow-[var(--color-coral)]/35",
  secondary:
    "bg-white text-slate-900 ring-1 ring-slate-200 shadow-sm hover:ring-slate-300 hover:shadow-md",
  ghost: "text-slate-700 hover:bg-slate-100/80"
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base"
};

export interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  ...rest
}) => (
  <button
    {...rest}
    className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
  >
    {icon}
    {children}
  </button>
);

/** Frosted panel used for the search widget and every elevated card. */
export const GlassCard: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { as?: "div" | "section" }
> = ({ className = "", children, as: Tag = "div", ...rest }) => (
  <Tag
    {...rest}
    className={`rounded-3xl border border-white/60 bg-white/80 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl ${className}`}
  >
    {children}
  </Tag>
);

export interface FieldProps {
  label: string;
  value: string;
  placeholder?: string;
  icon?: React.ReactNode;
  hint?: string;
  onClick?: () => void;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  readOnly?: boolean;
  name?: string;
}

/**
 * Floating-label field. Renders as a real input when `onChange` is supplied and
 * as a button-like trigger (for pickers) when only `onClick` is given.
 */
export const FloatingField: React.FC<FieldProps> = ({
  label,
  value,
  placeholder,
  icon,
  hint,
  onClick,
  onChange,
  onFocus,
  readOnly,
  name
}) => {
  const interactive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`group relative flex h-[68px] w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 text-left transition-all duration-200 focus-within:border-[var(--color-coral)] focus-within:shadow-[0_0_0_4px_rgba(255,90,95,0.12)] hover:border-slate-300 ${
        interactive ? "cursor-pointer" : ""
      }`}
    >
      {icon ? (
        <span className="shrink-0 text-slate-400 transition-colors group-hover:text-slate-600">
          {icon}
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </span>

        {onChange ? (
          <input
            name={name}
            value={value}
            placeholder={placeholder}
            readOnly={readOnly}
            onFocus={onFocus}
            onChange={(event) => onChange(event.target.value)}
            className="w-full truncate border-0 bg-transparent p-0 text-[15px] font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300"
          />
        ) : (
          <span
            className={`block truncate text-[15px] font-semibold ${
              value ? "text-slate-900" : "text-slate-300"
            }`}
          >
            {value || placeholder}
          </span>
        )}
      </span>

      {hint ? (
        <span className="shrink-0 text-[11px] font-semibold text-slate-400">
          {hint}
        </span>
      ) : null}
    </div>
  );
};

/** Small pill used for trust badges, tags and filters. */
export const Pill: React.FC<{
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ children, icon, className = "" }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${className}`}
  >
    {icon}
    {children}
  </span>
);

export const SectionHeading: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ eyebrow, title, description, action }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[34px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
    {action}
  </div>
);
