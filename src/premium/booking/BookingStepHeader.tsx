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
 * Shared header for the flight booking flow's sequential steps (fare, passenger
 * details, seats, meals, baggage, checkout). Before this component existed, all six
 * step screens hand-copy-pasted the same ~25 lines of header markup — meaning any
 * visual tweak (padding, border, badge color) had to be repeated six times, and each
 * copy had quietly drifted slightly out of sync with the others.
 *
 * This is a lighter, white/slate-themed header — distinct from BrandHeader's pink
 * gradient, used elsewhere in the app. That's an intentional visual difference for
 * the booking flow, not an inconsistency to fix.
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
    <header className={`${sticky ? 'sticky top-0' : 'relative'} z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs`}>
      <div className={`${maxWidth} mx-auto px-4 py-3.5 flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 -ml-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            aria-label={backAriaLabel}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {inlineSubtitle ? (
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
              {step && (
                <span className="text-[10px] font-bold text-[var(--premium-violet)] bg-violet-50 px-2 py-0.5 rounded-full">
                  {step}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-slate-500 hidden sm:block border-l border-slate-300 pl-3">
                  {subtitle}
                </span>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
                {step && (
                  <span className="text-xs font-bold text-[var(--premium-violet)] bg-violet-50 px-2 py-0.5 rounded-full">
                    {step}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          )}
        </div>

        {rightElement}
      </div>

      {children}
    </header>
  );
};
