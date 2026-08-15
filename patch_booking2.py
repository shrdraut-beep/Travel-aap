import re

with open("src/components/routripo/BookingScreen.tsx", "r") as f:
    content = f.read()

# Add empty state
replacement = """                </Card>
                <div className="py-12 text-center text-slate-500 text-sm font-medium">
                  No holiday packages available at the moment.
                </div>
              </div>)}"""
content = content.replace("                </Card>\n                </div>)}", replacement)

with open("src/components/routripo/BookingScreen.tsx", "w") as f:
    f.write(content)
