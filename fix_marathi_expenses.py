import re

with open("src/components/views/ExpensesTabContainer.tsx", "r") as f:
    content = f.read()

# Replace lang === 'mr' ? 'मराठी' : 'English' patterns with just 'English'
replacements = [
    (r"lang === 'mr' \? 'डाऊनलोड करण्यासाठी कोणताही खर्च आढळला नाही\.' : 'No expenses available to export\.'", r"'No expenses available to export.'"),
    (r"'अ\.क्र\. \(Sr\. No\)':", r"'Sr. No':"),
    (r"'दिनांक \(Date\)':", r"'Date':"),
    (r"'खर्चाचा तपशील \(Title\)':", r"'Title':"),
    (r"'प्रकार \(Category\)':", r"'Category':"),
    (r"'रक्कम \(Amount\)':", r"'Amount':"),
    (r"'कोणी दिले \(Paid By\)':", r"'Paid By':"),
    (r"'सहभागी \(Split With\)':", r"'Split With':"),
    (r"\{lang === 'mr' \? 'एकूण सहल खर्च' : 'Total Trip Expense'\}", r"Total Trip Expense"),
    (r"\{lang === 'mr' \? \(rawPercent > 100 \? 'अतिरिक्त' : 'बजेट'\) : 'Budget'\}", r"Budget"),
    (r"\{lang === 'mr' \? 'प्रति व्यक्ती सरासरी' : 'Avg Per Person'\}", r"Avg Per Person"),
    (r"\{lang === 'mr' \? 'सभासद' : 'members'\}", r"members"),
    (r"\{lang === 'mr' \? 'एकूण बजेट / जमा' : 'Total Budget'\}", r"Total Budget"),
    (r"\{lang === 'mr' \? 'अतिरिक्त खर्च:' : 'Deficit:'\}", r"Deficit:"),
    (r"\{lang === 'mr' \? 'शिल्लक:' : 'Left:'\}", r"Left:"),
    (r"\{lang === 'mr' \? 'खर्च यादी' : 'Expenses'\}", r"Expenses"),
    (r"\{lang === 'mr' \? 'हिशोब' : 'Settlement'\}", r"Settlement"),
    (r"\{lang === 'mr' \? 'रिपोर्ट डाऊनलोड:' : 'Export Report:'\}", r"Export Report:")
]

for p, r in replacements:
    content = re.sub(p, r, content)

with open("src/components/views/ExpensesTabContainer.tsx", "w") as f:
    f.write(content)
print("Fixed ExpensesTabContainer")
