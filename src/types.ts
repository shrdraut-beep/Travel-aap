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
  type: 'ticket' | 'hotel' | 'activity' | 'other';
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
  passcode?: string; // Security code for the trip
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
