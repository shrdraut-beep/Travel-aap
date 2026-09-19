import React from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  BookOpen,
  Building2,
  Calendar,
  ChevronRight,
  Compass,
  CreditCard,
  Globe,
  Heart,
  HelpCircle,
  Images,
  LifeBuoy,
  LogOut,
  MapPinned,
  Receipt,
  Settings,
  Shield,
  ShieldCheck,
  Navigation,
  Tag,
  Ticket,
  Users,
  Wallet
} from "lucide-react";
import { Sheet } from "./Sheet";
import { maskEmail } from "../../security/privacyUtils";

export type AccountItemId =
  | "profile"
  | "my-tickets"
  | "trips"
  | "booking"
  | "bidding"
  | "planning"
  | "calendar"
  | "explore-packages"
  | "wishlist"
  | "memories"
  | "social"
  | "wallet"
  | "expenses"
  | "refunds"
  | "offers"
  | "settings"
  | "language"
  | "notifications"
  | "legal-vault"
  | "support"
  | "about"
  | "agent-portal"
  | "admin-dashboard"
  | "logout";

interface AccountItem {
  id: AccountItemId;
  label: string;
  caption: string;
  Icon: typeof Ticket;
  imgSrc?: string;
}

interface AccountGroup {
  title: string;
  items: AccountItem[];
}

const GROUPS: AccountGroup[] = [
  {
    title: "Bookings & trips",
    items: [
      {
        id: "my-tickets",
        label: "My tickets",
        caption: "Flights, hotels, trains, buses and cabs",
        Icon: Ticket,
        imgSrc: "/icons/booking.png"
      },
      {
        id: "trips",
        label: "My trips",
        caption: "Upcoming and past journeys",
        Icon: MapPinned,
        imgSrc: "/icons/my_trips.png"
      },
      {
        id: "booking",
        label: "Booking",
        caption: "Continue an in-progress booking",
        Icon: BookOpen,
        imgSrc: "/icons/booking.png"
      },
      {
        id: "bidding",
        label: "Caught deals",
        caption: "Agent bids on your offers",
        Icon: Tag,
        imgSrc: "/icons/bargaining.png"
      },
      {
        id: "refunds",
        label: "Cancellations & refunds",
        caption: "Track refund status",
        Icon: Receipt,
        imgSrc: "/icons/start_otp.png"
      }
    ]
  },
  {
    title: "Plan & explore",
    items: [
      {
        id: "planning",
        label: "Planning",
        Icon: Navigation,
        caption: "AI itineraries and day plans",
        imgSrc: "/icons/holiday.png"
      },
      {
        id: "calendar",
        label: "Travel calendar",
        caption: "Your 28-day travel schedule",
        Icon: Calendar
      },
      {
        id: "explore-packages",
        label: "Explore packages",
        caption: "Curated holiday packages",
        Icon: Compass,
        imgSrc: "/icons/cab_hotel_package_v1.png"
      },
      {
        id: "wishlist",
        label: "Wishlist",
        caption: "Saved destinations and stays",
        Icon: Heart
      },
      {
        id: "memories",
        label: "Memories",
        caption: "Photos and notes from your trips",
        Icon: Images
      },
      {
        id: "social",
        label: "Community hub",
        caption: "Travellers, groups and reviews",
        Icon: Users
      }
    ]
  },
  {
    title: "Payments",
    items: [
      {
        id: "wallet",
        label: "Wallet",
        caption: "Balance, top-ups and transactions",
        Icon: Wallet,
        imgSrc: "/icons/routripo_wallet.png"
      },
      {
        id: "expenses",
        label: "Expenses & budget",
        caption: "Trip expenses and budget alerts",
        Icon: CreditCard,
        imgSrc: "/icons/bargaining.png"
      },
      {
        id: "offers",
        label: "Offers & coupons",
        caption: "Every active discount",
        Icon: Tag,
        imgSrc: "/icons/make_an_offer.png"
      }
    ]
  },
  {
    title: "Account",
    items: [
      {
        id: "settings",
        label: "Settings",
        caption: "Currency, orchestrator and SOS",
        Icon: Settings,
        imgSrc: "/icons/setting.png"
      },
      {
        id: "language",
        label: "App language",
        caption: "English, हिन्दी, मराठी and more",
        Icon: Globe
      },
      {
        id: "notifications",
        label: "Notifications",
        caption: "Push alerts and reminders",
        Icon: Bell
      },
      {
        id: "legal-vault",
        label: "Legal vault",
        caption: "Encrypted ID and travel documents",
        Icon: ShieldCheck,
        imgSrc: "/icons/secret.png"
      }
    ]
  },
  {
    title: "Help & more",
    items: [
      {
        id: "support",
        label: "Support",
        caption: "Raise a ticket or chat with us",
        Icon: LifeBuoy
      },
      {
        id: "about",
        label: "About & policies",
        caption: "Terms, privacy and refunds policy",
        Icon: HelpCircle
      },
      {
        id: "agent-portal",
        label: "Agent portal",
        caption: "Leads, bids, packages and earnings",
        Icon: Building2,
        imgSrc: "/icons/cab_hotel_package_v2.png"
      },
      {
        id: "admin-dashboard",
        label: "Admin dashboard",
        caption: "Operations and analytics",
        Icon: Shield,
        imgSrc: "/icons/setting.png"
      }
    ]
  }
];

export interface AccountSheetProps {
  open: boolean;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onSelect: (item: AccountItemId) => void;
  onClose: () => void;
}

/**
 * Full-screen account screen listing every user tab the app exposes, so no
 * feature is buried behind the five bottom-bar slots.
 */
export const AccountSheet: React.FC<AccountSheetProps> = ({


  open,
  userName = "Guest traveller",
  userEmail = "Sign in to sync your bookings",
  userRole = "customer",
  onSelect,
  onClose
}) => {
  const { t } = useTranslation();
  return (

  <Sheet open={open} title="Account" variant="full" onClose={onClose}>
    <button
      type="button"
      onClick={() => onSelect("profile")}
      className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-transparent"
    >
      <span className="premium-gradient flex h-12 w-12 items-center justify-center rounded-full text-[17px] font-bold text-white">
        {userName.trim().charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold tracking-tight text-slate-900">
          {userName}
        </span>
        <span className="block truncate text-[12px] font-medium text-slate-500 leading-none mt-0">
          {maskEmail(userEmail)}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
    </button>

    {GROUPS.map((group) => (
      <section key={group.title} className="border-t-8 border-slate-50">
        <h3 className="px-4 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {group.title}
        </h3>
        <ul>
          {group.items.filter(item => (item.id !== "agent-portal" && item.id !== "admin-dashboard") || userRole === "admin" || userRole === "agent").map(({ id, label, caption, Icon, imgSrc }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left active:bg-transparent"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                  {imgSrc ? (
                    <img src={imgSrc} alt="" className="h-9 w-9 object-contain drop-shadow-md" />
                  ) : (
                    <Icon className="h-6 w-6 text-sky-600" />
                  )}
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold tracking-tight text-slate-900 leading-none">
                    {t(id, label)}
                  </span>
                  <span className="block truncate text-[12px] font-medium text-slate-500 leading-none mt-0">
                    {caption}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    ))}


    <div className="border-t-8 border-slate-50 px-4 py-4">
      <button
        type="button"
        onClick={() => onSelect("logout")}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 text-[14px] font-bold text-slate-700 active:bg-slate-200"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
      <p className="pt-4 text-center text-[11px] font-medium text-slate-400">
        RoutTripo · v1.0
      </p>
    </div>
  </Sheet>
  );
};
