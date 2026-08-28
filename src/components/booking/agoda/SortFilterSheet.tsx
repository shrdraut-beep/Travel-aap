import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

export function SortFilterSheet({ visible, mode, onClose, onApply, priceRange = { min: 0, max: 50000 } }: any) {
  const [tab, setTab] = useState<'sort' | 'filter'>(mode === 'hotel' ? 'sort' : 'filter');
  const [sort, setSort] = useState('best_match');
  
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/50 sm:items-center sm:justify-center">
      <div className="w-full bg-white rounded-t-2xl sm:rounded-2xl sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl">
        <div className="bg-indigo-600 text-white flex items-center justify-between p-4 rounded-t-2xl sm:rounded-t-2xl">
          <h2 className="font-bold flex-1 text-center">{mode === 'hotel' ? 'Sort by' : 'Sort & Filters'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
           {/* Implementation matches the PDF roughly */}
           <div className="space-y-4">
              <div onClick={() => setSort('best_match')} className="flex justify-between items-center py-3 border-b border-slate-100 cursor-pointer">
                <span className={sort === 'best_match' ? 'font-bold text-indigo-600' : 'text-slate-700'}>Best match</span>
                {sort === 'best_match' && <CheckCircle className="w-5 h-5 text-amber-500" />}
              </div>
              <div onClick={() => setSort('lowest_price')} className="flex justify-between items-center py-3 border-b border-slate-100 cursor-pointer">
                <span className={sort === 'lowest_price' ? 'font-bold text-indigo-600' : 'text-slate-700'}>Lowest price</span>
                {sort === 'lowest_price' && <CheckCircle className="w-5 h-5 text-amber-500" />}
              </div>
           </div>
        </div>
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <button className="font-bold text-slate-500">Clear all</button>
          <button onClick={() => { onApply({ sort }); onClose(); }} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-full">Apply Filters</button>
        </div>
      </div>
    </div>
  );
}