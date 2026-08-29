import React from "react";
import {
  BellRing,
  Plus,
  Receipt,
  ScanLine,
  Users,
  Wallet as WalletIcon
} from "lucide-react";
import type { AccountItemId } from "./types";
import { ListRow, PillButton, SectionHeader } from "./ui";

interface Category {
  label: string;
  amount: number;
  color: string;
}

const BUDGET = 60000;
const SPENT = 38650;

const CATEGORIES: Category[] = [
  { label: "Stay", amount: 14200, color: "#7b3ff2" },
  { label: "Transport", amount: 9800, color: "#44c6f7" },
  { label: "Food", amount: 7450, color: "#ff4fa3" },
  { label: "Tickets", amount: 4600, color: "#28204f" },
  { label: "Shopping", amount: 2600, color: "#b9a6f7" }
];

const DAILY = [
  { day: "Mon", amount: 3200 },
  { day: "Tue", amount: 5400 },
  { day: "Wed", amount: 2100 },
  { day: "Thu", amount: 7300 },
  { day: "Fri", amount: 4600 },
  { day: "Sat", amount: 8900 },
  { day: "Sun", amount: 7150 }
];

const LOG = [
  {
    id: "exp-1",
    title: "Beach shack dinner",
    category: "Food",
    payer: "You",
    date: "Sat, 14 Jun",
    amount: 2140
  },
  {
    id: "exp-2",
    title: "Cab to Anjuna",
    category: "Transport",
    payer: "Rohit",
    date: "Sat, 14 Jun",
    amount: 860
  },
  {
    id: "exp-3",
    title: "Resort night 2",
    category: "Stay",
    payer: "You",
    date: "Fri, 13 Jun",
    amount: 6400
  }
];

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const Donut: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const total = categories.reduce((sum, item) => sum + item.amount, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0 -rotate-90">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#f1f2f7" strokeWidth="16" />
      {categories.map((category) => {
        const length = (category.amount / total) * circumference;
        const dash = `${length} ${circumference - length}`;
        const element = (
          <circle
            key={category.label}
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={category.color}
            strokeWidth="16"
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
        offset += length;
        return element;
      })}
    </svg>
  );
};

export const ExpensesTab: React.FC<{
  onSelect: (item: AccountItemId) => void;
}> = ({ onSelect }) => {
  const remaining = BUDGET - SPENT;
  const usage = Math.round((SPENT / BUDGET) * 100);
  const maxDaily = Math.max(...DAILY.map((entry) => entry.amount));

  return (
    <div className="pb-6">
      <section className="px-5 pt-5">
        <button
          type="button"
          onClick={() => onSelect("expenses-overview")}
          className="premium-gradient-pink block w-full rounded-[26px] px-5 py-5 text-left text-white"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
            Goa trip budget
          </p>
          <p className="pt-1 text-[30px] font-bold leading-none">{inr(SPENT)}</p>
          <p className="pt-1 text-[12px] font-medium text-white/85">
            spent of {inr(BUDGET)} · {inr(remaining)} left
          </p>
          <span className="mt-4 block h-2.5 w-full overflow-hidden rounded-full bg-white/30">
            <span
              className="block h-full rounded-full bg-white"
              style={{ width: `${usage}%` }}
            />
          </span>
          <p className="pt-2 text-[11px] font-bold uppercase tracking-wider text-white/85">
            {usage}% of budget used
          </p>
        </button>
      </section>

      <div className="flex gap-2 px-5 pt-4">
        <PillButton
          label="Add expense"
          variant="solid"
          onClick={() => onSelect("expenses-add")}
        />
        <PillButton
          label="Scan bill"
          onClick={() => onSelect("expenses-scanner")}
        />
        <PillButton label="Split" onClick={() => onSelect("expenses-split")} />
      </div>

      <SectionHeader
        title="By category"
        action="Details"
        onAction={() => onSelect("expenses-overview")}
      />
      <div className="px-5">
        <div className="premium-card flex items-center gap-4 px-4 py-4">
          <Donut categories={CATEGORIES} />
          <ul className="min-w-0 flex-1 space-y-2">
            {CATEGORIES.map((category) => (
              <li key={category.label} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-[var(--premium-ink)]">
                  {category.label}
                </span>
                <span className="shrink-0 text-[13px] font-medium text-[var(--premium-muted)]">
                  {inr(category.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SectionHeader title="Daily spend" />
      <div className="px-5">
        <div className="premium-card px-4 pb-4 pt-5">
          <div className="flex h-32 items-end gap-2">
            {DAILY.map((entry) => (
              <div
                key={entry.day}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[10px] font-bold text-[var(--premium-muted)]">
                  {Math.round(entry.amount / 100) / 10}k
                </span>
                <span
                  className="block w-full rounded-t-xl bg-[var(--premium-sky)]"
                  style={{ height: `${Math.round((entry.amount / maxDaily) * 92)}px` }}
                />
                <span className="text-[11px] font-medium text-[var(--premium-muted)]">
                  {entry.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionHeader
        title="Expense log"
        action="View all"
        onAction={() => onSelect("expenses-log")}
      />
      <div className="space-y-3 px-5">
        {LOG.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect("expenses-log")}
            className="premium-card flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]">
              <Receipt className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-bold text-[var(--premium-ink)]">
                {entry.title}
              </span>
              <span className="block truncate text-[12px] font-medium text-[var(--premium-muted)]">
                {entry.category} · paid by {entry.payer} · {entry.date}
              </span>
            </span>
            <span className="shrink-0 text-[15px] font-bold text-[var(--premium-ink)]">
              {inr(entry.amount)}
            </span>
          </button>
        ))}
      </div>

      <div className="pt-2">
        <ListRow
          Icon={Plus}
          label="Add new expense"
          caption="Title, amount, category, paid by, split with"
          onClick={() => onSelect("expenses-add")}
        />
        <ListRow
          Icon={ScanLine}
          label="Smart scanner"
          caption="Scan a bill and log it automatically"
          tone="sky"
          onClick={() => onSelect("expenses-scanner")}
        />
        <ListRow
          Icon={Users}
          label="Split & pool deposit"
          caption="Group kitty, per-person balances and settle up"
          tone="pink"
          onClick={() => onSelect("expenses-pool-deposit")}
        />
        <ListRow
          Icon={WalletIcon}
          label="Wallet"
          caption="Balance, top-ups and transactions"
          value="₹4,250"
          onClick={() => onSelect("wallet")}
        />
        <ListRow
          Icon={BellRing}
          label="Kharch & budget alerts"
          caption="Warn me when a category crosses its limit"
          tone="pink"
          onClick={() => onSelect("expenses-budget-alerts")}
        />
      </div>
    </div>
  );
};
