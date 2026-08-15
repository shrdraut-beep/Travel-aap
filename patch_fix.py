import re

with open("src/components/modals/CreateTripModal.tsx", "r") as f:
    content = f.read()

# Fix the broken nested ternary
content = content.replace("lang === 'mr' ? 'सहल अपडेट करा' : 'Update Trip' : (lang === 'mr' ? 'नवीन सहल सुरू करा' : 'Start a new trip')", "(lang === 'mr' ? 'सहल अपडेट करा' : 'Update Trip') : (lang === 'mr' ? 'नवीन सहल सुरू करा' : 'Start a new trip')")
content = content.replace("lang === 'mr' ? 'सहल अपडेट करा' : 'Update Trip' : (lang === 'mr' ? 'सहल तयार करा' : 'Create Trip')", "(lang === 'mr' ? 'सहल अपडेट करा' : 'Update Trip') : (lang === 'mr' ? 'सहल तयार करा' : 'Create Trip')")

with open("src/components/modals/CreateTripModal.tsx", "w") as f:
    f.write(content)
