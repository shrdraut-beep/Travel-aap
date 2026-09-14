import React, { useState } from 'react';
import { Bell, X, CheckCircle2, TrendingDown, ArrowRight, ShieldCheck, Mail, Phone } from 'lucide-react';

export interface PriceDropAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  flightNumber: string;
  originCity: string;
  destCity: string;
  currentFare: number;
  departDate: string;
}

export const PriceDropAlertModal: React.FC<PriceDropAlertModalProps> = ({
  isOpen,
  onClose,
  flightNumber,
  originCity,
  destCity,
  currentFare,
  departDate
}) => {
  const [targetDiscount, setTargetDiscount] = useState<number>(500);
  const [phone, setPhone] = useState('9820012345');
  const [email, setEmail] = useState('traveler@example.com');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const targetFare = Math.max(1000, currentFare - targetDiscount);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existing = JSON.parse(localStorage.getItem('routripo_price_drop_alerts') || '[]');
      existing.push({
        id: `alert-${Date.now()}`,
        flightNumber,
        originCity,
        destCity,
        departDate,
        currentFare,
        targetFare,
        phone,
        email,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('routripo_price_drop_alerts', JSON.stringify(existing));
    } catch (e) {}

    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                <span>Fare Drop Alert &amp; Tracker</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {originCity} ➔ {destCity} · {flightNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSaved ? (
          <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Price Watch Activated!</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              Our automated Travelport tracker is now monitoring <strong>{flightNumber}</strong>. You'll receive an instant WhatsApp alert as soon as the fare drops to <strong>₹{targetFare.toLocaleString('en-IN')}</strong>!
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleActivate} className="space-y-4 text-xs">
            {/* Price target card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Current Airline Fare:</span>
                <span className="font-extrabold text-slate-900">₹{currentFare.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Alert Me When Price Drops By:</span>
                <div className="flex gap-1.5">
                  {[300, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTargetDiscount(amt)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                        targetDiscount === amt
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-rose-600">
                <span>Notify Target Fare:</span>
                <span className="text-base font-black">₹{targetFare.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Notification Contact */}
            <div>
              <label className="font-bold text-slate-700 uppercase block mb-1">WhatsApp Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-98"
            >
              <Bell className="w-4 h-4" />
              <span>Set Instant Price Alert</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
