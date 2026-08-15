import re

with open('src/components/views/CommunityHubView.tsx', 'r') as f:
    content = f.read()

# find <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
# and the next <div className="bg-white rounded-[28px]
content = re.sub(
    r'(<div className="flex-1 flex flex-col min-h-screen bg-slate-50">)\s*<div className="bg-white rounded-\[28px\]',
    r'\1\n      <div className="px-4 sm:px-5 mt-2 space-y-4 max-w-4xl mx-auto">\n        <div className="bg-white rounded-[28px]',
    content
)

with open('src/components/views/CommunityHubView.tsx', 'w') as f:
    f.write(content)
