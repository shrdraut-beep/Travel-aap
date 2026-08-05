import re

with open("src/components/views/AdminDashboardView.tsx", "r") as f:
    content = f.read()

# 1. Change initial state of activeTab to 'menu'
content = content.replace(
    "useState<'dashboard' | 'apis' | 'users' | 'offers' | 'notifications' | 'support'>('dashboard')",
    "useState<'menu' | 'dashboard' | 'apis' | 'users' | 'offers' | 'notifications' | 'support'>('menu')"
)

# 2. Add 'menu' to activeTab state type definition just in case it's typed differently. Actually the replace above should handle it.

# 3. Replace the horizontal tabs with nothing
tabs_regex = re.compile(r'\{\/\* Horizontal Scrollable Tab Bar \*\/\}.*?\{\/\* Main Content \(Scrollable\) \*\/\}', re.DOTALL)
content = tabs_regex.sub('{/* Main Content (Scrollable) */}', content)

# 4. Add the 'menu' view right before the 'dashboard' tab view
# The menu view will contain the 3x3 grid
grid_view = """
          {activeTab === 'menu' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex flex-col items-center justify-center p-6 lg:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <tab.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base text-center">{tab.label}</h3>
                </button>
              ))}
            </div>
          )}
"""

content = content.replace(
    "{/* DASHBOARD TAB */}",
    grid_view + "\n          {/* BACK BUTTON (conditionally rendered) */}\n          {activeTab !== 'menu' && (\n            <button \n              onClick={() => setActiveTab('menu')} \n              className=\"mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer\"\n            >\n              <ChevronRight className=\"w-4 h-4 rotate-180\" />\n              Back to Admin Menu\n            </button>\n          )}\n\n          {/* DASHBOARD TAB */}"
)

with open("src/components/views/AdminDashboardView.tsx", "w") as f:
    f.write(content)

