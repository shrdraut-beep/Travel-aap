import { create } from 'zustand';
import { Coupon, ACTIVE_COUPONS } from '../services/CouponService';

interface CouponStoreState {
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (code: string, updatedFields: Partial<Coupon>) => void;
  deleteCoupon: (code: string) => void;
  resetCoupons: () => void;
}

const STORAGE_KEY = 'routripo_admin_coupons_v1';

const getInitialCoupons = (): Coupon[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load coupons from storage", e);
    }
  }
  return ACTIVE_COUPONS;
};

const saveCoupons = (coupons: Coupon[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
    } catch (e) {}
  }
};

export const useCouponStore = create<CouponStoreState>((set, get) => ({
  coupons: getInitialCoupons(),

  addCoupon: (newCoupon) => {
    const cleanCoupon: Coupon = {
      ...newCoupon,
      code: newCoupon.code.trim().toUpperCase()
    };
    const updated = [cleanCoupon, ...get().coupons.filter(c => c.code !== cleanCoupon.code)];
    set({ coupons: updated });
    saveCoupons(updated);
  },

  updateCoupon: (code, updatedFields) => {
    const updated = get().coupons.map(c => 
      c.code === code ? { ...c, ...updatedFields } : c
    );
    set({ coupons: updated });
    saveCoupons(updated);
  },

  deleteCoupon: (code) => {
    const updated = get().coupons.filter(c => c.code !== code);
    set({ coupons: updated });
    saveCoupons(updated);
  },

  resetCoupons: () => {
    set({ coupons: ACTIVE_COUPONS });
    saveCoupons(ACTIVE_COUPONS);
  }
}));
