import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Coins, 
  Plane, 
  Building2, 
  Car 
} from 'lucide-react';
import { CommonFlowHeader } from '../../../components/common/CommonFlowHeader';
import { ActiveOfferCouponsGrid } from '../../../components/common/ActiveOfferCouponsGrid';
import { ClosedWalletService, type ClosedWalletAccount } from '../../../services/ClosedWalletService';

export interface WalletFlowPageProps {
  onClose: () => void;
  isMr?: boolean;
}

export const WalletFlowPage: React.FC<WalletFlowPageProps> = ({
  onClose,
  isMr = false
}) => {
  const [account, setAccount] = useState<ClosedWalletAccount>(ClosedWalletService.getAccount());
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [toast, setToast] = useState<string | null>(null);
  const [showRbiNotice, setShowRbiNotice] = useState(false);

  useEffect(() => {
    setAccount(ClosedWalletService.getAccount());
    const unsub = ClosedWalletService.subscribe((updated) => setAccount(updated));
    return () => unsub();
  }, []);

  const handleAddMoney = () => {
    const val = Number(amount);
    if (isNaN(val) || val <= 0) return;

    setAdding(true);
    setTimeout(() => {
      ClosedWalletService.topUp(val, 'UPI');
      setAdding(false);
      setToast(isMr ? `₹${val.toLocaleString('en-IN')} UPI द्वारे वॉलेटमध्ये यशस्वीरित्या जमा झाले!` : `₹${val.toLocaleString('en-IN')} added successfully via UPI!`);
      setTimeout(() => setToast(null), 3500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 text-slate-900 flex flex-col font-['Outfit',sans-serif]">
      <CommonFlowHeader
        title={isMr ? 'RoutTripo ट्रॅव्हल वॉलेट (Closed PPI)' : 'RoutTripo Travel Wallet (Closed PPI)'}
        subtitle={isMr ? 'RBI नियमांनुसार सुरक्षित, झटपट १-टॅप बुकिंग पेमेंट' : 'RBI Closed-Loop Compliant • 1-Tap Travel Checkout'}
        onBack={onClose}
        onClose={onClose}
        backAriaLabel="Back to dashboard"
        closeAriaLabel="Close wallet"
      />

      <main className="max-w-3xl mx-auto w-full flex-1 px-4 sm:px-6 py-6 pb-28 space-y-5">
        {toast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Balance Card with Merged Coins Breakdown */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-sky-700 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">
              {isMr ? 'उपलब्ध वॉलेट शिल्लक' : 'Available Spendable Balance'}
            </span>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>RBI Closed PPI</span>
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black mt-2 leading-none">
            ₹{account.totalBalance.toLocaleString('en-IN')}
          </h2>

          {/* Breakdown: Cash + Merged Coins */}
          <div className="mt-4 pt-3.5 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <span className="block text-[10px] text-indigo-200 uppercase font-bold">
                {isMr ? 'टॉप-अप रक्कम' : 'Top-Up Cash'}
              </span>
              <span className="font-mono font-extrabold text-white text-sm">
                ₹{account.topUpBalance.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-amber-400/20 border border-amber-300/30 rounded-xl p-2.5 backdrop-blur-xs">
              <div className="flex items-center justify-between text-[10px] text-amber-200 uppercase font-bold">
                <span>{isMr ? 'विलीन कॉइन्स' : 'Merged Coins'}</span>
                <Coins className="w-3 h-3 text-amber-300" />
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono font-extrabold text-amber-200 text-sm">
                  ₹{account.coinValueInRupees.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-200/80 font-mono">
                  ({account.coinBalance.toLocaleString()} Coins)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Non-Withdrawable Notice (RBI Closed PPI Regulation) */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-amber-900 leading-tight">
                {isMr ? 'रक्कम रोख किंवा बँकेत काढता येणार नाही (Non-Withdrawable)' : 'Non-Withdrawable to Bank (RBI Closed PPI)'}
              </p>
              <button
                type="button"
                onClick={() => setShowRbiNotice(true)}
                className="text-[10.5px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
              >
                {isMr ? 'नियम' : 'Details'}
              </button>
            </div>
            <p className="text-[11px] text-amber-800/90 mt-0.5 leading-snug">
              {isMr
                ? 'भारतीय रिझर्व्ह बँकेच्या (RBI) क्लोज्ड वॉलेट नियमांनुसार ही शिल्लक बँकेत काढता येत नाही; ती RouTripo वरील सर्व बुकिंगसाठी १००% वापरता येते.'
                : 'Under RBI PPI regulations, funds cannot be withdrawn to bank accounts or as cash. Fully usable across all RouTripo travel services.'}
            </p>
          </div>
        </div>

        {/* Quick Top-Up Section */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {isMr ? 'UPI द्वारे झटपट रक्कम जोडा' : 'Quick UPI Instant Recharge'}
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Instant
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {['500', '1000', '2000', '5000'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  amount === val
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                +₹{val}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddMoney}
            disabled={adding}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{adding ? (isMr ? 'प्रक्रिया सुरू आहे...' : 'Processing UPI Payment...') : (isMr ? `वॉलेटमध्ये ₹${amount} जोडा` : `Add ₹${amount} to Wallet`)}</span>
          </button>
        </div>

        {/* Passbook / Recent Transactions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            {isMr ? 'पासबुक व्यवहार नोंद' : 'Recent Passbook Ledger'}
          </h3>

          <div className="space-y-2">
            {account.transactions.slice(0, 6).map((t) => {
              const isCredit = t.direction === 'credit';
              return (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">{t.description}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(t.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <span className={`text-sm font-black ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isCredit ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Coupons Grid embedded below */}
        <div className="pt-2">
          <ActiveOfferCouponsGrid variant="user" isMr={isMr} />
        </div>
      </main>

      {/* Nested RBI Compliance Explanation Modal */}
      {showRbiNotice && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            
            <div>
              <h4 className="text-base font-black text-slate-900 leading-tight">
                {isMr ? 'RBI क्लोज्ड वॉलेट नियम व अटी' : 'RBI Closed-Loop Wallet Regulations'}
              </h4>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Master Direction DPSS.CO.PD.No.1164/02.14.006/2017-18
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p>
                <strong>१. रोख रक्कम काढणे प्रतिबंधित (No Cash-Out):</strong> भारतीय रिझर्व्ह बँक (RBI) च्या क्लोज्ड सिस्टीम प्रीपेड इन्स्ट्रुमेंट नियमांनुसार, वॉलेटमधील शिल्लक बँकेत ट्रान्सफर करता येत नाही किंवा ATM मधून रोख स्वरूपात काढता येत नाही.
              </p>
              <p>
                <strong>२. १००% प्रवासासाठी वापर (100% Travel Usable):</strong> ही रक्कम RouTripo वरील फ्लाइट्स, हॉटेल्स, आऊटस्टेशन कॅब्स आणि बसेसच्या बुकिंगसाठी कोणत्याही अतिरिक्त शुल्काशिवाय वापरता येते.
              </p>
              <p>
                <strong>३. विलीन झालेले कॉइन्स (Merged Coins):</strong> तुमचे सर्व RouTripo Coins (१० कॉइन्स = ₹१) या वॉलेटमध्ये विलीन झाले असून बुकिंग करताना थेट वजा होतात.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowRbiNotice(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isMr ? 'समजले (Close)' : 'I Understand'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletFlowPage;
