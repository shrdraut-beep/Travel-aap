import re

with open("src/components/routripo/AllTripsScreen.tsx", "r") as f:
    content = f.read()

content = content.replace("setActive('trips')", "setActive('planning')")
content = content.replace("setActive(\"trips\")", "setActive('planning')")

with open("src/components/routripo/AllTripsScreen.tsx", "w") as f:
    f.write(content)

