import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Compass as  MapPin, Clock, Plus, X, Sun, Sunrise, Sunset, AlertCircle, Info, CalendarDays, Edit3, ArrowRight } from 'lucide-react';
import { TripPlan, TripGroup } from '../../types';
import * as freeUtils from '../../services/api/freeUtils';
import Markdown from 'react-markdown';

interface CalendarViewProps {
  trip: TripGroup;
  itinerary: TripPlan[];
  lang: string;
  currencySymbol: string;
  onUpdateTrip?: (updatedTrip: TripGroup) => void;
  onAddPlan?: () => void;
}

interface MappedDayEvent {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number; // 1, 2, 3...
  title: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
  dailyBudget?: string;
  localTips?: string;
  plans: TripPlan[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  trip,
  itinerary = [],
  lang,
  currencySymbol,
  onUpdateTrip,
  onAddPlan,
}) => {
  const isMr = lang === 'mr';

  // 1. TRIP DATES HANDLING
  const startDateStr = trip.startDate || new Date().toISOString().split('T')[0];
  const endDateStr = trip.endDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  const [selectedStartDate, setSelectedStartDate] = useState(startDateStr);
  const [selectedEndDate, setSelectedEndDate] = useState(endDateStr);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [sunsetData, setSunsetData] = useState<{ sunrise: string; sunset: string } | null>(null);

  React.useEffect(() => {
    async function fetchSunset() {
      try {
        const dest = (trip as any).destination || trip.name;
        // Static import used
        const geocode = await freeUtils.geocodeDestination(dest);
        if (geocode && geocode.lat && geocode.lng) {
          const times = await freeUtils.getSunriseSunset(geocode.lat, geocode.lng);
          if (times) {
            
            const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setSunsetData({ sunrise: formatTime(times.sunrise), sunset: formatTime(times.sunset) });

          }
        }
      } catch(e) {
        console.error("Sunset fetch error:", e);
      }
    }
    fetchSunset();
  }, [trip.name, (trip as any).destination]);

  // Sync state if props change
  React.useEffect(() => {
    setSelectedStartDate(trip.startDate || new Date().toISOString().split('T')[0]);
    setSelectedEndDate(trip.endDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  }, [trip.startDate, trip.endDate]);

  // Calendar View month navigation state
  const initialDate = new Date(startDateStr);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    isNaN(initialDate.getTime()) ? new Date() : new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const [selectedDateCell, setSelectedDateCell] = useState<string | null>(startDateStr);

  // 2. PARSE Smart PLAN AND ITINERARY DATA MAPPING
  const mappedEventsByDate = useMemo(() => {
    const map: Record<string, MappedDayEvent> = {};

    const baseStart = new Date(selectedStartDate);
    const isValidBase = !isNaN(baseStart.getTime());

    // A) Try parsing raw JSON aiPlan if present
    let aiParsedData: any = null;
    if (trip.aiPlan) {
      try {
        aiParsedData = JSON.parse(trip.aiPlan);
      } catch (e) {
        // Not direct JSON
      }
    }

    const itArr = aiParsedData?.Day_By_Day_Itinerary || aiParsedData?.itinerary;
    if (itArr && Array.isArray(itArr)) {
      itArr.forEach((item: any, idx: number) => {
        const dayNum = item.day || idx + 1;
        const targetDate = new Date(baseStart);
        if (isValidBase) {
          targetDate.setDate(targetDate.getDate() + (dayNum - 1));
        }
        const dateKey = targetDate.toISOString().split('T')[0];

        map[dateKey] = {
          dateStr: dateKey,
          dayNumber: dayNum,
          title: `${isMr ? 'दिवस' : 'Day'} ${dayNum}: ${aiParsedData.trip_title || trip.name}`,
          morning: item.activities_sequence ? item.activities_sequence.join('\n') : item.morning,
          afternoon: item.afternoon,
          evening: item.evening,
          dailyBudget: item.daily_budget_breakdown,
          localTips: item.local_pro_tips,
          plans: [],
        };
      });
    }

    // B) Map actual itinerary plans (TripPlan items) to dates
    itinerary.forEach((plan, index) => {
      let planDateKey = '';

      if (plan.datetime && plan.datetime.includes('T')) {
        planDateKey = plan.datetime.split('T')[0];
      } else if (plan.datetime) {
        planDateKey = plan.datetime.slice(0, 10);
      }

      // Check if plan title or ID specifies "Day X" / "दिवस X"
      const dayMatch = (plan.title || '').match(/(?:Day|दिवस)\s*(\d+)/i) || (plan.id || '').match(/day_(\d+)/i);

      if (dayMatch && dayMatch[1] && isValidBase) {
        const dayNum = parseInt(dayMatch[1], 10);
        const calcDate = new Date(baseStart);
        calcDate.setDate(calcDate.getDate() + (dayNum - 1));
        const calcDateKey = calcDate.toISOString().split('T')[0];

        // Match or backfill
        if (!map[calcDateKey]) {
          map[calcDateKey] = {
            dateStr: calcDateKey,
            dayNumber: dayNum,
            title: plan.title,
            plans: [plan],
          };
        } else {
          if (!map[calcDateKey].plans.some((p) => p.id === plan.id)) {
            map[calcDateKey].plans.push(plan);
          }
        }
      } else if (planDateKey) {
        if (!map[planDateKey]) {
          const calcDayNum = isValidBase
            ? Math.floor((new Date(planDateKey).getTime() - baseStart.getTime()) / (86400000)) + 1
            : index + 1;

          map[planDateKey] = {
            dateStr: planDateKey,
            dayNumber: Math.max(1, calcDayNum),
            title: plan.title,
            plans: [plan],
          };
        } else {
          if (!map[planDateKey].plans.some((p) => p.id === plan.id)) {
            map[planDateKey].plans.push(plan);
          }
        }
      }
    });

    return map;
  }, [trip.aiPlan, itinerary, selectedStartDate, isMr, trip.name]);

  // Handle Trip Date update confirmation
  const handleSaveDates = () => {
    if (onUpdateTrip) {
      onUpdateTrip({
        ...trip,
        startDate: selectedStartDate,
        endDate: selectedEndDate,
      });
    }
    setIsEditingDates(false);
  };

  // Month navigation helpers
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const jumpToTripStart = () => {
    const sDate = new Date(selectedStartDate);
    if (!isNaN(sDate.getTime())) {
      setCurrentMonth(new Date(sDate.getFullYear(), sDate.getMonth(), 1));
      setSelectedDateCell(selectedStartDate);
    }
  };

  // Generate Calendar Grid Days
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 = Sun

  const monthYearHeader = currentMonth.toLocaleDateString(isMr ? 'mr-IN' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  const weekDayLabels = isMr
    ? ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरू', 'शुक्र', 'शनि']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if date string falls within trip duration
  const isWithinTrip = (dateStr: string) => {
    return dateStr >= selectedStartDate && dateStr <= selectedEndDate;
  };

  const activeEvent = selectedDateCell ? mappedEventsByDate[selectedDateCell] : null;

  return (
    <div className="space-y-5">
      {/* 1. TOP BAR & TRIP START DATE MAPPING CONTROLLER */}
      <div className="bg-gradient-to-r from-slate-900 via-pink-950 to-slate-900 rounded-[24px] p-5 text-white shadow-xl border border-premium-violet/20 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[20px] bg-[var(--premium-violet-soft)] border border-transparent flex items-center justify-center text-[var(--premium-violet)]">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight flex items-center gap-2">
                <span>{isMr ? 'ॲक्टिव्ह कॅलेंडर मॅपिंग' : 'Smart Calendar Itinerary View'}</span>
                <span className="px-2 py-0.5 bg-[var(--premium-sky-soft)] text-[var(--premium-violet)] border border-transparent rounded-full text-[10px] font-extrabold uppercase">
                  {isMr ? 'लाईव्ह' : 'Live Map'}
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                {isMr
                  ? 'दिनांक निवडा - Smart दिवस १, दिवस २ आपोआप कॅलेंडरवर मॅप होतील'
                  : 'Select trip start date to map Day 1, Day 2 onto real calendar dates'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingDates(!isEditingDates)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-[16px] text-xs font-bold uppercase tracking-wider backdrop-blur transition-all border border-white/15 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-[var(--premium-violet)]" />
              <span>{isMr ? 'तारीख बदला' : 'Change Start Date'}</span>
            </button>
            <button
              onClick={jumpToTripStart}
              className="px-3 py-2 bg-[var(--premium-violet)] hover:opacity-90 text-white rounded-[16px] text-xs font-bold uppercase tracking-wider transition-all shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]"
            >
              {isMr ? 'सहलीची तारीख' : 'Trip Month'}
            </button>
          </div>
        </div>

        {/* Date Selector Dropdown Panel */}
        <AnimatePresence>
          {isEditingDates && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div className="bg-white/10 backdrop-blur rounded-[20px] p-3 border border-white/10">
                <label className="block text-[10px] font-black uppercase text-[var(--premium-violet)] mb-1">
                  {isMr ? 'सहल सुरुवात तारीख (Start Date)' : 'Trip Start Date'}
                </label>
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => setSelectedStartDate(e.target.value)}
                  className="w-full bg-transparent text-white font-bold text-sm outline-none cursor-pointer"
                />
              </div>

              <div className="bg-white/10 backdrop-blur rounded-[20px] p-3 border border-white/10 flex items-center justify-between gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase text-[var(--premium-violet)] mb-1">
                    {isMr ? 'सहल शेवट तारीख (End Date)' : 'Trip End Date'}
                  </label>
                  <input
                    type="date"
                    value={selectedEndDate}
                    onChange={(e) => setSelectedEndDate(e.target.value)}
                    className="w-full bg-transparent text-white font-bold text-sm outline-none cursor-pointer"
                  />
                </div>
                <button
                  onClick={handleSaveDates}
                  className="px-4 py-2.5 bg-orange-400 hover:bg-orange-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-[16px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] transition-all self-end"
                >
                  {isMr ? 'अपडेट करा' : 'Apply'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. CALENDAR MONTH NAVIGATION HEADER */}
      <div className="premium-card p-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2.5 hover:bg-slate-100 rounded-[20px] text-slate-700 transition-colors cursor-pointer"
          title="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h4 className="font-black text-slate-900 text-lg capitalize tracking-tight">{monthYearHeader}</h4>
          <span className="text-[11px] font-extrabold text-premium-violet block">
            {isMr ? `सहल कालावधी: ${selectedStartDate} ते ${selectedEndDate}` : `Trip Dates: ${selectedStartDate} to ${selectedEndDate}`}
          </span>
        </div>

        <button
          onClick={nextMonth}
          className="p-2.5 hover:bg-slate-100 rounded-[20px] text-slate-700 transition-colors cursor-pointer"
          title="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 3. CALENDAR MONTHLY HORIZONTAL SCROLL */}
      <div className="premium-card p-4 shadow-xl border border-slate-200/80">
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
            const dayOfWeek = weekDayLabels[dateObj.getDay()];
            const monthFormatted = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
            const dayFormatted = dayNum.toString().padStart(2, '0');
            const dateStr = `${currentMonth.getFullYear()}-${monthFormatted}-${dayFormatted}`;

            const isTripDay = isWithinTrip(dateStr);
            const isSelected = selectedDateCell === dateStr;
            const mappedEvent = mappedEventsByDate[dateStr];
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <motion.button
                key={dateStr}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDateCell(dateStr)}
                className={`snap-center min-w-[72px] sm:min-w-[80px] p-2.5 rounded-[20px] border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer shrink-0 relative overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-[#FF5A5F] border-[#FF5A5F] bg-rose-50/70 shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]'
                    : isTripDay
                    ? 'bg-premium-pink-soft/80 border-premium-pink/80 hover:bg-[var(--premium-pink-soft)]'
                    : 'bg-white border-slate-100 hover:border-slate-300'
                }`}
              >
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${dateObj.getDay() === 0 || dateObj.getDay() === 6 ? 'text-premium-pink' : 'text-slate-500'}`}>
                  {dayOfWeek}
                </span>
                
                <span
                  className={`text-xl sm:text-2xl font-black w-10 h-10 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-[#FF5A5F] text-white shadow-sm'
                      : isTripDay
                      ? 'text-[var(--premium-pink)] font-black'
                      : 'text-slate-800'
                  }`}
                >
                  {dayNum}
                </span>

                {mappedEvent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--premium-pink)] mt-1 shadow-sm" title={mappedEvent.title} />
                ) : isTripDay ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-300/50 mt-1" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-transparent mt-1" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4. SELECTED DATE DETAILED Smart DAY EVENT CARD */}
      <AnimatePresence mode="wait">
        {selectedDateCell && (
          <motion.div
            key={selectedDateCell}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="premium-card p-6 shadow-xl border border-slate-200 space-y-5"
          >
            {/* Day Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-400 text-slate-950 rounded-[20px] flex items-center justify-center font-black text-lg shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] shrink-0">
                  {activeEvent ? `D${activeEvent.dayNumber}` : '📅'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-premium-pink tracking-wider">
                      {new Date(selectedDateCell).toLocaleDateString(isMr ? 'mr-IN' : 'en-IN', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                    {activeEvent ? activeEvent.title : (isMr ? 'या दिवसासाठी कोणतीही नोंद नाही' : 'No Schedule Recorded for this Date')}
                  </h3>
                </div>
              </div>

              {onAddPlan && (
                <button
                  onClick={onAddPlan}
                  className="px-4 py-2 bg-[var(--premium-violet)] hover:bg-premium-violet-soft text-white rounded-[16px] font-black text-xs uppercase tracking-wider shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] flex items-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isMr ? 'योजना जोडा' : 'Add Event'}</span>
                </button>
              )}
            </div>

            {/* Smart Day-Wise Structured Schedule Breakdown */}
            {activeEvent ? (
              <div className="space-y-4">
                {/* Morning Slot */}
                {activeEvent.morning && (
                  <div className="p-4 bg-premium-pink-soft/60 border border-premium-pink/70 rounded-[20px] space-y-1.5">
                    <div className="flex items-center gap-2 text-premium-pink font-black text-xs uppercase tracking-wider">
                      <Sunrise className="w-4 h-4 text-premium-pink" />
                      <span>{isMr ? '🌅 सकाळचे नियोजन (Morning)' : '🌅 Morning Itinerary'}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed pl-6">
                      {activeEvent.morning}
                    </p>
                  </div>
                )}

                {/* Afternoon Slot */}
                {activeEvent.afternoon && (
                  <div className="p-4 bg-orange-50/60 border border-orange-200/70 rounded-[20px] space-y-1.5">
                    <div className="flex items-center gap-2 text-orange-800 font-black text-xs uppercase tracking-wider">
                      <Sun className="w-4 h-4 text-orange-600" />
                      <span>{isMr ? '☀️ दुपारचे नियोजन (Afternoon)' : '☀️ Afternoon Itinerary'}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed pl-6">
                      {activeEvent.afternoon}
                    </p>
                  </div>
                )}

                {/* Evening Slot */}
                {activeEvent.evening && (
                  <div className="p-4 bg-premium-violet-soft/60 border border-premium-violet/70 rounded-[20px] space-y-1.5">
                    <div className="flex items-center gap-2 text-premium-violet font-black text-xs uppercase tracking-wider">
                      <Sunset className="w-4 h-4 text-premium-violet" />
                      <span>{isMr ? '🌇 संध्याकाळचे नियोजन (Evening)' : '🌇 Evening Itinerary'}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed pl-6">
                      {activeEvent.evening}
                    </p>
                  </div>
                )}

                {/* Daily Budget & Local Tips Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {sunsetData && (
                    <div className="col-span-1 sm:col-span-2 p-3.5 bg-orange-50/70 border border-orange-200 rounded-[20px] space-y-1 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-orange-800 tracking-wider block">
                          🌅 {isMr ? 'सूर्योदय व सूर्यास्त' : 'Sunrise & Sunset Timing'}
                        </span>
                        <p className="text-xs font-bold text-orange-950 mt-1 flex items-center gap-2">
                          <Sunrise className="w-3.5 h-3.5 text-orange-500" /> {sunsetData.sunrise} 
                          <span className="text-orange-300">|</span> 
                          <Sunset className="w-3.5 h-3.5 text-orange-500" /> {sunsetData.sunset}
                        </p>
                      </div>
                    </div>
                  )}
                  {activeEvent.dailyBudget && (
                    <div className="p-3.5 bg-premium-sky-soft/70 border border-premium-sky-deep rounded-[20px] space-y-1">
                      <span className="text-[10px] font-black uppercase text-premium-sky-deep tracking-wider block">
                        💰 {isMr ? 'दैनिक खर्च अंदाज' : 'Daily Budget Breakdown'}
                      </span>
                      <p className="text-xs font-bold text-[var(--premium-sky-deep)]">
                        {activeEvent.dailyBudget}
                      </p>
                    </div>
                  )}

                  {activeEvent.localTips && (
                    <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-[20px] space-y-1">
                      <span className="text-[10px] font-black uppercase text-sky-800 tracking-wider block">
                        💡 {isMr ? 'स्थानिक टिप्स' : 'Local Pro Tips'}
                      </span>
                      <p className="text-xs font-bold text-sky-950">
                        {activeEvent.localTips}
                      </p>
                    </div>
                  )}
                </div>

                {/* Custom Plans associated with this day */}
                {activeEvent.plans.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                      {isMr ? 'नियोजित उपक्रम (Custom Saved Plans):' : 'Saved Custom Plans for this Date:'}
                    </h5>
                    {activeEvent.plans.map((p) => (
                      <div key={p.id} className="p-3.5 bg-transparent border border-slate-200/80 rounded-[20px] space-y-1">
                        <div className="flex items-center justify-between">
                          <h6 className="font-black text-slate-900 text-sm">{p.title}</h6>
                          {p.cost && (
                            <span className="text-xs font-black bg-white px-2 py-0.5 border rounded-lg text-slate-800">
                              {currencySymbol}{p.cost}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-600 prose prose-slate max-w-none">
                          <Markdown>{typeof p.detail === 'string' ? p.detail : ''}</Markdown>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-transparent/60 rounded-[20px] border border-dashed border-slate-200 space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  {isMr ? 'या तारखेसाठी कोणतीही Smart किंवा मॅन्युअल नोंद नाही' : 'No Smart itinerary or manual plans mapped to this date'}
                </p>
                {onAddPlan && (
                  <button
                    onClick={onAddPlan}
                    className="px-4 py-2 premium-gradient-pink text-white rounded-[16px] font-black text-xs uppercase tracking-wider shadow"
                  >
                    {isMr ? 'या दिवसासाठी योजना जोडा' : 'Add Plan For This Date'}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
