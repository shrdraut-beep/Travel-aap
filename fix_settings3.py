import re

with open("src/components/routripo/SettingsScreen.tsx", "r") as f:
    content = f.read()

content = re.sub(r'false\s*\?\s*"खाते हटवताना त्रुटी आली\. कृपया पुन्हा प्रयत्न करा\."\s*:\s*', '', content)
# Also change any Remaining labels
content = content.replace('मराठी (गावठी मोड 🚩)', 'Marathi (Local Mode 🚩)')
content = content.replace('हिंदी (भाईगिरी मोड 💪)', 'Hindi (Bhaigiri Mode 💪)')
content = content.replace('₹ INR (भारतीय रुपये)', '₹ INR (Indian Rupee)')

with open("src/components/routripo/SettingsScreen.tsx", "w") as f:
    f.write(content)
print("Cleaned up SettingsScreen.tsx")
