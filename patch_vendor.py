import re

with open("src/components/travel/HotelSearchTab.tsx", "r") as f:
    content = f.read()

content = re.sub(r"const DIRECT_VENDOR_HOTELS: InventoryItem\[\] = \[.*?\];", "const DIRECT_VENDOR_HOTELS: InventoryItem[] = [];", content, flags=re.DOTALL)

with open("src/components/travel/HotelSearchTab.tsx", "w") as f:
    f.write(content)

with open("src/components/travel/CarSearchTab.tsx", "r") as f:
    content = f.read()

content = re.sub(r"const DIRECT_VENDOR_CABS: InventoryItem\[\] = \[.*?\];", "const DIRECT_VENDOR_CABS: InventoryItem[] = [];", content, flags=re.DOTALL)

with open("src/components/travel/CarSearchTab.tsx", "w") as f:
    f.write(content)

