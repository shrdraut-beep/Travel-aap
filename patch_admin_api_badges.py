import re

with open("src/components/views/AdminDashboardView.tsx", "r") as f:
    content = f.read()

new_ui = """              {/* WORKLOAD DISTRIBUTION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-slate-900 text-lg">System Workload Percentage Distribution</h3>
                  </div>
                  <div className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">Total Active Modules: 100%</div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Gemini AI Engine</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                      </div>
                      <span className="text-indigo-600 font-black">25%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Google Places & Maps API</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-700 uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>Rate Limit Warning (429)</span>
                      </div>
                      <span className="text-emerald-600 font-black">30%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Image & Media Fetcher</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-500 uppercase tracking-wider">Idle</span>
                      </div>
                      <span className="text-amber-500 font-black">20%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Database & Core Operations</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                      </div>
                      <span className="text-blue-600 font-black">15%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Network & App Utilities</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                      </div>
                      <span className="text-slate-600 font-black">10%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-slate-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>"""

content = re.sub(
    r"\{\/\* WORKLOAD DISTRIBUTION \*\/\}.*?\{\/\* API KEYS \& FUNCTIONS \*\/\}",
    new_ui + "\n\n              {/* API KEYS & FUNCTIONS */}",
    content,
    flags=re.DOTALL
)

with open("src/components/views/AdminDashboardView.tsx", "w") as f:
    f.write(content)
