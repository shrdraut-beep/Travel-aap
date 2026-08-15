import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

content = content.replace("import { MusicPlayerProvider } from '../MusicPlayerContext';", "")
content = content.replace("import { MusicPlayerBar } from '../MusicPlayerBar';", "")
content = content.replace("<MusicPlayerProvider>", "")
content = content.replace("<MusicPlayerBar lang={lang} themeColor={themeColor} />", "")
content = content.replace("</MusicPlayerProvider>", "")

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)
