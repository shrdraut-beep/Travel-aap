import os
import re

files_to_check = [
    "src/components/views/DashboardView.tsx",
    "src/components/views/CommunityHubView.tsx",
    "src/components/routripo/HubScreen.tsx",
    "src/components/routripo/AllTripsScreen.tsx",
    "src/components/routripo/BookingScreen.tsx",
    "src/components/routripo/KharchScreen.tsx",
    "src/components/routripo/TripsScreen.tsx",
    "src/components/routripo/PlanningScreen.tsx"
]

for filepath in files_to_check:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove imports
    content = re.sub(r'import\s+\{\s*TopBannerCarousel\s*\}\s*from\s*["\'].*?["\'];?\n?', '', content)
    content = re.sub(r'import\s+\{\s*OffersForYouSection\s*\}\s*from\s*["\'].*?["\'];?\n?', '', content)
    content = re.sub(r'import\s+\{\s*AdSlider\s*\}\s*from\s*["\'].*?["\'];?\n?', '', content)

    # Remove tags and surrounding comments
    content = re.sub(r'\{\s*/\*\s*[^}]*(?:Ad|Offers|Banner|Carousel)[^}]*\*/\s*\}\s*<TopBannerCarousel[^>]*/>\n?', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\{\s*/\*\s*[^}]*(?:Ad|Offers|Banner|Carousel)[^}]*\*/\s*\}\s*<OffersForYouSection[^>]*/>\n?', '', content, flags=re.IGNORECASE)
    content = re.sub(r'\{\s*/\*\s*[^}]*(?:Ad|Offers|Banner|Carousel)[^}]*\*/\s*\}\s*<AdSlider[^>]*/>\n?', '', content, flags=re.IGNORECASE)

    content = re.sub(r'<TopBannerCarousel[^>]*/>\n?', '', content)
    content = re.sub(r'<OffersForYouSection[^>]*/>\n?', '', content)
    content = re.sub(r'<AdSlider[^>]*/>\n?', '', content)

    with open(filepath, 'w') as f:
        f.write(content)
