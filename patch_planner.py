with open("src/components/views/PlannerView.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "<React.Suspense fallback=" in line:
        skip = True
        continue
    if skip and "}>" in line:
        skip = False
        continue
    if skip:
        continue
    if "</React.Suspense>" in line:
        continue
    new_lines.append(line)

with open("src/components/views/PlannerView.tsx", "w") as f:
    f.writelines(new_lines)
