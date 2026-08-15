import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Change initial active tab
content = content.replace('const [active, setActive] = useState("hub");', 'const [active, setActive] = useState("planning");')
content = content.replace("setActive('hub')", "setActive('planning')")
content = content.replace("onBack={() => setActive('hub')}", "onBack={() => setActive('planning')}")
content = content.replace("setActive('hub')", "setActive('planning')")

# Remove HubScreen render
hub_render = """
            {role === 'user' && active === 'hub' && (
              <HubScreen 
                 setActive={handleSetActive} 
                 onLogout={handleLogout} 
                 onSOS={() => setIsSosOpen(true)}
                onOpenCreateTrip={() => setActive('new-trip')}
                onOpenPlanner={() => setActive('smart-planner')}
              />
            )}
"""

# Try removing exact or via regex
content = re.sub(r"\{\s*role === 'user' && active === 'hub' && \(\s*<HubScreen.*?\/>\s*\)\s*\}", "", content, flags=re.DOTALL)
# Or manually replace if there's an issue.

with open("src/App.tsx", "w") as f:
    f.write(content)
