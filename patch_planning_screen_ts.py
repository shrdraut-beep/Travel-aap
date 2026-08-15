import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

# Add lang and themeColor to PlanningScreen
# They are available via useLanguage and context

content = content.replace("const { activeTrip } = useTripContext();", "const { activeTrip } = useTripContext();\n  const { lang } = useLanguage();\n  const themeColor = '#6366f1';")

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)
