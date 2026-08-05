import { ScrollView } from '../ScrollView';
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { TripGroup, Expense } from '../../types';
import { formatCurrency } from '../../utils';

interface BudgetDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripGroup;
  lang: string;
  onExportPDF?: () => void;
}

const CATEGORY_LABELS: Record<string, { mr: string, en: string }> = {
  food: { mr: 'अन्न व उपहार', en: 'Food & Dining' },
  fuel: { mr: 'इंधन / पेट्रोल', en: 'Fuel / Petrol' },
  traveling: { mr: 'प्रवास व तिकीट', en: 'Traveling & Tickets' },
  transport: { mr: 'स्थानिक वाहतूक', en: 'Local Transport' },
  hotels: { mr: 'हॉटेल व मुक्काम', en: 'Hotels & Stay' },
  fun: { mr: 'मजा व खेळ', en: 'Activities & Fun' },
  highway: { mr: 'टोल व महामार्ग', en: 'Highway & Tolls' },
  restaurant: { mr: 'रेस्टॉरंट', en: 'Restaurant' },
  tips: { mr: 'टIPS व इतर', en: 'Tips & Misc' },
  personal: { mr: 'वैयक्तिक खरेदी', en: 'Personal Shopping' },
  other: { mr: 'इतर खर्च', en: 'Other Expense' },
};

export const BudgetDashboardModal: React.FC<BudgetDashboardModalProps> = ({ isOpen, onClose, trip, lang, onExportPDF }) => {
  const isMr = lang === 'mr';
  const tableRef = useRef<HTMLDivElement>(null);
  
  // If no budget is set, provide defaults so it doesn't break
  const budget = trip.budget || {
    food: 0, fuel: 0, traveling: 0, transport: 0, hotels: 0,
    fun: 0, highway: 0, restaurant: 0, tips: 0, personal: 0, other: 0
  };
  
  // Calculate actual expenses from trip.expenses for all categories
  const actuals: Record<string, number> = {};
  
  if (trip.expenses) {
    trip.expenses.forEach(exp => {
      const cat: string = exp.category || 'other';
      actuals[cat] = (actuals[cat] || 0) + exp.amount;
    });
  }

  // Combine all categories present in budget or expenses or standard labels
  const allCategoryKeys = Array.from(new Set([
    ...Object.keys(budget),
    ...Object.keys(actuals),
    ...Object.keys(CATEGORY_LABELS)
  ])).filter(cat => (budget[cat] || 0) > 0 || (actuals[cat] || 0) > 0 || Object.keys(budget).length === 0);

  const categories = allCategoryKeys.length > 0 ? allCategoryKeys : Object.keys(CATEGORY_LABELS);
  
  const totalBudget = categories.reduce((sum, cat) => sum + (budget[cat] || 0), 0);
  const totalActual = categories.reduce((sum, cat) => sum + (actuals[cat] || 0), 0);
  const totalVariance = totalBudget - totalActual;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50">
              <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                {isMr ? 'बजेट आणि प्रत्यक्ष खर्च' : 'Budget vs Actual Expenses'}
              </h3>
              <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
                <X className="w-5 h-5 text-indigo-300" />
              </button>
            </div>

            <div className="overflow-y-auto p-6    ">
              <div ref={tableRef} className="bg-white p-4 rounded-xl">
                {/* PDF Header Branding */}
                <div className="text-center mb-6 border-b-2 border-indigo-100 pb-4">
                  <h1 className="text-2xl font-black text-indigo-900 mb-1">{trip.name}</h1>
                  <p className="text-sm font-bold text-slate-500">
                    {isMr ? 'बजेट रिपोर्ट' : 'Budget Report'} • {new Date().toLocaleDateString(isMr ? 'mr-IN' : 'en-US')}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Powered by Pravas Wataghati
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-indigo-600 text-white">
                        <th className="p-3 font-bold text-sm">{isMr ? 'वर्गवारी' : 'Category'}</th>
                        <th className="p-3 font-bold text-sm text-right">{isMr ? 'बजेट' : 'Budget'}</th>
                        <th className="p-3 font-bold text-sm text-right">{isMr ? 'प्रत्यक्ष खर्च' : 'Actual'}</th>
                        <th className="p-3 font-bold text-sm text-right">{isMr ? 'कमी / जास्त' : 'Variance'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.map(cat => {
                        const est = budget[cat] || 0;
                        const act = actuals[cat] || 0;
                        const diff = est - act;
                        const isOver = diff < 0;
                        
                        return (
                          <tr key={cat} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 text-sm font-bold text-slate-700 capitalize">
                              {CATEGORY_LABELS[cat]?.[isMr ? 'mr' : 'en'] || cat}
                            </td>
                            <td className="p-3 text-sm font-semibold text-slate-600 text-right">
                              {formatCurrency(est)}
                            </td>
                            <td className="p-3 text-sm font-semibold text-slate-600 text-right">
                              {formatCurrency(act)}
                            </td>
                            <td className={`p-3 text-sm font-bold text-right flex items-center justify-end gap-1 ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {isOver ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {formatCurrency(Math.abs(diff))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                      <tr>
                        <td className="p-3 font-black text-slate-900 text-sm">
                          {isMr ? 'एकूण (Grand Total)' : 'Grand Total'}
                        </td>
                        <td className="p-3 font-black text-indigo-700 text-sm text-right">
                          {formatCurrency(totalBudget)}
                        </td>
                        <td className="p-3 font-black text-slate-800 text-sm text-right">
                          {formatCurrency(totalActual)}
                        </td>
                        <td className={`p-3 font-black text-sm text-right ${totalVariance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatCurrency(Math.abs(totalVariance))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={onClose} className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-300 transition-colors">
                {lang === 'mr' ? 'बंद करा' : 'Close'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
