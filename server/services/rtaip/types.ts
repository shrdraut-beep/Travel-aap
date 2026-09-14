/**
 * RTAIP (RoutTripo AI Platform) Core Types & Interfaces
 * Inspired by TelivityAI/otaip domain-specific travel orchestration.
 */

export interface AgentContext {
  traceId: string;
  stage: 'Search' | 'Price' | 'Book' | 'Ticket' | 'Deduplicate' | 'Compare';
  userId?: string;
  correlationId?: string;
  timestamp: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface AgentResponse<TOutput> {
  success: boolean;
  data?: TOutput;
  stage: string;
  agentName: string;
  validation?: ValidationResult;
  executionTimeMs: number;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
  };
}

export interface Agent<TInput, TOutput> {
  readonly name: string;
  readonly stage: string;
  validate(input: TInput): ValidationResult;
  execute(input: TInput, ctx?: Partial<AgentContext>): Promise<AgentResponse<TOutput>>;
}

// -------------------------------------------------------------
// FLIGHT AGENT CONTRACTS
// -------------------------------------------------------------

export interface FlightSearchInput {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  cabinClass?: 'Economy' | 'PremiumEconomy' | 'Business' | 'First';
  carrierPreference?: string;
}

export interface FlightSegment {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  aircraft?: string;
  baggage?: string;
}

export interface RTAIPFlightOffer {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  baseFare: number;
  taxAmount: number;
  currency: string;
  cabinClass: string;
  refundable: boolean;
  provider: string;
  sourceType: 'GDS' | 'NDC' | 'Aggregator';
  fareBasisCode?: string;
  baggageAllowance: string;
  segments?: FlightSegment[];
  validationStatus: 'VERIFIED_GDS' | 'GUARANTEED';
}

export interface FlightSearchOutput {
  offers: RTAIPFlightOffer[];
  totalFound: number;
  origin: string;
  destination: string;
  departDate: string;
  currency: string;
  searchId: string;
  providerSummary: {
    gdsAvailable: boolean;
    ndcAvailable: boolean;
    source: string;
  };
}

export interface FlightPriceInput {
  offerId: string;
  flightOffer: RTAIPFlightOffer;
  passengerCount: number;
  adults?: number;
  children?: number;
  infants?: number;
  selectedFareCode?: string;
  fareDelta?: number;
  selectedSeats?: Array<{ seatNumber: string; price: number }>;
  selectedBaggage?: Array<{ code: string; price: number; qty: number }>;
  selectedMeals?: Array<{ code: string; price: number; qty: number }>;
}

export interface FlightPriceOutput {
  priceToken: string;
  expiresAt: string;
  offerId: string;
  baseFare: number;
  fuelSurcharge: number;
  airportFees: number;
  gstTax: number;
  ancillaryTotal: number;
  fareDelta: number;
  discount: number;
  totalPayable: number;
  currency: string;
  fareRules: {
    cancellationFee: number;
    dateChangeFee: number;
    isRefundable: boolean;
    freeCancellationHours: number;
  };
  priceGuaranteed: boolean;
}

export interface FlightPassenger {
  title?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  passportNumber?: string;
  type?: 'ADT' | 'CHD' | 'INF';
}

export interface FlightBookInput {
  priceToken: string;
  offerId: string;
  flightOffer: RTAIPFlightOffer;
  passengers: FlightPassenger[];
  pricingBreakdown: FlightPriceOutput;
  paymentDetails: {
    gateway: 'Razorpay' | 'Card' | 'Test';
    paymentId: string;
    orderId?: string;
    amount: number;
    currency: string;
    status: 'PAID' | 'AUTHORIZED';
  };
}

export interface FlightReservation {
  bookingReference: string;
  pnrCode: string;
  airlinePnr: string;
  gdsLocator: string;
  ticketNumbers: string[];
  status: 'CONFIRMED' | 'ISSUED';
  bookedAt: string;
  totalAmountPaid: number;
  currency: string;
  leadPassenger: string;
  leadEmail: string;
  flightSummary: {
    airline: string;
    flightNo: string;
    route: string;
    departure: string;
    arrival: string;
  };
}

export interface FlightBookOutput {
  reservation: FlightReservation;
  eTicketUrl: string;
  invoiceNumber: string;
  message: string;
}

// -------------------------------------------------------------
// LODGING / HOTEL AGENT CONTRACTS
// -------------------------------------------------------------

export interface LodgingSearchInput {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  rooms?: number;
  children?: number;
  minRating?: number;
  currency?: string;
}

export interface RoomRate {
  id: string;
  name: string;
  bed: string;
  price: number;
  currency: string;
  desc?: string;
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  provider: string;
  /** Real Travelport CatalogOfferingIdentifier.value for this room/rate — required to
   * actually book it. Undefined for curated/non-Travelport listings, which are display-only
   * and must never be passed to a real booking call. */
  catalogOfferingId?: string;
}

export interface RateComparisonItem {
  provider: string;
  pricePerNight: number;
  currency: string;
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  isLowest: boolean;
  savingsPercentage: number;
}

export interface LodgingProperty {
  id: string;
  normalizedId: string;
  name: string;
  canonicalName: string;
  rating: number;
  location: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distance?: string;
  image: string;
  images: string[];
  amenities: string[];
  pricePerNight: number;
  currency: string;
  freeCancellation: boolean;
  breakfastIncluded?: boolean;
  rooms: RoomRate[];
  rateComparisons?: RateComparisonItem[];
  sources: string[];
  dedupConfidence?: number;
  bestRateGuarantee?: boolean;
  /** Travelport PropertyKey fields, needed to fetch a real bookable offer via
   * getHotelCatalogOfferingId() at binding time. Undefined for curated/non-Travelport
   * listings — those can never be bound to a real offer. */
  chainCode?: string;
  hotelCode?: string;
}

export interface LodgingSearchOutput {
  properties: LodgingProperty[];
  totalFound: number;
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  searchId: string;
}

export interface PropertyDeduplicationInput {
  properties: LodgingProperty[];
  similarityThreshold?: number;
}

export interface PropertyDeduplicationOutput {
  deduplicatedProperties: LodgingProperty[];
  rawCount: number;
  mergedCount: number;
  duplicatesFound: number;
}

export interface RateComparisonInput {
  properties: LodgingProperty[];
  targetCurrency?: string;
}

export interface RateComparisonOutput {
  analyzedProperties: LodgingProperty[];
  bestDealsCount: number;
  averageSavingsPercent: number;
}

export interface LodgingBookInput {
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomsCount: number;
  leadGuest: {
    fullName: string;
    email: string;
    phone: string;
    specialRequest?: string;
  };
  pricing: {
    baseRate: number;
    taxes: number;
    grandTotal: number;
    currency: string;
  };
  payment: {
    gateway: 'Razorpay' | 'Test';
    paymentId: string;
    orderId?: string;
    status: 'PAID';
  };
}

export interface LodgingBookOutput {
  confirmationNumber: string;
  voucherNumber: string;
  hotelCode: string;
  propertyName: string;
  roomName: string;
  status: 'CONFIRMED';
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  totalPaid: number;
  currency: string;
  receiptUrl: string;
  message: string;
}

// -------------------------------------------------------------
// AI TRIP MANAGER & ITINERARY BINDING CONTRACTS (RTAIP STAGE 2 - 4)
// -------------------------------------------------------------

export interface BoundFlightDetails {
  offerId: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  cabinClass: string;
  baggageAllowance: string;
  isGdsVerified: boolean;
  refundable: boolean;
}

export interface BoundHotelDetails {
  propertyId: string;
  name: string;
  roomId: string;
  roomName: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  rating: number;
  address: string;
  image: string;
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  isGdsVerified: boolean;
  /** Real Travelport CatalogOfferingIdentifier.value, carried through from RoomRate.
   * Undefined means this hotel came from a curated/fallback listing, not live Travelport
   * inventory — real booking must not be attempted for it. */
  catalogOfferingId?: string;
}

export interface BoundDayActivity {
  id: string;
  timeSlot: string; // e.g. "09:00 - 11:30"
  startTime24h: string; // e.g. "09:00"
  endTime24h: string; // e.g. "11:30"
  title: string;
  description: string;
  location?: string;
  category: 'transit' | 'checkin' | 'sightseeing' | 'meal' | 'leisure' | 'checkout';
  isAutoAdjusted?: boolean;
}

export interface BoundDayPlan {
  day: number;
  date: string;
  dayTitle: string;
  description: string;
  keyPlaces: string[];
  foodSpecialty: string;
  activities: BoundDayActivity[];
  stayDetails?: {
    hotelName: string;
    roomType: string;
    ratePerNight: number;
  };
}

export interface BoundItinerary {
  id: string;
  tripTitle: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalTravelers: number;
  transportMode: 'flight' | 'train' | 'car' | 'bus';
  
  // Real GDS / Live bound inventory
  boundFlight?: BoundFlightDetails;
  boundReturnFlight?: BoundFlightDetails;
  boundHotel?: BoundHotelDetails;
  
  // Live Pricing & Fare Lock
  livePricing: {
    transportCost: number;
    hotelCost: number;
    estimatedFoodCost: number;
    estimatedActivitiesCost: number;
    totalPayable: number;
    currency: string;
    isGuaranteed: boolean;
    fareHoldExpiresAt: number; // timestamp (15 minutes window)
  };
  
  itinerary: BoundDayPlan[];
  weatherPackingTips?: string;
  isLiveInventoryBound: boolean;
  boundAt: string;
}

export interface TimelineDrift {
  type: 'FLIGHT_ARRIVAL_OVERLAP' | 'HOTEL_CHECKIN_COLLISION' | 'DEPARTURE_RUSH' | 'INSUFFICIENT_BUFFER';
  day: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  conflictingItem: string;
  conflictTime: string;
  resolutionTime: string;
}

export interface TimelineAdjustment {
  day: number;
  action: 'SHIFT' | 'INSERT' | 'SPLIT' | 'REPLACE';
  previousSlot: string;
  adjustedSlot: string;
  description: string;
}

export interface ValidatedTripPlan {
  itinerary: BoundItinerary;
  isValid: boolean;
  driftDetected: boolean;
  drifts: TimelineDrift[];
  adjustments: TimelineAdjustment[];
  validationSummary: {
    flightAligned: boolean;
    hotelAligned: boolean;
    activitiesPaced: boolean;
    bufferMinutesTotal: number;
  };
}

export interface ItineraryBindingInput {
  origin: string;
  destination: string;
  startDate: string;
  days: number;
  adults: number;
  transportMode: 'flight' | 'train' | 'car' | 'bus';
  budget?: number;
  lang?: 'en' | 'mr';
  rawItinerary: any; // The Gemini-generated response object
}

export interface ItineraryBindingOutput {
  boundItinerary: BoundItinerary;
  bindingTimestamp: number;
  offersComparedCount: number;
  holdExpiresAt: number;
}

export interface TimelineValidationInput {
  boundItinerary: BoundItinerary;
  minimumTransitBufferMinutes?: number; // default 60 mins from airport to activity/hotel
}

export interface TimelineValidationOutput {
  validatedPlan: ValidatedTripPlan;
  adjustmentsCount: number;
}

export interface PackageCheckoutInput {
  itineraryId: string;
  validatedPlan: ValidatedTripPlan;
  passengers: FlightPassenger[];
  leadGuest: {
    fullName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  sessionToken: string;
  sessionStartedAt: number; // to enforce the 15-minute countdown limit
  paymentDetails: {
    gateway: 'Razorpay' | 'Test';
    paymentId: string;
    orderId?: string;
    amount: number;
    currency: string;
    status: 'PAID';
    /** Set ONLY by the route handler after independently verifying with Razorpay
     * (signature + live order status + amount match). Never set this from client input. */
    verified: boolean;
  };
}

export interface PackageCheckoutOutput {
  bookingReference: string;
  flightPnr?: string;
  hotelConfirmation?: string;
  totalPaid: number;
  currency: string;
  /** 'CONFIRMED' means a real GDS/PMS ticket exists. 'PAYMENT_CONFIRMED_AWAITING_TICKETING'
   * means payment is verified but no real airline/hotel reservation has been made yet —
   * see PackageCheckoutAgent's execute() for why. Never surface 'CONFIRMED' to a customer
   * unless flightPnr/hotelConfirmation came from a real Travelport response. */
  status: 'CONFIRMED' | 'PAYMENT_CONFIRMED_AWAITING_TICKETING';
  ticketsIssuedAt: string;
  leadTraveler: string;
  message: string;
}

