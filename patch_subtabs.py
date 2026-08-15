import re

with open("src/components/views/DashboardView.tsx", "r") as f:
    content = f.read()

replacement = """
        {/* Dynamic Re-designed Tabs Section - 4 Button Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 sm:px-5 pb-4">
          {/* Itinerary Button */}
          <button 
            onClick={() => setActiveSubTab('itinerary')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl shadow-md hover:shadow-lg transition-all border group ${activeSubTab === 'itinerary' ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900' : 'bg-white border-gray-100'}`}
          >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🗺️</span>
              <span className={`font-semibold text-sm ${activeSubTab === 'itinerary' ? 'text-slate-900' : 'text-gray-800'}`}>
                {lang === 'mr' ? 'नियोजन' : 'Itinerary'}
              </span>
          </button>

          {/* Bookings Button */}
          <button 
            onClick={() => setActiveSubTab('bookings')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl shadow-md hover:shadow-lg transition-all border group ${activeSubTab === 'bookings' ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900' : 'bg-white border-gray-100'}`}
          >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎫</span>
              <span className={`font-semibold text-sm ${activeSubTab === 'bookings' ? 'text-slate-900' : 'text-gray-800'}`}>
                {lang === 'mr' ? 'बुकिंग्ज' : 'Bookings'}
              </span>
          </button>

          {/* Smart Checklist Button */}
          <button 
            onClick={() => setActiveSubTab('checklist')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl shadow-md hover:shadow-lg transition-all border group ${activeSubTab === 'checklist' ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900' : 'bg-white border-gray-100'}`}
          >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📋</span>
              <span className={`font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full ${activeSubTab === 'checklist' ? 'text-slate-900' : 'text-gray-800'}`}>
                {t('smartChecklist') || 'Smart Checklist'}
              </span>
          </button>

          {/* Playlist Button */}
          <button 
            onClick={() => setActiveSubTab('playlist')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl shadow-md hover:shadow-lg transition-all border group ${activeSubTab === 'playlist' ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900' : 'bg-white border-gray-100'}`}
          >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎵</span>
              <span className={`font-semibold text-sm ${activeSubTab === 'playlist' ? 'text-slate-900' : 'text-gray-800'}`}>
                {lang === 'mr' ? 'प्लेलिस्ट' : 'Playlist'}
              </span>
          </button>
        </div>
"""

pattern = r'\{\/\* Dynamic Re-designed Tabs Section \*\/\}.*?(?=\{\/\* Weather Alerts - NEW Section \*\/\})'
match = re.search(pattern, content, re.DOTALL)
if match:
    content = content.replace(match.group(0), replacement)
    with open("src/components/views/DashboardView.tsx", "w") as f:
        f.write(content)
    print("Successfully replaced tabs with 4-button grid!")
else:
    print("Match failed. Could not find pattern.")
