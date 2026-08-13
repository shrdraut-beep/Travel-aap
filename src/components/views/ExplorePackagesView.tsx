import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Calendar, 
  Bus, 
  Plane, 
  Train, 
  MessageCircle, 
  ChevronDown, 
  Sparkles, 
  Check, 
  RotateCcw,
  SlidersHorizontal,
  Clock,
  ArrowUpDown,
  Lock,
  CheckCircle2,
  X,
  Shield,
  Info,
  CreditCard,
  QrCode,
  Building,
  User,
  Phone,
  Mail,
  Receipt,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export interface TourPackage {
  id: string;
  title: string;
  destination: string;
  origin: string;
  durationDays: number;
  durationNights: number;
  price: number;
  rating: number;
  reviewsCount: number;
  isVerifiedAgent: boolean;
  agentName: string;
  agentPhone: string;
  image: string;
  transportType: 'bus' | 'flight' | 'train' | 'car';
  inclusions: string[];
  description: string;
}

const DEFAULT_PACKAGES: TourPackage[] = [
  {
    id: 'pkg-1',
    title: 'Nashik to Ratnagiri Konkan Beach & Temple Special',
    destination: 'Ratnagiri',
    origin: 'Nashik',
    durationDays: 4,
    durationNights: 3,
    price: 12500,
    rating: 4.9,
    reviewsCount: 128,
    isVerifiedAgent: true,
    agentName: 'MahaKonkan Travels Nashik',
    agentPhone: '919876543210',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    transportType: 'bus',
    inclusions: ['AC Volvo Bus', '3 Star Beach Resort', 'Breakfast & Dinner', 'Ganpatipule Temple Tour'],
    description: 'Explore Ganpatipule beach, Ratnagiri fort, and authentic Konkani seafood with comfortable AC transport.'
  },
  {
    id: 'pkg-2',
    title: 'Nashik to New Delhi & Agra Heritage Capital Express',
    destination: 'New Delhi',
    origin: 'Nashik',
    durationDays: 6,
    durationNights: 5,
    price: 18000,
    rating: 4.8,
    reviewsCount: 94,
    isVerifiedAgent: true,
    agentName: 'Rajdhani Tours',
    agentPhone: '919812345678',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    transportType: 'train',
    inclusions: ['3A Train Tickets', 'Delhi Heritage Hotel', 'Taj Mahal Day Trip', 'Private Cab Sightseeing'],
    description: 'Complete Golden Triangle highlight covering Red Fort, Qutub Minar, India Gate & Taj Mahal.'
  },
  {
    id: 'pkg-3',
    title: 'Shirdi & Shani Shingnapur Express Pilgrimage',
    destination: 'Shirdi',
    origin: 'Nashik',
    durationDays: 2,
    durationNights: 1,
    price: 4500,
    rating: 4.9,
    reviewsCount: 210,
    isVerifiedAgent: true,
    agentName: 'Sai Krupa Travels Nashik',
    agentPhone: '919988776655',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    transportType: 'car',
    inclusions: ['VIP Pass Assistance', 'Hotel Stay Near Temple', 'Pure Veg Meals', 'Sanctuary Cab'],
    description: 'Hassle-free spiritual tour with guaranteed VIP darshan assistance and comfortable stay.'
  },
  {
    id: 'pkg-4',
    title: 'Mumbai Coastal & Elephanta Caves Explorer',
    destination: 'Mumbai',
    origin: 'Nashik',
    durationDays: 3,
    durationNights: 2,
    price: 8900,
    rating: 4.7,
    reviewsCount: 76,
    isVerifiedAgent: true,
    agentName: 'Gateway Tours Mumbai',
    agentPhone: '919822110033',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    transportType: 'bus',
    inclusions: ['Gateway Ferry Ticket', 'South Mumbai City Tour', 'Marine Drive Hotel', 'Breakfast Included'],
    description: 'Discover the vibrant city of Mumbai, Gateway of India, Elephanta Ferry, and Marine Drive sunset.'
  },
  {
    id: 'pkg-5',
    title: 'Goa Sun, Sand & Carnival Resort Vacation',
    destination: 'Goa',
    origin: 'Nashik',
    durationDays: 5,
    durationNights: 4,
    price: 24500,
    rating: 4.9,
    reviewsCount: 185,
    isVerifiedAgent: true,
    agentName: 'Konkan Breeze Agency',
    agentPhone: '919765432109',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    transportType: 'flight',
    inclusions: ['Direct Flights', '4-Star Beachfront Resort', 'Mandovi River Cruise', 'Breakfast & Drinks'],
    description: 'Ultimate Goa getaway with beachfront luxury, water sports discount coupons, and sunset cruise.'
  },
  {
    id: 'pkg-6',
    title: 'Mahabaleshwar & Panchgani Strawberry Hill Escape',
    destination: 'Mahabaleshwar',
    origin: 'Nashik',
    durationDays: 3,
    durationNights: 2,
    price: 7200,
    rating: 4.6,
    reviewsCount: 62,
    isVerifiedAgent: false,
    agentName: 'Sahyadri Travels',
    agentPhone: '919422334455',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    transportType: 'bus',
    inclusions: ['AC Bus Transfer', 'Hill View Resort', 'Mapro Garden Visit', 'Points Sightseeing'],
    description: 'Scenic hill station retreat featuring Arthur Seat point, Mapro Garden strawberry tasting, and Venna Lake.'
  }
];

const DESTINATION_OPTIONS = ['All Destinations', 'Ratnagiri', 'New Delhi', 'Shirdi', 'Mumbai', 'Goa', 'Mahabaleshwar'];

interface ExplorePackagesViewProps {
  lang?: string;
  onSelectPackage?: (pkg: TourPackage) => void;
}

export const ExplorePackagesView: React.FC<ExplorePackagesViewProps> = ({
  lang = 'en',
  onSelectPackage
}) => {
  const [selectedDestination, setSelectedDestination] = useState<string>('All Destinations');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Bargain Feature State
  const [bargainModalOpen, setBargainModalOpen] = useState(false);
  const [selectedBargainPkg, setSelectedBargainPkg] = useState<TourPackage | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [bargainSuccess, setBargainSuccess] = useState(false);

  const handleOpenBargain = (pkg: TourPackage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBargainPkg(pkg);
    setBargainModalOpen(true);
    setBargainSuccess(false);
    setOfferPrice('');
    setOfferMsg('');
  };

  const handleSubmitBargain = () => {
    setBargainSuccess(true);
    setTimeout(() => {
      setBargainModalOpen(false);
    }, 3000);
  };

  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'price_high' | 'recommended'>('recommended');
  const [selectedModalPackage, setSelectedModalPackage] = useState<TourPackage | null>(null);

  // CHECKOUT & PAYMENT FLOW STATE (COMMISSION SPLIT ARCHITECTURE)
  const [checkoutPkg, setCheckoutPkg] = useState<TourPackage | null>(null);
  const [travelersCount, setTravelersCount] = useState<number>(1);
  const [tripStartDate, setTripStartDate] = useState<string>(() => new Date().toISOString().substring(0, 10));
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custEmail, setCustEmail] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiVpa, setUpiVpa] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [completedVoucher, setCompletedVoucher] = useState<any | null>(null);

  const handleWhatsAppClick = (pkg: TourPackage) => {
    // Exact requested format: https://wa.me/<number>?text=<encoded_text>
    const templateMessage = `Hi, I'm interested in the [${pkg.title}] package, could you provide more details?`;
    const encodedText = encodeURIComponent(templateMessage);
    const cleanNumber = pkg.agentPhone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleStartCheckout = (pkg: TourPackage) => {
    setCheckoutPkg(pkg);
    setTravelersCount(1);
    setTripStartDate('2026-08-15');
    if (selectedModalPackage) setSelectedModalPackage(null);
  };

  const handleCompleteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutPkg) return;

    setIsProcessingPayment(true);

    setTimeout(() => {
      const totalAmount = checkoutPkg.price * travelersCount;
      const platformCommission = Math.round(totalAmount * 0.10); // 10% platform commission
      const vendorAmount = totalAmount - platformCommission; // 90% vendor payout
      const refId = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBooking = {
        id: refId,
        customerName: custName || 'Valued Traveler',
        customerPhone: custPhone || '',
        customerEmail: custEmail || '',
        packageName: checkoutPkg.title,
        total_amount: totalAmount,
        platform_commission: platformCommission,
        vendor_amount: vendorAmount,
        amount: totalAmount,
        tripStartDate: tripStartDate || new Date().toLocaleDateString(),
        payment_status: 'Held securely' as const,
        paymentStatus: 'Held in Escrow' as const,
        paymentMethod: paymentMethod === 'upi' ? `UPI (${upiVpa})` : paymentMethod === 'card' ? 'Visa / MasterCard' : 'Net Banking',
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      try {
        const existing = localStorage.getItem('mahakonkan_marketplace_bookings');
        const parsed = existing ? JSON.parse(existing) : [];
        const updated = [newBooking, ...parsed];
        localStorage.setItem('mahakonkan_marketplace_bookings', JSON.stringify(updated));
        window.dispatchEvent(new Event('mahakonkan_booking_created'));
      } catch (err) {
        console.warn("Local storage write warning:", err);
      }

      setIsProcessingPayment(false);
      setCompletedVoucher(newBooking);
      setCheckoutPkg(null);
    }, 1200);
  };

  const filteredPackages = useMemo(() => {
    return DEFAULT_PACKAGES.filter(pkg => {
      // 1. Destination check
      if (selectedDestination !== 'All Destinations' && pkg.destination.toLowerCase() !== selectedDestination.toLowerCase()) {
        return false;
      }

      // 2. Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = pkg.title.toLowerCase().includes(query);
        const matchesDest = pkg.destination.toLowerCase().includes(query);
        const matchesAgent = pkg.agentName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDest && !matchesAgent) return false;
      }

      // 3. Price slider check
      if (pkg.price > maxPrice) return false;

      // 4. Verified Agent check
      if (verifiedOnly && !pkg.isVerifiedAgent) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return 0; // recommended
    });
  }, [selectedDestination, searchQuery, maxPrice, verifiedOnly, sortBy]);

  const resetFilters = () => {
    setSelectedDestination('All Destinations');
    setSearchQuery('');
    setMaxPrice(30000);
    setVerifiedOnly(false);
    setSortBy('recommended');
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Title */}
      <div className="bg-emerald-50 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-sm relative overflow-hidden border border-emerald-100">
        <div className="relative z-10 max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {lang === 'mr' ? 'विशेष टूर पॅकेजेस शोधा' : 'Explore Curated Tour Packages'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {lang === 'mr' ? 'तुमच्या पुढील सहलीसाठी सर्वोत्तम पर्याय निवडा.' : 'Discover and connect with top-rated travel packages for your next trip.'}
          </p>
        </div>
      </div>

      {/* ADVANCED FILTERING & SORTING INTERFACE */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'mr' ? 'फिल्टर्स आणि शोध' : 'Search & Filter Packages'}</span>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs font-extrabold text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Filters Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Destination Dropdown / Search */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
              Destination
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                {DESTINATION_OPTIONS.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Title / Keywords Search Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
              Keywords
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tour title or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-extrabold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Price Range Slider Component */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
              <span>Max Price</span>
              <span className="text-emerald-600 font-extrabold text-xs">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2">
              <input
                type="range"
                min={2000}
                max={50000}
                step={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                <span>₹2,000</span>
                <span>₹50,000+</span>
              </div>
            </div>
          </div>

          {/* Sorting & Verified Agent Toggle */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
              Sort By
            </label>
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest Rating</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Toggles Row */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer border ${
              verifiedOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${verifiedOnly ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Verified Partners Only</span>
            {verifiedOnly && <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
          </button>

          <p className="text-xs font-extrabold text-slate-500">
            Showing <span className="text-emerald-600 font-black">{filteredPackages.length}</span> Tour Packages
          </p>
        </div>
      </div>

      {/* PACKAGE GRID */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base">No matching packages found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your price range, clearing filters, or searching for a different destination like Ratnagiri or New Delhi.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              {/* Image & Badges */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                {/* Destination Badge */}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{pkg.destination}</span>
                </div>

                {/* Transport Type Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                  {pkg.transportType === 'bus' && <Bus className="w-3 h-3 text-emerald-600" />}
                  {pkg.transportType === 'flight' && <Plane className="w-3 h-3 text-sky-600" />}
                  {pkg.transportType === 'train' && <Train className="w-3 h-3 text-emerald-600" />}
                  <span className="uppercase">{pkg.transportType}</span>
                </div>

                {/* Title overlay at bottom of image */}
                <div className="absolute bottom-3 left-3 right-3 space-y-1">
                  <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block">
                    {pkg.durationDays} Days / {pkg.durationNights} Nights • Ex-{pkg.origin}
                  </span>
                  <h3 className="font-extrabold text-white text-base leading-snug drop-shadow-xs line-clamp-2">
                    {pkg.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Agent Header & Rating */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900 truncate max-w-[150px]">
                        {pkg.agentName}
                      </span>
                      {pkg.isVerifiedAgent && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-1 rounded-lg border border-amber-200 text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{pkg.rating}</span>
                    <span className="text-[10px] font-normal text-amber-700">({pkg.reviewsCount})</span>
                  </div>
                </div>

                {/* Inclusions Chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Key Highlights</p>
                    <button
                      onClick={() => setSelectedModalPackage(pkg)}
                      className="text-[10px] font-extrabold text-emerald-600 hover:underline cursor-pointer"
                    >
                      View Full Itinerary →
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.inclusions.map((inc, i) => (
                      <span
                        key={i}
                        className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200/60"
                      >
                        ✓ {inc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* TRUST & SAFETY BADGES (Prominently displayed near Book/WhatsApp button) */}
                <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-2xl p-2.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3 h-3" />
                      100% Money-Back Guarantee
                    </span>
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                      <Lock className="w-3 h-3" />
                      Verified Safe Booking
                    </span>
                  </div>

                  {/* Escrow text snippet below booking button */}
                  <p className="text-[10px] font-bold text-slate-600 leading-tight flex items-start gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Your money is safe. Payments are held securely and released to the partner only after your trip starts.</span>
                  </p>
                </div>

                {/* Pricing & Booking / WhatsApp Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Per Person</span>
                    <span className="text-xl font-black text-slate-900">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* ONLINE CHECKOUT BOOK NOW BUTTON */}
                    <button
                      onClick={() => handleStartCheckout(pkg)}
                      className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
                      title={`Book ${pkg.title} online securely`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Book Now</span>
                    </button>
                    <button
                      onClick={(e) => handleOpenBargain(pkg, e)}
                      className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>वाटाघाटी करा</span>
                    </button>

                    {/* DYNAMIC WHATSAPP CLICK-TO-CHAT BUTTON */}
                    <button
                      onClick={() => handleWhatsAppClick(pkg)}
                      className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
                      title={`Contact ${pkg.agentName} on WhatsApp for ${pkg.title}`}
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PACKAGE DETAILS & TRUST & SAFETY MODAL */}
      {selectedModalPackage && (
        <div className="fixed inset-0 z-[300] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative my-8 max-h-[90vh] overflow-y-auto flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setSelectedModalPackage(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {selectedModalPackage.destination}
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {selectedModalPackage.durationDays} Days / {selectedModalPackage.durationNights} Nights
                </span>
                {selectedModalPackage.isVerifiedAgent && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Partner
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {selectedModalPackage.title}
              </h2>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {selectedModalPackage.description}
              </p>
            </div>

            {/* Agent Info Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Organized By</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedModalPackage.agentName}</span>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-xl border border-amber-200 font-black text-xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{selectedModalPackage.rating} ({selectedModalPackage.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Inclusions List */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Package Inclusions & Amenities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedModalPackage.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PROMINENT TRUST & SAFETY BADGES & ESCROW NOTICE */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span className="font-black text-sm text-slate-900">Platform Escrow Protection Guarantee</span>
                </div>
              </div>

              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Money-Back Guarantee</span>
                </div>
                <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>Verified Safe Booking</span>
                </div>
              </div>

              {/* Exact snippet below booking button */}
              <p className="text-xs font-bold text-slate-700 leading-relaxed bg-white/80 p-3 rounded-2xl border border-emerald-200/60">
                "Your money is safe. Payments are held securely and released to the partner only after your trip starts."
              </p>
            </div>

            {/* Footer Action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Price Per Person</span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{selectedModalPackage.price.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartCheckout(selectedModalPackage)}
                  className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-black text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Book Now (Pay Online)</span>
                </button>
                <button
                  onClick={() => handleOpenBargain(selectedModalPackage)}
                  className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-2xl font-black text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>वाटाघाटी करा (Make an Offer)</span>
                </button>

                <button
                  onClick={() => {
                    handleWhatsAppClick(selectedModalPackage);
                    setSelectedModalPackage(null);
                  }}
                  className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-black text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Book & Chat on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHECKOUT SCREEN & ESCROW PAYMENT FLOW (CUSTOMER SIDE)                     */}
      {/* ========================================================================= */}
      {checkoutPkg && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 pt-24 overflow-y-auto flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl border border-slate-200 relative my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Checkout & Secure Booking</h3>
                  <p className="text-xs text-slate-500 font-semibold">Payment Routing & Escrow Protection</p>
                </div>
              </div>

              <button
                onClick={() => setCheckoutPkg(null)}
                className="p-2 bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Package Details Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {checkoutPkg.destination} • {checkoutPkg.durationDays} Days
                </span>
                <span className="text-xs font-bold text-slate-500">
                  By {checkoutPkg.agentName}
                </span>
              </div>
              <h4 className="font-black text-slate-900 text-sm">{checkoutPkg.title}</h4>
              <p className="text-xs font-semibold text-slate-600 flex flex-col">
                <span>₹{checkoutPkg.price.toLocaleString('en-IN')} per person</span>
                <span className="text-[10px] text-slate-500">(Including all taxes)</span>
              </p>
            </div>

            <form onSubmit={handleCompleteCheckout} className="space-y-4">
              {/* Traveler Count & Departure Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Number of Travelers *</label>
                  <select
                    value={travelersCount}
                    onChange={(e) => setTravelersCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Traveler' : 'Travelers'}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Trip Departure Date *</label>
                  <input
                    type="date"
                    value={tripStartDate}
                    onChange={(e) => setTripStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="space-y-2 pt-1">
                <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">Customer Contact Info</h5>
                <div className="space-y-2">
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="Mobile / WhatsApp"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BASE PRICE & TOTAL PAYABLE */}
              <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="text-xs font-extrabold text-slate-700">Base Package Price × {travelersCount}</span>
                  <span className="font-black text-slate-900 text-sm">
                    ₹{(checkoutPkg.price * travelersCount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start justify-between pt-2 font-black text-slate-900 text-sm">
                    <div className="flex flex-col">
                      <span>Total Amount Payable</span>
                      <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">(Including all taxes)</span>
                    </div>
                    <span className="text-emerald-700 text-base">₹{(checkoutPkg.price * travelersCount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* MANDATORY TRUST & ESCROW MESSAGE */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-amber-950 leading-snug">
                  "Your payment is secured and held in escrow until your trip completes."
                </p>
              </div>

              {/* Payment Gateway Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'upi'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase">UPI / GPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'card'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase">Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'netbanking'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Building className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase">NetBanking</span>
                  </button>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      placeholder="Enter VPA (e.g. mobile@upi)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Escrow Route Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay Securely via UPI/Card (₹{(checkoutPkg.price * travelersCount).toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETED BOOKING VOUCHER MODAL */}
      {completedVoucher && (
        <div className="fixed inset-0 z-[400] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 text-center relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 inline-block">
                REF: {completedVoucher.id}
              </span>
              <h3 className="text-xl font-black text-slate-900">Payment Secured in Escrow!</h3>
              <p className="text-xs text-slate-500 font-semibold">Your tour booking has been confirmed.</p>
            </div>

            {/* Escrow Notice */}
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-left flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-amber-950 leading-snug">
                "Your payment is secured and held in escrow until your trip completes."
              </p>
            </div>

            {/* Financial Ledger Split Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Tour Package:</span>
                <span className="font-extrabold text-slate-900 text-right max-w-[200px] truncate">{completedVoucher.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-extrabold text-slate-900">{completedVoucher.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Total Amount Paid:</span>
                <span className="font-black text-slate-900">₹{completedVoucher.total_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-indigo-700 font-bold border-t border-slate-200 pt-1.5">
                <span>Platform Fee (10%):</span>
                <span>₹{completedVoucher.platform_commission.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Vendor Net Escrow Share (90%):</span>
                <span>₹{completedVoucher.vendor_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold">
                <span className="text-slate-500">Payment Status:</span>
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[10px] font-black">
                  Held securely
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => setCompletedVoucher(null)}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Close Booking Receipt
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Bargain Modal */}
      {bargainModalOpen && selectedBargainPkg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !bargainSuccess && setBargainModalOpen(false)} />
          <div className="relative bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {bargainSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-white">Offer Sent!</h3>
                <p className="text-sm text-slate-400">
                  Your offer of ₹{offerPrice} for {selectedBargainPkg.title} has been sent to top-rated partners. They will contact you shortly if accepted.
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-indigo-400" />
                      वाटाघाटी करा (Negotiate)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Submit your counter-offer directly to the partner.</p>
                  </div>
                  <button onClick={() => setBargainModalOpen(false)} className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-400 transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs text-slate-400 font-semibold mb-1">Original Price</p>
                    <p className="text-xl font-black text-white flex items-center gap-2">
                      ₹{selectedBargainPkg.price.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">My Offer Price (₹)</label>
                      <input 
                        type="number" 
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        placeholder={`e.g. ${selectedBargainPkg.price - 2000}`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">Short Message (Optional)</label>
                      <textarea 
                        value={offerMsg}
                        onChange={(e) => setOfferMsg(e.target.value)}
                        placeholder="I'm looking to book immediately if we can agree on this price..."
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm resize-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmitBargain}
                    disabled={!offerPrice}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    Submit Offer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

