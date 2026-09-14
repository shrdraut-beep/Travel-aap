import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpensesView } from './ExpensesView';
import { BalancesView } from './BalancesView';
import { TripGroup, Expense, Member } from '../../types';
import { Wallet, PieChart, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { ExpensePieChart } from '../ExpensePieChart';
import { PDFLayoutWrapper } from '../pdf/PDFLayoutWrapper';
import { TripRecap } from '../TripRecap';
import { exportToExcel } from '../../utils/excelUtils';

interface ExpensesTabContainerProps {
  trip: TripGroup;
  lang: string;
  t: (key: string) => string;
  currencySymbol: string;
  adminId: string;
  balances: any;
  transfers: any;
  poolBalance: number;
  initialSubTab?: 'expenses' | 'settlement';
  onAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
  onAddDeposit: () => void;
  onAddMember: () => void;
  onUpdateMemberAvatar: (id: string, url: string) => void;
  onUpdateMemberUPI: (id: string, upiId: string) => void;
  onPayUPI: (id: string, amount: number) => void;
  onShareRequest: (id: string, amount: number) => void;
  onEditDeposit?: (memberId: string) => void;
  onUpdateTrip?: (updatedTrip: TripGroup) => void;
  onOpenFuelCalculator?: () => void;
  onExportPDF?: () => void;
}

export const ExpensesTabContainer: React.FC<ExpensesTabContainerProps> = ({
  trip, lang, t, currencySymbol, adminId, balances, transfers, poolBalance, initialSubTab,
  onAddExpense, onDeleteExpense, onEditExpense,
  onAddDeposit, onEditDeposit, onAddMember, onUpdateMemberAvatar, onUpdateMemberUPI, onPayUPI, onShareRequest,
  onUpdateTrip, onOpenFuelCalculator, onExportPDF
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'settlement'>(initialSubTab || 'expenses');

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  React.useEffect(() => {
    const handleSwitchTab = (e: any) => {
      // Map 'balances' to 'settlement' as there is no balances tab
      if (e.detail === 'balances') setActiveSubTab('settlement');
      else setActiveSubTab(e.detail);
    };
    window.addEventListener('switch-expense-tab', handleSwitchTab);
    return () => window.removeEventListener('switch-expense-tab', handleSwitchTab);
  }, []);

  const themeColor = trip.themeColor || '#6366f1';

  // Calculate Budget usage
  const totalSpent = (trip.expenses || []).reduce((acc, exp) => acc + exp.amount, 0);
  const totalDeposited = (trip.deposits || []).reduce((acc, dep) => acc + dep.amount, 0);
  
  let budgetBase = 0;
  if (trip.calculationMode === 'admin_pooled') {
    budgetBase = totalDeposited;
  } else {
    budgetBase = trip.totalBudget || 0;
  }
  
  const rawPercent = budgetBase > 0 ? (totalSpent / budgetBase) * 100 : 0;
  const percentDisplay = Math.round(rawPercent);
  const ringPercent = Math.min(rawPercent, 100);
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ringPercent / 100) * circumference;
  
  // Decide color based on percent
  let ringColor = "#10b981"; // pink
  if (rawPercent > 75 && rawPercent <= 100) ringColor = "#f59e0b"; // orange
  if (rawPercent > 100) ringColor = "#ef4444"; // red

  const memberCount = Math.max(1, (trip.members || []).length);
  const avgCostPerPerson = Math.round(totalSpent / memberCount);

  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!trip.expenses || trip.expenses.length === 0) {
      alert(lang === 'mr' ? 'डाऊनलोड करण्यासाठी कोणताही खर्च आढळला नाही.' : 'No expenses available to export.');
      return;
    }
    if (!pdfRef.current) return;
    setIsExportingPDF(true);
    try {
      const { exportElementToPdf } = await import('../../utils/exportUtils');
      await exportElementToPdf(pdfRef.current, `${trip.name.replace(/\s+/g, '_')}_Report.pdf`);
    } catch (e) {
      console.error(e);
      alert('Failed to export PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    if (!trip.expenses || trip.expenses.length === 0) {
      alert('No expenses available to export.');
      return;
    }

    const reportRows = trip.expenses.map((exp, index) => {
      const payerName = trip.members.find(m => m.id === exp.paidBy)?.name || 'Unknown';
      const splitNames = (exp.splitWith || [])
        .map(id => trip.members.find(m => m.id === id)?.name || 'Unknown')
        .join(', ');

      return {
        srNo: index + 1,
        date: exp.date ? exp.date.substring(0, 10) : '',
        title: exp.title,
        category: exp.category,
        amount: exp.amount,
        paidBy: payerName,
        splitWith: splitNames
      };
    });

    const columns = [
      { header: 'Sr. No', key: 'srNo', width: 10 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Paid By', key: 'paidBy', width: 18 },
      { header: 'Split With', key: 'splitWith', width: 30 }
    ];

    const filename = `${trip.name.replace(/\s+/g, '_')}_Expenses.xlsx`;
    await exportToExcel(filename, 'Trip Expenses', columns, reportRows);
  };


  const handleAddDetectedExpense = (partialExp: Partial<Expense>) => {
    if (onUpdateTrip && trip) {
      const newExpense: Expense = {
        id: Date.now().toString(),
        title: partialExp.title || 'Auto-Detected Expense',
        amount: partialExp.amount || 0,
        date: partialExp.date || new Date().toISOString(),
        category: partialExp.category || 'other' as any,
        paidBy: adminId,
        splitWith: trip.members.map(m => m.id)
      };
      const updatedTrip = {
        ...trip,
        expenses: [newExpense, ...(trip.expenses || [])]
      };
      onUpdateTrip(updatedTrip);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto no-scrollbar pb-32 flex-1">
      {/* Dynamic Pinned Top Summary Card */}
      
      
      {/* Dynamic Pinned Top Summary Card */}
      <div className="px-2 pt-1 mb-2">
        <div className="bg-white rounded-[28px] p-3 shadow-sm border border-slate-100 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 block">
                Total Trip Expense
              </span>
              <h2 className="text-3xl font-black text-slate-950 font-mono tracking-tight" style={{ color: themeColor }}>
                {currencySymbol}{new Intl.NumberFormat('en-IN').format(totalSpent)}
              </h2>
            </div>
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="7"
                  fill="transparent"
                  className="text-slate-100"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke={ringColor}
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-sm font-black ${rawPercent > 100 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {budgetBase > 0 ? `${percentDisplay}%` : 'N/A'}
                </span>
                <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">
                  Budget
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-transparent border border-slate-200 rounded-[20px]">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest block">
                Avg Per Person
              </span>
              <span className="text-base font-black text-premium-violet font-mono block my-0.5">
                {currencySymbol}{new Intl.NumberFormat('en-IN').format(avgCostPerPerson)}
              </span>
              <span className="text-[10px] font-extrabold text-slate-700 block">
                ({memberCount} members)
              </span>
            </div>
            <div className="p-3 bg-transparent border border-slate-200 rounded-[20px]">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest block">
                Total Budget
              </span>
              <span className="text-base font-black text-slate-950 font-mono block my-0.5">
                {currencySymbol}{new Intl.NumberFormat('en-IN').format(budgetBase)}
              </span>
              {totalSpent > budgetBase ? (
                <span className="text-[10px] font-black text-rose-600 block">
                  Deficit: {currencySymbol}{new Intl.NumberFormat('en-IN').format(totalSpent - budgetBase)}
                </span>
              ) : (
                <span className="text-[10px] font-black text-premium-sky-deep block">
                  Left: {currencySymbol}{new Intl.NumberFormat('en-IN').format(budgetBase - totalSpent)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
{/* Sub Tabs - High Contrast & Bold Text Visibility Fix */}
      <div className="px-5 mb-3">
        <div className="flex bg-slate-200/90 p-1.5 rounded-[22px] border border-slate-300/80 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveSubTab('expenses')}
            className={`flex-1 py-2.5 px-3 rounded-[18px] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'expenses'
                ? 'bg-slate-900 text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] ring-1 ring-slate-800'
                : 'bg-white text-slate-800 hover:bg-slate-100 shadow-2xs border border-slate-200/80'
            }`}
          >
            <Wallet className={`w-4 h-4 shrink-0 ${activeSubTab === 'expenses' ? 'text-premium-violet' : 'text-slate-800'}`} />
            <span className={activeSubTab === 'expenses' ? 'text-white font-extrabold' : 'text-slate-800 font-extrabold'}>
              Expenses
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('settlement')}
            className={`flex-1 py-2.5 px-3 rounded-[18px] text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'settlement'
                ? 'bg-slate-900 text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] ring-1 ring-slate-800'
                : 'bg-white text-slate-800 hover:bg-slate-100 shadow-2xs border border-slate-200/80'
            }`}
          >
            <PieChart className={`w-4 h-4 shrink-0 ${activeSubTab === 'settlement' ? 'text-premium-violet' : 'text-slate-800'}`} />
            <span className={activeSubTab === 'settlement' ? 'text-white font-extrabold' : 'text-slate-800 font-extrabold'}>
              Settlement
            </span>
          </button>
        </div>
      </div>

      {/* Export Report Action Bar (PDF & Excel) */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-3 rounded-[20px] border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider shrink-0 flex items-center gap-1.5 pl-1">
            <Download className="w-4 h-4 text-premium-violet" />
            Export Report:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-[16px] font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>{isExportingPDF ? 'Exporting...' : (lang === 'mr' ? 'PDF' : 'Export PDF')}</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="py-2 px-3 bg-premium-sky-soft hover:bg-premium-sky-soft text-premium-sky-deep border border-premium-sky-deep rounded-[16px] font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-premium-sky-deep" />
              <span>{lang === 'mr' ? 'Export Excel' : 'Export Excel'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expense Pie Chart */}
      {activeSubTab === 'expenses' && (
        <div className="px-5">
          <ExpensePieChart 
            expenses={trip.expenses}
            currencySymbol={currencySymbol}
            lang={lang}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          {activeSubTab === 'expenses' ? (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full pb-[130px]"
            >
              
<ExpensesView 
                onAddDetectedExpense={handleAddDetectedExpense} 
                expenses={trip.expenses}
                members={trip.members}
                currencySymbol={currencySymbol}
                onAddExpense={onAddExpense}
                onDeleteExpense={onDeleteExpense}
                onEditExpense={onEditExpense}
                lang={lang}
                t={t}
                adminId={adminId}
                themeColor={themeColor}
                onOpenFuelCalculator={onOpenFuelCalculator}
              />
            </motion.div>
          ) : (
            <motion.div
              key="settlement"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full pb-[130px]"
            >
              <BalancesView 
                members={trip.members}
                deposits={trip.deposits}
                balances={balances}
                transfers={transfers}
                adminId={adminId}
                calculationMode={trip.calculationMode}
                onAddDeposit={onAddDeposit}
                onEditDeposit={onEditDeposit}
                onAddMember={onAddMember}
                onUpdateMemberAvatar={onUpdateMemberAvatar}
                onUpdateMemberUPI={onUpdateMemberUPI}
                onPayUPI={onPayUPI}
                onShareRequest={onShareRequest}
                lang={lang}
                t={t}
                currencySymbol={currencySymbol}
                themeColor={themeColor}
                onUpdateTrip={onUpdateTrip}
                trip={trip}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        <div ref={pdfRef} className="w-[800px] bg-transparent">
          <PDFLayoutWrapper 
            tripName={trip.name} 
            tripDates={`${trip.startDate} to ${trip.endDate}`} 
            documentType="Expense & Settlement Report"
          >
             <div className="p-6 space-y-6">
                <BalancesView 
                  members={trip.members}
                  deposits={trip.deposits}
                  balances={balances}
                  transfers={transfers}
                  adminId={adminId}
                  calculationMode={trip.calculationMode}
                  onAddDeposit={() => {}}
                  onAddMember={() => {}}
                  onPayUPI={() => {}}
                  onShareRequest={() => {}}
                  currencySymbol={currencySymbol}
                  lang={lang}
                  t={t}
                  themeColor={themeColor}
                />
             </div>
          </PDFLayoutWrapper>
        </div>
      </div>
    </div>
  );
};
