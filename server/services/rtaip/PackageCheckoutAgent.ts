import type {
  Agent,
  AgentContext,
  AgentResponse,
  ValidationResult,
  PackageCheckoutInput,
  PackageCheckoutOutput,
  FlightPassenger
} from './types.js';
import { travelportService, type TravelportTraveler, type TravelportPaymentDetails } from '../travelport.js';

/**
 * Maps an RTAIP FlightPassenger to Travelport's TravelportTraveler shape.
 */
function toTravelportTraveler(p: FlightPassenger): TravelportTraveler {
  return {
    givenName: p.firstName,
    surname: p.lastName,
    passengerTypeCode: p.type || 'ADT',
    gender: p.gender === 'Other' ? 'Undisclosed' : p.gender,
    birthDate: p.dateOfBirth,
    email: p.email,
    telephone: p.phone,
    passportNumber: p.passportNumber,
  };
}

/**
 * The GDS ticketing payment is settled from RoutTripo's own agency deposit/wallet
 * account with Travelport (BSP-style settlement) — NOT a card. The customer already
 * paid RoutTripo via Razorpay; Travelport then deducts the fare from the agency's
 * account balance and issues the ticket. server/services/travelport.ts already
 * supports this: any payment.type other than 'CreditCard' is sent as
 * 'FormOfPaymentCash' with no card fields at all (see addFormOfPayment()).
 *
 * No card data, no env vars needed here — the wallet/deposit relationship is
 * configured on Travelport's side against RoutTripo's agency account, not per-request.
 */
function getAgencyPaymentMethod(amount: number, currency: string): TravelportPaymentDetails {
  return {
    type: 'AgentInvoice',
    amount,
    currency,
  };
}

/**
 * Minimal typed shape of Travelport's Hospitality "Create Reservation Reference Payload"
 * request, per their official API reference (support.travelport.com — Create Reservation
 * Reference Payload API Reference, POST /hotel/book/reservations/build). Only the fields
 * this agent actually sends are typed here — the real payload supports more optional
 * objects (ReservationComment, TravelAgency, CustomerLoyalty, etc.) not used yet.
 */
interface HospitalityReservationBuildRequest {
  ReservationQueryBuild: {
    '@type': 'ReservationQueryBuild';
    ReservationBuild: {
      '@type': 'ReservationBuildFromCatalogOffering';
      BuildFromCatalogOfferingHospitality: {
        '@type': 'BuildFromCatalogOfferingHospitality';
        CatalogOfferingIdentifier: { value: string };
      };
      Traveler: Array<{
        '@type': 'Traveler';
        PersonName: { Given: string; Surname: string; Prefix?: string };
        Telephone: Array<{ '@type': 'TelephoneDetail'; countryAccessCode?: string; areaCityCode?: string; phoneNumber: string; cityCode?: string }>;
        Email: Array<{ value: string }>;
      }>;
      FormOfPayment: Array<{
        '@type': 'FormOfPaymentPaymentCard';
        PaymentCard: {
          '@type': 'PaymentCardDetail';
          expireDate: string; // MMYY
          CardType: 'Credit' | 'Debit' | 'Gift';
          CardCode: string;
          CardHolderName: string;
          CardNumber: { '@type': 'CardNumber'; PlainText: string };
          SeriesCode?: { '@type': 'SeriesCode'; PlainText: string };
        };
      }>;
      Payment: Array<{
        '@type': 'Payment';
        Amount: { code: string; value: number };
        guaranteeInd: boolean;
        depositInd: boolean;
      }>;
    };
  };
}

/**
 * Confirmed by Travelport's own API reference (Modify Passive Reservation docs, which
 * state: "The response of a Create Reservation (Reference or Full Payload), Sync
 * Reservation, Modify/Add Reservation, Create/Modify Passive Reservation, Retrieve
 * Reservation, or Cancel Reservation endpoint. The structure detailed here is the same
 * for all of these API responses." — so this wrapper is authoritative for our Build
 * (Reference Payload) call too.
 */
interface HospitalityReservationResponse {
  ReservationResponse?: {
    reservationStatus?: 'Success' | 'Fail' | 'Partial' | 'Pending' | 'OnHold' | 'Retry' | 'Other';
    Result?: {
      status?: 'Not processed' | 'Incomplete' | 'Complete' | 'Unknown';
      Error?: Array<{ Message?: string; StatusCode?: number }>;
    };
    Reservation?: TravelportReservationShape;
  };
}

/** A Reservation object's shape, confirmed from Travelport's own retrieve/update/passive
 * reservation examples — Offer[], Traveler[], Payment[], Receipt[], TravelerProduct[]
 * all sit directly on this object (no extra "Confirmation" nesting inside Receipt). */
interface TravelportReservationShape {
  id?: string;
  Identifier?: { value?: string; authority?: string };
  Receipt?: Array<{ id?: string; ReceiptRef?: string; Identifier?: { value?: string } }>;
  TravelerProduct?: Array<{ ConfirmationStatusEnum?: string }>;
}

/** Fallback only: used if a response ever arrives without the expected ReservationResponse
 * wrapper (e.g. a proxy/mock quirk) — searches the tree for a Reservation-shaped object
 * rather than failing outright. The confirmed path above should be hit in normal operation. */
function findReservationShape(obj: any, depth = 0): TravelportReservationShape | undefined {
  if (!obj || typeof obj !== 'object' || depth > 6) return undefined;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findReservationShape(item, depth + 1);
      if (found) return found;
    }
    return undefined;
  }
  if (obj.Receipt || (obj.Identifier && obj.Offer)) {
    return obj as TravelportReservationShape;
  }
  for (const k of Object.keys(obj)) {
    const found = findReservationShape(obj[k], depth + 1);
    if (found) return found;
  }
  return undefined;
}

/**
 * Hotel guarantee/payment card — Travelport's Hospitality booking schema (unlike the air
 * workflow) has no documented cash/wallet form-of-payment option; FormOfPayment structurally
 * requires PaymentCard. In practice this is the agency's own virtual/lodge card (a business
 * instrument many travel agencies hold specifically for this), never the customer's card.
 * Returns null if not configured — callers must fall back to the honest pending status.
 */
function getAgencyHotelGuaranteeCard(): HospitalityReservationBuildRequest['ReservationQueryBuild']['ReservationBuild']['FormOfPayment'][number]['PaymentCard'] | null {
  const cardNumber = process.env.TRAVELPORT_AGENCY_HOTEL_CARD_NUMBER;
  const cardHolderName = process.env.TRAVELPORT_AGENCY_HOTEL_CARD_HOLDER;
  const cardCode = process.env.TRAVELPORT_AGENCY_HOTEL_CARD_CODE; // e.g. 'VI', 'CA'
  const expireDate = process.env.TRAVELPORT_AGENCY_HOTEL_CARD_EXPIRY; // MMYY
  const cvv = process.env.TRAVELPORT_AGENCY_HOTEL_CARD_CVV;

  if (!cardNumber || !cardHolderName || !cardCode || !expireDate) {
    return null;
  }

  return {
    '@type': 'PaymentCardDetail',
    expireDate,
    CardType: 'Credit',
    CardCode: cardCode,
    CardHolderName: cardHolderName,
    CardNumber: { '@type': 'CardNumber', PlainText: cardNumber },
    ...(cvv ? { SeriesCode: { '@type': 'SeriesCode' as const, PlainText: cvv } } : {}),
  };
}

/**
 * RTAIP Package Checkout Agent (Stage 4)
 * Coordinates multi-product bundle booking (Flight + Hotel + Experiences).
 * Strictly inherits:
 * 1. Strict passenger form validation (FirstName, LastName, Gender, DOB).
 * 2. 15-minute fare hold countdown timer limit.
 */
export class PackageCheckoutAgent implements Agent<PackageCheckoutInput, PackageCheckoutOutput> {
  public readonly name = 'RTAIP_PackageCheckoutAgent';
  public readonly stage = 'Checkout';

  public validate(input: PackageCheckoutInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. SESSION EXPIRATION CHECK (15-Minute Rule)
    if (!input.sessionStartedAt) {
      errors.push('Booking session start timestamp is required.');
    } else {
      const elapsedMs = Date.now() - input.sessionStartedAt;
      const MAX_HOLD_MS = 15 * 60 * 1000; // 15 minutes
      if (elapsedMs > MAX_HOLD_MS) {
        errors.push('Booking session has expired (15-minute limit reached). The live fare hold has been released. Please refresh rates.');
      }
    }

    // 2. PASSENGER DETAILS STRICT FORM VALIDATION
    if (!input.passengers || input.passengers.length === 0) {
      errors.push('At least one traveler detail is strictly required.');
    } else {
      input.passengers.forEach((p: FlightPassenger, idx: number) => {
        const pNum = idx + 1;
        if (!p.firstName || p.firstName.trim().length < 2) {
          errors.push(`Passenger ${pNum}: First name is required (min 2 characters).`);
        }
        if (!p.lastName || p.lastName.trim().length < 2) {
          errors.push(`Passenger ${pNum}: Last name is required (min 2 characters).`);
        }
        if (!p.gender || !['Male', 'Female', 'Other'].includes(p.gender)) {
          errors.push(`Passenger ${pNum}: Gender selection is strictly required.`);
        }
        if (!p.dateOfBirth || p.dateOfBirth.trim().length === 0) {
          errors.push(`Passenger ${pNum}: Date of birth is strictly required.`);
        } else {
          const dobDate = new Date(p.dateOfBirth);
          if (isNaN(dobDate.getTime())) {
            errors.push(`Passenger ${pNum}: Date of birth must be a valid date.`);
          }
        }
      });
    }

    // 3. LEAD CONTACT DETAILS
    if (!input.leadGuest) {
      errors.push('Lead contact details are required.');
    } else {
      if (!input.leadGuest.fullName || input.leadGuest.fullName.trim().length < 2) {
        errors.push('Lead contact full name is required.');
      }
      if (!input.leadGuest.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.leadGuest.email.trim())) {
        errors.push('A valid lead contact email address is required.');
      }
      const digitsOnly = (input.leadGuest.phone || '').replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        errors.push('A valid 10-digit mobile number is required.');
      }
    }

    // 4. PAYMENT VERIFICATION
    // `verified` is set ONLY by the route handler after it has independently confirmed
    // the payment with Razorpay (signature + live order status + amount match) — never
    // trust a bare paymentId string from the client, since that alone proves nothing.
    if (!input.paymentDetails || !input.paymentDetails.paymentId) {
      errors.push('Verified payment transaction ID is required.');
    } else if (input.paymentDetails.verified !== true) {
      errors.push('Payment has not been independently verified. Refusing to confirm booking.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  public async execute(
    input: PackageCheckoutInput,
    ctx?: Partial<AgentContext>
  ): Promise<AgentResponse<PackageCheckoutOutput>> {
    const startTime = Date.now();
    const traceId = ctx?.traceId || `trace_pkg_chk_${Date.now()}`;
    const validation = this.validate(input);

    if (!validation.valid) {
      const isExpired = validation.errors.some(e => e.includes('15-minute limit'));
      return {
        success: false,
        stage: this.stage,
        agentName: this.name,
        validation,
        executionTimeMs: Date.now() - startTime,
        error: {
          code: isExpired ? 'SESSION_EXPIRED' : 'VALIDATION_FAILED',
          message: validation.errors.join(' ')
        }
      };
    }

    try {
      const bookingRef = `PKG-${Date.now().toString(36).toUpperCase()}`;
      const leadName = input.leadGuest.fullName || `${input.passengers[0].firstName} ${input.passengers[0].lastName}`;
      const boundFlight = input.validatedPlan?.itinerary?.boundFlight;

      let flightPnr: string | undefined;
      let bookingStatus: PackageCheckoutOutput['status'] = 'PAYMENT_CONFIRMED_AWAITING_TICKETING';
      let message = `Payment verified and booking reference ${bookingRef} created. Your airline PNR and hotel confirmation will be issued shortly and sent to ${input.leadGuest.email} — this step is not yet automated.`;

      const agencyPayment = boundFlight
        ? getAgencyPaymentMethod(input.paymentDetails.amount, input.paymentDetails.currency || 'INR')
        : null;

      // Real ticketing is only attempted when we have a real bound GDS offer. Payment
      // settlement itself needs no per-request config (it draws from RoutTripo's
      // Travelport agency wallet), so the only gate here is having a real offer to book.
      if (boundFlight && agencyPayment) {
        try {
          const workflowResult = await travelportService.executeFullTripServicesWorkflow({
            flightSearch: {
              origin: boundFlight.origin,
              destination: boundFlight.destination,
              departDate: input.validatedPlan.itinerary.startDate,
              adults: input.passengers.length,
              cabinClass: boundFlight.cabinClass,
            },
            selectedOfferId: boundFlight.offerId,
            travelers: input.passengers.map(toTravelportTraveler),
            payment: agencyPayment,
          });

          if (workflowResult.success && workflowResult.pnr) {
            flightPnr = workflowResult.pnr;
            bookingStatus = 'CONFIRMED';
            message = `Booking confirmed! Flight PNR ${flightPnr} issued and dispatched to ${input.leadGuest.email}.`;
          } else {
            // Real attempt was made but the GDS didn't return a PNR — stay honest,
            // don't fabricate one. Payment is already verified, so surface this as
            // pending-ticketing rather than failing the whole checkout (money was
            // genuinely collected; ops needs to complete ticketing manually).
            message = `Payment verified and booking reference ${bookingRef} created. Automated ticketing did not complete (${workflowResult.steps?.find(s => s.status === 'FAILED')?.title || 'see workflow log'}) — our team will complete this manually and email ${input.leadGuest.email}.`;
          }
        } catch (bookingErr: any) {
          // Same principle: a failed real booking attempt must not become a fake success.
          message = `Payment verified and booking reference ${bookingRef} created. Automated ticketing failed (${bookingErr?.message || 'unknown error'}) — our team will complete this manually and email ${input.leadGuest.email}.`;
        }
      }

      // Hotel confirmation via buildReservationHospitality (Travelport's "Create Reservation
      // Reference Payload" endpoint — see HospitalityReservationBuildRequest above for the
      // schema source). Only attempted when the bound hotel has a real catalogOfferingId
      // (curated/fallback listings never have one — see LodgingAgents.ts) and the agency's
      // hotel guarantee card is configured.
      let hotelConfirmation: string | undefined;
      const boundHotel = input.validatedPlan?.itinerary?.boundHotel;
      const hotelCard = boundHotel?.catalogOfferingId ? getAgencyHotelGuaranteeCard() : null;

      if (boundHotel?.catalogOfferingId && hotelCard) {
        try {
          const leadPassenger = input.passengers[0];
          const hotelPayload: HospitalityReservationBuildRequest = {
            ReservationQueryBuild: {
              '@type': 'ReservationQueryBuild',
              ReservationBuild: {
                '@type': 'ReservationBuildFromCatalogOffering',
                BuildFromCatalogOfferingHospitality: {
                  '@type': 'BuildFromCatalogOfferingHospitality',
                  CatalogOfferingIdentifier: { value: boundHotel.catalogOfferingId },
                },
                Traveler: [{
                  '@type': 'Traveler',
                  PersonName: { Given: leadPassenger.firstName, Surname: leadPassenger.lastName },
                  Telephone: [{ '@type': 'TelephoneDetail', phoneNumber: input.leadGuest.phone.replace(/\D/g, '') }],
                  Email: [{ value: input.leadGuest.email }],
                }],
                FormOfPayment: [{ '@type': 'FormOfPaymentPaymentCard', PaymentCard: hotelCard }],
                Payment: [{
                  '@type': 'Payment',
                  Amount: { code: boundHotel.currency || 'INR', value: boundHotel.totalPrice },
                  guaranteeInd: true,
                  depositInd: false,
                }],
              },
            },
          };

          const hotelResp: HospitalityReservationResponse = await travelportService.buildReservationHospitality(hotelPayload);
          const reservationStatus = hotelResp?.ReservationResponse?.reservationStatus;
          const reservation = hotelResp?.ReservationResponse?.Reservation || findReservationShape(hotelResp);
          const receiptRef = reservation?.Receipt?.[0]?.ReceiptRef || reservation?.Receipt?.[0]?.id;
          const reservationRef = reservation?.id || reservation?.Identifier?.value;
          const errorMessage = hotelResp?.ReservationResponse?.Result?.Error?.[0]?.Message;

          if (reservationStatus === 'Success' && (receiptRef || reservationRef)) {
            hotelConfirmation = receiptRef || reservationRef;
          } else if (reservationStatus === 'Pending' || reservationStatus === 'OnHold') {
            message += ` Hotel reservation is ${reservationStatus.toLowerCase()} with the supplier — our team will confirm the final status and let you know.`;
          } else {
            message += ` Hotel booking did not complete automatically${errorMessage ? ` (${errorMessage})` : ''} — our team will confirm your stay manually.`;
          }
        } catch (hotelErr: any) {
          message += ` Hotel booking failed automatically (${hotelErr?.message || 'unknown error'}) — our team will confirm your stay manually.`;
        }
      }

      return {
        success: true,
        stage: this.stage,
        agentName: this.name,
        data: {
          bookingReference: bookingRef,
          flightPnr,
          hotelConfirmation,
          totalPaid: input.paymentDetails.amount,
          currency: input.paymentDetails.currency || 'INR',
          status: bookingStatus,
          ticketsIssuedAt: new Date().toISOString(),
          leadTraveler: leadName,
          message,
        },
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        stage: this.stage,
        agentName: this.name,
        executionTimeMs: Date.now() - startTime,
        error: {
          code: 'PACKAGE_CHECKOUT_FAILED',
          message: err.message || 'Failed to complete package booking'
        }
      };
    }
  }
}

export const packageCheckoutAgent = new PackageCheckoutAgent();
