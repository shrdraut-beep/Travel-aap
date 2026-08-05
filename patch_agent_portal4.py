import re

with open('src/components/views/AgentPortalView.tsx', 'r') as f:
    content = f.read()

# 1. Add "Smart Pricing Insights" to Dashboard Tab
dashboard_start = "          {activeTab === 'dashboard' && ("
dashboard_repl = """          {activeTab === 'dashboard' && (
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
              </div>
"""
if "AI Smart Pricing Insight" not in content:
    content = content.replace(dashboard_start, dashboard_repl, 1)

# The dashboard tab end
dashboard_end_str = """                </div>
              </div>
            </div>
          )}"""
dashboard_end_repl = """                </div>
              </div>
            </div>
            </>
          )}"""
if "<>" in dashboard_repl and "</>" not in content.split(dashboard_end_str)[0]:
    content = content.replace(dashboard_end_str, dashboard_end_repl, 1)

tabs_content = """

          {/* LEAD BIDDING SYSTEM / WATAGHATI */}
          {activeTab === 'bidding' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-400" />
                    Live Customer Leads (Wataghati)
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">Bid on custom user requests and negotiate live offers.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-400">Current Rating:</span>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 cursor-pointer" onClick={() => setAgentRating(agentRating === 4.2 ? 4.8 : 4.2)}>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-black text-amber-400">{agentRating}</span>
                    <span className="text-xs text-slate-400 ml-1">(Click to toggle)</span>
                  </div>
                </div>
              </div>

              {agentRating < 4.5 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
                      <Lock className="w-8 h-8 text-rose-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Premium Feature Locked</h3>
                    <p className="text-slate-400 max-w-md mx-auto leading-relaxed text-sm mb-6">
                      You need a rating of <span className="text-amber-400 font-bold">4.5 to 5 Stars</span> to participate in live user negotiations (Wataghati). Improve your service to unlock this!
                    </p>
                    <button className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors border border-slate-700 cursor-pointer">
                      View Tips to Improve Rating
                    </button>
                  </div>
                  
                  {/* Blurred mock content in background */}
                  <div className="opacity-20 space-y-4">
                    <div className="h-24 bg-slate-800 rounded-2xl w-full"></div>
                    <div className="h-24 bg-slate-800 rounded-2xl w-full"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                            New Lead
                          </span>
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            5 mins ago
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white">Family of 4 looking for a 3-day Goa trip</h3>
                          <p className="text-sm text-slate-400 mt-1">User requested custom package with flights from Mumbai.</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                            <span className="text-slate-500 text-xs mr-2">Budget:</span>
                            <span className="font-bold text-white">₹40,000</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <input 
                          type="number" 
                          placeholder="Your Bid Amount (₹)" 
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                        />
                        <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer">
                          Submit Bid
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                      <MessageCircle className="w-32 h-32 text-indigo-500" />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Direct Offer (Wataghati)
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white">User offered <span className="text-emerald-400">₹22,000</span> for Goa 3 Days</h3>
                          <p className="text-sm text-slate-400 mt-1">Original Price: <span className="line-through">₹25,000</span></p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-300 italic">
                          "I'm looking to book immediately if we can agree on this price. Ready to pay advance."
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <button className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer">
                          Accept Offer
                        </button>
                        <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors cursor-pointer border border-indigo-500/50">
                          Counter Offer
                        </button>
                        <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 font-bold text-xs transition-colors cursor-pointer border border-slate-700">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI PACKAGE BUILDER */}
          {activeTab === 'ai_builder' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                  Smart Itinerary Generator
                </h2>
                <p className="text-sm text-slate-400 mt-1">Describe a trip and let AI generate a complete, day-by-day itinerary instantly.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-300">What kind of package do you want to create?</label>
                  <div className="relative">
                    <textarea 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="E.g., 5 days in Delhi & Agra for a family covering all heritage sites, with 3-star hotels and private cab..."
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white focus:outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                    ></textarea>
                    <button 
                      onClick={() => setAiGenerated(true)}
                      className="absolute bottom-4 right-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate AI Itinerary
                    </button>
                  </div>
                </div>
              </div>

              {aiGenerated && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-black text-white">Generated: Delhi & Agra Heritage Tour (5 Days)</h3>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer border border-slate-700">
                        Edit Manually
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-600/20">
                        Publish Package
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { day: 'Day 1', title: 'Arrival in Delhi & Local Markets', desc: 'Check-in to 3-star hotel. Evening visit to Connaught Place and India Gate.' },
                      { day: 'Day 2', title: 'Delhi Heritage Sightseeing', desc: 'Full day tour of Red Fort, Qutub Minar, and Lotus Temple with private guide.' },
                      { day: 'Day 3', title: 'Transfer to Agra & Taj Mahal', desc: 'Morning drive to Agra. Afternoon visit to the majestic Taj Mahal.' },
                      { day: 'Day 4', title: 'Agra Fort & Fatehpur Sikri', desc: 'Explore the historic Agra Fort and the abandoned city of Fatehpur Sikri.' },
                      { day: 'Day 5', title: 'Departure', desc: 'Morning breakfast and transfer back to Delhi Airport/Railway Station.' }
                    ].map(d => (
                      <div key={d.day} className="flex gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <div className="w-16 h-16 rounded-xl bg-indigo-500/10 flex flex-col items-center justify-center border border-indigo-500/20 shrink-0">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{d.day.split(' ')[0]}</span>
                          <span className="text-xl font-black text-indigo-300">{d.day.split(' ')[1]}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{d.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{d.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
"""
if "LEAD BIDDING SYSTEM / WATAGHATI" not in content:
    content = content.replace("          {activeTab === 'kyc_registration' && (", tabs_content + "\n          {activeTab === 'kyc_registration' && (")

with open('src/components/views/AgentPortalView.tsx', 'w') as f:
    f.write(content)

