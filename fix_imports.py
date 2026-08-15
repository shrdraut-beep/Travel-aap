with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

content = content.replace("ListFilter  ShieldCheck,", "ListFilter,\n  ShieldCheck,")

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)

print("Fixed comma in PlanningScreen.tsx")
