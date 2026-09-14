import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck,
  Gavel,
  Settings as SettingsIcon,
  Wallet
} from "lucide-react";
import { BargainingTab } from "./BargainingTab";
import { BookingTab } from "./BookingTab";
import { ExpensesTab } from "./ExpensesTab";
import { SettingsTab } from "./SettingsTab";
import type { AccountItemId, AccountTabId } from "./types";

const TABS: { id: AccountTabId; label: string; Icon: typeof Gavel; imgSrc?: string }[] = [
  { id: "bargaining", label: "Bargaining", Icon: Gavel, imgSrc: "/icons/bargaining.png" },
  { id: "expenses", label: "Expenses", Icon: Wallet, imgSrc: "/icons/routripo_wallet.png" },
  { id: "booking", label: "Booking", Icon: CalendarCheck, imgSrc: "/icons/booking.png" },
  { id: "settings", label: "Setting", Icon: SettingsIcon, imgSrc: "/icons/setting.png" }
];

export interface AccountScreenProps {
  open: boolean;
  userName?: string;
  userEmail?: string;
  userLocation?: string;
  language?: string;
  currency?: string;
  userRole?: string;
  initialTab?: AccountTabId;
  onSelect: (item: AccountItemId) => void;
  onClose: () => void;
}

/**
 * User account dashboard. Every account function lives under one of four tabs -
 * bargaining and expenses first, booking after them, settings last.
 */
export const AccountScreen: React.FC<AccountScreenProps> = ({
  open,
  userName = "Traveller",
  userEmail = "",
  userLocation = "India",
  language = "English",
  currency = "INR",
  userRole = "customer",
  initialTab = "bargaining",
  onSelect,
  onClose
}) => {
  const [tab, setTab] = useState<AccountTabId>(initialTab);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="premium-root fixed inset-0 z-[70] bg-slate-900/40"
        >
          <motion.section
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="mx-auto flex h-full w-full max-w-[520px] flex-col bg-[var(--premium-page)]"
          >
            <header className="premium-sky-panel shrink-0 px-5 pb-5 pt-2">
              <div className="flex items-center gap-3 text-white">
                <button
                  type="button"
                  aria-label="Back"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 hover:bg-white/35 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all cursor-pointer backdrop-blur-sm border border-white/40"
                >
                  <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
                </button>
                <p className="flex-1 text-center text-[17px] font-bold tracking-tight">
                  My account
                </p>
                <span className="h-9 w-9" />
              </div>

              <button
                type="button"
                onClick={() => onSelect("profile")}
                className="flex w-full items-center gap-3 pt-5 text-left active:scale-[0.99] transition-transform cursor-pointer"
              >
                <span className="premium-gradient-pink flex h-14 w-14 items-center justify-center rounded-full border-2 border-white text-[20px] font-bold text-white shadow-[0_4px_12px_rgba(236,72,153,0.3)]">
                  {userName.trim().charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[20px] font-bold leading-tight tracking-tight text-white">
                    Hi, {userName.split(" ")[0]}
                  </span>
                  <span className="block truncate text-[12px] font-medium text-white/85">
                    {userLocation} · {userEmail}
                  </span>
                </span>
              </button>
            </header>

            <nav className="-mt-4 shrink-0 px-5">
              <div className="flex gap-2 p-1.5 items-center justify-between">
                {TABS.map(({ id, label, Icon, imgSrc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`flex flex-1 flex-col items-center justify-center gap-1.5 py-1 text-[12px] font-bold transition-all cursor-pointer group ${
                      tab === id
                        ? "text-sky-700 font-extrabold scale-105"
                        : "text-slate-600 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {imgSrc ? (
                      <img src={imgSrc} alt={label} className="h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform" />
                    ) : (
                      <Icon className="h-8 w-8" />
                    )}
                    <span className="leading-none">{label}</span>
                    {tab === id && (
                      <span className="h-1 w-6 rounded-full bg-sky-500 mt-0.5 shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </nav>

            <div
              ref={bodyRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
              {tab === "bargaining" && <BargainingTab onSelect={onSelect} />}
              {tab === "expenses" && <ExpensesTab onSelect={onSelect} />}
              {tab === "booking" && <BookingTab onSelect={onSelect} />}
              {tab === "settings" && (
                <SettingsTab
                  userName={userName}
                  userEmail={userEmail}
                  language={language}
                  currency={currency}
                  userRole={userRole}
                  onSelect={onSelect}
                />
              )}
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
