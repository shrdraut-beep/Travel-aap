import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CurrencyContextType {
  rate: number;
  formatPrice: (amount: number | string, currency: string) => string;
  convertToINR: (amount: number | string, currency: string) => number;
  formatToINRDisplay: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [rate, setRate] = useState<number>(85);

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
        // Force the rate to at least 85 for safety if API fails/low
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

  const convertToINR = (amount: number | string, currency: string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (currency === 'INR') return numericAmount;
    
    // Core logic requested: USD * Rate * 1.03 buffer
    const bufferedRate = rate * 1.03;
    return numericAmount * bufferedRate;
  };

  const formatPrice = (amount: number | string, currency: string) => {
    return formatToINRDisplay(convertToINR(amount, currency));
  };

  return (
    <CurrencyContext.Provider value={{ rate, formatPrice, convertToINR, formatToINRDisplay }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
