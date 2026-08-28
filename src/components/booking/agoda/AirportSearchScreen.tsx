import React, { useState } from 'react';
import { X, Plane } from 'lucide-react';

export function AirportSearchScreen({ originLabel, results = [], onSelect, onClose }: any) {
  const [query, setQuery] = useState('');
  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col">
      <div className="p-4 space-y-4 pt-safe">
        <h1 className="text-2xl font-bold text-slate-800">Search cities or airport</h1>
        <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl">
          <span className="text-slate-600 font-medium">{originLabel}</span>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="flex items-center border-2 border-amber-500 rounded-xl px-3 bg-white">
          <input 
            autoFocus 
            className="flex-1 py-3 outline-none text-slate-800 font-medium bg-transparent" 
            placeholder="Where to?" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
          />
          {query && <button onClick={() => setQuery('')}><X className="w-4 h-4 text-slate-400" /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {results.map((r: any) => (
          <div key={r.code} onClick={() => onSelect(r)} className="flex items-start gap-3 p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50">
            <Plane className="w-5 h-5 text-amber-500 mt-0.5 transform rotate-45" />
            <div className="flex-1">
              <div className="font-bold text-slate-800">{r.city}, {r.country}</div>
              <div className="text-xs text-slate-500 mt-1">{r.airportName}</div>
            </div>
            <div className="font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs">{r.code}</div>
          </div>
        ))}
      </div>
    </div>
  );
}