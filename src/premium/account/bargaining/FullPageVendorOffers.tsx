import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Gavel,
  Image as ImageIcon,
  Info,
  MapPin,
  MessageSquare,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Lock,
  Unlock,
  Phone,
  Clock,
  Check
} from 'lucide-react';
import { BargainingRequest, VendorBid } from './BargainingTypes';
import { initiateBargainMicroPayment } from '../../../utils/razorpay';

interface FullPageVendorOffersProps {
  request: BargainingRequest;
  bids: VendorBid[];
  onBack: () => void;
  onAcceptAndLock: (bid: VendorBid) => void;
  onOpenChat: (bid: VendorBid) => void;
  onCounterBid: (bidId: string, counterAmount: number) => void;
  lang?: string;
}

export const FullPageVendorOffers: React.FC<FullPageVendorOffersProps> = ({
  request,
  bids,
  onBack,
  onAcceptAndLock,
  onOpenChat,
  onCounterBid,
  lang = 'en'
}) => {
  // STRICT SORT: Lowest to Highest Price
  const sortedBids = [...bids].sort((a, b) => a.totalPrice - b.totalPrice);

  // Active Photo Carousel indices per bid
  const [photoIndices, setPhotoIndices] = useState<Record<string, number>>({});
  // Inline counter inputs per bid
  const [counterInputs, setCounterInputs] = useState<Record<string, number>>({});
  const [activeCounterId, setActiveCounterId] = useState<string | null>(null);

  // Requirement 3: Conditional Disclosure & ₹29 Unlock
  const [unlockedContacts, setUnlockedContacts] = useState<Record<string, boolean>>({});
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [auctionSeconds, setAuctionSeconds] = useState<number>(request.expirySeconds ?? 780);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setAuctionSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isAuctionExpired = auctionSeconds === 0;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleNextPhoto = (bidId: string, max: number) => {
    setPhotoIndices((prev) => ({
      ...prev,
      [bidId]: ((prev[bidId] || 0) + 1) % max
    }));
  };

  const handlePrevPhoto = (bidId: string, max: number) => {
    setPhotoIndices((prev) => ({
      ...prev,
      [bidId]: ((prev[bidId] || 0) - 1 + max) % max
    }));
  };

  const submitCounter = (bid: VendorBid) => {
    const amount = counterInputs[bid.id] ?? (bid.totalPrice - 1000);
    onCounterBid(bid.id, amount);
    setActiveCounterId(null);
  };

  // Requirement 3: Trigger ₹29 Razorpay microtransaction to reveal vendor direct contact
  const handleUnlockVendorContact = (bid: VendorBid) => {
    setUnlockingId(bid.id);
    initiateBargainMicroPayment(
      29,
      'vendor_contact_unlock',
      (res) => {
        setUnlockingId(null);
        setUnlockedContacts((prev) => ({ ...prev, [bid.id]: true }));
        showToast(`📞 Contact unlocked for ${bid.maskedName}: ${bid.directPhone}`);
      },
      (err) => {
        setUnlockingId(null);
        alert('Payment cancelled. Direct contact remains sealed under escrow.');
      }
    );
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}m : ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[140] bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center min-w-0 flex-1">
            <h1 className="text-[15px] font-black text-slate-900 truncate">
              {request.title}
            </h1>
            <p className="text-[11px] font-medium text-slate-500 truncate">
              {request.route} · Target: ₹{request.targetBudget.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Auction Timer Badge */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isAuctionExpired
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-sky-100 text-sky-800 border border-sky-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{isAuctionExpired ? 'Auction Expired' : formatTimer(auctionSeconds)}</span>
            </div>

            {/* Quick Expiration Simulator button */}
            {!isAuctionExpired && (
              <button
                type="button"
                onClick={() => setAuctionSeconds(0)}
                title="Simulate 15-min Auction Expiry to test ₹29 Unlock Contact"
                className="text-[9px] font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md cursor-pointer"
              >
                Fast-Expire
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* Transparency Banner & AI Benchmark Notice */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-1.5 border border-sky-900/40">
          <div className="flex items-center justify-between text-[11px] font-bold text-sky-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>AI Market Baseline: ₹{request.aiBaselineBudget.toLocaleString()}</span>
            </span>
            <span className="bg-sky-900/60 px-2 py-0.5 rounded-md text-pink-300 font-mono">
              Lowest to Highest Sorted
            </span>
          </div>
          <p className="text-[12px] text-slate-200 leading-snug">
            All vendor registered legal entities and cities are displayed for full consumer transparency. Direct phone numbers remain sealed under escrow during bidding.
          </p>
        </div>

        {/* Expired Auction Global Callout */}
        {isAuctionExpired && (
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-2xl flex items-center justify-between gap-3 text-orange-900">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-700 shrink-0" />
              <div className="text-xs">
                <p className="font-black">15-Minute Live Auction Concluded</p>
                <p className="text-[11px] text-orange-800">
                  You can now unlock direct vendor phone contact for ₹29 on any preferred quote.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bids List: Strictly Sorted Lowest to Highest */}
        <div className="space-y-4">
          {sortedBids.map((bid, index) => {
            const photos = bid.inventory.photos || [];
            const activePhotoIdx = photoIndices[bid.id] || 0;
            const currentCounterVal = counterInputs[bid.id] ?? (bid.totalPrice - 1000);
            const isCountering = activeCounterId === bid.id;
            const isContactRevealed = unlockedContacts[bid.id] || bid.isContactUnlocked;

            return (
              <article
                key={bid.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Top Strip: Masked Trading Name + Registered Legal Entity & City */}
                <div className="bg-slate-50/90 border-b border-slate-100 px-4 py-3 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[11px] font-black mt-0.5 shrink-0">
                      #{index + 1}
                    </span>

                    <div>
                      {/* Vendor Trading Identity */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[14px] font-black text-slate-900">
                          {bid.maskedName}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                          Verified Operator
                        </span>
                      </div>

                      {/* Requirement 3: Registered Legal Name and City */}
                      <div className="mt-1 text-[11px] text-slate-600 flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-800">
                          🏛️ {bid.legalName || bid.realName}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-600 font-medium">
                          📍 {bid.city}
                        </span>
                      </div>

                      {/* Direct Contact Status (Hidden or Unlocked) */}
                      {isContactRevealed ? (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 bg-pink-50 text-pink-800 text-[11px] font-black px-2.5 py-1 rounded-xl border border-pink-300">
                          <Phone className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                          <span>Direct Line: {bid.directPhone}</span>
                          <a
                            href={`tel:${bid.directPhone}`}
                            className="ml-1 text-[10px] bg-pink-600 text-white px-2 py-0.5 rounded-md hover:bg-pink-700"
                          >
                            Call
                          </a>
                        </div>
                      ) : (
                        <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Direct Phone & Email sealed under Escrow</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg shrink-0">
                    <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                    <span className="text-[11px] font-black text-orange-900">{bid.rating}</span>
                    <span className="text-[10px] text-orange-700">({bid.inventory.reviewCount})</span>
                  </div>
                </div>

                {/* Vendor Inventory Rich Media Gallery */}
                <div className="relative aspect-video sm:aspect-21/9 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={photos[activePhotoIdx] || photos[0]}
                    alt={bid.maskedName}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handlePrevPhoto(bid.id, photos.length)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNextPhoto(bid.id, photos.length)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/60 px-2 py-0.5 rounded-full text-[10px] font-mono text-white">
                        {activePhotoIdx + 1} / {photos.length} Verified Media
                      </div>
                    </>
                  )}

                  {/* AI Deal Score Badge In-Card */}
                  <div className="absolute top-2.5 left-2.5">
                    {bid.aiDealScore === 'great' ? (
                      <span className="flex items-center gap-1 bg-pink-600/95 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl text-[11px] font-black shadow-md">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Great Deal</span>
                      </span>
                    ) : bid.aiDealScore === 'fair' ? (
                      <span className="flex items-center gap-1 bg-pink-600/95 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl text-[11px] font-black shadow-md">
                        <Scale className="w-3.5 h-3.5" />
                        <span>Fair Price</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-purple-600/95 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl text-[11px] font-black shadow-md">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Premium Fleet</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3.5">
                  {/* Vehicle / Room Specifications */}
                  {(bid.inventory.vehicleSpecs || bid.inventory.roomSpecs) && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-xs text-slate-800">
                      <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">
                        Verified Specs:
                      </span>
                      <p className="font-semibold text-[12px] text-slate-900">
                        {bid.inventory.vehicleSpecs || bid.inventory.roomSpecs}
                      </p>
                    </div>
                  )}

                  {/* Verified Inclusions & Exclusions */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Included in this Quote:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {bid.inclusions.map((inc, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-pink-50 text-pink-800 border border-pink-200/70"
                        >
                          <CheckCircle2 className="w-3 h-3 text-pink-600 shrink-0" />
                          <span>{inc}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Verified Fixed Quote
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[22px] font-black text-slate-900 font-mono tracking-tight">
                          ₹{bid.totalPrice.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          (₹{bid.basePrice.toLocaleString()} + ₹{bid.taxes} tax)
                        </span>
                      </div>
                      <span className="text-[10px] text-pink-600 font-bold">
                        {bid.dealScoreLabel}
                      </span>
                    </div>

                    {bid.counterAmount && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-orange-600 block">
                          Counter Offered
                        </span>
                        <span className="text-[15px] font-black text-orange-700 font-mono">
                          ₹{bid.counterAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Inline Counter Edit Drawer */}
                  {isCountering && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-orange-900">
                          Propose Counter Price:
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveCounterId(null)}
                          className="text-[11px] text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCounterInputs((prev) => ({
                              ...prev,
                              [bid.id]: Math.max((currentCounterVal || bid.totalPrice) - 500, 5000)
                            }))
                          }
                          className="w-10 h-10 rounded-xl bg-white border border-orange-300 font-black text-slate-800 text-lg hover:bg-orange-100 transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <div className="flex-1 text-center font-black text-[20px] text-slate-900 bg-white py-1.5 rounded-xl border border-orange-300">
                          ₹{currentCounterVal.toLocaleString()}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCounterInputs((prev) => ({
                              ...prev,
                              [bid.id]: (currentCounterVal || bid.totalPrice) + 500
                            }))
                          }
                          className="w-10 h-10 rounded-xl bg-white border border-orange-300 font-black text-slate-800 text-lg hover:bg-orange-100 transition-colors cursor-pointer"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => submitCounter(bid)}
                          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[13px] rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Requirement 3: When 15-min auction timer expires, render "Unlock Direct Contact" button */}
                  {isAuctionExpired && !isContactRevealed && (
                    <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Unlock className="w-4 h-4 text-pink-600 shrink-0" />
                        <div>
                          <p className="text-[12px] font-bold text-pink-950">
                            Auction Expired: Connect Directly
                          </p>
                          <p className="text-[10px] text-pink-700">
                            Unlock {bid.legalName || bid.maskedName}'s direct phone number
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnlockVendorContact(bid)}
                        disabled={unlockingId === bid.id}
                        className="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white font-black text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{unlockingId === bid.id ? 'Opening...' : 'Unlock (₹29)'}</span>
                      </button>
                    </div>
                  )}

                  {/* Vendor Card Actions (ACCEPT & LOCK, CHANGE AMOUNT, CHAT) */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {/* Action 1: ACCEPT & LOCK */}
                    <button
                      type="button"
                      onClick={() => onAcceptAndLock(bid)}
                      className="col-span-1 py-2.5 px-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-[11px] sm:text-[12px] shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Accept & Lock</span>
                    </button>

                    {/* Action 2: CHANGE AMOUNT (Inline Editing) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isCountering) {
                          setActiveCounterId(null);
                        } else {
                          setActiveCounterId(bid.id);
                          if (!counterInputs[bid.id]) {
                            setCounterInputs((prev) => ({
                              ...prev,
                              [bid.id]: bid.totalPrice - 1000
                            }));
                          }
                        }
                      }}
                      className="col-span-1 py-2.5 px-2 rounded-xl bg-white border border-sky-200 hover:bg-sky-50 text-sky-700 font-bold text-[11px] sm:text-[12px] flex items-center justify-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <Gavel className="w-3.5 h-3.5 shrink-0 text-sky-600" />
                      <span className="truncate">{isCountering ? 'Close' : 'Change Amount'}</span>
                    </button>

                    {/* Action 3: CHAT */}
                    <button
                      type="button"
                      onClick={() => onOpenChat(bid)}
                      className="col-span-1 py-2.5 px-2 rounded-xl bg-white border border-pink-200 hover:bg-pink-50 text-pink-700 font-bold text-[11px] sm:text-[12px] flex items-center justify-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-pink-600" />
                      <span className="truncate">Chat</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
