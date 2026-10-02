import React, { useRef, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
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

  // Find lowest price across items
  const lowestFareItem = useMemo(() => {
    const valid = dateItems.filter(d => !d.isPast && d.price > 0);
    if (valid.length === 0) return null;
    return valid.reduce((min, cur) => cur.price < min.price ? cur : min, valid[0]);
  }, [dateItems]);

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
    <div className="bg-[#f8fafc] px-3 py-2 select-none sticky top-14 z-30">
      {/* Signature Stitch Sleek Compact Fare Calendar Rail */}
      <section className="bg-white rounded-2xl p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200/80 max-w-5xl mx-auto">
        {/* Header Strip */}
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-sky-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-['Outfit',sans-serif]">
              {isMr ? 'किफायतशीर दर कॅलेंडर' : 'Lowest Fare Calendar'}
            </span>
          </div>

          {lowestFareItem && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-emerald-600" />
              <span>{isMr ? 'किमान' : 'Cheapest'}: {lowestFareItem.displayPrice}</span>
            </span>
          )}
        </div>

        {/* Date Rail with Scroll Arrows */}
        <div className="flex items-center gap-1.5">
          {/* Left Arrow */}
          <button
            type="button"
            onClick={scrollLeft}
            className="hidden sm:flex size-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 items-center justify-center transition-colors shrink-0 border border-slate-200/70 cursor-pointer"
            aria-label="Previous dates"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 flex-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {dateItems.map((item) => {
              const isSelected = item.dateStr === selectedDate;
              const isDisabled = item.isPast;
              const isCheapest = item.isCheapest || (lowestFareItem && item.price === lowestFareItem.price);
              const isExpensive = item.isExpensive;
              const isModerate = item.category === 'average' && !isCheapest && !isExpensive;

              let styleClasses = 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70';
              let dateTextClass = 'text-slate-500';
              let priceTextClass = 'text-slate-700';

              if (isDisabled) {
                styleClasses = 'opacity-30 cursor-not-allowed bg-slate-50 border-slate-100 text-slate-400';
              } else if (isSelected) {
                styleClasses = 'bg-[#0ea5e9] text-white shadow-sm ring-2 ring-sky-300 relative scale-102';
                dateTextClass = 'text-sky-100';
                priceTextClass = 'text-white';
              } else if (isCheapest) {
                styleClasses = 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border-emerald-200/80';
                dateTextClass = 'text-emerald-700';
                priceTextClass = 'text-emerald-700';
              } else if (isModerate) {
                styleClasses = 'bg-amber-50/70 hover:bg-amber-100 text-amber-900 border-amber-200/80';
                dateTextClass = 'text-amber-700';
                priceTextClass = 'text-amber-800';
              } else if (isExpensive) {
                styleClasses = 'bg-rose-50/70 hover:bg-rose-100 text-rose-900 border-rose-200/80';
                dateTextClass = 'text-rose-600';
                priceTextClass = 'text-rose-700';
              }

              return (
                <button
                  key={item.dateStr}
                  data-selected={isSelected}
                  disabled={isDisabled}
                  type="button"
                  onClick={() => onSelectDate(item.dateStr, item.price)}
                  className={`flex flex-col items-center justify-center min-w-[62px] sm:min-w-[68px] py-1.5 px-2 rounded-xl border transition-all shrink-0 cursor-pointer ${styleClasses}`}
                >
                  <span className={`text-[10px] font-bold ${dateTextClass}`}>
                    {item.dayNum} {item.monthName}
                  </span>
                  <span className={`text-xs font-bold mt-0.5 font-['Outfit',sans-serif] ${priceTextClass}`}>
                    {item.displayPrice}
                  </span>
                  {isSelected && (
                    <span className="text-[8px] font-extrabold tracking-tight bg-white text-[#0ea5e9] px-1 rounded-xs mt-0.5">
                      SELECTED
                    </span>
                  )}
                </button>
              );
            })}

            {/* Calendar Picker Button ("More") */}
            <button
              type="button"
              onClick={onOpenCalendarModal}
              aria-label="Open Full Calendar"
              className="flex flex-col items-center justify-center size-[48px] rounded-xl bg-sky-50 text-[#0ea5e9] hover:bg-sky-100 border border-sky-200 shrink-0 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <CalendarIcon className="w-5 h-5 text-[#0ea5e9]" />
              <span className="text-[9px] font-bold mt-0.5">{isMr ? 'अधिक' : 'More'}</span>
            </button>
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={scrollRight}
            className="hidden sm:flex size-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 items-center justify-center transition-colors shrink-0 border border-slate-200/70 cursor-pointer"
            aria-label="Next dates"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
