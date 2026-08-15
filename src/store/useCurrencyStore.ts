import { create } from 'zustand';

export const CURRENCIES = {
  INR: { symbol: '₹', rate: 1 },
  USD: { symbol: '$', rate: 0.012 },
  EUR: { symbol: '€', rate: 0.011 },
  GBP: { symbol: '£', rate: 0.0094 },
  AED: { symbol: 'د.إ', rate: 0.044 }
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  convert: (amount: number) => { value: number; symbol: string; formatted: string };
  convertAndFormat: (amount: number) => string;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: 'INR',
  setCurrency: (currency) => set({ currency }),
  convert: (amount: number) => {
    const curr = CURRENCIES[get().currency];
    const value = amount * curr.rate;
    return {
      value,
      symbol: curr.symbol,
      formatted: `${curr.symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    };
  },
  convertAndFormat: (amount: number) => {
    const curr = CURRENCIES[get().currency];
    const value = amount * curr.rate;
    return `${curr.symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
}));
