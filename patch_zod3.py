import re

with open("server/routes/partnerKyc.ts", "r") as f:
    content = f.read()

content = content.replace("(error as z.ZodError).errors", "error.issues")

with open("server/routes/partnerKyc.ts", "w") as f:
    f.write(content)

