import { create } from 'zustand';
import { Offer, OfferCategory } from '../types';

interface OfferStoreState {
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => void;
  updateOffer: (id: string, updatedFields: Partial<Offer>) => void;
  toggleOfferActive: (id: string) => void;
  deleteOffer: (id: string) => void;
  resetOffers: () => void;
}

const DEFAULT_OFFERS: Offer[] = [];

const STORAGE_KEY = 'routripo_active_offers_v1';

const getInitialOffers = (): Offer[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error loading offers from storage:", e);
  }
  return DEFAULT_OFFERS;
};

export const useOfferStore = create<OfferStoreState>((set, get) => ({
  offers: getInitialOffers(),

  addOffer: (newOffer) => {
    const created: Offer = {
      ...newOffer,
      id: `offer-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [created, ...get().offers];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    set({ offers: updated });
  },

  updateOffer: (id, updatedFields) => {
    const updated = get().offers.map(o => o.id === id ? { ...o, ...updatedFields } : o);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    set({ offers: updated });
  },

  toggleOfferActive: (id) => {
    const updated = get().offers.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    set({ offers: updated });
  },

  deleteOffer: (id) => {
    const updated = get().offers.filter(o => o.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    set({ offers: updated });
  },

  resetOffers: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_OFFERS));
    } catch (e) {}
    set({ offers: DEFAULT_OFFERS });
  }
}));
