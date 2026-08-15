import re

with open("src/components/views/DashboardView.tsx", "r") as f:
    content = f.read()

# I will find the grid and replace the first two buttons
pattern = r'<div className="grid grid-cols-2 sm:grid-cols-3 gap-2\.5 w-full mt-1">.*?<button\s*onClick=\{handleReopenTrip\}.*?</button>\s*\)}.*?</div>'
match = re.search(pattern, content, re.DOTALL)

if match:
    replacement = """<div className="w-full mt-1">
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
        </div>"""
    content = content.replace(match.group(0), replacement)
    with open("src/components/views/DashboardView.tsx", "w") as f:
        f.write(content)
    print("Replaced!")
else:
    print("Not found")

