import re

with open('src/components/routripo/SharedUI.tsx', 'r') as f:
    content = f.read()

# Remove the mock notifications logic
content = re.sub(
    r'const \[notifications, setNotifications\] = useState\(\[\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},?\s*\]\);',
    r'const [notifications, setNotifications] = useState<any[]>([]);',
    content
)

with open('src/components/routripo/SharedUI.tsx', 'w') as f:
    f.write(content)
