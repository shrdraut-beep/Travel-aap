import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

# I will replace the "Header Title Card / Smart AI Planner" block with the new grid and AI Manager card.
new_block = """
        {/* Budget Grid & AI Manager */}
        <div className="px-5 pt-4 pb-2 space-y-4">
          
          {/* Budget Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Budget */}
            <div className="bg-sky-50/60 p-4 rounded-3xl border border-sky-100 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-sky-600 mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">TOTAL BUDGET</span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                ₹{currentTrip.totalBudget || 0}
              </div>
              <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mt-3">
                TRIP BUDGET
              </div>
            </div>
            {/* Total Expense */}
            <div className="bg-rose-50/60 p-4 rounded-3xl border border-rose-100 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-rose-600 mb-3">
                <TrendingDown className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">TOTAL EXPENSE</span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                ₹{(currentTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0)}
              </div>
              <div className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-3">
                SPENT SO FAR
              </div>
            </div>
            {/* Total Balance */}
            <div className="bg-emerald-50/60 p-4 rounded-3xl border border-emerald-100 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-3">
                <Wallet className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">TOTAL BALANCE</span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                ₹{(currentTrip.totalBudget || 0) - (currentTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0)}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-3">
                AVAILABLE BALANCE
              </div>
            </div>
            {/* Expense Ratio */}
            <div className="bg-purple-50/60 p-4 rounded-3xl border border-purple-100 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-2 w-full text-left">EXPENSE RATIO</span>
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-purple-100" />
                  <circle cx="32" cy="32" r="28" stroke="#a855f7" strokeWidth="5" fill="transparent" strokeDasharray="175.9" strokeDashoffset={175.9 - (Math.min(((currentTrip.totalBudget ? (currentTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0) / currentTrip.totalBudget : 0) * 100), 100) / 100) * 175.9} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-slate-800">{Math.round(currentTrip.totalBudget ? ((currentTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0) / currentTrip.totalBudget) * 100 : 0)}%</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">USED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Spending Status Pill */}
          <div className={`py-2.5 rounded-2xl border flex items-center justify-center font-black text-xs tracking-widest uppercase ${(currentTrip.totalBudget ? ((currentTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0) / currentTrip.totalBudget) * 100 : 0) <= 85 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            SPENDING IS {(currentTrip.totalBudget ? ((currentTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0) / currentTrip.totalBudget) * 100 : 0) <= 85 ? 'SAFE' : 'OVER BUDGET'}.
          </div>

          {/* AI TRIP MANAGER HEADER */}
          <div className="flex items-center justify-between pt-2">
            <h3 className="font-black text-slate-800 tracking-widest uppercase text-sm">AITRIPMANAGER</h3>
            <button onClick={onOpenPlanner} className="px-3 py-1.5 bg-rose-400 hover:bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider transition-all">
              <Sparkles className="w-3 h-3" /> Chat with Manager
            </button>
          </div>

          {/* AI Manager Card */}
          <div className="bg-gradient-to-r from-rose-100/50 to-orange-100/50 p-4 rounded-3xl border border-rose-200/50 flex items-center justify-between cursor-pointer" onClick={onOpenPlanner}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-2xl shadow-lg">🎩</div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Daily Morning Briefing & Manager</h4>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </div>
"""

pattern = r'\{\/\* Header Title Card \/ Smart AI Planner \*\/\}.*?(?=\{\/\* Planner Category Sub-Nav Pill Bar)'
content = re.sub(pattern, new_block, content, flags=re.DOTALL)

# Let's ensure ShieldCheck is imported
if 'ShieldCheck' not in content:
    content = content.replace('import { \n  Plus,', 'import { \n  Plus,\n  ShieldCheck,')

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)
print("Updated PlanningScreen.tsx")
