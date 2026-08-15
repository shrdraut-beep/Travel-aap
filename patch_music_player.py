import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

import_bar = "import { MusicPlayerBar } from '../MusicPlayerBar';\n"
if "MusicPlayerBar" not in content:
    content = content.replace("import { MusicPlayerProvider } from '../MusicPlayerContext';", "import { MusicPlayerProvider } from '../MusicPlayerContext';\n" + import_bar)

# Insert it inside MusicPlayerProvider
if "<MusicPlayerBar" not in content:
    content = content.replace("</MusicPlayerProvider>", "  <MusicPlayerBar lang={lang} themeColor={themeColor} />\n          </MusicPlayerProvider>")

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)

print("Added MusicPlayerBar")
