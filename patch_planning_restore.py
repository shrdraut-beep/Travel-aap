import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

# Add the AI Planner Card back
ai_planner_card = """
        {/* Header Title Card / Smart AI Planner */}
        <div className="px-5 pt-4 pb-2">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-all" onClick={onOpenPlanner}>
            <div className="bg-white rounded-[14px] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2.5 rounded-xl">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{lang === 'mr' ? 'भविष्यकालीन सहल प्लानर' : 'Smart AI Planner'}</h3>
                  <p className="text-[10px] font-bold text-slate-500">{lang === 'mr' ? 'नवीन सहलीचे नियोजन करा' : 'Plan Future Trips & Transfers'}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
"""

content = content.replace("{/* Planner Category Sub-Nav Pill Bar (Matching old screenshot, redesigned) */}", ai_planner_card + "\n        {/* Planner Category Sub-Nav Pill Bar (Matching old screenshot, redesigned) */}")

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)
print("Restored AI Planner button")
