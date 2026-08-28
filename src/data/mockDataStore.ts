export interface MockCoupon { 
  code: string; 
  type: 'flat' | 'percentage'; 
  value?: number; 
  discount?: number; 
  minAmount?: number; 
  maxDiscount?: number; 
}
export const mockCoupons: MockCoupon[] = [];
export const validateCouponCode = (code: string, amount?: number): any => {
  return { valid: false, error: "Invalid coupon" };
};
export const mockFlights: any[] = [];
export const mockHotels: any[] = [];
export const mockTrains: any[] = [];
export const mockCars: any[] = [];
export const mockCabs: any[] = [];
export const mockBuses: any[] = [];
export const mockPackages: any[] = [];
