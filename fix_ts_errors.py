import sys
import re

with open('src/components/modals/CreateTripModal.tsx', 'r') as f:
    content = f.read()

# Fix lucide-react imports
lucide_import_pattern = r"import \{ (.*?) \} from 'lucide-react';"
def add_lucide_imports(match):
    imports = match.group(1).split(', ')
    new_imports = [i for i in ['Wallet', 'Calculator'] if i not in imports]
    if new_imports:
        return f"import {{ {', '.join(imports + new_imports)} }} from 'lucide-react';"
    return match.group(0)

content = re.sub(lucide_import_pattern, add_lucide_imports, content, count=1)

# Add SmartBudgetModal import
if 'SmartBudgetModal' not in content:
    content = content.replace("import { OldTripImportModal } from './OldTripImportModal';", "import { OldTripImportModal } from './OldTripImportModal';\nimport { SmartBudgetModal } from './SmartBudgetModal';")

# Add totalBudget to initialData type
initial_data_pattern = r"initialData\?: \{\s+name: string;\s+startDate: string;\s+endDate: string;\s+calculationMode\?: CalculationMode;\s+defaultCurrency\?: string;\s+themeColor\?: string;\s+members: \{name: string; deposit: string; upiId\?: string; isAdmin: boolean\}\[\];\s+\};"
new_initial_data = r"initialData?: { name: string; startDate: string; endDate: string; calculationMode?: CalculationMode; defaultCurrency?: string; themeColor?: string; totalBudget?: number; members: {name: string; deposit: string; upiId?: string; isAdmin: boolean}[]; };"
content = re.sub(initial_data_pattern, new_initial_data, content)

with open('src/components/modals/CreateTripModal.tsx', 'w') as f:
    f.write(content)

with open('src/components/modals/FutureTripModal.tsx', 'r') as f:
    future_content = f.read()

if 'SmartBudgetModal' not in future_content:
    future_content = future_content.replace("import React,", "import { SmartBudgetModal } from './SmartBudgetModal';\nimport React,")
    with open('src/components/modals/FutureTripModal.tsx', 'w') as f:
        f.write(future_content)

print("Fixed TS errors")
