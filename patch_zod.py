import re

with open("server/routes/partnerKyc.ts", "r") as f:
    content = f.read()

content = content.replace("error.errors", "(error as any).errors")

with open("server/routes/partnerKyc.ts", "w") as f:
    f.write(content)

