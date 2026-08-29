import React from "react";
import {
  BadgePercent,
  Gavel,
  Lock,
  MessageCircle,
  PiggyBank,
  Plus,
  Sparkles,
  Ticket
} from "lucide-react";
import type { AccountItemId } from "./types";
import { ListRow, PillButton, SectionHeader, StatCard } from "./ui";

interface DealRequest {
  id: string;
  title: string;
  route: string;
  budget: string;
  best: string;
  offers: number;
  status: "Open" | "Bargaining" | "Confirmed";
}

const REQUESTS: DealRequest[] = [
  {
    id: "REQ-5519",
    title: "Family Leisure Tour",
    route: "Pune → Goa · 4 nights · 5 travellers",
    budget: "₹42,000",
    best: "₹37,400",
    offers: 6,
    status: "Bargaining"
  },
  {
    id: "REQ-7821",
    title: "Temple & Heritage Pilgrimage",
    route: "Nashik → Varanasi · 6 nights · 2 travellers",
    budget: "₹58,000",
    best: "₹54,900",
    offers: 3,
    status: "Open"
  }
];

const CHATS = [
  {
    id: "OFF-401",
    agent: "Sai Holidays",
    message: "We can do ₹36,800 with airport pickup included.",
    time: "2m",
    unread: 2
  },
  {
    id: "OFF-402",
    agent: "Konkan Trails",
    message: "Sending a revised quote with breakfast added.",
    time: "18m",
    unread: 0
  }
];

const STATUS_TONE: Record<DealRequest["status"], string> = {
  Open: "bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)]",
  Bargaining: "bg-[var(--premium-pink-soft)] text-[var(--premium-pink)]",
  Confirmed: "bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]"
};

export const BargainingTab: React.FC<{
  onSelect: (item: AccountItemId) => void;
}> = ({ onSelect }) => (
  <div className="pb-6">
    <div className="flex gap-3 px-5 pt-5">
      <StatCard label="Live requests" value="2" hint="6 agents bidding" />
      <StatCard
        label="You saved"
        value="₹9,300"
        hint="vs listed price"
        tone="pink"
      />
    </div>

    <div className="px-5 pt-4">
      <button
        type="button"
        onClick={() => onSelect("bargain-new-request")}
        className="premium-gradient-pink flex h-13 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white"
      >
        <Plus className="h-5 w-5" />
        Post custom trip requirement
      </button>
    </div>

    <SectionHeader
      title="My requests"
      action="See all"
      onAction={() => onSelect("bargain-requests")}
    />
    <div className="space-y-3 px-5">
      {REQUESTS.map((request) => (
        <article key={request.id} className="premium-card overflow-hidden">
          <div className="flex items-start gap-3 px-4 pt-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]">
              <Gavel className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold tracking-tight text-[var(--premium-ink)]">
                {request.title}
              </p>
              <p className="truncate text-[12px] font-medium text-[var(--premium-muted)]">
                {request.id} · {request.route}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_TONE[request.status]}`}
            >
              {request.status}
            </span>
          </div>

          <div className="flex items-center gap-4 px-4 pt-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                Target budget
              </p>
              <p className="text-[15px] font-bold text-[var(--premium-ink)]">
                {request.budget}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                Lowest quote
              </p>
              <p className="text-[15px] font-bold text-[var(--premium-pink)]">
                {request.best}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
                Offers
              </p>
              <p className="text-[15px] font-bold text-[var(--premium-ink)]">
                {request.offers}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-dashed border-slate-200 px-4 py-3">
            <PillButton
              label="Start bargain"
              variant="solid"
              onClick={() => onSelect("bargain-chat")}
            />
            <PillButton
              label="Compare offers"
              onClick={() => onSelect("bargain-offers")}
            />
          </div>
        </article>
      ))}
    </div>

    <SectionHeader
      title="Bargain chats"
      action="Open inbox"
      onAction={() => onSelect("bargain-chat")}
    />
    <div className="space-y-3 px-5">
      {CHATS.map((chat) => (
        <button
          key={chat.id}
          type="button"
          onClick={() => onSelect("bargain-chat")}
          className="premium-card flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)]">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-[14px] font-bold text-[var(--premium-ink)]">
                {chat.agent}
              </span>
              <span className="shrink-0 text-[11px] font-medium text-[var(--premium-muted)]">
                {chat.time}
              </span>
            </span>
            <span className="block truncate text-[12px] font-medium text-[var(--premium-muted)]">
              {chat.message}
            </span>
          </span>
          {chat.unread > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--premium-pink)] px-1.5 text-[11px] font-bold text-white">
              {chat.unread}
            </span>
          )}
        </button>
      ))}
    </div>

    <SectionHeader title="Customised offers" />
    <div className="space-y-3 px-5">
      <button
        type="button"
        onClick={() => onSelect("bargain-secret-offers")}
        className="premium-gradient relative flex w-full items-center gap-3 overflow-hidden rounded-[26px] px-4 py-4 text-left text-white"
      >
        <Sparkles className="h-6 w-6 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold">
            Get secret vendor offers
          </span>
          <span className="block text-[12px] font-medium text-white/85">
            Unlisted prices from verified agents, hidden from search
          </span>
        </span>
      </button>
    </div>

    <div className="pt-2">
      <ListRow
        Icon={BadgePercent}
        label="Offers & coupons"
        caption="Every active discount tuned to your trips"
        tone="pink"
        onClick={() => onSelect("bargain-custom-offers")}
      />
      <ListRow
        Icon={Ticket}
        label="Vouchers & OTP"
        caption="Confirmed trip digital pass and official voucher"
        onClick={() => onSelect("bargain-vouchers")}
      />
      <ListRow
        Icon={Lock}
        label="Locked escrow total"
        caption="Funds held safely until your trip starts"
        tone="sky"
        value="₹18,400"
        onClick={() => onSelect("bargain-escrow")}
      />
      <ListRow
        Icon={PiggyBank}
        label="Budget advisory"
        caption="What a fair price looks like for this route"
        tone="pink"
        onClick={() => onSelect("bargain-budget-advisory")}
      />
    </div>
  </div>
);
