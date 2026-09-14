import React, { useState } from "react";
import {
  BellRing,
  Check,
  Filter,
  Plus,
  Receipt,
  ScanLine,
  TrendingDown,
  Users,
  Wallet as WalletIcon,
  X,
  Fuel
} from "lucide-react";
import type { AccountItemId } from "./types";
import { ListRow, PillButton, SectionHeader } from "./ui";

import { useTripContext } from "../../context/TripContext";

interface Category {
  label: string;
  amount: number;
  color: string;
}

const DEFAULT_BUDGET = 50000;

const DEFAULT_CATEGORIES: Category[] = [
  { label: "Stay", amount: 0, color: "#7b3ff2" },
  { label: "Transport", amount: 0, color: "#44c6f7" },
  { label: "Food", amount: 0, color: "#ff4fa3" },
  { label: "Tickets", amount: 0, color: "#28204f" },
  { label: "Shopping", amount: 0, color: "#b9a6f7" }
];

interface ExpenseItem {
  id: string;
  title: string;
  category: "Stay" | "Transport" | "Food" | "Tickets" | "Shopping";
  payer: string;
  date: string;
  amount: number;
}

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const Donut: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const total = categories.reduce((sum, item) => sum + item.amount, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (total === 0) {
    return (
      <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0 -rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="16" />
      </svg>
    );
  }

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
  const tripContext = useTripContext?.();
  const tripExpenses = tripContext?.activeTrip?.expenses || [];
  const tripBudget = tripContext?.activeTrip?.totalBudget || DEFAULT_BUDGET;

  const [expenseLog, setExpenseLog] = useState<ExpenseItem[]>(() => {
    if (tripExpenses.length > 0) {
      return tripExpenses.map((exp: any) => ({
        id: exp.id || `exp-${Math.random()}`,
        title: exp.title || exp.description || "Expense",
        category: (exp.category as any) || "Food",
        payer: exp.paidBy || "You",
        date: exp.date ? new Date(exp.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "Today",
        amount: exp.amount || 0
      }));
    }
    return [];
  });

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  
  // Quick Add State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState<ExpenseItem["category"]>("Food");
  const [newPayer, setNewPayer] = useState("You");

  // Recompute category totals dynamically from expenseLog
  const categories: Category[] = DEFAULT_CATEGORIES.map((cat) => {
    const sum = expenseLog
      .filter((e) => e.category.toLowerCase() === cat.label.toLowerCase())
      .reduce((s, e) => s + e.amount, 0);
    return { ...cat, amount: sum };
  });

  const totalSpent = expenseLog.reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, tripBudget - totalSpent);
  const usage = tripBudget > 0 ? Math.min(100, Math.round((totalSpent / tripBudget) * 100)) : 0;
  
  const daily = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
    const sum = expenseLog
      .filter((e) => e.date.toLowerCase().includes(day.toLowerCase()))
      .reduce((s, e) => s + e.amount, 0);
    return { day, amount: sum };
  });
  const maxDaily = Math.max(1, ...daily.map((entry) => entry.amount));

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(num) || num <= 0) return;

    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      payer: newPayer,
      date: "Today",
      amount: num
    };

    setExpenseLog([newItem, ...expenseLog]);

    setNewTitle("");
    setNewAmount("");
    setShowAddForm(false);
  };

  const filteredLog = selectedCategoryFilter === "All"
    ? expenseLog
    : expenseLog.filter((item) => item.category === selectedCategoryFilter);

  return (
    <div className="pb-6">
      {/* Budget Summary Card */}
      <section className="px-5 pt-5">
        <div className="bg-white border-2 border-slate-100 block w-full rounded-[28px] px-5 py-5 text-left text-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              {(tripContext?.activeTrip as any)?.title || tripContext?.activeTrip?.name || "Trip"} Budget Tracker
            </p>
            <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {usage <= 75 ? "On Track" : "Watch Out"}
            </span>
          </div>
          <p className="pt-1.5 text-[32px] font-black leading-none tracking-tight premium-gradient-text">{inr(totalSpent)}</p>
          <p className="pt-1 text-[13px] font-medium text-slate-500">
            spent of {inr(tripBudget)} · <strong className="text-slate-800">{inr(remaining)}</strong> remaining
          </p>
          <span className="mt-4 block h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-sky-500 to-pink-500 transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(usage, 100)}%` }}
            />
          </span>
          <div className="flex items-center justify-between pt-2 text-[11px] font-black uppercase tracking-wider text-slate-500">
            <span>{usage}% Used</span>
            <span>{100 - usage}% Remaining</span>
          </div>
        </div>
      </section>

      {/* 3D Action Buttons */}
      <div className="flex gap-2.5 px-5 pt-4 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="h-10 px-4 shrink-0 rounded-full bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[13px] font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-pink-500 stroke-[2.5]" />
          <span>Add</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect("expenses-scanner")}
          className="h-10 px-4 shrink-0 rounded-full bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[13px] font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <ScanLine className="w-4 h-4 text-sky-500 stroke-[2.5]" />
          <span>Scan</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect("expenses-fuel")}
          className="h-10 px-4 shrink-0 rounded-full bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[13px] font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <Fuel className="w-4 h-4 text-amber-500 stroke-[2.5]" />
          <span>Fuel</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect("expenses-budget-alerts")}
          className="h-10 px-4 shrink-0 rounded-full bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[13px] font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <TrendingDown className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
          <span>Budget</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect("expenses-split")}
          className="h-10 px-4 shrink-0 rounded-full bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[13px] font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <Users className="w-4 h-4 text-indigo-500 stroke-[2.5]" />
          <span>Split</span>
        </button>
      </div>

      {/* Quick Add Expense Inline Drawer */}
      {showAddForm && (
        <div className="px-5 pt-4">
          <form
            onSubmit={handleAddExpense}
            className="bg-white rounded-3xl p-4 border-2 border-pink-200 shadow-lg space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-black text-slate-800 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-pink-500" />
                Quick Log Expense
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  autoFocus
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[15px] font-bold text-slate-900 outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-900 outline-none focus:border-pink-500"
                >
                  <option value="Food">Food & Drinks</option>
                  <option value="Stay">Hotel / Stay</option>
                  <option value="Transport">Transport / Fuel</option>
                  <option value="Tickets">Entry Tickets</option>
                  <option value="Shopping">Shopping & Misc</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Description / Vendor
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Scuba diving pass, Dinner at Curlies"
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-900 outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="btn-3d-primary flex-1 py-2.5 text-white font-black text-[13px] rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(2,132,199,0.35)] cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Expense</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-extrabold text-[13px] rounded-xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* By Category Donut */}
      <SectionHeader
        title="By category"
        action="Details"
        onAction={() => onSelect("expenses-overview")}
      />
      <div className="px-5">
        <div className="premium-card flex items-center gap-4 px-4 py-4 border border-slate-200/80">
          <Donut categories={categories} />
          <ul className="min-w-0 flex-1 space-y-2">
            {categories.map((category) => (
              <li key={category.label} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-slate-800">
                  {category.label}
                </span>
                <span className="shrink-0 text-[13px] font-black text-slate-600">
                  {inr(category.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Daily Spend */}
      <SectionHeader title="Daily spend" />
      <div className="px-5">
        <div className="premium-card px-4 pb-4 pt-5 border border-slate-200/80">
          <div className="flex h-32 items-end gap-2">
            {daily.map((entry) => (
              <div
                key={entry.day}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[10px] font-bold text-slate-400">
                  {Math.round(entry.amount / 100) / 10}k
                </span>
                <span
                  className="block w-full rounded-t-xl premium-gradient"
                  style={{ height: `${Math.round((entry.amount / maxDaily) * 92)}px` }}
                />
                <span className="text-[11px] font-semibold text-slate-600">
                  {entry.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter Chips & Expense Log */}
      <SectionHeader
        title="Expense log"
        action="View all"
        onAction={() => onSelect("expenses-log")}
      />
      
      {/* Filter Chips in 3D tactile pattern */}
      <div className="flex gap-2 px-5 pb-2 overflow-x-auto no-scrollbar">
        {["All", "Stay", "Transport", "Food", "Tickets", "Shopping"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer active:scale-95 ${
              selectedCategoryFilter === cat
                ? "btn-3d-primary text-white shadow-[0_4px_12px_rgba(2,132,199,0.3)]"
                : "bg-white border border-slate-200/90 text-slate-700 shadow-xs hover:bg-slate-50 hover:border-sky-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3 px-5">
        {filteredLog.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect("expenses-log")}
            className="premium-card flex w-full items-center gap-3 px-4 py-3 text-left border border-slate-200/80 hover:border-pink-300 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 font-bold border border-pink-100 shadow-xs">
              <Receipt className="h-6 w-6 drop-shadow-[0_2px_4px_rgba(236,72,153,0.25)]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-bold text-slate-900">
                {entry.title}
              </span>
              <span className="block truncate text-[12px] font-medium text-slate-500">
                {entry.category} · Paid by {entry.payer} · {entry.date}
              </span>
            </span>
            <span className="shrink-0 text-[15px] font-black text-slate-900">
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
          onClick={() => setShowAddForm(true)}
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
          label="Expenses & budget alerts"
          caption="Warn me when a category crosses its limit"
          tone="pink"
          onClick={() => onSelect("expenses-budget-alerts")}
        />
      </div>
    </div>
  );
};

