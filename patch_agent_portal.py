import re

with open('src/components/views/AgentPortalView.tsx', 'r') as f:
    content = f.read()

# Add agentRating to the state
state_str = "  const [activeTab, setActiveTab] = useState<'dashboard' | 'kyc_registration' | 'wallet' | 'settings'>('dashboard');"
state_repl = """  const [activeTab, setActiveTab] = useState<'dashboard' | 'bidding' | 'ai_builder' | 'kyc_registration' | 'wallet' | 'settings'>('dashboard');
  
  // Agent Rating for Bidding
  const [agentRating, setAgentRating] = useState<number>(4.2); // Default to 4.2 to show locked state, user can toggle maybe? Or we just show a toggle for demo
"""
content = content.replace(state_str, state_repl)

# Update sidebar tabs
sidebar_str = """          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}"""

sidebar_repl = """          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('bidding')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'bidding' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Live Leads (Wataghati)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px]">Hot</span>
            </button>
            <button
              onClick={() => setActiveTab('ai_builder')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ai_builder' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                <span>AI Package Builder</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('kyc_registration')}
              className={`hidden`}>
"""
# Since there are already dashboard and others in the file, we can replace the whole sidebar navigation.
# Let's check how the sidebar navigation is constructed.
