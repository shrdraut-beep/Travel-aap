import React, { useEffect, useRef } from "react";
import { User, Ticket, Gavel, CalendarCheck, Settings as SettingsIcon, Briefcase } from "lucide-react";
import { UserBiddingScreen } from "../../components/routripo/UserBiddingScreen";
import { AllTripsScreen } from "../../components/routripo/AllTripsScreen";
import { UserLandingPage } from "../UserLandingPage";
import { SettingsTab } from "../account/SettingsTab";

export type GlobalTabId = "bargaining" | "trips" | "booking" | "settings";

interface GlobalDashboardViewProps {
  activeTab: GlobalTabId;
  onChangeTab: (tab: GlobalTabId) => void;
  userName: string;
  userEmail: string;
  userLocation?: string;
  language?: string;
  currency?: string;
  onSelect: (item: string) => void;
}

const TABS: { id: GlobalTabId; label: string; Icon?: any; customImg?: string }[] = [
  { id: "bargaining", label: "Bargaining", Icon: Gavel },
  { id: "trips", label: "My Trips", Icon: Briefcase },
  { id: "booking", label: "Booking", Icon: CalendarCheck },
  { id: "settings", label: "Profile", Icon: User },
];

export const GlobalDashboardView: React.FC<GlobalDashboardViewProps> = ({
  activeTab,
  onChangeTab,
  userName,
  userEmail,
  userLocation = "Pune, India",
  language = "English",
  currency = "INR",
  onSelect
}) => {
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[520px] flex-col bg-[var(--premium-page)]">
      {/* Premium Header */}
      <header className="premium-sky-panel shrink-0 px-5 pb-5 pt-4">
        <button
          type="button"
          onClick={() => onChangeTab("settings")}
          className="flex w-full items-center gap-4 text-left"
        >
          <span className="premium-gradient-pink flex h-14 w-14 items-center justify-center rounded-full border-2 border-white text-[20px] font-bold text-white shadow-lg">
            {userName.trim().charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[22px] font-extrabold leading-tight tracking-tight text-white">
              Hi, {userName.split(" ")[0]}
            </span>
            <span className="block truncate text-[13px] font-medium text-white/85 mt-0.5">
              {userLocation}
            </span>
          </span>
        </button>
      </header>

      {/* Pill-shaped Tabs Navigation */}
      <nav className="-mt-6 shrink-0 px-5 relative z-10">
        <div className="premium-card flex gap-1 p-1.5 shadow-[0_8px_20px_-8px_rgba(40,32,79,0.15)]">
          {TABS.map(({ id, label, Icon, customImg }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChangeTab(id)}
              className={`flex flex-1 flex-col items-center justify-center gap-1.5 rounded-[20px] py-2.5 transition-all ${
                activeTab === id
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-[var(--premium-muted)] hover:bg-slate-50"
              }`}
            >
              {customImg ? (
                <img src={customImg} alt={label} className={`h-[24px] w-[24px] object-contain ${activeTab === id ? 'brightness-0 invert' : ''}`} />
              ) : (
                Icon && <Icon className="h-[22px] w-[22px]" />
              )}
              <span className="text-[11px] font-bold leading-none tracking-tight">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Scrollable Content Area */}
      <div
        ref={bodyRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-safe"
      >
        {activeTab === "bargaining" && (
          <UserBiddingScreen
            onBack={() => {}}
            onLogout={() => {}}
            onSOS={() => {}}
            onOpenSettings={() => {}}
            onOpenMyTickets={() => onChangeTab("booking")}
            lang="en"
            hideHeader={true}
          />
        )}
        {activeTab === "trips" && (
          <AllTripsScreen
            setActive={(tab) => {}}
            onBack={() => {}}
            onLogout={() => {}}
            onSOS={() => {}}
            hideHeader={true}
          />
        )}
        {activeTab === "booking" && (
          <UserLandingPage
            onNavigate={(route) => {}}
            onOpenAccount={() => {}}
            hideHeader={true}
          />
        )}
        {activeTab === "settings" && (
          <div className="p-5">
            <SettingsTab
              userName={userName}
              userEmail={userEmail}
              language={language}
              currency={currency}
              onSelect={onSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
};
