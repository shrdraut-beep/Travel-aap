import React from 'react';
import { ArrowLeft, X, LucideIcon } from 'lucide-react';

export interface SubPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  onBack?: () => void;
  onClose?: () => void;
  rightAction?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  maxWidth?: string;
}

/**
 * Standard Sub-Header for Drill-downs, Modals, and Sub-pages.
 * Matches the Bus Booking Flow Header layout (rounded-b-[24px], circular buttons, center title)
 * with the exact signature colors of GlobalBrandHeader (Ocean gradient, border-sky-200, deep ink title).
 * Strictly zero emojis, 100% zero-wrap badges, traveler-first.
 */
export const SubPageHeader: React.FC<SubPageHeaderProps> = ({
  title,
  subtitle,
  badge,
  onBack,
  onClose,
  rightAction,
  icon: Icon,
  className = '',
  maxWidth = 'max-w-2xl'
}) => {
  return (
    <header
      className={`w-full z-40 bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] border-b border-sky-200/80 rounded-b-[24px] shadow-[0_4px_20px_rgba(2,132,199,0.08)] px-4 py-3 sm:py-3.5 transition-colors sticky top-0 ${className}`}
    >
      <div className={`mx-auto ${maxWidth} flex items-center justify-between gap-3`}>
        {/* Left: Back Button & Title Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go Back"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-sky-800 border border-sky-200/80 flex items-center justify-center active:scale-95 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          )}

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {Icon && <Icon className="w-4 h-4 text-sky-600 shrink-0" />}
              <h1 className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight leading-tight truncate">
                {title}
              </h1>
              {badge && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs bg-sky-100/90 text-sky-800 border-sky-300/60 whitespace-nowrap shrink-0">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] font-semibold text-[#0369a1] tracking-wide mt-0.5 truncate leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Custom Action or Close Button */}
        <div className="flex items-center gap-2 shrink-0">
          {rightAction}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 border border-sky-200/80 flex items-center justify-center active:scale-95 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
