import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Gavel,
  Key,
  Lock,
  MessageCircle,
  PhoneCall,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingDown,
  X,
  Zap
} from "lucide-react";
import type { AccountItemId } from "./types";
import {
  BargainingRequest,
  VendorBid
} from "./bargaining/BargainingTypes";
import {
  INITIAL_REQUESTS,
  INITIAL_VENDOR_BIDS
} from "./bargaining/BargainingInventoryData";
import { FullPageVendorOffers } from "./bargaining/FullPageVendorOffers";
import { AcceptAndLockComparisonView } from "./bargaining/AcceptAndLockComparisonView";
import { FullScreenBargainChat } from "./bargaining/FullScreenBargainChat";
import { SecretOffersModal } from "../modals/PremiumModals";
import { checkCustomBiddingAllowance } from "./bargaining/BargainingRateLimiter";
import { BargainingPaywallModal } from "./bargaining/BargainingPaywallModal";

const STATUS_TONE: Record<BargainingRequest["status"], string> = {
  Open: "bg-sky-100 text-sky-800",
  Bargaining: "bg-pink-100 text-pink-800 font-bold",
  Confirmed: "bg-pink-100 text-pink-800"
};

const LIVE_ACTIVITY_MESSAGES = [
  "🟢 3 verified vendors are reviewing your trip demands in real-time...",
  "⚡ Verified Partner #403 is adjusting their quote downwards...",
  "🔥 Best quote dropped by ₹1,500 in the last 2 minutes!",
  "👀 2 new transport partners joined the bidding pool for Pune → Goa",
  "🛡️ RoutTripo Escrow Anti-Leakage Shield is active for all sealed bids"
];

export const BargainingTab: React.FC<{
  onSelect: (item: AccountItemId) => void;
  lang?: string;
}> = ({ onSelect, lang = "en" }) => {
  const [requestsList, setRequestsList] = useState<BargainingRequest[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("routripo_user_bids");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error("Failed to load user bids", e);
      }
    }
    return [];
  });

  const [bidsMap, setBidsMap] = useState<Record<string, VendorBid[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("routripo_user_bid_offers");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed === "object" && parsed !== null) return parsed;
        }
      } catch (e) {
        console.error("Failed to load bid offers", e);
      }
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("routripo_user_bids", JSON.stringify(requestsList));
      } catch (e) {
        console.error("Failed to save user bids", e);
      }
    }
  }, [requestsList]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("routripo_user_bid_offers", JSON.stringify(bidsMap));
      } catch (e) {
        console.error("Failed to save bid offers", e);
      }
    }
  }, [bidsMap]);

  const [filter, setFilter] = useState<"Bargaining" | "Open" | "Confirmed">("Bargaining");

  // View state transitions
  const [viewingOffersRequest, setViewingOffersRequest] = useState<BargainingRequest | null>(null);
  const [acceptingBid, setAcceptingBid] = useState<{ request: BargainingRequest; bid: VendorBid } | null>(null);
  const [chattingBid, setChattingBid] = useState<{ request: BargainingRequest; bid: VendorBid } | null>(null);

  // Change Target Budget Modal State (Requirement 2)
  const [changeBudgetReq, setChangeBudgetReq] = useState<BargainingRequest | null>(null);
  const [newBudgetInput, setNewBudgetInput] = useState<number>(40000);

  // Requirement 8: 15-Minute Auction Loop & 3-Minute Window Timers
  const [secondsRemaining, setSecondsRemaining] = useState<number>(780); // 13 mins left
  const [isThreeMinWindow, setIsThreeMinWindow] = useState<boolean>(true);
  const [showOfflineUnlockModal, setShowOfflineUnlockModal] = useState<boolean>(false);
  const [isOfflineUnlocked, setIsOfflineUnlocked] = useState<boolean>(false);
  const [isSecretOffersOpen, setIsSecretOffersOpen] = useState<boolean>(false);
  const [showRateLimitModal, setShowRateLimitModal] = useState<boolean>(false);
  const rateLimitAllowance = checkCustomBiddingAllowance();

  // Requirement 10: Live Activity Indicator cycling
  const [activityIndex, setActivityIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    const activityTimer = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % LIVE_ACTIVITY_MESSAGES.length);
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(activityTimer);
    };
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}m : ${secs.toString().padStart(2, "0")}s`;
  };

  const isAuctionExpired = secondsRemaining === 0;

  const handleCounterBid = (bidId: string, counterAmount: number) => {
    if (!viewingOffersRequest) return;
    setBidsMap((prev) => {
      const currentBids = prev[viewingOffersRequest.id] || [];
      return {
        ...prev,
        [viewingOffersRequest.id]: currentBids.map((b) =>
          b.id === bidId
            ? { ...b, counterAmount, status: "countered" }
            : b
        )
      };
    });
  };

  const handleConfirmDeal = (confirmedBid: VendorBid) => {
    if (!acceptingBid) return;
    setRequestsList((prev) =>
      prev.map((r) =>
        r.id === acceptingBid.request.id
          ? {
              ...r,
              status: "Confirmed",
              lowestQuote: confirmedBid.totalPrice
            }
          : r
      )
    );
  };

  const handleSaveChangedBudget = () => {
    if (!changeBudgetReq) return;
    setRequestsList((prev) =>
      prev.map((r) =>
        r.id === changeBudgetReq.id
          ? { ...r, targetBudget: newBudgetInput }
          : r
      )
    );
    setChangeBudgetReq(null);
  };

  // 1. If currently in Full-Screen Chat (Priority 1)
  if (chattingBid) {
    return (
      <FullScreenBargainChat
        request={chattingBid.request}
        bid={chattingBid.bid}
        onBack={() => setChattingBid(null)}
        onAcceptAndLock={(bid) => {
          setChattingBid(null);
          setAcceptingBid({ request: chattingBid.request, bid });
        }}
        lang={lang}
      />
    );
  }

  // 2. If currently in Accept & Lock Comparison Flow (Priority 2)
  if (acceptingBid) {
    return (
      <AcceptAndLockComparisonView
        request={acceptingBid.request}
        bid={acceptingBid.bid}
        onBack={() => setAcceptingBid(null)}
        onPaymentSuccess={handleConfirmDeal}
        lang={lang}
      />
    );
  }

  // 3. If currently in Full-Page Offers View (Priority 3)
  if (viewingOffersRequest) {
    const bidsForThisReq = bidsMap[viewingOffersRequest.id] || [];
    return (
      <FullPageVendorOffers
        request={viewingOffersRequest}
        bids={bidsForThisReq}
        onBack={() => setViewingOffersRequest(null)}
        onAcceptAndLock={(bid) => {
          setAcceptingBid({ request: viewingOffersRequest, bid });
        }}
        onOpenChat={(bid) => {
          setChattingBid({ request: viewingOffersRequest, bid });
        }}
        onCounterBid={handleCounterBid}
        lang={lang}
      />
    );
  }

  const filteredRequests = requestsList.filter((r) => r.status === filter);
  const bargainingCount = requestsList.filter((r) => r.status === "Bargaining").length;
  const openCount = requestsList.filter((r) => r.status === "Open").length;
  const confirmedCount = requestsList.filter((r) => r.status === "Confirmed").length;

  return (
    <div className="pb-28">
      {/* 
        ========================================================================
        HEADER ACTIONS: TRIP REQUIREMENT | SECRET | START OTP
        Exact same shape (1:1:1 grid), Premium App Theme colors (NO BLACK)
        ========================================================================
      */}
      <div className="px-5 pt-4">
        <div className="grid grid-cols-3 gap-2.5">
          {/* Button 1: MAKE AN OFFER */}
          <button
            type="button"
            onClick={() => {
              const allowance = checkCustomBiddingAllowance();
              if (!allowance.allowed) {
                setShowRateLimitModal(true);
              } else {
                onSelect("bargain-new-request");
              }
            }}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-tight uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img src="/icons/make_an_offer.png" alt="Make an Offer" className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform" />
            </div>
            <span className="truncate">Make an Offer</span>
          </button>

          {/* Button 2: SECRET */}
          <button
            type="button"
            onClick={() => setIsSecretOffersOpen(true)}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-wide uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img src="/icons/secret.png" alt="Secret" className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform" />
            </div>
            <span className="truncate">Secret</span>
          </button>

          {/* Button 3: START OTP */}
          <button
            type="button"
            onClick={() => onSelect("bargain-vouchers")}
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-slate-800 font-bold text-[11px] sm:text-[12px] tracking-wide uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img src="/icons/start_otp.png" alt="Start OTP" className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform" />
            </div>
            <span className="truncate">Start OTP</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-5 pt-4">
        {(["Bargaining", "Open", "Confirmed"] as const).map((tab) => {
          const count =
            tab === "Bargaining"
              ? bargainingCount
              : tab === "Open"
              ? openCount
              : confirmedCount;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`h-9 flex-1 rounded-full text-[12px] font-black transition-all cursor-pointer active:scale-95 ${
                filter === tab
                  ? "btn-3d-primary text-white shadow-[0_4px_12px_rgba(2,132,199,0.3)]"
                  : "bg-white border border-slate-200/90 text-slate-700 shadow-xs hover:bg-slate-50 hover:border-sky-300"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* 
        ========================================================================
        REQUIREMENT 8: AUCTION TIMERS & MONETIZATION
        Wire 3-minute bid-lowering window and 15-minute maximum auction loop.
        If 15 minutes expire without an accepted offer, allow paying platform fee.
        ========================================================================
      */}
      {requestsList.some((r) => r.status === "Bargaining") && (
        <div className="px-5 pt-3">
          {isAuctionExpired ? (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">
                  Auction Loop Expired
                </span>
                <p className="text-[12px] font-bold text-slate-800">
                  15-minute bidding period ended without lock.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOfflineUnlockModal(true)}
                className="shrink-0 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[12px] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Pay ₹49 for Offline Contact
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white p-3 rounded-2xl flex flex-col gap-2.5 shadow-sm border border-sky-600/30">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200">
                    Live Auction Loop
                  </span>
                </div>
                {isThreeMinWindow && (
                  <span className="text-[9px] bg-pink-500 text-white font-black px-1.5 py-0.5 rounded shrink-0 shadow-xs">
                    3-Min Power Hour
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between w-full">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[16px] font-black text-orange-300 font-mono tracking-tight">
                    {formatTimer(secondsRemaining)}
                  </span>
                  <span className="text-[10px] font-semibold text-orange-200/60 uppercase tracking-wide">
                    remaining
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const req = requestsList[0];
                    if (req) setViewingOffersRequest(req);
                  }}
                  className="text-[12px] font-bold bg-white/15 hover:bg-white/25 text-white px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  View Quotes →
                </button>
              </div>
              
              <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
                <div className="flex h-1.5 w-1.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pink-500"></span>
                </div>
                <p className="text-[10px] font-medium text-sky-100 truncate flex-1">
                  {LIVE_ACTIVITY_MESSAGES[activityIndex]}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 
        ========================================================================
        REQUIREMENT 2: BARGAINING CARD RESTRUCTURE
        Distribute "TARGET BUDGET", "LOWEST QUOTE", and "OFFERS" equally & horizontally.
        Place ONLY TWO buttons at the bottom horizontally: "ACCEPT" and "CHANGE".
        ========================================================================
      */}
      <div className="space-y-3 px-5 pt-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center space-y-2 border border-slate-200">
            <p className="text-[14px] font-bold text-slate-700">
              No {filter.toLowerCase()} requests right now
            </p>
            <p className="text-[12px] text-slate-500 max-w-xs mx-auto">
              Submit your custom offer to receive verified reverse-bids from certified operators.
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const bidsForReq = bidsMap[request.id] || [];
            const sortedBids = [...bidsForReq].sort((a, b) => a.totalPrice - b.totalPrice);
            const lowestBid = sortedBids[0];

            return (
              <article
                key={request.id}
                onClick={() => setViewingOffersRequest(request)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
              >
                {/* Header Row of the Card */}
                <div className="flex items-start gap-3 px-4 pt-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 font-bold">
                    <Gavel className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[15px] font-black text-slate-900">
                        {request.title}
                      </p>
                    </div>
                    <p className="truncate text-[12px] font-medium text-slate-500">
                      {request.id} · {request.route}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${STATUS_TONE[request.status]}`}
                  >
                    {request.status}
                  </span>
                </div>

                {/* 
                  EQUAL & HORIZONTAL DISTRIBUTION: 
                  "TARGET BUDGET" | "LOWEST QUOTE" | "OFFERS" (Requirement 2) 
                */}
                <div className="mx-4 mt-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3 grid grid-cols-3 divide-x divide-slate-200 text-center">
                  {/* Column 1: TARGET BUDGET */}
                  <div className="px-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Target Budget
                    </p>
                    <p className="text-[14px] font-black text-slate-700 mt-0.5">
                      ₹{request.targetBudget.toLocaleString()}
                    </p>
                  </div>

                  {/* Column 2: LOWEST QUOTE */}
                  <div className="px-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Lowest Quote
                    </p>
                    <p className="text-[15px] font-black text-pink-600 mt-0.5">
                      ₹{request.lowestQuote.toLocaleString()}
                    </p>
                  </div>

                  {/* Column 3: OFFERS */}
                  <div className="px-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Offers
                    </p>
                    <p className="text-[14px] font-black text-sky-700 mt-0.5">
                      {bidsForReq.length || request.offersCount} Bids
                    </p>
                  </div>
                </div>

                {/* Best Quote Anonymity Strip */}
                {lowestBid && (
                  <div className="px-4 pt-2 text-[11px] font-bold flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                      <span>Best offer by {lowestBid.maskedName}</span>
                    </span>
                    <span className="text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md font-black">
                      ₹{(request.targetBudget - lowestBid.totalPrice).toLocaleString()} Savings
                    </span>
                  </div>
                )}

                {/* 
                  BOTTOM ACTIONS (Requirement 2):
                  Place ONLY TWO buttons at the bottom horizontally: "ACCEPT" and "CHANGE"
                */}
                <div
                  className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 px-4 py-3 bg-slate-50/90"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Button 1: ACCEPT */}
                  <button
                    type="button"
                    onClick={() => {
                      if (lowestBid) {
                        setAcceptingBid({ request, bid: lowestBid });
                      } else {
                        setViewingOffersRequest(request);
                      }
                    }}
                    className="btn-3d-primary h-11 rounded-xl text-white font-black text-[13px] shadow-[0_4px_14px_rgba(2,132,199,0.35)] flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Accept</span>
                  </button>

                  {/* Button 2: CHANGE */}
                  <button
                    type="button"
                    onClick={() => {
                      setChangeBudgetReq(request);
                      setNewBudgetInput(request.targetBudget);
                    }}
                    className="h-11 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-extrabold text-[13px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-sky-600 stroke-[2.5]" />
                    <span>Change</span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Change Budget Modal */}
      {changeBudgetReq && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-[16px] text-slate-900">Change Target Budget</h3>
                <p className="text-[11px] text-slate-400">{changeBudgetReq.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setChangeBudgetReq(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-3">
              <p className="text-[12px] text-slate-500">
                Adjust your expected price. Verified operators will receive an instant revision notification.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewBudgetInput((p) => Math.max(p - 1000, 10000))}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-black text-slate-800 text-xl active:scale-95 transition-all"
                >
                  -
                </button>
                <span className="text-[28px] font-black text-slate-900 w-44 font-mono">
                  ₹{newBudgetInput.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => setNewBudgetInput((p) => p + 1000)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-black text-slate-800 text-xl active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveChangedBudget}
                className="flex-1 py-3 bg-gradient-to-r from-sky-500 via-sky-600 to-pink-500 hover:opacity-95 text-white font-bold text-[14px] rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Save New Budget
              </button>
              <button
                type="button"
                onClick={() => setChangeBudgetReq(null)}
                className="px-4 py-3 bg-slate-100 text-slate-700 font-bold text-[13px] rounded-2xl hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Direct Contact Unlock Modal (Requirement 8) */}
      {showOfflineUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
              <PhoneCall className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-[17px] text-slate-900">
                Unlock Direct Offline Contact
              </h3>
              <p className="text-[12px] text-slate-500 max-w-xs mx-auto">
                Auction loop expired. Pay a nominal platform fee of ₹49 to immediately reveal verified
                partner agency names, direct phone numbers, and WhatsApp links.
              </p>
            </div>

            {isOfflineUnlocked ? (
              <div className="bg-pink-50 border border-pink-200 p-4 rounded-2xl text-left space-y-2">
                <p className="text-[12px] font-bold text-pink-900">
                  ✓ Unlocked Contacts for Trip #REQ-5519:
                </p>
                <div className="text-[13px] font-mono text-slate-800 space-y-1">
                  <p><strong>Sai Holidays Goa:</strong> +91 98221 44550</p>
                  <p><strong>Goa Coastal Planners:</strong> +91 97654 11223</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsOfflineUnlocked(true)}
                className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-[14px] rounded-2xl shadow-md transition-colors cursor-pointer"
              >
                Pay ₹49 & Unlock Partner Numbers
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowOfflineUnlockModal(false)}
              className="text-[12px] text-slate-400 hover:text-slate-600 font-bold block mx-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Secret Vendor Offers Modal (Restored) */}
      <SecretOffersModal
        isOpen={isSecretOffersOpen}
        onClose={() => setIsSecretOffersOpen(false)}
        onOpenChat={() => {
          setIsSecretOffersOpen(false);
          const matchedReq = requestsList[0];
          const matchedBid = bidsMap[matchedReq.id]?.[0];
          if (matchedReq && matchedBid) {
            setChattingBid({ request: matchedReq, bid: matchedBid });
          }
        }}
        onOpenVouchers={() => {
          setIsSecretOffersOpen(false);
          onSelect("bargain-vouchers");
        }}
      />

      {/* Requirement 1: 4th Custom Request Rate Limit Paywall Modal */}
      <BargainingPaywallModal
        isOpen={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
        onUnlocked={() => {
          setShowRateLimitModal(false);
          onSelect("bargain-new-request");
        }}
      />
    </div>
  );
};
