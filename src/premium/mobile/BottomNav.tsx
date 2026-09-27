import React from "react";
import type { NavTab } from "./types";
import { useTranslation } from "react-i18next";

interface TabItem {
  id: NavTab;
  label: string;
  transKey: string;
  stitchIcon: string;
  imgSrc?: string;
}

const TABS: TabItem[] = [
  { id: "home", label: "Home", transKey: "home", stitchIcon: "home", imgSrc: "/icons/home.png" },
  { id: "trips", label: "My Trips", transKey: "trips", stitchIcon: "luggage", imgSrc: "/icons/my_trips.png" },
  { id: "explore", label: "Explore", transKey: "explore", stitchIcon: "explore", imgSrc: "/icons/holiday.png" },
  { id: "offers", label: "Offers", transKey: "offers", stitchIcon: "local_offer", imgSrc: "/icons/make_an_offer.png" },
  { id: "account", label: "Account", transKey: "account", stitchIcon: "account_circle", imgSrc: "/icons/profile.png" }
];

export interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

/**
 * Google Stitch Aligned Bottom Floating Navigation Bar
 * Features high-contrast active pill states, responsive touch targets,
 * and backdrop-blur frosted finish matching the official Stitch design system.
 */
export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
  const { t } = useTranslation();

  return (
    <nav 
      aria-label="App Navigation"
      className="fixed bottom-0 inset-x-0 z-50 mx-auto flex w-full max-w-[520px] items-center justify-around border-t border-slate-200/90 bg-white/95 px-2 py-1.5 backdrop-blur-md shadow-[0_-4px_20px_rgba(15,23,42,0.06)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
    >
      {TABS.map(({ id, label, transKey, stitchIcon, imgSrc }) => {
        const selected = id === active;
        const translatedLabel = String(t(transKey as any, label as any));

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-label={label}
            aria-current={selected ? "page" : undefined}
            className={`group relative flex flex-col items-center justify-center transition-all duration-150 active:scale-95 outline-none cursor-pointer ${
              selected
                ? "bg-[#c9e6ff] text-[#001e2f] rounded-xl px-3 py-1 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 px-2 py-1"
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span
                className={`material-symbols-outlined text-[22px] transition-transform duration-150 ${
                  selected ? "scale-105" : "text-slate-600 group-hover:text-slate-900"
                }`}
                style={selected ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
              >
                {stitchIcon}
              </span>
            </div>
            <span
              className={`font-['D-DIN','Outfit',sans-serif] text-[11px] tracking-tight leading-tight mt-0.5 ${
                selected ? "font-bold text-[#001e2f]" : "font-medium text-slate-600"
              }`}
            >
              {translatedLabel}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
