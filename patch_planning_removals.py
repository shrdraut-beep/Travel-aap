import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

# Tab 4: TRACKING & GUIDE in PlanningScreen.tsx
pattern = r'\{\/\* TAB 4: TRACKING & GUIDE \*\/\}.*?(?=\{\/\* TAB 5: FIND FRIENDS \*\/\})'
match = re.search(pattern, content, re.DOTALL)
if match:
    content = content.replace(match.group(0), "")
    print("Removed Tab 4 from PlanningScreen")
else:
    print("Could not find Tab 4 in PlanningScreen")

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)

