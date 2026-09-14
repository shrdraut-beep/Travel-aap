import React, { useState, useEffect } from 'react';
import { RefreshCw, IndianRupee } from 'lucide-react';
import { fetchCurrencyRate } from '../services/api/currency';

interface CurrencyWidgetProps {
  currencyCode: string; // e.g., 'USD', 'EUR'
  lang: string;
}

export const CurrencyWidget: React.FC<CurrencyWidgetProps> = ({ currencyCode, lang }) => {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currencyCode === 'INR' || currencyCode === '₹') return;

    const fetchRate = async () => {
      setLoading(true);
      // Map currency symbols back to codes if needed, simple assumption:
      let code = currencyCode;
      if (code === '$') code = 'USD';
      else if (code === '€') code = 'EUR';
      else if (code === '£') code = 'GBP';
      else if (code === 'A$') code = 'AUD';
      else if (code === 'C$') code = 'CAD';
      else if (code === '¥') code = 'JPY';
      
      const res = await fetchCurrencyRate(code, 'INR');
      setRate(res);
      setLoading(false);
    };

    fetchRate();
  }, [currencyCode]);

  if (currencyCode === 'INR' || currencyCode === '₹') return null;

  return (
    <div className="bg-premium-sky-soft border border-premium-sky-deep rounded-[20px] p-3 flex items-center justify-between shadow-sm mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-premium-sky-soft text-premium-sky-deep rounded-[16px]">
          <IndianRupee className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-premium-sky-deep uppercase tracking-wider">
            {lang === 'mr' ? 'थेट विनिमय दर' : 'Live Exchange Rate'}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-800">1 {currencyCode}</span>
            <span className="text-slate-400 font-bold">=</span>
            {loading ? (
              <RefreshCw className="w-3 h-3 animate-spin text-premium-sky-deep" />
            ) : (
              <span className="text-sm font-black text-premium-sky-deep">₹{rate ? rate.toFixed(2) : '--'}</span>
            )}
          </div>
        </div>
      </div>
      <div className="text-[9px] font-bold text-premium-sky-deep uppercase tracking-widest text-right">
        Frankfurter API<br/>{lang === 'mr' ? 'अपडेट केले' : 'Updated Now'}
      </div>
    </div>
  );
};
