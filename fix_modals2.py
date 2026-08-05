import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    modified = False

    # Also handle regular div cards
    modal_card_pattern = r'(<div[^>]*?className="[^"]*bg-white[^"]*rounded[^"]*w-full max-w-(?:xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|7xl)[^"]*?")'
    def replace_card(m):
        cls = m.group(1)
        if 'flex flex-col' not in cls:
            cls = cls[:-1] + ' flex flex-col"'
        if 'max-h-' not in cls:
            cls = cls[:-1] + ' max-h-[85vh]"'
        return cls

    content = re.sub(modal_card_pattern, replace_card, content)

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath} with div card")

for root, dirs, files in os.walk('src/components/modals'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.jsx'):
            process_file(os.path.join(root, file))
