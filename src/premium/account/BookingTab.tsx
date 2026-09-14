import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  Download,
  Heart,
  Hotel,
  Images,
  Plane,
  Receipt,
  Search,
  Share2,
  Navigation,
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
  statusBadge: string;
  statusTone: "pink" | "orange" | "sky";
  gateOrPlatform: string;
  filter: BookingFilter;
}

const KIND_ICON = {
  flight: Plane,
  hotel: Hotel,
  train: Train
} as const;

const KIND_IMG: Record<string, string> = {
  flight: "/icons/flight.png",
  hotel: "/icons/hotel.png",
  train: "/icons/train.png",
  bus: "/icons/bus.png",
  cabs: "/icons/cabs.png"
};

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
  const [bookingsList, setBookingsList] = useState<BookingCard[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("routripo_user_bookings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error("Failed to load bookings from storage", e);
      }
    }
    return [];
  });

  const [filter, setFilter] = useState<BookingFilter>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const upcomingCount = bookingsList.filter((b) => b.filter === "upcoming").length;
  const currentCount = bookingsList.filter((b) => b.filter === "current").length;
  const pastCount = bookingsList.filter((b) => b.filter === "past").length;

  const filters: { id: BookingFilter; label: string }[] = [
    { id: "upcoming", label: `Upcoming (${upcomingCount})` },
    { id: "current", label: `Current (${currentCount})` },
    { id: "past", label: `Past (${pastCount})` }
  ];

  const visible = bookingsList.filter(
    (booking) =>
      booking.filter === filter &&
      (booking.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleShare = (id: string) => {
    setCopiedId(id);
    navigator.clipboard?.writeText(window.location.origin + `/booking/${id}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Search Input */}
      <div className="px-5 pt-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search bookings by city or PNR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-5 pt-3">
        {filters.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setFilter(entry.id)}
            className={`h-9 flex-1 rounded-full text-[12px] font-black transition-all cursor-pointer active:scale-95 ${
              filter === entry.id
                ? "btn-3d-primary text-white shadow-[0_4px_12px_rgba(2,132,199,0.3)]"
                : "bg-white border border-slate-200/90 text-slate-700 shadow-xs hover:bg-slate-50 hover:border-sky-300"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-4 px-5 pt-3">
        {visible.map((booking) => {
          const Icon = KIND_ICON[booking.kind];
          return (
            <article key={booking.id} className="premium-card overflow-hidden border border-slate-200/80 shadow-md">
              <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-premium-sky-deep bg-premium-sky-soft/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {booking.statusBadge}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {booking.gateOrPlatform}
                </span>
              </div>

              <div className="flex items-center gap-3 px-4 pt-3">
                <div className="flex h-11 w-11 items-center justify-center shrink-0 rounded-2xl bg-sky-50 border border-sky-100/80 shadow-xs">
                  {KIND_IMG[booking.kind] ? (
                    <img src={KIND_IMG[booking.kind]} alt={booking.kind} className="h-9 w-9 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)]" />
                  ) : (
                    <Icon className="h-7 w-7 text-sky-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold tracking-tight text-slate-900">
                    {booking.from} <span className="text-slate-400">→</span>{" "}
                    {booking.to}
                  </p>
                  <p className="truncate text-[12px] font-medium text-slate-500">
                    {booking.code}
                  </p>
                </div>
                <p className="shrink-0 text-[18px] font-black text-sky-700">
                  {booking.price}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 px-4 pt-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Date & time
                  </p>
                  <p className="text-[13px] font-bold text-slate-900">
                    {booking.date}
                  </p>
                  <p className="text-[12px] font-medium text-slate-500">
                    {booking.time}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {booking.kind === "hotel" ? "Guests" : "Passenger"}
                  </p>
                  <p className="text-[13px] font-bold text-slate-900 truncate">
                    {booking.passenger}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {booking.kind === "hotel" ? "Room" : "Class / Seat"}
                  </p>
                  <p className="text-[13px] font-bold text-slate-800 truncate">
                    {booking.detail}
                  </p>
                </div>
              </div>

              <div className="mt-3 border-t border-dashed border-slate-300 px-4 pb-4 pt-3 bg-slate-50/40">
                <Barcode />
                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => onSelect("my-tickets")}
                    className="btn-3d-primary h-11 flex-1 rounded-2xl text-[13px] font-black text-white shadow-[0_4px_14px_rgba(2,132,199,0.35)] flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>View / e-Ticket</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(booking.id)}
                    className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-[13px] font-extrabold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-slate-500" />
                    <span>{copiedId === booking.id ? "Link Copied!" : "Share"}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {visible.length === 0 && (
          <div className="py-10 text-center bg-white rounded-3xl border border-slate-200 p-6">
            <p className="text-[14px] font-bold text-slate-700">No {filter} bookings found.</p>
            <p className="text-[12px] text-slate-400 mt-1">Book flights, hotels or trains to see them appear here instantly.</p>
          </div>
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
        Icon={Navigation}
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

