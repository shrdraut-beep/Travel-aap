import re
import glob

files = [
    'src/components/views/CommunityHubView.tsx',
    'src/components/routripo/PlanningScreen.tsx',
    'src/components/routripo/BookingScreen.tsx',
    'src/components/routripo/AllTripsScreen.tsx',
    'src/components/routripo/TripsScreen.tsx',
    'src/components/routripo/KharchScreen.tsx',
    'src/components/routripo/HubScreen.tsx'
]

for file_path in files:
    try:
        with open(file_path, 'r') as f:
            content = f.read()

        # Remove the import
        content = re.sub(r'import\s+\{\s*TopBannerCarousel\s*\}\s+from\s+[\'"].*?TopBannerCarousel[\'"];?\n', '', content)

        # Remove the usages (including comments before it, if any, that say "Top Banner")
        content = re.sub(r'\{\s*/\*\s*.*?(?:Ad|Banner|Carousel).*?\*/\s*\}.*?<TopBannerCarousel[^>]*/>', '', content, flags=re.DOTALL)
        content = re.sub(r'<TopBannerCarousel[^>]*/>', '', content)

        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Patched {file_path}")
    except Exception as e:
        print(f"Error on {file_path}: {e}")

