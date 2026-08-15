import re

with open("src/components/routripo/SettingsScreen.tsx", "r") as f:
    content = f.read()

# Remove Pravas Wataghati span block
pravas_pattern = r'<span className="inline-flex items-center gap-1\.5 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-800 text-\[11px\] font-bold">\s*<Info className="w-3\.5 h-3\.5 text-indigo-600" />\s*<span>प्रवास वाटाघाटी \(Pravas Wataghati\)</span>\s*</span>'
content = re.sub(pravas_pattern, '', content)

# Change email
content = content.replace("shrd.raut@gmail.com", "contact@raoutripo.com")

# Change alerts
alert1_pattern = r'lang === "mr"\s*\?\s*"सुरक्षेच्या कारणास्तव, खाते हटवण्यापूर्वी पुन्हा लॉग इन करणे आवश्यक आहे\."\s*:\s*"For security reasons, please re-authenticate before deleting your account\."'
content = re.sub(alert1_pattern, '"For security reasons, please re-authenticate before deleting your account."', content)

alert2_pattern = r'lang === "mr"\s*\?\s*"खाते हटवताना त्रुटी आली\. कृपया पुन्हा प्रयत्न करा\."\s*:\s*"Error deleting account\. Please try again\."'
content = re.sub(alert2_pattern, '"Error deleting account. Please try again."', content)

with open("src/components/routripo/SettingsScreen.tsx", "w") as f:
    f.write(content)
print("Fixed SettingsScreen.tsx")
