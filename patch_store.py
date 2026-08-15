import re

with open("src/store/useOfferStore.ts", "r") as f:
    content = f.read()

# Remove FLAGSHIP STORES & POCKET FRIENDLY from useOfferStore
content = re.sub(r'// ================= FLAGSHIP STORES.*?\];', '];', content, flags=re.DOTALL)

with open("src/store/useOfferStore.ts", "w") as f:
    f.write(content)
