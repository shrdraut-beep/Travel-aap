import re

with open('src/components/views/AgentPortalView.tsx', 'r') as f:
    content = f.read()

# Add Bidding and AI tabs to state
state_str = "  const [activeTab, setActiveTab] = useState<'dashboard' | 'kyc_registration' | 'wallet' | 'settings'>('dashboard');"
state_repl = """  const [activeTab, setActiveTab] = useState<'dashboard' | 'bidding' | 'ai_builder' | 'kyc_registration' | 'wallet' | 'settings'>('dashboard');
  
  // Advanced Features State
  const [agentRating, setAgentRating] = useState<number>(4.2); 
  const [biddingOffer, setBiddingOffer] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);
"""
content = content.replace(state_str, state_repl)

# Add buttons to the nav bar
nav_btn_str = """                <button
                  onClick={() => setActiveTab('wallet')}"""

nav_btn_repl = """                <button
                  onClick={() => setActiveTab('bidding')}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'bidding'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Live Leads</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai_builder')}
                  className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'ai_builder'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Builder</span>
                </button>
                <button
                  onClick={() => setActiveTab('wallet')}"""
content = content.replace(nav_btn_str, nav_btn_repl)

# Add "Smart Pricing Insights" to the Dashboard Tab
dashboard_tab_str = """          {activeTab === 'dashboard' && ("""
dashboard_tab_repl = """          {activeTab === 'dashboard' && (
            <>
              {/* SMART PRICING INSIGHTS ALERT */}
              <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-indigo-500/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      AI Smart Pricing Insight
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wide border border-amber-500/20">Action Needed</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Your <span className="font-bold text-white">Goa 3-Day Package</span> is 15% above the market average. Reduce by ₹1,000 to increase booking probability by 3x.</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap cursor-pointer border border-indigo-500/50">
                  Apply AI Recommendation
                </button>
              </div>"""

content = content.replace(dashboard_tab_str, dashboard_tab_repl)
content = content.replace("          {activeTab === 'dashboard' && (", "          {activeTab === 'dashboard' && (\n            <>")
# Actually, replacing the above string twice might be bad. Let's do it carefully.
