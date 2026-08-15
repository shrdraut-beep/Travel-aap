import re

with open("src/components/routripo/AllTripsScreen.tsx", "r") as f:
    content = f.read()

# Make sure all trips screen handles the select trip properly
if "selectTripById(" in content:
    print("selectTripById is used in AllTripsScreen")

