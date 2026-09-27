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
  Shield,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingDown,
  X,
  Zap,
  Tag,
  QrCode,
  Copy,
  Star,
  MapPin,
  Eye,
  Handshake
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
import { MakeAnOfferModal } from "./bargaining/MakeAnOfferModal";

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
  "🛡️ RouTripo Escrow Anti-Leakage Shield is active for all sealed bids"
];

// Featured verified deals from Google Stitch design
const STITCH_FEATURED_DEALS = [
  {
    id: "deal-goa",
    title: "Goa 5-Star Luxury Weekend Sale",
    subtitle: "Taj & W Partner Stays · Private Pool Villa",
    imgUrl: "https://lh3.googleusercontent.com/aida/AEtjO1W0v5lZ_vEwehbjuekaRy9VncrASccD9ZrrzAgGIRmJNy1dUC7scfmb2wG_bWJZu-ppDd_aduqcttpArYu8Kht0gZMi8PwGZH900PXGpeodhI70FO_1-CZlIDPaqr1I_TqzaE-ylXEelhrRwZBCPaVg0rmMn6v6ry4FKTSxqJnT_O6Fjhx2L7yz-xUsH07D_cbW_0BiAK2rmvKT6anVSRdF3snVPWrDpWEnfqibIThRSeoNTt8NgdDqNw",
    badge: "FLASH DEAL • 45% OFF",
    rating: "4.9",
    escrowBadge: "Verified Escrow",
    price: "₹26,400",
    originalPrice: "₹48,000",
    period: "/ 2 Nights",
    dest: "Goa"
  },
  {
    id: "deal-kashmir",
    title: "Kashmir Paradise Houseboat & Gondola Retreat",
    subtitle: "Dal Lake Luxury Houseboat & Gulmarg Cable Car",
    imgUrl: "https://lh3.googleusercontent.com/aida/AEtjO1XL853S3QWZyG4l-WU7dZI7Y8ejQ_kYNdqmAVqfgmvFzjFzNB4LtK4ky9o7mgPCQJE-XEvfVUd0zODlxk9oFdXYaWmWMPxCo4A9GNxINLcpnhYTA2kvW-jub2f2k5iZ5u4yHWll9HQfuewM2W71gq9eFZOmezPki3TJrzOhfyjjTu-zb9lb_Q6i4qip_hTSJo6cQeR8s6JhthmG3o7zHJ0Jy9Ncc5sCocrk7IvUa5RMs-gPnEEBI405rQ",
    badge: "ENDS IN 3H",
    rating: "4.85",
    escrowBadge: "100% Escrow",
    price: "₹11,400",
    originalPrice: "₹18,000",
    period: "/ Person",
    dest: "Kashmir"
  },
  {
    id: "deal-jaipur",
    title: "Jaipur Heritage Fort & Palace Stay",
    subtitle: "Amer Lake Palace View · Royal Dining Included",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDe_t71VpsniPABXqq_YoIsMY2mJkjXPvBcUztvQOzT87_bkJ2QC7kvAaR-8mZGK9kkNzq41RTg4qgtJDvJwscyzn_HmJnR-0gQhWhi4ONdUAf61jxC3Pjv530Ma0M5ldjsyTbtGo9HrQ23aHKwhZW5IjFq2CAhe8Bt6Rudv4J6uk7Dg714cS2O2WuGZFr0MS5eoPJZTxsJ_hnXWKAk9KoC-GwuuRk6w6I_Sn7PM7MrbjyOssidkLi",
    badge: "HERITAGE SPECIAL • 40% OFF",
    rating: "4.95",
    escrowBadge: "Royal Escrow",
    price: "₹14,800",
    originalPrice: "₹24,500",
    period: "/ 2 Nights",
    dest: "Jaipur"
  },
  {
    id: "deal-munnar",
    title: "Munnar Mist & Tea Plantation Villa",
    subtitle: "Munnar Valley Hills · Infinity Tea Garden View",
    imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHyRjv-vu_CeqP84Y2-4ejFD7lVaZ6FrzJJr5zWouV9bguseJyzA_I5aQXKHgP9jmGFWgwINl6F-TMwKfbBPE3KSCQ28SGvloDL52Tx64LH_etawYX5aNPLS8ypsY9IA8ai8g-_6S4p332mUaqwvq5nLjkdJzEtT4MBmD7z-5nZ2fyNV5faW4zxBBBesJf8ZxdOYXEa8ULQAZWIr0_u8BjvQL1r5GbhtMpb8DT5DGK7k9ORzVvR50y",
    badge: "WEEKEND GETAWAY • 30% OFF",
    rating: "4.9",
    escrowBadge: "Instant Confirm",
    price: "₹8,999",
    originalPrice: "₹12,999",
    period: "/ Couple",
    dest: "Munnar"
  }
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
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Failed to load user bids", e);
      }
    }
    return INITIAL_REQUESTS;
  });

  const [bidsMap, setBidsMap] = useState<Record<string, VendorBid[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("routripo_user_bid_offers");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed === "object" && parsed !== null && Object.keys(parsed).length > 0) return parsed;
        }
      } catch (e) {
        console.error("Failed to load bid offers", e);
      }
    }
    return INITIAL_VENDOR_BIDS;
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

  // Interactive Quick Action Panels (from Google Stitch)
  const [activeQuickPanel, setActiveQuickPanel] = useState<"none" | "secret" | "otp">("none");

  // View state transitions
  const [viewingOffersRequest, setViewingOffersRequest] = useState<BargainingRequest | null>(null);
  const [acceptingBid, setAcceptingBid] = useState<{ request: BargainingRequest; bid: VendorBid } | null>(null);
  const [chattingBid, setChattingBid] = useState<{ request: BargainingRequest; bid: VendorBid } | null>(null);

  // Change Target Budget Modal State
  const [changeBudgetReq, setChangeBudgetReq] = useState<BargainingRequest | null>(null);
  const [newBudgetInput, setNewBudgetInput] = useState<number>(40000);

  // Make An Offer Modal State
  const [isMakeAnOfferOpen, setIsMakeAnOfferOpen] = useState<boolean>(false);
  const [presetOfferDetails, setPresetOfferDetails] = useState<{
    category?: 'Cabs' | 'Hotels' | 'Packages';
    origin?: string;
    destination?: string;
  } | null>(null);

  useEffect(() => {
    const handleOpenOfferEvent = (e: any) => {
      if (e.detail) {
        setPresetOfferDetails(e.detail);
      }
      setIsMakeAnOfferOpen(true);
    };
    window.addEventListener('open-make-an-offer', handleOpenOfferEvent);
    return () => window.removeEventListener('open-make-an-offer', handleOpenOfferEvent);
  }, []);

  // 15-Minute Auction Loop & 3-Minute Window Timers
  const [secondsRemaining, setSecondsRemaining] = useState<number>(765); // ~12m 45s
  const [isThreeMinWindow, setIsThreeMinWindow] = useState<boolean>(true);
  const [showOfflineUnlockModal, setShowOfflineUnlockModal] = useState<boolean>(false);
  const [isOfflineUnlocked, setIsOfflineUnlocked] = useState<boolean>(false);
  const [isSecretOffersOpen, setIsSecretOffersOpen] = useState<boolean>(false);
  const [showRateLimitModal, setShowRateLimitModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Activity Indicator cycling
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
    showToast("Target budget updated successfully!");
  };

  const handleMakeOfferSubmit = (newReq: BargainingRequest, initialBids: VendorBid[]) => {
    setRequestsList((prev) => [newReq, ...prev]);
    setBidsMap((prev) => ({
      ...prev,
      [newReq.id]: initialBids
    }));
    setFilter("Bargaining");
    setViewingOffersRequest(newReq);
    showToast(`Offer for ${newReq.title} dispatched to verified operators!`);
  };

  // 1. If currently in Full-Screen Chat
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

  // 2. If currently in Accept & Lock Comparison Flow
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

  // 3. If currently in Full-Page Offers View
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 text-white text-[13px] font-bold rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 
        ========================================================================
        GOOGLE STITCH: TOP 3 QUICK ACTIONS (1:1:1 GRID WITH INTERACTIVE PANELS)
        ========================================================================
      */}
      <div className="px-4 pt-3">
        <section className="grid grid-cols-3 gap-2.5">
          {/* Button 1: MAKE AN OFFER */}
          <button
            type="button"
            onClick={() => {
              setActiveQuickPanel("none");
              const allowance = checkCustomBiddingAllowance();
              if (!allowance.allowed) {
                setShowRateLimitModal(true);
              } else {
                setPresetOfferDetails(null);
                setIsMakeAnOfferOpen(true);
              }
            }}
            className={`flex flex-col items-center justify-center bg-white rounded-2xl p-2.5 shadow-sm active:scale-95 transition-all text-center group border cursor-pointer ${
              activeQuickPanel === "none"
                ? "border-2 border-sky-500 bg-gradient-to-b from-sky-50 to-white shadow-md"
                : "border-slate-200 hover:border-sky-300"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white mb-1.5 shadow-sm transition-transform group-hover:scale-105">
              <Tag className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] font-extrabold text-sky-700 tracking-tight leading-tight">
              MAKE AN OFFER
            </span>
            <span className="text-[8.5px] text-sky-600 font-semibold">Reverse Bid</span>
          </button>

          {/* Button 2: SECRET */}
          <button
            type="button"
            onClick={() => {
              setActiveQuickPanel((prev) => (prev === "secret" ? "none" : "secret"));
            }}
            className={`flex flex-col items-center justify-center bg-white rounded-2xl p-2.5 shadow-sm active:scale-95 transition-all text-center group border cursor-pointer ${
              activeQuickPanel === "secret"
                ? "border-2 border-amber-500 bg-gradient-to-b from-amber-50 to-white shadow-md"
                : "border-slate-200 hover:border-amber-400"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-1.5 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] font-extrabold text-slate-800 tracking-tight leading-tight">
              SECRET
            </span>
            <span className="text-[8.5px] text-amber-600 font-semibold">Vault Deals</span>
          </button>

          {/* Button 3: START OTP */}
          <button
            type="button"
            onClick={() => {
              setActiveQuickPanel((prev) => (prev === "otp" ? "none" : "otp"));
            }}
            className={`flex flex-col items-center justify-center bg-white rounded-2xl p-2.5 shadow-sm active:scale-95 transition-all text-center group border cursor-pointer ${
              activeQuickPanel === "otp"
                ? "border-2 border-emerald-500 bg-gradient-to-b from-emerald-50 to-white shadow-md"
                : "border-slate-200 hover:border-emerald-500"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-1.5 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <QrCode className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] font-extrabold text-slate-800 tracking-tight leading-tight">
              START OTP
            </span>
            <span className="text-[8.5px] text-emerald-600 font-semibold">Handshake</span>
          </button>
        </section>

        {/* 
          GOOGLE STITCH: INTERACTIVE SECRET VAULT PANEL 
        */}
        {activeQuickPanel === "secret" && (
          <div className="mt-3 bg-white border border-amber-200 rounded-2xl p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Confidential Secret Vault</h4>
                  <p className="text-[10px] text-slate-500">Non-public off-market exclusive deals</p>
                </div>
              </div>
              <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                VIP ACCESS
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="bg-amber-500 text-white text-[8.5px] font-bold px-1.5 py-0.5 rounded">
                      SECRET COUPON
                    </span>
                    <span className="font-mono font-bold text-xs text-amber-900 tracking-wider">
                      VAULT-VIP50
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-700 mt-1 font-medium">
                    Extra ₹5,000 off luxury 5-star villas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    showToast("Coupon VAULT-VIP50 applied to your account!");
                    setIsSecretOffersOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-amber-600 active:scale-95 cursor-pointer"
                >
                  Apply
                </button>
              </div>

              <div className="border border-dashed border-slate-300 rounded-xl p-2.5 text-center bg-slate-50">
                <span className="text-[10.5px] text-slate-600 block">
                  100% Confidential Ledger: Vendors cannot see your name or phone number until booking escrow is locked.
                </span>
                <span className="text-[10px] font-bold text-emerald-600 mt-0.5 inline-block">
                  Zero-Spam Guarantee
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 
          GOOGLE STITCH: INTERACTIVE START OTP HANDSHAKE PANEL
        */}
        {activeQuickPanel === "otp" && (
          <div className="mt-3 bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Trip Start OTP & Escrow Release</h4>
                  <p className="text-[10px] text-slate-500">Share OTP only after vendor arrival</p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                SECURE
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                Trip Handshake Code
              </span>
              <div className="flex space-x-2">
                {["7", "2", "9", "4"].map((digit, i) => (
                  <span
                    key={i}
                    className="w-9 h-11 bg-white border border-emerald-300 rounded-lg flex items-center justify-center text-lg font-black text-slate-900 shadow-sm font-mono"
                  >
                    {digit}
                  </span>
                ))}
              </div>
              <p className="text-[9.5px] text-slate-500 font-medium">
                Show QR or recite code to Driver / Front Desk to initiate insured ride/check-in.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 
        ========================================================================
        GOOGLE STITCH: COMPACT COUPON / VOUCHER PROMO RAIL
        ========================================================================
      */}
      <div className="px-4 pt-3.5">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase">
              Top Verified Escrow Deals
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onSelect("bargain-vouchers")}
            className="text-[10px] font-bold text-sky-600 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
          {/* Promo 1 */}
          <div className="flex-shrink-0 w-[180px] bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/80 rounded-xl p-2 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="bg-sky-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">
                FLIGHT + STAY
              </span>
              <Copy className="w-3.5 h-3.5 text-sky-500 cursor-pointer" onClick={() => showToast("Copied ROUT500")} />
            </div>
            <div className="my-1">
              <span className="text-[11px] font-extrabold text-slate-900 block leading-tight">Flat ₹500 OFF</span>
              <span className="text-[9px] text-slate-500 font-medium">On combo bookings</span>
            </div>
            <div className="border-t border-dashed border-sky-200 pt-1 flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold text-sky-800 bg-white px-1.5 py-0.5 rounded border border-sky-200">
                ROUT500
              </span>
              <span className="text-[8px] text-emerald-600 font-bold">Verified</span>
            </div>
          </div>

          {/* Promo 2 */}
          <div className="flex-shrink-0 w-[180px] bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl p-2 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">
                ESCROW CASHBACK
              </span>
              <Copy className="w-3.5 h-3.5 text-emerald-600 cursor-pointer" onClick={() => showToast("Copied ESCROW10")} />
            </div>
            <div className="my-1">
              <span className="text-[11px] font-extrabold text-slate-900 block leading-tight">10% Extra Cashback</span>
              <span className="text-[9px] text-slate-500 font-medium">Direct into Vault</span>
            </div>
            <div className="border-t border-dashed border-emerald-200 pt-1 flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                ESCROW10
              </span>
              <span className="text-[8px] text-emerald-600 font-bold">Instant</span>
            </div>
          </div>

          {/* Promo 3 */}
          <div className="flex-shrink-0 w-[180px] bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-2 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">
                FREE CAB
              </span>
              <Copy className="w-3.5 h-3.5 text-amber-600 cursor-pointer" onClick={() => showToast("Copied CABFREE")} />
            </div>
            <div className="my-1">
              <span className="text-[11px] font-extrabold text-slate-900 block leading-tight">Free Airport Transfer</span>
              <span className="text-[9px] text-slate-500 font-medium">On villa reservations</span>
            </div>
            <div className="border-t border-dashed border-amber-200 pt-1 flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold text-amber-900 bg-white px-1.5 py-0.5 rounded border border-amber-200">
                CABFREE
              </span>
              <span className="text-[8px] text-amber-600 font-bold">Free Ride</span>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        FILTER TABS: BARGAINING (COUNT) | OPEN (COUNT) | CONFIRMED (COUNT)
        ========================================================================
      */}
      <div className="flex gap-2 px-4 pt-3">
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
                  ? "bg-sky-500 text-white shadow-[0_4px_12px_rgba(14,165,233,0.35)]"
                  : "bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-50"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* 
        ========================================================================
        LIVE AUCTION LOOP BANNER (3-MIN POWER HOUR & MONOSPACE TIMER)
        ========================================================================
      */}
      {requestsList.some((r) => r.status === "Bargaining") && (
        <div className="px-4 pt-3">
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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pink-500" />
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
        BARGAINING REQUEST CARDS (TARGET BUDGET | LOWEST QUOTE | OFFERS)
        WITH EXACT 2 BUTTONS: ACCEPT & CHANGE
        ========================================================================
      */}
      <div className="space-y-3 px-4 pt-3.5">
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
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
              >
                {/* Header Row */}
                <div className="flex items-start gap-3 px-4 pt-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 font-bold">
                    <Gavel className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-black text-slate-900">
                      {request.title}
                    </p>
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

                {/* 3-Column Equal Stats Panel */}
                <div className="mx-4 mt-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 p-3 grid grid-cols-3 divide-x divide-slate-200 text-center">
                  <div className="px-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Target Budget
                    </p>
                    <p className="text-[14px] font-black text-slate-700 mt-0.5">
                      ₹{request.targetBudget.toLocaleString()}
                    </p>
                  </div>

                  <div className="px-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Lowest Quote
                    </p>
                    <p className="text-[15px] font-black text-pink-600 mt-0.5">
                      ₹{request.lowestQuote.toLocaleString()}
                    </p>
                  </div>

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

                {/* EXACT 2 BUTTONS AT BOTTOM: ACCEPT & CHANGE */}
                <div
                  className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 px-4 py-3 bg-slate-50/90"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (lowestBid) {
                        setAcceptingBid({ request, bid: lowestBid });
                      } else {
                        setViewingOffersRequest(request);
                      }
                    }}
                    className="h-11 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-[13px] shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Accept</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setChangeBudgetReq(request);
                      setNewBudgetInput(request.targetBudget);
                    }}
                    className="h-11 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-extrabold text-[13px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs cursor-pointer"
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

      {/* 
        ========================================================================
        GOOGLE STITCH: FEATURED VERIFIED ESCROW DEALS (STUNNING REAL IMAGES)
        ========================================================================
      */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase">
              Exclusive Escrow Drops
            </h3>
          </div>
          <span className="text-[10px] font-bold text-sky-600">30%–45% OFF</span>
        </div>

        <div className="space-y-3">
          {STITCH_FEATURED_DEALS.map((deal) => (
            <article
              key={deal.id}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all"
            >
              <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                <img
                  src={deal.imgUrl}
                  alt={deal.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/icons/cab_hotel_package_v1.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/20 to-black/30" />
                <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                  <span className="bg-amber-500 text-slate-950 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    {deal.badge}
                  </span>
                  <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> {deal.rating}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="bg-emerald-600/95 text-white backdrop-blur-sm text-[8.5px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/40 flex items-center space-x-1">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>{deal.escrowBadge}</span>
                  </span>
                </div>
                <div className="absolute bottom-2 left-2.5 right-2.5">
                  <h4 className="text-[14px] font-black text-white leading-tight drop-shadow-sm">
                    {deal.title}
                  </h4>
                  <p className="text-[10px] text-slate-200 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                    <span className="truncate">{deal.subtitle}</span>
                  </p>
                </div>
              </div>

              <div className="p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-[15px] font-black text-emerald-700 font-mono">
                      {deal.price}
                    </span>
                    <span className="text-[9.5px] text-slate-400 line-through font-medium font-mono">
                      {deal.originalPrice}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-medium">
                      {deal.period}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Escrow Protected
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPresetOfferDetails({
                      destination: deal.dest,
                      origin: "Mumbai",
                      category: deal.id.includes("goa") || deal.id.includes("jaipur") || deal.id.includes("munnar") ? "Hotels" : "Packages"
                    });
                    setIsMakeAnOfferOpen(true);
                  }}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>Claim Deal / Bargain</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Change Budget Modal */}
      {changeBudgetReq && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-t-[36px] p-5 pb-8 shadow-2xl border-t border-slate-100 space-y-4 animate-in slide-in-from-bottom duration-300">
            {/* Top Swipe / Grab Bar */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto -mt-1 mb-2" />
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-[16px] text-slate-900">Change Target Budget</h3>
                <p className="text-[11px] text-slate-400">{changeBudgetReq.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setChangeBudgetReq(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-black text-slate-800 text-xl active:scale-95 transition-all cursor-pointer"
                >
                  -
                </button>
                <span className="text-[28px] font-black text-slate-900 w-44 font-mono">
                  ₹{newBudgetInput.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => setNewBudgetInput((p) => p + 1000)}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-black text-slate-800 text-xl active:scale-95 transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveChangedBudget}
                className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-[14px] rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Save New Budget
              </button>
              <button
                type="button"
                onClick={() => setChangeBudgetReq(null)}
                className="px-4 py-3 bg-slate-100 text-slate-700 font-bold text-[13px] rounded-2xl hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Direct Contact Unlock Modal */}
      {showOfflineUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-t-[36px] p-6 pb-9 shadow-2xl border-t border-slate-100 space-y-4 text-center animate-in slide-in-from-bottom duration-300">
            {/* Top Swipe / Grab Bar */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto -mt-2 mb-2" />
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
              className="text-[12px] text-slate-400 hover:text-slate-600 font-bold block mx-auto cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Secret Vendor Offers Modal */}
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

      {/* 4th Custom Request Rate Limit Paywall Modal */}
      <BargainingPaywallModal
        isOpen={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
        onUnlocked={() => {
          setShowRateLimitModal(false);
          setIsMakeAnOfferOpen(true);
        }}
      />

      {/* Make An Offer Flow Modal (Google Stitch Exact Layout) */}
      <MakeAnOfferModal
        isOpen={isMakeAnOfferOpen}
        onClose={() => setIsMakeAnOfferOpen(false)}
        onSubmit={handleMakeOfferSubmit}
        initialCategory={presetOfferDetails?.category || "Cabs"}
        initialOrigin={presetOfferDetails?.origin || "Mumbai"}
        initialDestination={presetOfferDetails?.destination || "Goa"}
      />
    </div>
  );
};
