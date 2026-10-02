import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Building2,
  DollarSign,
  Headphones,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X
} from "lucide-react";
import { PortalBottomNav, type PortalTabItem } from "../shared/PortalBottomNav";
import { GlobalBrandHeader } from "../../components/common/GlobalBrandHeader";
import {
  AdsPanel,
  AnalyticsPanel,
  ApisPanel,
  PayoutsPanel,
  SecurityPanel,
  SupportPanel,
  UsersPanel,
  VendorsPanel
} from "./tabs";
import type { AdminActionId, AdminTabId } from "./types";

export type AdminPrimaryTab = "analytics" | "vendors" | "payouts" | "system" | "operations";
export type SystemSubTab = "security" | "apis";
export type OperationsSubTab = "users" | "support" | "ads";

export interface AdminScreenProps {
  open: boolean;
  adminName?: string;
  adminEmail?: string;
  pendingVendorCount?: number;
  initialTab?: AdminTabId;
  onAction: (action: AdminActionId) => void;
  onClose: () => void;
}

const BOTTOM_TABS: PortalTabItem<AdminPrimaryTab>[] = [
  { id: "analytics", label: "Analytics", Icon: LayoutDashboard, imgSrc: "/icons/admin_analytics.png" },
  { id: "vendors", label: "Vendors", Icon: Building2, imgSrc: "/icons/vendor_agency.png" },
  { id: "payouts", label: "Payouts", Icon: DollarSign, imgSrc: "/icons/routripo_wallet.png" },
  { id: "system", label: "System", Icon: ShieldAlert, imgSrc: "/icons/admin_system.png" },
  { id: "operations", label: "Operations", Icon: Users, imgSrc: "/icons/admin_operations.png" }
];

export const AdminScreen: React.FC<AdminScreenProps> = ({
  open,
  adminName = "System Admin",
  adminEmail = "admin@routripo.app",
  pendingVendorCount = 0,
  initialTab = "analytics",
  onAction,
  onClose
}) => {
  // Map legacy/deep AdminTabId to primary bottom tab and sub-tab
  const resolveInitial = (tabId: AdminTabId): { primary: AdminPrimaryTab; systemSub: SystemSubTab; opsSub: OperationsSubTab } => {
    if (tabId === "security" || tabId === "apis") {
      return { primary: "system", systemSub: tabId as SystemSubTab, opsSub: "users" };
    }
    if (tabId === "users" || tabId === "support" || tabId === "ads") {
      return { primary: "operations", systemSub: "security", opsSub: tabId as OperationsSubTab };
    }
    if (tabId === "vendors") return { primary: "vendors", systemSub: "security", opsSub: "users" };
    if (tabId === "payouts") return { primary: "payouts", systemSub: "security", opsSub: "users" };
    return { primary: "analytics", systemSub: "security", opsSub: "users" };
  };

  const initialResolved = resolveInitial(initialTab);
  const [primaryTab, setPrimaryTab] = useState<AdminPrimaryTab>(initialResolved.primary);
  const [systemSub, setSystemSub] = useState<SystemSubTab>(initialResolved.systemSub);
  const [opsSub, setOpsSub] = useState<OperationsSubTab>(initialResolved.opsSub);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [primaryTab, systemSub, opsSub]);

  useEffect(() => {
    if (open) {
      const res = resolveInitial(initialTab);
      setPrimaryTab(res.primary);
      setSystemSub(res.systemSub);
      setOpsSub(res.opsSub);
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
    t.id === "vendors" ? { ...t, badge: pendingVendorCount } : t
  );

  const handleNavigateTab = (primary: string, sub?: string) => {
    setPrimaryTab(primary as AdminPrimaryTab);
    if (primary === "system" && sub) setSystemSub(sub as SystemSubTab);
    if (primary === "operations" && sub) setOpsSub(sub as OperationsSubTab);
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
            {/* Signature RouTripo Curved Brand Header (Admin Vivid Green) */}
            <GlobalBrandHeader
              subtitle={`${adminName} · Super Administrator`}
              theme="green"
              badge="ADMIN"
              onNotifications={() => alert("Admin alerts: Platform operating normally, 0 security warnings.")}
              onOpenProfile={() => setPrimaryTab("system")}
              actionButton={
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 hover:bg-white border border-emerald-200/80 text-emerald-800 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              }
            />

            {/* Dedicated Unmerged Secondary Toolbar: System Sub-tabs - BORDERLESS 3D ICONS */}
            {primaryTab === "system" && (
              <div className="sticky top-0 z-20 bg-white/95 border-b border-slate-100 px-3 py-2 backdrop-blur-md shadow-xs flex items-center justify-around">
                <button
                  type="button"
                  onClick={() => setSystemSub("security")}
                  className="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <img
                      src="/icons/admin_system.png"
                      alt="Security"
                      className={`h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        systemSub === "security" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] tracking-tight leading-none text-center truncate ${
                    systemSub === "security" ? "text-sky-700 font-black" : "text-slate-600 font-semibold"
                  }`}>
                    Security Posture
                  </span>
                  {systemSub === "security" && (
                    <span className="h-1 w-5 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSystemSub("apis")}
                  className="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <img
                      src="/icons/admin_api_health.png"
                      alt="API Health"
                      className={`h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        systemSub === "apis" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] tracking-tight leading-none text-center truncate ${
                    systemSub === "apis" ? "text-sky-700 font-black" : "text-slate-600 font-semibold"
                  }`}>
                    API Health
                  </span>
                  {systemSub === "apis" && (
                    <span className="h-1 w-5 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>
              </div>
            )}

            {/* Dedicated Unmerged Secondary Toolbar: Operations Sub-tabs - BORDERLESS 3D ICONS */}
            {primaryTab === "operations" && (
              <div className="sticky top-0 z-20 bg-white/95 border-b border-slate-100 px-2 py-2 backdrop-blur-md shadow-xs flex items-center justify-around">
                <button
                  type="button"
                  onClick={() => setOpsSub("users")}
                  className="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <img
                      src="/icons/admin_users.png"
                      alt="Users"
                      className={`h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        opsSub === "users" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] tracking-tight leading-none text-center truncate ${
                    opsSub === "users" ? "text-sky-700 font-black" : "text-slate-600 font-semibold"
                  }`}>
                    Users
                  </span>
                  {opsSub === "users" && (
                    <span className="h-1 w-5 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setOpsSub("support")}
                  className="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <img
                      src="/icons/admin_operations.png"
                      alt="Tickets"
                      className={`h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        opsSub === "support" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] tracking-tight leading-none text-center truncate ${
                    opsSub === "support" ? "text-sky-700 font-black" : "text-slate-600 font-semibold"
                  }`}>
                    Tickets
                  </span>
                  {opsSub === "support" && (
                    <span className="h-1 w-5 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setOpsSub("ads")}
                  className="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all cursor-pointer group active:scale-95 bg-transparent border-none outline-none"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <img
                      src="/icons/make_an_offer.png"
                      alt="Ads & Offers"
                      className={`h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] transition-transform duration-200 ${
                        opsSub === "ads" ? "scale-115" : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] tracking-tight leading-none text-center truncate ${
                    opsSub === "ads" ? "text-sky-700 font-black" : "text-slate-600 font-semibold"
                  }`}>
                    Ads & Offers
                  </span>
                  {opsSub === "ads" && (
                    <span className="h-1 w-5 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                  )}
                </button>
              </div>
            )}

            {/* Scrollable Body Content */}
            <div
              ref={bodyRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-24"
            >
              {primaryTab === "analytics" && (
                <AnalyticsPanel onAction={onAction} onNavigateTab={handleNavigateTab} />
              )}
              {primaryTab === "vendors" && <VendorsPanel onAction={onAction} />}
              {primaryTab === "payouts" && <PayoutsPanel onAction={onAction} />}
              {primaryTab === "system" && systemSub === "security" && <SecurityPanel onAction={onAction} />}
              {primaryTab === "system" && systemSub === "apis" && <ApisPanel onAction={onAction} />}
              {primaryTab === "operations" && opsSub === "users" && <UsersPanel onAction={onAction} />}
              {primaryTab === "operations" && opsSub === "support" && <SupportPanel onAction={onAction} />}
              {primaryTab === "operations" && opsSub === "ads" && <AdsPanel onAction={onAction} />}
            </div>

            {/* Docked Bottom Navigation */}
            <PortalBottomNav<AdminPrimaryTab>
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