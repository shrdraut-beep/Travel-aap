import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  Headphones,
  Megaphone,
  Package,
  Percent,
  Settings,
  Tag,
  TrendingUp,
  Wallet,
  KeyRound,
  X
} from "lucide-react";
import { PortalBottomNav, type PortalTabItem } from "../shared/PortalBottomNav";
import { GlobalBrandHeader } from "../../components/common/GlobalBrandHeader";
import {
  AgentSupportPanel,
  BookingsPanel,
  EarningsPanel,
  InventoryPanel,
  MarketingPanel,
  MarkupsPanel,
  OffersPanel,
  OverviewPanel,
  ProfilePanel
} from "./tabs";
import { VendorAPIDashboard } from "./VendorAPIDashboard";
import type { AgentActionId, AgentTabId } from "./types";

export type AgentPrimaryTab = "overview" | "offers" | "inventory" | "earnings" | "profile";
export type ProfileSubTab = "profile" | "api_access" | "markups" | "marketing" | "support";
export type InventorySubTab = "packages" | "fasttrack" | "vehicle" | "bus" | "portal";

export interface AgentScreenProps {
  open: boolean;
  agencyName?: string;
  agentEmail?: string;
  openLeadCount?: number;
  initialTab?: AgentTabId;
  onAction: (action: AgentActionId) => void;
  onClose: () => void;
}

const BOTTOM_TABS: PortalTabItem<AgentPrimaryTab>[] = [
  { id: "overview", label: "Overview", Icon: TrendingUp, imgSrc: "/icons/admin_analytics.png" },
  { id: "offers", label: "Bidding", Icon: Tag, imgSrc: "/icons/make_an_offer.png" },
  { id: "inventory", label: "Inventory", Icon: Package, imgSrc: "/icons/inventory.png" },
  { id: "earnings", label: "Earnings", Icon: Wallet, imgSrc: "/icons/routripo_wallet.png" },
  { id: "profile", label: "Profile", Icon: Settings, imgSrc: "/icons/admin_users.png" }
];

export const AgentScreen: React.FC<AgentScreenProps> = ({
  open,
  agencyName = "Partner Agency",
  agentEmail = "partner@routripo.app",
  openLeadCount = 0,
  initialTab = "overview",
  onAction,
  onClose
}) => {
  const resolveInitial = (tabId: AgentTabId): { primary: AgentPrimaryTab; sub: ProfileSubTab; inv?: InventorySubTab } => {
    if (tabId === "overview" || tabId === "bookings") {
      return { primary: "overview", sub: "profile" };
    }
    if (tabId === "offers") return { primary: "offers", sub: "profile" };
    if (tabId === "inventory") return { primary: "inventory", sub: "profile", inv: "packages" };
    if (tabId === "earnings") return { primary: "earnings", sub: "profile" };
    if (tabId === "api_access") return { primary: "profile", sub: "api_access" };
    if (tabId === "markups") return { primary: "profile", sub: "markups" };
    if (tabId === "marketing") return { primary: "profile", sub: "marketing" };
    if (tabId === "support") return { primary: "profile", sub: "support" };
    if (tabId === "profile") return { primary: "profile", sub: "profile" };
    return { primary: "overview", sub: "profile" };
  };

  const initialResolved = resolveInitial(initialTab);
  const [primaryTab, setPrimaryTab] = useState<AgentPrimaryTab>(initialResolved.primary);
  const [profileSub, setProfileSub] = useState<ProfileSubTab>(initialResolved.sub);
  const [inventorySub, setInventorySub] = useState<InventorySubTab>(initialResolved.inv || "packages");
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [primaryTab, profileSub, inventorySub]);

  useEffect(() => {
    if (open) {
      const res = resolveInitial(initialTab);
      setPrimaryTab(res.primary);
      setProfileSub(res.sub);
      if (res.inv) setInventorySub(res.inv);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const tabsWithBadge = BOTTOM_TABS.map((t) =>
    t.id === "offers" ? { ...t, badge: openLeadCount } : t
  );

  const handleNavigateTab = (primary: string, sub?: string) => {
    if (primary === "workspace" || primary === "profile") {
      setPrimaryTab("profile");
      if (sub) setProfileSub(sub as ProfileSubTab);
    } else {
      setPrimaryTab(primary as AgentPrimaryTab);
      if (primary === "inventory" && sub) setInventorySub(sub as InventorySubTab);
    }
  };

  const handleAgentAction = (action: AgentActionId) => {
    if (action === "overview-hotel-onboarding") {
      handleNavigateTab("inventory", "fasttrack");
    }
    onAction(action);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="premium-root fixed inset-0 z-[70] bg-slate-900/40"
        >
          <motion.section
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="mx-auto flex h-full w-full max-w-[520px] flex-col bg-[var(--premium-page)] shadow-2xl relative"
          >
            {/* Signature RouTripo Curved Brand Header (Vendor Orange) */}
            <GlobalBrandHeader
              subtitle={`${agencyName} · Partner Vendor`}
              theme="orange"
              badge="VENDOR"
              onNotifications={() => alert("Partner alerts: All bidding feeds & inventory active!")}
              onOpenProfile={() => setPrimaryTab("profile")}
              actionButton={
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 hover:bg-white border border-orange-200/80 text-orange-800 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              }
            />

            {/* Profile Sub-Navigation Toolbar - BORDERLESS 3D ICONS */}
            {primaryTab === "profile" && (
              <div className="sticky top-0 z-20 bg-white/95 border-b border-slate-100 px-2 py-2 backdrop-blur-md shadow-xs flex items-center justify-around overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setProfileSub("profile")}
                  className="flex flex-1 min-w-[62px] flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <img
                      src="/icons/admin_users.png"
                      alt="Profile"
                      className={`h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        profileSub === "profile" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] tracking-tight uppercase leading-none text-center truncate ${
                    profileSub === "profile" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
                  }`}>
                    Profile & KYC
                  </span>
                  {profileSub === "profile" && (
                    <span className="h-1 w-5 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setProfileSub("api_access")}
                  className="flex flex-1 min-w-[62px] flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <img
                      src="/icons/secret.png"
                      alt="B2B API"
                      className={`h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        profileSub === "api_access" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] tracking-tight uppercase leading-none text-center truncate ${
                    profileSub === "api_access" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
                  }`}>
                    B2B API
                  </span>
                  {profileSub === "api_access" && (
                    <span className="h-1 w-5 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setProfileSub("markups")}
                  className="flex flex-1 min-w-[62px] flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <img
                      src="/icons/make_an_offer.png"
                      alt="Markups"
                      className={`h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        profileSub === "markups" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] tracking-tight uppercase leading-none text-center truncate ${
                    profileSub === "markups" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
                  }`}>
                    Markups
                  </span>
                  {profileSub === "markups" && (
                    <span className="h-1 w-5 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setProfileSub("marketing")}
                  className="flex flex-1 min-w-[62px] flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <img
                      src="/icons/admin_operations.png"
                      alt="Marketing"
                      className={`h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        profileSub === "marketing" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] tracking-tight uppercase leading-none text-center truncate ${
                    profileSub === "marketing" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
                  }`}>
                    Marketing
                  </span>
                  {profileSub === "marketing" && (
                    <span className="h-1 w-5 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setProfileSub("support")}
                  className="flex flex-1 min-w-[62px] flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <img
                      src="/icons/trip_docs.png"
                      alt="Support"
                      className={`h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        profileSub === "support" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] tracking-tight uppercase leading-none text-center truncate ${
                    profileSub === "support" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
                  }`}>
                    Support
                  </span>
                  {profileSub === "support" && (
                    <span className="h-1 w-5 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>
              </div>
            )}

            {/* Scrollable Body */}
            <div
              ref={bodyRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-24"
            >
              {primaryTab === "overview" && (
                <OverviewPanel onAction={handleAgentAction} onNavigateTab={handleNavigateTab} />
              )}
              {primaryTab === "offers" && <OffersPanel onAction={handleAgentAction} />}
              {primaryTab === "inventory" && <InventoryPanel onAction={handleAgentAction} initialSubTab={inventorySub} />}
              {primaryTab === "earnings" && <EarningsPanel onAction={handleAgentAction} />}
              {primaryTab === "profile" && profileSub === "profile" && <ProfilePanel onAction={onAction} />}
              {primaryTab === "profile" && profileSub === "api_access" && (
                <VendorAPIDashboard
                  vendorId="VEND-1001"
                  onCompleteKYC={() => setProfileSub("profile")}
                />
              )}
              {primaryTab === "profile" && profileSub === "markups" && <MarkupsPanel onAction={onAction} />}
              {primaryTab === "profile" && profileSub === "marketing" && <MarketingPanel onAction={onAction} />}
              {primaryTab === "profile" && profileSub === "support" && <AgentSupportPanel onAction={onAction} />}
            </div>

            {/* Docked Bottom Navigation - 5 CLEAN TABS */}
            <PortalBottomNav<AgentPrimaryTab>
              tabs={tabsWithBadge}
              active={primaryTab}
              onChange={setPrimaryTab}
              accentColor="sky"
            />
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
