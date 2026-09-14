import React from "react";
import { Compass, Home, Tag, Ticket, User } from "lucide-react";
import type { NavTab } from "./types";
import { useTranslation } from "react-i18next";

const TABS: Array<{ id: NavTab; label: string; transKey: string; Icon: typeof Home; imgSrc?: string }> = [
  { id: "home", label: "Home", transKey: "home", Icon: Home, imgSrc: "/icons/home.png" },
  { id: "trips", label: "My trips", transKey: "trips", Icon: Ticket, imgSrc: "/icons/my_trips.png" },
  { id: "explore", label: "Explore", transKey: "explore", Icon: Compass, imgSrc: "/icons/holiday.png" },
  { id: "offers", label: "Offers", transKey: "offers", Icon: Tag, imgSrc: "/icons/make_an_offer.png" },
  { id: "account", label: "Account", transKey: "account", Icon: User, imgSrc: "/icons/profile.png" }
];

export interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
  const { t } = useTranslation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[520px] border-t border-[#e8e2d5]/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md shadow-[0_-4px_24px_rgba(2,132,199,0.08)]">
      <ul className="flex items-center justify-around px-1 py-1.5">
        {TABS.map(({ id, label, transKey, Icon, imgSrc }) => {
          const selected = id === active;
          const translatedLabel = String(t(transKey as any, label as any));
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={selected ? "page" : undefined}
                className="group relative flex w-full flex-col items-center justify-center gap-1 py-1 transition-all duration-150 active:scale-95 border-none outline-none bg-transparent cursor-pointer"
              >
                <div className="relative flex h-10 w-10 items-center justify-center">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={label}
                      className={`h-9 w-9 object-contain transition-all duration-200 ${
                        selected
                          ? "scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]"
                          : "opacity-75 hover:opacity-100 grayscale-[10%] group-hover:scale-105 drop-shadow-sm"
                      }`}
                    />
                  ) : (
                    <Icon
                      className={`h-6 w-6 transition-transform ${
                        selected
                          ? "scale-110 text-sky-600 stroke-[2.4]"
                          : "text-slate-400 stroke-[1.8] group-hover:text-slate-600"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-[11px] tracking-tight leading-none transition-colors ${
                    selected
                      ? "text-sky-600 font-black"
                      : "text-slate-500 font-semibold hover:text-slate-700"
                  }`}
                >
                  {translatedLabel}
                </span>
                {selected && (
                  <span className="h-1 w-2 rounded-full bg-sky-600 mt-0.5 shadow-sm" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
