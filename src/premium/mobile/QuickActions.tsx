import React from "react";
import { Headphones, Sparkles, Ticket, Wallet } from "lucide-react";

export type QuickActionId = "trips" | "wallet" | "ai" | "support";

const ACTIONS: Array<{
  id: QuickActionId;
  label: string;
  Icon: typeof Ticket;
}> = [
  { id: "trips", label: "My trips", Icon: Ticket },
  { id: "wallet", label: "Wallet", Icon: Wallet },
  { id: "ai", label: "AI planner", Icon: Sparkles },
  { id: "support", label: "Support", Icon: Headphones }
];

export interface QuickActionsProps {
  onSelect?: (action: QuickActionId) => void;
}

/** Four-up shortcut grid under the search card. */
export const QuickActions: React.FC<QuickActionsProps> = ({ onSelect }) => (
  <div className="grid grid-cols-4 gap-2 px-4 pt-5">
    {ACTIONS.map(({ id, label, Icon }) => (
      <button
        key={id}
        type="button"
        onClick={() => onSelect?.(id)}
        className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.8)] active:bg-slate-50"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--premium-accent-soft)] text-[var(--premium-accent)]">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="text-[11px] font-semibold text-slate-600">{label}</span>
      </button>
    ))}
  </div>
);
