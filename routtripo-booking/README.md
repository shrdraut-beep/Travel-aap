# RoutTripo — New Booking Modules

Ha folder tuझ्या existing app madhe **jasa's tasa drop** karायचा (paths tuझ्या project structure sobat adjust kar — bahutek `src/` under).

## Files
```
theme/tokens.ts                        → navy/gold tokens, existing theme sobat match
context/BookingFlowContext.tsx         → seats/meals/baggage/fare/passenger cha shared state
components/booking/HoldTimer.tsx       → "XX:XX Mins left" chip
components/booking/FarePlansSheet.tsx  → fare tier bottom sheet (Saver/Flexi/Corporate/UpFront)
components/booking/SeatSelection.tsx   → seat map screen
components/booking/MealSelection.tsx   → meal picker screen
components/booking/BaggageSelection.tsx→ extra baggage counters
components/booking/PolicyTable.tsx     → cancellation/date-change tab table
components/booking/PassengerForm.tsx   → traveller details form
components/booking/BillingAndFareBreakup.tsx → billing + fare summary + Continue
components/booking/ReviewDetailsModal.tsx    → final confirm-before-payment modal
```

## Wiring steps

1. **Wrap the booking stack** (from "flight selected" onward) in the provider — do this at the navigator level, NOT at app root, so search/results screens are untouched:
```tsx
<BookingFlowProvider>
  <SeatsMealsBaggageStack />
  <PassengerDetailsScreen />
</BookingFlowProvider>
```

2. **On "Book Now" tap** in your existing results screen, open `<FarePlansSheet />`. When user selects a fare, start the hold timer:
```tsx
dispatch({ type: 'START_HOLD', minutes: 15 });
```

3. **Seats → Meals → Baggage** are three tabs of one screen in the reference flow — reuse your existing tab/segment component if you have one; `SeatSelection`, `MealSelection`, `BaggageSelection` are built to sit inside separate tab panels of the same parent.

4. **PolicyTable** goes inside your existing Passenger Details page, under the "Flight" tab, below the flight summary card.

5. **PassengerForm** + **BillingAndFareBreakup** replace/extend whatever form fields already exist there — swap in your existing validation logic, these just handle layout + context writes.

6. **ReviewDetailsModal** opens on "Continue" tap from BillingAndFareBreakup. Its `onConfirm` should call:
```tsx
const payload = buildCheckoutPayload();
// pass payload into your EXISTING Razorpay/checkout function — no changes needed there
existingCheckout(payload);
```

## Nothing here touches
- Razorpay Route split logic
- PDF invoice / GST numbering
- CA reconciliation export
- JWT auth / security hardening
- Zod validation on the backend

All of that stays exactly as-is — these components only produce a `payload` object at the end that your existing checkout function already expects.
