import React from 'react';
import { X } from 'lucide-react';

interface Props {
  visible: boolean;
  title: string;
  bodyText: string;
  onClose: () => void;
}

export default function LegalPolicyModal({ visible, title, bodyText, onClose }: Props) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-navy-900/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 h-[88%] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="w-6" />
          <h1 className="text-xl font-semibold text-navy-900 text-center flex-1">{title}</h1>
          <button onClick={onClose}><X size={22} className="text-navy-900" /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <p className="text-sm text-gray-800 leading-6">{bodyText}</p>
        </div>
      </div>
    </div>
  );
}
