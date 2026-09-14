import React from 'react';
import { X } from 'lucide-react';

export function LegalPolicyModal({ visible, title, bodyText, onClose }: any) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/50 sm:items-center sm:justify-center">
      <div className="w-full bg-white rounded-t-2xl sm:rounded-[20px] sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 text-center flex-1">{title}</h2>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-800" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{bodyText}</div>
        </div>
      </div>
    </div>
  );
}