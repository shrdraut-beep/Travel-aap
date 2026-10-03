import { VendorBid, RichMediaInventory, DemandComparisonItem, BargainingRequest } from './BargainingTypes';

export const CAB_INVENTORY_401: RichMediaInventory = {
  category: 'Cabs',
  photos: [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', // Car interior
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', // Car exterior
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80'  // Dashboard & AC
  ],
  vehicleSpecs: 'Maruti Ertiga ZXi+ (2024 Model, Dual Chilled AC, Roof Carrier, Pushback Captain Seats)',
  amenities: ['24x7 Dual AC', 'All Tolls & State Taxes Included', 'Sanitized Interior', 'Driver Food & Stay Included', '450L Boot Space'],
  locationMapUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
  rating: 4.9,
  reviewCount: 142
};

export const CAB_INVENTORY_402: RichMediaInventory = {
  category: 'Cabs',
  photos: [
    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
  ],
  vehicleSpecs: 'Toyota Rumion / Innova Crysta (Clean Leatherette Seats, Chilled AC, Highway Fastag)',
  amenities: ['Chilled AC', 'Fastag Toll Included', 'Complimentary Water Bottles', 'Professional Chauffeur', 'Phone Chargers Onboard'],
  locationMapUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
  rating: 4.8,
  reviewCount: 98
};

export const CAB_INVENTORY_403: RichMediaInventory = {
  category: 'Cabs',
  photos: [
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'
  ],
  vehicleSpecs: 'Swift Dzire Premium AC (Sedan, Comfortable Legroom, Clean Boot Space)',
  amenities: ['AC Running 100%', 'Local Sightseeing 4 Points', 'Toll Taxes Covered', 'Music System Bluetooth'],
  locationMapUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
  rating: 4.7,
  reviewCount: 76
};

export const HOTEL_INVENTORY_501: RichMediaInventory = {
  category: 'Hotels',
  photos: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
  ],
  roomSpecs: 'Deluxe Sea View Suite (King Bed, Private Balcony, 340 sq.ft, Bathtub, High-speed WiFi)',
  amenities: ['Infinity Swimming Pool', 'Free Buffet Breakfast', 'Beach Access (2 min walk)', '24x7 Hot Water', 'Complimentary Welcome Drink'],
  locationMapUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
  rating: 4.9,
  reviewCount: 215
};

export const INITIAL_VENDOR_BIDS: Record<string, VendorBid[]> = {
  'REQ-5519': [
    {
      id: 'BID-401',
      requestId: 'REQ-5519',
      vendorId: 'v-401',
      maskedName: 'Verified Partner #401',
      realName: 'Sai Holidays & Coastal Fleet',
      legalName: 'Sai Kripa Holidays & Logistics LLP',
      city: 'Pune, Maharashtra',
      directPhone: '+91 98220 14829',
      isContactUnlocked: false,
      rating: 4.9,
      basePrice: 34500,
      taxes: 1725,
      totalPrice: 36225,
      aiDealScore: 'great',
      dealScoreLabel: 'Great Deal: 14% Below Fair Value',
      inclusions: [
        '4 Nights 3-Star AC Beach Resort',
        'Daily Buffet Breakfast (CP Plan)',
        'Private AC Ertiga Cab for Sightseeing (North & South Goa)',
        'Airport / Station Pickup & Drop Included',
        'All Tolls, Parking & Driver Night Allowance Included'
      ],
      exclusions: ['Water Sports & Monument Entry Fees', 'Lunch & Dinner'],
      inventory: CAB_INVENTORY_401,
      status: 'active'
    },
    {
      id: 'BID-403',
      requestId: 'REQ-5519',
      vendorId: 'v-403',
      maskedName: 'Verified Partner #403',
      realName: 'Goa Coastal Planners',
      legalName: 'Goa Coastal Tour Operators Pvt. Ltd.',
      city: 'Panaji, Goa',
      directPhone: '+91 83224 89201',
      isContactUnlocked: false,
      rating: 4.7,
      basePrice: 35800,
      taxes: 1790,
      totalPrice: 37590,
      aiDealScore: 'fair',
      dealScoreLabel: 'Fair Price: Optimal Value',
      inclusions: [
        '4 Nights Clean AC Deluxe Rooms',
        'Breakfast Included',
        'Sedan Cab for Goa Transfers & Sightseeing',
        'Free Cancellation up to 48 Hours'
      ],
      exclusions: ['Driver Night Charges after 10 PM', 'State Border Entry Tax'],
      inventory: CAB_INVENTORY_403,
      status: 'active'
    },
    {
      id: 'BID-402',
      requestId: 'REQ-5519',
      vendorId: 'v-402',
      maskedName: 'Verified Partner #402',
      realName: 'Konkan Royal Leisure Vacations',
      legalName: 'Konkan Royal Travel Ventures India LLP',
      city: 'Ratnagiri, Maharashtra',
      directPhone: '+91 94238 66102',
      isContactUnlocked: false,
      rating: 4.8,
      basePrice: 37200,
      taxes: 1860,
      totalPrice: 39060,
      aiDealScore: 'premium',
      dealScoreLabel: 'Premium Option: Includes Extras',
      inclusions: [
        '4 Nights 4-Star Resort with Pool Access',
        'Both Breakfast and Dinner Included (MAP Plan)',
        'Dedicated Innova Crysta Cab with Unlimited Kilometers',
        'Mandovi River Sunset Cruise Tickets Included'
      ],
      exclusions: ['Personal Expenses & Laundry'],
      inventory: CAB_INVENTORY_402,
      status: 'active'
    }
  ],
  'REQ-7821': [
    {
      id: 'BID-701',
      requestId: 'REQ-7821',
      vendorId: 'v-701',
      maskedName: 'Verified Partner #701',
      realName: 'Kashi Pilgrimage Yatra Sewa',
      legalName: 'Kashi Yatra Services & Logistics LLP',
      city: 'Varanasi, Uttar Pradesh',
      directPhone: '+91 95400 33819',
      isContactUnlocked: false,
      rating: 4.9,
      basePrice: 51200,
      taxes: 2560,
      totalPrice: 53760,
      aiDealScore: 'great',
      dealScoreLabel: 'Great Deal: Below Baseline',
      inclusions: [
        '6 Nights Temple-adjacent 3-Star AC Hotels',
        'VIP Darshan Assistance at Kashi Vishwanath & Annapurna',
        'Dedicated AC Cab for Sarnath, Bodh Gaya, Prayagraj Sangam',
        'Private Boat Ride for Ganga Aarti',
        'All Tolls, Parking & Driver Allowance'
      ],
      exclusions: ['Priest Dakshina', 'Personal Puja Materials'],
      inventory: HOTEL_INVENTORY_501,
      status: 'active'
    },
    {
      id: 'BID-702',
      requestId: 'REQ-7821',
      vendorId: 'v-702',
      maskedName: 'Verified Partner #702',
      realName: 'Varanasi Direct Travel Link',
      legalName: 'Varanasi Direct Travel Logistics Pvt Ltd',
      city: 'Varanasi, Uttar Pradesh',
      directPhone: '+91 97920 44109',
      isContactUnlocked: false,
      rating: 4.7,
      basePrice: 54000,
      taxes: 2700,
      totalPrice: 56700,
      aiDealScore: 'fair',
      dealScoreLabel: 'Fair Price',
      inclusions: [
        '6 Nights AC Deluxe Hotel Stay with Breakfast',
        'AC Cab for all City Sightseeing & Outstation Excursions'
      ],
      exclusions: ['Boat Ride Charges', 'Ghat Guides'],
      inventory: CAB_INVENTORY_403,
      status: 'active'
    }
  ]
};

export const INITIAL_REQUESTS: BargainingRequest[] = [
  {
    id: 'REQ-5519',
    title: 'Family Leisure Tour',
    route: 'Pune → Goa · 4 nights · 5 travellers',
    category: 'Packages',
    startDate: '2026-09-20',
    endDate: '2026-09-24',
    paxCount: 5,
    targetBudget: 42000,
    aiBaselineBudget: 40000,
    lowestQuote: 36225,
    offersCount: 3,
    status: 'Bargaining',
    createdAt: new Date().toISOString(),
    expirySeconds: 780, // ~13 mins left in 15-min loop
    isThreeMinWindow: true,
    userDemands: [
      'AC Vehicle for 5 Pax (Ertiga / SUV)',
      '3-Star or 4-Star Beach Resort',
      'Daily Buffet Breakfast Included',
      'All Tolls, Parking & Driver Allowance Covered',
      'Airport / Station Pickup & Drop Included',
      '24x7 Escrow Protected Cancellation'
    ]
  },
  {
    id: 'REQ-7821',
    title: 'Temple & Heritage Pilgrimage',
    route: 'Nashik → Varanasi · 6 nights · 2 travellers',
    category: 'Packages',
    startDate: '2026-10-05',
    endDate: '2026-10-11',
    paxCount: 2,
    targetBudget: 58000,
    aiBaselineBudget: 56000,
    lowestQuote: 53760,
    offersCount: 2,
    status: 'Open',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    expirySeconds: 420,
    isThreeMinWindow: false,
    userDemands: [
      'Clean AC Accommodation near Temple',
      'VIP Darshan Protocol Support',
      'Dedicated AC Cab for all 6 days',
      'Evening Ganga Aarti Boat Ride Included'
    ]
  }
];

export function generateDemandComparison(
  userDemands: string[],
  bid: VendorBid
): DemandComparisonItem[] {
  return userDemands.map((demand) => {
    const demandLower = demand.toLowerCase();
    // Check if bid inclusions cover this demand
    const matchedInclusion = bid.inclusions.find((inc) => {
      const incLower = inc.toLowerCase();
      if (demandLower.includes('toll') && incLower.includes('toll')) return true;
      if (demandLower.includes('breakfast') && incLower.includes('breakfast')) return true;
      if (demandLower.includes('vehicle') && (incLower.includes('cab') || incLower.includes('ertiga') || incLower.includes('sedan') || incLower.includes('suv'))) return true;
      if (demandLower.includes('resort') && (incLower.includes('resort') || incLower.includes('hotel') || incLower.includes('room'))) return true;
      if (demandLower.includes('pickup') && incLower.includes('pickup')) return true;
      if (demandLower.includes('escrow') || demandLower.includes('cancellation')) return true;
      if (demandLower.includes('darshan') && incLower.includes('darshan')) return true;
      if (demandLower.includes('boat') && incLower.includes('boat')) return true;
      return false;
    });

    if (matchedInclusion) {
      return {
        feature: demand,
        userDemand: demand,
        vendorOffer: matchedInclusion,
        isFulfilled: true
      };
    } else {
      // Unfulfilled item
      const excluded = bid.exclusions?.find(exc => exc.toLowerCase().includes(demandLower.slice(0, 5)));
      return {
        feature: demand,
        userDemand: demand,
        vendorOffer: excluded ? `Excluded: ${excluded}` : 'Not included in this base quote',
        isFulfilled: false
      };
    }
  });
}
