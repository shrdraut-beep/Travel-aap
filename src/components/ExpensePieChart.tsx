import React, { useState } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Expense } from '../types';

interface ExpensePieChartProps {
  expenses: Expense[];
  currencySymbol: string;
  lang: string;
}

const CATEGORY_META: Record<string, { labelMr: string; labelEn: string; icon: string; color: string }> = {
  'food': { labelMr: 'जेवण (Food)', labelEn: 'Food', icon: '🍲', color: '#f97316' },
  'transport': { labelMr: 'प्रवास (Transport)', labelEn: 'Transport', icon: '🚗', color: '#3b82f6' },
  'hotels': { labelMr: 'हॉटेल / स्टे (Hotel)', labelEn: 'Hotel/Stay', icon: '🏨', color: '#a855f7' },
  'tickets': { labelMr: 'तिकिटे (Tickets)', labelEn: 'Tickets', icon: '🎫', color: '#10b981' },
  'shopping': { labelMr: 'खरेदी (Shopping)', labelEn: 'Shopping', icon: '🛍️', color: '#f43f5e' },
  'fuel': { labelMr: 'इंधन (Fuel)', labelEn: 'Fuel', icon: '⛽', color: '#06b6d4' },
  'restaurant': { labelMr: 'रेस्टॉरंट (Restaurant)', labelEn: 'Restaurant', icon: '🍽️', color: '#f59e0b' },
  'fun': { labelMr: 'मज्जा / ऍक्टिव्हिटी (Activities)', labelEn: 'Activities', icon: '🎡', color: '#ec4899' },
  'highway': { labelMr: 'हायवे / टोल (Toll)', labelEn: 'Toll/Highway', icon: '🛣️', color: '#78716c' },
  'other': { labelMr: 'इतर (Misc)', labelEn: 'Misc', icon: '📦', color: '#64748b' }
};

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenses, currencySymbol, lang }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalSpent = (expenses || []).reduce((sum, e) => sum + e.amount, 0);

  // Group expenses by category
  const categoryTotals = (expenses || []).reduce<Record<string, number>>((acc, exp) => {
    const cat = exp.category || 'other';
    acc[cat] = (acc[cat] || 0) + exp.amount;
    return acc;
  }, {});

  const chartData = Object.entries(categoryTotals)
    .map(([catKey, amount]) => {
      const meta = CATEGORY_META[catKey] || CATEGORY_META['other'];
      const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
      return {
        name: lang === 'mr' ? meta.labelMr : meta.labelEn,
        rawCategory: catKey,
        amount,
        percentage,
        color: meta.color,
        icon: meta.icon
      };
    })
    .sort((a, b) => b.amount - a.amount);

  if (!expenses || expenses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-5 shadow-lg border border-slate-200/80 mb-5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              {lang === 'mr' ? 'खर्चाचा पाय चार्ट' : 'Expense Pie Chart'}
            </h3>
            <p className="text-[11px] font-bold text-slate-500">
              {lang === 'mr' ? 'प्रकारानुसार खर्चाचे वर्गीकरण' : 'Category-wise spending breakdown'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          title={isCollapsed ? 'Show Chart' : 'Hide Chart'}
        >
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-4">
          {/* Chart Container */}
          <div className="relative h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="amount"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="transition-all duration-300 cursor-pointer hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${currencySymbol}${new Intl.NumberFormat('en-IN').format(Number(value))}`, 'रक्कम']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {lang === 'mr' ? 'एकूण' : 'Total'}
              </span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {currencySymbol}{new Intl.NumberFormat('en-IN').format(totalSpent)}
              </span>
            </div>
          </div>

          {/* Category Breakdown Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {chartData.map((item, idx) => (
              <div
                key={item.rawCategory}
                className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                  activeIndex === idx ? 'bg-indigo-50/80 border-indigo-300 shadow-sm scale-[1.02]' : 'bg-slate-50/70 border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 leading-snug">
                      {item.name}
                    </p>
                    <p className="text-[10px] font-extrabold text-slate-500 font-mono mt-0.5">
                      {currencySymbol}{new Intl.NumberFormat('en-IN').format(item.amount)}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200 shadow-2xs shrink-0 font-mono">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
