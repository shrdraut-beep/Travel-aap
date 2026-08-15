import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

# Remove Header Title Card
pattern_header = r'\{\/\* Header Title Card \*\/\}.*?(?=\{\/\* Planner Category Sub-Nav Pill Bar)'
match = re.search(pattern_header, content, re.DOTALL)
if match:
    content = content.replace(match.group(0), "")

# Remove Fun and Tracking from Pill Bar
content = re.sub(r'<button\s*onClick=\{\(\) => setActiveSubTab\(\'fun\'\)\}.*?</button>', '', content, flags=re.DOTALL)
content = re.sub(r'<button\s*onClick=\{\(\) => setActiveSubTab\(\'tracking\'\)\}.*?</button>', '', content, flags=re.DOTALL)

# Remove Fun content
pattern_fun = r'\{\/\* TAB 3: FUN & MEMORIES \*\/\}.*?(?=\{\/\* TAB 5: FIND FRIENDS \*\/\})'
match = re.search(pattern_fun, content, re.DOTALL)
if match:
    content = content.replace(match.group(0), "")

# Note: Tracking was already removed earlier.

# Remove Trip Name from DashboardView if there's still any. I removed it in DashboardView already.
# Oh, the prompt says "In the Planning tab, delete the top Back button, the trip name display, and the Share button".
# I'll check if there's a Back button in PlanningScreen.tsx TopBar.
# No, TopBar has back button if we pass onBack? We didn't pass onBack. 
# But in `DashboardView.tsx`, there is `ChevronRight className="w-4 h-4 rotate-180"` Trips button. We removed that!

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)
print("Cleaned up PlanningScreen")
