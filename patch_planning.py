import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

# 1. Imports
imports = """
import { DashboardView } from '../views/DashboardView';
import { MusicPlayerProvider } from '../MusicPlayerContext';
"""
if "import { DashboardView }" not in content:
    content = content.replace("import { TopBar, useScrolled, LogoName } from \"./SharedUI\";", imports + "import { TopBar, useScrolled, LogoName } from \"./SharedUI\";")

# 2. Add translations to PlanningScreen Props/Body
# Wait, DashboardView needs `t` and `currencySymbol` and `userId` and `poolBalance` and `onNavigate`.
# Let's add them to PlanningScreen
dash_state = """
  const t = (key: string) => key; // Dummy translation
  const showToast = (message: string) => alert(message);
"""

if "const packedCount =" in content and "const t = " not in content:
    content = content.replace("const packedCount =", dash_state + "\n  const packedCount =")

# 3. Add DashboardView to JSX
dash_jsx = """
        {/* MERGED HUB DASHBOARD */}
        <div className="mb-6 -mx-4 sm:mx-0">
          <MusicPlayerProvider>
            <DashboardView
              trip={currentTrip}
              lang="en"
              userId={currentUser?.id || ""}
              t={t}
              currencySymbol="₹"
              poolBalance={0}
              onNavigate={(tab) => { if (setActive) setActive(tab); }}
              onVote={(pollId, optionId) => {}}
              onCreatePoll={() => {}}
              onClosePoll={() => {}}
              onSOS={() => { if (onSOS) onSOS(); }}
              onAddPlaylistItem={() => {}}
              onRemovePlaylistItem={() => {}}
              onAddGalleryItem={() => {}}
              onUpdateTrip={(updated) => setCurrentTrip(updated)}
              onShowToast={(m) => showToast(m)}
              onAddDeposit={() => { if (setActive) setActive("expenses"); }}
            />
          </MusicPlayerProvider>
        </div>
"""

content = content.replace("{/* Header Title Card */}", dash_jsx + "\n        {/* Header Title Card */}")

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)

