import React, { useState } from "react";
import {
  ArrowDownToLine,
  BadgeCheck,
  BedDouble,
  FileText,
  Hotel,
  LifeBuoy,
  Megaphone,
  Package,
  PlusCircle,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";
import { ListRow, PillButton, SectionHeader, StatCard } from "../account/ui";
import type { AgentActionId } from "./types";

interface PanelProps {
  onAction: (action: AgentActionId) => void;
}

const LEADS = [
  {
    id: "l-1",
    customer: "Meera Kulkarni",
    request: "Goa 4N/5D · 2 adults · beach resort",
    budget: "₹48,000",
    age: "12 min ago"
  },
  {
    id: "l-2",
    customer: "Arjun Deshmukh",
    request: "Manali honeymoon · 6N · volvo + hotel",
    budget: "₹72,000",
    age: "1 h ago"
  }
];

const PACKAGES = [
  { id: "p-1", title: "Konkan Coast Escape", destination: "Ratnagiri", days: 4, price: "₹18,500", published: true },
  { id: "p-2", title: "Sahyadri Trek Weekend", destination: "Bhandardara", days: 2, price: "₹6,900", published: true },
  { id: "p-3", title: "Rann Utsav Special", destination: "Kutch", days: 5, price: "₹31,200", published: false }
];

const BOOKINGS = [
  { id: "b-1", customer: "Rhea Menon", pkg: "Konkan Coast Escape", date: "12 Sep 2026", amount: "₹37,000", paid: true },
  { id: "b-2", customer: "Sanjay Iyer", pkg: "Sahyadri Trek Weekend", date: "20 Sep 2026", amount: "₹13,800", paid: false }
];

const TRANSACTIONS = [
  { id: "t-1", label: "Payout · Aug cycle 1", amount: "+₹1,24,000" },
  { id: "t-2", label: "Commission · platform fee", amount: "-₹9,860" },
  { id: "t-3", label: "Booking · Konkan Coast Escape", amount: "+₹37,000" }
];

export const OverviewPanel: React.FC<PanelProps> = ({ onAction }) => (
  <div className="pb-16">
    <SectionHeader title="Last 30 days" />
    <div className="flex gap-3 px-5">
      <StatCard label="Leads" value="64" hint="Total inquiries" tone="sky" />
      <StatCard label="Bookings" value="21" hint="Confirmed" tone="violet" />
    </div>
    <div className="flex gap-3 px-5 pt-3">
      <StatCard label="Revenue" value="₹4.8L" hint="Gross" tone="pink" />
      <StatCard label="Listings" value="12" hint="Active" tone="violet" />
    </div>

    <SectionHeader title="Partner workspace" />
    <div className="grid grid-cols-2 gap-3 px-5">
      <button
        type="button"
        onClick={() => onAction("overview-hotel-onboarding")}
        className="premium-card px-4 py-4 text-left"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)]">
          <Hotel className="h-5 w-5" />
        </span>
        <span className="block pt-2 text-[14px] font-bold text-[var(--premium-ink)]">
          Hotel onboarding
        </span>
        <span className="block text-[12px] font-medium text-[var(--premium-muted)]">
          List a property
        </span>
      </button>
      <button
        type="button"
        onClick={() => onAction("overview-create-package")}
        className="premium-card px-4 py-4 text-left"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--premium-pink-soft)] text-[var(--premium-pink)]">
          <PlusCircle className="h-5 w-5" />
        </span>
        <span className="block pt-2 text-[14px] font-bold text-[var(--premium-ink)]">
          New package
        </span>
        <span className="block text-[12px] font-medium text-[var(--premium-muted)]">
          Build a tour
        </span>
      </button>
    </div>

    <div className="mx-5 mt-3 premium-card divide-y divide-slate-100 py-1">
      <ListRow
        Icon={Tag}
        label="Markups & bookings"
        caption="Tune pricing and review confirmations"
        onClick={() => onAction("overview-markups")}
      />
      <ListRow
        Icon={Sparkles}
        label="Partner business services"
        caption="Visa, insurance, transfers and add-ons"
        tone="pink"
        onClick={() => onAction("overview-partner-services")}
      />
      <ListRow
        Icon={Users}
        label="Total inquiries / leads"
        caption="Everything in your funnel"
        value="64"
        tone="sky"
        onClick={() => onAction("overview-leads")}
      />
      <ListRow
        Icon={BedDouble}
        label="Confirmed bookings"
        caption="Paid and payment-protected"
        value="21"
        onClick={() => onAction("overview-bookings")}
      />
      <ListRow
        Icon={TrendingUp}
        label="Gross revenue"
        caption="Before platform commission"
        value="₹4.8L"
        tone="pink"
        onClick={() => onAction("overview-revenue")}
      />
      <ListRow
        Icon={Package}
        label="Active listings"
        caption="Published packages"
        value="12"
        onClick={() => onAction("overview-listings")}
      />
    </div>
  </div>
);

export const OffersPanel: React.FC<PanelProps> = ({ onAction }) => (
  <div className="pb-16">
    <SectionHeader
      title="Open leads"
      action="History"
      onAction={() => onAction("offer-history")}
    />
    <div className="space-y-3 px-5">
      {LEADS.map((lead) => (
        <div key={lead.id} className="premium-card px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold text-[var(--premium-ink)]">
                {lead.customer}
              </p>
              <p className="text-[12px] font-medium text-[var(--premium-muted)]">
                {lead.request}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--premium-violet-soft)] px-3 py-1 text-[11px] font-bold text-[var(--premium-violet)]">
              {lead.budget}
            </span>
          </div>
          <p className="pt-2 text-[11px] font-medium text-[var(--premium-muted)]">
            Posted {lead.age}
          </p>
          <div className="flex gap-2 pt-3">
            <PillButton
              label="Send quote"
              variant="solid"
              onClick={() => onAction("offer-quote")}
            />
            <PillButton label="Chat" onClick={() => onAction("offer-respond")} />
            <PillButton
              label="Decline"
              variant="pink"
              onClick={() => onAction("offer-decline")}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const InventoryPanel: React.FC<PanelProps> = ({ onAction }) => {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div className="pb-16">
      <SectionHeader title="Create new tour package" />
      <div className="mx-5 premium-card space-y-3 px-4 py-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
            Package title
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Konkan Coast Escape"
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-[var(--premium-violet)]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
            Destination
          </label>
          <input
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="Ratnagiri"
            className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-[var(--premium-violet)]"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
              Duration (days)
            </label>
            <input
              value={days}
              onChange={(event) => setDays(event.target.value)}
              inputMode="numeric"
              placeholder="4"
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-[var(--premium-violet)]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
              Package price
            </label>
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="numeric"
              placeholder="18500"
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-[var(--premium-violet)]"
            />
          </div>
        </div>
        <PillButton
          label="Create package"
          variant="solid"
          onClick={() => onAction("inventory-create-package")}
        />
      </div>

      <SectionHeader title="Your packages" />
      <div className="space-y-3 px-5">
        {PACKAGES.map((pkg) => (
          <div key={pkg.id} className="premium-card px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-[var(--premium-ink)]">
                  {pkg.title}
                </p>
                <p className="text-[12px] font-medium text-[var(--premium-muted)]">
                  {pkg.destination} · {pkg.days} days · {pkg.price}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                  pkg.published
                    ? "bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)]"
                    : "bg-[var(--premium-pink-soft)] text-[var(--premium-pink)]"
                }`}
              >
                {pkg.published ? "Published" : "Draft"}
              </span>
            </div>
            <div className="flex gap-2 pt-3">
              <PillButton label="Edit" onClick={() => onAction("inventory-edit-package")} />
              <PillButton
                label={pkg.published ? "Unpublish" : "Publish"}
                variant="pink"
                onClick={() => onAction("inventory-toggle-published")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BookingsPanel: React.FC<PanelProps> = ({ onAction }) => (
  <div className="pb-16">
    <SectionHeader title="Bookings & leads" />
    <div className="space-y-3 px-5">
      {BOOKINGS.map((booking) => (
        <div key={booking.id} className="premium-card px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold text-[var(--premium-ink)]">
                {booking.customer}
              </p>
              <p className="truncate text-[12px] font-medium text-[var(--premium-muted)]">
                {booking.pkg} · travel {booking.date}
              </p>
            </div>
            <span className="shrink-0 text-[14px] font-bold text-[var(--premium-violet)]">
              {booking.amount}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                booking.paid
                  ? "bg-[var(--premium-sky-soft)] text-[var(--premium-sky-deep)]"
                  : "bg-[var(--premium-pink-soft)] text-[var(--premium-pink)]"
              }`}
            >
              {booking.paid ? "Payment protected" : "Payment pending"}
            </span>
          </div>
          <div className="flex gap-2 pt-3">
            <PillButton label="Open booking" onClick={() => onAction("booking-open")} />
            <PillButton label="Invoice" onClick={() => onAction("booking-invoice")} />
            <PillButton
              label="Payment status"
              variant="pink"
              onClick={() => onAction("booking-payment-status")}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const EarningsPanel: React.FC<PanelProps> = ({ onAction }) => (
  <div className="pb-16">
    <SectionHeader title="Wallet" />
    <div className="mx-5 premium-card px-4 py-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
        Available balance
      </p>
      <p className="pt-1 text-[28px] font-bold leading-none text-[var(--premium-violet)]">
        ₹1,51,140
      </p>
      <div className="flex gap-2 pt-3">
        <PillButton
          label="Add money"
          variant="solid"
          onClick={() => onAction("earnings-add-money")}
        />
        <PillButton
          label="Withdraw"
          variant="pink"
          onClick={() => onAction("earnings-withdraw")}
        />
      </div>
    </div>

    <SectionHeader
      title="Recent transactions"
      action="Statement"
      onAction={() => onAction("earnings-statement")}
    />
    <div className="mx-5 premium-card divide-y divide-slate-100 py-1">
      {TRANSACTIONS.map((entry) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => onAction("earnings-transactions")}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]">
            <Wallet className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-[var(--premium-ink)]">
            {entry.label}
          </span>
          <span
            className={`shrink-0 text-[13px] font-bold ${
              entry.amount.startsWith("+")
                ? "text-[var(--premium-sky-deep)]"
                : "text-[var(--premium-pink)]"
            }`}
          >
            {entry.amount}
          </span>
        </button>
      ))}
    </div>

    <div className="mx-5 mt-3 premium-card divide-y divide-slate-100 py-1">
      <ListRow
        Icon={ArrowDownToLine}
        label="Earnings & statement"
        caption="Download cycle-wise settlement"
        onClick={() => onAction("earnings-statement")}
      />
    </div>
  </div>
);

export const MarkupsPanel: React.FC<PanelProps> = ({ onAction }) => {
  const [globalRule, setGlobalRule] = useState("8");

  return (
    <div className="pb-16">
      <SectionHeader title="Markup engine" />
      <div className="mx-5 premium-card px-4 py-4">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
          Global rule (%)
        </label>
        <input
          value={globalRule}
          onChange={(event) => setGlobalRule(event.target.value)}
          inputMode="numeric"
          className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-[var(--premium-violet)]"
        />
        <p className="pt-2 text-[12px] font-medium text-[var(--premium-muted)]">
          Applied on every listing that has no package-level override.
        </p>
        <div className="pt-3">
          <PillButton
            label="Save global rule"
            variant="solid"
            onClick={() => onAction("markup-global-rule")}
          />
        </div>
      </div>

      <SectionHeader title="Per package" />
      <div className="mx-5 premium-card divide-y divide-slate-100 py-1">
        {PACKAGES.map((pkg) => (
          <ListRow
            key={pkg.id}
            Icon={Tag}
            label={pkg.title}
            caption={`${pkg.destination} · base ${pkg.price}`}
            value={`${globalRule}%`}
            tone="pink"
            onClick={() => onAction("markup-package-rule")}
          />
        ))}
      </div>
    </div>
  );
};

export const MarketingPanel: React.FC<PanelProps> = ({ onAction }) => (
  <div className="pb-16">
    <SectionHeader title="Ad manager" />
    <div className="mx-5 premium-card px-4 py-4">
      <p className="text-[14px] font-bold text-[var(--premium-ink)]">
        Monsoon Konkan · sponsored listing
      </p>
      <p className="pt-1 text-[12px] font-medium text-[var(--premium-muted)]">
        4,120 impressions · 186 clicks · 9 leads
      </p>
      <div className="flex gap-2 pt-3">
        <PillButton
          label="Manage campaign"
          variant="solid"
          onClick={() => onAction("marketing-ad-manager")}
        />
        <PillButton
          label="Spend"
          onClick={() => onAction("marketing-campaign-spend")}
        />
      </div>
    </div>

    <div className="mx-5 mt-3 premium-card divide-y divide-slate-100 py-1">
      <ListRow
        Icon={Megaphone}
        label="Create campaign"
        caption="Promote a package to travellers"
        tone="pink"
        onClick={() => onAction("marketing-ad-manager")}
      />
      <ListRow
        Icon={ReceiptText}
        label="Campaign spend"
        caption="Budget, billing and invoices"
        value="₹7,400"
        onClick={() => onAction("marketing-campaign-spend")}
      />
    </div>
  </div>
);

export const AgentSupportPanel: React.FC<PanelProps> = ({ onAction }) => (
  <div className="pb-16">
    <SectionHeader title="Agency support" />
    <div className="mx-5 premium-card divide-y divide-slate-100 py-1">
      <ListRow
        Icon={LifeBuoy}
        label="Raise a ticket"
        caption="Payouts, KYC, listings or disputes"
        onClick={() => onAction("support-raise-ticket")}
      />
      <ListRow
        Icon={FileText}
        label="Partner handbook"
        caption="Policies, SLAs and commission slabs"
        tone="sky"
        onClick={() => onAction("support-contact")}
      />
      <ListRow
        Icon={Users}
        label="Talk to your manager"
        caption="Dedicated B2B partner desk"
        tone="pink"
        onClick={() => onAction("support-contact")}
      />
    </div>
  </div>
);

export const ProfilePanel: React.FC<PanelProps> = ({ onAction }) => {
  const [agency, setAgency] = useState("Wataghati Holidays");
  const [gst, setGst] = useState("27AAECW1234M1Z8");
  const [city, setCity] = useState("Pune");
  const [email, setEmail] = useState("partner@wataghati.in");
  const [phone, setPhone] = useState("+91 98220 11223");

  return (
    <div className="pb-16">
      <SectionHeader title="Profile & KYC" />
      <div className="mx-5 premium-card px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-[var(--premium-sky-soft)] px-3 py-1 text-[11px] font-bold text-[var(--premium-sky-deep)]">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[var(--premium-pink-soft)] px-3 py-1 text-[11px] font-bold text-[var(--premium-pink)]">
            <ShieldCheck className="h-3.5 w-3.5" /> B2B partner
          </span>
        </div>

        <div className="space-y-3 pt-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
              Agency name
            </label>
            <input
              value={agency}
              onChange={(event) => setAgency(event.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-[var(--premium-violet)]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
              GST number
            </label>
            <input
              value={gst}
              onChange={(event) => setGst(event.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-[var(--premium-violet)]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
              Base city
            </label>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-[var(--premium-violet)]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
              Email address
            </label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-[var(--premium-violet)]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--premium-muted)]">
              Phone number
            </label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] font-medium text-[var(--premium-ink)] outline-none focus:border-[var(--premium-violet)]"
            />
          </div>
        </div>

        <div className="pt-4">
          <PillButton
            label="Save profile settings"
            variant="solid"
            onClick={() => onAction("profile-save")}
          />
        </div>
      </div>

      <div className="mx-5 mt-3 premium-card divide-y divide-slate-100 py-1">
        <ListRow
          Icon={ShieldCheck}
          label="KYC documents"
          caption="PAN, GST certificate and bank proof"
          onClick={() => onAction("profile-kyc")}
        />
        <ListRow
          Icon={ReceiptText}
          label="GST & invoicing"
          caption="Tax details used on every invoice"
          tone="pink"
          onClick={() => onAction("profile-gst")}
        />
      </div>
    </div>
  );
};
