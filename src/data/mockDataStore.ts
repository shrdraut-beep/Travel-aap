/**
 * UNIVERSAL MOCK DATA STORE & SIMULATED SERVICES
 * 
 * Provides centralized mock data and simulated async APIs across all 7 booking verticals:
 * 1. Flights
 * 2. Trains
 * 3. Hotels
 * 4. Self-Drive Cars
 * 5. Cabs (Driver-Inclusive)
 * 6. Buses
 * 7. Holiday & Tour Packages
 * 
 * Also contains:
 * - Mock Coupons & Promo Code Validation Engine
 * - User Profile & Partner Profile Mock Data
 * - Async Fetch Functions with simulated network latency (setTimeout)
 */

export interface MockFlight {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business';
  amount: number;
  baggage: string;
  refundable: boolean;
  logo: string;
}

export interface MockTrain {
  id: string;
  trainName: string;
  trainNumber: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  trainType: string;
  classes: Array<{
    code: '1A' | '2A' | '3A' | 'SL' | 'CC' | 'EC' | '2S';
    name: string;
    amount: number;
    availableSeats: number;
    status: 'AVAILABLE' | 'RAC' | 'WL';
  }>;
  amount: number; // default base amount
  runsOn: string[];
}

export interface MockHotel {
  id: string;
  name: string;
  starRating: number;
  roomType: string;
  location: string;
  city: string;
  amountPerNight: number;
  amount: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  amenities: string[];
  isDirectPartner: boolean;
  badgeText?: string;
  description: string;
}

export interface MockCar {
  id: string;
  model: string;
  brand: string;
  category: 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury';
  transmission: 'Automatic' | 'Manual';
  seats: number;
  fuelType: 'Petrol' | 'Diesel' | 'EV' | 'CNG';
  amountPerDay: number;
  amount: number;
  rating: number;
  tripsCount: number;
  image: string;
  features: string[];
  pickupLocations: string[];
}

export interface MockCab {
  id: string;
  cabType: 'Go Sedan' | 'Prime SUV' | 'Mini Hatchback' | 'Executive Plus';
  carModel: string;
  seats: number;
  luggage: number;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  driverTrips: number;
  carPlate: string;
  eta: string;
  distanceKm: number;
  amount: number;
  baseFare: number;
  ratePerKm: number;
  image: string;
  ac: boolean;
}

export interface MockBus {
  id: string;
  operatorName: string;
  busType: 'AC Sleeper (2+1)' | 'Bharat Benz AC Seater' | 'Multi-Axle Volvo Sleeper' | 'Non-AC Seater';
  route: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  amount: number;
  rating: number;
  reviewsCount: number;
  availableSeats: number;
  boardingPoints: string[];
  droppingPoints: string[];
  amenities: string[];
}

export interface MockHolidayPackage {
  id: string;
  title: string;
  destination: string;
  origin: string;
  durationDays: number;
  durationNights: number;
  vibe: 'Beach & Coastal' | 'Hill Station' | 'Devotional & Pilgrimage' | 'Heritage & Culture' | 'Adventure';
  itineraryHighlights: string[];
  amount: number;
  price: number;
  rating: number;
  reviewsCount: number;
  isVerifiedAgent: boolean;
  agentName: string;
  agentPhone: string;
  image: string;
  transportType: 'flight' | 'train' | 'bus' | 'car';
  inclusions: string[];
  description: string;
}

export interface MockCoupon {
  code: string;
  type: 'flat' | 'percentage';
  discount: number;
  minAmount: number;
  maxDiscount?: number;
  description: string;
  expiryDate: string;
  applicableVerticals?: string[]; // all or specific e.g. ['flights', 'packages']
}

export interface MockUserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  membershipTier: 'Silver' | 'Gold' | 'Platinum';
  routripoCoins: number;
  savedTripsCount: number;
  bookingHistory: Array<{
    id: string;
    vertical: string;
    title: string;
    date: string;
    amount: number;
    originalAmount: number;
    discountApplied: number;
    couponCode?: string;
    status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    paymentMethod: string;
  }>;
}

export interface MockPartnerProfile {
  partnerId: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  verified: boolean;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  totalEarnings: number;
  pendingSettlements: number;
  activeListingsCount: number;
  commissionRate: number;
  recentBookings: Array<{
    bookingId: string;
    serviceName: string;
    customerName: string;
    grossAmount: number;
    payoutAmount: number;
    status: 'PAID' | 'ESCROW_HELD' | 'SETTLED';
    date: string;
  }>;
}

// ---------------------------------------------------------------------------
// 1. FLIGHTS MOCK DATA
// ---------------------------------------------------------------------------
export const mockFlights: MockFlight[] = [
  {
    id: 'fl_6e_202',
    airline: 'IndiGo',
    airlineCode: '6E',
    flightNumber: '6E-202',
    origin: 'Mumbai (BOM)',
    originCode: 'BOM',
    destination: 'New Delhi (DEL)',
    destinationCode: 'DEL',
    departureTime: '06:15 AM',
    arrivalTime: '08:30 AM',
    duration: '2h 15m',
    stops: 'Non-stop',
    cabinClass: 'Economy',
    amount: 4650,
    baggage: '15 kg Check-in, 7 kg Cabin',
    refundable: true,
    logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'fl_ai_505',
    airline: 'Air India',
    airlineCode: 'AI',
    flightNumber: 'AI-505',
    origin: 'Mumbai (BOM)',
    originCode: 'BOM',
    destination: 'Goa (GOI)',
    destinationCode: 'GOI',
    departureTime: '09:45 AM',
    arrivalTime: '11:00 AM',
    duration: '1h 15m',
    stops: 'Non-stop',
    cabinClass: 'Economy',
    amount: 3890,
    baggage: '25 kg Check-in, 7 kg Cabin',
    refundable: true,
    logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'fl_qp_1102',
    airline: 'Akasa Air',
    airlineCode: 'QP',
    flightNumber: 'QP-1102',
    origin: 'Pune (PNQ)',
    originCode: 'PNQ',
    destination: 'Bengaluru (BLR)',
    destinationCode: 'BLR',
    departureTime: '14:20 PM',
    arrivalTime: '15:45 PM',
    duration: '1h 25m',
    stops: 'Non-stop',
    cabinClass: 'Economy',
    amount: 3450,
    baggage: '15 kg Check-in, 7 kg Cabin',
    refundable: false,
    logo: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'fl_sg_814',
    airline: 'SpiceJet',
    airlineCode: 'SG',
    flightNumber: 'SG-814',
    origin: 'Mumbai (BOM)',
    originCode: 'BOM',
    destination: 'Jaipur (JAI)',
    destinationCode: 'JAI',
    departureTime: '17:30 PM',
    arrivalTime: '19:15 PM',
    duration: '1h 45m',
    stops: 'Non-stop',
    cabinClass: 'Economy',
    amount: 4200,
    baggage: '15 kg Check-in, 7 kg Cabin',
    refundable: true,
    logo: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'fl_uk_944',
    airline: 'Vistara',
    airlineCode: 'UK',
    flightNumber: 'UK-944',
    origin: 'New Delhi (DEL)',
    originCode: 'DEL',
    destination: 'Goa (GOX)',
    destinationCode: 'GOX',
    departureTime: '11:10 AM',
    arrivalTime: '13:40 PM',
    duration: '2h 30m',
    stops: 'Non-stop',
    cabinClass: 'Premium Economy',
    amount: 6850,
    baggage: '20 kg Check-in, 10 kg Cabin',
    refundable: true,
    logo: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f4?w=120&auto=format&fit=crop&q=80'
  }
];

// ---------------------------------------------------------------------------
// 2. TRAINS MOCK DATA
// ---------------------------------------------------------------------------
export const mockTrains: MockTrain[] = [
  {
    id: 'tr_12051',
    trainName: 'Jan Shatabdi Express',
    trainNumber: '12051',
    origin: 'Mumbai CSMT',
    originCode: 'CSMT',
    destination: 'Madgaon Junction (Goa)',
    destinationCode: 'MAO',
    departureTime: '05:10 AM',
    arrivalTime: '14:30 PM',
    duration: '9h 20m',
    trainType: 'Jan Shatabdi (Superfast)',
    amount: 1140,
    classes: [
      { code: 'CC', name: 'AC Chair Car', amount: 1140, availableSeats: 48, status: 'AVAILABLE' },
      { code: '2S', name: 'Second Sitting', amount: 320, availableSeats: 112, status: 'AVAILABLE' },
      { code: 'EC', name: 'Executive Chair Car', amount: 2350, availableSeats: 14, status: 'AVAILABLE' }
    ],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  {
    id: 'tr_22221',
    trainName: 'CSMT NZM Rajdhani Express',
    trainNumber: '22221',
    origin: 'Mumbai CSMT',
    originCode: 'CSMT',
    destination: 'Hazrat Nizamuddin (Delhi)',
    destinationCode: 'NZM',
    departureTime: '16:00 PM',
    arrivalTime: '09:55 AM (Next Day)',
    duration: '17h 55m',
    trainType: 'Rajdhani Express',
    amount: 3250,
    classes: [
      { code: '3A', name: 'AC 3 Tier', amount: 3250, availableSeats: 32, status: 'AVAILABLE' },
      { code: '2A', name: 'AC 2 Tier', amount: 4650, availableSeats: 18, status: 'AVAILABLE' },
      { code: '1A', name: 'AC First Class', amount: 6200, availableSeats: 6, status: 'AVAILABLE' }
    ],
    runsOn: ['Mon', 'Wed', 'Fri', 'Sat']
  },
  {
    id: 'tr_20701',
    trainName: 'Mumbai - Shirdi Vande Bharat',
    trainNumber: '20701',
    origin: 'Mumbai CSMT',
    originCode: 'CSMT',
    destination: 'Sainagar Shirdi',
    destinationCode: 'SNSI',
    departureTime: '06:20 AM',
    arrivalTime: '11:40 AM',
    duration: '5h 20m',
    trainType: 'Vande Bharat Express',
    amount: 1475,
    classes: [
      { code: 'CC', name: 'AC Chair Car', amount: 1475, availableSeats: 76, status: 'AVAILABLE' },
      { code: 'EC', name: 'Executive Class', amount: 2850, availableSeats: 22, status: 'AVAILABLE' }
    ],
    runsOn: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  {
    id: 'tr_12111',
    trainName: 'Amravati Superfast Express',
    trainNumber: '12111',
    origin: 'Mumbai CSMT',
    originCode: 'CSMT',
    destination: 'Nashik Road',
    destinationCode: 'NK',
    departureTime: '19:55 PM',
    arrivalTime: '23:45 PM',
    duration: '3h 50m',
    trainType: 'Superfast Mail/Express',
    amount: 680,
    classes: [
      { code: '3A', name: 'AC 3 Tier', amount: 680, availableSeats: 54, status: 'AVAILABLE' },
      { code: 'SL', name: 'Sleeper Class', amount: 240, availableSeats: 130, status: 'AVAILABLE' }
    ],
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  }
];

// ---------------------------------------------------------------------------
// 3. HOTELS MOCK DATA
// ---------------------------------------------------------------------------
export const mockHotels: MockHotel[] = [
  {
    id: 'ht_taj_resort_goa',
    name: 'Taj Exotica Resort & Spa, Goa',
    starRating: 5,
    roomType: 'Luxury Sea View Villa with Balcony',
    location: 'Benaulim Beach, South Goa',
    city: 'Goa',
    amountPerNight: 12500,
    amount: 12500,
    rating: 4.9,
    reviewsCount: 1840,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Private Beach Access', 'Infinity Pool', 'Complimentary Breakfast', 'Ayurvedic Spa', 'Free High-Speed Wi-Fi'],
    isDirectPartner: true,
    badgeText: 'RouTriO Premium Partner',
    description: 'Mediterranean-style 5-star resort overlooking the Arabian Sea with lush tropical gardens and private plunge pools.'
  },
  {
    id: 'ht_grand_heritage_shirdi',
    name: 'St LaURN Meditation Resort, Shirdi',
    starRating: 4,
    roomType: 'Executive Temple View Suite',
    location: 'Rui Shiv Road, Near Sai Temple',
    city: 'Shirdi',
    amountPerNight: 3600,
    amount: 3600,
    rating: 4.8,
    reviewsCount: 920,
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Free Temple Drop Shuttle', 'Pure Veg Buffet Breakfast', 'Swimming Pool', '24/7 Room Service'],
    isDirectPartner: true,
    badgeText: 'Verified Partner',
    description: 'Serene luxury resort located 5 minutes from Shirdi Sai Baba Temple with meditation grounds and gourmet vegetarian dining.'
  },
  {
    id: 'ht_sahyadri_view_mahabaleshwar',
    name: 'Evershine Resort & Spa, Mahabaleshwar',
    starRating: 4,
    roomType: 'Valley View Deluxe Room',
    location: 'C.T.S No 182, Gautam Road',
    city: 'Mahabaleshwar',
    amountPerNight: 5400,
    amount: 5400,
    rating: 4.7,
    reviewsCount: 650,
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Strawberry Farm Trail', 'Heated Indoor Pool', 'Mountain View Balcony', 'Kids Play Zone'],
    isDirectPartner: false,
    description: 'Contemporary palace-inspired hill retreat in the Western Ghats surrounded by strawberry orchards.'
  },
  {
    id: 'ht_konkan_beachfront_ratnagiri',
    name: 'Kohinoor Samudra Beach Resort, Ratnagiri',
    starRating: 3,
    roomType: 'Cliffside Oceanfront Cottage',
    location: 'Bhatye Beach Cliff, Ratnagiri',
    city: 'Ratnagiri',
    amountPerNight: 2800,
    amount: 2800,
    rating: 4.6,
    reviewsCount: 410,
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Direct Cliff Sunset View', 'Konkani Seafood Kitchen', 'Infinity Garden', 'Free Parking'],
    isDirectPartner: true,
    badgeText: 'Direct Contract',
    description: 'Perched on a cliff overlooking the Bhatye Beach, offering panoramic Konkan coastline views and authentic Malvani dining.'
  }
];

// ---------------------------------------------------------------------------
// 4. SELF-DRIVE CARS MOCK DATA
// ---------------------------------------------------------------------------
export const mockCars: MockCar[] = [
  {
    id: 'car_hyundai_creta_auto',
    model: 'Hyundai Creta SX (O)',
    brand: 'Hyundai',
    category: 'SUV',
    transmission: 'Automatic',
    seats: 5,
    fuelType: 'Diesel',
    amountPerDay: 2850,
    amount: 2850,
    rating: 4.9,
    tripsCount: 142,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
    features: ['Panoramic Sunroof', 'Cruise Control', 'Unlimited KMs Available', 'Fastag Preloaded'],
    pickupLocations: ['Mumbai Airport T2', 'Bandra West', 'Thane West', 'Pune Airport']
  },
  {
    id: 'car_mahindra_thar_4x4',
    model: 'Mahindra Thar 4x4 Hardtop',
    brand: 'Mahindra',
    category: 'SUV',
    transmission: 'Automatic',
    seats: 4,
    fuelType: 'Diesel',
    amountPerDay: 3500,
    amount: 3500,
    rating: 4.9,
    tripsCount: 210,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
    features: ['4x4 Drive', 'Convertible Hardtop', 'Off-road Kit', 'Apple CarPlay'],
    pickupLocations: ['Goa Dabolim Airport', 'Mopa Airport', 'Panaji Hub', 'Mumbai Western Hub']
  },
  {
    id: 'car_maruti_swift_amt',
    model: 'Maruti Suzuki Swift ZXi',
    brand: 'Maruti Suzuki',
    category: 'Hatchback',
    transmission: 'Automatic',
    seats: 5,
    fuelType: 'Petrol',
    amountPerDay: 1450,
    amount: 1450,
    rating: 4.7,
    tripsCount: 380,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
    features: ['Super Fuel Efficient (22 km/l)', 'Keyless Entry', 'Bluetooth Audio', 'Clean Sanitized'],
    pickupLocations: ['Nashik Road Railway Station', 'Pune Station', 'Mumbai Borivali', 'Nagpur Hub']
  },
  {
    id: 'car_tata_nexon_ev',
    model: 'Tata Nexon.ev Max (Empowered)',
    brand: 'Tata',
    category: 'SUV',
    transmission: 'Automatic',
    seats: 5,
    fuelType: 'EV',
    amountPerDay: 2400,
    amount: 2400,
    rating: 4.8,
    tripsCount: 95,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80',
    features: ['453 km Range', 'Fast Charging Compatible', 'Zero Carbon Emissions', 'Cooled Seats'],
    pickupLocations: ['Mumbai Dadar', 'Pune Koregaon Park', 'Navi Mumbai Hub']
  }
];

// ---------------------------------------------------------------------------
// 5. CABS (DRIVER-INCLUSIVE) MOCK DATA
// ---------------------------------------------------------------------------
export const mockCabs: MockCab[] = [
  {
    id: 'cab_prime_sedan_dzire',
    cabType: 'Go Sedan',
    carModel: 'Maruti Dzire / Honda Amaze',
    seats: 4,
    luggage: 3,
    driverName: 'Suresh Patil (Verified Chauffeur)',
    driverPhone: '+91 98231 44552',
    driverRating: 4.9,
    driverTrips: 1240,
    carPlate: 'MH-04-EK-8821',
    eta: '6 mins away',
    distanceKm: 24,
    amount: 1850,
    baseFare: 450,
    ratePerKm: 14,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
    ac: true
  },
  {
    id: 'cab_innova_crysta_vip',
    cabType: 'Prime SUV',
    carModel: 'Toyota Innova Crysta (7-Seater)',
    seats: 7,
    luggage: 5,
    driverName: 'Mahendra Shinde',
    driverPhone: '+91 99701 33214',
    driverRating: 4.95,
    driverTrips: 2150,
    carPlate: 'MH-12-PQ-9900',
    eta: '11 mins away',
    distanceKm: 180,
    amount: 4200,
    baseFare: 1200,
    ratePerKm: 20,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&auto=format&fit=crop&q=80',
    ac: true
  },
  {
    id: 'cab_mini_wagonr',
    cabType: 'Mini Hatchback',
    carModel: 'Maruti WagonR / Celerio',
    seats: 4,
    luggage: 2,
    driverName: 'Ganesh Jadhav',
    driverPhone: '+91 91580 88231',
    driverRating: 4.7,
    driverTrips: 820,
    carPlate: 'MH-15-BD-4122',
    eta: '4 mins away',
    distanceKm: 15,
    amount: 980,
    baseFare: 250,
    ratePerKm: 12,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
    ac: true
  }
];

// ---------------------------------------------------------------------------
// 6. BUSES MOCK DATA
// ---------------------------------------------------------------------------
export const mockBuses: MockBus[] = [
  {
    id: 'bus_purple_travels_volvo',
    operatorName: 'Purple Travels (Prasanna Purple)',
    busType: 'Multi-Axle Volvo Sleeper',
    route: 'Mumbai to Goa (Via Pune - Kolhapur)',
    origin: 'Mumbai Borivali',
    destination: 'Panaji (Goa)',
    departureTime: '20:30 PM',
    arrivalTime: '08:45 AM (Next Day)',
    duration: '12h 15m',
    amount: 1450,
    rating: 4.8,
    reviewsCount: 520,
    availableSeats: 16,
    boardingPoints: ['Borivali (W)', 'Andheri East', 'Vashi Toll Plaza', 'Pune Wakad'],
    droppingPoints: ['Mapusa Bus Stand', 'Panaji KTC Stand', 'Margao Old Station'],
    amenities: ['Individual USB Charging', 'Reading Lamp', 'Sanitized Bedding', 'Water Bottle', 'Live GPS Tracking']
  },
  {
    id: 'bus_neeta_scania_ac',
    operatorName: 'Neeta Tours & Travels',
    busType: 'AC Sleeper (2+1)',
    route: 'Mumbai to Mahabaleshwar',
    origin: 'Mumbai Dadar TT',
    destination: 'Mahabaleshwar Market',
    departureTime: '06:00 AM',
    arrivalTime: '12:30 PM',
    duration: '6h 30m',
    amount: 850,
    rating: 4.6,
    reviewsCount: 390,
    availableSeats: 22,
    boardingPoints: ['Dadar TT', 'Chembur Diamond Garden', 'Vashi Flyover'],
    droppingPoints: ['Panchgani Bus Stand', 'Mahabaleshwar ST Stand'],
    amenities: ['AC Cooling', 'Pushback Berths', 'Music System', 'Luggage Compartment']
  },
  {
    id: 'bus_konduskar_bharatbenz',
    operatorName: 'Konduskar Travels',
    busType: 'Bharat Benz AC Seater',
    route: 'Pune to Kolhapur / Ratnagiri',
    origin: 'Pune Swargate',
    destination: 'Ratnagiri ST Depot',
    departureTime: '15:15 PM',
    arrivalTime: '21:30 PM',
    duration: '6h 15m',
    amount: 620,
    rating: 4.7,
    reviewsCount: 280,
    availableSeats: 28,
    boardingPoints: ['Swargate Bus Stand', 'Katraj Wonder City'],
    droppingPoints: ['Chiplun', 'Sangameshwar', 'Ratnagiri'],
    amenities: ['Ergonomic Pushback Seats', 'Free Newspaper', 'Bottle Holder', 'First Aid Box']
  }
];

// ---------------------------------------------------------------------------
// 7. HOLIDAY PACKAGES MOCK DATA
// ---------------------------------------------------------------------------
export const mockHolidayPackages: MockHolidayPackage[] = [
  {
    id: 'pkg_ratnagiri_1',
    title: 'Ratnagiri Beach & Alphonso Mango Tour',
    destination: 'Ratnagiri',
    origin: 'Mumbai',
    durationDays: 3,
    durationNights: 2,
    vibe: 'Beach & Coastal',
    itineraryHighlights: [
      'Visit pristine Ganpatipule Temple & White Sand Beach',
      'Exclusive Alphonso Mango Orchard Tour & Tasting',
      'Historic Jaigad Fort & Lighthouse Sunset Walk',
      'Authentic Malvani Fish Thali & Solkadhi Experience'
    ],
    amount: 3800,
    price: 3800,
    rating: 4.8,
    reviewsCount: 124,
    isVerifiedAgent: true,
    agentName: 'Konkan Safar Tours',
    agentPhone: '+919876543210',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
    transportType: 'bus',
    inclusions: ['AC Bus Travel', 'Beachside Resort Stay', 'Alphonso Mango Farm Visit', 'All Meals Included'],
    description: 'Experience the magic of Konkan with our exclusive Ratnagiri tour. Visit pristine beaches, historic forts, and relish authentic Konkan cuisine.'
  },
  {
    id: 'pkg_goa_1',
    title: 'Goa Coastal Escapade & Water Sports',
    destination: 'Goa',
    origin: 'Pune',
    durationDays: 4,
    durationNights: 3,
    vibe: 'Beach & Coastal',
    itineraryHighlights: [
      'North Goa Calangute & Baga Beach Hopping',
      'Scuba Diving & Jet Ski Watersports at Grand Island',
      'South Goa Old Churches & Sunset Mandovi River Cruise',
      'Night Bazaar & Beach Shack Party Vibes'
    ],
    amount: 8900,
    price: 8900,
    rating: 4.9,
    reviewsCount: 342,
    isVerifiedAgent: true,
    agentName: 'Goa Vibes Travel',
    agentPhone: '+919988776655',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    transportType: 'flight',
    inclusions: ['Flight Tickets Included', '4-Star Beach Resort', 'Water Sports Package', 'Free Breakfast Buffet'],
    description: 'Discover Goa like never before. From north to south, explore beautiful beaches, historical churches, and vibrant markets with guided tours.'
  },
  {
    id: 'pkg_mahabaleshwar_1',
    title: 'Mahabaleshwar Hills & Strawberry Farm Tour',
    destination: 'Mahabaleshwar',
    origin: 'Mumbai',
    durationDays: 3,
    durationNights: 2,
    vibe: 'Hill Station',
    itineraryHighlights: [
      'Wilson Point & Arthur Seat Sunrise Views',
      'Venna Lake Boating & Horse Riding',
      'Fresh Strawberry Farm Plucking & Cream Tasting',
      'Panchgani Tableland Exploration'
    ],
    amount: 5500,
    price: 5500,
    rating: 4.7,
    reviewsCount: 88,
    isVerifiedAgent: true,
    agentName: 'Sahyadri Travels',
    agentPhone: '+919123456789',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    transportType: 'car',
    inclusions: ['Private Sedan Cab', 'Hillview Hotel Stay', 'Strawberry Picking Activity', 'Sightseeing Guide'],
    description: 'Relax in the cool mist of Mahabaleshwar. Enjoy scenic viewpoints, strawberry garden walks, and the serenity of Venna Lake.'
  },
  {
    id: 'pkg_shirdi_1',
    title: 'Shirdi & Shani Shingnapur Devotional Pilgrimage',
    destination: 'Shirdi',
    origin: 'Mumbai',
    durationDays: 2,
    durationNights: 1,
    vibe: 'Devotional & Pilgrimage',
    itineraryHighlights: [
      'VIP Sai Baba Samadhi Temple Special Darshan Pass',
      'Dwarkamai & Chavadi Guided Spiritual Walk',
      'Visit to Sacred Shani Shingnapur Village',
      'Prasad & Satvik Meals Included'
    ],
    amount: 2500,
    price: 2500,
    rating: 4.9,
    reviewsCount: 450,
    isVerifiedAgent: true,
    agentName: 'Sai Darshan Tours',
    agentPhone: '+919898989898',
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80',
    transportType: 'train',
    inclusions: ['Train Tickets', 'Hotel near Temple', 'Special VIP Darshan Pass', 'All Transfers'],
    description: 'A peaceful pilgrimage to the holy town of Shirdi. Enjoy comfortable stays, hassle-free temple darshans, and complete peace of mind.'
  }
];

// ---------------------------------------------------------------------------
// 8. PROMO COUPONS MOCK DATA & DISCOUNT VALIDATION
// ---------------------------------------------------------------------------
export const mockCoupons: MockCoupon[] = [
  {
    code: 'WELCOME500',
    type: 'flat',
    discount: 500,
    minAmount: 1000,
    description: 'Flat ₹500 discount on your first booking (Min order ₹1,000)',
    expiryDate: '2026-12-31'
  },
  {
    code: 'SAVE20',
    type: 'percentage',
    discount: 20,
    minAmount: 1500,
    maxDiscount: 2000,
    description: '20% off up to ₹2,000 across all vertical bookings',
    expiryDate: '2026-12-31'
  },
  {
    code: 'ROUTRIPO10',
    type: 'percentage',
    discount: 10,
    minAmount: 500,
    maxDiscount: 1500,
    description: '10% instant discount on flights, hotels, trains, and cabs',
    expiryDate: '2026-12-31'
  },
  {
    code: 'FLYHIGH1000',
    type: 'flat',
    discount: 1000,
    minAmount: 4000,
    description: 'Flat ₹1,000 off on Flight and Holiday Package bookings',
    expiryDate: '2026-12-31'
  },
  {
    code: 'SUMMERTRIP',
    type: 'percentage',
    discount: 15,
    minAmount: 2000,
    maxDiscount: 3000,
    description: '15% off Summer Holiday Special (Max ₹3,000)',
    expiryDate: '2026-12-31'
  },
  {
    code: 'FESTIVE300',
    type: 'flat',
    discount: 300,
    minAmount: 800,
    description: 'Flat ₹300 off on Train & Bus bookings',
    expiryDate: '2026-12-31'
  }
];

/**
 * Calculates discount and validates coupon conditions against a given subtotal
 */
export function calculateDiscount(coupon: MockCoupon, subtotal: number): {
  discountAmount: number;
  finalAmount: number;
  isValid: boolean;
  error?: string;
} {
  if (!coupon) {
    return { discountAmount: 0, finalAmount: subtotal, isValid: false, error: 'No coupon provided' };
  }

  if (subtotal < coupon.minAmount) {
    return {
      discountAmount: 0,
      finalAmount: subtotal,
      isValid: false,
      error: `Minimum booking amount of ₹${coupon.minAmount.toLocaleString('en-IN')} required for coupon ${coupon.code}`
    };
  }

  let calculatedDiscount = 0;
  if (coupon.type === 'flat') {
    calculatedDiscount = coupon.discount;
  } else if (coupon.type === 'percentage') {
    calculatedDiscount = Math.round((subtotal * coupon.discount) / 100);
    if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
      calculatedDiscount = coupon.maxDiscount;
    }
  }

  // Ensure discount doesn't exceed subtotal
  calculatedDiscount = Math.min(calculatedDiscount, subtotal);
  const finalAmount = Math.max(0, subtotal - calculatedDiscount);

  return {
    discountAmount: calculatedDiscount,
    finalAmount,
    isValid: true
  };
}

// ---------------------------------------------------------------------------
// 9. ACCOUNT MOCK DATA (USER PROFILE & PARTNER PROFILE)
// ---------------------------------------------------------------------------
export const mockUserProfile: MockUserProfile = {
  uid: 'usr_routripo_traveler_001',
  fullName: 'Sharad Raut',
  email: 'shrd.raut@gmail.com',
  phone: '+91 98765 43210',
  membershipTier: 'Platinum',
  routripoCoins: 850,
  savedTripsCount: 4,
  bookingHistory: [
    {
      id: 'BKG-9921',
      vertical: 'Tour Packages',
      title: 'Ratnagiri Beach & Alphonso Mango Tour',
      date: 'Aug 10, 2026',
      amount: 3300,
      originalAmount: 3800,
      discountApplied: 500,
      couponCode: 'WELCOME500',
      status: 'CONFIRMED',
      paymentMethod: 'UPI (GPay)'
    },
    {
      id: 'BKG-8812',
      vertical: 'Flights',
      title: 'IndiGo 6E-202 (BOM → DEL)',
      date: 'Jul 24, 2026',
      amount: 3720,
      originalAmount: 4650,
      discountApplied: 930,
      couponCode: 'SAVE20',
      status: 'COMPLETED',
      paymentMethod: 'Credit Card (Visa 3DS)'
    },
    {
      id: 'BKG-7740',
      vertical: 'Hotels',
      title: 'St LaURN Meditation Resort, Shirdi',
      date: 'Jun 15, 2026',
      amount: 3240,
      originalAmount: 3600,
      discountApplied: 360,
      couponCode: 'ROUTRIPO10',
      status: 'COMPLETED',
      paymentMethod: 'Razorpay NetBanking'
    }
  ]
};

export const mockPartnerProfile: MockPartnerProfile = {
  partnerId: 'partner_konkan_safars_99',
  businessName: 'Konkan Safar Tours & Travels LLP',
  contactPerson: 'Prathamesh Kadam',
  phone: '+91 98765 43210',
  email: 'partner.konkan@routripo.com',
  verified: true,
  kycStatus: 'VERIFIED',
  totalEarnings: 184500,
  pendingSettlements: 24300,
  activeListingsCount: 8,
  commissionRate: 0.10, // 10% platform fee
  recentBookings: [
    {
      bookingId: 'BKG-9921',
      serviceName: 'Ratnagiri Beach & Mango Tour (3D/2N)',
      customerName: 'Sharad Raut',
      grossAmount: 3800,
      payoutAmount: 3420,
      status: 'ESCROW_HELD',
      date: 'Aug 10, 2026'
    },
    {
      bookingId: 'BKG-9410',
      serviceName: 'Mahabaleshwar Private Sedan Cab',
      customerName: 'Sneha Deshmukh',
      grossAmount: 5500,
      payoutAmount: 4950,
      status: 'SETTLED',
      date: 'Aug 04, 2026'
    },
    {
      bookingId: 'BKG-9122',
      serviceName: 'Shirdi VIP Darshan Tour',
      customerName: 'Anil Kulkarni',
      grossAmount: 2500,
      payoutAmount: 2250,
      status: 'SETTLED',
      date: 'Jul 28, 2026'
    }
  ]
};

// ---------------------------------------------------------------------------
// 10. SIMULATED ASYNC FETCH FUNCTIONS (LATENCY SIMULATION VIA setTimeout)
// ---------------------------------------------------------------------------

export async function fetchMockFlights(query?: { from?: string; to?: string }): Promise<MockFlight[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query || (!query.from && !query.to)) {
        resolve(mockFlights);
        return;
      }
      const qFrom = (query.from || '').toLowerCase().trim();
      const qTo = (query.to || '').toLowerCase().trim();

      const filtered = mockFlights.filter(f => {
        const matchFrom = !qFrom || f.origin.toLowerCase().includes(qFrom) || f.originCode.toLowerCase().includes(qFrom);
        const matchTo = !qTo || f.destination.toLowerCase().includes(qTo) || f.destinationCode.toLowerCase().includes(qTo);
        return matchFrom && matchTo;
      });

      resolve(filtered.length > 0 ? filtered : mockFlights);
    }, 1000);
  });
}

export async function fetchMockTrains(query?: { from?: string; to?: string }): Promise<MockTrain[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query || (!query.from && !query.to)) {
        resolve(mockTrains);
        return;
      }
      const qFrom = (query.from || '').toLowerCase().trim();
      const qTo = (query.to || '').toLowerCase().trim();

      const filtered = mockTrains.filter(t => {
        const matchFrom = !qFrom || t.origin.toLowerCase().includes(qFrom) || t.originCode.toLowerCase().includes(qFrom);
        const matchTo = !qTo || t.destination.toLowerCase().includes(qTo) || t.destinationCode.toLowerCase().includes(qTo);
        return matchFrom && matchTo;
      });

      resolve(filtered.length > 0 ? filtered : mockTrains);
    }, 1000);
  });
}

export async function fetchMockHotels(query?: { city?: string; destination?: string }): Promise<MockHotel[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const locationQuery = (query?.city || query?.destination || '').toLowerCase().trim();
      if (!locationQuery) {
        resolve(mockHotels);
        return;
      }

      const filtered = mockHotels.filter(h =>
        h.city.toLowerCase().includes(locationQuery) ||
        h.location.toLowerCase().includes(locationQuery) ||
        h.name.toLowerCase().includes(locationQuery)
      );

      resolve(filtered.length > 0 ? filtered : mockHotels);
    }, 1000);
  });
}

export async function fetchMockCars(query?: { city?: string }): Promise<MockCar[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCars);
    }, 1000);
  });
}

export async function fetchMockCabs(query?: { pickup?: string; drop?: string }): Promise<MockCab[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCabs);
    }, 1000);
  });
}

export async function fetchMockBuses(query?: { from?: string; to?: string }): Promise<MockBus[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBuses);
    }, 1000);
  });
}

export async function fetchMockHolidayPackages(query?: { destination?: string }): Promise<MockHolidayPackage[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dest = (query?.destination || '').toLowerCase().trim();
      if (!dest || dest === 'all destinations') {
        resolve(mockHolidayPackages);
        return;
      }
      const filtered = mockHolidayPackages.filter(p => p.destination.toLowerCase().includes(dest));
      resolve(filtered.length > 0 ? filtered : mockHolidayPackages);
    }, 1000);
  });
}

export async function fetchMockCoupons(): Promise<MockCoupon[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCoupons);
    }, 1000);
  });
}

/**
 * Validates promo code asynchronously with simulated latency and calculates exact discounted amount
 */
export async function validateCouponCode(
  code: string,
  subtotal: number
): Promise<{
  valid: boolean;
  coupon?: MockCoupon;
  discountAmount: number;
  finalAmount: number;
  error?: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!code || !code.trim()) {
        resolve({
          valid: false,
          discountAmount: 0,
          finalAmount: subtotal,
          error: 'Please enter a promo code'
        });
        return;
      }

      const cleanCode = code.trim().toUpperCase();
      const matched = mockCoupons.find(c => c.code.toUpperCase() === cleanCode);

      if (!matched) {
        resolve({
          valid: false,
          discountAmount: 0,
          finalAmount: subtotal,
          error: 'Invalid or expired coupon'
        });
        return;
      }

      const result = calculateDiscount(matched, subtotal);
      if (!result.isValid) {
        resolve({
          valid: false,
          discountAmount: 0,
          finalAmount: subtotal,
          error: result.error || 'Invalid or expired coupon'
        });
        return;
      }

      resolve({
        valid: true,
        coupon: matched,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount
      });
    }, 600);
  });
}

export async function fetchMockUserProfile(): Promise<MockUserProfile> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUserProfile);
    }, 800);
  });
}

export async function fetchMockPartnerProfile(): Promise<MockPartnerProfile> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPartnerProfile);
    }, 800);
  });
}

export type MockPackage = MockHolidayPackage;

export const mockDataStore = {
  flights: mockFlights,
  trains: mockTrains,
  hotels: mockHotels,
  cars: mockCars,
  cabs: mockCabs,
  buses: mockBuses,
  packages: mockHolidayPackages,
  coupons: mockCoupons,
  fetchFlights: fetchMockFlights,
  fetchTrains: fetchMockTrains,
  fetchHotels: fetchMockHotels,
  fetchCars: fetchMockCars,
  fetchCabs: fetchMockCabs,
  fetchBuses: fetchMockBuses,
  fetchPackages: fetchMockHolidayPackages,
  fetchCoupons: fetchMockCoupons,
  validateCoupon: validateCouponCode,
  fetchUserProfile: fetchMockUserProfile,
  fetchPartnerProfile: fetchMockPartnerProfile
};

