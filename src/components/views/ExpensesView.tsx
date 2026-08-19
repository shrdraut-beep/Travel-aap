import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Receipt, Trash2, Edit2, Filter, ArrowUp, ArrowDown, Mic, MicOff, Loader2, Fuel, Bot } from 'lucide-react';
import { Expense, Member, Category } from '../../types';
import { SmartExpenseScannerModal } from '../modals/SmartExpenseScannerModal';
import { formatDate, formatCurrency } from '../../utils';

interface ExpensesViewProps {
  expenses: Expense[];
  members: Member[];
  currencySymbol: string;
  onAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
  onEditExpense?: (expense: Expense) => void;
  lang: string;
  t: (key: string) => string;
  adminId: string;
  themeColor?: string;
  onOpenFuelCalculator?: () => void;
  onAddDetectedExpense?: (exp: Partial<Expense>) => void;
}

const categoryIcons: Record<string, string> = {
  'food': '🍲',
  'transport': '🚗',
  'hotels': '🏨',
  'tickets': '🎫',
  'shopping': '🛍️',
  'other': '📦',
  'restaurant': '🍽️',
  'fuel': '⛽',
  'fun': '🎡',
  'highway': '🛣️',
  'personal': '👤',
  'tips': '💵'
};

const categoryColors: Record<string, string> = {
  'food': 'bg-orange-50 text-orange-600 border-orange-100',
  'transport': 'bg-blue-50 text-blue-600 border-blue-100',
  'hotels': 'bg-purple-50 text-purple-600 border-purple-100',
  'tickets': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'shopping': 'bg-rose-50 text-rose-600 border-rose-100',
  'other': 'bg-slate-50 text-slate-800 border-slate-100',
  'restaurant': 'bg-amber-50 text-amber-600 border-amber-100',
  'fuel': 'bg-cyan-50 text-cyan-600 border-cyan-100',
  'fun': 'bg-pink-50 text-pink-600 border-pink-100',
  'highway': 'bg-stone-50 text-stone-600 border-stone-100',
  'personal': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  'tips': 'bg-yellow-50 text-yellow-600 border-yellow-100'
};

export const ExpensesView: React.FC<ExpensesViewProps> = ({ 
  expenses, 
  members, 
  currencySymbol, 
  onAddExpense, 
  onDeleteExpense, 
  onEditExpense,
  lang,
  t: propT,
  adminId,
  themeColor = '#6366f1',
  onOpenFuelCalculator,
  onAddDetectedExpense
}) => {
  const [filterPayer, setFilterPayer] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category' | 'payer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const t = (key: string) => {
    if (propT) {
      const res = propT(key);
      if (res && res !== key) return res;
    }
    const localTranslations: any = {
      'mr': {
        'expensesTab': 'खर्चाची यादी',
        'noExpenses': 'अद्याप कोणताही खर्च नाही',
        'paidBy': 'कोणी दिले',
        'category': 'प्रकार',
        'food': 'जेवण',
        'transport': 'प्रवास',
        'hotels': 'राहणे',
        'tickets': 'तिकीट',
        'shopping': 'खरेदी',
        'other': 'इतर',
        'restaurant': 'हॉटेल',
        'fuel': 'इंधन',
        'fun': 'मजा',
        'highway': 'हायवे'
      },
      'en': {
        'expensesTab': 'Expense List',
        'noExpenses': 'No expenses yet',
        'paidBy': 'Paid by',
        'category': 'Category',
        'food': 'Food',
        'transport': 'Transport',
        'hotels': 'Stay',
        'tickets': 'Tickets',
        'shopping': 'Shopping',
        'other': 'Misc',
        'restaurant': 'Restaurant',
        'fuel': 'Fuel',
        'fun': 'Fun',
        'highway': 'Highway'
      }
    };
    return localTranslations[lang]?.[key] || localTranslations['mr']?.[key] || localTranslations['en']?.[key] || key;
  };


  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown';
  const getMemberColor = (id: string) => members.find(m => m.id === id)?.color || '#64748b';

  const categories = ['food', 'transport', 'hotels', 'tickets', 'shopping', 'other', 'restaurant', 'fuel', 'fun', 'highway'];

  const filteredExpenses = (expenses || [])
    .filter(exp => (filterPayer === 'all' || exp.paidBy === filterPayer))
    .filter(exp => (filterCategory === 'all' || exp.category === filterCategory))
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortBy === 'amount') comparison = a.amount - b.amount;
      else if (sortBy === 'category') comparison = a.category.localeCompare(b.category);
      else if (sortBy === 'payer') comparison = getMemberName(a.paidBy).localeCompare(getMemberName(b.paidBy));
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="px-5 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {t('expensesTab')}
        </h2>
        <div className="flex items-center gap-2">
           <div className="bg-slate-100 px-3 py-1 rounded-lg">
             <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
               {expenses.length}
             </span>
           </div>
           <button 
             onClick={() => setShowFilters(!showFilters)}
             className={`p-2 rounded-xl transition-all border ${showFilters ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border-slate-200'}`}
           >
             <Filter className="w-4 h-4" />
           </button>
        </div>
      </div>

      {showFilters && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 overflow-hidden"
        >
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{lang === 'mr' ? 'क्रमवारी' : 'Sort By'}</label>
            <div className="flex flex-wrap gap-2">
              {(['date', 'amount', 'category', 'payer'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => {
                    if (sortBy === s) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(s);
                      setSortOrder('desc'); // Reset to default when changing sort type
                    }
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${sortBy === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  <span>
                  {s === 'date' ? (lang === 'mr' ? 'दिनांक' : 'Date') : 
                   s === 'amount' ? (lang === 'mr' ? 'रक्कम' : 'Amount') : 
                   s === 'category' ? (lang === 'mr' ? 'प्रकार' : 'Category') : 
                   (lang === 'mr' ? 'व्यक्ती' : 'Payer')}
                  </span>
                  {sortBy === s && (
                    sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{lang === 'mr' ? 'व्यक्तीनुसार' : 'By Person'}</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterPayer('all')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterPayer === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                {lang === 'mr' ? 'सर्व' : 'All'}
              </button>
              {members.map((m, idx) => (
                <button
                  key={`${m.id}-${idx}`}
                  onClick={() => setFilterPayer(m.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterPayer === m.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{lang === 'mr' ? 'प्रकारानुसार' : 'By Category'}</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                {lang === 'mr' ? 'सर्व' : 'All'}
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterCategory === cat ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Legend */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 py-2 -mx-4 px-4">
        {categories.map(cat => (
          <div key={cat} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shrink-0 ${categoryColors[cat as Category] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
            <span className="text-sm leading-none">{categoryIcons[cat as Category]}</span>
            <span className="text-sm font-black uppercase tracking-wider">{t(cat) || cat}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredExpenses.length === 0 ? (
            <motion.div 
              key="empty-expenses"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4 shadow-sm"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                <Receipt className="w-8 h-8 text-indigo-200" />
              </div>
              <p className="text-indigo-600 font-medium">{t('noExpenses')}</p>
            </motion.div>
          ) : (
            filteredExpenses.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ 
                  duration: 0.32, 
                  delay: Math.min(idx * 0.04, 0.3),
                  ease: [0.16, 1, 0.3, 1]
                }}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-xl shadow-inner border shrink-0 ${categoryColors[exp.category] || 'bg-indigo-50 border-slate-100/50'}`}>
                    {categoryIcons[exp.category] || '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[18px] font-black text-slate-800 truncate leading-tight mb-1">
                      {exp.title}
                      {exp.receiptImage && <Receipt className="inline-block w-4 h-4 ml-2 text-indigo-400" />}
                    </h4>
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <span className="text-sm font-black uppercase tracking-wider text-slate-800">
                        {getMemberName(exp.paidBy)}
                      </span>
                      <span className="text-slate-800 font-bold">•</span>
                      <span className="text-sm font-black uppercase tracking-wide">
                        {formatDate(exp.date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[17px] font-black text-slate-800 leading-none">{formatCurrency(exp.amount)}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEditExpense && onEditExpense(exp)}
                      className="p-1 text-slate-700 hover:text-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1 text-slate-700 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-24 right-5 flex flex-col items-center gap-2.5 z-40">
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          title={lang === 'mr' ? 'स्मार्ट स्कॅनर' : 'Smart Scanner'}
          className="w-10 h-10 rounded-full bg-slate-900 text-indigo-400 shadow-md hover:bg-slate-800 flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-indigo-500/30"
        >
          <Bot className="w-5 h-5" />
        </button>


      </div>

      {showScanner && (
        <SmartExpenseScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onAddDetectedExpense={(exp) => {
            if (onAddDetectedExpense) onAddDetectedExpense(exp);
          }}
          lang={lang}
          themeColor={themeColor}
        />
      )}
    </div>
  );
};
