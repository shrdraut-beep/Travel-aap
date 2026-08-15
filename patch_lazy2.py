import re
with open("src/components/views/PlannerView.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "const TripMap = React.lazy(() => import('../map/TripMap').then(m => ({ default: m.TripMap })));",
    "import { TripMap } from '../map/TripMap';"
)
content = content.replace(
    "<React.Suspense fallback={<div className=\"h-64 bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center\">Loading Live Map...</div>}>",
    ""
)
content = content.replace("</React.Suspense>", "")

with open("src/components/views/PlannerView.tsx", "w") as f:
    f.write(content)
