import re

with open("server.ts", "r") as f:
    content = f.read()

import_statement = "import partnerKycRouter from './server/routes/partnerKyc';\n"
mount_statement = "\n// --- PARTNER KYC ROUTES ---\napp.use('/api/partner', partnerKycRouter);\n\n"

# Add import
if "import partnerKycRouter" not in content:
    content = content.replace("import express from \"express\";", "import express from \"express\";\n" + import_statement)

# Mount it before the first API route
if "/api/partner" not in content:
    content = content.replace("app.post(\"/api/gemini/chat\"", mount_statement + "app.post(\"/api/gemini/chat\"")

with open("server.ts", "w") as f:
    f.write(content)

