import React, { useState } from 'react';

export function PassengerDetailsForm({ traveller, index, onChange, onClear }: any) {
  return (
    <div className="bg-white p-4 rounded-[16px] border border-slate-200 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">{traveller.type} {index + 1}</h3>
        <button onClick={onClear} className="text-red-500 text-sm font-medium">Clear</button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="col-span-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Salutation</label>
          <select 
            className="w-full bg-transparent border border-slate-200 rounded-lg p-3 text-slate-800 outline-none"
            value={traveller.salutation} 
            onChange={e => onChange({ ...traveller, salutation: e.target.value })}
          >
            <option>Mr.</option><option>Ms.</option><option>Mrs.</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">First And Middle Name</label>
          <input 
            className="w-full bg-transparent border border-slate-200 rounded-lg p-3 text-slate-800 outline-none" 
            placeholder="Enter first name"
            value={traveller.firstName} 
            onChange={e => onChange({ ...traveller, firstName: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
          <input 
            className="w-full bg-transparent border border-slate-200 rounded-lg p-3 text-slate-800 outline-none"
            value={traveller.lastName} 
            onChange={e => onChange({ ...traveller, lastName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Nationality</label>
          <select className="w-full bg-transparent border border-slate-200 rounded-lg p-3 text-slate-800 outline-none">
            <option>India</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Date of Birth *</label>
        <input 
          type="date"
          className="w-full bg-transparent border border-slate-200 rounded-lg p-3 text-slate-800 outline-none"
          value={traveller.dob} 
          onChange={e => onChange({ ...traveller, dob: e.target.value })}
        />
      </div>
    </div>
  );
}