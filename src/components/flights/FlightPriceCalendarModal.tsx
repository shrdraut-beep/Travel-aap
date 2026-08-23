import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles,
  Check,
  Plane
} from 'lucide-react';
import { getMonthCalendarDays, DailyPriceInfo } from '../../utils/fareCalendarUtils';

export interface FlightPriceCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string, price?: number) => void;
  originCode?: string;
  destCode?: string;
  title?: string;
  isReturnDate?: boolean;
  minDate?: string;
  lang?: string;
}

export const FlightPriceCalendarModal: React.FC<FlightPriceCalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  originCode = 'BOM',
  destCode = 'DEL',
  title,
  isReturnDate = false,
  minDate,
  lang = 'en'
}) => {
  const isMr = lang === 'mr';

  // Parse initial year and month
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentYear, setCurrentYear] = useState<number>(
    isNaN(initialDate.getTime()) ? new Date().getFullYear() : initialDate.getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    isNaN(initialDate.getTime()) ? new Date().getMonth() : initialDate.getMonth()
  );

  const [tempSelected, setTempSelected] = useState<string>(selectedDate || new Date().toISOString().split('T')[0]);

  // Sync tempSelected when modal opens or selectedDate changes
  React.useEffect(() => {
    if (selectedDate) {
      setTempSelected(selectedDate);
      const d = new Date(selectedDate);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [selectedDate, isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Get days for current month
  const days = useMemo(() => {
    return getMonthCalendarDays(currentYear, currentMonth, originCode, destCode);
  }, [currentYear, currentMonth, originCode, destCode]);

  // Also get next month for multi-month preview
  const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonthDays = useMemo(() => {
    return getMonthCalendarDays(nextMonthYear, nextMonthIdx, originCode, destCode);
  }, [nextMonthYear, nextMonthIdx, originCode, destCode]);

  const handleConfirm = () => {
    const matchedDay = [...days, ...nextMonthDays].find(d => d?.dateStr === tempSelected);
    onSelectDate(tempSelected, matchedDay?.price);
    onClose();
  };

  const renderMonthGrid = (
    year: number,
    month: number,
    monthDays: Array<DailyPriceInfo | null>
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">
            {monthNames[month]} {year}
          </h3>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
            <span
              key={d}
              className={`text-[11px] font-extrabold uppercase py-1 ${
                i === 0 || i === 6 ? 'text-rose-500' : 'text-slate-400'
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Date cells grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {monthDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="h-14 sm:h-16" />;
            }

            const isSelected = day.dateStr === tempSelected;
            const isMinDisabled = minDate ? day.dateStr < minDate : false;
            const isDisabled = day.isPast || isMinDisabled;

            let priceColor = 'text-slate-500';
            if (day.isCheapest) priceColor = 'text-emerald-700 font-bold';
            if (day.isExpensive) priceColor = 'text-rose-600 font-semibold';

            return (
              <button
                key={day.dateStr}
                disabled={isDisabled}
                type="button"
                onClick={() => {
                  setTempSelected(day.dateStr);
                }}
                className={`h-14 sm:h-16 rounded-xl flex flex-col items-center justify-center p-1 transition-all relative cursor-pointer ${
                  isDisabled
                    ? 'opacity-25 cursor-not-allowed bg-slate-50/50'
                    : isSelected
                    ? 'bg-[#e11d48] text-white shadow-md scale-102 ring-2 ring-[#e11d48]/40'
                    : 'hover:bg-pink-50/60 bg-white border border-slate-100 hover:border-pink-200'
                }`}
              >
                <span
                  className={`text-sm sm:text-base font-extrabold ${
                    isSelected
                      ? 'text-white'
                      : day.isToday
                      ? 'text-[#e11d48] font-black'
                      : 'text-slate-800'
                  }`}
                >
                  {day.dayNum}
                </span>

                {!isDisabled && (
                  <span
                    className={`text-[10px] sm:text-[11px] tracking-tight leading-tight ${
                      isSelected ? 'text-white/90 font-black' : priceColor
                    }`}
                  >
                    {day.displayPrice}
                  </span>
                )}

                {day.isCheapest && !isSelected && !isDisabled && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 font-[Inter]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="bg-[#e11d48] text-white p-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black leading-tight">
                  {title || (isReturnDate 
                    ? (isMr ? 'परतीची तारीख निवडा' : 'Select Return Date') 
                    : (isMr ? 'प्रवासाची तारीख निवडा' : 'Select Departure Date'))}
                </h2>
                <p className="text-[11px] text-white/80 font-medium">
                  {originCode} ➔ {destCode} • {isMr ? 'किमान दर कॅलेंडर' : 'Lowest Fare Calendar'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Month Navigation & Legend Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {isMr ? 'कमी दर' : 'Best Fare'}
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                {isMr ? 'मध्यम' : 'Regular'}
              </span>
              <span className="flex items-center gap-1 font-bold text-rose-500">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                {isMr ? 'जास्त दर' : 'Peak'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 min-w-[75px] text-center">
                {monthNames[currentMonth].slice(0, 3)} {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Calendar Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-6">
            {renderMonthGrid(currentYear, currentMonth, days)}

            <div className="border-t border-slate-100 pt-5">
              {renderMonthGrid(nextMonthYear, nextMonthIdx, nextMonthDays)}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-4 shrink-0 shadow-lg">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMr ? 'निवडलेली तारीख' : 'Selected Date'}
              </span>
              <span className="text-sm font-black text-slate-900">
                {tempSelected ? new Date(tempSelected).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}
              </span>
            </div>

            <button
              onClick={handleConfirm}
              className="bg-[#e11d48] hover:bg-[#be123c] active:scale-98 text-white font-extrabold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isMr ? 'तारीख निश्चित करा' : 'Confirm Date'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
