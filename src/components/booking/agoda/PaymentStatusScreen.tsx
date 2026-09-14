import React from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export function PaymentStatusScreen({ status, origin, destination, travellerCount, tripType, travelClass, bookingRef, onPrimaryAction }: any) {
  const isSuccess = status === 'success';
  return (
    <div className="fixed inset-0 z-50 bg-transparent flex flex-col justify-between p-6 pt-20">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center mb-8 ${isSuccess ? 'border-premium-sky-deep bg-premium-sky-soft' : 'border-red-500 bg-red-50'}`}>
          {isSuccess ? <CheckCircle2 className="w-16 h-16 text-premium-sky-deep" /> : <XCircle className="w-16 h-16 text-red-500" />}
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-8">{isSuccess ? 'Booking Confirmed' : 'Payment Failed'}</h1>
        
        <div className="flex items-center justify-center gap-4 text-slate-800 mb-2">
          <span className="font-bold text-lg">{origin}</span>
          <ArrowRight className="w-5 h-5 text-slate-400" />
          <span className="font-bold text-lg">{destination}</span>
        </div>
        
        <p className="text-slate-500 text-sm mb-6 text-center">
          {travellerCount} Traveller{travellerCount > 1 ? 's' : ''} • {tripType} • {travelClass}
        </p>
        
        {bookingRef && <div className="font-mono font-bold text-premium-pink bg-premium-pink-soft px-4 py-2 rounded-lg tracking-wider">Booking Ref: {bookingRef}</div>}
      </div>
      
      <button onClick={onPrimaryAction} className="w-full premium-gradient-pink text-white font-bold py-4 rounded-full text-lg shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] shadow-pink-200 active:scale-[0.98] transition-transform">
        {isSuccess ? 'View Booking' : 'Try Again'}
      </button>
    </div>
  );
}