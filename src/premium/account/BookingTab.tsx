import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  Compass,
  Heart,
  Hotel,
  Images,
  Plane,
  Receipt,
  Sparkles,
  Ticket,
  Train,
  Users
} from "lucide-react";
import type { AccountItemId } from "./types";
import { ListRow, SectionHeader } from "./ui";

type BookingFilter = "upcoming" | "current" | "past";

interface BookingCard {
  id: string;
  kind: "flight" | "hotel" | "train";
  from: string;
  to: string;
  date: string;
  time: string;
  passenger: string;
  detail: string;
  code: string;
  price: string;
  filter: BookingFilter;
}

const BOOKINGS: BookingCard[] = [
  {
    id: "bk-1",
    kind: "flight",
    from: "Pune",
    to: "Goa",
    date: "17/07/26",
    time: "8:37 am",
    passenger: "Cara",
    detail: "Economy",
    code: "6E 729 · 4B",
    price: "₹4,180",
    filter: "upcoming"
  },
  {
    id: "bk-2",
    kind: "hotel",
    from: "Taj Fort Aguada",
    to: "Candolim, Goa",
    date: "17/07/26",
    time: "2:00 pm",
    passenger: "2 guests",
    detail: "Deluxe sea view",
    code: "HTL-4417 · 3 nights",
    price: "₹18,900",
    filter: "current"
  },
  {
    id: "bk-3",
    kind: "train",
    from: "Nashik",
    to: "Varanasi",
    date: "02/05/26",
    time: "6:15 am",
    passenger: "Cara",
    detail: "3A",
    code: "PNR 8842119076",
    price: "₹2,340",
    filter: "past"
  }
];

const KIND_ICON = {
  flight: Plane,
  hotel: Hotel,
  train: Train
} as const;

const FILTERS: { id: BookingFilter; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "current", label: "Current" },
  { id: "past", label: "Past" }
];

const Barcode: React.FC = () => (
  <div className="flex h-9 items-end gap-[3px] overflow-hidden">
    {Array.from({ length: 46 }, (_, index) => (
      <span
        key={index}
        className="w-[3px] rounded-sm bg-[var(--premium-ink)]"
        style={{ height: `${index % 4 === 0 ? 100 : index % 3 === 0 ? 70 : 90}%` }}
      />
    ))}
  </div>
);

export const BookingTab: React.FC<{
  onSelect: (item: AccountItemId) => void;
}> = ({ onSelect }) => {
  const [filter, setFilter] = useState<BookingFilter>("upcoming");
  const visible = BOOKINGS.filter((booking) => booking.filter === filter);

  const filterItem: Record<BookingFilter, AccountItemId> = {
    upcoming: "booking-upcoming",
    current: "booking-current",
    past: "booking-past"
  };

  return (
    <div className="pb-6">
      <div className="flex gap-2 px-5 pt-5">
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => {
              setFilter(entry.id);
              onSelect(filterItem[entry.id]);
            }}
            className={`h-10 flex-1 rounded-full text-[13px] font-bold ${
              filter === entry.id
                ? "bg-[var(--premium-violet)] text-white"
                : "premium-pill"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 px-5 pt-4">
        {visible.map((booking) => {
          const Icon = KIND_ICON[booking.kind];
          return (
            <article key={booking.id} className="premium-card overflow-hidden">
              <div className="flex items-center gap-3 px-4 pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold tracking-tight text-[var(--premium-ink)]">
                    {booking.from} <span className="text-[var(--premium-muted)]">→</span>{" "}
                    {booking.to}
                  </p>
                  <p className="truncate text-[12px] font-medium text-[var(--premium-muted)]">
                    {booking.code}
                  </p>
                </div>
                <p className="shrink-0 text-[18px] font-bold text-[var(--premium-violet)]">
                  {booking.price}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 px-4 pt-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                    Date & time
                  </p>
                  <p className="text-[13px] font-bold text-[var(--premium-ink)]">
                    {booking.date}
                  </p>
                  <p className="text-[12px] font-medium text-[var(--premium-muted)]">
                    {booking.time}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                    {booking.kind === "hotel" ? "Guests" : "Passenger"}
                  </p>
                  <p className="text-[13px] font-bold text-[var(--premium-ink)]">
                    {booking.passenger}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                    {booking.kind === "hotel" ? "Room" : "Class"}
                  </p>
                  <p className="text-[13px] font-bold text-[var(--premium-ink)]">
                    {booking.detail}
                  </p>
                </div>
              </div>

              <div className="mt-3 border-t border-dashed border-slate-300 px-4 pb-4 pt-3">
                <Barcode />
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => onSelect("my-tickets")}
                    className="h-10 flex-1 rounded-full bg-[var(--premium-violet)] text-[13px] font-bold text-white"
                  >
                    View ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelect("refunds")}
                    className="premium-pill h-10 flex-1 text-[13px] font-bold"
                  >
                    Cancel & refund
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {visible.length === 0 && (
          <p className="py-10 text-center text-[13px] font-medium text-[var(--premium-muted)]">
            No {filter} bookings yet.
          </p>
        )}
      </div>

      <SectionHeader title="Tickets & stays" />
      <ListRow
        Icon={Ticket}
        label="My tickets"
        caption="Flights, trains, buses and cabs"
        onClick={() => onSelect("my-tickets")}
      />
      <ListRow
        Icon={Hotel}
        label="Hotel reservations"
        caption="Check-in details and cancellation windows"
        tone="sky"
        onClick={() => onSelect("hotel-reservations")}
      />
      <ListRow
        Icon={BookOpen}
        label="Continue booking"
        caption="Pick up an in-progress checkout"
        onClick={() => onSelect("booking-continue")}
      />
      <ListRow
        Icon={Receipt}
        label="Cancellations & refunds"
        caption="Track refund status and escrow release"
        tone="pink"
        onClick={() => onSelect("refunds")}
      />

      <SectionHeader title="Plan & explore" />
      <ListRow
        Icon={Sparkles}
        label="Planning"
        caption="AI itineraries and day plans"
        onClick={() => onSelect("planning")}
      />
      <ListRow
        Icon={Calendar}
        label="Travel calendar"
        caption="Your 28-day travel schedule"
        tone="sky"
        onClick={() => onSelect("calendar")}
      />
      <ListRow
        Icon={Compass}
        label="Explore packages"
        caption="Curated holiday packages"
        onClick={() => onSelect("explore-packages")}
      />
      <ListRow
        Icon={Heart}
        label="Wishlist"
        caption="Saved destinations and stays"
        tone="pink"
        onClick={() => onSelect("wishlist")}
      />
      <ListRow
        Icon={Images}
        label="Memories"
        caption="Photos and notes from your trips"
        onClick={() => onSelect("memories")}
      />
      <ListRow
        Icon={Users}
        label="Community hub"
        caption="Travellers, groups and reviews"
        tone="sky"
        onClick={() => onSelect("social")}
      />
    </div>
  );
};
