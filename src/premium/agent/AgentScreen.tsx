import React, { useState } from "react";
import {
  LifeBuoy,
  Megaphone,
  Package,
  Settings,
  Tag,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";
import { PortalShell } from "../shared/PortalShell";
import type { TabDescriptor } from "../shared/TabStrip";
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

export interface AgentScreenProps {
  open: boolean;
  agencyName?: string;
  agentEmail?: string;
  openLeadCount?: number;
  initialTab?: AgentTabId;
  onAction: (action: AgentActionId) => void;
  onClose: () => void;
}

/**
 * Agent portal preview in the premium design-kit language. Mirrors the
 * sections of the production agent view; every control reports through
 * onAction so it can be wired to the real handlers later.
 */
export const AgentScreen: React.FC<AgentScreenProps> = ({
  open,
  agencyName = "Wataghati Holidays",
  agentEmail = "partner@wataghati.in",
  openLeadCount = 2,
  initialTab = "overview",
  onAction,
  onClose
}) => {
  const [tab, setTab] = useState<AgentTabId>(initialTab);

  const tabs: TabDescriptor<AgentTabId>[] = [
    { id: "overview", label: "Overview", Icon: TrendingUp },
    { id: "offers", label: "Offers", Icon: Tag, badge: openLeadCount },
    { id: "inventory", label: "Inventory", Icon: Package },
    { id: "bookings", label: "Bookings", Icon: Users },
    { id: "earnings", label: "Earnings", Icon: Wallet },
    { id: "markups", label: "Markups", Icon: Tag },
    { id: "marketing", label: "Marketing", Icon: Megaphone },
    { id: "support", label: "Support", Icon: LifeBuoy },
    { id: "profile", label: "Profile", Icon: Settings }
  ];

  return (
    <PortalShell<AgentTabId>
      open={open}
      title="Agent portal"
      heading={agencyName}
      subheading={`B2B partner · ${agentEmail}`}
      initial={agencyName.trim().charAt(0).toUpperCase()}
      tabs={tabs}
      active={tab}
      onSelectTab={setTab}
      onClose={onClose}
    >
      {tab === "overview" && <OverviewPanel onAction={onAction} />}
      {tab === "offers" && <OffersPanel onAction={onAction} />}
      {tab === "inventory" && <InventoryPanel onAction={onAction} />}
      {tab === "bookings" && <BookingsPanel onAction={onAction} />}
      {tab === "earnings" && <EarningsPanel onAction={onAction} />}
      {tab === "markups" && <MarkupsPanel onAction={onAction} />}
      {tab === "marketing" && <MarketingPanel onAction={onAction} />}
      {tab === "support" && <AgentSupportPanel onAction={onAction} />}
      {tab === "profile" && <ProfilePanel onAction={onAction} />}
    </PortalShell>
  );
};
