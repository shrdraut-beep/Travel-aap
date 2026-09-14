import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  CloudSun,
  Navigation,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingDown,
  Users,
  Wifi
} from "lucide-react";
import { AccountScreen } from "./account/AccountScreen";
import type { AccountItemId } from "./account/types";
import { AppBar } from "./mobile/AppBar";
import { BottomNav } from "./mobile/BottomNav";
import { DestinationRail } from "./mobile/DestinationRail";
import type { Destination } from "./mobile/DestinationRail";
import { ModeStrip } from "./mobile/ModeStrip";
import { OffersRail } from "./mobile/OffersRail";
import type { Offer } from "./mobile/OffersRail";
import { QuickActions } from "./mobile/QuickActions";
import type { QuickActionId } from "./mobile/QuickActions";
import { SearchCard } from "./mobile/SearchCard";
import type { NavTab, SearchMode, SearchPayload } from "./mobile/types";
import { BookingFlowCoordinator } from "./booking/BookingFlowCoordinator";
import type { FlightSearchParams } from "./booking/FlightResultsStep";
import { HotelBookingCoordinator } from "./booking/HotelBookingCoordinator";
import type { HotelSearchParams } from "./booking/HotelBookingCoordinator";
import { BusBookingCoordinator } from "./booking/BusBookingCoordinator";
import type { BusSearchParams } from "./booking/BusBookingCoordinator";
import { CarBookingCoordinator } from "./booking/CarBookingCoordinator";
import type { CarSearchParams } from "./booking/CarBookingCoordinator";
import { HolidayBookingCoordinator } from "./booking/HolidayBookingCoordinator";
import type { HolidaySearchParams } from "./booking/HolidayBookingCoordinator";
import { TrainBookingCoordinator } from "./booking/TrainBookingCoordinator";
import type { TrainSearchParams } from "./booking/TrainBookingCoordinator";

export interface UserLandingPageProps {
  hideHeader?: boolean;
  userName?: string;
  userEmail?: string;
  onSearch?: (payload: SearchPayload) => void;
  onNotifications?: () => void;
  onOpenAccount?: () => void;
  onAccountItem?: (item: AccountItemId) => void;
  onQuickAction?: (action: QuickActionId) => void;
  onSelectOffer?: (offer: Offer) => void;
  onSelectDestination?: (destination: Destination) => void;
  onToggleWishlist?: (destination: Destination, wishlisted: boolean) => void;
  onViewAllDestinations?: () => void;
  onNavigate?: (tab: NavTab) => void;
}

/**
 * User portal home screen. Phone-only by design: one column, sheet-based
 * pickers, and a fixed bottom tab bar - the layout native travel apps use.
 * Every action is a typed prop so the existing backend wires straight in.
 */
export const UserLandingPage: React.FC<UserLandingPageProps> = ({
  userName = "Traveler",
  userEmail = "",
  onSearch,
  onNotifications,
  onOpenAccount,
  onAccountItem,
  onQuickAction,
  onSelectOffer,
  onSelectDestination,
  onToggleWishlist,
  onViewAllDestinations,
  onNavigate,
  hideHeader
}) => {
  const [mode, setMode] = useState<SearchMode>("flights");
  const [tab, setTab] = useState<NavTab>("home");
  const [pnrNumber, setPnrNumber] = useState("");
  const [pnrResult, setPnrResult] = useState<{ status: string; detail: string; badge: string } | null>(null);
  const [isCheckingPnr, setIsCheckingPnr] = useState(false);
  const [standaloneFlightSearch, setStandaloneFlightSearch] = useState<FlightSearchParams | null>(null);
  const [standaloneHotelSearch, setStandaloneHotelSearch] = useState<HotelSearchParams | null>(null);
  const [standaloneBusSearch, setStandaloneBusSearch] = useState<BusSearchParams | null>(null);
  const [standaloneCarSearch, setStandaloneCarSearch] = useState<CarSearchParams | null>(null);
  const [standaloneHolidaySearch, setStandaloneHolidaySearch] = useState<HolidaySearchParams | null>(null);
  const [standaloneTrainSearch, setStandaloneTrainSearch] = useState<TrainSearchParams | null>(null);

  const { t } = useTranslation();

  const handleCardSearch = (payload: SearchPayload) => {
    onSearch?.(payload);

    const formatDate = (d: any, fallbackDays: number) => {
      if (!d) return new Date(Date.now() + 86400000 * fallbackDays).toISOString().split("T")[0];
      if (d instanceof Date) return d.toISOString().split("T")[0];
      return String(d).split("T")[0];
    };

    if (payload.mode === "hotels") {
      setStandaloneHotelSearch({
        destination: payload.destination || payload.origin || "Mumbai",
        checkInDate: formatDate(payload.dates?.start, 1),
        checkOutDate: formatDate(payload.dates?.end, 3),
        adults: payload.travellers?.adults || 2,
        rooms: payload.rooms || 1
      });
    } else if (payload.mode === "buses") {
      setStandaloneBusSearch({
        origin: payload.origin || "Mumbai",
        destination: payload.destination || "Goa",
        date: formatDate(payload.dates?.start, 1),
        passengers: payload.travellers?.adults || 1
      });
    } else if (payload.mode === "cabs") {
      setStandaloneCarSearch({
        location: payload.origin || "Mumbai",
        pickupDate: formatDate(payload.dates?.start, 1),
        dropDate: formatDate(payload.dates?.end, 3),
        passengers: payload.travellers?.adults || 2
      });
    } else if (payload.mode === "holidays") {
      setStandaloneHolidaySearch({
        location: payload.destination || "Maldives",
        startDate: formatDate(payload.dates?.start, 1),
        travelers: payload.travellers?.adults || 2
      });
    } else if (payload.mode === "trains") {
      setStandaloneTrainSearch({
        origin: payload.origin || "Mumbai",
        destination: payload.destination || "Delhi",
        date: formatDate(payload.dates?.start, 1),
        passengers: payload.travellers?.adults || 1
      });
    } else {
      const extractCode = (str: string, fallback: string) => {
        if (!str) return fallback;
        const match = str.match(/\(([A-Z]{3})\)/);
        if (match) return match[1];
        if (str.length === 3) return str.toUpperCase();
        const firstWord = str.split(/[\s,]+/)[0];
        return firstWord.toUpperCase().slice(0, 3) || fallback;
      };

      const org = extractCode(payload.origin, "BOM");
      const dst = extractCode(payload.destination, "DEL");
      const departDate = formatDate(payload.dates?.start, 1);
      const returnDate = payload.dates?.end ? formatDate(payload.dates.end, 3) : undefined;

      setStandaloneFlightSearch({
        origin: org,
        destination: dst,
        departDate,
        returnDate,
        adults: payload.travellers?.adults || 1,
        children: payload.travellers?.children || 0,
        infants: payload.travellers?.infants || 0,
        cabinClass: payload.cabin || "Economy",
        tripType: payload.tripType === "round" ? "roundTrip" : payload.tripType === "multicity" ? "multiCity" : "oneWay",
        slices: payload.legs
      });
    }
  };

  const handlePnrCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrNumber.trim()) return;
    setIsCheckingPnr(true);
    setTimeout(() => {
      setIsCheckingPnr(false);
      setPnrResult({
        status: "CONFIRMED (CNF)",
        detail: `Flight 6E 729 · Pune (PNQ) → Goa (GOI) · Seat 4B (Window) · Departs 08:37 AM`,
        badge: "ON TIME"
      });
    }, 600);
  };

  return (
    <div className={`premium-root mx-auto w-full max-w-[520px] bg-[var(--premium-page)] pb-24 ${hideHeader ? "h-full" : "min-h-screen"}`}>
      {!hideHeader && (<AppBar
        onMenu={() => onOpenAccount?.()}
        onNotifications={onNotifications}
        onProfile={() => onOpenAccount?.()}
        notificationCount={2}
      />)}

      {!hideHeader && (<div className="premium-gradient px-4 pb-14 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold text-white/80 uppercase tracking-wider">
              Welcome back
            </p>
            <h1 className="text-[21px] font-black leading-tight tracking-tight text-white">
              Hello, {userName.split(" ")[0]} 👋
            </h1>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-sm border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              AI Trip Pilot
            </span>
            <span className="text-[10px] font-bold text-white/80 flex items-center gap-1">
              <CloudSun className="w-3 h-3 text-amber-300" />
              Goa · 28°C Sunny
            </span>
          </div>
        </div>
        <p className="mt-1.5 text-[12px] font-medium text-white/85">
          One app for instant bookings, smart splitting, AI itineraries & reverse bidding.
        </p>
      </div>)}

      <main className={`relative space-y-4 ${hideHeader ? "pt-4" : "-mt-10"}`}>
        {/* Search Mode Strip */}
        <div className="px-4">
          <div className="rounded-3xl bg-white px-2 pb-1 pt-2 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.6)]">
            <ModeStrip mode={mode} onChange={setMode} />
          </div>
        </div>

        {/* Master Search Card */}
        <div className="px-4">
          <SearchCard mode={mode} onSearch={handleCardSearch} />
        </div>

        {/* SaaS Travel Factor: Smart Travel Hub */}
        <div className="px-4 pt-1">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[14px] font-extrabold tracking-tight text-slate-900">
              Smart Travel Suite
            </h2>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              SaaS Powered
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                onAccountItem?.("planning-ai");
                onOpenAccount?.();
              }}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 text-left shadow-sm transition-all hover:border-sky-300 hover:shadow-md active:scale-[0.98]"
            >
              <img src="/icons/my_trips.png" alt="AI Day Planner" className="h-10 w-10 shrink-0 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-110" />
              <div className="min-w-0">
                <p className="text-[12px] font-extrabold text-slate-900 leading-snug">
                  AI Day Planner
                </p>
                <p className="text-[10px] font-medium text-slate-500 leading-tight">
                  Instant 3-day plans
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onAccountItem?.("expenses-split");
                onOpenAccount?.();
              }}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 text-left shadow-sm transition-all hover:border-pink-300 hover:shadow-md active:scale-[0.98]"
            >
              <img src="/icons/routripo_wallet.png" alt="Group Split Kitty" className="h-10 w-10 shrink-0 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-110" />
              <div className="min-w-0">
                <p className="text-[12px] font-extrabold text-slate-900 leading-snug">
                  Group Split Kitty
                </p>
                <p className="text-[10px] font-medium text-slate-500 leading-tight">
                  Zero-awkward ledger
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onAccountItem?.("bargain-new-request");
                onOpenAccount?.();
              }}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 text-left shadow-sm transition-all hover:border-sky-300 hover:shadow-md active:scale-[0.98]"
            >
              <img src="/icons/bargaining.png" alt="Reverse Bidding" className="h-10 w-10 shrink-0 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-110" />
              <div className="min-w-0">
                <p className="text-[12px] font-extrabold text-slate-900 leading-snug">
                  Reverse Bidding
                </p>
                <p className="text-[10px] font-medium text-slate-500 leading-tight">
                  Agents bid your budget
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onAccountItem?.("my-tickets");
                onOpenAccount?.();
              }}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 text-left shadow-sm transition-all hover:border-slate-400 hover:shadow-md active:scale-[0.98]"
            >
              <img src="/icons/booking.png" alt="Offline Pass Vault" className="h-10 w-10 shrink-0 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-110" />
              <div className="min-w-0">
                <p className="text-[12px] font-extrabold text-slate-900 leading-snug">
                  Offline Pass Vault
                </p>
                <p className="text-[10px] font-medium text-slate-500 leading-tight">
                  Tickets ready offline
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Active Upcoming Trip Pass */}
        <div className="px-4">
          <div className="bg-white rounded-3xl p-4 shadow-[0_10px_35px_-18px_rgba(2,132,199,0.14)] border border-slate-200 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 text-sky-600 text-[10px] font-black">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-700">
                  Upcoming Flight · in 3 days
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-pink-800 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                  Synced
                </span>
                <span className="text-[10px] font-bold bg-[#f5f2eb] text-slate-700 px-2 py-0.5 rounded-full border border-[#e3ded5]">
                  6E 729 · IndiGo
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between my-2">
              <div>
                <p className="text-[22px] font-black leading-none text-slate-900">PNQ</p>
                <p className="text-[11px] font-medium text-slate-500">Pune</p>
                <p className="text-[12px] font-bold text-sky-700 mt-0.5">08:37 AM</p>
              </div>

              <div className="flex flex-col items-center px-3 flex-1">
                <span className="text-[10px] font-semibold text-slate-400">1h 10m · Direct</span>
                <div className="w-full flex items-center gap-1 my-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <span className="h-0.5 flex-1 bg-slate-200" />
                  <Plane className="w-3.5 h-3.5 text-sky-600 rotate-90" />
                  <span className="h-0.5 flex-1 bg-slate-200" />
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-700" />
                </div>
                <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                  Gate 4B · On Time
                </span>
              </div>

              <div className="text-right">
                <p className="text-[22px] font-black leading-none text-slate-900">GOI</p>
                <p className="text-[11px] font-medium text-slate-500">Goa</p>
                <p className="text-[12px] font-bold text-sky-700 mt-0.5">09:47 AM</p>
              </div>
            </div>

            <div className="pt-2.5 border-t border-[#f0ebe1] flex items-center justify-between mt-2">
              <span className="text-[11px] font-semibold text-slate-600">
                Seat <strong className="text-slate-900">4B</strong> (Window) · 15kg Baggage
              </span>
              <button
                type="button"
                onClick={() => {
                  onAccountItem?.("my-tickets");
                  onOpenAccount?.();
                }}
                className="inline-flex items-center gap-1 text-[12px] font-extrabold text-sky-700 hover:text-sky-900 transition-colors"
              >
                <span>Digital Pass</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Live PNR & Status Tracker Widget */}
        <div className="px-4 py-1">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[12px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-sky-600" />
                Live PNR & Flight Status Tracker
              </span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                Live IRCTC / DGCA
              </span>
            </div>

            <form onSubmit={handlePnrCheck} className="flex gap-2">
              <input
                type="text"
                value={pnrNumber}
                onChange={(e) => setPnrNumber(e.target.value)}
                placeholder="Enter 10-digit PNR or Flight No (e.g. 6E 729)..."
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[#faf8f4] border border-slate-200 text-[13px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-sky-500 transition-all"
              />
              <button
                type="submit"
                disabled={isCheckingPnr}
                className="px-4 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white rounded-2xl text-[13px] font-bold shadow-md shadow-rose-500/30 hover:from-sky-600 hover:to-rose-700 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
              >
                {isCheckingPnr ? (
                  <span className="animate-spin text-xs">⏳</span>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Check</span>
                  </>
                )}
              </button>
            </form>

            {pnrResult && (
              <div className="mt-3 p-3 bg-sky-50/80 rounded-2xl border border-sky-200/80 text-slate-900 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-black text-slate-900">
                    Status: {pnrResult.status}
                  </span>
                  <span className="text-[10px] font-black bg-sky-600 text-white px-2 py-0.5 rounded-full">
                    {pnrResult.badge}
                  </span>
                </div>
                <p className="text-[12px] font-medium text-slate-700">
                  {pnrResult.detail}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="py-2">
          <OffersRail onSelect={onSelectOffer} />
        </div>
        <div className="py-2">
          <DestinationRail
            onSelect={onSelectDestination}
            onToggleWishlist={onToggleWishlist}
            onViewAll={onViewAllDestinations}
          />
        </div>

        <div className="px-4 pt-3 pb-2">
          <div className="rounded-3xl bg-[#f5f1e8] p-4 border border-slate-200 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-[13px] mb-1">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>100% Escrow Protected Booking Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-600 max-w-[340px] mx-auto">
              Payments are securely locked in RoutTripo Escrow and released only after your journey begins safely.
            </p>
          </div>
        </div>

        <p className="px-4 pb-6 pt-4 text-center text-[11px] font-medium text-slate-400">
          © 2026 RoutTripo · Made for travellers, in India.
        </p>
      </main>

      {!hideHeader && (<BottomNav
        active={tab}
        onChange={(next) => {
          setTab(next);
          if (next === "account") {
            onOpenAccount?.();
          } else {
            onNavigate?.(next);
          }
        }}
      />)}

      {standaloneFlightSearch && (
        <BookingFlowCoordinator
          initialSearchParams={standaloneFlightSearch}
          onClose={() => setStandaloneFlightSearch(null)}
        />
      )}

      {standaloneHotelSearch && (
        <HotelBookingCoordinator
          initialSearchParams={standaloneHotelSearch}
          onClose={() => setStandaloneHotelSearch(null)}
        />
      )}

      {standaloneBusSearch && (
        <BusBookingCoordinator
          initialSearchParams={standaloneBusSearch}
          onClose={() => setStandaloneBusSearch(null)}
        />
      )}

      {standaloneCarSearch && (
        <CarBookingCoordinator
          initialSearchParams={standaloneCarSearch}
          onClose={() => setStandaloneCarSearch(null)}
        />
      )}

      {standaloneHolidaySearch && (
        <HolidayBookingCoordinator
          initialSearchParams={standaloneHolidaySearch}
          onExit={() => setStandaloneHolidaySearch(null)}
        />
      )}

      {standaloneTrainSearch && (
        <TrainBookingCoordinator
          initialSearchParams={standaloneTrainSearch}
          onClose={() => setStandaloneTrainSearch(null)}
        />
      )}
    </div>
  );
};

