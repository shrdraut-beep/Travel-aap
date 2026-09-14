import React, { useState, useEffect } from 'react';
import { Clock, Hourglass } from 'lucide-react';

interface LiveCountdownBannerProps {
  lang: string;
}

export const LiveCountdownBanner: React.FC<LiveCountdownBannerProps> = ({ lang }) => {
  // Dummy target date: 5 days, 12 hours, 30 minutes from now
  const [targetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    d.setHours(d.getHours() + 12);
    d.setMinutes(d.getMinutes() + 30);
    return d;
  });

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [targetDate]);

  const padZero = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-slate-900 rounded-[24px] p-5 shadow-2xl overflow-hidden relative border-2 border-slate-800 mb-6">
      {/* Decorative gradient blob */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-premium-violet-soft0/20 blur-2xl rounded-full" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-500/20 blur-2xl rounded-full" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
            <Hourglass className="w-5 h-5 text-premium-pink" />
          </div>
          <div>
            <div className="text-[10px] font-black text-premium-pink uppercase tracking-widest mb-0.5">
              {lang === 'mr' ? 'अपकमिंग ट्रिप' : 'Upcoming Trip'}
            </div>
            <h3 className="text-white font-bold text-sm tracking-wide">
              {lang === 'mr' ? 'रत्नागिरी ट्रिप - प्रवासाला उरलेत:' : 'Ratnagiri Trip - Starts in:'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-start sm:justify-end">
          {/* Days */}
          <div className="flex flex-col items-center bg-slate-800/80 border border-slate-700 rounded-[16px] px-3 py-2 min-w-[70px]">
            <span className="text-2xl font-black text-white tracking-tight">{padZero(timeLeft.days)}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'mr' ? 'दिवस' : 'Days'}</span>
          </div>
          <span className="text-xl font-bold text-slate-600 mb-4">:</span>
          
          {/* Hours */}
          <div className="flex flex-col items-center bg-slate-800/80 border border-slate-700 rounded-[16px] px-3 py-2 min-w-[70px]">
            <span className="text-2xl font-black text-white tracking-tight">{padZero(timeLeft.hours)}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'mr' ? 'तास' : 'Hours'}</span>
          </div>
          <span className="text-xl font-bold text-slate-600 mb-4">:</span>
          
          {/* Minutes */}
          <div className="flex flex-col items-center bg-slate-800/80 border border-slate-700 rounded-[16px] px-3 py-2 min-w-[70px]">
            <span className="text-2xl font-black text-white tracking-tight">{padZero(timeLeft.minutes)}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'mr' ? 'मिनिटे' : 'Mins'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
