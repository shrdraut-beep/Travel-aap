import sys

with open('src/components/modals/CreateTripModal.tsx', 'r') as f:
    lines = f.readlines()

start_index = -1
end_index = -1

for i, line in enumerate(lines):
    if '🎨 थीम कलर' in line:
        start_index = i - 2
    if start_index != -1 and i > start_index and '🪙 मुख्य चलन' in line:
        end_index = i - 1
        break

if start_index != -1 and end_index != -1:
    lines[start_index:end_index] = []
    
    with open('src/components/modals/CreateTripModal.tsx', 'w') as f:
        f.writelines(lines)
    print("Removed theme color selection successfully")
else:
    print("Could not find theme color selection bounds")
