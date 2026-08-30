import React, { useState } from "react";
import {
  Activity,
  Building2,
  DollarSign,
  Gift,
  LayoutDashboard,
  MessageSquare,
  ShieldAlert,
  Users
} from "lucide-react";
import { PortalShell } from "../shared/PortalShell";
import type { TabDescriptor } from "../shared/TabStrip";
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

export interface AdminScreenProps {
  open: boolean;
  adminName?: string;
  adminEmail?: string;
  pendingVendorCount?: number;
  initialTab?: AdminTabId;
  onAction: (action: AdminActionId) => void;
  onClose: () => void;
}

/**
 * Admin dashboard preview in the premium design-kit language. Mirrors the
 * sections of the production admin view; every control reports through
 * onAction so it can be wired to the real handlers later.
 */
export const AdminScreen: React.FC<AdminScreenProps> = ({
  open,
  adminName = "Shrikant Raut",
  adminEmail = "admin@routripo.app",
  pendingVendorCount = 3,
  initialTab = "analytics",
  onAction,
  onClose
}) => {
  const [tab, setTab] = useState<AdminTabId>(initialTab);

  const tabs: TabDescriptor<AdminTabId>[] = [
    { id: "analytics", label: "Analytics", Icon: LayoutDashboard },
    { id: "security", label: "Security", Icon: ShieldAlert },
    { id: "vendors", label: "Vendors", Icon: Building2, badge: pendingVendorCount },
    { id: "payouts", label: "Payouts", Icon: DollarSign },
    { id: "ads", label: "Ads", Icon: Gift },
    { id: "apis", label: "APIs", Icon: Activity },
    { id: "support", label: "Support", Icon: MessageSquare },
    { id: "users", label: "Users", Icon: Users }
  ];

  return (
    <PortalShell<AdminTabId>
      open={open}
      title="Admin dashboard"
      heading={adminName}
      subheading={`Platform admin · ${adminEmail}`}
      initial={adminName.trim().charAt(0).toUpperCase()}
      tabs={tabs}
      active={tab}
      onSelectTab={setTab}
      onClose={onClose}
    >
      {tab === "analytics" && <AnalyticsPanel onAction={onAction} />}
      {tab === "security" && <SecurityPanel onAction={onAction} />}
      {tab === "vendors" && <VendorsPanel onAction={onAction} />}
      {tab === "payouts" && <PayoutsPanel onAction={onAction} />}
      {tab === "ads" && <AdsPanel onAction={onAction} />}
      {tab === "apis" && <ApisPanel onAction={onAction} />}
      {tab === "support" && <SupportPanel onAction={onAction} />}
      {tab === "users" && <UsersPanel onAction={onAction} />}
    </PortalShell>
  );
};
