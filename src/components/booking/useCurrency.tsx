import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  rate: number;
  formatPrice: (amount: number | string, currency?: string) => string;
  convertToINR: (amount: number | string, currency?: string) => number;
  formatToINRDisplay: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<string>('INR');
  const [rate, setRate] = useState<number>(85);

  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem('userCurrency', c);
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem('userCurrency');
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const cached = localStorage.getItem('exchangeRate');
        const timestamp = localStorage.getItem('exchangeRateTimestamp');
        const now = Date.now();

        if (cached && timestamp && (now - parseInt(timestamp) < 86400000)) {
          setRate(parseFloat(cached));
          return;
        }

        const response = await fetch('/api/config/exchange-rate');
        const data = await response.json();
        const newRate = data.rate || 85;
        
        localStorage.setItem('exchangeRate', newRate.toString());
        localStorage.setItem('exchangeRateTimestamp', now.toString());
        setRate(newRate);
      } catch (e) {
        console.error('Failed to fetch/cache exchange rate', e);
        setRate(85); // Fallback
      }
    };
    fetchRate();
  }, []);

  const formatToINRDisplay = (amount: number) => {
    return `₹${Math.ceil(amount)}`;
  };

  const convertToINR = (amount: number | string, cur: string = currency) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (cur === 'INR') return numericAmount;
    
    // Core logic requested: USD * Rate * 1.03 buffer
    const bufferedRate = rate * 1.03;
    return numericAmount * bufferedRate;
  };

  const formatPrice = (amount: number | string, cur: string = currency) => {
    return formatToINRDisplay(convertToINR(amount, cur));
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate, formatPrice, convertToINR, formatToINRDisplay }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};

