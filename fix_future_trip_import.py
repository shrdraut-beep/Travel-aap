import sys

with open('src/components/modals/FutureTripModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import React, { useState } from 'react';", 
    "import React, { useState } from 'react';\nimport { SmartBudgetModal } from './SmartBudgetModal';\nimport { Calculator, Wallet } from 'lucide-react';"
)

with open('src/components/modals/FutureTripModal.tsx', 'w') as f:
    f.write(content)

print("Fixed FutureTripModal imports")
