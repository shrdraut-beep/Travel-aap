import re
with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "const TripMap = React.lazy(() => import('../map/TripMap').then(m => ({ default: m.TripMap })));",
    "import { TripMap } from '../map/TripMap';"
)
content = content.replace(
    "<React.Suspense fallback={<div className=\"h-64 bg-slate-100 rounded-3xl animate-pulse flex items-center justify-center\">Loading Map...</div>}>",
    ""
)
content = content.replace("</React.Suspense>", "")

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)
