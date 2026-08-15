import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

sync = """
  // Sync when activeTrip changes from context
  useEffect(() => {
    if (activeTrip && activeTrip.id !== currentTrip.id) {
      setCurrentTrip(activeTrip);
    }
  }, [activeTrip]);
"""

# PlanningScreen uses `activeTrip` directly by `const currentTrip = initialTrip || activeTrip;`
# But it has local state for `currentTrip` if it was using a `useState`. Wait, it's NOT a useState!
# `const currentTrip = initialTrip || activeTrip;`
# This means it ALWAYS uses activeTrip on render. It should be perfectly synced!

# But wait, `updateActiveTrip` in `PlanningScreen`:
# `updateActiveTrip(updated)` calls the context. The context updates `activeTripState`, which triggers a re-render of App and PlanningScreen.
