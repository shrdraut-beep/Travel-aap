import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface BookingStepHeaderProps {
  title: React.ReactNode;
  /** e.g. "Step 3 of 6" or a ReactNode badge */
  step?: React.ReactNode;
  /** Subtitle line below the title, OR — when inlineSubtitle is true — inline next to the step badge. */
  subtitle?: React.ReactNode;
  /** CheckoutStep's layout puts the subtitle inline with the title/badge instead of on its own line. */
  inlineSubtitle?: boolean;
  onBack: () => void;
  backAriaLabel: string;
  maxWidth?: string;
  sticky?: boolean;
  /** SeatSelectionStep's right-side "Passenger" info block. */
  rightElement?: React.ReactNode;
  /** MealsSelectionStep's extra filter row rendered below the main header row. */
  children?: React.ReactNode;
}

/**
 * BookingStepHeader - Unified sub-header adhering to the Bus Booking Flow curved layout
 * (rounded-b-[24px], circular buttons) with the signature RoutTripo Ocean Brand Palette:
 * bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa], border-b border-sky-200/80.
 *
 * Strictly adheres to:
 * - 0 emojis
 * - whitespace-nowrap shrink-0 on badges and buttons
 * - clean single-language presentation
 */
export const BookingStepHeader: React.FC<BookingStepHeaderProps> = ({
  title,
  step,
  subtitle,
  inlineSubtitle = false,
  onBack,
  backAriaLabel,
  maxWidth = 'max-w-3xl',
  sticky = false,
  rightElement,
  children,
}) => {
  return (
    <header
      className={`${
        sticky ? 'sticky top-0' : 'relative'
      } z-40 bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] backdrop-blur-xl border-b border-sky-200/80 rounded-b-[24px] shadow-[0_4px_20px_rgba(2,132,199,0.08)] select-none font-['Outfit',sans-serif]`}
    >
      <div className={`${maxWidth} mx-auto px-4 py-3 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-xs border border-sky-200/80 transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
            aria-label={backAriaLabel}
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
          </button>

          {inlineSubtitle ? (
            <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 min-w-0">
              <h1 className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight truncate">
                {title}
              </h1>
              {step && (
                <span className="text-[11px] font-black text-sky-800 bg-sky-100/90 border border-sky-300/60 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 shadow-2xs">
                  {step}
                </span>
              )}
              {subtitle && (
                <span className="text-xs font-semibold text-[#0369a1] hidden sm:block border-l border-sky-200 pl-2.5 truncate">
                  {subtitle}
                </span>
              )}
            </div>
          ) : (
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight truncate">
                  {title}
                </h1>
                {step && (
                  <span className="text-[10px] font-black text-sky-800 bg-sky-100/90 border border-sky-300/60 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 shadow-2xs">
                    {step}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs font-semibold text-[#0369a1] mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {rightElement && (
          <div className="shrink-0 flex items-center gap-2">
            {rightElement}
          </div>
        )}
      </div>

      {children && (
        <div className="px-4 pb-3 max-w-3xl mx-auto">
          {children}
        </div>
      )}
    </header>
  );
};
