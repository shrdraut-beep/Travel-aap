import React, { useState, useEffect } from 'react';
import { CalendarDays, AlertTriangle } from 'lucide-react';
import { checkHolidaysDuringTrip, PublicHoliday } from '../services/api/holidays';

interface HolidayAlertWidgetProps {
  startDate: string;
  endDate: string;
  lang: string;
}

export const HolidayAlertWidget: React.FC<HolidayAlertWidgetProps> = ({ startDate, endDate, lang }) => {
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchHols = async () => {
      const res = await checkHolidaysDuringTrip(startDate, endDate);
      setHolidays(res);
    };

    fetchHols();
  }, [startDate, endDate]);

  if (holidays.length === 0) return null;

  return (
    <div className="bg-rose-50 border border-rose-100 rounded-[20px] p-4 shadow-sm mb-4">
      <div className="flex items-center gap-3 mb-2 text-rose-600">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <h3 className="font-black uppercase tracking-wider text-sm">
          {lang === 'mr' ? 'प्रवास इशारा: सुट्ट्यांचे दिवस' : 'Travel Alert: Public Holidays'}
        </h3>
      </div>
      <p className="text-xs font-bold text-rose-800 mb-3 opacity-90 leading-tight">
        {lang === 'mr' 
          ? 'तुमच्या सहलीच्या तारखांना सार्वजनिक सुट्ट्या आहेत. गर्दी आणि ट्रॅफिकची शक्यता आहे.' 
          : 'Your trip coincides with public holidays. Expect crowds and plan accordingly.'}
      </p>
      
      <div className="space-y-2">
        {holidays.map((h, i) => (
          <div key={i} className="flex items-center gap-3 bg-white p-2.5 rounded-[16px] border border-rose-100 shadow-xs">
            <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{h.name}</p>
              <p className="text-[10px] font-bold text-slate-500">{new Date(h.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
