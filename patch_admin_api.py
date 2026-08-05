import re

with open("src/components/views/AdminDashboardView.tsx", "r") as f:
    content = f.read()

# Update tab name
content = re.sub(
    r"{ id: 'apis', icon: Activity, label: `API Directory \(\$\{totalApiCount\}\)` },",
    r"{ id: 'apis', icon: Activity, label: `API & System Health` },",
    content
)

new_ui = """              {/* WORKLOAD DISTRIBUTION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 text-lg">System Workload Percentage Distribution</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Gemini AI Engine (Active)</span>
                      <span className="text-indigo-600">25%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Google Places & Maps API (Active)</span>
                      <span className="text-emerald-600">30%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Image & Media Fetcher (Active)</span>
                      <span className="text-amber-500">20%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Database & Core Operations (Active)</span>
                      <span className="text-blue-600">15%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Network & App Utilities (Active)</span>
                      <span className="text-slate-600">10%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-slate-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* API KEYS & FUNCTIONS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-lg">API Keys & Their Specific Functions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-bold text-sm text-slate-800">Gemini AI / Groq AI API</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Used for automated trip planning, smart itinerary generation, and natural language recommendations.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-teal-500" />
                      <h4 className="font-bold text-sm text-slate-800">Google Places & Maps API</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Used for fetching tourist spot coordinates, managing locations, and calculating accurate driving distances and routes.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <PackageSearch className="w-4 h-4 text-amber-500" />
                      <h4 className="font-bold text-sm text-slate-800">Image APIs (Pixabay / Wikipedia)</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Used for fetching destination and tourist spot images dynamically.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-blue-500" />
                      <h4 className="font-bold text-sm text-slate-800">Database & Core State Storage</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Used for managing user profiles, trips, local data persistence, and sync operations.
                    </p>
                  </div>
                </div>
              </div>

              {/* FILTERS & SEARCH BAR */}"""

content = content.replace("              {/* FILTERS & SEARCH BAR */}", new_ui)

with open("src/components/views/AdminDashboardView.tsx", "w") as f:
    f.write(content)
