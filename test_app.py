import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Let's verify what happens when creating a trip
print("App handles CreateTripModal:", "CreateTripModal" in content)
