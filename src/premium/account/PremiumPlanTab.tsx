import React, { useState } from "react";
import { Calendar, Clock, MapPin, Navigation, ListTodo, Calculator, CheckSquare, Plane, Map, CloudSun, Briefcase, CalendarDays, Compass, Zap, Search, Check, ClipboardList } from "lucide-react";
import { ListRow, SectionHeader, PillButton } from "./ui";

import { VisualRouteTimeline } from '../../components/planning/VisualRouteTimeline';
import { GroupDecisionPolls } from '../../components/planning/GroupDecisionPolls';
import { GroupSplitCalculator } from '../../components/planning/GroupSplitCalculator';
import { LowFareCalendarWidget } from '../../components/planning/LowFareCalendarWidget';
import { LiveFlightTrackerWidget } from '../../components/planning/LiveFlightTrackerWidget';
import { MultiOriginSyncWidget } from '../../components/planning/MultiOriginSyncWidget';
import { SmartAiPromptPresets } from '../../components/planning/SmartAiPromptPresets';
import { SmartDayPlanner } from '../../components/planning/SmartDayPlanner';
import { CalendarView } from '../../components/views/CalendarView';
import { HARDCODED_PACKING_CATEGORIES } from '../../utils/packingData';
import { useLanguage } from '../../context/LanguageContext';

export const PremiumPlanTab = ({ trip }: any) => {
  const [activeWidget, setActiveWidget] = useState('itinerary');
  const [scheduleMode, setScheduleMode] = useState<'list'|'calendar'>('list');
  const [packingSearch, setPackingSearch] = useState('');
  
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  const [packingCategories, setPackingCategories] = useState(
    trip?.detailedPackingList || HARDCODED_PACKING_CATEGORIES(lang)
  );

  const handleToggleItem = (catId: string, itemId: string) => {
    const updated = packingCategories.map((c: any) => {
      if (c.id === catId) {
        return {
          ...c,
          items: c.items.map((i: any) => i.id === itemId ? { ...i, isChecked: !i.isChecked } : i)
        };
      }
      return c;
    });
    setPackingCategories(updated);
  };

  const filteredCategories = packingCategories.map((c: any) => ({
    ...c,
    items: c.items.filter((i: any) => i.name.toLowerCase().includes(packingSearch.toLowerCase()))
  })).filter((c: any) => c.items.length > 0);

  const tools = [
    { id: 'itinerary', label: 'Itinerary', imgSrc: '/icons/itinerary.png' },
    { id: 'packing', label: 'Packing List', imgSrc: '/icons/packing_list.png' },
    { id: 'presets', label: 'AI Manager', imgSrc: '/icons/ai_manager.png' },
    { id: 'split', label: 'Split Cost', imgSrc: '/icons/split_cost.png' },
    { id: 'polls', label: 'Group Polls', imgSrc: '/icons/group_polls.png' },
    { id: 'tracker', label: 'Live Tracker', imgSrc: '/icons/live_tracker.png' },
    { id: 'lowfare', label: 'Low Fare', imgSrc: '/icons/low_fare.png' },
    { id: 'multicity', label: 'Fly Together', imgSrc: '/icons/fly_together.png' },
  ];

  return (
    <div className="p-2 pb-24 space-y-1.5">
      {/* Smart Tools Grid */}
      <div className="space-y-0.5">
        <SectionHeader title="Smart Tools" />
        <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar">
           {tools.map(tool => (
             <button
               key={tool.id}
               type="button"
               onClick={() => setActiveWidget(tool.id)}
               className={`flex flex-col items-center justify-center gap-1.5 py-2 px-3 transition-all min-w-[68px] cursor-pointer group ${
                 activeWidget === tool.id
                   ? "scale-105"
                   : "opacity-80 hover:opacity-100"
               }`}
             >
                <img src={tool.imgSrc} alt={tool.label} className="h-9 w-9 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                <span className={`text-[11px] font-bold leading-none tracking-tight whitespace-nowrap ${
                  activeWidget === tool.id ? "text-sky-700 font-extrabold" : "text-slate-600"
                }`}>{tool.label}</span>
                {activeWidget === tool.id && (
                  <span className="h-1 w-5 rounded-full bg-sky-500 mt-0.5" />
                )}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-1">
        {activeWidget === 'itinerary' && (
          <>
            <div className="flex items-center justify-between">
              <SectionHeader title="Itinerary" />
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setScheduleMode('list')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${scheduleMode === 'list' ? 'bg-white text-[var(--premium-violet)] shadow-sm' : 'text-slate-500'}`}>{isMr ? 'लिस्ट' : 'List'}</button>
                <button onClick={() => setScheduleMode('calendar')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${scheduleMode === 'calendar' ? 'bg-white text-[var(--premium-violet)] shadow-sm' : 'text-slate-500'}`}>{isMr ? 'कॅलेंडर' : 'Calendar'}</button>
              </div>
            </div>
            
            {scheduleMode === 'list' ? (
              <SmartDayPlanner
                tripId={trip?.id || 'temp'}
                hideHeader={true}
              />
            ) : (
              <CalendarView 
                trip={trip} 
                itinerary={trip?.itinerary || []} 
                lang={lang} 
                currencySymbol="₹" 
              />
            )}
          </>
        )}
        
        {activeWidget === 'packing' && (
           <div className="premium-card p-4 bg-white shadow-sm border border-slate-100 rounded-3xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[var(--premium-sky-soft)] rounded-[16px] flex items-center justify-center text-[var(--premium-sky-deep)]">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">{isMr ? 'पॅकिंग लिस्ट' : 'Pre-Trip Packing List'}</h3>
                  <p className="text-[10px] font-bold text-[var(--premium-muted)]">Don't forget anything</p>
                </div>
              </div>
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  value={packingSearch} 
                  onChange={e => setPackingSearch(e.target.value)} 
                  placeholder={isMr ? "शोधा..." : "Search packing items..."}
                  className="w-full bg-transparent border border-slate-200 rounded-[16px] pl-9 pr-3 py-2 text-xs font-extrabold text-slate-900 placeholder-[var(--premium-muted)] focus:outline-none focus:border-[var(--premium-violet)]"
                />
              </div>
              <div className="space-y-0.5">
                {filteredCategories.map((cat: any) => (
                  <div key={cat.id}>
                    <h5 className="text-[10px] font-black uppercase text-[var(--premium-muted)] tracking-widest mb-2">{cat.name} ({cat.items.length})</h5>
                    <div className="space-y-1">
                      {cat.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleItem(cat.id, item.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${item.isChecked ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-300 bg-white'}`}
                          >
                            {item.isChecked && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <span className={`text-xs font-semibold ${item.isChecked ? 'text-[var(--premium-muted)] line-through' : 'text-slate-700'}`}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}

        {activeWidget === 'split' && (
           <GroupSplitCalculator trip={trip || {}} onShowToast={() => {}} />
        )}

        {activeWidget === 'polls' && (
           <GroupDecisionPolls trip={trip || {}} onUpdateTrip={() => {}} />
        )}

        {activeWidget === 'tracker' && (
           <LiveFlightTrackerWidget source={trip?.source || 'BOM'} destination={trip?.destination || 'GOI'} />
        )}

        {activeWidget === 'lowfare' && (
           <LowFareCalendarWidget origin={trip?.source || 'BOM'} destination={trip?.destination || 'GOI'} />
        )}

        {activeWidget === 'multicity' && (
           <MultiOriginSyncWidget trip={trip || {}} destination={trip?.destination || 'GOI'} />
        )}

        {activeWidget === 'presets' && (
           <SmartAiPromptPresets trip={trip || {}} onOpenAiPlanner={() => {}} onApplyPreset={() => {}} />
        )}
      </div>
    </div>
  );
};
