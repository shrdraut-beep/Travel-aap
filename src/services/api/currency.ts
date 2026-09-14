export const fetchCurrencyRate = async (from: string, to: string = 'INR'): Promise<number | null> => {
  if (from === to) return 1;
  
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.rates[to] || null;
  } catch (error) {
    console.warn('Frankfurter API notice:', error);
    return null;
  }
};
