/**
 * server/modules/travelport/routes.ts
 *
 * Extracted from server.ts (Phase 2 modularization — largest single group: 36 routes,
 * over a quarter of the original file). All 36 routes depend on nothing from server.ts
 * except `travelportService` (already its own service module), so this extraction has
 * no deps-injection object — just a plain Express `app` parameter.
 *
 * Route bodies moved verbatim — no logic changed.
 */

import type { Express } from "express";
import {
  travelportService,
  flightSearchAgent,
  flightPriceAgent,
  flightBookAgent,
  searchLodgingPipeline,
} from "../../services/travelport.service.ts";

export function registerTravelportRoutes(app: Express): void {

app.get("/api/travelport/status", async (req, res) => {
  const isConfigured = travelportService.isConfigured();
  if (!isConfigured) {
    return res.json({
      configured: false,
      message: "Travelport credentials not configured. Please set TRAVELPORT_CLIENT_ID and TRAVELPORT_CLIENT_SECRET."
    });
  }
  const testResult = await travelportService.testConnection();
  return res.json({
    configured: true,
    ...testResult
  });
});

app.post("/api/travelport/auth/token", async (req, res) => {
  try {
    const forceRefresh = req.body?.forceRefresh === true;
    const token = await travelportService.getAccessToken(forceRefresh);
      return res.status(200).json({
      message: "Travelport OAuth 2.0 Access Token generated/retrieved successfully"
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error?.message || "Failed to generate Travelport OAuth token"
    });
  }
});

app.post("/api/travelport/flights/search", async (req, res) => {
  try {
    const { origin, destination, departDate, returnDate, adults, children, infants, cabinClass } = req.body || {};
    const org = (origin || "BOM").trim().toUpperCase();
    const dst = (destination || "DEL").trim().toUpperCase();
    const date = departDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const agentResult = await flightSearchAgent.execute({
      origin: org,
      destination: dst,
      departDate: date,
      returnDate,
      adults: adults ? Number(adults) : 1,
      children: children ? Number(children) : 0,
      infants: infants ? Number(infants) : 0,
      cabinClass: cabinClass || 'Economy'
    });

    if (agentResult.success && agentResult.data) {
      return res.status(200).json({
        success: true,
        flights: agentResult.data.offers,
        totalFound: agentResult.data.totalFound,
        provider: agentResult.data.providerSummary.source,
        agentMetadata: {
          agent: agentResult.agentName,
          executionTimeMs: agentResult.executionTimeMs,
          stage: agentResult.stage
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: agentResult.error?.message || "Flight search could not be validated."
    });
  } catch (error: any) {
    console.error("[RTAIP Flight Search Error]:", error?.message || error);
    return res.status(500).json({
      success: false,
      flights: [],
      error: error?.message || "Flight search failed"
    });
  }
});


// Travelport Hotels Search API (v11/v12 Stays backed by RTAIP Lodging Pipeline)
app.post("/api/travelport/hotels/search", async (req, res) => {
  try {
    const { destination, location, city, searchQuery, checkIn, checkInDate, checkOut, checkOutDate, adults, children, rooms, currency } = req.body || {};
    const dest = (destination || location || city || searchQuery || req.query.destination || req.query.location || "Mumbai").toString().trim();
    const cIn = checkIn || checkInDate;
    const cOut = checkOut || checkOutDate;

    const pipelineResult = await searchLodgingPipeline({
      destination: dest,
      checkInDate: cIn,
      checkOutDate: cOut,
      adults: adults ? Number(adults) : 2,
      children: children ? Number(children) : 0,
      rooms: rooms ? Number(rooms) : 1,
      currency: currency || "INR"
    });

    if (pipelineResult.success && pipelineResult.data) {
      return res.status(200).json({
        success: true,
        hotels: pipelineResult.data.properties,
        results: pipelineResult.data.properties,
        stats: {
          deduplication: pipelineResult.data.deduplicationStats,
          rateComparison: pipelineResult.data.rateComparisonStats
        },
        source: "Travelport Stays & RTAIP Lodging Agents"
      });
    }

    return res.status(400).json({
      success: false,
      error: pipelineResult.error?.message || "Lodging search failed."
    });
  } catch (error: any) {
    console.error("[API Endpoint Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});


// Travelport Stays 11.33 / 12 Get Properties Detail API
// https://developer.travelport.com/apis/stays/11.33/search-and-details/getpropertiesdetail
app.get(["/api/travelport/hotels/properties/:propertyId", "/api/stays/:propertyId", "/api/hotels/:propertyId"], async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { checkInDate, checkOutDate, adults, currency } = req.query;
    const details = await travelportService.getPropertyDetails(propertyId, {
      checkInDate: checkInDate as string,
      checkOutDate: checkOutDate as string,
      adults: adults ? Number(adults) : 2,
      currency: (currency as string) || "INR"
    });
    return res.status(200).json({ success: true, details, results: details, source: "Travelport Stays API" });
  } catch (error: any) {
    console.error("[API Endpoint Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

// Travelport Hospitality Availability (Catalog Offerings)
app.post("/api/travelport/hospitality/catalogofferings", async (req, res) => {
  try {
    const data = await travelportService.catalogOfferingsHospitality(req.body);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality API Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

app.get("/api/travelport/hospitality/catalogofferings/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { pageNumber } = req.query;
    const data = await travelportService.getCatalogOfferingHospitalityById(identifier, pageNumber as string);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality API Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

// Travelport Hospitality Offer Rules & Pricing
app.post("/api/travelport/hospitality/offers/buildfromcatalogoffering", async (req, res) => {
  try {
    const { catalogOfferingIdentifier, specialInstruction, numberOfRooms } = req.body || {};
    const data = await travelportService.buildOfferFromCatalogOffering(catalogOfferingIdentifier, specialInstruction, numberOfRooms);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality Offer Rules Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

app.post("/api/travelport/hospitality/offers/buildfromrequest", async (req, res) => {
  try {
    const data = await travelportService.buildOfferFromHospitalityRequest(req.body);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality Offer Rules Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

app.post("/api/travelport/hospitality/offers/buildfromcatalogofferings", async (req, res) => {
  try {
    const data = await travelportService.buildOfferFromCatalogOfferingsHospitality(req.body);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality Offer Rules Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

// Travelport Hospitality Book & Reservations
app.post("/api/travelport/hospitality/reservations/build", async (req, res) => {
  try {
    const data = await travelportService.buildReservationHospitality(req.body, req.query);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality Build Reservation Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

app.post("/api/travelport/hospitality/reservations", async (req, res) => {
  try {
    const data = await travelportService.createReservationHospitality(req.body, req.query);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality Reservation Create Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

app.get("/api/travelport/hospitality/reservations/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const data = await travelportService.getReservationHospitality(identifier, req.query);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality Get Reservation Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

app.put("/api/travelport/hospitality/reservations/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const data = await travelportService.updateReservationHospitality(identifier, req.body, req.query);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality Update Reservation Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

app.put("/api/travelport/hospitality/reservations/:identifier/canceloffer", async (req, res) => {
  try {
    const { identifier } = req.params;
    const data = await travelportService.cancelReservationOfferHospitality(identifier, req.query as any);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality Cancel Reservation Offer Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

app.post("/api/travelport/hospitality/reservations/passive", async (req, res) => {
  try {
    const data = await travelportService.createPassiveReservationHospitality(req.body);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality Create Passive Reservation Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

app.put("/api/travelport/hospitality/reservations/:identifier/passive", async (req, res) => {
  try {
    const { identifier } = req.params;
    const data = await travelportService.addPassiveReservationHospitality(identifier, req.query as any);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality Add Passive Reservation Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});

app.put("/api/travelport/hospitality/reservations/:identifier/passiveupdate", async (req, res) => {
  try {
    const { identifier } = req.params;
    const data = await travelportService.updatePassiveReservationHospitality(identifier, req.query as any);
    return res.status(200).json({ success: true, data, source: "Travelport Hospitality API" });
  } catch (error: any) {
    console.error("[Hospitality Update Passive Reservation Error]:", error?.message || error);
    return res.status(500).json({ success: false, error: error?.message || "Internal server error" });
  }
});


// =========================================================================
// TRIPSERVICES WORKFLOW ENDPOINTS (STEPS A THROUGH T)
// =========================================================================

// STEP B: Flight Specific Search (FSLS) (Optional)
app.post("/api/travelport/flights/buildoptions", async (req, res) => {
  try {
    const { catalogOfferingId, flightCriteria } = req.body || {};
    const result = await travelportService.searchFlightSpecificOptions(catalogOfferingId, flightCriteria);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP C: Price Offer (RTAIP FlightPriceAgent)
app.post("/api/travelport/flights/price", async (req, res) => {
  try {
    const { offerId, flightOffer, passengerCount, adults, children, infants, selectedFareCode, fareDelta, selectedSeats, selectedBaggage, selectedMeals, catalogOfferingId, productIds } = req.body || {};

    const adt = adults ? Number(adults) : 1;
    const chd = children ? Number(children) : 0;
    const inf = infants ? Number(infants) : 0;
    const totalCount = passengerCount ? Number(passengerCount) : (adt + chd + inf);

    const priceResult = await flightPriceAgent.execute({
      offerId: offerId || catalogOfferingId || flightOffer?.id || 'tp-fl-offer',
      flightOffer: flightOffer || {
        id: offerId || catalogOfferingId || 'tp-fl-offer',
        airline: 'IndiGo',
        airlineCode: '6E',
        flightNumber: '6E-2045',
        origin: 'BOM',
        destination: 'DEL',
        departureTime: '06:00',
        arrivalTime: '08:15',
        duration: '135m',
        stops: 0,
        price: 4890,
        baseFare: 4200,
        taxAmount: 690,
        currency: 'INR',
        cabinClass: 'Economy',
        refundable: true,
        provider: 'Travelport TripServices',
        sourceType: 'GDS',
        baggageAllowance: '15kg Check-in',
        validationStatus: 'VERIFIED_GDS'
      },
      passengerCount: totalCount,
      adults: adt,
      children: chd,
      infants: inf,
      selectedFareCode,
      fareDelta: fareDelta ? Number(fareDelta) : 0,
      selectedSeats,
      selectedBaggage,
      selectedMeals
    });

    if (priceResult.success && priceResult.data) {
      return res.status(200).json({
        success: true,
        data: priceResult.data,
        pricing: priceResult.data,
        agentMetadata: {
          agent: priceResult.agentName,
          stage: priceResult.stage,
          executionTimeMs: priceResult.executionTimeMs
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: priceResult.error?.message || "Fare could not be priced."
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP C.1: Book Flight & Issue PNR (RTAIP FlightBookAgent)
app.post("/api/travelport/flights/book", async (req, res) => {
  try {
    const { priceToken, offerId, flightOffer, passengers, pricingBreakdown, paymentDetails } = req.body || {};

    const bookResult = await flightBookAgent.execute({
      priceToken: priceToken || `token_auto_${Date.now()}`,
      offerId: offerId || flightOffer?.id || 'fl-offer',
      flightOffer: flightOffer || {
        id: 'fl-offer',
        airline: 'IndiGo',
        airlineCode: '6E',
        flightNumber: '6E-2045',
        origin: 'BOM',
        destination: 'DEL',
        departureTime: '06:00',
        arrivalTime: '08:15',
        duration: '135m',
        stops: 0,
        price: 4890,
        baseFare: 4200,
        taxAmount: 690,
        currency: 'INR',
        cabinClass: 'Economy',
        refundable: true,
        provider: 'Travelport TripServices',
        sourceType: 'GDS',
        baggageAllowance: '15kg Check-in',
        validationStatus: 'VERIFIED_GDS'
      },
      passengers: passengers || [
        {
          firstName: 'Cara',
          lastName: 'Sharma',
          email: 'cara@routripo.app',
          phone: '9820012345',
          gender: 'Female'
        }
      ],
      pricingBreakdown: pricingBreakdown || {
        priceToken: 'token',
        expiresAt: new Date().toISOString(),
        offerId: 'offer',
        baseFare: 4200,
        fuelSurcharge: 600,
        airportFees: 420,
        gstTax: 240,
        ancillaryTotal: 0,
        fareDelta: 0,
        discount: 450,
        totalPayable: 5010,
        currency: 'INR',
        fareRules: { cancellationFee: 2500, dateChangeFee: 1500, isRefundable: true, freeCancellationHours: 24 },
        priceGuaranteed: true
      },
      paymentDetails: paymentDetails || {
        gateway: 'Razorpay',
        paymentId: `pay_test_${Date.now()}`,
        amount: 5010,
        currency: 'INR',
        status: 'PAID'
      }
    });

    if (bookResult.success && bookResult.data) {
      return res.status(200).json({
        success: true,
        data: bookResult.data,
        reservation: bookResult.data.reservation,
        pnr: bookResult.data.reservation.pnrCode,
        agentMetadata: {
          agent: bookResult.agentName,
          stage: bookResult.stage,
          executionTimeMs: bookResult.executionTimeMs
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: bookResult.error?.message || "Booking creation failed."
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP D: Standalone Fare Rules (Optional)
app.get("/api/travelport/flights/farerules", async (req, res) => {
  try {
    const { offerIdentifier, fareRuleType } = req.query;
    const rules = await travelportService.getFareRules(
      (offerIdentifier as string) || 'Offer_1G',
      (fareRuleType as any) || 'ShortText'
    );
    return res.status(200).json({ success: true, data: rules });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP E: Create New Workbench
app.post("/api/travelport/workbench/create", async (req, res) => {
  try {
    const { purpose } = req.body || {};
    const wb = await travelportService.createWorkbench(purpose || 'AirBooking');
    return res.status(200).json({ success: true, data: wb });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP F: Add Traveler/s
app.post("/api/travelport/workbench/:id/travelers", async (req, res) => {
  try {
    const { id } = req.params;
    const { travelers } = req.body || {};
    const result = await travelportService.addTravelers(id, travelers || []);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP G: Add Offer
app.post("/api/travelport/workbench/:id/offers", async (req, res) => {
  try {
    const { id } = req.params;
    const { catalogOfferingId, productOfferings } = req.body || {};
    const result = await travelportService.addOfferToWorkbench(id, catalogOfferingId, productOfferings);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP H: Seat Map (Optional)
app.post("/api/travelport/seats/seatmap", async (req, res) => {
  try {
    const { catalogOfferingId, flightNumber } = req.body || {};
    const seatMap = await travelportService.getSeatMap(catalogOfferingId, flightNumber);
    return res.status(200).json({ success: true, data: seatMap });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP I: Book Seat/s (Optional)
app.post("/api/travelport/workbench/:id/seats", async (req, res) => {
  try {
    const { id } = req.params;
    const { seats } = req.body || {};
    const result = await travelportService.bookSeats(id, seats || []);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP J: Commit Workbench; Create Reservation (Held Booking)
app.post("/api/travelport/workbench/:id/commit", async (req, res) => {
  try {
    const { id } = req.params;
    const { retentionDays } = req.body || {};
    const result = await travelportService.commitReservation(id, retentionDays ? Number(retentionDays) : 3);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP K & Q: Create Post-Commit Workbench
app.post("/api/travelport/workbench/postcommit", async (req, res) => {
  try {
    const { locator, pnr } = req.body || {};
    const pnrCode = locator || pnr;
    const result = await travelportService.createPostCommitWorkbench(pnrCode);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP L: Add Non-Traveler Remarks (Optional)
app.post("/api/travelport/workbench/:id/remarks", async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body || {};
    const result = await travelportService.addRemarks(id, remarks || []);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP M: Ancillary Shop (Optional)
app.post("/api/travelport/ancillaries/shop", async (req, res) => {
  try {
    const { flightCriteria } = req.body || {};
    const result = await travelportService.shopAncillaries(flightCriteria);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP N: Ancillary Price (Required for NDC Ancillaries)
app.post("/api/travelport/workbench/:id/ancillaries/price", async (req, res) => {
  try {
    const { id } = req.params;
    const { ancillaries } = req.body || {};
    const result = await travelportService.priceAncillary(id, ancillaries || []);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP O: Book Ancillary (Optional)
app.post("/api/travelport/workbench/:id/ancillaries/book", async (req, res) => {
  try {
    const { id } = req.params;
    const { ancillaries } = req.body || {};
    const result = await travelportService.bookAncillary(id, ancillaries || []);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP R: Form of Payment
app.post("/api/travelport/workbench/:id/fop", async (req, res) => {
  try {
    const { id } = req.params;
    const { payment } = req.body || {};
    const result = await travelportService.addFormOfPayment(id, payment);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP S: Payment for Air, Seats, and Ancillaries
app.post("/api/travelport/workbench/:id/payments", async (req, res) => {
  try {
    const { id } = req.params;
    const { payment } = req.body || {};
    const result = await travelportService.applyPayment(id, payment);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// STEP T: Commit Workbench; Issue Ticket/s & EMDs
app.post("/api/travelport/workbench/:id/ticket", async (req, res) => {
  try {
    const { id } = req.params;
    const { hasAncillaries } = req.body || {};
    const result = await travelportService.issueTicketsAndEMDs(id, hasAncillaries === true);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Internal server error" });
  }
});

// COMPLETE AUTOMATED WORKFLOW RUNNER (STEPS A -> T)
app.post("/api/travelport/workflow/execute", async (req, res) => {
  try {
    const input = req.body || {};
    const defaultSearch = {
      origin: input.flightSearch?.origin || 'BOM',
      destination: input.flightSearch?.destination || 'DEL',
      departDate: input.flightSearch?.departDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      adults: input.flightSearch?.adults ? Number(input.flightSearch.adults) : 1,
      cabinClass: input.flightSearch?.cabinClass || 'Economy'
    };

    const defaultTravelers = (input.travelers && input.travelers.length > 0) ? input.travelers : [
      {
        givenName: 'Sharad',
        surname: 'Raut',
        passengerTypeCode: 'ADT',
        gender: 'Male',
        birthDate: '1990-05-15',
        email: 'shrd.raut@gmail.com',
        telephone: '+919876543210'
      }
    ];

    const defaultPayment = input.payment || {
      type: 'CreditCard',
      cardNumber: '4111111111111111',
      cardHolderName: 'Sharad Raut',
      cardType: 'VI',
      expiryMonth: '12',
      expiryYear: '2028',
      amount: 5400,
      currency: 'INR'
    };

    const workflowResult = await travelportService.executeFullTripServicesWorkflow({
      flightSearch: defaultSearch,
      selectedOfferId: input.selectedOfferId,
      travelers: defaultTravelers,
      seats: input.seats || [
        { segmentSequence: 1, flightNumber: '6E-204', seatNumber: '2A', travelerIdentifier: 'Traveler_1', price: 350, currency: 'INR' }
      ],
      ancillaries: input.ancillaries || [
        { type: 'Meal', code: '0ML', travelerIdentifier: 'Traveler_1', price: 450, currency: 'INR' }
      ],
      remarks: input.remarks,
      payment: defaultPayment
    });

    return res.status(200).json(workflowResult);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to execute Travelport TripServices workflow"
    });
  }
});

}
