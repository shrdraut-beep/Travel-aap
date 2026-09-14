import React from "react";

/**
 * Shared visual primitives for the premium mobile shell. Presentational only -
 * no data fetching, no app state - so the existing backend can be wired
 * straight onto the exposed props.
 */

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "premium-gradient text-white shadow-lg shadow-[var(--premium-accent)]/25",
  secondary: "bg-white text-slate-900 ring-1 ring-slate-200",
  ghost: "text-slate-700"
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
    className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-transform duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
  >
    {icon}
    {children}
  </button>
);
