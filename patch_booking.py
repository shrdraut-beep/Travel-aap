import re

with open("src/components/routripo/BookingScreen.tsx", "r") as f:
    content = f.read()

# Remove PACKAGES array
content = re.sub(r'const PACKAGES = \[\s*\{.*?\}\s*\];', '', content, flags=re.DOTALL)

# Remove the section
content = re.sub(r'<SectionTitle icon=\{Package\}>Available Holiday Packages</SectionTitle>.*?</div>\s*</div>\s*\)\}', '</div>)}', content, flags=re.DOTALL)

with open("src/components/routripo/BookingScreen.tsx", "w") as f:
    f.write(content)
