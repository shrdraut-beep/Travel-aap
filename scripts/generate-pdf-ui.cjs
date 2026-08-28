const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/components/booking/agoda');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const files = {
  'GuestDetailsSheet.tsx': `import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';

export interface GuestCounts {
  rooms: number;
  adults: number;
  children: number;
}

interface Props {
  visible: boolean;
  initialValue?: GuestCounts;
  onClose: () => void;
  onConfirm: (value: GuestCounts) => void;
}

const Stepper = ({ label, sublabel, value, min, onChange }: any) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex-1 pr-4">
      <div className="font-bold text-slate-800 text-lg">{label}</div>
      {sublabel && <div className="text-xs text-slate-500 mt-1 max-w-[220px]">{sublabel}</div>}
    </div>
    <div className="flex items-center gap-3">
      <button 
        className="w-9 h-9 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600 disabled:border-slate-300 disabled:text-slate-300 active:scale-95 transition-transform"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-6 text-center font-bold text-xl text-slate-800">{value}</div>
      <button 
        className="w-9 h-9 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600 active:scale-95 transition-transform"
        onClick={() => onChange(value + 1)}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export function GuestDetailsSheet({ visible, initialValue = { rooms: 1, adults: 2, children: 0 }, onClose, onConfirm }: Props) {
  const [guests, setGuests] = useState<GuestCounts>(initialValue);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/50 sm:items-center sm:justify-center">
      <div className="w-full bg-white rounded-t-2xl sm:rounded-2xl sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex-1 text-center">Guest details</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          <Stepper label="Rooms" sublabel="Select 1 room for 1-4 guests, or split across multiple rooms" value={guests.rooms} min={1} onChange={(v: number) => setGuests(g => ({ ...g, rooms: Math.max(1, v) }))} />
          <Stepper label="Adults" value={guests.adults} min={1} onChange={(v: number) => setGuests(g => ({ ...g, adults: Math.max(1, v) }))} />
          <Stepper label="Children" value={guests.children} min={0} onChange={(v: number) => setGuests(g => ({ ...g, children: Math.max(0, v) }))} />
        </div>
        <div className="p-4 border-t border-slate-200">
          <button onClick={() => { onConfirm(guests); onClose(); }} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-full hover:bg-indigo-700 active:scale-[0.98] transition-transform">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}`,
  'SortFilterSheet.tsx': `import React, { useState } from 'react';
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
}`,
  'AmenitiesModal.tsx': `import React from 'react';
import { X, Check } from 'lucide-react';

export function AmenitiesModal({ visible, onClose, categories = [] }: any) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/50 sm:items-center sm:justify-center">
      <div className="w-full bg-white rounded-t-2xl sm:rounded-2xl sm:max-w-md h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 text-center flex-1">Amenities</h2>
          <button onClick={onClose}><X className="w-6 h-6 text-slate-800" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><span className="text-amber-500">★</span> Popular</h3>
            <div className="flex items-center gap-2 py-1"><Check className="w-4 h-4 text-emerald-600" /><span className="text-slate-700">Free Wi-Fi</span></div>
            <div className="flex items-center gap-2 py-1"><Check className="w-4 h-4 text-emerald-600" /><span className="text-slate-700">Swimming Pool</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  'PropertyInfoSection.tsx': `import React from 'react';
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
}`,
  'RoomSelectionCard.tsx': `import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export function RoomSelectionCard({ features = [], expiresInSeconds = 1200, limitedAvailability = true }: any) {
  const [rem, setRem] = useState(expiresInSeconds);
  useEffect(() => {
    const t = setInterval(() => setRem((r: number) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const m = Math.floor(rem / 60).toString().padStart(2, '0');
  const s = Math.floor(rem % 60).toString().padStart(2, '0');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
        <span className="text-xs font-medium text-slate-600">Current price may change in..</span>
        <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
          <Clock className="w-3 h-3" /> {m}:{s}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {features.map((f: any) => (
          <div key={f.label} className="w-[45%] flex items-center gap-1 text-xs text-slate-700">
            <span className="text-emerald-600">✓</span> {f.label}
          </div>
        ))}
      </div>
      {limitedAvailability && (
        <div className="flex items-center gap-2 bg-amber-50 text-amber-800 p-2 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4" /> We have limited availability at this price - book now!
        </div>
      )}
    </div>
  );
}`,
  'LegalPolicyModal.tsx': `import React from 'react';
import { X } from 'lucide-react';

export function LegalPolicyModal({ visible, title, bodyText, onClose }: any) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/50 sm:items-center sm:justify-center">
      <div className="w-full bg-white rounded-t-2xl sm:rounded-2xl sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl">
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
}`,
  'AirportSearchScreen.tsx': `import React, { useState } from 'react';
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
}`,
  'PassengerDetailsForm.tsx': `import React, { useState } from 'react';

export function PassengerDetailsForm({ traveller, index, onChange, onClear }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">{traveller.type} {index + 1}</h3>
        <button onClick={onClear} className="text-red-500 text-sm font-medium">Clear</button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="col-span-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Salutation</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 outline-none"
            value={traveller.salutation} 
            onChange={e => onChange({ ...traveller, salutation: e.target.value })}
          >
            <option>Mr.</option><option>Ms.</option><option>Mrs.</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">First And Middle Name</label>
          <input 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 outline-none" 
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
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 outline-none"
            value={traveller.lastName} 
            onChange={e => onChange({ ...traveller, lastName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Nationality</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 outline-none">
            <option>India</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Date of Birth *</label>
        <input 
          type="date"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 outline-none"
          value={traveller.dob} 
          onChange={e => onChange({ ...traveller, dob: e.target.value })}
        />
      </div>
    </div>
  );
}`,
  'BillingDetailsSection.tsx': `import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function BillingDetailsSection({ phone, email, gstNumber, onChangePhone, onChangeEmail, onChangeGst }: any) {
  const [hasGst, setHasGst] = useState(!!gstNumber);
  
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">Billing Details</h3>
      <label className="block text-xs font-medium text-slate-500 mb-1">Enter Phone Number</label>
      <div className="flex gap-2 mb-4">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-3">
          <span>🇮🇳</span>
          <span className="font-medium text-slate-800">+91</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>
        <input 
          type="tel"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none"
          value={phone}
          onChange={e => onChangePhone(e.target.value)}
        />
      </div>
      <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
      <input 
        type="email"
        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none mb-4"
        value={email}
        onChange={e => onChangeEmail(e.target.value)}
      />
      <label className="flex items-center gap-3 cursor-pointer">
        <div className={\`w-5 h-5 rounded border flex items-center justify-center \${hasGst ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}\`}>
           <input type="checkbox" className="hidden" checked={hasGst} onChange={e => setHasGst(e.target.checked)} />
           {hasGst && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className="text-sm text-slate-700 font-medium">I have a GST number (Optional)</span>
      </label>
      {hasGst && (
        <input 
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none mt-3 uppercase"
          placeholder="Enter GSTIN"
          value={gstNumber}
          onChange={e => onChangeGst(e.target.value)}
        />
      )}
    </div>
  );
}`,
  'FareBreakupCard.tsx': `import React from 'react';

export function FareBreakupCard({ baseFare = 0, taxesAndFees = 0, convenienceFee = 0, convenienceFeeWaived = false, total = 0 }: any) {
  const formatINR = (n: number) => \`₹\${n.toLocaleString('en-IN')}\`;
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h3 className="font-bold text-slate-800 mb-4">Fare breakup</h3>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Base Fare</span>
          <span className="text-sm font-medium text-slate-800">{formatINR(baseFare)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Taxes & Fees</span>
          <span className="text-sm font-medium text-slate-800">{formatINR(taxesAndFees)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={\`text-sm \${convenienceFeeWaived ? 'text-slate-400 line-through' : 'text-slate-600'}\`}>Convenience Fee</span>
          <span className={\`text-sm \${convenienceFeeWaived ? 'text-slate-400 line-through' : 'font-medium text-slate-800'}\`}>{formatINR(convenienceFee)}</span>
        </div>
        {convenienceFeeWaived && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-emerald-600">Convenience fee off</span>
            <span className="text-sm font-medium text-emerald-600">₹0</span>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 italic mb-4">Convenience Fee is non-refundable</p>
      <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
        <span className="font-bold text-slate-800 text-lg">Total</span>
        <span className="font-black text-amber-600 text-xl">{formatINR(total)}</span>
      </div>
    </div>
  );
}`,
  'TravelProtectionCard.tsx': `import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function TravelProtectionCard({ price = 299, gstPercent = 18, selected = false, onSelect }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
      <h3 className="font-bold text-slate-800 mb-1">Travel Insurance</h3>
      <p className="text-sm text-slate-500 mb-4">₹{price}/Total ({gstPercent}% GST included)</p>
      
      <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg mb-3 cursor-pointer hover:bg-slate-50">
        <input type="radio" name="insurance" checked={selected} onChange={() => onSelect(true)} className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-600 border-slate-300" />
        <div>
          <div className="font-medium text-slate-800 text-sm">Yes, Secure my trip for ₹{price}</div>
        </div>
      </label>
      
      <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
        <input type="radio" name="insurance" checked={!selected} onChange={() => onSelect(false)} className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-600 border-slate-300" />
        <div>
          <div className="font-medium text-slate-800 text-sm">No, I will book without trip secure</div>
        </div>
      </label>
      
      <p className="text-xs text-slate-500 mt-4 leading-relaxed">
        Trip Secure is non-refundable. By selecting, I confirm all travellers are Indian nationals, aged 6 months to 90 years, and accept the T&Cs.
      </p>
    </div>
  );
}

export function CfarCard({ price = 499, refundCapTotal = 5000, refundCapPerPax = 2500, selected = false, onToggle }: any) {
  return (
    <div onClick={onToggle} className={\`p-4 rounded-xl border-2 cursor-pointer transition-colors \${selected ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 bg-white'}\`}>
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-slate-800 flex-1">Cancel For Any Reason (CFAR)</h3>
        <span className="font-bold text-amber-600">₹{price}</span>
      </div>
      <p className="text-sm text-slate-600 mb-3">Get refunded for airline cancellation charges if you cancel your flight for any reason.</p>
      <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
        <li>Cancellation refund upto ₹{refundCapTotal.toLocaleString('en-IN')} (₹{refundCapPerPax.toLocaleString('en-IN')} per passenger)</li>
      </ul>
    </div>
  );
}`,
  'PaymentStatusScreen.tsx': `import React from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export function PaymentStatusScreen({ status, origin, destination, travellerCount, tripType, travelClass, bookingRef, onPrimaryAction }: any) {
  const isSuccess = status === 'success';
  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col justify-between p-6 pt-20">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={\`w-28 h-28 rounded-full border-4 flex items-center justify-center mb-8 \${isSuccess ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'}\`}>
          {isSuccess ? <CheckCircle2 className="w-16 h-16 text-emerald-500" /> : <XCircle className="w-16 h-16 text-red-500" />}
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-8">{isSuccess ? 'Booking Confirmed' : 'Payment Failed'}</h1>
        
        <div className="flex items-center justify-center gap-4 text-slate-800 mb-2">
          <span className="font-bold text-lg">{origin}</span>
          <ArrowRight className="w-5 h-5 text-slate-400" />
          <span className="font-bold text-lg">{destination}</span>
        </div>
        
        <p className="text-slate-500 text-sm mb-6 text-center">
          {travellerCount} Traveller{travellerCount > 1 ? 's' : ''} • {tripType} • {travelClass}
        </p>
        
        {bookingRef && <div className="font-mono font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-lg tracking-wider">Booking Ref: {bookingRef}</div>}
      </div>
      
      <button onClick={onPrimaryAction} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-full text-lg shadow-lg shadow-indigo-200 active:scale-[0.98] transition-transform">
        {isSuccess ? 'View Booking' : 'Try Again'}
      </button>
    </div>
  );
}`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dir, filename), content);
}
console.log('Successfully generated 12 PDF UI components inside src/components/booking/agoda');
