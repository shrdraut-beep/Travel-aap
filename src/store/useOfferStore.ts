import { create } from 'zustand';
import { Offer, OfferCategory } from '../types';

interface OfferStoreState {
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => void;
  updateOffer: (id: string, updatedFields: Partial<Offer>) => void;
  toggleOfferActive: (id: string) => void;
  deleteOffer: (id: string) => void;
  resetOffers: () => void;
}

const DEFAULT_OFFERS: Offer[] = [
  // ================= HUB / ACTIVE TRIP TAB ADS =================
  {
    id: 'banner-hub-1',
    title: 'Group Trip Villa Pass',
    subtitle: 'Flat 25% OFF on 3BHK & 4BHK Private Pool Villas for groups',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    category: 'Banner',
    targetTab: 'hub',
    couponCode: 'GROUPVILLA',
    discountBadge: 'FLAT 25% OFF',
    validTill: '31 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'banner-hub-2',
    title: 'Group Cab Rentals & Tempo Travelers',
    subtitle: 'Rent 7-Seater Ertiga or 12-Seater Tempo with Zero Booking Fees',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
    category: 'Banner',
    targetTab: 'hub',
    couponCode: 'GROUPCAB',
    discountBadge: 'ZERO FEE',
    validTill: '28 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'offer-hub-1',
    title: 'Group Live Voting & Itinerary Reward',
    subtitle: 'Cast votes in trip polls and earn ₹500 wallet cashback per member.',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    category: 'Bank Offers',
    targetTab: 'hub',
    couponCode: 'HUBVOTE500',
    discountBadge: '₹500 CASHBACK',
    validTill: '31 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },

  // ================= EXPLORE / ALL TRIPS TAB ADS =================
  {
    id: 'banner-alltrips-1',
    title: 'Independence Day Travel SALE',
    subtitle: 'UP TO 20% OFF on Domestic Flights & Heritage Hotels',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
    category: 'Banner',
    targetTab: 'all-trips',
    couponCode: 'IND80',
    discountBadge: 'UP TO 20% OFF',
    validTill: '25 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'banner-alltrips-2',
    title: 'Monsoon Resort Getaways',
    subtitle: 'Flat ₹1,500 Instant Cashback on Mountain & Valley Staycations',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    category: 'Banner',
    targetTab: 'all-trips',
    couponCode: 'MONSOON1500',
    discountBadge: '₹1,500 OFF',
    validTill: '30 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'offer-alltrips-1',
    title: 'IndiGo Freedom Sale!',
    subtitle: 'Exclusive student & group fares on top domestic routes.',
    imageUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80',
    category: 'Flights',
    targetTab: 'all-trips',
    couponCode: 'INDIGO20',
    discountBadge: '20% OFF',
    validTill: '20 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },

  // ================= PLANNING SCREEN TAB ADS =================
  {
    id: 'banner-plan-1',
    title: 'AI Smart Itinerary Pro',
    subtitle: 'Get 40% OFF Route Optimizer, Fuel Calculator & Packing Assistant',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    category: 'Banner',
    targetTab: 'planning',
    couponCode: 'SMARTPLAN40',
    discountBadge: '40% OFF',
    validTill: '31 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'banner-plan-2',
    title: 'Self-Drive Car Rental Pass',
    subtitle: 'Flat ₹1,200 Off Zoomcar & SUV rentals for road trip itineraries',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    category: 'Banner',
    targetTab: 'planning',
    couponCode: 'ROADTRIP1200',
    discountBadge: '₹1,200 OFF',
    validTill: '31 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'offer-plan-1',
    title: 'Fuel Cashback & Highway Pass',
    subtitle: 'Flat ₹100 instant discount on HPCL/IOCL Fastag recharges.',
    imageUrl: 'https://images.unsplash.com/photo-1527018601619-a508a2be00d6?auto=format&fit=crop&w=800&q=80',
    category: 'Cabs',
    targetTab: 'planning',
    couponCode: 'FASTAG100',
    discountBadge: '₹100 CASHBACK',
    validTill: '30 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },

  // ================= BOOKING TAB ADS =================
  {
    id: 'banner-book-1',
    title: 'Hourly Stays & Transit Slots',
    subtitle: 'BOOK FOR 3, 6 OR 9 HOURS! Great savings on airport & station transit',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    category: 'Banner',
    targetTab: 'booking',
    couponCode: 'HOURLY15',
    discountBadge: 'FLAT 15% OFF',
    validTill: '31 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'banner-book-2',
    title: 'HDFC Bank Flight + Hotel Combo',
    subtitle: 'Get up to ₹2,500 instant discount on travel bookings using HDFC Cards',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    category: 'Banner',
    targetTab: 'booking',
    couponCode: 'HDFCROUT',
    discountBadge: '₹2,500 OFF',
    validTill: '31 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'offer-book-1',
    title: 'Boutique Homestays in Konkan & Goa',
    subtitle: 'Flat 15% discount on heritage beachfront stay bookings.',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    category: 'Hotels',
    targetTab: 'booking',
    couponCode: 'GOABAY',
    discountBadge: '15% OFF',
    validTill: '30 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },

  // ================= SOCIAL / MEMORIES TAB ADS =================
  {
    id: 'banner-social-1',
    title: 'Print Your Travel Memory Reel',
    subtitle: 'FLAT 30% OFF Hardcover Photobooks & Canvas Wall Prints',
    imageUrl: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?auto=format&fit=crop&w=1200&q=80',
    category: 'Banner',
    targetTab: 'social',
    couponCode: 'REELPRINT30',
    discountBadge: '30% OFF',
    validTill: '31 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'banner-social-2',
    title: 'GoPro & Drone Travel Rental',
    subtitle: 'Rent 4K Action Cameras starting at just ₹299/day for your trip reels',
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
    category: 'Banner',
    targetTab: 'social',
    couponCode: 'CAMRENT',
    discountBadge: 'FROM ₹299/DAY',
    validTill: '31 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'offer-social-1',
    title: 'Best Trip Memory Contest!',
    subtitle: 'Upload your favorite group memory photo and win ₹10,000 holiday vouchers.',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
    category: 'Bank Offers',
    targetTab: 'social',
    couponCode: 'WINMEMORIES',
    discountBadge: 'WIN ₹10,000',
    validTill: '31 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },

  // ================= EXPENSES / KHARCH TAB ADS =================
  {
    id: 'banner-expenses-1',
    title: 'UPI Split-Bill Cashback',
    subtitle: 'Settle group expenses via UPI and get up to ₹500 instant wallet cashback',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67568d0490?auto=format&fit=crop&w=1200&q=80',
    category: 'Banner',
    targetTab: 'expenses',
    couponCode: 'SPLIT500',
    discountBadge: '₹500 CASHBACK',
    validTill: '31 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'banner-expenses-2',
    title: 'Dineout Group Restaurant Deals',
    subtitle: 'Flat 25% OFF on total food & drink bills at 10,000+ partner restaurants',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    category: 'Banner',
    targetTab: 'expenses',
    couponCode: 'DINEOUT25',
    discountBadge: '25% OFF BILL',
    validTill: '31 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'offer-expenses-1',
    title: 'Zero Forex Forex Card',
    subtitle: 'Zero markup fee on international group spending & currency conversions.',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80',
    category: 'Bank Offers',
    targetTab: 'expenses',
    couponCode: 'ZEROFOREX',
    discountBadge: 'ZERO MARKUP',
    validTill: '31 Aug 2026',
    isActive: true,
    createdAt: new Date().toISOString()
  },

  // ================= FLAGSHIP STORES & POCKET FRIENDLY =================
  {
    id: 'flagship-1',
    title: 'Mount Hotels & Resorts',
    subtitle: 'Luxury mountain retreats & valley view villas',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    category: 'Flagship Store',
    targetTab: 'all',
    priceTag: 'UNDER ₹2,999',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'flagship-2',
    title: 'Royal Orchid Hotels',
    subtitle: '5-Star business & leisure hospitality across India',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    category: 'Flagship Store',
    targetTab: 'all',
    priceTag: 'UNDER ₹3,499',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'flagship-3',
    title: 'Umaid Hotels & Heritage',
    subtitle: 'Royal Rajasthani palaces and boutique stays',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    category: 'Flagship Store',
    targetTab: 'all',
    priceTag: 'UNDER ₹1,899',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pocket-1',
    title: 'Cozy Budget Rooms',
    subtitle: 'Saputara, Gujarat & Lonavala',
    imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    category: 'Pocket Friendly',
    targetTab: 'all',
    priceTag: 'UNDER ₹999',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pocket-2',
    title: 'Deluxe Homestays',
    subtitle: 'Baga Beach & Alibaug Coastal Stays',
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    category: 'Pocket Friendly',
    targetTab: 'all',
    priceTag: 'UNDER ₹1,499',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pocket-3',
    title: 'Premium City Suites',
    subtitle: 'Mumbai Central & Pune IT Corridor',
    imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    category: 'Pocket Friendly',
    targetTab: 'all',
    priceTag: 'UNDER ₹1,999',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const STORAGE_KEY = 'routripo_active_offers_v1';

const getInitialOffers = (): Offer[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error loading offers from storage:", e);
  }
  return DEFAULT_OFFERS;
};

export const useOfferStore = create<OfferStoreState>((set, get) => ({
  offers: getInitialOffers(),

  addOffer: (newOffer) => {
    const created: Offer = {
      ...newOffer,
      id: `offer-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [created, ...get().offers];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    set({ offers: updated });
  },

  updateOffer: (id, updatedFields) => {
    const updated = get().offers.map(o => o.id === id ? { ...o, ...updatedFields } : o);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    set({ offers: updated });
  },

  toggleOfferActive: (id) => {
    const updated = get().offers.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    set({ offers: updated });
  },

  deleteOffer: (id) => {
    const updated = get().offers.filter(o => o.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    set({ offers: updated });
  },

  resetOffers: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_OFFERS));
    } catch (e) {}
    set({ offers: DEFAULT_OFFERS });
  }
}));
