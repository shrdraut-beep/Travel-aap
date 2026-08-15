import re

with open("src/components/routripo/PlanningScreen.tsx") as f:
    code = f.read()

# Extract imported symbols from lucide-react
match = re.search(r"import\s*\{([^}]+)\}\s*from\s*['\"]lucide-react['\"]", code)
lucide_imports = set()
if match:
    lucide_imports = {x.strip() for x in match.group(1).split(",") if x.strip()}

print("Currently imported lucide icons:", sorted(lucide_imports))

# Find all lucide icon names used as <IconName ...>
used_tags = set(re.findall(r'<([A-Z][a-zA-Z0-9]+)[\s/>]', code))

# Known non-lucide components in PlanningScreen
custom_components = {
    "DashboardView", "TopBar", "LogoName", "TripGroup", "TripPlan", "PackingItem", "Poll", "Member",
    "SmartPackingAlert", "TripAwardsBanner", "PollsCard", "FlightTrackerWidget", "TransitSchedules",
    "WeatherWidget", "QuirkyLanguageSelector", "WikipediaSnippet", "UpiQrModal", "TripMap",
    "HTMLDivElement", "PreTripPlanner", "BookingsView"
}

missing = [tag for tag in used_tags if tag not in lucide_imports and tag not in custom_components]
print("Missing lucide imports:", missing)
