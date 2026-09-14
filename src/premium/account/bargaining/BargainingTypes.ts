export interface RichMediaInventory {
  category: 'Hotels' | 'Cabs' | 'Packages';
  photos: string[];
  vehicleSpecs?: string;
  roomSpecs?: string;
  amenities: string[];
  locationMapUrl?: string;
  rating: number;
  reviewCount: number;
}

export interface VendorBid {
  id: string;
  requestId: string;
  vendorId: string;
  maskedName: string; // e.g., "Verified Partner #401"
  realName: string;   // unmasked only after escrow payment or offline unlock
  legalName: string;  // Registered Legal Entity Name for consumer protection compliance
  city: string;       // Registered City & State
  directPhone: string; // Hidden until unlocked or deal locked
  isContactUnlocked?: boolean; // True when direct contact is revealed via ₹29 unlock
  rating: number;
  basePrice: number;
  taxes: number;
  totalPrice: number;
  aiDealScore: 'great' | 'fair' | 'premium';
  dealScoreLabel: string;
  inclusions: string[];
  exclusions: string[];
  inventory: RichMediaInventory;
  status: 'active' | 'accepted' | 'countered';
  counterAmount?: number;
  isCountering?: boolean;
}

export interface DemandComparisonItem {
  feature: string;
  userDemand: string;
  vendorOffer: string;
  isFulfilled: boolean;
}

export interface BargainingRequest {
  id: string;
  title: string;
  route: string;
  category: 'Hotels' | 'Cabs' | 'Packages';
  startDate: string;
  endDate: string;
  paxCount: number;
  targetBudget: number;
  aiBaselineBudget: number;
  lowestQuote: number;
  offersCount: number;
  status: 'Open' | 'Bargaining' | 'Confirmed';
  createdAt: string;
  expirySeconds: number; // 15 mins (900s) default
  isThreeMinWindow: boolean;
  userDemands: string[];
}
