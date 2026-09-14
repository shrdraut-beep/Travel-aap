import React, { useState, useEffect, useMemo } from 'react';
import { X, Calculator, Car, Train, Plane, Bus, Hotel, Utensils, ShieldCheck, Ticket, Fuel } from 'lucide-react';

interface SmartBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  destination: string;
  days: number;
  persons: number;
  transportMode: string; // 'car', 'train', 'flight', 'bus'
  onApplyBudget: (total: number) => void;
}

export const SmartBudgetModal: React.FC<SmartBudgetModalProps> = ({
  isOpen, onClose, lang, destination, days, persons, transportMode, onApplyBudget
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Base realistic rates (INR)
  const RATES = {
    hotelPerNight: 2400, // Average decent hotel per room (2 people)
    foodPerDay: 750, // Per person per day
    localTransportPerDay: 400, // Per person
    activityPerDay: 500, // Per person
    
    // Transport base rates
    flightPerPerson: 5200, // Round trip average
    trainPerPerson: 1200, // Round trip 3AC
    busPerPerson: 950, // Round trip AC Sleeper
    
    // Car specific
    carRentalPerDay: 2400,
    petrolPerDay: 1400,
    tollsTotal: 750
  };

  const breakdown = useMemo(() => {
    const validDays = Math.max(1, days);
    const validPersons = Math.max(1, persons);
    
    // Calculate rooms needed (assume 2 per room)
    const rooms = Math.ceil(validPersons / 2);
    const hotelCost = rooms * RATES.hotelPerNight * validDays;
    
    const foodCost = validPersons * RATES.foodPerDay * validDays;
    const localTransportCost = validPersons * RATES.localTransportPerDay * validDays;
    const activitiesCost = validPersons * RATES.activityPerDay * validDays;
    
    let travelCost = 0;
    let travelItems: { name: string; cost: number; icon: any }[] = [];
    
    const tMode = transportMode.toLowerCase();
    if (tMode === 'air' || tMode === 'flight') {
      const c = validPersons * RATES.flightPerPerson;
      travelCost += c;
      travelItems.push({ name: lang === 'mr' ? 'विमान तिकीट (दोन्ही बाजू)' : 'Flight Tickets (Round Trip)', cost: c, icon: Plane });
    } else if (tMode === 'train') {
      const c = validPersons * RATES.trainPerPerson;
      travelCost += c;
      travelItems.push({ name: lang === 'mr' ? 'ट्रेन तिकीट (3AC/Sleeper)' : 'Train Tickets (Round Trip)', cost: c, icon: Train });
    } else if (tMode === 'bus') {
      const c = validPersons * RATES.busPerPerson;
      travelCost += c;
      travelItems.push({ name: lang === 'mr' ? 'बस तिकीट (AC स्लीपर)' : 'Bus Tickets (AC Sleeper)', cost: c, icon: Bus });
    } else if (tMode === 'car' || tMode === 'road') {
      const rental = RATES.carRentalPerDay * validDays;
      const petrol = RATES.petrolPerDay * validDays;
      travelCost += rental + petrol + RATES.tollsTotal;
      travelItems.push({ name: lang === 'mr' ? 'कार भाडे / वाहन' : 'Cab / Car Rental', cost: rental, icon: Car });
      travelItems.push({ name: lang === 'mr' ? 'पेट्रोल / इंधन खर्च' : 'Petrol / Fuel', cost: petrol, icon: Fuel });
      travelItems.push({ name: lang === 'mr' ? 'टोल टॅक्स' : 'Highway Tolls', cost: RATES.tollsTotal, icon: Ticket });
    } else {
      const c = validPersons * RATES.busPerPerson;
      travelCost += c;
      travelItems.push({ name: lang === 'mr' ? 'प्रवास खर्च' : 'Travel Cost', cost: c, icon: Bus });
    }

    const miscBuffer = Math.round((hotelCost + foodCost + localTransportCost + activitiesCost + travelCost) * 0.08); // 8% buffer
    const total = hotelCost + foodCost + localTransportCost + activitiesCost + travelCost + miscBuffer;

    return {
      hotelCost, foodCost, localTransportCost, activitiesCost, travelItems, miscBuffer, total
    };
  }, [days, persons, transportMode, lang]);

  useEffect(() => {
    if (isOpen) {
      setIsCalculating(true);
      const t = setTimeout(() => setIsCalculating(false), 500);
      return () => clearTimeout(t);
    }
  }, [isOpen, destination, days, persons, transportMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[var(--premium-ink)]/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-95">
        
        {/* Header - Uniform App Signature Sky Panel */}
        <div className="premium-gradient p-5 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[20px] bg-white/20 backdrop-blur-md">
              <Calculator className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="font-bold text-[16px] leading-tight tracking-tight text-white">
                {lang === 'mr' ? 'स्मार्ट बजेट गणक' : 'Smart Budget Calculator'}
              </h3>
              <p className="text-[11px] text-white/90 font-medium">
                {destination ? `Optimized for ${destination}` : 'Realistic Travel Cost Estimator'}
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={onClose} 
            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-5 space-y-4 flex-1 bg-[var(--premium-page)]">
          {isCalculating ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <p className="text-sm font-bold text-[var(--premium-ink)] animate-pulse">
                {lang === 'mr' ? 'अचूक बजेट मोजत आहे...' : 'Calculating market accurate budget...'}
              </p>
            </div>
          ) : (
            <>
              {/* Trip Context Card */}
              <div className="bg-white p-3.5 rounded-[22px] shadow-xs border border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--premium-muted)] mb-2">
                  <span className="uppercase tracking-wider">{lang === 'mr' ? 'सहल संदर्भ' : 'Trip Details'}</span>
                  <span className="font-bold text-[var(--premium-violet)]">{destination || 'Anywhere'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[var(--premium-page)] p-2 rounded-[16px] text-center">
                    <div className="text-[10px] font-bold uppercase text-[var(--premium-muted)]">Duration</div>
                    <div className="font-bold text-[var(--premium-ink)] text-sm">{days} Days</div>
                  </div>
                  <div className="bg-[var(--premium-page)] p-2 rounded-[16px] text-center">
                    <div className="text-[10px] font-bold uppercase text-[var(--premium-muted)]">Travelers</div>
                    <div className="font-bold text-[var(--premium-ink)] text-sm">{persons} Pax</div>
                  </div>
                  <div className="bg-[var(--premium-page)] p-2 rounded-[16px] text-center">
                    <div className="text-[10px] font-bold uppercase text-[var(--premium-muted)]">Mode</div>
                    <div className="font-bold text-[var(--premium-ink)] text-sm uppercase">{transportMode}</div>
                  </div>
                </div>
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-[var(--premium-muted)] uppercase tracking-wider px-1">
                  {lang === 'mr' ? 'तपशीलवार खर्च विभागणी' : 'Estimated Breakdown'}
                </h4>
                
                <div className="space-y-2 text-xs">
                  {breakdown.travelItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-[20px] shadow-xs">
                      <div className="flex items-center gap-2.5 font-bold text-[var(--premium-ink)]">
                        <span className="w-8 h-8 rounded-[16px] bg-[var(--premium-violet-soft)] text-[var(--premium-violet)] flex items-center justify-center">
                          <item.icon className="w-4 h-4" />
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <div className="font-bold text-[var(--premium-ink)] text-sm">₹{item.cost.toLocaleString('en-IN')}</div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-[20px] shadow-xs">
                    <div className="flex items-center gap-2.5 font-bold text-[var(--premium-ink)]">
                      <span className="w-8 h-8 rounded-[16px] bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)] flex items-center justify-center">
                        <Hotel className="w-4 h-4" />
                      </span>
                      <span>{lang === 'mr' ? 'हॉटेल व मुक्काम (Rooms)' : 'Hotel & Stay'}</span>
                    </div>
                    <div className="font-bold text-[var(--premium-ink)] text-sm">₹{breakdown.hotelCost.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-[20px] shadow-xs">
                    <div className="flex items-center gap-2.5 font-bold text-[var(--premium-ink)]">
                      <span className="w-8 h-8 rounded-[16px] bg-[var(--premium-pink-soft)] text-[var(--premium-pink)] flex items-center justify-center">
                        <Utensils className="w-4 h-4" />
                      </span>
                      <span>{lang === 'mr' ? 'जेवण व खाद्यसंस्कृती' : 'Food & Dining'}</span>
                    </div>
                    <div className="font-bold text-[var(--premium-ink)] text-sm">₹{breakdown.foodCost.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-[20px] shadow-xs">
                    <div className="flex items-center gap-2.5 font-bold text-[var(--premium-ink)]">
                      <span className="w-8 h-8 rounded-[16px] bg-premium-sky-soft text-premium-sky-deep flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                      <span>{lang === 'mr' ? 'आकस्मिक बफर (8%)' : 'Safety Buffer (8%)'}</span>
                    </div>
                    <div className="font-bold text-[var(--premium-ink)] text-sm">₹{breakdown.miscBuffer.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-slate-100 bg-white mt-auto">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[12px] font-bold text-[var(--premium-muted)] uppercase tracking-wider">
              {lang === 'mr' ? 'एकूण अंदाजित खर्च' : 'Recommended Total'}
            </span>
            <span className="text-[22px] font-bold text-[var(--premium-violet)]">
              ₹{breakdown.total.toLocaleString('en-IN')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onApplyBudget(breakdown.total);
              onClose();
            }}
            className="w-full h-12 bg-[var(--premium-violet)] hover:opacity-95 text-white rounded-[20px] font-bold text-sm shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{lang === 'mr' ? 'हे बजेट लागू करा' : 'Apply Calculated Budget'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
