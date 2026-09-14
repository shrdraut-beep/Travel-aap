import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  TrendingDown,
  MessageSquare,
  CheckCircle2,
  Lock,
  Phone,
  MapPin,
  Flame,
  Scale,
  Gem,
  Tag,
  Eye,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { BargainingTrip, VendorBidOffer } from './types';

interface VendorOffersViewProps {
  trip: BargainingTrip;
  offers: VendorBidOffer[];
  onBack: () => void;
  onAcceptAndLock: (offer: VendorBidOffer) => void;
  onOpenChat: (offer: VendorBidOffer) => void;
  onUpdateOfferPrice: (offerId: string, newPrice: number) => void;
  onUnlockOffline: () => void;
}

export const VendorOffersView: React.FC<VendorOffersViewProps> = ({
  trip,
  offers,
  onBack,
  onAcceptAndLock,
  onOpenChat,
  onUpdateOfferPrice,
  onUnlockOffline
}) => {
  // 15-Minute Auction Timer Loop & 3-Minute Bid Window
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const elapsed = Math.floor((Date.now() - trip.auctionStartTime) / 1000);
    const left = trip.auctionTotalSeconds - elapsed;
    return left > 0 ? left : 0;
  });

  const [windowSecondsRemaining, setWindowSecondsRemaining] = useState<number>(() => {
    const elapsed = Math.floor((Date.now() - trip.auctionStartTime) / 1000);
    const inCurrentWindow = elapsed % trip.bidWindowSeconds;
    return trip.bidWindowSeconds - inCurrentWindow;
  });

  // Live Activity Urgency Indicators (Requirement 10)
  const activityMessages = [
    '⚡ 2 verified vendors are viewing your trip requirement right now...',
    '🏷️ Verified Partner #842 is adjusting their quote downward...',
    '🔥 Verified Partner #311 just dropped their quote by ₹1,200!',
    '👀 4 regional fleet partners are competing to win your trip...',
    '✨ A partner just added complimentary airport pickup to their bid!'
  ];
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // Inline Counter / Change Amount State (Requirement 4)
  const [counterEditingOfferId, setCounterEditingOfferId] = useState<string | null>(null);
  const [customCounterAmount, setCustomCounterAmount] = useState<number>(0);
  const [expandedMediaOfferId, setExpandedMediaOfferId] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<Record<string, number>>({});

  // Countdown intervals
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });

      setWindowSecondsRemaining(prev => {
        if (prev <= 1) return trip.bidWindowSeconds;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [trip.bidWindowSeconds]);

  // Activity message rotation
  useEffect(() => {
    const actInterval = setInterval(() => {
      setCurrentActivityIndex(prev => (prev + 1) % activityMessages.length);
    }, 4000);
    return () => clearInterval(actInterval);
  }, [activityMessages.length]);

  const isAuctionExpired = secondsRemaining === 0;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Requirement 3: Strictly sorted from Lowest to Highest Price
  const sortedOffers = useMemo(() => {
    return [...offers].sort((a, b) => a.totalPrice - b.totalPrice);
  }, [offers]);

  const lowestOffer = sortedOffers[0];
  const potentialSavings = lowestOffer
    ? Math.max(0, trip.targetBudget - lowestOffer.totalPrice)
    : 0;

  const handleStartCounter = (offer: VendorBidOffer) => {
    setCounterEditingOfferId(offer.id);
    setCustomCounterAmount(Math.round(offer.totalPrice * 0.95));
  };

  const handleSendCounter = (offerId: string) => {
    if (customCounterAmount > 0) {
      onUpdateOfferPrice(offerId, customCounterAmount);
      setCounterEditingOfferId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 animate-in fade-in duration-200">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Go back to bargaining"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                  {trip.id}
                </span>
                <h1 className="text-[15px] font-black text-slate-900 truncate">
                  {trip.title}
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {trip.route}
              </p>
            </div>
          </div>

          {/* Overall 15-Minute Auction Timer Display */}
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900 text-white font-mono text-[12px] font-bold shadow-xs">
            <Clock className={`w-3.5 h-3.5 ${isAuctionExpired ? 'text-rose-400' : 'text-amber-400 animate-pulse'}`} />
            <span>{isAuctionExpired ? 'EXPIRED' : formatTimer(secondsRemaining)}</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-3 space-y-3">
        {/* Requirement 10: Live Activity Urgency Banner */}
        {!isAuctionExpired && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-xs transition-all">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
            <p className="text-[12px] font-bold text-amber-950 truncate flex-1">
              {activityMessages[currentActivityIndex]}
            </p>
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full shrink-0">
              Live
            </span>
          </div>
        )}

        {/* 3-Minute Bid-Lowering Window & 15-Minute Auction Indicator (Requirement 8) */}
        {!isAuctionExpired ? (
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-sky-50 text-sky-600 font-bold">
                <TrendingDown className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[12px] font-black text-slate-900">
                  Current Bid-Lowering Window
                </p>
                <p className="text-[11px] text-slate-500">
                  Partners are actively dropping prices. Next window refreshes in:
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block font-mono font-black text-[14px] text-sky-700 bg-sky-100/70 px-2.5 py-1 rounded-xl">
                {formatTimer(windowSecondsRemaining)}
              </span>
            </div>
          </div>
        ) : (
          /* Requirement 8: Monetization Platform Fee when 15-minute auction expires */
          <div className="bg-gradient-to-br from-pink-950 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-pink-500/30 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-pink-500/20 text-pink-300">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[16px] font-black tracking-tight text-white">
                15-Minute Live Auction Concluded
              </h3>
              <p className="text-[12px] text-pink-200/80 max-w-md mx-auto mt-1">
                {trip.offlineUnlocked
                  ? 'All 6 partner contact numbers are unmasked below!'
                  : 'Didn\'t lock a deal online? Pay a small nominal platform fee to immediately reveal direct phone numbers and contact details of all 6 bidding vendors!'}
              </p>
            </div>

            {!trip.offlineUnlocked ? (
              <button
                type="button"
                onClick={onUnlockOffline}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-[13px] shadow-md hover:shadow-lg active:scale-98 transition-all inline-flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Pay ₹49 Platform Fee for Direct Offline Contact</span>
              </button>
            ) : (
              <div className="bg-pink-500/20 border border-pink-400/40 rounded-2xl py-2 px-4 text-pink-300 font-bold text-[12px] inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Direct Contact Details Successfully Unlocked</span>
              </div>
            )}
          </div>
        )}

        {/* Pricing Summary Strip */}
        <div className="grid grid-cols-3 gap-2 bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs text-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Target Budget
            </p>
            <p className="text-[15px] font-bold text-slate-700">
              ₹{trip.targetBudget.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="border-x border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Lowest Quote
            </p>
            <p className="text-[16px] font-black text-pink-600">
              ₹{lowestOffer?.totalPrice.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Max Savings
            </p>
            <p className="text-[15px] font-black text-sky-600">
              {potentialSavings > 0 ? `₹${potentialSavings.toLocaleString('en-IN')}` : 'Best Price'}
            </p>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-black uppercase tracking-wider text-slate-700">
              All Vendor Bids ({sortedOffers.length})
            </h2>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">
              Sorted: Lowest to Highest Price
            </span>
          </div>
        </div>

        {/* List of Sorted Vendor Offer Cards */}
        <div className="space-y-4">
          {sortedOffers.map((offer, index) => {
            const isLowest = index === 0;
            const isMediaExpanded = expandedMediaOfferId === offer.id;
            const photoIdx = activePhotoIndex[offer.id] || 0;
            const currentPhoto = offer.photos[photoIdx] || offer.photos[0];
            const isEditingCounter = counterEditingOfferId === offer.id;

            return (
              <article
                key={offer.id}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                  isLowest
                    ? 'border-pink-500/60 ring-2 ring-pink-500/10'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Top Badge Row */}
                <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-2 flex-wrap">
                  {/* Requirement 9: Vendor Anonymity */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-8 w-8 rounded-full bg-slate-900 text-white font-black text-[12px] items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-black text-slate-900 truncate">
                          {trip.offlineUnlocked ? offer.realAgencyName : offer.maskedPartnerName}
                        </span>
                        <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span className="text-amber-500 font-bold">★ {offer.rating}</span>
                        <span>({offer.reviewCount} verified trips)</span>
                        {!trip.offlineUnlocked && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            · 🔒 Masked
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Requirement 11: AI Deal Score in-card */}
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black shadow-2xs ${
                        offer.aiDealScore.type === 'great'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : offer.aiDealScore.type === 'premium'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {offer.aiDealScore.type === 'great' && <Flame className="w-3.5 h-3.5 text-amber-600" />}
                      {offer.aiDealScore.type === 'fair' && <Scale className="w-3.5 h-3.5 text-rose-600" />}
                      {offer.aiDealScore.type === 'premium' && <Gem className="w-3.5 h-3.5 text-purple-600" />}
                      <span>{offer.aiDealScore.badgeLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Price and Vehicle/Room Header */}
                <div className="px-5 py-2 flex items-end justify-between gap-3 border-b border-slate-100">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Vehicle Class / Stay Spec
                    </p>
                    <p className="text-[14px] font-black text-slate-800 truncate">
                      {offer.vehicleOrRoomTitle}
                    </p>
                    {offer.lastPriceDrop && (
                      <p className="text-[11px] font-bold text-pink-600 mt-0.5">
                        {offer.lastPriceDrop}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Locked Bid
                    </p>
                    <div className="flex items-baseline gap-1.5 justify-end">
                      {offer.originalPrice > offer.totalPrice && (
                        <span className="text-[12px] text-slate-400 line-through font-medium">
                          ₹{offer.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-[20px] font-black text-slate-900 tracking-tight">
                        ₹{offer.totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      Incl. ₹{offer.taxes} GST & Taxes
                    </span>
                  </div>
                </div>

                {/* Requirement 7: Auto-Fetch Vendor Inventory (Rich Media) */}
                <div className="px-5 pt-3 pb-2 space-y-3">
                  {/* Photo with Media Toggle */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-100 aspect-video sm:aspect-21/9">
                    <img
                      src={currentPhoto}
                      alt={offer.vehicleOrRoomTitle}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-between p-3 text-white">
                      <div className="flex items-center justify-between">
                        <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold">
                          📸 {photoIdx + 1} of {offer.photos.length} Photos
                        </span>
                        <span className="bg-pink-600/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black">
                          Verified Fleet
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="truncate">{offer.locationAddress}</span>
                        </div>

                        {offer.photos.length > 1 && (
                          <div className="flex gap-1">
                            {offer.photos.map((_, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() =>
                                  setActivePhotoIndex(prev => ({ ...prev, [offer.id]: pIdx }))
                                }
                                className={`w-2 h-2 rounded-full transition-all ${
                                  pIdx === photoIdx ? 'bg-white scale-125' : 'bg-white/40'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amenities Chips */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Included Amenities & Equipment
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {offer.amenities.map(am => (
                        <span
                          key={am}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200/60"
                        >
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Demand Match Breakdown summary */}
                  <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">
                      Demand Fulfillment:
                    </span>
                    <span className="font-black text-pink-700">
                      {offer.fulfilledInclusions.length} of {trip.demands.length} demands matched
                    </span>
                  </div>

                  {/* Revealed details if unlocked offline */}
                  {trip.offlineUnlocked && (
                    <div className="p-3 bg-pink-50 border border-pink-200 rounded-2xl space-y-1">
                      <p className="text-[11px] font-black text-pink-900 uppercase tracking-wider">
                        Direct Partner Contacts (Unlocked)
                      </p>
                      <p className="text-[13px] font-bold text-slate-900">
                        {offer.realAgencyName}
                      </p>
                      <p className="text-[12px] text-slate-600 flex items-center gap-2">
                        <span>📞 {offer.realPhone}</span>
                        <span>✉️ {offer.realEmail}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Inline Counter Proposal Box (Requirement 4: Change Amount) */}
                {isEditingCounter && (
                  <div className="px-5 py-3 bg-pink-50/70 border-t border-pink-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-black text-pink-950">
                        Propose Counter Amount to {offer.maskedPartnerName}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCounterEditingOfferId(null)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          step="200"
                          value={customCounterAmount}
                          onChange={e => setCustomCounterAmount(Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 text-[14px] font-black rounded-xl border border-pink-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSendCounter(offer.id)}
                        className="px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-[12px] shadow-sm hover:bg-pink-700 active:scale-95 transition-all"
                      >
                        Send Counter
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {[offer.totalPrice - 500, offer.totalPrice - 1000, offer.totalPrice - 1500].map(
                        preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setCustomCounterAmount(preset)}
                            className="text-[11px] font-bold text-pink-700 bg-pink-100/80 px-2 py-0.5 rounded-md hover:bg-pink-200"
                          >
                            ₹{preset.toLocaleString('en-IN')}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Requirement 4: Vendor Card Actions (ACCEPT & LOCK, CHANGE AMOUNT, CHAT) */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  {/* 1. ACCEPT & LOCK */}
                  <button
                    type="button"
                    onClick={() => onAcceptAndLock(offer)}
                    className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-[13px] shadow-sm hover:shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-2" />
                    <span>ACCEPT & LOCK</span>
                  </button>

                  {/* 2. CHANGE AMOUNT (inline editing) */}
                  <button
                    type="button"
                    onClick={() => handleStartCounter(offer)}
                    className="px-3.5 h-11 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-[12px] hover:bg-slate-100 active:scale-98 transition-all flex items-center justify-center gap-1"
                  >
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    <span>CHANGE AMOUNT</span>
                  </button>

                  {/* 3. CHAT */}
                  <button
                    type="button"
                    onClick={() => onOpenChat(offer)}
                    className="px-3.5 h-11 rounded-2xl bg-white border border-sky-300 text-sky-700 font-bold text-[12px] hover:bg-sky-50 active:scale-98 transition-all flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                    <span>CHAT</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
