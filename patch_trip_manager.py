import re

with open("server.ts", "r") as f:
    content = f.read()

import_statement = "import tripManagerRouter from './server/routes/tripManager';\n"
mount_statement = "\n// --- TRIP MANAGER ---\napp.use('/api', tripManagerRouter);\n\n"

if "import tripManagerRouter" not in content:
    content = content.replace("import express from \"express\";", "import express from \"express\";\n" + import_statement)

if "/api/trip-manager-briefing" not in content and "tripManagerRouter" in mount_statement:
    content = content.replace("app.post(\"/api/gemini/chat\"", mount_statement + "app.post(\"/api/gemini/chat\"")

with open("server.ts", "w") as f:
    f.write(content)
