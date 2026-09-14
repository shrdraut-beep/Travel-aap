import React, { useState } from "react";
import {
  Bell,
  Briefcase,
  Building2,
  Coins,
  CreditCard,
  Download,
  FileText,
  Fingerprint,
  Gavel,
  Globe,
  LifeBuoy,
  LogOut,
  MessageSquareHeart,
  Palette,
  Share2,
  Shield,
  ShieldCheck,
  Siren,
  Sun,
  Ticket,
  Trash2,
  User,
  Workflow
} from "lucide-react";
import type { AccountItemId } from "./types";
import { ListRow, PillButton, SectionHeader } from "./ui";
import { useTripContext } from "../../context/TripContext";

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
    className="flex w-full items-center gap-3 px-5 py-3 text-left active:bg-transparent"
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
        value ? "bg-sky-500" : "bg-slate-200"
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
  userRole?: string;
  onSelect: (item: AccountItemId) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  userName,
  userEmail,
  language,
  currency,
  userRole = "customer",
  onSelect
}) => {
  const [pushAlerts, setPushAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [dealAlerts, setDealAlerts] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [themeMode, setThemeMode] = useState<"vibrant" | "light" | "system">("vibrant");
  const [sos, setSos] = useState(false);
  const [orchestrator, setOrchestrator] = useState(true);

  const tripContext = useTripContext?.();
  const upcomingCount = tripContext?.trips?.length || 0;

  const bookingsCount = (() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("routripo_user_bookings") : null;
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  })();

  const bargainsCount = (() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("routripo_user_bids") : null;
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  })();

  return (
    <div className="pb-6">
      {/* User Mini Dashboard Stats */}
      <div className="px-5 pt-1 pb-4">
        <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-[16px] font-black text-white">{userName}</h2>
              <p className="text-[12px] text-slate-400 font-medium">{userEmail}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-bold border border-sky-500/30">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3">
            <div className="text-center p-2 rounded-2xl bg-white/5 border border-white/5">
              <Briefcase className="w-4 h-4 mx-auto text-sky-400 mb-1" />
              <div className="text-[15px] font-black text-white">{upcomingCount}</div>
              <div className="text-[10px] font-bold text-slate-400">Upcoming</div>
            </div>
            <div className="text-center p-2 rounded-2xl bg-white/5 border border-white/5">
              <Ticket className="w-4 h-4 mx-auto text-pink-400 mb-1" />
              <div className="text-[15px] font-black text-white">{bookingsCount}</div>
              <div className="text-[10px] font-bold text-slate-400">Bookings</div>
            </div>
            <div className="text-center p-2 rounded-2xl bg-white/5 border border-white/5">
              <Gavel className="w-4 h-4 mx-auto text-amber-400 mb-1" />
              <div className="text-[15px] font-black text-white">{bargainsCount}</div>
              <div className="text-[10px] font-bold text-slate-400">Bargains</div>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader title="App appearance & theme" />
      <div className="px-5 pb-2">
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
            Palette selection
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "light", label: "Clean Light", icon: Sun },
              { id: "system", label: "System Sync", icon: Palette }
            ].map((t) => {
              const Icon = t.icon;
              const isActive = themeMode === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeMode(t.id as any)}
                  className={`p-2.5 rounded-2xl text-center transition-all active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white font-extrabold shadow-[0_4px_12px_rgba(2,132,199,0.3)] border-t border-white/25"
                      : "bg-white text-slate-700 font-bold border border-slate-200 shadow-xs hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <span className="block text-[11px] leading-tight">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <ToggleRow
        label="High contrast UI"
        caption="Sharper borders and deep black text for sunlight visibility"
        value={highContrast}
        onChange={setHighContrast}
      />

      <SectionHeader title="Profile & payments" />
      <ListRow
        imgSrc="/icons/profile.png"
        label="Profile details"
        caption="Name, photo, travellers and ID documents"
        onClick={() => onSelect("settings-profile")}
      />
      <ListRow
        imgSrc="/icons/routripo_wallet.png"
        label="Payment methods & UPI"
        caption="Saved cards, UPI handles and refunds"
        tone="sky"
        onClick={() => onSelect("wallet")}
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

      <SectionHeader title="Security" />
      <ToggleRow
        label="Biometric app lock"
        caption="Require Face ID / Fingerprint on launch"
        value={biometricLock}
        onChange={setBiometricLock}
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
        label="Expenses & budget alerts"
        caption="Ping me when a category crosses its limit"
        value={budgetAlerts}
        onChange={(value) => {
          setBudgetAlerts(value);
          onSelect("notifications");
        }}
      />
      <ToggleRow
        label="Bargain & deal alerts"
        caption="New agent quotes on my offers"
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
        imgSrc="/icons/secret.png"
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
        onClick={() => onSelect("emergency-contacts")}
      />
      <ListRow
        Icon={Workflow}
        label="Trip orchestrator"
        caption="Review the 20-step service pipeline"
        onClick={() => onSelect("orchestrator-pipeline")}
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
        caption="Invite friends to RoutTripo"
        tone="sky"
        onClick={() => onSelect("share-app")}
      />
      <ListRow
        Icon={FileText}
        label="About & policies"
        caption="Terms, privacy and refund policy"
        onClick={() => onSelect("about")}
      />
      <ListRow
        Icon={Download}
        label="Download Source Code (.ZIP)"
        caption="Complete project code archive (15.4 MB)"
        tone="sky"
        onClick={() => onSelect("download-source-zip")}
      />

      {userRole === 'admin' || userRole === 'agent' ? (
        <>
          <SectionHeader title="Other portals" />
          <ListRow
            imgSrc="/icons/cab_hotel_package_v2.png"
            label="Agent portal"
            caption="Leads, bids, packages and earnings"
            onClick={() => onSelect("agent-portal")}
          />
          <ListRow
            imgSrc="/icons/setting.png"
            label="Admin dashboard"
            caption="Operations and analytics"
            onClick={() => onSelect("admin-dashboard")}
          />
        </>
      ) : null}

      <div className="space-y-3 px-5 pt-6">
        <PillButton
          label="Log out"
          variant="outline"
          Icon={LogOut}
          fullWidth
          size="lg"
          onClick={() => onSelect("logout")}
        />
        <PillButton
          label="Delete account & data"
          variant="danger"
          Icon={Trash2}
          fullWidth
          size="lg"
          onClick={() => onSelect("delete-account")}
        />
        <p className="pt-1 text-center text-[11px] font-medium text-[var(--premium-muted)]">
          RoutTripo · v1.0
        </p>
      </div>
    </div>
  );
};
