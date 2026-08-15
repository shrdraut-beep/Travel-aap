import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

pattern = r'\{setActive && \(\s*<button\s*onClick=\{[^}]*\}\s*className="[^"]*"\s*>\s*<span>Change Trip</span>.*?</button>\s*\)\}'

match = re.search(pattern, content, re.DOTALL)
if match:
    content = content.replace(match.group(0), "")
    with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
        f.write(content)
    print("Change Trip removed")
else:
    print("Change Trip not found")

