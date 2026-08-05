import sys

with open('src/components/modals/CreateTripModal.tsx', 'r') as f:
    content = f.read()

import_str = "import { Plus, X, Upload, Info, AlertTriangle, Building2, MapPin, Calendar, Receipt, PiggyBank, Users } from 'lucide-react';\n"
new_import_str = "import { Plus, X, Upload, Info, AlertTriangle, Building2, MapPin, Calendar, Receipt, PiggyBank, Users, Wallet, Calculator } from 'lucide-react';\nimport { SmartBudgetModal } from './SmartBudgetModal';\n"
content = content.replace(import_str, new_import_str)

# Adding state
state_str = "  const [defaultCurrency, setDefaultCurrency] = React.useState('INR');\n"
new_state_str = "  const [defaultCurrency, setDefaultCurrency] = React.useState('INR');\n  const [totalBudget, setTotalBudget] = React.useState('0');\n  const [showSmartBudget, setShowSmartBudget] = React.useState(false);\n"
content = content.replace(state_str, new_state_str)

# populate on open
open_str = "      setDefaultCurrency(initialData?.defaultCurrency || 'INR');\n"
new_open_str = "      setDefaultCurrency(initialData?.defaultCurrency || 'INR');\n      setTotalBudget(initialData?.totalBudget ? initialData.totalBudget.toString() : '0');\n"
content = content.replace(open_str, new_open_str)

# save logic
save_str = "      defaultCurrency,\n"
new_save_str = "      defaultCurrency,\n      totalBudget: Number(totalBudget),\n"
content = content.replace(save_str, new_save_str)

# UI injection
ui_target = """                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  <div className="space-y-2">"""

new_ui = """                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-3 h-3" /> एकूण बजेट (Total Budget)
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={totalBudget}
                        onChange={(e) => setTotalBudget(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 transition-all shadow-sm pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmartBudget(true)}
                        className="absolute right-2 top-2.5 p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-xl transition-colors active:scale-95"
                        title="Smart Budget Calculator"
                      >
                        <Calculator className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">"""

content = content.replace(ui_target, new_ui)

# Modal component render injection
modal_inject = """  return (
    <AnimatePresence>"""
new_modal_inject = """  return (
    <AnimatePresence>
      <SmartBudgetModal
        isOpen={showSmartBudget}
        onClose={() => setShowSmartBudget(false)}
        lang="mr"
        destination={name}
        days={3}
        persons={members.length || 2}
        transportMode="car"
        onApplyBudget={(total) => setTotalBudget(total.toString())}
      />"""

content = content.replace(modal_inject, new_modal_inject)

with open('src/components/modals/CreateTripModal.tsx', 'w') as f:
    f.write(content)
print("Patched CreateTripModal Budget")
