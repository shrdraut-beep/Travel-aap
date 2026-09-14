import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, User, Check } from 'lucide-react';
import { SavedTravellersService, SavedTraveller } from '../../services/SavedTravellersService';

export interface SavedTravellersSelectorProps {
  onSelectTraveller: (traveller: SavedTraveller) => void;
  selectedName?: string;
  filterType?: 'Adult' | 'Child' | 'Infant';
}

export const SavedTravellersSelector: React.FC<SavedTravellersSelectorProps> = ({
  onSelectTraveller,
  selectedName,
  filterType
}) => {
  const [travellers, setTravellers] = useState<SavedTraveller[]>([]);

  useEffect(() => {
    const list = SavedTravellersService.getTravellers();
    if (filterType) {
      setTravellers(list.filter(t => t.type === filterType));
    } else {
      setTravellers(list);
    }
  }, [filterType]);

  if (travellers.length === 0) return null;

  return (
    <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
          <UserCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Quick Fill from Saved Travellers</span>
        </span>
        <span className="text-[10px] text-slate-400 font-semibold">1-Tap Autofill</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {travellers.map((traveller) => {
          const fullName = `${traveller.firstName} ${traveller.lastName}`.trim();
          const isSelected = selectedName?.toLowerCase().includes(traveller.firstName.toLowerCase()) && 
                             selectedName?.toLowerCase().includes(traveller.lastName.toLowerCase());

          return (
            <button
              key={traveller.id}
              type="button"
              onClick={() => onSelectTraveller(traveller)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700 border-slate-200/90 hover:border-sky-300'
              }`}
            >
              {isSelected ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <User className="w-3.5 h-3.5 opacity-60" />
              )}
              <span>{traveller.title}. {fullName}</span>
              {traveller.isSelf && (
                <span className={`text-[9px] font-black uppercase px-1 py-0.2 rounded ${
                  isSelected ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  Self
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
