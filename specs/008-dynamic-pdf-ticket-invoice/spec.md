# Feature Specification: Dynamic PDF Ticket & Tax Invoice Engine

**Feature ID**: `008-dynamic-pdf-ticket-invoice`  
**Status**: Draft / In Implementation  
**Created**: September 19, 2026  
**Authors**: Antigravity AI Agent & Team  

---

## 1. Executive Summary & Problem Statement

Users require official, print-ready, high-fidelity A4 **E-Tickets / Vouchers** and **Tax Invoices** for all four travel verticals facilitated by RoutTripo:
1. **FLIGHT**: Airline, PNR, Flight No, Departure/Arrival Airports & Terminals, Travellers, Seats, Baggage, Boarding Barcode.
2. **HOTEL**: Hotel Name, Address, Room Type, Meal Plan, Check-In/Check-Out Dates & Times, Guests, Inclusions, Check-In Barcode.
3. **BUS**: Bus Operator, Bus Model/Type, Boarding Point & Time, Dropping Point & Time, Seat Numbers, Travellers, Boarding Barcode.
4. **CAR / CAB**: Vehicle Model, Vehicle Class, Trip Type (Outstation/Local/Airport), Pickup & Drop Locations & Times, Inclusions (KM package, Toll/Taxes), Lead Passenger, Driver info, Verification Barcode.

### Critical Directives:
1. **Exact Visual Fidelity**: Follow the exact layout, typography, colored logo, barcode SVG, QR code SVG, stamp, and authorized signature specified by the user's reference design.
2. **Zero Hardcoded Data**: 100% of data (Brand details, customer info, ticket itinerary, passenger lists, itemized fare breakdown, GST computation, amount in words, dynamic policies, and bank details) must be sourced dynamically through backend APIs.
3. **Multi-Format Access**: Support both direct client-side PDF download (`.pdf`), server-rendered standalone HTML (`/api/documents/ticket/:id/html` and `/api/documents/invoice/:id/html`), and client UI integration on all checkout and booking confirmation views.

---

## 2. Functional Requirements

### 2.1 Dynamic Data Contract (`BookingDocumentData`)
The data contract must contain:
- `brand`: Company legal entity, PAN, GSTIN, CIN, registered address, support phones, email, bank details, UPI ID, authorized signatory name.
- `booking_type`: `'FLIGHT' | 'HOTEL' | 'BUS' | 'CAR'`.
- `customer`: Customer full name, address, phone, email.
- `ticket`:
  - `booking_id`: RoutTripo unique booking reference.
  - `status`: Booking status (e.g., `CONFIRMED`).
  - `pnr`: Airline PNR, Hotel Confirmation Code, Bus PNR, or Cab Trip ID.
  - `operator_support`: Supplier support contact (Airline, Hotel front desk, Bus operator, Fleet helpline).
  - `service_details`: Vertical-specific metadata (flight departure/arrival, hotel check-in/out, bus points, car route).
  - `items`: List of travellers, guests, or passengers with seats, rooms, baggage, and individual barcodes.
  - `important_information`: Array of vertical-specific statutory and travel guidelines.
- `invoice`:
  - `no`: Sequential invoice number (e.g., `RTP-INV-YYMMDD-XXXX`).
  - `date`: Invoice issue date.
  - `service_provider`: Supplier entity name (Airline/Hotel/Operator/Platform).
  - `amounts`: Base fare, ancillary fees, net service fee, CGST (9%), SGST (9%), IGST (18%), total payable, and `words` (amount in words in Indian currency notation).
  - `certified_terms`: Standard statutory declarations.
- `dynamic_policies`: Vertical-specific cancellation, rescheduling, and jurisdiction policies.

### 2.2 Template & Visual Requirements
- **Color Logo**:
  - `Rou` in `#e3000f`
  - `T` in `#ffffff` enclosed in a `#f92a35` pill with 6px border-radius
  - `ripo` in `#ed2893`
- **Barcodes**: Inline SVG barcode with code caption beneath.
- **QR Code**: Inline SVG QR code encoding UPI payment string (`upi://pay?pa=...`) or Ticket verification URL.
- **Stamp & Signature**:
  - Double-bordered circular stamp rotated -15deg: `ROUTRIPO (OPC) PVT.LTD NASHIK`
  - Cursive signature: `Sharad Chandar Raut` with `Authorized Signatory For ROUTRIPO (OPC) PVT.LTD`.
- **A4 Layout**: Fixed margins, clean table borders, zero overflow, high contrast text for official submission to corporate expense systems and airport security.

---

## 3. Scope Boundaries

- **In Scope**:
  - Server-side document builder & normalizer for Flight, Hotel, Bus, and Car.
  - Indian currency amount to words converter (`convertNumberToIndianWords`).
  - Express API routes for data retrieval, HTML rendering, and PDF streaming.
  - Frontend `DocumentService` for downloading PDF tickets and PDF invoices.
  - Integration with `TicketSuccess.tsx` and `PaymentStatusScreen.tsx`.
- **Out of Scope**:
  - Physical thermal receipt printer drivers.
  - Direct SMS MMS binary attachments (links sent instead).
