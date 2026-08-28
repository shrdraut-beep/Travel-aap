import React from 'react';

export function FareBreakupCard({ baseFare = 0, taxesAndFees = 0, convenienceFee = 0, convenienceFeeWaived = false, total = 0 }: any) {
  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h3 className="font-bold text-slate-800 mb-4">Fare breakup</h3>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Base Fare</span>
          <span className="text-sm font-medium text-slate-800">{formatINR(baseFare)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Taxes & Fees</span>
          <span className="text-sm font-medium text-slate-800">{formatINR(taxesAndFees)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${convenienceFeeWaived ? 'text-slate-400 line-through' : 'text-slate-600'}`}>Convenience Fee</span>
          <span className={`text-sm ${convenienceFeeWaived ? 'text-slate-400 line-through' : 'font-medium text-slate-800'}`}>{formatINR(convenienceFee)}</span>
        </div>
        {convenienceFeeWaived && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-emerald-600">Convenience fee off</span>
            <span className="text-sm font-medium text-emerald-600">₹0</span>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 italic mb-4">Convenience Fee is non-refundable</p>
      <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
        <span className="font-bold text-slate-800 text-lg">Total</span>
        <span className="font-black text-amber-600 text-xl">{formatINR(total)}</span>
      </div>
    </div>
  );
}