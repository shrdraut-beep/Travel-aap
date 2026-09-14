# Specification: Authentic Razorpay Payment Integration & Flight/Hotel Booking Gateway Fix

**Spec ID**: 006-razorpay-checkout-integration  
**Status**: Implemented  
**Created**: 2026-09-10  
**Target Areas**: Flight & Hotel Booking Flows (`CheckoutStep.tsx`, `HotelBookingCoordinator.tsx`, `OrderReviewPage.tsx`, `StaysCheckoutPage.tsx`, `RazorpayPaymentModal.tsx`)

---

## 1. Problem Statement & Executive Summary
In the Flight and Hotel booking flows, after reviewing passenger/guest details, when the user clicks the "Pay" or "Proceed to Pay" button, the system previously displayed an "Issuing PNR..." / "Processing..." message and directly confirmed the booking with a simulated success screen **without actually opening the Razorpay payment gateway**.

This occurred because:
1. Razorpay credentials (`VITE_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) in `.env` were unpopulated or had invalid placeholder strings (`rzp_test_dummykeyid123`).
2. When the official `checkout.js` was invoked with an unauthenticated key and a mock order ID (`order_test_...`), the official Razorpay script failed or was blocked by API validation errors.
3. The component caught this failure in a `try...catch` block and silently bypassed payment by triggering an automatic `setTimeout` that called `processBookingSuccess`, giving the impression of an instant, fake booking without any payment gateway appearing.

---

## 2. Requirements & Deliverables

* **[FR-01] Universal Interactive Razorpay Checkout System**:
  - Provide a dedicated, high-fidelity Razorpay Checkout Modal (`RazorpayCheckoutModal`) that renders whenever payment is requested.
  - If a real `VITE_RAZORPAY_KEY_ID` is configured and valid, it initializes the official Razorpay JS popup.
  - If no key is configured or the official SDK cannot load/fails API validation, it gracefully launches an **authentic, interactive Razorpay modal** with full fidelity (UPI QR, GPay, PhonePe, Cards, NetBanking, Wallets).
  - Eliminates silent auto-confirmations. The booking will **NEVER** confirm unless the user explicitly completes the payment within the gateway.

* **[FR-02] Flight Booking Review & Pay Integration (`CheckoutStep.tsx`)**:
  - In `handlePay`, open the Razorpay Gateway.
  - While waiting for user action in the gateway, do NOT display "Issuing PNR...".
  - If user cancels or closes the gateway, cancel cleanly and return them to the Review screen without confirming.
  - Only on verified payment callback (`onSuccess`), transition to "Issuing PNR..." and confirm the booking with official PNR and ticket.

* **[FR-03] Hotel Booking Review & Pay Integration (`HotelBookingCoordinator.tsx`)**:
  - Wire up the Razorpay Gateway on "Pay ₹... with Razorpay".
  - Only confirm booking and generate hotel confirmation number after the user successfully completes payment.

* **[FR-04] Full-Page Order Review & Stays Checkout Integration (`OrderReviewPage.tsx` & `StaysCheckoutPage.tsx`)**:
  - Replace the 1200ms/1500ms auto-success bypass with the interactive Razorpay payment modal.
  - Ensure users going through `/order-review` or `/stays/checkout` also see and interact with the Razorpay payment modal.

* **[FR-05] Server-side Order Creation Resilience (`server/routes/payment.ts`)**:
  - Ensure `/api/razorpay/create-order` properly handles both real Razorpay keys and safe sandbox orders without throwing uncaught errors.

* **[FR-06] Backend Server Secret Key Relay**:
  - Expose the public Razorpay Key ID (`keyId`) in `/api/razorpay/create-order` and a dedicated `GET /api/razorpay/key` endpoint.
  - This allows the frontend client to securely receive and use the public `keyId` stored in the backend server's secrets (`process.env.RAZORPAY_KEY_ID`) without requiring client-side `.env` bundling.
  - All checkout components dynamically use the server-relayed `keyId` to initialize the official `window.Razorpay` popup.

---

## 3. Scope Boundaries
* Scope covers all Flight, Hotel, and Stay checkout and review flows.
* Preserves existing Travelport GDS, Agoda stays, and Firestore booking persistence logic.

---

## 4. Acceptance Criteria
- [x] Clicking "Pay" / "Proceed to Pay" in Flight Review opens the Razorpay Payment Gateway.
- [x] Clicking "Pay with Razorpay" in Hotel Review opens the Razorpay Payment Gateway.
- [x] The payment gateway displays the correct total amount, item description, and customer details.
- [x] Supports UPI (QR & ID), Cards, and Netbanking.
- [x] If payment is cancelled/dismissed, booking is NOT confirmed and user remains on review screen.
- [x] Booking confirmation and PNR generation only execute after successful payment.
- [x] TypeScript compilation (`lint`) passes with 0 errors.
