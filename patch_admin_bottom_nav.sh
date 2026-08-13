sed -i '/    <\/div>/i \
      {/* BOTTOM NAVIGATION BAR */}\
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 pb-safe z-50 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] h-[72px]">\
        <div className="flex justify-around items-center max-w-4xl mx-auto h-full px-2 gap-1">\
          {tabs.map(tab => (\
            <button\
              key={tab.id}\
              onClick={() => setActiveTab(tab.id as any)}\
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 transition-all duration-200 cursor-pointer ${activeTab === tab.id ? "text-blue-600 scale-105" : "text-slate-500 hover:text-slate-800"}`}\
            >\
              <div className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all ${activeTab === tab.id ? "bg-blue-50 text-blue-600" : "bg-transparent"}`}>\
                <tab.icon className={`w-5 h-5 transition-transform ${activeTab === tab.id ? "scale-110" : ""}`} />\
              </div>\
              <span className={`text-[10px] mt-1 font-bold uppercase tracking-wider truncate w-full text-center px-0.5 ${activeTab === tab.id ? "text-slate-900" : "text-slate-500"}`}>\
                {tab.label}\
              </span>\
            </button>\
          ))}\
        </div>\
      </nav>\
' src/components/views/AdminDashboardView.tsx
