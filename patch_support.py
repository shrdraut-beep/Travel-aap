import re

with open('src/components/views/SupportTicketView.tsx', 'r') as f:
    content = f.read()

# I will find the handleSubmit function
# The code currently does: const res = await authedFetch('/api/support/ticket', { ... })
# Let's replace the fetch part

new_content = content.replace(
    "const res = await authedFetch('/api/support/ticket', {",
    """
      const ticketId = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
      const docRef = doc(db, 'support_tickets', ticketId);
      await setDoc(docRef, {
        ticketId,
        userEmail: auth.currentUser?.email || '',
        category,
        description,
        hasAttachment: !!fileBase64,
        fileName: file?.name || null,
        status: 'OPEN',
        createdAt: serverTimestamp()
      });
      // Mock response since we don't actually fetch anymore
      const res = { ok: true, json: async () => ({ ticketId }) };
      if (false) {
"""
)

new_content = new_content.replace(
    "const data = await res.json();",
    """}
      const data = { ticketId };"""
)

# Need to make sure we import doc, setDoc, serverTimestamp, db, auth
new_content = new_content.replace(
    "import { authedFetch } from '../../utils/apiClient';",
    "import { authedFetch } from '../../utils/apiClient';\nimport { doc, setDoc, serverTimestamp } from 'firebase/firestore';\nimport { db, auth } from '../../firebase';"
)

with open('src/components/views/SupportTicketView.tsx', 'w') as f:
    f.write(new_content)
