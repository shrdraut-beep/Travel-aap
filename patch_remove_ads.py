import re

with open('src/components/views/DashboardView.tsx', 'r') as f:
    content = f.read()

# Remove import
content = content.replace("import { AdSlider } from './AdSlider';\n", "")

# Remove component usage
ad_block = """      {trip.destination && (
        <div className="px-5">
          <AdSlider city={trip.destination} />
        </div>
      )}"""
content = content.replace(ad_block, "")

with open('src/components/views/DashboardView.tsx', 'w') as f:
    f.write(content)
