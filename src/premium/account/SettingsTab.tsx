import React, { useState } from "react";
import {
  Bell,
  Building2,
  Coins,
  FileText,
  Globe,
  LifeBuoy,
  LogOut,
  MessageSquareHeart,
  Share2,
  Shield,
  ShieldCheck,
  Siren,
  Trash2,
  User,
  Workflow
} from "lucide-react";
import type { AccountItemId } from "./types";
import { ListRow, SectionHeader } from "./ui";

interface ToggleRowProps {
  label: string;
  caption: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  caption,
  value,
  onChange
}) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className="flex w-full items-center gap-3 px-5 py-3 text-left active:bg-slate-50"
  >
    <span className="min-w-0 flex-1">
      <span className="block text-[14px] font-bold tracking-tight text-[var(--premium-ink)]">
        {label}
      </span>
      <span className="block truncate text-[12px] font-medium text-[var(--premium-muted)]">
        {caption}
      </span>
    </span>
    <span
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
        value ? "bg-[var(--premium-pink)]" : "bg-slate-200"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white transition ${value ? "translate-x-5" : ""}`}
      />
    </span>
  </button>
);

export interface SettingsTabProps {
  userName: string;
  userEmail: string;
  language: string;
  currency: string;
  onSelect: (item: AccountItemId) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  userName,
  userEmail,
  language,
  currency,
  onSelect
}) => {
  const [pushAlerts, setPushAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [dealAlerts, setDealAlerts] = useState(true);
  const [sos, setSos] = useState(false);
  const [orchestrator, setOrchestrator] = useState(true);

  return (
    <div className="pb-6">
      <div className="px-5 pt-5">
        <button
          type="button"
          onClick={() => onSelect("settings-profile")}
          className="premium-card flex w-full items-center gap-3 px-4 py-4 text-left"
        >
          <span className="premium-gradient-pink flex h-12 w-12 items-center justify-center rounded-full text-[17px] font-bold text-white">
            {userName.trim().charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-bold tracking-tight text-[var(--premium-ink)]">
              {userName}
            </span>
            <span className="block truncate text-[12px] font-medium text-[var(--premium-muted)]">
              {userEmail}
            </span>
          </span>
          <span className="premium-pill flex h-9 items-center px-4 text-[12px] font-bold">
            Edit
          </span>
        </button>
      </div>

      <SectionHeader title="Profile" />
      <ListRow
        Icon={User}
        label="Profile details"
        caption="Name, photo, travellers and ID documents"
        onClick={() => onSelect("settings-profile")}
      />
      <ListRow
        Icon={Globe}
        label="App language"
        caption="English, हिन्दी, मराठी and 11 more"
        tone="sky"
        value={language}
        onClick={() => onSelect("language")}
      />
      <ListRow
        Icon={Coins}
        label="Currency"
        caption="INR, USD, EUR, GBP, AED, AUD"
        tone="pink"
        value={currency}
        onClick={() => onSelect("currency")}
      />

      <SectionHeader title="Notification preferences" />
      <ToggleRow
        label="Push notifications"
        caption="Booking updates and trip reminders"
        value={pushAlerts}
        onChange={(value) => {
          setPushAlerts(value);
          onSelect("notifications");
        }}
      />
      <ToggleRow
        label="Kharch & budget alerts"
        caption="Ping me when a category crosses its limit"
        value={budgetAlerts}
        onChange={(value) => {
          setBudgetAlerts(value);
          onSelect("notifications");
        }}
      />
      <ToggleRow
        label="Bargain & deal alerts"
        caption="New agent offers on my trip requests"
        value={dealAlerts}
        onChange={(value) => {
          setDealAlerts(value);
          onSelect("notifications");
        }}
      />
      <ListRow
        Icon={Bell}
        label="All notification settings"
        caption="Channels, quiet hours and email digests"
        onClick={() => onSelect("notifications")}
      />

      <SectionHeader title="Privacy & safety" />
      <ToggleRow
        label="Emergency SOS broadcast"
        caption="Share live location with your circle in an emergency"
        value={sos}
        onChange={(value) => {
          setSos(value);
          onSelect("sos");
        }}
      />
      <ToggleRow
        label="TripServices 20-step orchestrator"
        caption="Let the app run trip services automatically"
        value={orchestrator}
        onChange={(value) => {
          setOrchestrator(value);
          onSelect("orchestrator");
        }}
      />
      <ListRow
        Icon={Shield}
        label="Privacy settings"
        caption="Data sharing, permissions and purge data"
        onClick={() => onSelect("privacy")}
      />
      <ListRow
        Icon={ShieldCheck}
        label="Legal vault"
        caption="Encrypted ID and travel documents"
        tone="sky"
        onClick={() => onSelect("legal-vault")}
      />
      <ListRow
        Icon={Siren}
        label="Emergency contacts"
        caption="Who we call when SOS fires"
        tone="pink"
        onClick={() => onSelect("sos")}
      />
      <ListRow
        Icon={Workflow}
        label="Trip orchestrator"
        caption="Review the 20-step service pipeline"
        onClick={() => onSelect("orchestrator")}
      />

      <SectionHeader title="Help center" />
      <ListRow
        Icon={LifeBuoy}
        label="Support"
        caption="Raise a ticket or chat with us"
        onClick={() => onSelect("support")}
      />
      <ListRow
        Icon={MessageSquareHeart}
        label="Feedback"
        caption="Tell us what to improve"
        tone="pink"
        onClick={() => onSelect("feedback")}
      />
      <ListRow
        Icon={Share2}
        label="Share app on WhatsApp"
        caption="Invite friends to RouTripO"
        tone="sky"
        onClick={() => onSelect("share-app")}
      />
      <ListRow
        Icon={FileText}
        label="About & policies"
        caption="Terms, privacy and refund policy"
        onClick={() => onSelect("about")}
      />

      <SectionHeader title="Other portals" />
      <ListRow
        Icon={Building2}
        label="Agent portal"
        caption="Leads, bids, packages and earnings"
        onClick={() => onSelect("agent-portal")}
      />
      <ListRow
        Icon={Shield}
        label="Admin dashboard"
        caption="Operations and analytics"
        onClick={() => onSelect("admin-dashboard")}
      />

      <div className="space-y-3 px-5 pt-6">
        <button
          type="button"
          onClick={() => onSelect("logout")}
          className="premium-pill flex h-12 w-full items-center justify-center gap-2 text-[14px] font-bold"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
        <button
          type="button"
          onClick={() => onSelect("delete-account")}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-[13px] font-bold text-[var(--premium-pink)]"
        >
          <Trash2 className="h-4 w-4" />
          Delete account & data
        </button>
        <p className="pt-1 text-center text-[11px] font-medium text-[var(--premium-muted)]">
          RouTripO · v1.0
        </p>
      </div>
    </div>
  );
};
