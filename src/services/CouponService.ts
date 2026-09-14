export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number; // e.g. 10 for 10%, or 300 for ₹300
  maxDiscount?: number; // For percentage coupons
  minAmount: number;
  vertical: 'flight' | 'hotel' | 'all';
  badge?: string;
  expiryDate?: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  code: string;
  discount: number;
  message: string;
  coupon?: Coupon;
}

export const ACTIVE_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    title: '10% Instant Discount',
    description: 'Get 10% off up to ₹500 on your first booking with RoutTripo',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 500,
    minAmount: 1500,
    vertical: 'all',
    badge: 'POPULAR'
  },
  {
    code: 'ROUTRIPO',
    title: 'Flat ₹300 Special Savings',
    description: 'Special platform discount on all travel bookings above ₹2,000',
    discountType: 'flat',
    discountValue: 300,
    minAmount: 2000,
    vertical: 'all',
    badge: 'FLAT OFF'
  },
  {
    code: 'FLYHIGH',
    title: 'Flight Saver ₹600 OFF',
    description: 'Exclusive airline discount for flights with fare above ₹4,500',
    discountType: 'flat',
    discountValue: 600,
    minAmount: 4500,
    vertical: 'flight',
    badge: 'AIRLINE SPECIAL'
  },
  {
    code: 'STAYSAVE',
    title: 'Hotel Luxury 12% OFF',
    description: 'Save 12% up to ₹800 on verified star hotels and resorts',
    discountType: 'percentage',
    discountValue: 12,
    maxDiscount: 800,
    minAmount: 2500,
    vertical: 'hotel',
    badge: 'HOTEL EXCLUSIVE'
  },
  {
    code: 'UPI150',
    title: 'Instant ₹150 UPI Discount',
    description: 'Flat ₹150 off on digital checkout via UPI or Net Banking',
    discountType: 'flat',
    discountValue: 150,
    minAmount: 1200,
    vertical: 'all',
    badge: 'DIGITAL PAY'
  },
  {
    code: 'FIRSTFLY',
    title: 'First Flight ₹400 OFF',
    description: 'Save flat ₹400 on domestic airline bookings across India',
    discountType: 'flat',
    discountValue: 400,
    minAmount: 3000,
    vertical: 'flight',
    badge: 'FIRST RIDE'
  }
];

export class CouponService {
  private static getAllCoupons(): Coupon[] {
    try {
      const stored = localStorage.getItem('routripo_admin_coupons_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return ACTIVE_COUPONS;
  }

  /**
   * Returns list of valid coupons for the given vertical & amount
   */
  static getAvailableCoupons(vertical: 'flight' | 'hotel', currentAmount: number): Coupon[] {
    const allCoupons = this.getAllCoupons();
    return allCoupons.filter(coupon => {
      if (coupon.vertical !== 'all' && coupon.vertical !== vertical) {
        return false;
      }
      return true;
    });
  }

  /**
   * Validates a coupon code against current booking amount and vertical
   */
  static validateCoupon(code: string, currentAmount: number, vertical: 'flight' | 'hotel'): CouponValidationResult {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return {
        isValid: false,
        code: cleanCode,
        discount: 0,
        message: 'Please enter a coupon code.'
      };
    }

    const allCoupons = this.getAllCoupons();
    const coupon = allCoupons.find(c => c.code === cleanCode);
    if (!coupon) {
      return {
        isValid: false,
        code: cleanCode,
        discount: 0,
        message: `Invalid coupon "${cleanCode}". Please check available offers below.`
      };
    }

    if (coupon.vertical !== 'all' && coupon.vertical !== vertical) {
      return {
        isValid: false,
        code: cleanCode,
        discount: 0,
        message: `Coupon "${cleanCode}" is only applicable on ${coupon.vertical} bookings.`
      };
    }

    if (currentAmount < coupon.minAmount) {
      return {
        isValid: false,
        code: cleanCode,
        discount: 0,
        message: `Coupon requires a minimum booking amount of ₹${coupon.minAmount.toLocaleString('en-IN')}. (Current: ₹${currentAmount.toLocaleString('en-IN')})`
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      const calculated = Math.round((currentAmount * coupon.discountValue) / 100);
      discount = coupon.maxDiscount ? Math.min(calculated, coupon.maxDiscount) : calculated;
    } else {
      discount = coupon.discountValue;
    }

    // Ensure discount never exceeds total amount
    discount = Math.min(discount, currentAmount);

    return {
      isValid: true,
      code: cleanCode,
      discount,
      message: `Coupon "${cleanCode}" applied successfully! You saved ₹${discount.toLocaleString('en-IN')}.`,
      coupon
    };
  }
}
