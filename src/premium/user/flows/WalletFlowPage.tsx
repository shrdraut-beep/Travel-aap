import React, { useState } from 'react';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, ShieldCheck, CheckCircle2, Sparkles, CreditCard, Clock } from 'lucide-react';
import { CommonFlowHeader } from '../../../components/common/CommonFlowHeader';
import { ActiveOfferCouponsGrid } from '../../../components/common/ActiveOfferCouponsGrid';

export interface WalletFlowPageProps {
  onClose: () => void;
  isMr?: boolean;
}

export const WalletFlowPage: React.FC<WalletFlowPageProps> = ({
  onClose,
  isMr = false
}) => {
  const [balance, setBalance] = useState(4250);
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [toast, setToast] = useState<string | null>(null);

  const transactions = [
    { id: 'tx-1', desc: 'Flight Booking Cashback (6E-729)', type: 'credit', amount: 250, date: 'Today, 2:15 PM' },
    { id: 'tx-2', desc: 'Escrow Hotel Deposit (Goa Resort)', type: 'debit', amount: 2000, date: 'Yesterday' },
    { id: 'tx-3', desc: 'UPI Instant Top-Up', type: 'credit', amount: 3000, date: '14 Sep 2026' },
    { id: 'tx-4', desc: 'Outstation Cab Partial Payment', type: 'debit', amount: 1500, date: '10 Sep 2026' }
  ];

  const handleAddMoney = () => {
    setAdding(true);
    setTimeout(() => {
      setBalance((prev) => prev + Number(amount));
      setAdding(false);
      setToast(isMr ? `₹${amount} UPI द्वारे वॉलेटमध्ये यशस्वीरित्या जमा झाले!` : `₹${amount} added successfully via UPI!`);
      setTimeout(() => setToast(null), 3500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 text-slate-900 flex flex-col">
      <CommonFlowHeader
        title={isMr ? 'RoutTripo ट्रॅव्हल वॉलेट' : 'RoutTripo Travel Wallet'}
        subtitle={isMr ? 'झटपट कॅशबॅक, १-टॅप पेमेंट व एस्क्रो सुरक्षा' : 'Instant 1-tap checkout, zero-fee refunds & booking cashback'}
        onBack={onClose}
        onClose={onClose}
        backAriaLabel="Back to dashboard"
        closeAriaLabel="Close wallet"
      />

      <main className="max-w-3xl mx-auto w-full flex-1 px-4 sm:px-6 py-6 pb-28 space-y-6">
        {toast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Balance Card */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">
              {isMr ? 'उपलब्ध वॉलेट शिल्लक' : 'Available Wallet Balance'}
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              {isMr ? 'सुरक्षित वॉलेट' : 'Escrow Secured'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black mt-2 leading-none">
            ₹{balance.toLocaleString('en-IN')}
          </h2>
          <p className="text-xs text-white/85 mt-2 font-medium">
            {isMr ? 'मागील फ्लाइट बुकिंगवरील ₹२५० कॅशबॅक समाविष्ट.' : 'Auto-credited ₹250 cashback from your last domestic flight booking.'}
          </p>
        </div>

        {/* Quick Top-Up Section */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {isMr ? 'UPI द्वारे झटपट रक्कम जोडा' : 'Quick UPI Instant Recharge'}
          </h3>

          <div className="grid grid-cols-4 gap-2">
            {['500', '1000', '2000', '5000'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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
            {transactions.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {t.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">{t.desc}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.date}</p>
                  </div>
                </div>

                <span className={`text-sm font-black ${t.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Coupons Grid embedded below */}
        <div className="pt-2">
          <ActiveOfferCouponsGrid variant="user" isMr={isMr} />
        </div>
      </main>
    </div>
  );
};

export default WalletFlowPage;
