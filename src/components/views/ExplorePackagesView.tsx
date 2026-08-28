import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authedFetch } from '../../utils/apiClient';
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
  Compass as Sparkles, 
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
  HelpCircle,
  Tag,
  Gift,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Users,
  Minus,
  Plus,
  ArrowRight
} from 'lucide-react';
import { mockCoupons, validateCouponCode, MockCoupon } from '../../data/mockDataStore';
import { BookingFunnelLayout } from '../travel/BookingFunnelLayout';
import { SearchResultsToolbar } from '../travel/SearchResultsToolbar';

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
    id: 'pkg-konkan-1',
    title: 'Konkan Coastal Paradise & Forts Safari',
    destination: 'Ratnagiri',
    origin: 'Mumbai',
    durationDays: 4,
    durationNights: 3,
    price: 12500,
    rating: 4.9,
    reviewsCount: 148,
    isVerifiedAgent: true,
    agentName: 'Konkan Magic Travels',
    agentPhone: '+919876543210',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80',
    transportType: 'bus',
    inclusions: ['AC Transport', '3-Star Resort Stay', 'Alphonso Mango Farm Tour', 'Breakfast & Dinner'],
    description: 'Experience pristine beaches, historic coastal forts of Ratnagiri, Ganpatipule temple visit, and traditional Konkani seafood delicacies.'
  },
  {
    id: 'pkg-goa-1',
    title: 'Magical Goa Beach Resort & Sunset Cruise',
    destination: 'Goa',
    origin: 'Mumbai',
    durationDays: 5,
    durationNights: 4,
    price: 18999,
    rating: 4.8,
    reviewsCount: 312,
    isVerifiedAgent: true,
    agentName: 'Goa Horizon Tours',
    agentPhone: '+919822114455',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    transportType: 'flight',
    inclusions: ['Return Flight', '4-Star Beachfront Hotel', 'Mandovi Sunset Cruise', 'Water Sports Package'],
    description: 'Unwind on North and South Goa beaches, enjoy luxury catamaran sunset cruise, nightlife tours, and heritage churches of Old Goa.'
  },
  {
    id: 'pkg-shirdi-1',
    title: 'Divine Shirdi Sai Baba & Shanishingnapur Yatra',
    destination: 'Shirdi',
    origin: 'Mumbai',
    durationDays: 2,
    durationNights: 1,
    price: 4999,
    rating: 4.9,
    reviewsCount: 420,
    isVerifiedAgent: true,
    agentName: 'Sai Shradha Yatra',
    agentPhone: '+919422335577',
    image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
    transportType: 'bus',
    inclusions: ['VIP Darshan Pass', 'Deluxe Hotel Stay', 'AC Bus Transport', 'Mahaprasad Lunch'],
    description: 'Hassle-free spiritual journey with guaranteed VIP temple entrance pass, comfortable AC Volvo bus transport, and peaceful stay.'
  },
  {
    id: 'pkg-mahabaleshwar-1',
    title: 'Serene Mahabaleshwar & Panchgani Hill Retreat',
    destination: 'Mahabaleshwar',
    origin: 'Mumbai',
    durationDays: 3,
    durationNights: 2,
    price: 8499,
    rating: 4.7,
    reviewsCount: 95,
    isVerifiedAgent: true,
    agentName: 'Sahyadri Travels',
    agentPhone: '+919833667788',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    transportType: 'car',
    inclusions: ['Private Car Sightseeing', 'Strawberry Farm Visit', 'Valley View Villa', 'Breakfast included'],
    description: 'Explore Venna Lake, Arthur seat point, Mapro garden strawberry tasting, and lush green mountain panoramas of Mahabaleshwar.'
  },
  {
    id: 'pkg-delhi-1',
    title: 'Golden Triangle & Delhi Heritage Experience',
    destination: 'New Delhi',
    origin: 'Mumbai',
    durationDays: 6,
    durationNights: 5,
    price: 24999,
    rating: 4.9,
    reviewsCount: 180,
    isVerifiedAgent: true,
    agentName: 'Royal India Expeditions',
    agentPhone: '+919811002233',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    transportType: 'flight',
    inclusions: ['Flight Tickets', 'Taj Mahal Day Trip', '5-Star Hotel Stay', 'English/Hindi Tour Guide'],
    description: 'Comprehensive Golden Triangle tour covering Red Fort, Qutub Minar, India Gate, and a day excursion to Agra Taj Mahal.'
  }
];

const DESTINATION_OPTIONS = ['All Destinations', 'Ratnagiri', 'New Delhi', 'Shirdi', 'Mumbai', 'Goa', 'Mahabaleshwar'];

interface ExplorePackagesViewProps {
  lang?: string;
  onSelectPackage?: (pkg: TourPackage) => void;
  onBookNow?: (item: any) => void;
  onBack?: () => void;
}

export const ExplorePackagesView: React.FC<ExplorePackagesViewProps> = ({
  lang = 'en',
  onSelectPackage,
  onBookNow,
  onBack
}) => {
  const navigate = useNavigate();
  const isMr = lang === 'mr';

  const [origin, setOrigin] = useState<string>('Mumbai');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [tripStartDate, setTripStartDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [travelersCount, setTravelersCount] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(true);

  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'price_high' | 'recommended'>('recommended');
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('grid');
  
  const [selectedModalPackage, setSelectedModalPackage] = useState<TourPackage | null>(null);

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
    }, 2500);
  };

  const handlePackageSearch = () => {
    setIsLoading(true);
    setHasSearched(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  const handleWhatsAppClick = (pkg: TourPackage) => {
    const templateMessage = `Hi, I'm interested in the [${pkg.title}] package, could you provide more details?`;
    const encodedText = encodeURIComponent(templateMessage);
    const cleanNumber = pkg.agentPhone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleStartCheckout = (pkg: TourPackage) => {
    if (onBookNow) {
      onBookNow({
        id: pkg.id,
        title: pkg.title,
        vertical: 'package',
        subtitle: `${pkg.origin} ➔ ${pkg.destination}`,
        location: `${pkg.origin} to ${pkg.destination}`,
        time: `${pkg.durationDays} Days / ${pkg.durationNights} Nights`,
        amount: pkg.price * travelersCount,
        image: pkg.image,
        provider: pkg.agentName,
        meta: { 
          rating: pkg.rating,
          transportType: pkg.transportType,
          inclusions: pkg.inclusions,
          travelers: travelersCount
        }
      });
      return;
    }
    navigate('/checkout', {
      state: {
        item: {
          id: pkg.id,
          title: pkg.title,
          vertical: 'package',
          subtitle: `${pkg.origin} ➔ ${pkg.destination}`,
          location: `${pkg.origin} to ${pkg.destination}`,
          time: `${pkg.durationDays} Days / ${pkg.durationNights} Nights`,
          amount: pkg.price * travelersCount,
          image: pkg.image,
          provider: pkg.agentName,
          meta: { 
            rating: pkg.rating,
            transportType: pkg.transportType,
            inclusions: pkg.inclusions,
            travelers: travelersCount
          }
        },
        currencySymbol: '₹',
        lang
      }
    });
  };

  const filteredPackages = useMemo(() => {
    return DEFAULT_PACKAGES.filter(pkg => {
      if (selectedDestination && selectedDestination !== 'All Destinations' && pkg.destination.toLowerCase() !== selectedDestination.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = pkg.title.toLowerCase().includes(query);
        const matchesDest = pkg.destination.toLowerCase().includes(query);
        const matchesAgent = pkg.agentName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDest && !matchesAgent) return false;
      }
      if (pkg.price > maxPrice) return false;
      if (verifiedOnly && !pkg.isVerifiedAgent) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return 0;
    });
  }, [selectedDestination, searchQuery, maxPrice, verifiedOnly, sortBy]);

  const resetFilters = () => {
    setSelectedDestination('');
    setSearchQuery('');
    setMaxPrice(50000);
    setVerifiedOnly(false);
    setSortBy('recommended');
  };

  const renderPassengerSelector = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">{isMr ? 'प्रवाशांची संख्या' : 'Travelers'}</h4>
          <p className="text-xs text-slate-500">{isMr ? 'या टूरसाठी प्रवासी निवडा' : 'Select total guests for this package'}</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 rounded-xl p-1">
          <button 
            type="button"
            onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))} 
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 cursor-pointer"
          >
            <Minus className="w-4 h-4"/>
          </button>
          <span className="font-black text-slate-900 w-4 text-center">{travelersCount}</span>
          <button 
            type="button"
            onClick={() => setTravelersCount(Math.min(10, travelersCount + 1))} 
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  );

  const renderResultsToolbar = () => (
    <SearchResultsToolbar
      sortOptions={[
        { key: 'recommended', label: isMr ? 'शिफारस केलेले' : 'Recommended' },
        { key: 'rating', label: isMr ? 'सर्वोत्तम रेटिंग' : 'Highest Rating' },
        { key: 'price_low', label: isMr ? 'किंमत: कमी ते जास्त' : 'Price: Low to High' },
        { key: 'price_high', label: isMr ? 'किंमत: जास्त ते कमी' : 'Price: High to Low' }
      ]}
      activeSort={sortBy}
      onSortChange={(val) => setSortBy(val as any)}
      toggles={[
        {
          key: 'verified',
          label: isMr ? 'फक्त सत्यापित' : 'Verified Partners',
          active: verifiedOnly,
          onToggle: () => setVerifiedOnly(!verifiedOnly)
        }
      ]}
      viewMode={layoutMode}
      onViewModeChange={(m) => setLayoutMode(m)}
      lang={lang}
    />
  );

  const renderResults = () => (
    <div className="space-y-6">
      {/* Quick Keywords & Filter Pills */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={isMr ? 'शहर किंवा टायटल शोधा...' : 'Filter by title, city or agent...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDestination || 'All Destinations'}
            onChange={(e) => setSelectedDestination(e.target.value === 'All Destinations' ? '' : e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800 focus:outline-none"
          >
            {DESTINATION_OPTIONS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          
          {(searchQuery || selectedDestination || verifiedOnly) && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {filteredPackages.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base">
              {isMr ? 'पॅकेजेस सापडले नाहीत' : 'No matching tour packages found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isMr ? 'कृपया फिल्टर किंवा शोध शब्द बदलून पहा.' : 'Try adjusting your filters or search keywords.'}
            </p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
          >
            {isMr ? 'सर्व फिल्टर्स रिसेट करा' : 'Clear All Filters'}
          </button>
        </div>
      ) : (
        <div className={layoutMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
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

                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{pkg.destination}</span>
                </div>

                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                  {pkg.transportType === 'bus' && <Bus className="w-3 h-3 text-emerald-600" />}
                  {pkg.transportType === 'flight' && <Plane className="w-3 h-3 text-sky-600" />}
                  {pkg.transportType === 'train' && <Train className="w-3 h-3 text-emerald-600" />}
                  <span className="uppercase">{pkg.transportType}</span>
                </div>

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
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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

                  <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-1 rounded-lg border border-amber-200 text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{pkg.rating}</span>
                    <span className="text-[10px] font-normal text-amber-700">({pkg.reviewsCount})</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Highlights</p>
                    <button
                      type="button"
                      onClick={() => setSelectedModalPackage(pkg)}
                      className="text-[10px] font-extrabold text-emerald-600 hover:underline cursor-pointer"
                    >
                      View Details →
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

                <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-2xl p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3 h-3" />
                      100% Money-Back Guarantee
                    </span>
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                      <Lock className="w-3 h-3" />
                      Verified Safe Escrow
                    </span>
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Package Price</span>
                    <div className="text-xl font-black text-slate-900 flex items-baseline gap-1">
                      <span>₹{pkg.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-normal text-slate-500">/person</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleOpenBargain(pkg, e)}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-black text-xs border border-amber-300 transition-all flex items-center gap-1 cursor-pointer"
                      title="Make an Offer"
                    >
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>Bargain</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartCheckout(pkg)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isMr ? 'बुक करा' : 'Book Now'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BARGAIN OFFER MODAL */}
      {bargainModalOpen && selectedBargainPkg && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Bargain & Custom Offer</h3>
                  <p className="text-[11px] font-bold text-slate-500 line-clamp-1">{selectedBargainPkg.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBargainModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bargainSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-lg text-slate-900">Offer Sent to Agent!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  {selectedBargainPkg.agentName} will review your offer of ₹{Number(offerPrice || 0).toLocaleString('en-IN')} and respond shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500">Listed Price:</span>
                  <span className="font-black text-slate-900 text-sm">₹{selectedBargainPkg.price.toLocaleString('en-IN')} /person</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase text-slate-600">Your Offer Price (Per Person)</label>
                  <input
                    type="number"
                    placeholder={`e.g. ${Math.round(selectedBargainPkg.price * 0.9)}`}
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase text-slate-600">Note for Agent (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="We are a group of travelers..."
                    value={offerMsg}
                    onChange={(e) => setOfferMsg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitBargain}
                  disabled={!offerPrice || Number(offerPrice) <= 0}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  Send Price Offer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL PACKAGE DETAIL ITINERARY MODAL */}
      {selectedModalPackage && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">{selectedModalPackage.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedModalPackage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={selectedModalPackage.image}
              alt={selectedModalPackage.title}
              className="w-full h-44 object-cover rounded-2xl"
            />

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {selectedModalPackage.description}
              </p>

              <div>
                <h4 className="text-xs font-black uppercase text-slate-500 mb-2">Package Inclusions</h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                  {selectedModalPackage.inclusions.map((inc, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-200/60 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase block">Verified Tour Partner</span>
                  <span className="text-xs font-bold text-slate-900">{selectedModalPackage.agentName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleWhatsAppClick(selectedModalPackage)}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="text-lg font-black text-slate-900">
                ₹{selectedModalPackage.price.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">/person</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const pkg = selectedModalPackage;
                  setSelectedModalPackage(null);
                  handleStartCheckout(pkg);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl shadow-md cursor-pointer"
              >
                Book Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <BookingFunnelLayout
      mode="package"
      onBack={onBack || (() => navigate(-1))}
      origin={origin}
      setOrigin={setOrigin}
      destination={selectedDestination}
      setDestination={setSelectedDestination}
      date={tripStartDate}
      setDate={setTripStartDate}
      onSearch={handlePackageSearch}
      isLoading={isLoading}
      hasSearched={hasSearched}
      lang={lang}
      passengerSummary={`${travelersCount} ${isMr ? 'प्रवासी' : 'Travelers'}`}
      renderPassengerSelector={renderPassengerSelector}
      renderResultsToolbar={renderResultsToolbar}
      renderResults={renderResults}
    />
  );
};
