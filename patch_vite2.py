import re
with open("vite.config.ts", "r") as f:
    content = f.read()

if "optimizeDeps:" not in content:
    content = content.replace(
        "resolve: {",
        "optimizeDeps: { include: ['react', 'react-dom', 'react-leaflet', 'leaflet'] },\n  resolve: {"
    )
    with open("vite.config.ts", "w") as f:
        f.write(content)
