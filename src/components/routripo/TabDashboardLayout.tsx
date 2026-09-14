import React, { useState } from "react";
import { LucideIcon, Compass } from "lucide-react";

export interface DashboardCard {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
  gradient: string;
  subtitleColorClass?: string;
  onClick: () => void;
}

export interface DashboardGridItem {
  label: string;
  icon?: LucideIcon;
  imgSrc?: string;
  color: string;
  onClick: () => void;
  isActive?: boolean;
}

export interface TabDashboardLayoutProps {
  cards?: DashboardCard[];
  gridTitle?: string;
  gridIcon?: LucideIcon;
  gridItems?: DashboardGridItem[];
  children?: React.ReactNode;
}

export function TabDashboardLayout({
  cards = [],
  gridTitle = "Explore Services",
  gridIcon = Compass,
  gridItems = [],
  children
}: TabDashboardLayoutProps) {
  return (
    <div className="flex flex-col">
      {/* Top Navigation Tabs (Scrollable Pill Container like AccountScreen) */}
      {gridItems && gridItems.length > 0 && (
        <nav className="px-5 shrink-0 -mt-2 mb-4">
          <div className="flex gap-2 p-1.5 overflow-x-auto no-scrollbar">
            {gridItems.map((item, i) => {
              const ItemIcon = item.icon;
              const active = item.isActive;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={item.onClick}
                  className={`flex flex-col items-center gap-1.5 py-2 px-4 min-w-[72px] text-[11px] font-bold transition shrink-0 active:scale-95 cursor-pointer ${
                    active
                      ? "text-sky-700 font-black scale-105"
                      : "text-slate-500 hover:text-slate-800 opacity-80 hover:opacity-100"
                  }`}
                >
                  {item.imgSrc ? (
                    <img src={item.imgSrc} alt={item.label} className="h-9 w-9 object-contain drop-shadow-md" />
                  ) : (
                    ItemIcon && <ItemIcon className="h-5 w-5" />
                  )}
                  <span>{item.label}</span>
                  {active && <span className="h-1 w-5 rounded-full bg-sky-500" />}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Main Action Cards (Like Stat Cards / Action Buttons in AccountScreen) */}
      {cards && cards.length > 0 && (
        <div className="flex gap-3 px-5 mb-4">
          {cards.map((card, idx) => {
            const CardIcon = card.icon;
            // First card as a StatCard style, second as a Pink Button style, etc.
            if (idx === 0) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={card.onClick}
                  className="premium-card flex-1 px-4 py-3 text-left active:scale-95 transition-all"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)] flex items-center gap-1.5">
                    <CardIcon className="w-3.5 h-3.5" />
                    {card.title}
                  </p>
                  <p className="pt-1 text-[13px] font-bold leading-tight text-[var(--premium-violet)]">
                    {card.subtitle}
                  </p>
                </button>
              );
            }
            return (
              <button
                key={idx}
                type="button"
                onClick={card.onClick}
                className="premium-card flex-1 px-4 py-3 rounded-[20px] text-left active:scale-95 transition-all"
              >
                <p className="text-[11px] font-black uppercase tracking-wider text-[var(--premium-muted)] flex items-center gap-1.5">
                  <CardIcon className="w-3.5 h-3.5" />
                  {card.title}
                </p>
                <p className="pt-1 text-[13px] font-bold leading-tight text-slate-800">
                  {card.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Rest of the tab content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

