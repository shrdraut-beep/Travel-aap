import re
with open("src/components/views/PartnerInventoryManager.tsx", "r") as f:
    text = f.read()

text = text.replace("\\{", "{").replace("\\}", "}").replace("\\(", "(").replace("\\)", ")")
text = text.replace("\\?", "?").replace("\\|", "|").replace("\\/", "/")

with open("src/components/views/PartnerInventoryManager.tsx", "w") as f:
    f.write(text)
