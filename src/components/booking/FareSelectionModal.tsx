import React from 'react';
import { X, Luggage, ShieldCheck, CalendarClock, ArrowRight, Check } from 'lucide-react';
import { useCurrency } from './useCurrency';
import { FullScreenPortal } from '../../common/FullScreenPortal';

interface FareSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  flightLabel: string;
  airline: string;
  departDate: string;
  departTime: string;
  arriveTime: string;
  upgradedFarePlans: any[]; // Array of Duffel Offers
  onSelectPlan: (offer: any) => void;
}

export const FareSelectionModal: React.FC<FareSelectionModalProps> = ({
  isOpen,
  onClose,
  flightLabel,
  airline,
  departDate,
  departTime,
  arriveTime,
  upgradedFarePlans,
  onSelectPlan,
}) => {
  const { rate } = useCurrency();


  const formatPenaltyDisplay = (penaltyObj: any, defaultText: string = 'Non-refundable') => {
    if (!penaltyObj) return defaultText;
    if (penaltyObj.allowed === false) return 'Non-refundable';
    if (penaltyObj.penalty_amount === null || penaltyObj.penalty_amount === undefined) {
      if (penaltyObj.allowed === true) return 'Free / Nil';
      return defaultText;
    }
    const penaltyAmt = parseFloat(penaltyObj.penalty_amount);
    if (isNaN(penaltyAmt) || penaltyAmt <= 0) {
      return penaltyObj.allowed === true ? 'Free / Nil' : defaultText;
    }
    const penaltyCurrency = penaltyObj.penalty_currency || 'USD';
    if (penaltyCurrency === 'INR') {
      return `₹${Math.ceil(penaltyAmt).toLocaleString('en-IN')}`;
    }
    const inrVal = Math.ceil(penaltyAmt * (rate || 85) * 1.03);
    return `₹${inrVal.toLocaleString('en-IN')}`;
  };

  return (
    <FullScreenPortal isOpen={isOpen} layer="modal" onBackdropClick={onClose} backdropClassName="bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#F7F8FA] w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom duration-300">
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Select Fare Plan</h3>
            <p className="text-xs text-slate-500">{airline} • {departDate}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {upgradedFarePlans.map((offer) => {
            const rawAmt = parseFloat(offer.total_amount) || 0;
            const priceINR = offer.total_currency === 'INR' 
              ? Math.ceil(rawAmt) 
              : Math.ceil(rawAmt * ((rate || 85) * 1.03));
            
            const condRefund = offer.conditions?.refund_before_departure;
            const condChange = offer.conditions?.change_before_departure;

            const refundText = formatPenaltyDisplay(condRefund, 'Non-refundable');
            const changeText = formatPenaltyDisplay(condChange, 'Non-changeable');
            
            return (
              <div
                key={offer.id}
                className="p-4 rounded-[20px] border-2 border-slate-200 hover:border-[#D4AF37] bg-white cursor-pointer transition-all"
                onClick={() => onSelectPlan(offer)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-black text-slate-900">{offer.fare_name || (offer.base_amount ? 'Upgraded Fare' : 'Available Plan')}</h5>
                    <p className="text-xs text-slate-500">Live API Fare Conditions</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#0B1E3D] block">₹{priceINR.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <ShieldCheck className={`w-3.5 h-3.5 ${refundText === 'Non-refundable' ? 'text-rose-500' : 'text-premium-sky-deep'}`} />
                    <span>Refund: {refundText}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CalendarClock className={`w-3.5 h-3.5 ${changeText === 'Non-changeable' ? 'text-rose-500' : 'text-premium-pink'}`} />
                    <span>Change: {changeText}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FullScreenPortal>
  );
};
