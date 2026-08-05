import sys

with open('src/components/modals/CreateTripModal.tsx', 'r') as f:
    lines = f.readlines()

start_index = -1
end_index = -1

for i, line in enumerate(lines):
    if 'const THEME_COLORS = [' in line:
        start_index = i
    if start_index != -1 and i > start_index and '];' in line:
        end_index = i + 1
        break

if start_index != -1 and end_index != -1:
    lines[start_index:end_index] = []
    
    with open('src/components/modals/CreateTripModal.tsx', 'w') as f:
        f.writelines(lines)
    print("Removed THEME_COLORS successfully")
else:
    print("Could not find THEME_COLORS array")
