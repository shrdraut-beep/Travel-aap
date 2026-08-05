import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    modified = False

    # Find modal wrappers that might need max-h-[85vh] flex flex-col
    # Usually they look like <motion.div ... className="... rounded... w-full max-w-... overflow-hidden ..." ...>
    # or they are just <div className="... rounded... w-full max-w-... overflow-hidden">
    # We want to ensure they have max-h-[85vh] and flex flex-col.
    # We will search for common modal patterns.
    
    # 1. Add max-h-[85vh] and flex flex-col to modal cards
    # A modal card is typically inside a `fixed inset-0` div.
    modal_card_pattern = r'(<motion\.div[^>]*?className="[^"]*w-full max-w-(?:xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|7xl)[^"]*?")'
    def replace_card(m):
        cls = m.group(1)
        if 'flex flex-col' not in cls:
            cls = cls[:-1] + ' flex flex-col"'
        if 'max-h-' not in cls:
            cls = cls[:-1] + ' max-h-[85vh]"'
        return cls

    content = re.sub(modal_card_pattern, replace_card, content)
    
    # 2. Add pb-[30px] and flex-1 to overflow-y-auto containers inside modals
    # Often these are the main content wrappers.
    # We look for className="... overflow-y-auto ..."
    scroll_pattern = r'(className="[^"]*overflow-y-auto[^"]*?")'
    def replace_scroll(m):
        cls = m.group(1)
        # Ensure it has flex-1
        if 'flex-1' not in cls and 'flex-grow' not in cls:
            cls = cls[:-1] + ' flex-1"'
        # Ensure it has pb-[30px] or pb-8
        if 'pb-' not in cls:
            cls = cls[:-1] + ' pb-[30px]"'
        # Ensure scrollbar hidden
        if '[&::-webkit-scrollbar]:hidden' not in cls and 'no-scrollbar' not in cls:
            cls = cls[:-1] + ' [&::-webkit-scrollbar]:hidden"'
        return cls

    content = re.sub(scroll_pattern, replace_scroll, content)

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.jsx'):
            process_file(os.path.join(root, file))
