import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

replacement = """  const { activeTrip, updateActiveTrip } = useTripContext();
  const { lang, t } = useLanguage();
  const themeColor = '#6366f1';
"""
content = content.replace("  const { activeTrip, updateActiveTrip } = useTripContext();", replacement)

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)
