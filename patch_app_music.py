import re

with open("src/App.tsx", "r") as f:
    content = f.read()

imports = """
import { MusicPlayerProvider } from './components/MusicPlayerContext';
import { MusicPlayerBar } from './components/MusicPlayerBar';
"""

if "MusicPlayerProvider" not in content:
    content = content.replace("import { FloatingAITripManager } from './components/FloatingAITripManager';", "import { FloatingAITripManager } from './components/FloatingAITripManager';\n" + imports)

provider_start = "    <MusicPlayerProvider>\n      "
provider_end = "\n    </MusicPlayerProvider>"

# Find where the return statement starts
pattern_return = r'return\s*\(\s*<ErrorBoundary fallback=\{<div>Something went wrong\.</div>\}>\s*'
match = re.search(pattern_return, content)
if match:
    content = content.replace(match.group(0), match.group(0) + provider_start)
    
    # Place provider_end just before </ErrorBoundary>
    content = content.replace("</ErrorBoundary>", "  {role === 'user' && <MusicPlayerBar lang=\"en\" themeColor=\"#6366f1\" />}\n" + provider_end + "\n    </ErrorBoundary>")

with open("src/App.tsx", "w") as f:
    f.write(content)
