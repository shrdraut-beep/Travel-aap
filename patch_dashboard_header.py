import re

with open("src/components/views/DashboardView.tsx", "r") as f:
    content = f.read()

pattern = r'<div className="px-5 flex items-center justify-between w-full">\s*<button\s*onClick=\{\(\) => onNavigate\(\'all-trips\'\)\}.*?</div>\s*<div className="flex flex-col items-center text-center px-5">\s*<div className="flex items-center justify-center gap-2\.5">\s*<h1.*?</h1>\s*<button.*?</button>\s*</div>\s*</div>'

match = re.search(pattern, content, re.DOTALL)
if match:
    content = content.replace(match.group(0), "")
    with open("src/components/views/DashboardView.tsx", "w") as f:
        f.write(content)
    print("Dashboard header cleaned up successfully!")
else:
    print("Match failed for dashboard header.")
