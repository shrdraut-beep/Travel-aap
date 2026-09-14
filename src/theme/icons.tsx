/**
 * Centralized icon registry for App.tsx
 * ---------------------------------------------------------------
 * Every icon used in App.tsx (bottom-nav items) is re-exported from
 * here, plus a themed <IconBadge /> wrapper so any icon can be
 * dropped into a gradient "pill" that matches the app's new design
 * system (same visual language as BottomNav's active-state badge).
 *
 * Usage:
 *   import { HomeIcon, IconBadge, ROLE_THEME } from '../theme/icons';
 *   <IconBadge icon={HomeIcon} role="admin" active />
 * --------------------------------------------------------------- */
import React from "react";
import {
  Home,
  Briefcase,
  ClipboardList,
  BookOpen,
  DollarSign,
  MapPin,
  Settings,
  type LucideIcon,
} from "lucide-react";

/* ============ 1. RAW ICON RE-EXPORTS (as used in App.tsx) ============ */
// NAV_USER: Hub, Trips, Planning, Social, Booking, Expenses
export const HomeIcon: LucideIcon = Home;           // Hub
export const TripsIcon: LucideIcon = Briefcase;     // Trips
export const PlanningIcon: LucideIcon = ClipboardList; // Planning
export const SocialIcon: LucideIcon = MapPin;        // Social
export const BookingIcon: LucideIcon = BookOpen;     // Booking
export const ExpensesIcon: LucideIcon = DollarSign;  // Expenses / Kharch
export const SettingsIcon: LucideIcon = Settings;    // Settings

/* ============ 2. ROLE THEME TOKENS (matches LoginScreen / BottomNav) ============ */
export type AppRole = "admin" | "user" | "agent";

export const ROLE_THEME: Record<AppRole, { grad: string; glow: string; solid: string }> = {
  admin: {
    grad: "from-pink-500 to-pink-700",
    glow: "shadow-pink-500/30",
    solid: "#059669",
  },
  user: {
    grad: "from-red-500 via-rose-500 to-pink-500",
    glow: "shadow-rose-500/30",
    solid: "#f43f5e",
  },
  agent: {
    grad: "from-sky-400 to-sky-600",
    glow: "shadow-sky-500/30",
    solid: "#0ea5e9",
  },
};

/* ============ 3. NAV ICON CONFIG (drop-in replacement for NAV_USER's `icon` field) ============ */
export const NAV_USER_ICONS = [
  { key: "planning", label: "Planning", icon: HomeIcon },
  { key: "trips", label: "Trips", icon: TripsIcon },
  { key: "social", label: "Social", icon: SocialIcon },
  { key: "booking", label: "Booking", icon: BookingIcon },
  { key: "expenses", label: "Expenses", icon: ExpensesIcon },
];

/* ============ 4. THEMED ICON BADGE ============ */
interface IconBadgeProps {
  icon: LucideIcon;
  role?: AppRole;
  active?: boolean;
  size?: number;      // badge diameter in px-equivalent Tailwind steps (defaults to 34px / w-8.5)
  iconSize?: number;  // icon size in px (defaults to 16px / w-4)
}

/** Gradient circle badge — same visual language as BottomNav's active-state icon. */
export function IconBadge({ icon: Icon, role = "user", active = true, size = 34, iconSize = 16 }: IconBadgeProps) {
  const theme = ROLE_THEME[role];
  return (
    <div
      className={`rounded-2xl flex items-center justify-center transition-all duration-300 ${
        active ? `bg-gradient-to-br ${theme.grad} shadow-md ${theme.glow} scale-110 -translate-y-0.5` : "bg-slate-100"
      }`}
      style={{ width: size, height: size }}
    >
      <Icon
        className={`transition-colors ${active ? "text-white" : "text-slate-400"}`}
        style={{ width: iconSize, height: iconSize }}
      />
    </div>
  );
}
