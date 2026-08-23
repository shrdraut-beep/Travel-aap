import React, { useRef, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { getDailyFlightPrices, DailyPriceInfo } from '../../utils/fareCalendarUtils';

export interface DateFareStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string, price?: number) => void;
  originCode?: string;
  destCode?: string;
  onOpenCalendarModal: () => void;
  lang?: string;
}

export const DateFareStrip: React.FC<DateFareStripProps> = ({
  selectedDate,
  onSelectDate,
  originCode = 'BOM',
  destCode = 'DEL',
  onOpenCalendarModal,
  lang = 'en'
}) => {
  const isMr = lang === 'mr';
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate 21 days centered around selected date
  const parsedDate = selectedDate ? new Date(selectedDate) : new Date();
  const validBaseDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const dateItems = useMemo(() => {
    return getDailyFlightPrices(originCode, destCode, validBaseDate, 5, 12);
  }, [originCode, destCode, validBaseDate.toISOString()]);

  // Auto-scroll to selected date on mount or selection change
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedEl = scrollContainerRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }
    }
  }, [selectedDate]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white border-y border-slate-200 shadow-2xs py-2 px-2 sm:px-4 font-[Inter] select-none sticky top-14 z-30">
      <div className="max-w-5xl mx-auto flex items-center gap-1 sm:gap-2">
        {/* Left Scroll Arrow */}
        <button
          type="button"
          onClick={scrollLeft}
          className="hidden sm:flex w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 items-center justify-center transition-colors shrink-0 cursor-pointer"
          aria-label="Previous dates"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dateItems.map((item) => {
            const isSelected = item.dateStr === selectedDate;
            const isDisabled = item.isPast;

            return (
              <button
                key={item.dateStr}
                data-selected={isSelected}
                disabled={isDisabled}
                type="button"
                onClick={() => onSelectDate(item.dateStr, item.price)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl border text-center transition-all duration-200 cursor-pointer min-w-[96px] sm:min-w-[108px] ${
                  isDisabled
                    ? 'opacity-30 cursor-not-allowed bg-slate-50 border-slate-100 text-slate-400'
                    : isSelected
                    ? 'bg-[#e11d48] border-[#e11d48] text-white shadow-md ring-2 ring-[#e11d48]/20 scale-102 font-bold'
                    : 'bg-slate-50/80 hover:bg-pink-50/40 border-slate-200/90 text-slate-700 hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span
                    className={`text-[11px] font-extrabold uppercase tracking-tight block ${
                      isSelected ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {item.dayName}, {item.dayNum} {item.monthName}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span
                    className={`text-xs font-black ${
                      isSelected
                        ? 'text-white'
                        : item.isCheapest
                        ? 'text-emerald-700'
                        : item.isExpensive
                        ? 'text-rose-600'
                        : 'text-slate-900'
                    }`}
                  >
                    {item.displayPrice}
                  </span>
                  {item.isCheapest && !isSelected && (
                    <TrendingDown className="w-3 h-3 text-emerald-600 inline-block" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          type="button"
          onClick={scrollRight}
          className="hidden sm:flex w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 items-center justify-center transition-colors shrink-0 cursor-pointer"
          aria-label="Next dates"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Calendar Picker Button */}
        <div className="pl-1 border-l border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onOpenCalendarModal}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-pink-50 hover:text-[#e11d48] hover:border-pink-200 border border-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
            title="Open Monthly Price Calendar"
          >
            <CalendarIcon className="w-4 h-4 text-[#e11d48]" />
            <span className="hidden md:inline">{isMr ? 'कॅलेंडर' : 'Calendar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
