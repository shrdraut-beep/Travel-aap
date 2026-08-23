import { useState, useEffect } from 'react';

// Cache to prevent repetitive API calls
const exchangeRateCache: Record<string, number> = {};
const pendingRequests: Record<string, Promise<number>> = {};

export const fetchINRConversionRate = async (baseCurrency: string): Promise<number> => {
  if (baseCurrency === 'INR') return 1;
  
  const cacheKey = `${baseCurrency}-INR`;
  if (exchangeRateCache[cacheKey]) {
    return exchangeRateCache[cacheKey];
  }

  // Deduplicate simultaneous requests
  if (pendingRequests[cacheKey]) {
    return pendingRequests[cacheKey];
  }

  pendingRequests[cacheKey] = (async () => {
    try {
      // Use our backend proxy to avoid browser network restrictions/CORS
      const response = await fetch(`/api/currency/rates?base=${baseCurrency}&to=INR`);
      
      if (!response.ok) {
        console.warn(`Currency API returned ${response.status}`);
        return 1;
      }
      
      // Safety check for content type before parsing JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        
        // v2 API format returns { date, base, quote, rate }
        let rate = 1;
        if (data.rate) {
          rate = data.rate;
        } else if (data.rates && data.rates.INR) {
          // Fallback for v1 or different format if any
          rate = data.rates.INR;
        }
        
        exchangeRateCache[cacheKey] = rate;
        return rate;
      } else {
        const text = await response.text();
        console.warn(`Currency API returned non-JSON: ${text.substring(0, 50)}`);
        return 1;
      }
    } catch (error) {
      console.error(`Failed to fetch exchange rate for ${baseCurrency} to INR`, error);
      return 1; // Fallback
    } finally {
      delete pendingRequests[cacheKey];
    }
  })();

  return pendingRequests[cacheKey];
};

export const convertToINR = async (amount: string | number, baseCurrency: string): Promise<number> => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return 0;
  
  const rate = await fetchINRConversionRate(baseCurrency);
  return Math.ceil(numericAmount * rate);
};

// React Hook for easy UI integration
export const useINRConversion = (amount: string | number | undefined, baseCurrency: string | undefined) => {
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const convert = async () => {
      setIsLoading(true);
      if (amount === undefined || amount === null || baseCurrency === undefined) {
        setConvertedAmount(null);
        setIsLoading(false);
        return;
      }

      const result = await convertToINR(amount, baseCurrency);
      
      if (isMounted) {
        setConvertedAmount(result);
        setIsLoading(false);
      }
    };

    convert();

    return () => {
      isMounted = false;
    };
  }, [amount, baseCurrency]);

  return { 
    convertedAmount, 
    isLoading,
    formattedINR: convertedAmount !== null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(convertedAmount) : '...'
  };
};

export const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
