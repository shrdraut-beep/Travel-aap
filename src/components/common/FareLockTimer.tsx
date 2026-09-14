import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface FareLockTimerProps {
  initialSeconds?: number;
  onExpire?: () => void;
  title?: string;
}

export const FareLockTimer: React.FC<FareLockTimerProps> = ({
  initialSeconds = 600, // 10 minutes default
  onExpire,
  title = "Fare & Seats Locked"
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, onExpire]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const progressPercent = Math.max(0, Math.min(100, (seconds / initialSeconds) * 100));

  const isUrgent = seconds < 120;
  const isWarning = seconds >= 120 && seconds < 300;

  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 shadow-2xs ${
        isUrgent
          ? 'bg-rose-50/90 border-rose-200 text-rose-900'
          : isWarning
          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isUrgent
                ? 'bg-rose-500 text-white animate-pulse'
                : isWarning
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isUrgent ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs sm:text-sm tracking-tight">{title}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/80 px-1.5 py-0.5 rounded border border-black/5">
                Live GDS
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isUrgent
                ? "Hurry! Fares are subject to price increases upon session expiry."
                : "Your selected itinerary is locked at this guaranteed price."}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div
            className={`text-base sm:text-lg font-mono font-black tracking-wider ${
              isUrgent ? 'text-rose-600 animate-pulse' : isWarning ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            {formattedTime}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 block">
            Time Left
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-black/10 rounded-full h-1.5 mt-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            isUrgent ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
