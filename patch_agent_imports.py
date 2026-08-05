import re

with open('src/components/views/AgentPortalView.tsx', 'r') as f:
    content = f.read()

import_lucide = re.search(r"import {([^}]+)} from 'lucide-react';", content)
if import_lucide:
    imports = import_lucide.group(1)
    if 'Star' not in imports:
        imports += ",  Star"
    if 'MessageCircle' not in imports:
        imports += ",  MessageCircle"
    content = content.replace(import_lucide.group(1), imports)

with open('src/components/views/AgentPortalView.tsx', 'w') as f:
    f.write(content)

