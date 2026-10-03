import React, { useState } from 'react';
import { X, MapPin, Calendar, Users, DollarSign, Check, Car, Hotel, Package, ShieldCheck, Sparkles, Plus } from 'lucide-react';
import { BargainingTrip, BargainingCategory } from './types';

interface TripRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newTrip: Partial<BargainingTrip>) => void;
  existingTrip?: BargainingTrip | null;
}

export const TripRequirementModal: React.FC<TripRequirementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingTrip
}) => {
  const [origin, setOrigin] = useState(existingTrip?.origin || 'Mumbai');
  const [destination, setDestination] = useState(existingTrip?.destination || 'Goa');
  const [dates, setDates] = useState(existingTrip?.dates || '11/09/2026 - 14/09/2026');
  const [paxCount, setPaxCount] = useState<number>(existingTrip?.paxCount || 4);
  const [category, setCategory] = useState<BargainingCategory>(existingTrip?.category || 'Cab');
  const [targetBudget, setTargetBudget] = useState<number>(existingTrip?.targetBudget || 8500);
  const [notes, setNotes] = useState(existingTrip?.notes || '');
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([
    'Toll, Border & State Taxes Included',
    'Driver Night Allowance Included'
  ]);

  if (!isOpen) return null;

  const defaultOptions: Record<BargainingCategory, string[]> = {
    Cab: [
      'Toll, Border & State Taxes Included',
      'Driver Night Allowance Included',
      '24x7 Dual Zone AC Running',
      'Sightseeing Points Included',
      'Airport / Doorstep Pickup & Drop',
      'Roof Carrier / Large Boot for Luggage',
      'Bluetooth / Music System',
      'Clean & Sanitized Vehicle',
      'Zero Surcharge Guarantee'
    ],
    Hotel: [
      'Complimentary Buffet Breakfast',
      'Swimming Pool Access',
      'Gym & Spa Access',
      'Early Check-in / Late Checkout',
      'Balcony with Scenic View',
      'Free High-Speed WiFi & Parking',
      'Daily Room Service & Housekeeping',
      'Welcome Drink on Arrival',
      'King Size Bed',
      'Air Conditioning',
      'Zero Surcharge Guarantee'
    ],
    Package: [
      'Dedicated AC Chauffeur Vehicle',
      'Deluxe 3-Star or 4-Star Stay',
      'All Breakfast & Dinner Meals',
      'VIP Sightseeing & Guided Tour Entry',
      'All State Tolls & Parking Charges',
      'Airport / Railway Station Transfers',
      '24x7 Trip Manager Support',
      'No Hidden Charges',
      'Zero Surcharge Guarantee'
    ]
  };

  const toggleInclusion = (item: string) => {
    setSelectedInclusions(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tripPayload: Partial<BargainingTrip> = {
      title: `${destination} Custom ${category} Tour`,
      route: `${origin} → ${destination} · ${paxCount} travellers`,
      origin,
      destination,
      dates,
      paxCount,
      category,
      targetBudget: Number(targetBudget),
      aiBaselineBudget: Math.round(Number(targetBudget) * 1.08),
      lowestQuote: Math.round(Number(targetBudget) * 0.92),
      offersCount: 4,
      status: 'Bargaining',
      demands: selectedInclusions.map((name, index) => ({
        id: `dem-${index}`,
        name,
        required: true
      })),
      notes,
      auctionStartTime: Date.now(),
      auctionTotalSeconds: 15 * 60,
      bidWindowSeconds: 3 * 60,
      offlineUnlocked: false
    };
    onSubmit(tripPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <SubPageHeader
        title={existingTrip ? 'Edit Offer' : 'Make an Offer'}
        subtitle="Submit preferred budget & get private operator quotes"
        badge="3 of 3 Free Today"
        onClose={onClose}
      />

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 bg-white rounded-t-3xl -mt-6 relative z-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selector */}
          <div>
            <label className="text-[13px] font-bold text-slate-800 block mb-2.5">
              Select Service Vertical:
            </label>
            <div className="flex gap-2">
              {(['Cab', 'Hotel', 'Package'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setSelectedInclusions(defaultOptions[cat].slice(0, 3));
                  }}
                  className={`flex-1 py-3 rounded-2xl font-bold text-[13px] flex flex-col items-center justify-center gap-1.5 transition-all border ${
                    category === cat
                      ? 'bg-slate-800 border-slate-800 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'Cab' && <Car className="w-5 h-5" />}
                  {cat === 'Hotel' && <Hotel className="w-5 h-5" />}
                  {cat === 'Package' && <Package className="w-5 h-5" />}
                  <span>{cat === 'Cab' ? 'Cab & Taxi' : cat === 'Hotel' ? 'Hotel Stay' : 'Full Package'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Route Info */}
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                Origin City:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                Destination:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Goa"
                  className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                Start Date:
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none"
                >
                  <option>11/09/2026</option>
                  <option>12/09/2026</option>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                End Date:
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none"
                >
                  <option>14/09/2026</option>
                  <option>15/09/2026</option>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Travellers */}
          <div>
            <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
              Passenger Count:
            </label>
            <div className="flex items-center justify-between border border-slate-200 rounded-xl px-2 py-2 bg-white">
              <button type="button" onClick={() => setPaxCount(Math.max(1, paxCount - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100">
                <span className="text-lg font-bold">-</span>
              </button>
              <span className="font-bold text-[14px]">{paxCount} Pax</span>
              <button type="button" onClick={() => setPaxCount(paxCount + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100">
                <span className="text-lg font-bold">+</span>
              </button>
            </div>
          </div>
          
          {/* Preferred Vehicle */}
          {category === 'Cab' && (
            <div>
              <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                Preferred Vehicle:
              </label>
              <div className="relative">
                <select className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none">
                  <option>Maruti Ertiga / 7-Seater AC</option>
                  <option>Toyota Innova Crysta</option>
                  <option>Swift Dzire / Sedan</option>
                  <option>Tempo Traveller 13 Seater</option>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          )}
          
          {category === 'Hotel' && (
            <div>
              <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                Preferred Room Type:
              </label>
              <div className="relative">
                <select className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none">
                  <option>Deluxe AC Room</option>
                  <option>Premium Suite</option>
                  <option>Standard Non-AC</option>
                  <option>Villa / Resort</option>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          )}

          {category === 'Package' && (
            <div>
              <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                Package Tier:
              </label>
              <div className="relative">
                <select className="w-full px-4 py-3.5 text-[14px] font-semibold border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none">
                  <option>Standard (3-Star + Sedan)</option>
                  <option>Premium (4-Star + SUV)</option>
                  <option>Luxury (5-Star + Premium SUV)</option>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          )}

          {/* User Demand Inclusions */}
          <div>
            <label className="text-[13px] font-bold text-slate-800 block mb-2.5">
              Requested Inclusions Checklist:
            </label>
            <div className="flex flex-wrap gap-2">
              {defaultOptions[category].map(item => {
                const checked = selectedInclusions.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInclusion(item)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold transition-all border ${
                      checked
                        ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white'
                        : 'bg-slate-100 border-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {checked ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
              Special Notes / Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Need early morning pickup, clean large boot space..."
              className="w-full px-4 py-3 text-[13px] font-medium border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          {/* Target Budget */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-slate-800">
                Your Proposed Budget (₹):
              </label>
              <span className="text-[12px] text-slate-500 font-medium">
                All-Inclusive
              </span>
            </div>
            <div className="relative">
              <span className="text-slate-800 font-bold absolute left-4 top-3 text-[16px]">₹</span>
              <input
                type="number"
                required
                step="500"
                value={targetBudget}
                onChange={e => setTargetBudget(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 text-[16px] font-bold text-slate-900 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 pb-safe-bottom z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleSubmit}
          className="w-full h-14 rounded-2xl bg-slate-900 text-white text-[15px] font-bold hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>{existingTrip ? 'Update Offer' : 'Submit Your Offer'}</span>
        </button>
      </div>
    </div>
  );
};
