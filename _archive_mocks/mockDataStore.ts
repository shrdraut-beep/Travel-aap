export interface MockCoupon {
  code: string;
  type: 'flat' | 'percent';
  discount: number;
  maxDiscount?: number;
  minAmount: number;
}

export const mockFlights = [];
export const mockHotels = [];
export const mockTrains = [];
export const mockCars = [];
export const mockCabs = [];
export const mockBuses = [];
export const mockPackages = [];
export const mockCoupons: MockCoupon[] = [];

export const validateCouponCode = (code: string, amount: number): { valid: boolean; coupon: MockCoupon | null; discountAmount: number; error: string | null } => {
  return { valid: false, coupon: null, discountAmount: 0, error: 'Invalid coupon' };
};

export async function fetchMockFlights() { return []; }
export async function fetchMockHotels() { return []; }
export async function fetchMockTrains() { return []; }
export async function fetchMockCars() { return []; }
export async function fetchMockCabs() { return []; }
export async function fetchMockBuses() { return []; }
export async function fetchMockHolidayPackages() { return []; }
export async function fetchMockCoupons() { return []; }
