import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Wallet, Calendar, Users, FileText, Plus } from "lucide-react";
import { KharchScreen } from "../../components/routripo/KharchScreen";
import { SmartDayPlanner } from "../../components/planning/SmartDayPlanner";
import { SocialScreen } from "../../components/routripo/TripsScreen";
import { MyTicketsView } from "../../components/views/MyTicketsView";
import type { Trip } from "../../types";

export type TripTabId = "kharch" | "plan" | "social" | "docs";

interface TripDashboardViewProps {
  trip: Trip;
  activeTab: TripTabId;
  onChangeTab: (tab: TripTabId) => void;
  onBackToMain: () => void;
  lang?: "en" | "mr";
}

const TABS: { id: TripTabId; label: string; Icon: any }[] = [
  { id: "kharch", label: "Kharch", Icon: Wallet },
  { id: "plan", label: "Plan", Icon: Calendar },
  { id: "social", label: "Social", Icon: Users },
  { id: "docs", label: "Docs", Icon: FileText },
];

export const TripDashboardView: React.FC<TripDashboardViewProps> = ({
  trip,
  activeTab,
  onChangeTab,
  onBackToMain,
  lang = "en",
}) => {
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[520px] flex-col bg-[var(--premium-page)]">
      {/* Premium Header */}
      <header className="premium-sky-panel shrink-0 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3 text-white">
          <button
            type="button"
            onClick={onBackToMain}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors shadow-sm active:scale-95 text-white text-xs font-bold shrink-0 border border-white/25"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Trips</span>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[20px] font-extrabold leading-tight tracking-tight text-white">
              {trip.title}
            </h1>
            <p className="truncate text-[12px] font-medium text-white/85 mt-0.5">
              {trip.destination} • {(trip as any).duration || (trip as any).days || 1} Days
            </p>
          </div>
        </div>
      </header>

      {/* Pill-shaped Tabs Navigation */}
      <nav className="-mt-6 shrink-0 px-5 relative z-10">
        <div className="premium-card flex gap-1 p-1.5 shadow-[0_8px_20px_-8px_rgba(40,32,79,0.15)]">
          {TABS.map(({ id, label, Icon }) => (
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
              <Icon className="h-[22px] w-[22px]" />
              <span className="text-[11px] font-bold leading-none tracking-tight">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Scrollable Content Area */}
      <div
        ref={bodyRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-safe relative"
      >
        {/* Floating + Button */}
        {activeTab === "kharch" && (
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("trigger-add-expense"));
            }}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg active:scale-95 transition-transform hover:bg-slate-800"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}

        <div className="pt-4 pb-20">
          {activeTab === "kharch" && (
            <KharchScreen
              onBack={onBackToMain}
              onLogout={onBackToMain}
              hideHeader={true}
            />
          )}
          {activeTab === "plan" && (
            <SmartDayPlanner
              tripId={trip.id}
              onCancel={onBackToMain}
              hideHeader={true}
            />
          )}
          {activeTab === "social" && (
            <SocialScreen
              onBack={onBackToMain}
              onLogout={onBackToMain}
              hideHeader={true}
            />
          )}
          {activeTab === "docs" && (
            <MyTicketsView
              onBack={onBackToMain}
            />
          )}
        </div>
      </div>
    </div>
  );
};
