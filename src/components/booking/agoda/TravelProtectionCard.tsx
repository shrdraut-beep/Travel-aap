import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function TravelProtectionCard({ price = 299, gstPercent = 18, selected = false, onSelect }: any) {
  return (
    <div className="bg-white p-4 rounded-[16px] shadow-sm border border-slate-100 mb-4">
      <h3 className="font-bold text-slate-800 mb-1">Travel Insurance</h3>
      <p className="text-sm text-slate-500 mb-4">₹{price}/Total ({gstPercent}% GST included)</p>
      
      <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg mb-3 cursor-pointer hover:bg-transparent">
        <input type="radio" name="insurance" checked={selected} onChange={() => onSelect(true)} className="mt-1 w-4 h-4 text-premium-violet focus:ring-pink-600 border-slate-300" />
        <div>
          <div className="font-medium text-slate-800 text-sm">Yes, Secure my trip for ₹{price}</div>
        </div>
      </label>
      
      <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-transparent">
        <input type="radio" name="insurance" checked={!selected} onChange={() => onSelect(false)} className="mt-1 w-4 h-4 text-premium-violet focus:ring-pink-600 border-slate-300" />
        <div>
          <div className="font-medium text-slate-800 text-sm">No, I will book without trip secure</div>
        </div>
      </label>
      
      <p className="text-xs text-slate-500 mt-4 leading-relaxed">
        Trip Secure is non-refundable. By selecting, I confirm all travellers are Indian nationals, aged 6 months to 90 years, and accept the T&Cs.
      </p>
    </div>
  );
}

export function CfarCard({ price = 499, refundCapTotal = 5000, refundCapPerPax = 2500, selected = false, onToggle }: any) {
  return (
    <div onClick={onToggle} className={`p-4 rounded-[16px] border-2 cursor-pointer transition-colors ${selected ? 'border-premium-pink bg-premium-pink-soft/50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5 text-premium-pink" />
        <h3 className="font-bold text-slate-800 flex-1">Cancel For Any Reason (CFAR)</h3>
        <span className="font-bold text-premium-pink">₹{price}</span>
      </div>
      <p className="text-sm text-slate-600 mb-3">Get refunded for airline cancellation charges if you cancel your flight for any reason.</p>
      <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
        <li>Cancellation refund upto ₹{refundCapTotal.toLocaleString('en-IN')} (₹{refundCapPerPax.toLocaleString('en-IN')} per passenger)</li>
      </ul>
    </div>
  );
}