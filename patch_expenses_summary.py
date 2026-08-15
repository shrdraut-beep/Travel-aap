import re

with open("src/components/views/ExpensesTabContainer.tsx", "r") as f:
    content = f.read()

replacement = """
      {/* 4-CARD SUMMARY MATCHING DASHBOARD */}
      <div className="px-4 sm:px-5 pt-3 mb-4">
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-2">
            {/* TOTAL BUDGET */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-[20px] p-3 text-blue-950 shadow-sm border border-blue-200/60 flex flex-col justify-between h-36">
              <div className="flex items-start gap-1.5 text-blue-800/80 h-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check w-4 h-4 shrink-0 mt-0.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.92 0 4.96.94 7 2a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
                <span className="text-[10px] font-black uppercase tracking-wider leading-tight line-clamp-2">
                  {lang === 'mr' ? 'एकूण जमा / बजेट' : lang === 'hi' ? 'कुल जमा / बजट' : 'Total Budget'}
                </span>
              </div>
              <div className="flex-grow flex items-center">
                <p className="text-2xl font-black tracking-tight">
                  {currencySymbol}{new Intl.NumberFormat('en-IN').format(budgetBase)}
                </p>
              </div>
              <div className="pt-2 border-t border-blue-200 h-8 flex items-center">
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-tight opacity-90 truncate">
                  {lang === 'mr' ? 'सहल बजेट' : 'Trip Budget'}
                </p>
              </div>
            </div>
            {/* TOTAL BALANCE */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-[20px] p-3 text-teal-950 shadow-sm border border-teal-200/60 flex flex-col justify-between h-36">
              <div className="flex items-start gap-1.5 text-teal-800/80 h-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet w-4 h-4 shrink-0 mt-0.5"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
                <span className="text-[10px] font-black uppercase tracking-wider leading-tight line-clamp-2">
                  {lang === 'mr' ? 'एकूण शिल्लक' : lang === 'hi' ? 'कुल शेष' : 'Total Balance'}
                </span>
              </div>
              <div className="flex-grow flex items-center">
                <p className="text-2xl sm:text-3xl font-black tracking-tight text-teal-950 drop-shadow-sm">
                  {currencySymbol}{new Intl.NumberFormat('en-IN').format(Math.max(0, budgetBase - totalSpent))}
                </p>
              </div>
              <div className="pt-2 border-t border-teal-200 h-8 flex items-center">
                <p className="text-[10px] font-bold text-teal-800 uppercase tracking-tight opacity-95 truncate">
                  {lang === 'mr' ? 'उपलब्ध शिल्लक' : 'Available balance'}
                </p>
              </div>
            </div>
          </div>
          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-2">
            {/* TOTAL EXPENSE */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-100 rounded-[20px] p-3 text-rose-950 shadow-sm border border-rose-200/60 flex flex-col justify-between h-36">
              <div className="flex items-start gap-1.5 text-rose-800/80 h-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-down w-4 h-4 shrink-0 mt-0.5"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
                <span className="text-[10px] font-black uppercase tracking-wider leading-tight line-clamp-2">
                  {lang === 'mr' ? 'एकूण खर्च' : lang === 'hi' ? 'कुल खर्च' : 'Total Expense'}
                </span>
              </div>
              <div className="flex-grow flex items-center">
                <p className="text-2xl font-black tracking-tight">
                  {currencySymbol}{new Intl.NumberFormat('en-IN').format(totalSpent)}
                </p>
              </div>
              <div className="pt-2 border-t border-rose-200 h-8 flex items-center">
                <p className="text-[10px] font-bold text-rose-800 uppercase tracking-tight opacity-90 truncate">
                  {lang === 'mr' ? 'आत्तापर्यंतचा खर्च' : 'Spent so far'}
                </p>
              </div>
            </div>
            {/* EXPENSE RATIO */}
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-100 rounded-[20px] p-3 text-purple-950 shadow-sm border border-purple-200/60 flex flex-col items-center text-center justify-between h-36">
              <div className="h-8 flex items-start justify-center w-full">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-800/80 leading-tight line-clamp-2">
                  {lang === 'mr' ? 'खर्चाची टक्केवारी' : 'Expense Ratio'}
                </span>
              </div>
              <div className="flex-grow flex items-center justify-center w-full py-1">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-purple-200/50" />
                    <circle cx="32" cy="32" r="28" stroke={rawPercent > 80 ? '#f43f5e' : '#a855f7'} strokeWidth="6" fill="transparent" strokeDasharray={28 * 2 * Math.PI} strokeDashoffset={(28 * 2 * Math.PI) - ((rawPercent > 100 ? 100 : rawPercent) / 100) * (28 * 2 * Math.PI)} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className={`text-sm font-black ${rawPercent > 100 ? 'text-rose-600' : 'text-purple-900'}`}>
                      {budgetBase > 0 ? `${percentDisplay}%` : '0%'}
                    </span>
                    <span className="text-[8px] font-black text-purple-800 uppercase tracking-widest mt-0.5">
                      USED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
"""

pattern = r'<div className="px-4 sm:px-5 pt-3 mb-4">\s*<div className="bg-white rounded-\[28px\] p-5 shadow-xl border-2 space-y-4" style={{ borderColor: themeColor }}>.*?(?={/\* Sub Tabs)'

match = re.search(pattern, content, re.DOTALL)
if match:
    content = content.replace(match.group(0), replacement)
    with open("src/components/views/ExpensesTabContainer.tsx", "w") as f:
        f.write(content)
    print("Replaced successfully!")
else:
    print("Match failed. Could not find pattern.")

