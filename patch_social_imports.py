import re

with open("src/components/routripo/TripsScreen.tsx", "r") as f:
    content = f.read()

imports = """
import { TripAwardsBanner } from "../TripAwardsBanner";
import { FlightTrackerWidget } from "../FlightTrackerWidget";
import { TransitSchedules } from "../TransitSchedules";
import { TimepassGame } from "../views/TimepassGame";
import { QuirkyLanguageSelector } from "../QuirkyLanguageSelector";
"""

if "TripAwardsBanner" not in content:
    content = content.replace("import { useLanguage } from \"../../context/LanguageContext\";", "import { useLanguage } from \"../../context/LanguageContext\";\n" + imports)

# Find MemoriesView insertion point
insertion = """
      <div className="px-4 mt-4 space-y-4">
        {activeTrip && <TripAwardsBanner trip={activeTrip} lang={lang} />}
        {activeTrip && <FlightTrackerWidget lang={lang} />}
        {activeTrip && <TransitSchedules source={activeTrip.source || "Mumbai"} destination={activeTrip.destination || "Ujjain"} />}
        {activeTrip && <TimepassGame trip={activeTrip} lang={lang} />}
        <QuirkyLanguageSelector />
      </div>
"""

content = content.replace("<div className=\"px-4 mt-4\">\n              </div>", insertion)

with open("src/components/routripo/TripsScreen.tsx", "w") as f:
    f.write(content)
