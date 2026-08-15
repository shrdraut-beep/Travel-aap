with open('src/components/views/CommunityHubView.tsx', 'r') as f:
    content = f.read()

content = content.replace("      </div>\n      <AnimatePresence>", "      <AnimatePresence>")
# Now apply it ONLY to the second AnimatePresence
content = content.replace("      {/* TRIP TEMPLATE DETAIL MODAL */}\n      <AnimatePresence>", "      </div>\n      {/* TRIP TEMPLATE DETAIL MODAL */}\n      <AnimatePresence>")

with open('src/components/views/CommunityHubView.tsx', 'w') as f:
    f.write(content)
