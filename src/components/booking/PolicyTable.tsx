// src/components/booking/PolicyTable.tsx
import React, { useState } from 'react';
import { useBookingFlow } from '../../context/BookingFlowContext';
import { ShieldCheck, Info, FileText, AlertCircle } from 'lucide-react';

export const PolicyTable: React.FC = () => {
  const { state } = useBookingFlow();
  const [activeTab, setActiveTab] = useState<'cancellation' | 'dateChange'>('cancellation');
  const fare = state.selectedFare;

  const cancellationSlabs = fare?.cancellationSlabs || [
    { window: '0 to 4 hrs before departure', fee: 5000, platformFee: 300 },
    { window: '4 hrs to 4 days before departure', fee: 3500, platformFee: 300 },
    { window: '4 days to 365 days before departure', fee: 3000, platformFee: 300 },
  ];

  const dateChangeSlabs = fare?.dateChangeSlabs || [
    { window: '0 to 4 hrs before departure', fee: 5000, platformFee: 300 },
    { window: '4 hrs to 4 days before departure', fee: 3250, platformFee: 300 },
    { window: '4 days to 365 days before departure', fee: 2750, platformFee: 300 },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#0B1E3D]" />
          <h4 className="font-black text-sm text-[#0B1E3D] uppercase tracking-wide">
            Fare Rules & Policy
          </h4>
        </div>
        <span className="text-[11px] font-bold text-premium-pink bg-premium-pink-soft px-2.5 py-0.5 rounded-full border border-premium-pink">
          {fare?.label || 'Standard Fare'}
        </span>
      </div>

      {/* Toggle Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-[16px]">
        <button
          type="button"
          onClick={() => setActiveTab('cancellation')}
          className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
            activeTab === 'cancellation'
              ? 'bg-[#0B1E3D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cancellation Charges
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dateChange')}
          className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
            activeTab === 'dateChange'
              ? 'bg-[#0B1E3D] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Date Change Charges
        </button>
      </div>

      {/* Slabs Table */}
      <div className="overflow-hidden rounded-[20px] border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-transparent border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
              <th className="p-3">Time Frame</th>
              <th className="p-3">Airline Fee</th>
              <th className="p-3 text-right">RoutTripo Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(activeTab === 'cancellation' ? cancellationSlabs : dateChangeSlabs).map((slab, i) => (
              <tr key={i} className="hover:bg-transparent/80 transition-colors">
                <td className="p-3 font-bold text-slate-800">{slab.window}</td>
                <td className="p-3 font-black text-rose-600">
                  {slab.fee === 0 ? 'FREE / NIL' : `₹${slab.fee.toLocaleString('en-IN')}`}
                </td>
                <td className="p-3 font-black text-slate-700 text-right">
                  ₹{slab.platformFee ?? 300}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Advisory Note */}
      <div className="p-3 bg-premium-pink-soft/70 border border-premium-pink/80 rounded-[20px] flex items-start gap-2 text-xs text-premium-pink leading-relaxed">
        <AlertCircle className="w-4 h-4 text-premium-pink shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Important Policy Disclaimer: </span>
          <span>
            Changes/cancellations must be requested at least 4 hours prior to departure. Convenience & add-on fees are non-refundable per DGCA guidelines.
          </span>
        </div>
      </div>
    </div>
  );
};
