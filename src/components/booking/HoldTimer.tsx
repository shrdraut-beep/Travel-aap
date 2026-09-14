// src/components/booking/HoldTimer.tsx
import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useBookingFlow } from '../../context/BookingFlowContext';

interface HoldTimerProps {
  minutes?: number;
}

export const HoldTimer: React.FC<HoldTimerProps> = ({ minutes = 15 }) => {
  const { state, dispatch } = useBookingFlow();
  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    if (!state.holdExpiresAt) {
      dispatch({ type: 'START_HOLD', minutes });
    }
  }, [state.holdExpiresAt, dispatch, minutes]);

  useEffect(() => {
    if (!state.holdExpiresAt) return;
    const tick = () => {
      const diff = Math.max(0, state.holdExpiresAt! - Date.now());
      setRemainingMs(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state.holdExpiresAt]);

  if (!state.holdExpiresAt) return null;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  const isUrgent = totalSeconds < 120;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-colors ${
        isUrgent
          ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
          : 'bg-[var(--premium-pink)]/15 text-premium-pink border border-premium-pink'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-600' : 'text-premium-pink'}`} />
      <span>{mm}:{ss} Mins left</span>
    </div>
  );
};
