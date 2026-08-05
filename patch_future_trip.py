import sys

with open('src/components/modals/FutureTripModal.tsx', 'r') as f:
    content = f.read()

import_str = "import { Sparkles, Calendar, MapPin, Users, Navigation, AlertCircle, RefreshCcw, Check, ChevronRight, X, UserPlus, Car, Train, Plane, Wallet, Download, Activity, Save } from 'lucide-react';\n"
new_import_str = "import { Sparkles, Calendar, MapPin, Users, Navigation, AlertCircle, RefreshCcw, Check, ChevronRight, X, UserPlus, Car, Train, Plane, Wallet, Download, Activity, Save, Calculator } from 'lucide-react';\nimport { SmartBudgetModal } from './SmartBudgetModal';\n"
content = content.replace(import_str, new_import_str)

state_str = "  const [bgImage, setBgImage] = useState<string>('');"
new_state_str = "  const [bgImage, setBgImage] = useState<string>('');\n  const [showSmartBudget, setShowSmartBudget] = useState(false);"
content = content.replace(state_str, new_state_str)

budget_ui = """                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-indigo-500" />
                  {lang === 'mr' ? 'एकूण बजेट (₹)' : 'Budget (₹)'}
                </label>
                <input
                  type="number"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />"""

new_budget_ui = """                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-indigo-500" />
                    {lang === 'mr' ? 'एकूण बजेट (₹)' : 'Budget (₹)'}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="500"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmartBudget(true)}
                    className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-lg transition-colors active:scale-95"
                    title={lang === 'mr' ? 'स्मार्ट कॅल्क्युलेटर' : 'Smart Budget Calculator'}
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                </div>"""
                
content = content.replace(budget_ui, new_budget_ui)

modal_inject = """  if (!isOpen) return null;

  return ("""
new_modal_inject = """  if (!isOpen) return null;

  return (
    <>
      <SmartBudgetModal
        isOpen={showSmartBudget}
        onClose={() => setShowSmartBudget(false)}
        lang={lang}
        destination={destination}
        days={parseInt(days) || 3}
        persons={parseInt(persons) || 2}
        transportMode={transport}
        onApplyBudget={(total) => setBudget(total.toString())}
      />"""
content = content.replace(modal_inject, new_modal_inject)

footer_inject = """      </div>
    </div>
  );
};"""
new_footer_inject = """      </div>
    </div>
    </>
  );
};"""
content = content.replace(footer_inject, new_footer_inject)


with open('src/components/modals/FutureTripModal.tsx', 'w') as f:
    f.write(content)
print("Patched FutureTripModal")
