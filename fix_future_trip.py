import sys

with open('src/components/modals/FutureTripModal.tsx', 'r') as f:
    content = f.read()

# Replace return (
content = content.replace("  return (\n    <div className=\"fixed inset-0 z-[100]", 
"""  return (
    <>
      <SmartBudgetModal
        isOpen={showSmartBudget}
        onClose={() => setShowSmartBudget(false)}
        lang={lang}
        destination={destination}
        days={parseInt(days) || 3}
        persons={parseInt(persons) || 2}
        transportMode={transport}
        onApplyBudget={(total) => setBudget(total.toString())}
      />
    <div className="fixed inset-0 z-[100]""")

with open('src/components/modals/FutureTripModal.tsx', 'w') as f:
    f.write(content)
print("Fixed FutureTripModal return")
