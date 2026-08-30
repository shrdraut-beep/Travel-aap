import React, { useState } from "react";
import {
  Activity,
  BadgeCheck,
  Ban,
  Building2,
  Database,
  DollarSign,
  FileLock2,
  Gift,
  KeyRound,
  LifeBuoy,
  MessageSquare,
  Radar,
  RefreshCw,
  ScrollText,
  ShieldAlert,
  Ticket,
  UserCog,
  Users
} from "lucide-react";
import { ListRow, PillButton, SectionHeader, StatCard } from "../account/ui";
import type { AdminActionId } from "./types";

interface PanelProps {
  onAction: (action: AdminActionId) => void;
}

const REVENUE_TREND = [
  { month: "Mar", amount: 412000 },
  { month: "Apr", amount: 528000 },
  { month: "May", amount: 476000 },
  { month: "Jun", amount: 691000 },
  { month: "Jul", amount: 744000 },
  { month: "Aug", amount: 862000 }
];

const PENDING_VENDORS = [
  { id: "v-1", name: "Konkan Coast Stays", gst: "27AAECK1234M1Z8", city: "Ratnagiri" },
  { id: "v-2", name: "Sahyadri Cab Union", gst: "27AABCS9911L1ZP", city: "Pune" },
  { id: "v-3", name: "Blue Lagoon Resorts", gst: "29AAGCB4420Q1ZR", city: "Gokarna" }
];

const SERVICES = [
  { name: "Razorpay orders", method: "POST", latency: 182, ok: true },
  { name: "Duffel flight search", method: "POST", latency: 604, ok: true },
  { name: "Gemini trip planner", method: "POST", latency: 1320, ok: true },
  { name: "Firebase auth", method: "GET", latency: 96, ok: true },
  { name: "Stripe payouts", method: "POST", latency: 0, ok: false }
];

const DIRECTORY = [
  { id: "u-1", name: "Cara Sharma", email: "c•••@routripo.app", role: "Traveller", status: "Active" },
  { id: "u-2", name: "Nilesh Patil", email: "n•••@gmail.com", role: "Agent", status: "Active" },
  { id: "u-3", name: "Rhea Menon", email: "r•••@outlook.com", role: "Traveller", status: "Suspended" }
];

const KeyValue: React.FC<{ label: string; value: string; tone?: "ink" | "pink" }> = ({
  label,
  value,
  tone = "ink"
}) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-[12px] font-medium text-[var(--premium-muted)]">
      {label}
    </span>
    <span
      className={`text-[13px] font-bold ${
        tone === "pink"
          ? "text-[var(--premium-pink)]"
          : "text-[var(--premium-ink)]"
      }`}
    >
      {value}
    </span>
  </div>
);

export const AnalyticsPanel: React.FC<PanelProps> = ({ onAction }) => {
  const peak = Math.max(...REVENUE_TREND.map((entry) => entry.amount));

  return (
    <div className="pb-16">
      <SectionHeader
        title="Platform stats"
        action="Refresh"
        onAction={() => onAction("analytics-refresh")}
      />
      <div className="flex gap-3 px-5">
        <StatCard label="Gross revenue" value="₹8.62L" hint="This month" tone="violet" />
        <StatCard label="Commission" value="₹94,300" hint="Platform fee" tone="pink" />
      </div>
      <div className="flex gap-3 px-5 pt-3">
        <StatCard label="Users" value="12,480" hint="Registered" tone="sky" />
        <StatCard label="Packages" value="318" hint="Active" tone="violet" />
      </div>

      <SectionHeader title="Revenue trend" />
      <div className="mx-5 premium-card px-4 py-4">
        <div className="flex h-32 items-end gap-2">
          {REVENUE_TREND.map((entry) => (
            <div
              key={entry.month}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-[10px] font-bold text-[var(--premium-muted)]">
                {Math.round(entry.amount / 1000)}k
              </span>
              <span
                className="block w-full rounded-t-xl bg-[var(--premium-sky)]"
                style={{ height: `${Math.round((entry.amount / peak) * 92)}px` }}
              />
              <span className="text-[11px] font-medium text-[var(--premium-muted)]">
                {entry.month}
              </span>
            </div>
          ))}
        </div>
        <div className="pt-3">
          <PillButton
            label="Open full report"
            onClick={() => onAction("analytics-revenue-trend")}
          />
        </div>
      </div>

      <SectionHeader title="Drill down" />
      <div className="mx-5 premium-card divide-y divide-slate-100 py-1">
        <ListRow
          Icon={Users}
          label="Total registered users"
          caption="Signups, retention and churn"
          value="12,480"
          tone="sky"
          onClick={() => onAction("analytics-users")}
        />
        <ListRow
          Icon={DollarSign}
          label="Total commission earned"
          caption="Lifetime platform earnings"
          value="₹41.2L"
          onClick={() => onAction("analytics-commission")}
        />
        <ListRow
          Icon={Gift}
          label="Active packages"
          caption="Published across all agencies"
          value="318"
          tone="pink"
          onClick={() => onAction("analytics-packages")}
        />
        <ListRow
          Icon={MessageSquare}
          label="Open support tickets"
          caption="Awaiting first response"
          value="27"
          onClick={() => onAction("analytics-tickets")}
        />
      </div>
    </div>
  );
};

export const SecurityPanel: React.FC<PanelProps> = ({ onAction }) => (
  <div className="pb-16">
    <SectionHeader title="PentAGI & Codex" />
    <div className="mx-5 premium-card px-4 py-4">
      <p className="text-[13px] font-bold text-[var(--premium-ink)]">
        Last scan: 6 hours ago
      </p>
      <p className="pt-1 text-[12px] font-medium text-[var(--premium-muted)]">
        Firestore rules, payment endpoints and auth surface.
      </p>
      <div className="pt-3">
        <KeyValue label="Critical" value="0" />
        <KeyValue label="High" value="1" tone="pink" />
        <KeyValue label="Medium" value="3" />
        <KeyValue label="Informational" value="6" />
      </div>
      <div className="flex gap-2 pt-3">
        <PillButton
          label="Run scan"
          variant="solid"
          onClick={() => onAction("security-run-scan")}
        />
        <PillButton
          label="View findings"
          onClick={() => onAction("security-findings")}
        />
      </div>
    </div>

    <SectionHeader title="Posture" />
    <div className="mx-5 premium-card divide-y divide-slate-100 py-1">
      <ListRow
        Icon={ShieldAlert}
        label="Open findings"
        caption="Triage and assign owners"
        value="4"
        tone="pink"
        onClick={() => onAction("security-findings")}
      />
      <ListRow
        Icon={ScrollText}
        label="Admin audit log"
        caption="Every privileged action, signed"
        onClick={() => onAction("security-audit-log")}
      />
    </div>
  </div>
);

export const VendorsPanel: React.FC<PanelProps> = ({ onAction }) => (
  <div className="pb-16">
    <SectionHeader title="Vendor approvals" />
    <div className="space-y-3 px-5">
      {PENDING_VENDORS.map((vendor) => (
        <div key={vendor.id} className="premium-card px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)]">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold text-[var(--premium-ink)]">
                {vendor.name}
              </p>
              <p className="truncate text-[12px] font-medium text-[var(--premium-muted)]">
                {vendor.city} · GST {vendor.gst}
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-3">
            <PillButton
              label="Approve partner"
              variant="solid"
              onClick={() => onAction("vendor-approve")}
            />
            <PillButton label="Reject" variant="pink" onClick={() => onAction("vendor-reject")} />
            <PillButton label="Details" onClick={() => onAction("vendor-details")} />
          </div>
        </div>
      ))}
    </div>

    <SectionHeader title="Partners" />
    <div className="mx-5 premium-card divide-y divide-slate-100 py-1">
      <ListRow
        Icon={BadgeCheck}
        label="Approved partners"
        caption="Live agencies and suppliers"
        value="86"
        onClick={() => onAction("vendor-approved-list")}
      />
      <ListRow
        Icon={Ban}
        label="Rejected applications"
        caption="With reason codes"
        tone="pink"
        value="12"
        onClick={() => onAction("vendor-reject")}
      />
    </div>
  </div>
);

export const PayoutsPanel: React.FC<PanelProps> = ({ onAction }) => (
  <div className="pb-16">
    <SectionHeader title="Current cycle" />
    <div className="mx-5 premium-card px-4 py-4">
      <p className="text-[26px] font-bold leading-none text-[var(--premium-violet)]">
        ₹3,42,900
      </p>
      <p className="pt-1 text-[12px] font-medium text-[var(--premium-muted)]">
        Awaiting release · 16–31 Aug
      </p>
      <div className="pt-3">
        <KeyValue label="Pending payouts" value="14 agencies" />
        <KeyValue label="Platform service fee" value="₹28,410" tone="pink" />
        <KeyValue label="Lifetime platform earnings" value="₹41.2L" />
      </div>
      <div className="flex gap-2 pt-3">
        <PillButton
          label="Payment release"
          variant="solid"
          onClick={() => onAction("payout-release")}
        />
        <PillButton label="Cycle settings" onClick={() => onAction("payout-cycle")} />
      </div>
    </div>

    <SectionHeader title="Queue" />
    <div className="mx-5 premium-card divide-y divide-slate-100 py-1">
      <ListRow
        Icon={DollarSign}
        label="Pending payout requests"
        caption="Verify bank details before release"
        value="14"
        onClick={() => onAction("payout-pending")}
      />
      <ListRow
        Icon={RefreshCw}
        label="Commission rules"
        caption="Platform service fee per category"
        tone="pink"
        onClick={() => onAction("payout-service-fee")}
      />
      <ListRow
        Icon={Activity}
        label="Lifetime earnings"
        caption="All-time platform revenue"
        value="₹41.2L"
        tone="sky"
        onClick={() => onAction("payout-lifetime")}
      />
    </div>
  </div>
);

export const AdsPanel: React.FC<PanelProps> = ({ onAction }) => {
  const [published, setPublished] = useState(true);

  return (
    <div className="pb-16">
      <SectionHeader
        title="Active ads & offers"
        action="New"
        onAction={() => onAction("ads-create")}
      />
      <div className="mx-5 premium-card px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-[var(--premium-ink)]">
              MONSOON30 · Home banner
            </p>
            <p className="text-[12px] font-medium text-[var(--premium-muted)]">
              30% off Konkan stays · ends 15 Sep
            </p>
          </div>
          <button
            type="button"
            aria-pressed={published}
            onClick={() => {
              setPublished((value) => !value);
              onAction("ads-toggle-published");
            }}
            className={`h-7 w-12 shrink-0 rounded-full transition ${
              published ? "bg-[var(--premium-pink)]" : "bg-slate-200"
            }`}
          >
            <span
              className={`block h-6 w-6 rounded-full bg-white transition ${
                published ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <p className="pt-2 text-[12px] font-bold text-[var(--premium-violet)]">
          {published ? "Published" : "Paused"}
        </p>
      </div>

      <div className="mx-5 mt-3 premium-card divide-y divide-slate-100 py-1">
        <ListRow
          Icon={Gift}
          label="Banner ad rules"
          caption="Placement, priority and frequency caps"
          onClick={() => onAction("ads-banner-rules")}
        />
        <ListRow
          Icon={Ticket}
          label="Create offer"
          caption="Coupon, voucher or partner promo"
          tone="pink"
          onClick={() => onAction("ads-create")}
        />
      </div>
    </div>
  );
};

export const ApisPanel: React.FC<PanelProps> = ({ onAction }) => (
  <div className="pb-16">
    <SectionHeader
      title="API & system health"
      action="Ping all"
      onAction={() => onAction("api-ping-all")}
    />
    <div className="space-y-3 px-5">
      {SERVICES.map((service) => (
        <div key={service.name} className="premium-card px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold text-[var(--premium-ink)]">
                {service.name}
              </p>
              <p className="text-[12px] font-medium text-[var(--premium-muted)]">
                {service.method} · {service.ok ? `${service.latency} ms` : "no response"}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                service.ok
                  ? "bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)]"
                  : "bg-[var(--premium-pink-soft)] text-[var(--premium-pink)]"
              }`}
            >
              {service.ok ? "Healthy" : "Down"}
            </span>
          </div>
          <div className="pt-3">
            <PillButton
              label="Execute live ping test"
              onClick={() => onAction("api-ping-one")}
            />
          </div>
        </div>
      ))}
    </div>

    <SectionHeader title="Infrastructure" />
    <div className="mx-5 premium-card divide-y divide-slate-100 py-1">
      <ListRow
        Icon={Database}
        label="Database"
        caption="Firestore reads, writes and quota"
        value="Healthy"
        tone="sky"
        onClick={() => onAction("api-database")}
      />
      <ListRow
        Icon={RefreshCw}
        label="Last sync"
        caption="Partner inventory refresh"
        value="8 min ago"
        onClick={() => onAction("api-last-sync")}
      />
    </div>
  </div>
);

export const SupportPanel: React.FC<PanelProps> = ({ onAction }) => {
  const [writId, setWritId] = useState("");
  const [targetUid, setTargetUid] = useState("");

  return (
    <div className="pb-16">
      <SectionHeader title="Open support tickets" />
      <div className="mx-5 premium-card divide-y divide-slate-100 py-1">
        <ListRow
          Icon={LifeBuoy}
          label="Refund not received"
          caption="Ticket #4821 · raised 2 h ago"
          tone="pink"
          onClick={() => onAction("support-ticket")}
        />
        <ListRow
          Icon={LifeBuoy}
          label="Agent KYC stuck"
          caption="Ticket #4818 · raised 6 h ago"
          onClick={() => onAction("support-ticket")}
        />
      </div>

      <SectionHeader title="Zero-trust vault" />
      <div className="mx-5 premium-card px-4 py-4">
        <p className="text-[12px] font-medium text-[var(--premium-muted)]">
          PII stays encrypted. Unlocking requires a legal writ and the master
          token, and every unlock is written to the audit log.
        </p>
        <label className="block pt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
          Legal writ / court warrant ID
        </label>
        <input
          value={writId}
          onChange={(event) => setWritId(event.target.value)}
          placeholder="WRIT-2026-000123"
          className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-[var(--premium-violet)]"
        />
        <label className="block pt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
          Target user ID (UID)
        </label>
        <input
          value={targetUid}
          onChange={(event) => setTargetUid(event.target.value)}
          placeholder="uid_9f21..."
          className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-[var(--premium-violet)]"
        />
        <div className="flex gap-2 pt-3">
          <PillButton
            label="Unlock record"
            variant="solid"
            onClick={() => onAction("support-vault-unlock")}
          />
          <PillButton
            label="Master token"
            onClick={() => onAction("support-master-token")}
          />
        </div>
      </div>

      <div className="mx-5 mt-3 premium-card divide-y divide-slate-100 py-1">
        <ListRow
          Icon={KeyRound}
          label="Admin master secret token"
          caption="Rotate every 30 days"
          tone="pink"
          onClick={() => onAction("support-master-token")}
        />
        <ListRow
          Icon={FileLock2}
          label="Masked email (PII)"
          caption="Decrypt only with an unlocked record"
          onClick={() => onAction("support-vault-unlock")}
        />
      </div>
    </div>
  );
};

export const UsersPanel: React.FC<PanelProps> = ({ onAction }) => (
  <div className="pb-16">
    <SectionHeader
      title="User directory"
      action="Reset filters"
      onAction={() => onAction("users-reset-filters")}
    />
    <div className="space-y-3 px-5">
      {DIRECTORY.map((user) => (
        <button
          key={user.id}
          type="button"
          onClick={() => onAction("users-open-profile")}
          className="premium-card flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]">
            <UserCog className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-bold text-[var(--premium-ink)]">
              {user.name}
            </span>
            <span className="block truncate text-[12px] font-medium text-[var(--premium-muted)]">
              {user.email} · {user.role}
            </span>
          </span>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
              user.status === "Active"
                ? "bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)]"
                : "bg-[var(--premium-pink-soft)] text-[var(--premium-pink)]"
            }`}
          >
            {user.status}
          </span>
        </button>
      ))}
    </div>

    <div className="mx-5 mt-3 premium-card divide-y divide-slate-100 py-1">
      <ListRow
        Icon={Radar}
        label="Full directory"
        caption="Search by name, role or status"
        value="12,480"
        tone="sky"
        onClick={() => onAction("users-directory")}
      />
    </div>
  </div>
);
