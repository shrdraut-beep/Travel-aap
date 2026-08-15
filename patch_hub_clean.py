import re

with open('src/components/routripo/HubScreen.tsx', 'r') as f:
    content = f.read()

# Remove useOfferStore import
content = re.sub(r'import\s+\{\s*useOfferStore\s*\}\s+from\s+.*?useOfferStore.*?;?\n', '', content)

# Remove offers and activeOffers declarations
content = re.sub(r'\s*const\s+offers\s*=\s*useOfferStore.*?;\n', '\n', content)
content = re.sub(r'\s*const\s+activeOffers\s*=\s*offers\.filter.*?;\n', '\n', content)

with open('src/components/routripo/HubScreen.tsx', 'w') as f:
    f.write(content)
