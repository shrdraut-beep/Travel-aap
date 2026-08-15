import re

with open("src/components/views/DashboardView.tsx", "r") as f:
    content = f.read()

# Remove from {/* Agoda Image Banner */} to </a>\n        </div>
agoda_pattern = r"\{/\*\s*Agoda Image Banner\s*\*/\}\s*<div.*?</a>\s*</div>"
content = re.sub(agoda_pattern, "", content, flags=re.DOTALL)

with open("src/components/views/DashboardView.tsx", "w") as f:
    f.write(content)
