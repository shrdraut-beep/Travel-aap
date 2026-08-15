import React, { useState } from 'react';
import { Plane, Building2, Train, Bus, MapPin, Calculator, Save, CheckCircle2 } from 'lucide-react';

export const MarkupEngineView = () => {
  const [markups, setMarkups] = useState([
    { id: 'flights', label: 'Flights', icon: Plane, type: 'percentage', value: 5 },
    { id: 'hotels', label: 'Hotels', icon: Building2, type: 'percentage', value: 8 },
    { id: 'trains_ac', label: 'Trains (AC)', icon: Train, type: 'fixed', value: 40 },
    { id: 'trains_non_ac', label: 'Trains (Non-AC)', icon: Train, type: 'fixed', value: 20 },
    { id: 'bus', label: 'Bus', icon: Bus, type: 'fixed', value: 50 },
    { id: 'holidays', label: 'Holidays', icon: MapPin, type: 'percentage', value: 10 },
  ]);
  const [saved, setSaved] = useState(false);

  const handleUpdate = (id: string, field: 'type' | 'value', val: any) => {
    setMarkups(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));
    setSaved(false);
  };

  const handleSave = () => {
    // In a real app, save to Firestore here
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Markup & Service Charge Engine</h2>
          <p className="text-xs font-semibold text-slate-500">Configure global markups to automatically reflect in B2B searches and invoices.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-6">
        <div className="space-y-4">
          {markups.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.id} className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 w-full sm:w-1/3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 border border-slate-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-slate-800">{m.label}</span>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-2/3">
                  <select
                    value={m.type}
                    onChange={(e) => handleUpdate(m.id, 'type', e.target.value)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none flex-1"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Charge (₹)</option>
                  </select>
                  
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">
                      {m.type === 'percentage' ? '%' : '₹'}
                    </span>
                    <input
                      type="number"
                      value={m.value}
                      onChange={(e) => handleUpdate(m.id, 'value', Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          {saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          <span>{saved ? 'Settings Saved' : 'Save Markup Settings'}</span>
        </button>
      </div>
    </div>
  );
};
