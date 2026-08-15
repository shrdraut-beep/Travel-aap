import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

# Replace packingItems.map with sortedPackingItems
replacement = """
              {[...packingItems].sort((a, b) => {
                if (a.isChecked !== b.isChecked) return a.isChecked ? 1 : -1;
                if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '');
                return a.name.localeCompare(b.name);
              }).map(item => (
"""
content = content.replace("{packingItems.map(item => (", replacement)

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)

print("Updated packing list sorting logic")
