import React from "react";
import { Headphones, Ticket, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

export type QuickActionId = "trips" | "wallet" | "ai" | "support";

const ACTIONS: Array<{
  id: QuickActionId;
  label: string;
  transKey: string;
  Icon: typeof Ticket;
  imgSrc?: string;
}> = [
  { id: "trips", label: "My trips", transKey: "trips", Icon: Ticket, imgSrc: "/icons/my_trips.png" },
  { id: "wallet", label: "Wallet", transKey: "wallet", Icon: Wallet, imgSrc: "/icons/routripo_wallet.png" },
  { id: "support", label: "Support", transKey: "help_support", Icon: Headphones, imgSrc: "/icons/secret.png" }
];

export interface QuickActionsProps {
  onSelect?: (action: QuickActionId) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelect }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-3 gap-3 px-4 pt-5">
      {ACTIONS.map(({ id, label, transKey, Icon, imgSrc }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect?.(id)}
          className="group flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3 shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-100/80"
        >
          <div className="relative flex items-center justify-center p-1">
            {imgSrc ? (
              <img src={imgSrc} alt={label} className="h-10 w-10 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-110" />
            ) : (
              <Icon className="h-7 w-7 text-sky-600" />
            )}
          </div>
          <span className="text-[11.5px] font-bold text-slate-700 group-hover:text-sky-600 transition-colors">{String(t(transKey as any, label as any))}</span>
        </button>
      ))}
    </div>
  );
};
