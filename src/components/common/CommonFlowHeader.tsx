import React from 'react';
import { ArrowLeft, X } from 'lucide-react';

export interface CommonFlowHeaderProps {
  title: React.ReactNode;
  /** Subtitle or breadcrumb below title */
  subtitle?: React.ReactNode;
  /** Step label badge e.g. "Step 2 of 6" */
  step?: React.ReactNode;
  /** Current step index (1-based) for progress bar */
  currentStep?: number;
  /** Total step count for progress bar */
  totalSteps?: number;
  /** Back navigation handler (navigates back a step or screen) */
  onBack?: () => void;
  /** Exit / Close handler (returns to parent dashboard) */
  onClose?: () => void;
  backAriaLabel?: string;
  closeAriaLabel?: string;
  maxWidth?: string;
  sticky?: boolean;
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Universal Shared Flow Header for all full-screen dedicated pages across
 * Vendor, User, and Admin portals. Features both Back (<) and Close (X) buttons,
 * step badges, and optional visual progress bar modeled after the Flight Booking Flow.
 */
export const CommonFlowHeader: React.FC<CommonFlowHeaderProps> = ({
  title,
  subtitle,
  step,
  currentStep,
  totalSteps,
  onBack,
  onClose,
  backAriaLabel = 'Go back',
  closeAriaLabel = 'Close and return to dashboard',
  maxWidth = 'max-w-5xl',
  sticky = true,
  rightElement,
  children,
  className = ''
}) => {
  const progressPercent =
    currentStep && totalSteps && totalSteps > 0
      ? Math.min(100, Math.round((currentStep / totalSteps) * 100))
      : null;

  return (
    <header
      className={`${sticky ? 'sticky top-0' : 'relative'} z-30 bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] border-b border-sky-200/80 rounded-b-[24px] shadow-[0_4px_20px_rgba(2,132,199,0.08)] backdrop-blur-xl transition-all ${className}`}
    >
      <div className={`${maxWidth} mx-auto px-3.5 sm:px-6 py-3 flex items-center justify-between gap-3`}>
        {/* Left: Back Button + Title Block */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-sky-800 border border-sky-200/80 flex items-center justify-center active:scale-95 shadow-xs transition-all cursor-pointer shrink-0"
              aria-label={backAriaLabel}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base md:text-lg font-black text-[#0F172A] tracking-tight truncate leading-tight">
                {title}
              </h1>
              {step && (
                <span className="text-[10px] sm:text-[11px] font-extrabold text-sky-800 bg-sky-100/90 border border-sky-300/60 px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                  {step}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-[#0369a1] font-semibold truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Custom Extra Element + Close (X) Button */}
        <div className="flex items-center gap-2 shrink-0">
          {rightElement}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-rose-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs border border-sky-200/80 shrink-0"
              aria-label={closeAriaLabel}
              title={closeAriaLabel}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Visual Step Progress Bar */}
      {progressPercent !== null && (
        <div className="w-full h-1 bg-white/40 overflow-hidden rounded-b-[24px]">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-sky-600 to-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {children}
    </header>
  );
};

export default CommonFlowHeader;
