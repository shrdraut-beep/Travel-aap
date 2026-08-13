import React, { useRef, useState, useMemo } from "react";
import { TopBar, useScrolled, LogoName } from "./SharedUI";
import { ExpensesTabContainer } from "../views/ExpensesTabContainer";
import { useTripContext } from "../../context/TripContext";
import { translations } from "../../translations";
import { calculateSettlements } from "../../utils";
import { Expense, Deposit, Member, Category } from "../../types";
import { UpiQrModal } from "../UpiQrModal";
import { X, Plus, Receipt, IndianRupee } from "lucide-react";
import { TopBannerCarousel } from "../common/TopBannerCarousel";
import { OffersForYouSection } from "../common/OffersForYouSection";

interface KharchScreenProps {
  onLogout: () => void;
  onSOS?: () => void;
  onOpenSettings?: () => void;
}

export function KharchScreen({ onLogout, onSOS, onOpenSettings }: KharchScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(scrollRef);
  const { activeTrip, updateActiveTrip } = useTripContext();

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddDepositOpen, setIsAddDepositOpen] = useState(false);
  const [selectedUpiMember, setSelectedUpiMember] = useState<{ member: Member; amount: number } | null>(null);

  // New Expense Form State
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [paidBy, setPaidBy] = useState(activeTrip.members[0]?.id || "m1");
  const [splitWith, setSplitWith] = useState<string[]>(activeTrip.members.map(m => m.id));

  // New Deposit Form State
  const [depMemberId, setDepMemberId] = useState(activeTrip.members[0]?.id || "m1");
  const [depAmount, setDepAmount] = useState("");
  const [depNote, setDepNote] = useState("Pool Deposit");

  const settlements = useMemo(() => {
    return calculateSettlements(
      activeTrip.members || [],
      activeTrip.expenses || [],
      activeTrip.deposits || [],
      activeTrip.adminId,
      activeTrip.calculationMode || "admin_pooled"
    );
  }, [activeTrip]);

  const poolBalance = useMemo(() => {
    const totalDeposits = (activeTrip.deposits || []).reduce((acc, d) => acc + d.amount, 0);
    const totalExpenses = (activeTrip.expenses || []).reduce((acc, e) => acc + e.amount, 0);
    return Math.max(0, totalDeposits - totalExpenses);
  }, [activeTrip]);

  const t = (key: string) => translations["en"]?.[key] || key;

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid title and amount!");
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title,
      amount: parsedAmount,
      category,
      paidBy: paidBy || activeTrip.members[0]?.id || "m1",
      splitWith: splitWith.length > 0 ? splitWith : activeTrip.members.map(m => m.id),
      date: new Date().toISOString().substring(0, 10)
    };

    updateActiveTrip({
      ...activeTrip,
      expenses: [newExpense, ...(activeTrip.expenses || [])]
    });

    setTitle("");
    setAmount("");
    setIsAddExpenseOpen(false);
  };

  const handleAddDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(depAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid deposit amount!");
      return;
    }

    const newDeposit: Deposit = {
      id: `dep-${Date.now()}`,
      memberId: depMemberId,
      amount: parsedAmount,
      date: new Date().toISOString().substring(0, 10),
      note: depNote || "Pool Deposit"
    };

    updateActiveTrip({
      ...activeTrip,
      deposits: [...(activeTrip.deposits || []), newDeposit]
    });

    setDepAmount("");
    setIsAddDepositOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    updateActiveTrip({
      ...activeTrip,
      expenses: (activeTrip.expenses || []).filter(e => e.id !== id)
    });
  };

  const handlePayUPI = (memberId: string, amt: number) => {
    const mem = activeTrip.members.find(m => m.id === memberId);
    if (mem) {
      setSelectedUpiMember({
        member: mem,
        amount: amt
      });
    }
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50 relative">
      <TopBar title={<LogoName />} sub="Expenses & Settlement" scrolled={scrolled} onLogout={onLogout} onSOS={onSOS || (() => alert("SOS Triggered!"))} onOpenSettings={onOpenSettings} />

      <div className="px-4 mt-2">
        <TopBannerCarousel tab="expenses" />
      </div>

      <div className="mt-1">
        <ExpensesTabContainer
          trip={activeTrip}
          lang="en"
          t={t}
          currencySymbol="₹"
          adminId={activeTrip.adminId || "m1"}
          balances={settlements.balances}
          transfers={settlements.transfers}
          poolBalance={poolBalance}
          onAddExpense={() => setIsAddExpenseOpen(true)}
          onDeleteExpense={handleDeleteExpense}
          onEditExpense={() => {}}
          onAddDeposit={() => setIsAddDepositOpen(true)}
          onAddMember={() => {}}
          onUpdateMemberAvatar={() => {}}
          onUpdateMemberUPI={() => {}}
          onPayUPI={handlePayUPI}
          onShareRequest={(id, amt) => alert(`Share request link created for ₹${amt}`)}
          onUpdateTrip={updateActiveTrip}
        />
      </div>

      <div className="px-4 my-4">
        <OffersForYouSection tab="expenses" />
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-slate-900 text-base">Add New Expense</h3>
              </div>
              <button onClick={() => setIsAddExpenseOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Expense Title</label>
                <input
                  type="text"
                  placeholder="e.g., Hotel Advance, Dinner, Taxi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="food">Food & Dining 🍲</option>
                  <option value="transport">Travel & Transport 🚗</option>
                  <option value="hotels">Hotels & Stay 🏨</option>
                  <option value="tickets">Tickets & Sightseeing 🎫</option>
                  <option value="shopping">Shopping 🛍️</option>
                  <option value="other">Other Expenses 📦</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Paid By</label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {activeTrip.members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Split With</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {activeTrip.members.map(m => {
                    const isChecked = splitWith.includes(m.id);
                    return (
                      <label key={m.id} className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSplitWith([...splitWith, m.id]);
                            else setSplitWith(splitWith.filter(id => id !== m.id));
                          }}
                          className="accent-rose-600 rounded"
                        />
                        <span>{m.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 transition-colors"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Deposit Modal */}
      {isAddDepositOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">Add Pool Deposit</h3>
              </div>
              <button onClick={() => setIsAddDepositOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDepositSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Member</label>
                <select
                  value={depMemberId}
                  onChange={(e) => setDepMemberId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {activeTrip.members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deposit Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={depAmount}
                  onChange={(e) => setDepAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Note</label>
                <input
                  type="text"
                  placeholder="e.g., Pool Deposit, Advance contribution"
                  value={depNote}
                  onChange={(e) => setDepNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDepositOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPI Modal */}
      {selectedUpiMember && (
        <UpiQrModal
          member={selectedUpiMember.member}
          amount={selectedUpiMember.amount}
          currencySymbol="₹"
          lang="en"
          t={t}
          onClose={() => setSelectedUpiMember(null)}
        />
      )}
    </div>
  );
}
