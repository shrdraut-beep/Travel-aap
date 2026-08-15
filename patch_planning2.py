import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

# Add TripMap import at the top
import_str = "const TripMap = React.lazy(() => import('../map/TripMap').then(m => ({ default: m.TripMap })));\n"
if "TripMap" not in content:
    content = content.replace("export function PlanningScreen", import_str + "export function PlanningScreen")

# Replace TAB 5: FIND FRIENDS empty space with Map
friends_target = """
            {/* Invite Friends Card */}
"""
friends_replacement = """
            {/* Find Friends Live Map */}
            <React.Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse flex items-center justify-center">Loading Map...</div>}>
              <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                <TripMap 
                  trip={currentTrip} 
                  lang="en" 
                  userId={currentUser?.id} 
                  isSharingLocation={true} 
                  onUpdateTrip={(t) => setCurrentTrip(t)}
                />
              </div>
            </React.Suspense>

            {/* Invite Friends Card */}
"""

content = content.replace(friends_target, friends_replacement)

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)
