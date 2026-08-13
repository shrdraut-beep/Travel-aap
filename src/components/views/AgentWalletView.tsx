import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { authedFetch } from '../../utils/apiClient';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const AgentWalletView = () => {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [addAmount, setAddAmount] = useState<string>('');

  useEffect(() => {
    fetchBalance();
    loadRazorpayScript();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await authedFetch('/api/wallet/balance');
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error("Failed to fetch balance", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsAddingFunds(true);

    try {
      // 1. Create order on backend
      const resOrder = await authedFetch('/api/wallet/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const order = await resOrder.json();

      if (!resOrder.ok) throw new Error("Could not create order");

      // 2. Initialize Razorpay Checkout
      const options = {
        key: 'rzp_test_dummykeyid123', // Same as backend
        amount: order.amount,
        currency: order.currency,
        name: 'Routripo B2B Agent Portal',
        description: 'Add Funds to Closed Wallet',
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify payment on backend
          try {
            const verifyRes = await authedFetch('/api/wallet/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: amount
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              alert("Payment successful! Funds added to wallet.");
              setAddAmount('');
              fetchBalance();
            } else {
              alert("Payment verification failed: " + verifyData.error);
            }
          } catch (e) {
            console.error(e);
            alert("Error verifying payment.");
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#4f46e5" // indigo-600
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert("Payment Failed. Reason: " + response.error.description);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Error initializing payment gateway.");
    } finally {
      setIsAddingFunds(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Balance Card */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Wallet className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 space-y-2">
          <h2 className="text-slate-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Closed Wallet Balance
          </h2>
          <div className="text-5xl font-black text-white">
            {isLoading ? (
              <Loader2 className="w-10 h-10 animate-spin text-slate-500" />
            ) : (
              `₹${balance.toLocaleString('en-IN')}`
            )}
          </div>
          <p className="text-slate-400 text-xs font-medium max-w-sm mt-2">
            Funds can be used for booking tickets or purchasing ad space. Bank withdrawals are restricted as per RBI closed-wallet guidelines.
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 flex flex-col gap-3 min-w-[300px]">
          <label className="text-xs font-bold text-slate-300 uppercase">Amount to Add (INR)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
            <input 
              type="number" 
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              placeholder="e.g., 5000"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-8 pr-4 text-white font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button 
            onClick={handleAddMoney}
            disabled={isAddingFunds || isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingFunds ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Proceed to Payment
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Recent Transactions
        </h3>
        
        <div className="py-8 text-center text-slate-400 font-medium">
          <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-600">No recent transactions</p>
          <p className="text-xs text-slate-400 mt-1">Wallet recharges and booking deductions will appear here.</p>
        </div>
      </div>
      
    </div>
  );
};
