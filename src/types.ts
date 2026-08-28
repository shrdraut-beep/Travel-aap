export type Category = 'food' | 'traveling' | 'other' | 'personal' | 'restaurant' | 'tips' | 'transport' | 'fuel' | 'fun' | 'highway' | 'hotels' | (string & {});

export interface Member {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  totalDeposited: number;
  familyName?: string; // Optional family group name
  phone?: string; // WhatsApp/Phone number
  upiId?: string; // UPI ID for payments (VPA)
}

export interface MasterContact {
  id: string;
  name: string;
  phone?: string;
  upiId?: string;
  avatar?: string;
  color?: string;
}

export interface Stage {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface WeatherCondition {
  date: string;
  condition: string;
  temp: number;
  location: string;
  icon?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: Category;
  paidBy: string; // Member ID
  splitWith: string[]; // Array of Member IDs
  scannedFromImage?: boolean;
  stageId?: string; // ID of the journey stage
  receiptImage?: string; // URL of the receipt image
  isSynced?: boolean; // Offline-first sync status
}

export interface Deposit {
  id: string;
  memberId: string; // Member ID
  amount: number;
  date: string;
  note?: string;
  isSynced?: boolean; // Offline-first sync status
}

export interface TripPlan {
  id: string;
  type: 'ticket' | 'hotel' | 'activity' | 'note' | 'other';
  title: string;
  detail: string;
  datetime: string; // ISO or date-time string
  cost?: number;
  bookingRef?: string;
  notified?: boolean;
  location?: { lat: number; lng: number; name?: string };
  // UI Enhancement Fields
  exactLocation?: string;
  realisticCost?: string;
  travelTime?: string;
  briefDescription?: string;
  imageUrl?: string;
}

export interface PackingItem {
  id: string;
  name: string;
  isChecked: boolean;
  category?: string;
  essential?: boolean;
}

export interface PackingCategory {
  id: string;
  name: string;
  items: PackingItem[];
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // Member IDs
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: string;
  isOpen: boolean;
}

export interface MemberLocation {
  memberId: string;
  lat: number;
  lng: number;
  lastUpdated: string;
  isSharing: boolean;
}

export type CalculationMode = 'admin_pooled' | 'individual_split';

export type TransportMode = 'road' | 'air' | 'rail' | 'sea' | 'other';

export interface ItinerarySlot {
  time: string;
  activity: string;
  location?: string;
  cost?: number;
}

export interface ItineraryDay {
  day: number;
  date?: string;
  slots: {
    morning: ItinerarySlot[];
    afternoon: ItinerarySlot[];
    evening: ItinerarySlot[];
  };
}

export interface StructuredItinerary {
  days: ItineraryDay[];
  transportPlan: string;
  estimatedTotalCost: number;
  budgetAnalysis: {
    status: 'fits' | 'tight' | 'exceeded';
    analysis: string;
    suggestions: string[];
  };
}

export interface ProactiveSuggestion {
  id: string;
  type: 'budget' | 'weather' | 'itinerary' | 'other';
  title: string;
  message: string;
  actionLabel?: string;
  actionData?: any; // Data to be applied (e.g. new TripPlan)
}

export interface PublicTripTemplate {
  id: string;
  name: string;
  description: string;
  days: number;
  transportMode: TransportMode;
  itinerary: TripPlan[];
  aiPlan?: string;
  tags: string[];
  authorName: string;
  authorId: string;
  clonesCount: number;
  createdAt: string;
}

export interface TripGroup {
  id: string;
  name: string;
  source?: string;
  destination?: string;
  startDate: string;
  endDate: string;
  members: Member[];
  expenses: Expense[];
  budget?: Record<string, number>;
  deposits: Deposit[];
  itinerary: TripPlan[];
  packingList?: PackingItem[]; // Legacy
  detailedPackingList?: PackingCategory[];
  polls?: Poll[];
  memberLocations?: MemberLocation[];
  logoUrl?: string;
  wallpaperUrl?: string;
  tripType?: 'friends' | 'family';
  transportMode?: TransportMode;
  pnrNumber?: string;
  webCheckInLink?: string;
  calculationMode: CalculationMode;
  adminId?: string;
  userEmail?: string;
  userId?: string;
  aiPlan?: string;
  stages?: Stage[];
  weatherForecast?: WeatherCondition[];
  totalBudget?: number; // Overall trip budget
  defaultCurrency?: string; // Default currency for the trip (e.g. INR)
  themeColor?: string; // Hex color for the trip theme
  memories?: TripMemory[];
  gallery?: TripMemory[]; // Shared Trip Gallery
  playlist?: PlaylistItem[]; // Collaborative Trip Playlist
  sosAlerts?: SOSAlert[]; // Emergency SOS alerts
  /**
   * @deprecated Shared-trip passcodes now live in `trip_secrets/{tripId}`, which no
   * client can read. Never write this back to the trip document - security rules
   * reject any trip payload containing it. Retained only so legacy local records
   * still type-check while they are migrated on first write.
   */
  passcode?: string;
  /** Uids allowed to write to a shared trip. Maintained solely by the backend. */
  memberUids?: string[];
  status?: 'PLANNED' | 'ACTIVE' | 'SETTLED' | 'COMPLETED'; // Definitive status of the trip
  savedTickets?: SavedTicket[]; // Saved Tickets & PNR Numbers
  isSynced?: boolean; // Offline-first sync status
  friends?: { id: string, name: string }[];
  documents?: { id: string, name: string }[];
}

export interface SavedTicket {
  id: string;
  type: 'Flight' | 'Train' | 'Hotel' | 'Other';
  pnr: string;
  notes?: string;
  addedBy?: string;
  timestamp?: string;
}

export interface SOSAlert {
  id: string;
  memberId: string;
  memberName: string;
  lat: number;
  lng: number;
  timestamp: string;
  isResolved: boolean;
}

export interface PlaylistItem {
  id: string;
  title: string;
  url?: string;
  addedBy: string;
  timestamp?: string;
  artist?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  image?: string;
}

export interface ScanResponse {
  amount: number;
  category: Category;
  title: string;
  payerNameSuggestion?: string;
  date?: string;
  confidence: number;
  extractedItems?: { name: string; amount: number }[];
}

export interface TripMemory {
  id: string;
  imageUrl: string;
  timestamp: string;
  caption?: string;
}

export interface DialogConfig {
  isOpen: boolean;
  type: 'confirm' | 'prompt' | 'alert';
  title: string;
  message: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value?: string) => void;
  onCancel?: () => void;
}

export type OfferCategory = 'Banner' | 'Bank Offers' | 'Flights' | 'Hotels' | 'Cabs' | 'Flagship Store' | 'Pocket Friendly' | 'All';

export type OfferTabContext = 'all' | 'hub' | 'all-trips' | 'planning' | 'booking' | 'social' | 'expenses';

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  category: OfferCategory;
  targetTab?: OfferTabContext; // Target tab: 'all' | 'hub' | 'all-trips' | 'planning' | 'booking' | 'social' | 'expenses'
  couponCode?: string;
  discountBadge?: string; // e.g. "Up to 20% OFF", "UNDER ₹999", "FLAT ₹1,500 OFF"
  priceTag?: string; // e.g. "UNDER ₹999"
  validTill?: string;
  targetLink?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

// ==========================================
// Reverse Bidding & Secure Ecosystem Schemas
// ==========================================

export type TripBidStatus = 'OPEN' | 'IN_REVIEW' | 'CONFIRMED' | 'EXPIRED' | 'PENDING_VENDOR_CONFIRMATION' | 'CANCELLED';
export type EscrowStatus = 'PENDING' | 'HELD' | 'STAGE1_STARTED' | 'STAGE_1_RELEASED' | 'COMPLETED_RELEASED' | 'FULLY_RELEASED' | 'REFUNDED';
export type BiddingCategory = 'Hotels' | 'Cabs' | 'Packages';
export type BidOfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVISION_REQUESTED' | 'EXPIRED';

export interface TripBidRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  paxCount: number;
  tripCategory: BiddingCategory;
  requestedInclusions?: string[];
  vehicleClass?: string;
  propertyType?: string;
  mealPlan?: string;
  tripTheme?: string;
  stayQuality?: string;
  customBudget: number;
  minEstimatedThreshold: number;
  notes?: string;
  status: TripBidStatus;
  escrowStatus: EscrowStatus;
  tokenPaid: boolean;
  tokenAmount: number; // e.g. 99
  expiresAt: string;
  createdAt: string;
  acceptedBidId?: string;
  contractId?: string;
  bidsCount?: number;
  offlineDealStatus?: 'Connected Offline' | 'Deal Finalized Offline' | 'Deal Cancelled' | 'Report Issue';
  purgeConsentUser?: boolean;
  purgeConsentVendor?: boolean;
  isPurged?: boolean;
}

export interface BidOffer {
  id: string;
  tripRequestId: string;
  vendorId: string;
  vendorName: string; // e.g. "Mahabaleshwar Partner #402"
  vendorRating: number;
  basePrice: number;
  taxes: number;
  totalPrice: number;
  inclusions: string[]; // e.g. ['Toll & Parking', 'Driver Allowance', 'Ac Room', 'Breakfast']
  exclusions?: string[];
  vehicleSpecs?: string;
  roomSpecs?: string;
  packageDetails?: string;
  revisionCount: number;
  status: BidOfferStatus;
  validUntil: string;
  validUntilMs?: number;
  createdAt: string;

  // Vendor-Controlled Cancellation / Refund Policy
  refundType?: 'NON_REFUNDABLE' | 'REFUNDABLE';
  refundDeadlineHours?: 24 | 48 | 72;
  cancellationPolicy?: string;
}

export interface BiddingContract {
  contractId: string;
  tripRequestId: string;
  bidOfferId: string;
  userId: string;
  vendorId: string;
  vendorName: string;
  tripCategory?: 'Hotels' | 'Cabs' | 'Packages';
  startDate?: string;
  endDate?: string;
  lockedPrice: number;
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
  legalClause: string;
  timestamp: string;
  userSignatureIp: string;
  userDeviceFingerprint: string;
  vendorSignatureIp: string;
  vendorDeviceFingerprint: string;

  // Vendor-Controlled Cancellation / Refund Policy
  refundType?: 'NON_REFUNDABLE' | 'REFUNDABLE';
  refundDeadlineHours?: 24 | 48 | 72;
  refundProcessedAt?: string;
  refundAmount?: number;
  refundDisbursedToVendor?: boolean;
  cancellationReason?: string;
  razorpayRefundId?: string;

  // Category-Specific Escrow Release Mechanism
  escrowModel?: 'SINGLE_STAGE_HOTEL' | 'TWO_STAGE_CAB_TRIP';
  escrowStatus?: 'HELD' | 'STAGE_1_RELEASED' | 'FULLY_RELEASED' | 'REFUNDED';
  advanceAmount?: number; // 100% for Hotels, 40% for Cabs/Trips
  balanceAmount?: number; // 0 for Hotels, 60% for Cabs/Trips
  advanceReleased?: boolean;
  balanceReleased?: boolean;

  // 4+4 Mutual Handshake PINs (Hotels: Check-in single stage)
  userCheckInPin?: string;
  vendorCheckInPin?: string;
  isCheckedIn?: boolean;
  checkedInAt?: string;

  // 4+4 Mutual Handshake PINs (Cabs/Trips: Stage 1 Pickup & Stage 2 Drop-off)
  userStartPin?: string;
  vendorStartPin?: string;
  isStarted: boolean;
  startedAt?: string;

  userEndPin?: string;
  vendorEndPin?: string;
  isCompleted: boolean;
  completedAt?: string;

  // Backwards-compatible aliases
  startOtp: string; // 4-digit pickup/check-in PIN
  endOtp: string;   // 4/6-digit completion PIN
  legalPdfUrl?: string;
}

export interface BiddingChatMessage {
  id: string;
  tripRequestId: string;
  senderId: string;
  senderRole: 'user' | 'vendor';
  senderMaskedName: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
}

export interface SanitizationResult {
  isSanitized: boolean;
  sanitizedText: string;
  violationsDetected: string[];
  action: 'ALLOW' | 'BLOCK';
  warningMessage?: string;
}


