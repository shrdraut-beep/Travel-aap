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
  X
} from "lucide-react";
import { PortalBottomNav, type PortalTabItem } from "../shared/PortalBottomNav";
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
import type { AgentActionId, AgentTabId } from "./types";

export type AgentPrimaryTab = "overview" | "offers" | "inventory" | "earnings" | "workspace";
export type WorkspaceSubTab = "markups" | "marketing" | "profile" | "support";

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
  { id: "workspace", label: "Workspace", Icon: Settings, imgSrc: "/icons/workspace.png" }
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
  const resolveInitial = (tabId: AgentTabId): { primary: AgentPrimaryTab; sub: WorkspaceSubTab } => {
    if (tabId === "overview" || tabId === "bookings") {
      return { primary: "overview", sub: "markups" };
    }
    if (tabId === "offers") return { primary: "offers", sub: "markups" };
    if (tabId === "inventory") return { primary: "inventory", sub: "markups" };
    if (tabId === "earnings") return { primary: "earnings", sub: "markups" };
    if (tabId === "markups") return { primary: "workspace", sub: "markups" };
    if (tabId === "marketing") return { primary: "workspace", sub: "marketing" };
    if (tabId === "support") return { primary: "workspace", sub: "support" };
    if (tabId === "profile") return { primary: "workspace", sub: "profile" };
    return { primary: "overview", sub: "markups" };
  };

  const initialResolved = resolveInitial(initialTab);
  const [primaryTab, setPrimaryTab] = useState<AgentPrimaryTab>(initialResolved.primary);
  const [workspaceSub, setWorkspaceSub] = useState<WorkspaceSubTab>(initialResolved.sub);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [primaryTab, workspaceSub]);

  useEffect(() => {
    if (open) {
      const res = resolveInitial(initialTab);
      setPrimaryTab(res.primary);
      setWorkspaceSub(res.sub);
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
    setPrimaryTab(primary as AgentPrimaryTab);
    if (primary === "workspace" && sub) setWorkspaceSub(sub as WorkspaceSubTab);
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
            {/* Compressed Header with Sky Gradient */}
            <header className="premium-sky-panel shrink-0 px-4 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="premium-gradient-pink flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white text-[15px] font-bold text-white shadow-sm">
                    {agencyName.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold leading-tight text-white">
                      {agencyName}
                    </p>
                    <p className="truncate text-[11px] font-medium text-white/80">
                      {agentEmail}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Dedicated Unmerged Workspace Sub-Navigation Toolbar - BORDERLESS 3D ICONS */}
            {primaryTab === "workspace" && (
              <div className="sticky top-0 z-20 bg-white/95 border-b border-slate-100 px-3 py-2.5 backdrop-blur-md shadow-xs flex items-center justify-around">
                <button
                  type="button"
                  onClick={() => setWorkspaceSub("markups")}
                  className="flex flex-1 flex-col items-center justify-center gap-1.5 py-1.5 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-11 w-11 items-center justify-center">
                    <img
                      src="/icons/make_an_offer.png"
                      alt="Markups"
                      className={`h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        workspaceSub === "markups" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] tracking-tight uppercase leading-none text-center truncate ${
                    workspaceSub === "markups" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
                  }`}>
                    Markups
                  </span>
                  {workspaceSub === "markups" && (
                    <span className="h-1 w-6 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setWorkspaceSub("marketing")}
                  className="flex flex-1 flex-col items-center justify-center gap-1.5 py-1.5 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-11 w-11 items-center justify-center">
                    <img
                      src="/icons/admin_operations.png"
                      alt="Marketing"
                      className={`h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        workspaceSub === "marketing" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] tracking-tight uppercase leading-none text-center truncate ${
                    workspaceSub === "marketing" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
                  }`}>
                    Marketing
                  </span>
                  {workspaceSub === "marketing" && (
                    <span className="h-1 w-6 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setWorkspaceSub("profile")}
                  className="flex flex-1 flex-col items-center justify-center gap-1.5 py-1.5 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-11 w-11 items-center justify-center">
                    <img
                      src="/icons/admin_users.png"
                      alt="Profile & KYC"
                      className={`h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        workspaceSub === "profile" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] tracking-tight uppercase leading-none text-center truncate ${
                    workspaceSub === "profile" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
                  }`}>
                    Profile & KYC
                  </span>
                  {workspaceSub === "profile" && (
                    <span className="h-1 w-6 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setWorkspaceSub("support")}
                  className="flex flex-1 flex-col items-center justify-center gap-1.5 py-1.5 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-11 w-11 items-center justify-center">
                    <img
                      src="/icons/trip_docs.png"
                      alt="Support"
                      className={`h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        workspaceSub === "support" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] tracking-tight uppercase leading-none text-center truncate ${
                    workspaceSub === "support" ? "text-sky-700 font-black" : "text-slate-600 font-bold"
                  }`}>
                    Support
                  </span>
                  {workspaceSub === "support" && (
                    <span className="h-1 w-6 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
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
                <OverviewPanel onAction={onAction} onNavigateTab={handleNavigateTab} />
              )}
              {primaryTab === "offers" && <OffersPanel onAction={onAction} />}
              {primaryTab === "inventory" && <InventoryPanel onAction={onAction} />}
              {primaryTab === "earnings" && <EarningsPanel onAction={onAction} />}
              {primaryTab === "workspace" && workspaceSub === "markups" && <MarkupsPanel onAction={onAction} />}
              {primaryTab === "workspace" && workspaceSub === "marketing" && <MarketingPanel onAction={onAction} />}
              {primaryTab === "workspace" && workspaceSub === "profile" && <ProfilePanel onAction={onAction} />}
              {primaryTab === "workspace" && workspaceSub === "support" && <AgentSupportPanel onAction={onAction} />}
            </div>

            {/* Docked Bottom Navigation */}
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
