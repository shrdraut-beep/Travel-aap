import React from 'react';
import { MessageCircle } from 'lucide-react';

export function PropertyInfoSection({ propertyId, languages = ['English', 'Hindi'], policyPreview = 'Outside food is not allowed in the property.', announcementPreview = 'Please note that any changes in tax structure...' }: any) {
  return (
    <div className="px-4 py-6 space-y-4">
      <div className="text-xs text-slate-500">{propertyId}</div>
      <div>
        <h3 className="font-bold text-slate-800 mb-2">Languages spoken</h3>
        <div className="flex gap-4">
          {languages.map((l: string) => <span key={l} className="text-slate-700">{l}</span>)}
        </div>
      </div>
      <hr className="border-slate-200" />
      <div>
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-slate-800">Property policies</h3>
          <button className="text-amber-600 font-medium text-sm">See all</button>
        </div>
        <p className="text-slate-500 text-sm line-clamp-2">{policyPreview}</p>
      </div>
      <hr className="border-slate-200" />
      <div className="bg-amber-50 p-4 rounded-xl flex items-center justify-between mt-4">
        <span className="font-medium text-slate-800 flex-1">Have a question for this property?</span>
        <button className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg"><MessageCircle className="w-5 h-5" /></button>
      </div>
    </div>
  );
}