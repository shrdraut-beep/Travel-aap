import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export function RoomSelectionCard({ features = [], expiresInSeconds = 1200, limitedAvailability = true }: any) {
  const [rem, setRem] = useState(expiresInSeconds);
  useEffect(() => {
    const t = setInterval(() => setRem((r: number) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const m = Math.floor(rem / 60).toString().padStart(2, '0');
  const s = Math.floor(rem % 60).toString().padStart(2, '0');

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-slate-100 p-4 space-y-4">
      <div className="flex items-center justify-between bg-transparent p-2 rounded-lg">
        <span className="text-xs font-medium text-slate-600">Current price may change in..</span>
        <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
          <Clock className="w-3 h-3" /> {m}:{s}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {features.map((f: any) => (
          <div key={f.label} className="w-[45%] flex items-center gap-1 text-xs text-slate-700">
            <span className="text-premium-sky-deep">✓</span> {f.label}
          </div>
        ))}
      </div>
      {limitedAvailability && (
        <div className="flex items-center gap-2 bg-premium-pink-soft text-premium-pink p-2 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4" /> We have limited availability at this price - book now!
        </div>
      )}
    </div>
  );
}