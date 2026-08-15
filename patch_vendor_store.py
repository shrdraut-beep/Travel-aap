import re

with open("src/store/useVendorStore.ts", "r") as f:
    content = f.read()

content = re.sub(r"const DEFAULT_APPLICATIONS: VendorApplication\[\] = \[.*?\];", "const DEFAULT_APPLICATIONS: VendorApplication[] = [];", content, flags=re.DOTALL)

with open("src/store/useVendorStore.ts", "w") as f:
    f.write(content)
