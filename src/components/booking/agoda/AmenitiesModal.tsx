import React from 'react';
import { X, Check } from 'lucide-react';

export function AmenitiesModal({ visible, onClose, categories = [] }: any) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/50 sm:items-center sm:justify-center">
      <div className="w-full bg-white rounded-t-2xl sm:rounded-2xl sm:max-w-md h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 text-center flex-1">Amenities</h2>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-800" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><span className="text-amber-500">★</span> Popular</h3>
            <div className="flex items-center gap-2 py-1"><Check className="w-4 h-4 text-emerald-600" /><span className="text-slate-700">Free Wi-Fi</span></div>
            <div className="flex items-center gap-2 py-1"><Check className="w-4 h-4 text-emerald-600" /><span className="text-slate-700">Swimming Pool</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}