import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function BillingDetailsSection({ phone, email, gstNumber, onChangePhone, onChangeEmail, onChangeGst }: any) {
  const [hasGst, setHasGst] = useState(!!gstNumber);
  
  return (
    <div className="bg-white p-4 rounded-[16px] border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">Billing Details</h3>
      <label className="block text-xs font-medium text-slate-500 mb-1">Enter Phone Number</label>
      <div className="flex gap-2 mb-4">
        <div className="flex items-center gap-1 bg-transparent border border-slate-200 rounded-lg px-3 py-3">
          <span>🇮🇳</span>
          <span className="font-medium text-slate-800">+91</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>
        <input 
          type="tel"
          className="flex-1 bg-transparent border border-slate-200 rounded-lg p-3 outline-none"
          value={phone}
          onChange={e => onChangePhone(e.target.value)}
        />
      </div>
      <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
      <input 
        type="email"
        className="w-full bg-transparent border border-slate-200 rounded-lg p-3 outline-none mb-4"
        value={email}
        onChange={e => onChangeEmail(e.target.value)}
      />
      <label className="flex items-center gap-3 cursor-pointer">
        <div className={`w-5 h-5 rounded border flex items-center justify-center ${hasGst ? 'bg-[var(--premium-violet)] border-[var(--premium-violet)]' : 'border-slate-300'}`}>
           <input type="checkbox" className="hidden" checked={hasGst} onChange={e => setHasGst(e.target.checked)} />
           {hasGst && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className="text-sm text-slate-700 font-medium">I have a GST number (Optional)</span>
      </label>
      {hasGst && (
        <input 
          className="w-full bg-transparent border border-slate-200 rounded-lg p-3 outline-none mt-3 uppercase"
          placeholder="Enter GSTIN"
          value={gstNumber}
          onChange={e => onChangeGst(e.target.value)}
        />
      )}
    </div>
  );
}