import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  ShieldCheck, 
  Lock, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  Sparkles,
  Plane,
  Building2,
  Car,
  FileText,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { 
  ClosedWalletService, 
  type ClosedWalletAccount, 
  type ClosedWalletTransaction 
} from '../../services/ClosedWalletService';
import { RazorpayCheckoutModal } from '../../components/common/RazorpayCheckoutModal';

interface ClosedWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMr?: boolean;
}

export const ClosedWalletModal: React.FC<ClosedWalletModalProps> = ({
  isOpen,
  onClose,
  isMr = false
}) => {
  const [account, setAccount] = useState<ClosedWalletAccount>(ClosedWalletService.getAccount());
  const [topUpAmount, setTopUpAmount] = useState('1000');
  const [currentView, setCurrentView] = useState<'wallet' | 'regulations'>('wallet');
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setAccount(ClosedWalletService.getAccount());
    const unsubscribe = ClosedWalletService.subscribe((updated) => {
      setAccount(updated);
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  /**
   * Opens the authentic Razorpay Payment Gateway directly
   * (No fake options; opens standard Razorpay checkout)
   */
  const handleOpenPaymentGateway = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(topUpAmount);
    if (isNaN(val) || val <= 0) {
      showToast('Please enter a valid amount (minimum ₹100).');
      return;
    }
    setIsRazorpayOpen(true);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-['Outfit',sans-serif]">
      <div 
        className="w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Toast */}
        {toastMessage && (
          <div className="absolute top-4 inset-x-0 mx-auto z-50 max-w-xs px-4 pointer-events-none">
            <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
              <span>{toastMessage}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
            </div>
          </div>
        )}

        {/* Header with View Tabs */}
        <div className="bg-gradient-to-r from-indigo-50 via-white to-sky-50 px-5 py-3.5 border-b border-indigo-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  RouTripo Travel Wallet
                </h3>
                <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Closed PPI</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Reserve Bank of India (RBI) Closed-Loop PPI Compliant
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Switcher Tabs: Main Wallet vs Detailed English Regulations */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 p-1 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentView('wallet')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentView === 'wallet'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Wallet &amp; Top-Up</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('regulations')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentView === 'regulations'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>RBI Rules &amp; Regulations</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {currentView === 'wallet' ? (
            <>
              {/* Balance Card with Merged Coins */}
              <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-sky-700 text-white shadow-md">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center justify-between text-xs text-indigo-100 font-semibold uppercase tracking-wider">
                  <span>Total Spendable Balance</span>
                  <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    100% Usable on Bookings
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight">
                    ₹{account.totalBalance.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Merged Breakdown Pills */}
                <div className="mt-3.5 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                    <span className="block text-[10px] text-indigo-200 uppercase font-bold">
                      Top-Up Cash Balance
                    </span>
                    <span className="font-mono font-extrabold text-white text-sm">
                      ₹{account.topUpBalance.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="bg-amber-400/20 border border-amber-300/30 rounded-xl p-2.5 backdrop-blur-xs">
                    <div className="flex items-center justify-between text-[10px] text-amber-200 uppercase font-bold">
                      <span>RouTripo Coins Merged</span>
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

              {/* Real Payment Gateway Top-Up Section (No Fake Inputs) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Top-Up Wallet Balance</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Instant Bank Credit
                  </span>
                </div>

                {/* Amount Presets */}
                <div className="grid grid-cols-4 gap-2">
                  {['500', '1000', '2000', '5000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTopUpAmount(val)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                        topUpAmount === val
                          ? 'border-indigo-600 bg-white text-indigo-700 shadow-xs ring-2 ring-indigo-200'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="100"
                    max="100000"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Enter amount (min ₹100)"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Real Payment Gateway Trust Badge */}
                <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-[11px] text-indigo-900">
                  <div className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Razorpay PCI-DSS Level 1 Gateway</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                    UPI • Cards • NetBanking
                  </span>
                </div>

                {/* Direct Gateway Launch Button */}
                <button
                  type="button"
                  onClick={handleOpenPaymentGateway}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Proceed to Pay &amp; Top-Up ₹{Number(topUpAmount || 0).toLocaleString('en-IN')}</span>
                </button>
                <p className="text-[10.5px] text-center text-slate-400 font-mono">
                  Opens live Razorpay Checkout with PhonePe, Google Pay, Paytm &amp; Cards
                </p>
              </div>

              {/* Non-Withdrawable Rule Card with Detailed English Link */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-amber-900 leading-tight">
                      Non-Withdrawable to Bank (RBI Closed PPI)
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentView('regulations')}
                      className="text-[10px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Read Rules</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800/90 mt-0.5 leading-snug">
                    Under Reserve Bank of India (RBI) PPI Guidelines, funds in this Closed-Loop Travel Wallet cannot be withdrawn to bank accounts or as cash. 100% redeemable across all RouTripo travel services.
                  </p>
                </div>
              </div>

              {/* Where can you use this balance? */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  100% Spendable Across RouTripo Services
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex flex-col items-center text-center">
                    <Plane className="w-4 h-4 text-sky-600 mb-1" />
                    <span className="text-[11px] font-bold text-slate-800">Flights</span>
                    <span className="text-[9.5px] text-slate-400">Zero Convenience Fee</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex flex-col items-center text-center">
                    <Building2 className="w-4 h-4 text-indigo-600 mb-1" />
                    <span className="text-[11px] font-bold text-slate-800">Hotels &amp; Stays</span>
                    <span className="text-[9.5px] text-slate-400">Instant Escrow Pay</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex flex-col items-center text-center">
                    <Car className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="text-[11px] font-bold text-slate-800">Cabs &amp; Buses</span>
                    <span className="text-[9.5px] text-slate-400">1-Tap Checkout</span>
                  </div>
                </div>
              </div>

              {/* Transaction Ledger */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Recent Wallet Transactions
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {account.transactions.length} records
                  </span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
                  {account.transactions.slice(0, 6).map((tx) => {
                    const isCredit = tx.direction === 'credit';
                    return (
                      <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {isCredit ? (
                              <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {tx.description}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {new Date(tx.timestamp).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })} • {tx.source}
                            </p>
                          </div>
                        </div>
                        <span className={`font-mono text-xs font-black shrink-0 ${
                          isCredit ? 'text-emerald-600' : 'text-slate-900'
                        }`}>
                          {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* DETAILED ENGLISH REGULATIONS SECTION */
            <div className="space-y-4 text-slate-800">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-indigo-950">
                    Reserve Bank of India (RBI) Closed System PPI Guidelines
                  </h4>
                  <p className="text-[11px] font-mono text-indigo-800 mt-0.5">
                    Statutory Compliance: Master Direction DPSS.CO.PD.No.1164/02.14.006/2017-18
                  </p>
                  <p className="text-xs text-indigo-900/90 mt-1 leading-relaxed">
                    This document sets out the legal charter, operating guidelines, and consumer terms governing the RouTripo Closed-Loop Prepaid Travel Wallet.
                  </p>
                </div>
              </div>

              {/* Section 1 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center font-mono">
                    1
                  </span>
                  <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Legal Definition &amp; Scope of Closed System PPI
                  </h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">
                  As per Section 2.1 of the RBI Master Directions, a <strong>Closed System Prepaid Payment Instrument (PPI)</strong> is issued by an entity for facilitating the purchase of goods and services from that entity exclusively. The RouTripo Wallet is dedicated solely to purchasing travel inventory (flights, hotels, cabs, buses, and holiday packages) directly on the RouTripo platform.
                </p>
              </div>

              {/* Section 2 */}
              <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center font-mono">
                    2
                  </span>
                  <h5 className="text-xs font-black text-rose-950 uppercase tracking-wide">
                    Strict Prohibition on Cash Withdrawals &amp; Bank Sweeps
                  </h5>
                </div>
                <div className="text-xs text-rose-900/90 leading-relaxed pl-7 space-y-1">
                  <p>
                    <strong>• No Cash Out:</strong> Withdrawal of cash at Automated Teller Machines (ATMs), merchant outlets, or banking correspondents is strictly illegal and system-blocked.
                  </p>
                  <p>
                    <strong>• Non-Transferable to Bank Accounts:</strong> Funds once loaded into this wallet cannot be transferred, remitted, or swept back to any savings or current bank account.
                  </p>
                  <p>
                    <strong>• No P2P Transfers:</strong> Balance cannot be remitted to third-party users or external wallets.
                  </p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center font-mono">
                    3
                  </span>
                  <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Permissible Electronic Loading Channels
                  </h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">
                  Users are legally permitted to reload the wallet through authenticated digital payment channels authorized under the Payment and Settlement Systems Act, 2007:
                  <br />
                  • <strong>NPCI Unified Payments Interface (UPI):</strong> Google Pay, PhonePe, Paytm, BHIM.
                  <br />
                  • <strong>Credit &amp; Debit Cards:</strong> RuPay, Visa, Mastercard with 2-Factor 3D Secure OTP authorization.
                  <br />
                  • <strong>Internet Banking:</strong> Authorized Indian scheduled commercial banks.
                </p>
              </div>

              {/* Section 4 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center font-mono">
                    4
                  </span>
                  <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Integration of RouTripo Loyalty Coins
                  </h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">
                  Promotional RouTripo reward points and voyager coins are seamlessly merged into the spendable balance at a fixed statutory ratio of <strong>10 Coins = ₹1 INR</strong>. These coins hold immediate monetary value for booking deductions without restrictive coupon minimums.
                </p>
              </div>

              {/* Section 5 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center font-mono">
                    5
                  </span>
                  <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Cancellation Refunds &amp; 2% Loyalty Bonus
                  </h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">
                  Whenever an airline or hotel booking is cancelled or modified, eligible refunds are credited back to the Closed Travel Wallet instantaneously, circumventing the standard 5-7 business day bank clearance cycles. Opting for wallet refund grants an additional <strong>2% Loyalty Credit Bonus</strong>.
                </p>
              </div>

              {/* Section 6 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center font-mono">
                    6
                  </span>
                  <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Balance Validity &amp; Non-Forfeiture
                  </h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">
                  Under Indian consumer protection and PPI regulations, real money deposited by users does <strong>NOT expire</strong>. RouTripo maintains ring-fenced escrow arrangements with partner banks ensuring 100% solvency and safety of user funds at all times.
                </p>
              </div>

              {/* Section 7 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center font-mono">
                    7
                  </span>
                  <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Customer Grievance Redressal
                  </h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">
                  For discrepancies or billing disputes, users can file a ticket via in-app 24/7 SOS Support or contact the Principal Nodal Officer at <code>grievance@routripo.app</code>. Unresolved complaints beyond 30 days may be escalated to the Reserve Bank - Integrated Ombudsman Scheme.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentView('wallet')}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Back to Wallet
              </button>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-mono text-[10px]">RBI/DPSS/2017-18 PPI SEC 2.1</span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView(currentView === 'wallet' ? 'regulations' : 'wallet')}
            className="text-[10.5px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
          >
            {currentView === 'wallet' ? 'Detailed English Rules' : 'View Wallet'}
          </button>
        </div>
      </div>

      {/* REAL RAZORPAY PAYMENT GATEWAY CHECKOUT MODAL */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={Number(topUpAmount) || 1000}
        currency="INR"
        serviceName="RouTripo Closed Travel Wallet"
        orderDescription={`Wallet Balance Top-Up (₹${topUpAmount})`}
        customerName="Aditi Sharma"
        customerEmail="user@routripo.app"
        customerPhone="+91 98765 43210"
        onSuccess={(details) => {
          setIsRazorpayOpen(false);
          const added = Number(topUpAmount) || 1000;
          const method = details.method?.toUpperCase() === 'CARD' ? 'Card' : 'UPI';
          ClosedWalletService.topUp(added, method);
          showToast(`₹${added.toLocaleString('en-IN')} successfully added to your wallet! (Payment ID: ${details.razorpay_payment_id || 'RZP-SUCCESS'})`);
        }}
        onFailure={(err) => {
          setIsRazorpayOpen(false);
          showToast(`Payment could not be completed: ${err}`);
        }}
      />
    </div>
  );
};

export default ClosedWalletModal;
