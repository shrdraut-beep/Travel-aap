import re

with open("server.ts", "r") as f:
    content = f.read()

content = re.sub(r'app\.get\("/api/admin/users", \(req, res\) => \{.*?\n\}\);\n', '', content, flags=re.DOTALL)
content = re.sub(r'app\.get\("/api/admin/tickets", \(req, res\) => \{.*?\n\}\);\n', '', content, flags=re.DOTALL)
content = re.sub(r'app\.get\("/api/admin/metrics", \(req, res\) => \{.*?\n\}\);\n', '', content, flags=re.DOTALL)

with open("server.ts", "w") as f:
    f.write(content)
