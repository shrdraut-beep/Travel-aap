import React from "react";
import { Bell, Menu } from "lucide-react";

export interface AppBarProps {
  onMenu?: () => void;
  onNotifications?: () => void;
  onProfile?: () => void;
  /** Shown on the avatar; falls back to a guest initial. */
  userInitial?: string;
  notificationCount?: number;
}

/**
 * Compact status-bar-hugging app bar. Keeps the existing RouTripO mark and
 * name, with thumb-sized tap targets on both edges.
 */
export const AppBar: React.FC<AppBarProps> = ({
  onMenu,
  onNotifications,
  onProfile,
  userInitial = "G",
  notificationCount = 0
}) => (
  <header className="premium-gradient sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white active:bg-white/15"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center gap-2">
        <img
          src="/routripo_header_logo.svg"
          alt=""
          aria-hidden="true"
          className="h-7 w-7 rounded-lg bg-white/95 p-1"
        />
        <span className="text-[17px] font-bold tracking-tight text-white">
          RouTripO
        </span>
      </div>

      <button
        type="button"
        onClick={onNotifications}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-white active:bg-white/15"
      >
        <Bell className="h-5 w-5" />
        {notificationCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[var(--premium-accent)]">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        ) : null}
      </button>

      <button
        type="button"
        onClick={onProfile}
        aria-label="Your account"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-[14px] font-bold text-white"
      >
        {userInitial}
      </button>
    </div>
  </header>
);
