import { BargainingTrip, VendorBidOffer } from './types';

export const INITIAL_BARGAINING_TRIPS: BargainingTrip[] = [
  {
    id: 'REQ-5519',
    title: 'Family Leisure Tour',
    route: 'Pune → Goa · 4 nights · 5 travellers',
    origin: 'Pune',
    destination: 'Goa',
    dates: '12 Oct - 16 Oct 2026',
    paxCount: 5,
    category: 'Cab',
    targetBudget: 42000,
    aiBaselineBudget: 42000,
    lowestQuote: 35800,
    offersCount: 6,
    status: 'Bargaining',
    demands: [
      { id: 'd1', name: '24x7 Dual Zone AC Running', required: true },
      { id: 'd2', name: 'Toll, Border & State Taxes Included', required: true },
      { id: 'd3', name: 'Driver Night Allowance Included', required: true },
      { id: 'd4', name: 'Airport / Doorstep Pickup & Drop', required: true },
      { id: 'd5', name: 'Roof Carrier / Large Boot for 5 Bags', required: true },
      { id: 'd6', name: 'Daily Sightseeing in North & South Goa', required: false }
    ],
    notes: 'Doorstep pickup from Kothrud, Pune at 5:30 AM. Need verified safe driver for Ghat section.',
    createdAt: new Date().toISOString(),
    auctionStartTime: Date.now() - 320 * 1000, // Started ~5 mins ago (active within 15 mins)
    auctionTotalSeconds: 15 * 60,
    bidWindowSeconds: 3 * 60,
    offlineUnlocked: false
  },
  {
    id: 'REQ-7821',
    title: 'Heritage & Temple Pilgrimage',
    route: 'Nashik → Varanasi · 6 nights · 2 travellers',
    origin: 'Nashik',
    destination: 'Varanasi',
    dates: '04 Nov - 10 Nov 2026',
    paxCount: 2,
    category: 'Package',
    targetBudget: 58000,
    aiBaselineBudget: 58000,
    lowestQuote: 53900,
    offersCount: 3,
    status: 'Open',
    demands: [
      { id: 'd10', name: 'Ghat-Facing Deluxe Hotel Room', required: true },
      { id: 'd11', name: 'Daily Buffet Breakfast & Dinner (MAP)', required: true },
      { id: 'd12', name: 'Dedicated AC Sedan for Kashi Vishwanath & Sarnath', required: true },
      { id: 'd13', name: 'VIP Darshan Pass Assistance', required: false }
    ],
    notes: 'Elderly parents travelling. Ground floor or elevator access required.',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    auctionStartTime: Date.now() - 400 * 1000,
    auctionTotalSeconds: 15 * 60,
    bidWindowSeconds: 3 * 60,
    offlineUnlocked: false
  }
];

export const SAMPLE_VENDOR_OFFERS: Record<string, VendorBidOffer[]> = {
  'REQ-5519': [
    {
      id: 'BID-8421',
      tripId: 'REQ-5519',
      partnerId: 'PARTNER-842',
      maskedPartnerName: 'Verified Partner #842',
      realAgencyName: 'Sai Holidays & Luxury Fleets Goa',
      realPhone: '+91 98230 45678',
      realEmail: 'booking@saiholidaysgoa.in',
      rating: 4.9,
      reviewCount: 184,
      price: 35800,
      originalPrice: 41000,
      taxes: 1790,
      totalPrice: 35800,
      vehicleOrRoomTitle: 'Maruti Ertiga ZXi+ / Toyota Innova Crysta (AC)',
      category: 'Cab',
      photos: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80'
      ],
      locationAddress: 'Doorstep Pickup from Kothrud, Pune → All Goa',
      amenities: [
        'Pushback Reclining Seats',
        'Dual Chill AC (Front & Rear vents)',
        'Clean Boot & Roof Carrier for 5 Bags',
        'Complimentary Bottled Water',
        'Experienced Ghat-Certified Driver'
      ],
      fulfilledInclusions: [
        '24x7 Dual Zone AC Running',
        'Toll, Border & State Taxes Included',
        'Driver Night Allowance Included',
        'Airport / Doorstep Pickup & Drop',
        'Roof Carrier / Large Boot for 5 Bags'
      ],
      unfulfilledInclusions: [
        'Daily Sightseeing in North & South Goa'
      ],
      revisionCount: 2,
      lastPriceDrop: '⚡ Dropped ₹1,200 2 mins ago',
      aiDealScore: {
        type: 'great',
        badgeLabel: '🔥 Great Deal (15% below AI baseline)',
        description: 'Priced ₹6,200 below market standard with verified 4.9★ fleet.',
        percentDiff: 15
      },
      cancellationPolicy: '100% Free Cancellation up to 24 hours before pickup. Instant escrow refund.'
    },
    {
      id: 'BID-5192',
      tripId: 'REQ-5519',
      partnerId: 'PARTNER-519',
      maskedPartnerName: 'Verified Partner #519',
      realAgencyName: 'Konkan Royal Express Tourers',
      realPhone: '+91 94220 11234',
      realEmail: 'tours@konkanroyal.com',
      rating: 4.8,
      reviewCount: 96,
      price: 36800,
      originalPrice: 42500,
      taxes: 1840,
      totalPrice: 36800,
      vehicleOrRoomTitle: 'Mahindra Marazzo / Kia Carens Premium 7-Seater',
      category: 'Cab',
      photos: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80'
      ],
      locationAddress: 'Doorstep Pickup & Drop Anywhere in Pune City',
      amenities: [
        'Extra Legroom Capitain Seats',
        'USB Fast Charging in all rows',
        'Clean Sanitized Cabin',
        'Luggage Carrier Installed'
      ],
      fulfilledInclusions: [
        '24x7 Dual Zone AC Running',
        'Toll, Border & State Taxes Included',
        'Driver Night Allowance Included',
        'Airport / Doorstep Pickup & Drop',
        'Roof Carrier / Large Boot for 5 Bags',
        'Daily Sightseeing in North & South Goa'
      ],
      unfulfilledInclusions: [],
      revisionCount: 1,
      lastPriceDrop: '🏷️ Dropped ₹800 recently',
      aiDealScore: {
        type: 'great',
        badgeLabel: '🔥 Great Deal (12% below AI baseline)',
        description: 'All 6 demands 100% fulfilled at ₹36,800 total locked price.',
        percentDiff: 12
      },
      cancellationPolicy: '100% Free Cancellation up to 48 hours before journey date.'
    },
    {
      id: 'BID-3110',
      tripId: 'REQ-5519',
      partnerId: 'PARTNER-311',
      maskedPartnerName: 'Verified Partner #311',
      realAgencyName: 'Western Ghats Cabs & Holidays',
      realPhone: '+91 98900 88765',
      realEmail: 'info@westernghatscabs.in',
      rating: 4.7,
      reviewCount: 64,
      price: 38200,
      originalPrice: 40000,
      taxes: 1910,
      totalPrice: 38200,
      vehicleOrRoomTitle: 'Toyota Innova Crysta Touring Sport (7 Pax)',
      category: 'Cab',
      photos: [
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80'
      ],
      locationAddress: 'Pune City Pickup · Highway Route via Anuskura Ghat',
      amenities: [
        'Crysta High Ground Clearance',
        'Individual AC Blower Vents',
        'Music Bluetooth System'
      ],
      fulfilledInclusions: [
        '24x7 Dual Zone AC Running',
        'Toll, Border & State Taxes Included',
        'Driver Night Allowance Included',
        'Airport / Doorstep Pickup & Drop'
      ],
      unfulfilledInclusions: [
        'Roof Carrier / Large Boot for 5 Bags',
        'Daily Sightseeing in North & South Goa'
      ],
      revisionCount: 0,
      aiDealScore: {
        type: 'fair',
        badgeLabel: '⚖️ Fair Price (Best Market Match)',
        description: 'Matches regional seasonal rates for Crysta luxury class.',
        percentDiff: 9
      },
      cancellationPolicy: 'Full refund if cancelled 24 hours prior. 50% refund after.'
    },
    {
      id: 'BID-9024',
      tripId: 'REQ-5519',
      partnerId: 'PARTNER-902',
      maskedPartnerName: 'Verified Partner #902',
      realAgencyName: 'Sahyadri Elite Travellers Hub',
      realPhone: '+91 97654 32190',
      realEmail: 'vip@sahyadritours.com',
      rating: 4.95,
      reviewCount: 210,
      price: 39900,
      originalPrice: 44000,
      taxes: 1995,
      totalPrice: 39900,
      vehicleOrRoomTitle: 'Brand New Toyota Hycross Hybrid (Luxury AC)',
      category: 'Cab',
      photos: [
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80'
      ],
      locationAddress: 'Doorstep VIP pickup with uniform chauffeur',
      amenities: [
        'Panoramic Sunroof & Ambient Lighting',
        'Zero Cabin Noise (Hybrid Smoothness)',
        'Free Wi-Fi Hotspot on-board',
        'First-Aid Kit & Emergency Oxygen'
      ],
      fulfilledInclusions: [
        '24x7 Dual Zone AC Running',
        'Toll, Border & State Taxes Included',
        'Driver Night Allowance Included',
        'Airport / Doorstep Pickup & Drop',
        'Roof Carrier / Large Boot for 5 Bags',
        'Daily Sightseeing in North & South Goa'
      ],
      unfulfilledInclusions: [],
      revisionCount: 1,
      aiDealScore: {
        type: 'premium',
        badgeLabel: '💎 Premium Upgrade (Luxury Hybrid)',
        description: 'Includes brand new 2025 Hycross Hybrid vehicle with VIP amenities.',
        percentDiff: 5
      },
      cancellationPolicy: 'Free cancellation up to 72 hours before start.'
    },
    {
      id: 'BID-4112',
      tripId: 'REQ-5519',
      partnerId: 'PARTNER-411',
      maskedPartnerName: 'Verified Partner #411',
      realAgencyName: 'Goa Coastal Transports',
      realPhone: '+91 91234 56789',
      realEmail: 'fleet@goacoastal.in',
      rating: 4.6,
      reviewCount: 48,
      price: 40500,
      originalPrice: 43000,
      taxes: 2025,
      totalPrice: 40500,
      vehicleOrRoomTitle: 'Chevrolet Tavera / Bolero Neo AC',
      category: 'Cab',
      photos: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
      ],
      locationAddress: 'Pune Station Pickup or Swargate',
      amenities: ['Power Steering', 'Front AC'],
      fulfilledInclusions: [
        'Toll, Border & State Taxes Included',
        'Driver Night Allowance Included'
      ],
      unfulfilledInclusions: [
        '24x7 Dual Zone AC Running',
        'Roof Carrier / Large Boot for 5 Bags',
        'Daily Sightseeing in North & South Goa'
      ],
      revisionCount: 0,
      aiDealScore: {
        type: 'fair',
        badgeLabel: '⚖️ Fair Price',
        description: 'Standard budget option for long distances.',
        percentDiff: 4
      },
      cancellationPolicy: 'Non-refundable within 48 hours.'
    },
    {
      id: 'BID-1099',
      tripId: 'REQ-5519',
      partnerId: 'PARTNER-109',
      maskedPartnerName: 'Verified Partner #109',
      realAgencyName: 'Pimpri Chinchwad Travel Network',
      realPhone: '+91 98811 22334',
      realEmail: 'ops@pctravels.com',
      rating: 4.5,
      reviewCount: 32,
      price: 41200,
      originalPrice: 42000,
      taxes: 2060,
      totalPrice: 41200,
      vehicleOrRoomTitle: 'Ertiga VXi 2022',
      category: 'Cab',
      photos: [
        'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80'
      ],
      locationAddress: 'Pune Doorstep pickup',
      amenities: ['Standard AC', 'Radio'],
      fulfilledInclusions: [
        '24x7 Dual Zone AC Running',
        'Airport / Doorstep Pickup & Drop'
      ],
      unfulfilledInclusions: [
        'Toll, Border & State Taxes Included',
        'Driver Night Allowance Included',
        'Daily Sightseeing in North & South Goa'
      ],
      revisionCount: 0,
      aiDealScore: {
        type: 'fair',
        badgeLabel: '⚖️ Fair Price',
        description: 'Close to user target budget.',
        percentDiff: 2
      },
      cancellationPolicy: 'Refundable with 10% processing deduction.'
    }
  ],
  'REQ-7821': [
    {
      id: 'BID-7011',
      tripId: 'REQ-7821',
      partnerId: 'PARTNER-701',
      maskedPartnerName: 'Verified Partner #701',
      realAgencyName: 'Kashi Vishwanath Yatra Seva',
      realPhone: '+91 94500 12345',
      realEmail: 'pilgrim@kashiyatra.in',
      rating: 4.9,
      reviewCount: 220,
      price: 53900,
      originalPrice: 59000,
      taxes: 2695,
      totalPrice: 53900,
      vehicleOrRoomTitle: 'Assi Ghat Riverside Heritage Haveli + AC Swift Dzire',
      category: 'Package',
      photos: [
        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
      ],
      locationAddress: 'Assi Ghat, Varanasi (Elevator in property)',
      amenities: [
        'Ghat Facing Balcony with Ganga Aarti View',
        'Elevator Access for Elderly Guests',
        'Pure Veg Satvik Meals (MAP - Breakfast + Dinner)',
        'Private Dedicated AC Dzire for Local & Sarnath'
      ],
      fulfilledInclusions: [
        'Ghat-Facing Deluxe Hotel Room',
        'Daily Buffet Breakfast & Dinner (MAP)',
        'Dedicated AC Sedan for Kashi Vishwanath & Sarnath',
        'VIP Darshan Pass Assistance'
      ],
      unfulfilledInclusions: [],
      revisionCount: 1,
      lastPriceDrop: '🔥 Dropped ₹2,000 recently',
      aiDealScore: {
        type: 'great',
        badgeLabel: '🔥 Great Deal (8% below AI baseline)',
        description: 'Heritage riverside stay with all meals and dedicated transport.',
        percentDiff: 8
      },
      cancellationPolicy: 'Free cancellation up to 48 hours prior to check-in.'
    },
    {
      id: 'BID-7012',
      tripId: 'REQ-7821',
      partnerId: 'PARTNER-702',
      maskedPartnerName: 'Verified Partner #702',
      realAgencyName: 'Banaras Pilgrimage Tours',
      realPhone: '+91 94150 99887',
      realEmail: 'info@banarastours.com',
      rating: 4.7,
      reviewCount: 78,
      price: 55400,
      originalPrice: 58000,
      taxes: 2770,
      totalPrice: 55400,
      vehicleOrRoomTitle: '3-Star Hotel near Cantonment + Dedicated Sedan',
      category: 'Package',
      photos: [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
      ],
      locationAddress: 'Cantonment Area, Varanasi (Near Railway Station)',
      amenities: ['24hr Room Service', 'Buffet Breakfast', 'AC Dzire'],
      fulfilledInclusions: [
        'Daily Buffet Breakfast & Dinner (MAP)',
        'Dedicated AC Sedan for Kashi Vishwanath & Sarnath'
      ],
      unfulfilledInclusions: [
        'Ghat-Facing Deluxe Hotel Room',
        'VIP Darshan Pass Assistance'
      ],
      revisionCount: 0,
      aiDealScore: {
        type: 'fair',
        badgeLabel: '⚖️ Fair Price',
        description: 'Standard 3-star package.',
        percentDiff: 5
      },
      cancellationPolicy: 'Standard cancellation policy applies.'
    },
    {
      id: 'BID-7013',
      tripId: 'REQ-7821',
      partnerId: 'PARTNER-703',
      maskedPartnerName: 'Verified Partner #703',
      realAgencyName: 'Ganga Kripa Luxury Stays',
      realPhone: '+91 93360 44321',
      realEmail: 'stays@gangakripa.com',
      rating: 4.85,
      reviewCount: 140,
      price: 57900,
      originalPrice: 62000,
      taxes: 2895,
      totalPrice: 57900,
      vehicleOrRoomTitle: 'Taj Nadesar Palace Affiliate & Luxury Innova',
      category: 'Package',
      photos: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
      ],
      locationAddress: 'Varanasi City Center',
      amenities: ['5-Star Luxury Inclusions', 'Special Priest Guidance'],
      fulfilledInclusions: [
        'Daily Buffet Breakfast & Dinner (MAP)',
        'Dedicated AC Sedan for Kashi Vishwanath & Sarnath',
        'VIP Darshan Pass Assistance'
      ],
      unfulfilledInclusions: [
        'Ghat-Facing Deluxe Hotel Room'
      ],
      revisionCount: 0,
      aiDealScore: {
        type: 'premium',
        badgeLabel: '💎 Premium Upgrade',
        description: 'Luxury heritage experience with personal escort.',
        percentDiff: 1
      },
      cancellationPolicy: 'Free cancellation up to 72 hours prior.'
    }
  ]
};
