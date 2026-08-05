import re

with open('src/components/views/AdminDashboardView.tsx', 'r') as f:
    content = f.read()

# Add warnings to state
state_block = """  const [activePromos, setActivePromos] = useState<number>(0);
  const [systemWarnings, setSystemWarnings] = useState<any[]>([]);"""

content = re.sub(r'  const \[activePromos, setActivePromos\] = useState<number>\(0\);', state_block, content)

# Add warnings to fetch
fetch_block = """             setActivePromos(data.activePromos || 0);
             setSystemWarnings(data.warnings || []);"""

content = re.sub(r'             setActivePromos\(data\.activePromos \|\| 0\);', fetch_block, content)

# Update warnings render
warnings_render = """                  <div className="space-y-2">
                    {isLoading ? (
                       <div className="text-xs text-slate-500 italic">Fetching system logs...</div>
                    ) : (
                      <>
                        {systemWarnings.length === 0 ? (
                          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>All systems operational. No active warnings.</span>
                          </div>
                        ) : (
                          systemWarnings.map(warning => (
                            <div key={warning.id} className={`flex items-start gap-3 p-3 rounded-xl border ${warning.type === 'app' ? 'bg-rose-50 border-rose-100' : warning.type === 'system' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
                              {warning.type === 'app' ? <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /> : warning.type === 'system' ? <Database className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> : <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                              <div>
                                <p className={`text-xs font-bold ${warning.type === 'app' ? 'text-rose-900' : warning.type === 'system' ? 'text-amber-900' : 'text-blue-900'}`}>⚠️ {warning.title}</p>
                                <p className={`text-[11px] font-medium mt-0.5 ${warning.type === 'app' ? 'text-rose-700' : warning.type === 'system' ? 'text-amber-700' : 'text-blue-700'}`}>{warning.desc}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}
                  </div>"""

content = re.sub(r'                  <div className="space-y-2">.*?</div>\s+</div>\s+</section>', warnings_render + '\n                </div>\n              </section>', content, flags=re.DOTALL)

with open('src/components/views/AdminDashboardView.tsx', 'w') as f:
    f.write(content)
