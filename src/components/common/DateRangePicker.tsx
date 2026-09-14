import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DateRangePickerProps {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  onChange: (checkIn: string, checkOut: string) => void;
  lang?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ checkIn, checkOut, onChange, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(checkIn || new Date()));
  
  // Temporary selection state while modal is open
  const [tempStart, setTempStart] = useState<string | null>(checkIn);
  const [tempEnd, setTempEnd] = useState<string | null>(checkOut);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleDayClick = (dateStr: string) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dateStr);
      setTempEnd(null);
    } else if (tempStart && !tempEnd) {
      if (new Date(dateStr) < new Date(tempStart)) {
        setTempStart(dateStr);
        setTempEnd(tempStart);
      } else {
        setTempEnd(dateStr);
      }
    }
  };

  const handleApply = () => {
    if (tempStart && tempEnd) {
      onChange(tempStart, tempEnd);
      setIsOpen(false);
    } else if (tempStart) {
      // If only check-in is selected, make check-out next day
      const nextDay = new Date(tempStart);
      nextDay.setDate(nextDay.getDate() + 1);
      onChange(tempStart, nextDay.toISOString().split('T')[0]);
      setIsOpen(false);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const renderMonth = (monthOffset: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const monthName = d.toLocaleString(lang === 'mr' ? 'mr-IN' : 'en-US', { month: 'long' });

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const isPast = currentDate < today;
      
      const isStart = dateStr === tempStart;
      const isEnd = dateStr === tempEnd;
      const isBetween = tempStart && tempEnd && dateStr > tempStart && dateStr < tempEnd;
      const isSelected = isStart || isEnd || isBetween;

      days.push(
        <button
          key={dateStr}
          disabled={isPast}
          onClick={() => handleDayClick(dateStr)}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all relative
            ${isPast ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100 cursor-pointer'}
            ${isStart || isEnd ? 'premium-gradient-pink text-white hover:bg-premium-violet-soft z-10' : ''}
            ${isBetween ? 'bg-premium-violet-soft text-premium-violet rounded-none' : ''}
          `}
        >
          {isStart && tempEnd && <div className="absolute top-0 bottom-0 right-0 w-1/2 bg-premium-violet-soft -z-10" />}
          {isEnd && tempStart && <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-premium-violet-soft -z-10" />}
          {i}
        </button>
      );
    }

    return (
      <div className="w-full sm:w-1/2 p-2 shrink-0">
        <h4 className="text-center font-bold text-slate-800 mb-4">{monthName} {year}</h4>
        <div className="grid grid-cols-7 gap-y-2 mb-2 text-center text-xs font-bold text-slate-400">
          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
        <div className="grid grid-cols-7 gap-y-1 place-items-center">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full">
      <div 
        className="flex items-center justify-between border border-slate-300 rounded-[16px] p-3 bg-white cursor-pointer hover:border-premium-violet transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-premium-violet" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Check In - Check Out</span>
            <span className="font-bold text-slate-800">
              {formatDisplayDate(checkIn)} &nbsp;&rarr;&nbsp; {formatDisplayDate(checkOut)}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm sm:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:top-full sm:mt-2 sm:left-0 sm:right-auto sm:w-[600px] bg-white sm:rounded-[20px] rounded-t-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="font-black text-slate-800 text-lg">Select Dates</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-4 flex items-center justify-between">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full active:scale-95">
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full active:scale-95">
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row px-2 pb-4 overflow-y-auto max-h-[60vh] sm:max-h-none">
                {renderMonth(0)}
                {renderMonth(1)}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-600">
                  {tempStart ? formatDisplayDate(tempStart) : 'Select'} 
                  &nbsp;&rarr;&nbsp; 
                  {tempEnd ? formatDisplayDate(tempEnd) : 'Select'}
                </div>
                <button 
                  onClick={handleApply}
                  disabled={!tempStart}
                  className="bg-[var(--premium-violet)] disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg active:scale-95 transition-transform"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
