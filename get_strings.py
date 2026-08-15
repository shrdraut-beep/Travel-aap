import re

with open("src/components/modals/CreateTripModal.tsx", "r") as f:
    content = f.read()

# Find all devanagari strings
matches = re.findall(r'[\u0900-\u097F]+', content)
print(set(matches))
