import re

with open("src/components/views/DashboardView.tsx", "r") as f:
    content = f.read()

# Trip Awards Banner
content = re.sub(r'\{\/\* Trip Awards Banner \*\/\}\s*<TripAwardsBanner trip=\{trip\} lang=\{lang\} />', '', content)

# VoiceTranslator
content = re.sub(r'\{\/\* Local Lingo \(Voice Translator\) \*\/\}.*?(?=\{\/\* Itinerary Tab Alerts \*\/\})', '', content, flags=re.DOTALL)
content = re.sub(r'\{activeSubTab === \'playlist\' && <VoiceTranslator lang=\{lang\} />\}', '', content)

# TimepassGame
content = re.sub(r'\{\/\* Timepass Tab \*\/\}\s*\{activeSubTab === \'timepass\' && \(\s*<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">\s*<TimepassGame trip=\{trip\} lang=\{lang\} />\s*</div>\s*\)\}', '', content)

with open("src/components/views/DashboardView.tsx", "w") as f:
    f.write(content)

print("Removed elements from DashboardView")
