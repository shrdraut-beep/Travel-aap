import re

with open('src/components/views/ExplorePackagesView.tsx', 'r') as f:
    content = f.read()

# 1. z-index to 9999 and add pt-20 to avoid sliding under header
content = content.replace(
    '<div className="fixed inset-0 z-[350] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">',
    '<div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 pt-24 overflow-y-auto">'
)

# 2. Add "(Including all taxes)" to the top per person display
content = content.replace(
    "<p className=\"text-xs font-semibold text-slate-600\">\n                ₹{checkoutPkg.price.toLocaleString('en-IN')} per person\n              </p>",
    "<p className=\"text-xs font-semibold text-slate-600 flex flex-col\">\n                <span>₹{checkoutPkg.price.toLocaleString('en-IN')} per person</span>\n                <span className=\"text-[10px] text-slate-500\">(Including all taxes)</span>\n              </p>"
)

# 3. Modify the commission section
old_commission = """              {/* AUTOMATED COMMISSION SPLIT BREAKDOWN (10% Platform Commission / 90% Vendor Split) */}
              <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="text-xs font-extrabold text-slate-700">Package Price × {travelersCount}</span>
                  <span className="font-black text-slate-900 text-sm">
                    ₹{(checkoutPkg.price * travelersCount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 font-semibold">
                    <span>10% Platform Commission & Security:</span>
                    <span className="font-bold text-emerald-700">₹{Math.round(checkoutPkg.price * travelersCount * 0.10).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-semibold">
                    <span>90% Vendor Escrow Allocation:</span>
                    <span className="font-bold text-emerald-700">₹{(checkoutPkg.price * travelersCount - Math.round(checkoutPkg.price * travelersCount * 0.10)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200 font-black text-slate-900 text-sm">
                    <span>Total Amount Payable:</span>
                    <span className="text-emerald-700 text-base">₹{(checkoutPkg.price * travelersCount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>"""

new_commission = """              {/* BASE PRICE & TOTAL PAYABLE */}
              <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="text-xs font-extrabold text-slate-700">Base Package Price × {travelersCount}</span>
                  <span className="font-black text-slate-900 text-sm">
                    ₹{(checkoutPkg.price * travelersCount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start justify-between pt-2 font-black text-slate-900 text-sm">
                    <div className="flex flex-col">
                      <span>Total Amount Payable</span>
                      <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">(Including all taxes)</span>
                    </div>
                    <span className="text-emerald-700 text-base">₹{(checkoutPkg.price * travelersCount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>"""

content = content.replace(old_commission, new_commission)

# 4. Make the close button more prominent
old_close_btn = """              <button
                onClick={() => setCheckoutPkg(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>"""

new_close_btn = """              <button
                onClick={() => setCheckoutPkg(null)}
                className="p-2 bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>"""

content = content.replace(old_close_btn, new_close_btn)

# Make sure other modals/dropdowns also have high z-index
content = content.replace('z-[100]', 'z-[9999]')
content = content.replace('z-[200]', 'z-[9999]')
content = content.replace('z-[300]', 'z-[9999]')

with open('src/components/views/ExplorePackagesView.tsx', 'w') as f:
    f.write(content)

