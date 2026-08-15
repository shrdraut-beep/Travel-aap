import re

with open("src/store/useOfferStore.ts", "r") as f:
    content = f.read()

# Replace DEFAULT_OFFERS with an empty array
content = re.sub(r"const DEFAULT_OFFERS: Offer\[\] = \[.*?\];", "const DEFAULT_OFFERS: Offer[] = [];", content, flags=re.DOTALL)

with open("src/store/useOfferStore.ts", "w") as f:
    f.write(content)
