# Tasks: Dynamic PDF Ticket & Tax Invoice Engine

**Feature ID**: `008-dynamic-pdf-ticket-invoice`  

- [x] **Task 1: Server Document Template Engine (`server/services/documentTemplateEngine.ts`)**
  - [x] Implement Indian currency words converter `convertNumberToIndianWords(num)`.
  - [x] Implement inline SVG generator for Barcode and QR Code.
  - [x] Implement `buildDynamicDocumentData(bookingId, vertical, rawBooking)` supporting FLIGHT, HOTEL, BUS, CAR.
  - [x] Implement `renderTicketHTML(data)` with the exact styled layout, colored logo, and vertical-specific cards.
  - [x] Implement `renderInvoiceHTML(data)` with the exact tax table, GST breakup, bank details, stamp, and signature.
- [x] **Task 2: Server Document API Routes (`server/routes/documents.ts` & `server.ts`)**
  - [x] Implement `POST /api/documents/data` and `GET /api/documents/data/:bookingId`.
  - [x] Implement `GET /api/documents/ticket/:bookingId/html` and `GET /api/documents/invoice/:bookingId/html`.
  - [x] Implement `POST /api/documents/render-html`.
  - [x] Wire router into `server.ts`.
- [x] **Task 3: Client Document Service (`src/services/DocumentService.ts`)**
  - [x] Implement API client to fetch dynamic document data.
  - [x] Implement high-fidelity PDF generator via `html2pdf.js` / `jsPDF` for tickets and invoices.
  - [x] Support direct download and preview in new window.
- [x] **Task 4: UI Integration Across Verticals**
  - [x] Update `TicketSuccess.tsx` with dual "Download E-Ticket PDF" and "Download Tax Invoice PDF" actions.
  - [x] Update `PaymentStatusScreen.tsx` (Hotel/Stays/Cabs/Buses) with download buttons.
- [x] **Task 5: Verification & Quality Assurance**
  - [x] Verify API responses for FLIGHT, HOTEL, BUS, CAR.
  - [x] Verify TypeScript compilation with 0 errors.
  - [x] Verify visual output against user reference screenshots.
