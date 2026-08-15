import re
with open("vite.config.ts", "r") as f:
    content = f.read()

if "dedupe:" not in content:
    content = content.replace(
        "resolve: {",
        "resolve: {\n    dedupe: ['react', 'react-dom'],"
    )
    with open("vite.config.ts", "w") as f:
        f.write(content)
