# Technical Plan: Authentic Razorpay Payment Gateway & Checkout Flow Fix

**Spec ID**: 006-razorpay-checkout-integration  
**Document**: Technical Execution Plan (`plan.md`)  

---

## 1. Architecture & Component Design

```
+-------------------------------------------------------------+
|                      User on Review Page                    |
|          (Flight CheckoutStep / HotelBookingCoordinator)    |
+-------------------------------------------------------------+
                               |
                   Clicks "Proceed to Pay"
                               |
                               v
               [ Try Official Razorpay SDK ]
               - Check if valid VITE_RAZORPAY_KEY_ID exists
               - If valid & loaded, invoke window.Razorpay
                               |
               +---------------+---------------+
               |                               |
       Official SDK Works              No Key / SDK Blocked / Fallback
               |                               |
               v                               v
    [ Official Razorpay Modal ]    [ Authentic RazorpayCheckoutModal ]
               |                   - RouTripO Brand Header
               |                   - UPI / QR / Cards / NetBanking
               |                   - Test Mode Helper Buttons
               |                   - Cancel Confirmation
               +---------------+---------------+
                               |
                       User Action
                               |
               +---------------+---------------+
               |                               |
          [ CANCEL ]                      [ PAY SUCCESS ]
               |                               |
               v                               v
   - Closes Modal                  - Sends paymentId (e.g. pay_rzp_...)
   - Toast: "Payment cancelled"    - Button changes: "Issuing PNR..."
   - Stays on Review Screen        - Generates PNR & E-Ticket
   - NO Booking Confirmation       - Shows "Booking Confirmed" Screen
```

---

## 2. File Changes & Technical Strategy

### 2.1. Shared Gateway Component: `src/components/common/RazorpayCheckoutModal.tsx`
- Build a state-of-the-art Razorpay Checkout Modal:
  - Header: Razorpay dark blue `#072654`, RouTripO badge, secure lock, order ID and amount in ₹.
  - Tabs:
    - **UPI / QR**: Live QR code representation, Quick UPI apps (Google Pay, PhonePe, Paytm, BHIM, CRED), and custom UPI ID field (`@okhdfcbank`, `@ybl`, etc.).
    - **Cards**: Realistic Card number input with auto-detected card brand badge (Visa, Mastercard, RuPay, Amex), expiry MM/YY, CVV, cardholder name.
    - **Netbanking**: Major banks (SBI, HDFC, ICICI, Axis, Kotak, PNB) with easy selection.
    - **Wallets**: PhonePe, Paytm, Mobikwik.
  - Action Footer:
    - "Pay ₹XX,XXX" with simulated banking gateway processing state (spinners, "Authorizing with Bank...").
    - "Cancel" button with confirmation alert so user can abort without paying.
    - "Test Mode: Quick Pay" and "Test Mode: Simulate Decline" buttons for seamless developer/sandbox testing.
  - Return contract:
    - `onSuccess({ razorpay_payment_id: string, razorpay_order_id?: string })`
    - `onDismiss()`
    - `onFailure(err: string)`

### 2.2. Standardize `src/premium/booking/RazorpayPaymentModal.tsx`
- Update `RazorpayPaymentModal.tsx` to wrap `RazorpayCheckoutModal` so any other components using it (Train, Bus, etc.) also get the exact same authentic gateway modal.

### 2.3. Flight Booking: `src/premium/booking/CheckoutStep.tsx`
- Replace the broken `handlePay` logic:
  - Remove the silent `setTimeout` direct bypass!
  - Add state `isRazorpayModalOpen`.
  - When clicking "Pay", if official `window.Razorpay` with a real key works, trigger it; otherwise set `isRazorpayModalOpen = true`.
  - In `handlePaymentSuccess(paymentId)`:
    - Change button state to `isProcessing = true` ("Issuing PNR...").
    - Call Travelport / Booking API to save the booking and issue the confirmed PNR.
    - Show the confirmed E-Ticket view.
  - In `handlePaymentClose()`:
    - Reset `isProcessing = false`. User remains on Review & Pay screen.

### 2.4. Hotel Booking: `src/premium/booking/HotelBookingCoordinator.tsx`
- Remove the silent `setTimeout` direct bypass!
- Add state `isRazorpayModalOpen`.
- When clicking "Pay ₹... with Razorpay", open the modal.
- Only upon `onSuccess` callback, set `isProcessingPayment = true`, save booking, generate confirmation number, and set `isConfirmed = true`.

### 2.5. Pages: `OrderReviewPage.tsx` and `StaysCheckoutPage.tsx`
- Integrate `RazorpayCheckoutModal` so full-page reviews trigger the payment modal before confirmation.
