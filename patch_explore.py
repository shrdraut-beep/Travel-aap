import re

with open("src/components/views/ExplorePackagesView.tsx", "r") as f:
    content = f.read()

# Replace DEFAULT_PACKAGES array with empty array
content = re.sub(r'const DEFAULT_PACKAGES: TourPackage\[\] = \[\s*\{.*?\s*\}\s*\];', 'const DEFAULT_PACKAGES: TourPackage[] = [];', content, flags=re.DOTALL)

with open("src/components/views/ExplorePackagesView.tsx", "w") as f:
    f.write(content)
