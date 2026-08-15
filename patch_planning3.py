import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

# Replace LiveFlightSearchCard import with FlightTrackerWidget
content = content.replace('import { LiveFlightSearchCard } from "../LiveFlightSearchCard";', 'import { FlightTrackerWidget } from "../FlightTrackerWidget";')

# Replace LiveFlightSearchCard usage with FlightTrackerWidget
target = """            {/* Flight Search & Tracker */}
            <LiveFlightSearchCard 
              lang="en" 
              t={(key) => key} 
              currencySymbol="₹" 
              defaultDestination={currentTrip.destination} 
            />"""

replacement = """            {/* Live Flight Tracker */}
            <FlightTrackerWidget lang="en" />"""

content = content.replace(target, replacement)

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)
