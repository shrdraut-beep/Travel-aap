import sys
import re

with open('src/components/modals/CreateTripModal.tsx', 'r') as f:
    content = f.read()

# I will replace from "{/* Theme & Currency */}" down to "                {/* Calculation Mode */}"
old_block_pattern = r"\{/\* Theme & Currency \*/\}.*?\{/\* Calculation Mode \*/\}"

new_block = """{/* Budget & Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
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

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                      🪙 मुख्य चलन
                    </label>
                    <select
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-900 text-sm shadow-sm"
                    >
                      <option value="INR">₹ INR (India)</option>
                      <option value="USD">$ USD (USA)</option>
                      <option value="EUR">€ EUR (Europe)</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Mode */}"""

content = re.sub(old_block_pattern, new_block, content, flags=re.DOTALL)

with open('src/components/modals/CreateTripModal.tsx', 'w') as f:
    f.write(content)
print("Fixed CreateTripModal syntax")
