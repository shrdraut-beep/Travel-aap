import re

with open('src/components/views/CommunityHubView.tsx', 'r') as f:
    content = f.read()

target = """      <AnimatePresence>"""

replacement = """      </div>
      <AnimatePresence>"""

content = content.replace(target, replacement)

with open('src/components/views/CommunityHubView.tsx', 'w') as f:
    f.write(content)
