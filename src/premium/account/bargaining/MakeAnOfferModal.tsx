import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Users,
  Shield,
  ShieldCheck,
  Sparkles,
  Check,
  TrendingDown,
  Info,
  Car,
  Hotel,
  Package,
  ArrowRight,
  Clock,
  Award
} from 'lucide-react';
import { BargainingRequest, VendorBid } from './BargainingTypes';

interface MakeAnOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newRequest: BargainingRequest, initialBids: VendorBid[]) => void;
  initialCategory?: 'Cabs' | 'Hotels' | 'Packages';
  initialOrigin?: string;
  initialDestination?: string;
}

export const MakeAnOfferModal: React.FC<MakeAnOfferModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCategory = 'Cabs',
  initialOrigin = 'Mumbai',
  initialDestination = 'Goa'
}) => {
  const [category, setCategory] = useState<'Cabs' | 'Hotels' | 'Packages'>(initialCategory);
  const [origin, setOrigin] = useState<string>(initialOrigin);
  const [destination, setDestination] = useState<string>(initialDestination);
  const [startDate, setStartDate] = useState<string>('2026-10-12');
  const [endDate, setEndDate] = useState<string>('2026-10-15');
  const [paxCount, setPaxCount] = useState<number>(4);
  const [vehicleType, setVehicleType] = useState<string>('Premium SUV (Innova Crysta)');
  const [targetBudget, setTargetBudget] = useState<number>(12000);
  const [notes, setNotes] = useState<string>('');

  // Selected Inclusions
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([
    'All Tolls, Parking & State Taxes Included',
    'Doorstep Pickup & Drop Included',
    'Driver Batta & Food Allowance Included',
    'Sanitized Dual-Zone AC Vehicle'
  ]);

  if (!isOpen) return null;

  // Category specific preset configurations
  const categoryPresets = {
    Cabs: {
      label: 'Cab & Taxi',
      vehicleOptions: [
        'Sedan (Dzire / Etios)',
        'Prime Sedan (Ciaz / City)',
        'Premium SUV (Innova Crysta)',
        'Tempo Traveller (12-Seater Luxury)',
        'Luxury Coach (18-Seater Mini Bus)'
      ],
      defaultBudget: 12000,
      baselineMultiplier: 1.25,
      inclusions: [
        'All Tolls, Parking & State Taxes Included',
        'Doorstep Pickup & Drop Included',
        'Driver Batta & Food Allowance Included',
        'Sanitized Dual-Zone AC Vehicle',
        'Zero Cancellation Penalty',
        'Roof Carrier for Extra Luggage'
      ]
    },
    Hotels: {
      label: 'Hotel Stay',
      vehicleOptions: [
        'Standard AC Deluxe Room',
        'Executive King Room with Balcony',
        'Private 3BHK Pool Villa',
        'Luxury Heritage Suite',
        'Dal Lake Luxury Houseboat'
      ],
      defaultBudget: 9500,
      baselineMultiplier: 1.35,
      inclusions: [
        'Complimentary Buffet Breakfast Included',
        'Swimming Pool & Club Access',
        'Early Check-in / Late Checkout',
        'Free High-Speed Wi-Fi & Parking',
        'Welcome Drinks on Arrival',
        '100% Escrow Money-Back Guarantee'
      ]
    },
    Packages: {
      label: 'Full Package',
      vehicleOptions: [
        'Standard 3N/4D Sightseeing Tour',
        'All-Inclusive 4N/5D Holiday Package',
        'Luxury Honeymoon Private Retreat',
        'Adventure Road Trip & Camping Circuit',
        'Custom Family Heritage Expedition'
      ],
      defaultBudget: 28000,
      baselineMultiplier: 1.3,
      inclusions: [
        'Dedicated Private Chauffeur Vehicle',
        '4-Star Resort Stays with Breakfast & Dinner',
        'VIP Sightseeing & Monument Entry Passes',
        'All Inter-State Border Permits & Tolls',
        '24x7 Dedicated Local Tour Manager',
        'Complete Escrow Protection'
      ]
    }
  };

  const currentPreset = categoryPresets[category];
  const marketBaseline = Math.round(targetBudget * currentPreset.baselineMultiplier);
  const potentialSavings = marketBaseline - targetBudget;
  const savingsPercent = Math.round((potentialSavings / marketBaseline) * 100);

  const toggleInclusion = (inc: string) => {
    setSelectedInclusions((prev) =>
      prev.includes(inc) ? prev.filter((i) => i !== inc) : [...prev, inc]
    );
  };

  const handleCategoryChange = (newCat: 'Cabs' | 'Hotels' | 'Packages') => {
    setCategory(newCat);
    setVehicleType(categoryPresets[newCat].vehicleOptions[2] || categoryPresets[newCat].vehicleOptions[0]);
    setTargetBudget(categoryPresets[newCat].defaultBudget);
    setSelectedInclusions(categoryPresets[newCat].inclusions.slice(0, 4));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRequest: BargainingRequest = {
      id: reqId,
      title: `${destination} ${currentPreset.label} (${vehicleType.split('(')[0].trim()})`,
      route: `${origin} → ${destination} · ${paxCount} Pax`,
      category,
      startDate,
      endDate,
      paxCount,
      targetBudget,
      aiBaselineBudget: marketBaseline,
      lowestQuote: Math.round(targetBudget * 1.05),
      offersCount: 3,
      status: 'Bargaining',
      createdAt: 'Just now',
      expirySeconds: 900, // 15 mins
      isThreeMinWindow: true,
      userDemands: selectedInclusions
    };

    // Auto-generate 3 realistic verified local operator bids
    const sampleBids: VendorBid[] = [
      {
        id: `bid-${reqId}-1`,
        requestId: reqId,
        vendorId: 'vend-101',
        maskedName: 'Verified Partner #501',
        realName: `${destination} Elite Travels & Chauffeurs`,
        legalName: `${destination} Fleet Services Pvt Ltd`,
        city: destination,
        directPhone: '+91 98220 12345',
        rating: 4.9,
        basePrice: targetBudget + 600,
        taxes: 300,
        totalPrice: targetBudget + 900,
        aiDealScore: 'great',
        dealScoreLabel: 'Best Rated Partner · High Reliability',
        inclusions: selectedInclusions,
        exclusions: ['Driver Personal Gratuity / Tips'],
        inventory: {
          category,
          photos: ['/images/bargaining/goa-resort.png', '/images/bargaining/luxury-room.png'],
          vehicleSpecs: vehicleType,
          amenities: selectedInclusions,
          rating: 4.9,
          reviewCount: 420
        },
        status: 'active'
      },
      {
        id: `bid-${reqId}-2`,
        requestId: reqId,
        vendorId: 'vend-102',
        maskedName: 'Verified Partner #402',
        realName: 'Ganesh Express Logistics & Stays',
        legalName: 'Ganesh Tours & Fleet Services LLP',
        city: origin,
        directPhone: '+91 97654 67890',
        rating: 4.85,
        basePrice: targetBudget + 200,
        taxes: 350,
        totalPrice: targetBudget + 550,
        aiDealScore: 'great',
        dealScoreLabel: 'Lowest Quote · 100% Inclusions Matched',
        inclusions: selectedInclusions,
        exclusions: [],
        inventory: {
          category,
          photos: ['/images/bargaining/group-travel.png'],
          vehicleSpecs: vehicleType,
          amenities: selectedInclusions,
          rating: 4.85,
          reviewCount: 310
        },
        status: 'active'
      },
      {
        id: `bid-${reqId}-3`,
        requestId: reqId,
        vendorId: 'vend-103',
        maskedName: 'Verified Partner #308',
        realName: 'Konkan Royal Heritage Services',
        legalName: 'Royal Konkan Holidays & Stays Pvt Ltd',
        city: destination,
        directPhone: '+91 94220 99887',
        rating: 4.78,
        basePrice: targetBudget + 1100,
        taxes: 400,
        totalPrice: targetBudget + 1500,
        aiDealScore: 'fair',
        dealScoreLabel: 'Premium Fleet · Refreshments Included',
        inclusions: [...selectedInclusions, 'Chilled Mineral Water & Snacks'],
        exclusions: [],
        inventory: {
          category,
          photos: ['/images/bargaining/manali-valley.png'],
          vehicleSpecs: vehicleType,
          amenities: selectedInclusions,
          rating: 4.78,
          reviewCount: 180
        },
        status: 'active'
      }
    ];

    onSubmit(newRequest, sampleBids);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-[440px] my-auto bg-[#FAF8F5] rounded-3xl shadow-2xl border border-sky-400/30 overflow-hidden flex flex-col max-h-[92vh]">
        {/* =========================================================================
            TOP HEADER (Exact Google Stitch Layout)
            ========================================================================= */}
        <header className="bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-[#e0f7fa] px-5 pt-4 pb-4 border-b border-sky-200/80 rounded-b-[24px] shadow-[0_4px_20px_rgba(2,132,199,0.08)] relative shrink-0">
          {/* Top Brand Bar & Circular Close Button */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-sky-100 border border-sky-300 text-sky-800 font-black text-sm shadow-xs">
                R
              </span>
              <div>
                <span className="text-[11px] font-black tracking-wider uppercase text-sky-900 block leading-tight">
                  ROUTTRIPO BARGAIN
                </span>
                <span className="text-[10px] text-sky-700/80 font-medium leading-tight">
                  Direct Verified Travel Deals
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 border border-sky-200/80 shadow-xs flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Free Tier Badge */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="min-w-0">
              <h1 className="text-lg font-black tracking-tight text-[#0F172A] leading-tight">
                Make an Offer
              </h1>
              <p className="text-[11.5px] text-[#0369a1] font-medium leading-tight mt-0.5 truncate">
                Submit your target budget & operators will compete live
              </p>
            </div>
            <span className="bg-sky-100/90 text-sky-800 font-extrabold px-2.5 py-1 rounded-full text-[10px] tracking-wide uppercase shrink-0 shadow-xs border border-sky-300/60 whitespace-nowrap">
              2 of 3 FREE
            </span>
          </div>
        </header>

        {/* =========================================================================
            FORM BODY (Scrollable Sheet)
            ========================================================================= */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#FAF8F5]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Service Vertical Selector */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  Select Service Vertical
                </label>
                <span className="text-[11px] font-bold text-[#0EA5E9] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                  Instant Matching
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Cab & Taxi */}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('Cabs')}
                  className={`relative flex flex-col items-center justify-center rounded-2xl py-3 px-1.5 transition-all cursor-pointer ${
                    category === 'Cabs'
                      ? 'bg-white border-2 border-[#0EA5E9] shadow-md ring-3 ring-sky-100'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {category === 'Cabs' && (
                    <span className="absolute -top-1.5 right-2 w-3.5 h-3.5 bg-[#0EA5E9] rounded-full border-2 border-white flex items-center justify-center shadow-xs">
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                    </span>
                  )}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 ${
                      category === 'Cabs' ? 'bg-sky-50 text-[#0EA5E9]' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Car className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-bold tracking-tight text-center leading-tight ${
                      category === 'Cabs' ? 'text-[#0EA5E9]' : 'text-slate-700'
                    }`}
                  >
                    Cab & Taxi
                  </span>
                </button>

                {/* Hotel Stay */}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('Hotels')}
                  className={`relative flex flex-col items-center justify-center rounded-2xl py-3 px-1.5 transition-all cursor-pointer ${
                    category === 'Hotels'
                      ? 'bg-white border-2 border-[#0EA5E9] shadow-md ring-3 ring-sky-100'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {category === 'Hotels' && (
                    <span className="absolute -top-1.5 right-2 w-3.5 h-3.5 bg-[#0EA5E9] rounded-full border-2 border-white flex items-center justify-center shadow-xs">
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                    </span>
                  )}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 ${
                      category === 'Hotels' ? 'bg-sky-50 text-[#0EA5E9]' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Hotel className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-bold tracking-tight text-center leading-tight ${
                      category === 'Hotels' ? 'text-[#0EA5E9]' : 'text-slate-700'
                    }`}
                  >
                    Hotel Stay
                  </span>
                </button>

                {/* Full Package */}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('Packages')}
                  className={`relative flex flex-col items-center justify-center rounded-2xl py-3 px-1.5 transition-all cursor-pointer ${
                    category === 'Packages'
                      ? 'bg-white border-2 border-[#0EA5E9] shadow-md ring-3 ring-sky-100'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {category === 'Packages' && (
                    <span className="absolute -top-1.5 right-2 w-3.5 h-3.5 bg-[#0EA5E9] rounded-full border-2 border-white flex items-center justify-center shadow-xs">
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                    </span>
                  )}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 ${
                      category === 'Packages' ? 'bg-sky-50 text-[#0EA5E9]' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-bold tracking-tight text-center leading-tight ${
                      category === 'Packages' ? 'text-[#0EA5E9]' : 'text-slate-700'
                    }`}
                  >
                    Full Package
                  </span>
                </button>
              </div>
            </section>

            {/* 2. Horizontal Paired Row: Origin City & Destination */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                  Origin City
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="From City"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 transition-all shadow-2xs"
                  />
                  <MapPin className="w-3.5 h-3.5 text-[#0EA5E9] absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                  Destination
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="To City"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 transition-all shadow-2xs"
                  />
                  <MapPin className="w-3.5 h-3.5 text-rose-500 absolute right-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 3. Horizontal Paired Row: Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-900 focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                  End Date
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-900 focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* 4. Passenger Count & Vehicle Type */}
            <div className="grid grid-cols-2 gap-2 items-end">
              <div>
                <label className="block text-slate-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                  Passenger Count
                </label>
                <div className="border border-slate-200 rounded-xl bg-white p-1 flex items-center justify-between shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPaxCount((p) => Math.max(1, p - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer active:scale-95"
                  >
                    -
                  </button>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    <span className="font-extrabold text-slate-900 text-xs">{paxCount} Pax</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaxCount((p) => Math.min(20, p + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                  {category === 'Cabs' ? 'Vehicle Type' : category === 'Hotels' ? 'Room Type' : 'Package Tier'}
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-[11px] font-bold text-slate-900 focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 transition-all shadow-2xs"
                >
                  {currentPreset.vehicleOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Target Budget Offer & Market Savings Benchmark */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  Your Target Budget (₹)
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Est. Savings: {savingsPercent}% (₹{potentialSavings.toLocaleString()})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTargetBudget((b) => Math.max(2000, b - 500))}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm active:scale-95 cursor-pointer"
                >
                  -
                </button>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="100"
                    required
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-base font-black text-slate-900 focus:bg-white focus:border-[#0EA5E9] transition-all font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setTargetBudget((b) => b + 500)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm active:scale-95 cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Standard Market Reference:</span>
                <span className="text-slate-400 line-through font-mono">₹{marketBaseline.toLocaleString()}</span>
              </div>
            </div>

            {/* 6. Inclusions & Demands Checklist */}
            <div>
              <label className="block text-slate-700 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                Demand Specific Inclusions (Operators Must Comply)
              </label>
              <div className="space-y-1.5">
                {currentPreset.inclusions.map((inc) => {
                  const isChecked = selectedInclusions.includes(inc);
                  return (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => toggleInclusion(inc)}
                      className={`w-full text-left p-2 rounded-xl text-[11px] font-bold flex items-center justify-between border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-sky-50 border-sky-200 text-sky-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{inc}</span>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                          isChecked ? 'bg-[#0EA5E9] border-[#0EA5E9] text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Special Notes */}
            <div>
              <label className="block text-slate-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                Special Requests for Operators (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Senior citizens traveling, prefer early morning pickup at 5:00 AM..."
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 transition-all"
              />
            </div>

            {/* 8. Trust Note Banner */}
            <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-800 text-[11px] font-medium leading-tight">
                  Operators counter with lowest bids in{' '}
                  <strong className="text-[#0EA5E9] font-bold">15 mins</strong>
                </span>
              </div>
              <span className="text-[9.5px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                SPEEDY
              </span>
            </div>

            {/* 9. Action Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                className="w-full h-13 bg-gradient-to-r from-[#0EA5E9] via-[#0284C7] to-[#0284C7] hover:brightness-105 active:scale-[0.99] text-white font-black text-sm uppercase tracking-wide rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer border border-sky-300/40"
              >
                <ShieldCheck className="w-5 h-5 text-white" />
                <span>Submit Your Offer</span>
              </button>
              <p className="text-center text-[10px] text-slate-500 mt-2 font-medium">
                Shielded by RouTripo Escrow • 100% Zero Spam & Zero Direct Leakage
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
