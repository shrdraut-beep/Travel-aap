export type BargainingCategory = 'Cab' | 'Hotel' | 'Package';

export interface DealDemandInclusion {
  id: string;
  name: string;
  required: boolean;
}

export interface BargainingTrip {
  id: string;
  title: string;
  route: string;
  origin: string;
  destination: string;
  dates: string;
  paxCount: number;
  category: BargainingCategory;
  targetBudget: number; // e.g. 42000
  aiBaselineBudget: number; // e.g. 42000
  lowestQuote: number; // e.g. 36800
  offersCount: number; // e.g. 6
  status: 'Open' | 'Bargaining' | 'Confirmed';
  demands: DealDemandInclusion[];
  notes?: string;
  createdAt: string;
  auctionStartTime: number;
  auctionTotalSeconds: number; // 900 seconds (15 minutes)
  bidWindowSeconds: number; // 180 seconds (3 minutes)
  offlineUnlocked?: boolean;
}

export interface VendorBidOffer {
  id: string;
  tripId: string;
  partnerId: string;
  maskedPartnerName: string; // e.g. "Verified Partner #842"
  realAgencyName: string; // e.g. "Sai Holidays & Luxury Fleets Goa"
  realPhone: string; // e.g. "+91 98230 45678"
  realEmail: string; // e.g. "contact@saiholidays.com"
  rating: number; // e.g. 4.9
  reviewCount: number; // e.g. 142
  price: number; // e.g. 36800
  originalPrice: number; // e.g. 39500
  taxes: number; // e.g. 1840
  totalPrice: number; // e.g. 36800
  vehicleOrRoomTitle: string; // e.g. "Maruti Ertiga ZXi+ / Crysta AC 2024"
  category: BargainingCategory;
  photos: string[];
  locationAddress: string;
  amenities: string[];
  fulfilledInclusions: string[]; // List of demand names fulfilled
  unfulfilledInclusions: string[]; // List of demand names unfulfilled
  revisionCount: number;
  lastPriceDrop?: string; // e.g. "Dropped ₹1,200 just now"
  aiDealScore: {
    type: 'great' | 'fair' | 'premium';
    badgeLabel: string;
    description: string;
    percentDiff: number; // e.g. 14 means 14% cheaper than AI baseline
  };
  cancellationPolicy: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'vendor' | 'system';
  text: string;
  time: string;
  isOfferRevision?: boolean;
  revisedPrice?: number;
}
