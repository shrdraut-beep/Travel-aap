import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, Briefcase, Info } from "lucide-react";
import { BookingStepHeader } from "./BookingStepHeader";

export interface SelectedFare {
  id: string;
  name: string;
  priceDelta: number;
  benefits: string[];
}

export interface FareSelectionStepProps {
  flight: any;
  searchParams?: any;
  passengerCount?: number;
  onConfirmFare: (fare: SelectedFare) => void;
  onBack: () => void;
}

export const FareSelectionStep: React.FC<FareSelectionStepProps> = ({
  flight,
  searchParams,
  passengerCount,
  onConfirmFare,
  onBack
}) => {
  const [selectedFareId, setSelectedFareId] = useState<string>("saver");

  const org = flight?.origin || "BOM";
  const dst = flight?.destination || "DEL";
  const airline = flight?.airline || "IndiGo";
  const flightNo = flight?.flightNumber || "6E-2045";
  const aircraft = flight?.aircraft || "Airbus A320neo";
  const basePrice = Number(flight?.price || flight?.total_amount || 4890);
  const totalPax = passengerCount || ((searchParams?.adults || 1) + (searchParams?.children || 0) + (searchParams?.infants || 0));

  const fares: SelectedFare[] = [
    {
      id: "saver",
      name: "Saver",
      priceDelta: 0,
      benefits: [
        "🧳 7kg Cabin + 15kg Check-in baggage",
        "💺 Standard Seat Selection (Chargeable)",
        "🔄 Cancellation Charge: ₹2,500 per pax",
        "📅 Date Change Fee: ₹1,500 + fare diff"
      ]
    },
    {
      id: "flexi",
      name: "Flexi Plus",
      priceDelta: 1200,
      benefits: [
        "🧳 7kg Cabin + 15kg Check-in baggage",
        "💺 Free Standard Seat Selection",
        "🍱 Free In-flight Snack & Drink",
        "🔄 Reduced Cancellation Fee: ₹1,000",
        "📅 Reduced Date Change Fee: ₹500"
      ]
    },
    {
      id: "premium",
      name: "Super 6E / Premium",
      priceDelta: 2500,
      benefits: [
        "🧳 7kg Cabin + 25kg Check-in (+10kg Extra)",
        "💺 Free Any Seat (including XL Legroom)",
        "🍱 Free Premium Gourmet Hot Meal",
        "🛡️ Zero Cancellation Fee (100% Refund)",
        "📅 Zero Date Change Fee",
        "⚡ Priority Check-in & Baggage Handling"
      ]
    }
  ];

  const handleContinue = () => {
    const selected = fares.find((f) => f.id === selectedFareId) || fares[0];
    onConfirmFare(selected);
  };

  return (
    <div className="min-h-screen bg-[var(--premium-page)] text-[var(--premium-ink)] pb-28">
      {/* Header */}
      <BookingStepHeader
        title="Select Fare Type"
        step="Step 2 of 6"
        subtitle={<>{airline} {flightNo} • {aircraft} • {org} to {dst} • {totalPax} Traveler{totalPax > 1 ? "s" : ""}</>}
        onBack={onBack}
        backAriaLabel="Back to results"
        maxWidth="max-w-4xl"
      />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-sky-50 text-sky-800 rounded-2xl p-4 border border-sky-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-medium leading-relaxed">
            Upgrade your fare for added benefits like free seat selection, extra baggage, free meals, and zero cancellation fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fares.map((fare) => {
            const isSelected = selectedFareId === fare.id;
            return (
              <div
                key={fare.id}
                onClick={() => setSelectedFareId(fare.id)}
                className={`relative rounded-3xl p-5 border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-[var(--premium-violet)] bg-violet-50/30 shadow-md scale-[1.02]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[var(--premium-violet)] text-white flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg font-black text-slate-900">{fare.name}</h3>
                  <div className="mt-2 text-2xl font-bold text-[var(--premium-violet)]">
                    ₹{basePrice + fare.priceDelta}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                    Per adult (taxes incl.)
                  </span>
                  {totalPax > 1 && (
                    <span className="text-xs font-bold text-slate-800 mt-1 block">
                      Total: ₹{(basePrice + fare.priceDelta) * totalPax} ({totalPax} travelers)
                    </span>
                  )}
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {fare.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                      <span className="font-medium leading-snug">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Selected Fare ({totalPax} Traveler{totalPax > 1 ? "s" : ""})
            </span>
            <div className="text-lg font-bold text-slate-900">
              ₹{(basePrice + (fares.find(f => f.id === selectedFareId)?.priceDelta || 0)) * totalPax}
            </div>
          </div>
          <button
            type="button"
            onClick={handleContinue}
            className="px-8 py-3.5 rounded-xl bg-[var(--premium-violet)] text-white font-bold text-sm shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
          >
            Continue
          </button>
        </div>
      </footer>
    </div>
  );
};
