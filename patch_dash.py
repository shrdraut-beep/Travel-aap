import re

with open("src/components/views/DashboardView.tsx", "r") as f:
    content = f.read()

# Replace the buttons block
replace_target = """
        {/* PROMINENT PRIMARY ACTION BUTTONS: ADD EXPENSE & ADD DEPOSIT */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full mt-1">
          <button 
            onClick={() => onNavigate('expenses')}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-xs font-black uppercase tracking-tight truncate">
              {lang === 'mr' ? 'खर्च जोडा' : 'Add Expense'}
            </span>
          </button>
          <button 
            onClick={() => {
              if (onAddDeposit) onAddDeposit();
              else window.dispatchEvent(new CustomEvent('open-deposit-modal'));
            }}
            className="flex items-center justify-center gap-2 p-3 bg-emerald hover:bg-emerald/90 text-white rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0">
              <Wallet className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-black uppercase tracking-tight truncate">
              {lang === 'mr' ? 'जमा करा' : lang === 'hi' ? 'जमा करें' : 'Add Deposit'}
            </span>
          </button>
          {trip.status !== 'SETTLED' ? (
            currentUser?.id === trip.adminId ? (
              <button 
                onClick={() => { setSettleClickCount(0); setShowSettleModal(true); }}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 p-3 bg-coral hover:bg-coral/90 text-white rounded-2xl shadow-lg active:scale-95 transition-all cursor-pointer font-extrabold"
              >
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-tight truncate">
                  {t('settleTrip')}
                </span>
              </button>
            ) : null
          ) : (
            <button 
              onClick={handleReopenTrip}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-2xl shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-tight truncate">
                {t('reopenTrip')}
              </span>
            </button>
          )}
        </div>
"""

replace_with = """
        {/* PROMINENT PRIMARY ACTION BUTTONS: ADD EXPENSE & ADD DEPOSIT REMOVED */}
        <div className="w-full mt-1">
          {trip.status !== 'SETTLED' ? (
            currentUser?.id === trip.adminId ? (
              <button 
                onClick={() => { setSettleClickCount(0); setShowSettleModal(true); }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-coral hover:bg-coral/90 text-white rounded-2xl shadow-lg active:scale-95 transition-all cursor-pointer font-extrabold"
              >
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-tight truncate">
                  {t('settleTrip')}
                </span>
              </button>
            ) : null
          ) : (
            <button 
              onClick={handleReopenTrip}
              className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-2xl shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-tight truncate">
                {t('reopenTrip')}
              </span>
            </button>
          )}
        </div>
"""

if replace_target.strip() in content:
    content = content.replace(replace_target.strip(), replace_with.strip())
else:
    print("Could not find the target block in DashboardView")

with open("src/components/views/DashboardView.tsx", "w") as f:
    f.write(content)

