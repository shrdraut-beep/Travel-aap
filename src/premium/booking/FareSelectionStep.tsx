import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, Briefcase, Info, ChevronRight, Check } from "lucide-react";
import { FlightBookingHeader } from "./FlightBookingHeader";

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
  const [selectedFareId, setSelectedFareId] = useState<string>("flexi");

  const basePrice = Number(flight?.price || flight?.total_amount || 6480);
  const totalPax = passengerCount || ((searchParams?.adults || 1) + (searchParams?.children || 0) + (searchParams?.infants || 0));

  const fares: SelectedFare[] = [
    {
      id: "saver",
      name: "Saver",
      priceDelta: 0,
      benefits: [
        "Check-in 15 kg",
        "Standard Seat Selection (Chargeable)",
        "Cancellation Charge: ₹2,500 per pax",
        "Date Change Fee: ₹1,500 + diff"
      ]
    },
    {
      id: "flexi",
      name: "Flexi Plus",
      priceDelta: 1200,
      benefits: [
        "Free Seat Choice",
        "Complimentary Meal",
        "₹10 Change Fee",
        "Check-in 15 kg"
      ]
    },
    {
      id: "vip",
      name: "Super Saver VIP",
      priceDelta: 2500,
      benefits: [
        "Check-in 20 kg",
        "Row 1-3 Upfront Seat",
        "Gourmet Hot Meal",
        "Priority Boarding"
      ]
    }
  ];

  const handleContinue = () => {
    const selected = fares.find((f) => f.id === selectedFareId) || fares[1];
    onConfirmFare(selected);
  };

  const selectedFare = fares.find(f => f.id === selectedFareId);
  const totalAmount = (basePrice + (selectedFare?.priceDelta || 0)) * totalPax;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-28">
      {/* Header */}
      <FlightBookingHeader 
        flight={flight} 
        stepNum={1} 
        stepTitle="Flight Review" 
        onClose={onBack} 
        onBack={onBack} 
      />

      <main className="max-w-4xl mx-auto px-4 py-6 mt-[100px] space-y-4">
        
        <div className="flex flex-col space-y-4">
          {fares.map((fare) => {
            const isSelected = selectedFareId === fare.id;
            return (
              <div
                key={fare.id}
                onClick={() => setSelectedFareId(fare.id)}
                className={`cursor-pointer rounded-xl p-4 transition-all duration-200 border ${
                  isSelected
                    ? "border-[#0ea5e9] bg-[#0ea5e9]/5 shadow-md"
                    : "border-[#E2E8F0] bg-white shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isSelected ? "bg-[#0ea5e9]" : "bg-[#eaeef4]"}`}>
                      <div className={`w-2 h-2 rounded-full bg-white transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`}></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-['Outfit'] text-[16px] font-bold text-[#0F172A]">{fare.name}</h3>
                        {fare.id === "flexi" && (
                          <span className="bg-[#c9e6ff] text-[#004c6e] font-['JetBrains_Mono',monospace] text-[12px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">RECOMMENDED</span>
                        )}
                        {fare.id === "vip" && (
                          <span className="bg-[#ffdcbd] text-[#693c00] font-['JetBrains_Mono',monospace] text-[12px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">VIP Perks</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-0.5">
                      <span className="font-['Outfit'] text-[18px] font-bold tracking-tight">
                        ₹{(basePrice + fare.priceDelta).toLocaleString("en-IN")}
                      </span>
                      <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#94A3B8] font-medium">/pax</span>
                    </div>
                    {totalPax > 1 && (
                      <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#94A3B8]">
                        ₹{((basePrice + fare.priceDelta) * totalPax).toLocaleString("en-IN")} total
                      </span>
                    )}
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-y-2 gap-x-2 mt-4 p-2 rounded-lg ${isSelected ? "bg-[#0ea5e9]/5" : "bg-[#F8FAFC]"}`}>
                  {fare.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                      <Check className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#0ea5e9]" : "text-[#475569]"}`} />
                      <span className={`font-['Outfit'] text-[14px] truncate ${isSelected ? "text-[#0F172A]" : "text-[#475569]"}`}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Assurance Strip */}
        <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-md border border-[#E2E8F0]/80 rounded-lg px-4 mt-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#10B981] w-5 h-5" />
            <span className="font-['Outfit'] text-[14px] text-[#475569]">RouTripo SafeFare Guarantee included</span>
          </div>
          <ChevronRight className="text-[#94A3B8] w-4 h-4" />
        </div>
      </main>

      {/* Bottom Fixed Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(15,23,42,0.06)] px-4 py-3 pb-safe flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="font-['Outfit'] text-[20px] leading-tight font-bold text-[#0F172A]">
              ₹{totalAmount.toLocaleString("en-IN")}
            </span>
            <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#94A3B8] whitespace-nowrap">({totalPax} Travellers)</span>
          </div>
          <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#10B981] truncate">Incl. all taxes & fees</span>
        </div>
        <button
          onClick={handleContinue}
          className="bg-[#0ea5e9] text-white px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all duration-150 whitespace-nowrap min-h-[44px]"
        >
          <span className="font-['Outfit'] text-[14px] font-semibold tracking-wide">Continue to Passengers</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};
