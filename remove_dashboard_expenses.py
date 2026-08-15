import re

with open("src/components/views/DashboardView.tsx", "r") as f:
    content = f.read()

# TWO-COLUMN GRID LAYOUT (LEFT: INCOME & BALANCE | RIGHT: EXPENSE & PERCENTAGE)
# we need to remove it from DashboardView
pattern_two_col = r'\{\/\* TWO-COLUMN GRID LAYOUT \(LEFT: INCOME & BALANCE \| RIGHT: EXPENSE & PERCENTAGE\) \*\/\}.*?\{\/\* Chart Section \*\/\}'
match_two_col = re.search(pattern_two_col, content, re.DOTALL)
if match_two_col:
    content = content.replace(match_two_col.group(0), "{/* Chart Section */}")
    print("Removed TWO-COLUMN GRID LAYOUT from DashboardView")

# Chart Section
pattern_chart = r'\{\/\* Chart Section \*\/\}\s*\{activeSubTab === \'expenses\' && chartData\.length > 0 && \(\s*<div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">.*?</ResponsiveContainer>\s*</div>\s*\</div>\s*\)\}'
match_chart = re.search(pattern_chart, content, re.DOTALL)
if match_chart:
    content = content.replace(match_chart.group(0), "")
    print("Removed Chart Section from DashboardView")
else:
    # try looser match
    pattern_chart2 = r'\{\/\* Chart Section \*\/\}.*?(?=\{\/\* Weather Forecast - Moved to Bottom \*\/\})'
    match_chart2 = re.search(pattern_chart2, content, re.DOTALL)
    if match_chart2:
        content = content.replace(match_chart2.group(0), "")
        print("Removed Chart Section from DashboardView (fallback)")
        
with open("src/components/views/DashboardView.tsx", "w") as f:
    f.write(content)
