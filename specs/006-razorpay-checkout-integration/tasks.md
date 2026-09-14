# Task Checklist: Authentic Razorpay Payment Integration

**Spec ID**: 006-razorpay-checkout-integration  
**Document**: Actionable Task Checklist (`tasks.md`)

---

## Tasks

- [x] **Task 1: Create `RazorpayCheckoutModal` Component**
  - Path: `src/components/common/RazorpayCheckoutModal.tsx`
  - Features: Razorpay theme, UPI (QR code + UPI IDs), Cards (with brand logos), Netbanking (major Indian banks), Wallets.
  - Interactive payment confirmation & cancel protection.
  - Real Razorpay SDK fallback handling.

- [x] **Task 2: Standardize `RazorpayPaymentModal`**
  - Path: `src/premium/booking/RazorpayPaymentModal.tsx`
  - Use `RazorpayCheckoutModal` as the unified core.

- [x] **Task 3: Fix Flight Booking Flow in `CheckoutStep.tsx`**
  - Path: `src/premium/booking/CheckoutStep.tsx`
  - Remove silent `setTimeout` bypass.
  - Open Razorpay Modal when user clicks "Pay".
  - Trigger "Issuing PNR..." and confirm booking ONLY after user completes payment.
  - Preserve review screen if payment is cancelled or failed.

- [x] **Task 4: Fix Hotel Booking Flow in `HotelBookingCoordinator.tsx`**
  - Path: `src/premium/booking/HotelBookingCoordinator.tsx`
  - Remove silent `setTimeout` bypass.
  - Open Razorpay Modal when user clicks "Pay with Razorpay".
  - Confirm booking and generate hotel confirmation number ONLY after successful payment.

- [x] **Task 5: Fix Order Review & Stays Pages**
  - Path: `src/pages/OrderReviewPage.tsx`
  - Path: `src/pages/StaysCheckoutPage.tsx`
  - Path: `src/pages/CheckoutPage.tsx`
  - Path: `src/components/booking/BookingFlowModal.tsx`
  - Connect Razorpay checkout modal across all secondary review and checkout screens.

- [x] **Task 6: Verification & Testing**
  - Run `npm run lint` (`tsc --noEmit`) to verify 0 errors.
  - Test Flight review and Hotel review payment triggers.
  - Ensure booking cannot be confirmed without payment.
