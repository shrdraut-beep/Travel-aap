import re

with open("src/components/views/DashboardView.tsx", "r") as f:
    content = f.read()

replacement = """
                      {[...cat.items].sort((a, b) => a.isChecked === b.isChecked ? 0 : a.isChecked ? 1 : -1).map((item: any) => (
"""
content = content.replace("{cat.items.map((item: any) => (", replacement)

with open("src/components/views/DashboardView.tsx", "w") as f:
    f.write(content)
