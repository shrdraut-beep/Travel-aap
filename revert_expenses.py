import re

with open("src/components/views/ExpensesTabContainer.tsx", "r") as f:
    content = f.read()

replacement = """
      {/* Dynamic Pinned Top Summary Card */}
      <div className="px-4 sm:px-5 pt-3 mb-4">
        <div className="bg-white rounded-[28px] p-5 shadow-xl border-2 space-y-4" style={{ borderColor: themeColor }}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 block">
                {lang === 'mr' ? 'एकूण सहल खर्च' : 'Total Trip Expense'}
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
                  {lang === 'mr' ? (rawPercent > 100 ? 'अतिरिक्त' : 'बजेट') : 'Budget'}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest block">
                {lang === 'mr' ? 'प्रति व्यक्ती सरासरी' : 'Avg Per Person'}
              </span>
              <span className="text-base font-black text-indigo-900 font-mono block my-0.5">
                {currencySymbol}{new Intl.NumberFormat('en-IN').format(avgCostPerPerson)}
              </span>
              <span className="text-[10px] font-extrabold text-slate-700 block">
                ({memberCount} {lang === 'mr' ? 'सभासद' : 'members'})
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest block">
                {lang === 'mr' ? 'एकूण बजेट / जमा' : 'Total Budget'}
              </span>
              <span className="text-base font-black text-slate-950 font-mono block my-0.5">
                {currencySymbol}{new Intl.NumberFormat('en-IN').format(budgetBase)}
              </span>
              {totalSpent > budgetBase ? (
                <span className="text-[10px] font-black text-rose-600 block">
                  {lang === 'mr' ? 'अतिरिक्त खर्च:' : 'Deficit:'} {currencySymbol}{new Intl.NumberFormat('en-IN').format(totalSpent - budgetBase)}
                </span>
              ) : (
                <span className="text-[10px] font-black text-emerald-700 block">
                  {lang === 'mr' ? 'शिल्लक:' : 'Left:'} {currencySymbol}{new Intl.NumberFormat('en-IN').format(budgetBase - totalSpent)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
"""

pattern = r'\{\/\*\s*4-CARD SUMMARY MATCHING DASHBOARD\s*\*\/\}.*?(?=\{\/\*\s*Sub Tabs)'

match = re.search(pattern, content, re.DOTALL)
if match:
    content = content.replace(match.group(0), replacement)
    with open("src/components/views/ExpensesTabContainer.tsx", "w") as f:
        f.write(content)
    print("Successfully restored!")
else:
    print("Match failed")

