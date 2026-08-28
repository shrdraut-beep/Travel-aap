import React from "react";
import { Compass, Home, Tag, Ticket, User } from "lucide-react";
import type { NavTab } from "./types";

const TABS: Array<{ id: NavTab; label: string; Icon: typeof Home }> = [
  { id: "home", label: "Home", Icon: Home },
  { id: "trips", label: "My trips", Icon: Ticket },
  { id: "explore", label: "Explore", Icon: Compass },
  { id: "offers", label: "Offers", Icon: Tag },
  { id: "account", label: "Account", Icon: User }
];

export interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

/** Fixed bottom tab bar - primary navigation on a phone. */
export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => (
  <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[520px] border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
    <ul className="flex">
      {TABS.map(({ id, label, Icon }) => {
        const selected = id === active;
        return (
          <li key={id} className="flex-1">
            <button
              type="button"
              onClick={() => onChange(id)}
              aria-current={selected ? "page" : undefined}
              className={`flex w-full flex-col items-center gap-1 py-2.5 ${
                selected ? "text-[var(--color-coral)]" : "text-slate-400"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${selected ? "fill-[var(--color-coral)]/10" : ""}`}
              />
              <span className="text-[10.5px] font-semibold">{label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);
