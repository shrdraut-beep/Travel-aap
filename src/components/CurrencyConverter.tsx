import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

const RATES: Record<string, number> = {
  "USD": 83.5,
  "EUR": 91.2,
  "GBP": 106.5,
  "AED": 22.7,
  "THB": 2.3,
  "JPY": 0.55,
  "SGD": 62.1,
  "OMR": 216.5,
  "KWD": 272.1,
};

interface CurrencyConverterProps {
  lang: string;
  defaultCurrency?: string;
  onSetDefault?: (currency: string) => void;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ lang, defaultCurrency = "INR", onSetDefault }) => {
  const [amount, setAmount] = useState<string>("100");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("INR");
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    const val = parseFloat(amount);
    if (isNaN(val)) {
      setResult(0);
      return;
    }

    // Conversion logic
    let inrVal = fromCurrency === "INR" ? val : val * (RATES[fromCurrency] || 1);
    let finalVal = toCurrency === "INR" ? inrVal : inrVal / (RATES[toCurrency] || 1);
    setResult(finalVal);
  }, [amount, fromCurrency, toCurrency]);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          <h3 className="text-lg font-black uppercase tracking-tight">
            {lang === 'mr' ? 'चलन परिवर्तक' : 'Currency Converter'}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-rose-500/20 rounded-full">
           <span className="text-sm font-black text-cyan-400 uppercase tracking-widest">{defaultCurrency}</span>
           <CheckCircle2 className="w-3 h-3 text-cyan-400" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-2">
          <div className="space-y-1">
            <label className="text-sm font-black text-premium-violet-soft uppercase tracking-widest">{lang === 'mr' ? 'येथून' : 'From'}</label>
            <select 
              value={fromCurrency} 
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full bg-rose-900 border border-slate-700 rounded-[16px] px-2 py-2 text-sm font-bold focus:ring-1 focus:ring-rose-400 outline-none cursor-pointer"
            >
              <option value="INR">INR (₹)</option>
              {Object.keys(RATES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button 
            onClick={swap}
            className="mb-1 p-2 bg-rose-900 hover:bg-cyan-500 hover:text-slate-950 rounded-full transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <div className="space-y-1">
            <label className="text-sm font-black text-premium-violet-soft uppercase tracking-widest">{lang === 'mr' ? 'येथे' : 'To'}</label>
            <select 
              value={toCurrency} 
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full bg-rose-900 border border-slate-700 rounded-[16px] px-2 py-2 text-sm font-bold focus:ring-1 focus:ring-rose-400 outline-none cursor-pointer"
            >
              <option value="INR">INR (₹)</option>
              {Object.keys(RATES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-black text-premium-violet-soft uppercase tracking-widest">{lang === 'mr' ? 'रक्कम' : lang === 'hi' ? 'राशि' : 'Amount'}</label>
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-rose-900 border border-slate-700 rounded-[16px] px-6 py-4 text-xl font-mono font-black text-cyan-400 focus:ring-2 focus:ring-rose-400 outline-none"
          />
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-sm font-black text-premium-violet uppercase tracking-widest mb-1">{lang === 'mr' ? 'निकाल' : lang === 'hi' ? 'परिवर्तित राशि' : 'Converted Result'}</p>
            <p className="text-4xl font-mono font-black text-white">
              {toCurrency === 'INR' ? '₹' : ''}{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(result)} {toCurrency}
            </p>
          </div>
          
          {onSetDefault && (
            <button 
              onClick={() => onSetDefault(toCurrency)}
              className="px-3 py-1.5 bg-rose-900 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-black uppercase tracking-widest transition-colors cursor-pointer"
            >
              {lang === 'mr' ? 'डीफॉल्ट करा' : lang === 'hi' ? 'डिफ़ॉल्ट सेट करें' : 'Set Default'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
