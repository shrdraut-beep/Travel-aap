import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

content = content.replace("import { useTripContext } from \"../../context/TripContext\";", "import { useTripContext } from \"../../context/TripContext\";\nimport { useLanguage } from \"../../context/LanguageContext\";")

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)
