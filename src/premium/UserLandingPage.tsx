import React, { useState } from "react";
import { AccountSheet } from "./mobile/AccountSheet";
import type { AccountItemId } from "./mobile/AccountSheet";
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

export interface UserLandingPageProps {
  onSearch?: (payload: SearchPayload) => void;
  onNotifications?: () => void;
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
  onSearch,
  onNotifications,
  onAccountItem,
  onQuickAction,
  onSelectOffer,
  onSelectDestination,
  onToggleWishlist,
  onViewAllDestinations,
  onNavigate
}) => {
  const [mode, setMode] = useState<SearchMode>("flights");
  const [tab, setTab] = useState<NavTab>("home");
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] bg-slate-50 pb-24">
      <AppBar
        onMenu={() => setAccountOpen(true)}
        onNotifications={onNotifications}
        onProfile={() => setAccountOpen(true)}
        notificationCount={2}
      />

      <div className="premium-gradient px-4 pb-16 pt-1">
        <p className="text-[20px] font-bold leading-tight tracking-tight text-white">
          Where to next?
        </p>
        <p className="mt-0.5 text-[13px] font-medium text-white/85">
          Flights, hotels, trains, buses and cabs in one app.
        </p>
      </div>

      <main className="relative -mt-12">
        <div className="px-4">
          <div className="rounded-3xl bg-white px-2 pb-1 pt-2 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.6)]">
            <ModeStrip mode={mode} onChange={setMode} />
          </div>
        </div>

        <div className="px-4 pt-3">
          <SearchCard mode={mode} onSearch={onSearch} />
        </div>

        <QuickActions onSelect={onQuickAction} />
        <OffersRail onSelect={onSelectOffer} />
        <DestinationRail
          onSelect={onSelectDestination}
          onToggleWishlist={onToggleWishlist}
          onViewAll={onViewAllDestinations}
        />

        <p className="px-4 pb-6 pt-8 text-center text-[11px] font-medium text-slate-400">
          © 2026 RouTripO · Made for travellers, in India.
        </p>
      </main>

      <BottomNav
        active={tab}
        onChange={(next) => {
          setTab(next);
          if (next === "account") setAccountOpen(true);
          onNavigate?.(next);
        }}
      />

      <AccountSheet
        open={accountOpen}
        onSelect={(item) => {
          setAccountOpen(false);
          setTab("home");
          onAccountItem?.(item);
        }}
        onClose={() => {
          setAccountOpen(false);
          setTab("home");
        }}
      />
    </div>
  );
};
