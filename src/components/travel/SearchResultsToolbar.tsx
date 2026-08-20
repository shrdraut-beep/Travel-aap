import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Check, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';

export interface SortOption {
  key: string;
  label: string;
}

export interface ToolbarToggle {
  key: string;
  label: string;
  active: boolean;
  onToggle: () => void;
}

interface SearchResultsToolbarProps {
  sortOptions: SortOption[];
  activeSort: string;
  onSortChange: (key: string) => void;
  toggles?: ToolbarToggle[];
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
  lang?: string;
}

export function SearchResultsToolbar({
  sortOptions, activeSort, onSortChange, toggles = [], viewMode, onViewModeChange, lang = 'en'
}: SearchResultsToolbarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMr = lang === 'mr';
  const activeSortLabel = sortOptions.find(o => o.key === activeSort)?.label || (isMr ? 'क्रमवारी' : 'Sort');

  const chipBase = 'shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider transition-all active:scale-95';

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar">
        <button
          onClick={() => setSheetOpen(true)}
          className={`${chipBase} bg-white border-slate-200 text-slate-700 hover:border-indigo-400`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {activeSortLabel}
        </button>

        {toggles.map(toggle => (
          <button
            key={toggle.key}
            onClick={toggle.onToggle}
            className={`${chipBase} ${
              toggle.active
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {toggle.label}
          </button>
        ))}

        {onViewModeChange && (
          <div className="shrink-0 ml-auto flex bg-slate-100 p-0.5 rounded-full">
            <button
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              className={`p-1.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              aria-label="Gallery view"
              className={`p-1.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSheetOpen(false)}
          >
            <motion.div
              className="bg-white rounded-t-3xl px-6 pb-6 pt-3"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg text-slate-900">{isMr ? 'क्रमवारी लावा' : 'Sort By'}</h3>
                <button onClick={() => setSheetOpen(false)} className="p-2 bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {sortOptions.map(option => (
                  <button
                    key={option.key}
                    onClick={() => {
                      onSortChange(option.key);
                      setSheetOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-black transition-all ${
                      option.key === activeSort
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-indigo-400'
                    }`}
                  >
                    {option.label}
                    {option.key === activeSort && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
