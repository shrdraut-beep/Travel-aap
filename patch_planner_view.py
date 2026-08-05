import re

with open("src/components/views/PlannerView.tsx", "r") as f:
    content = f.read()

correct_signature = """export const PlannerView: React.FC<PlannerViewProps> = ({ 
  itinerary, 
  trip, 
  userId, 
  onAddPlan, 
  onAddDeposit, 
  onGenerateAI, 
  isAIGenerating, 
  lang, 
  t, 
  currencySymbol, 
  activeSubTab, 
  onSubTabChange, 
  onOpenFuelCalculator, 
  onAddPlaylistItem, 
  onRemovePlaylistItem, 
  onAddGalleryItem, 
  onNavigate, 
  onUpdateTrip, 
  isSharingLocation, 
  onToggleLocationShare,
  themeColor: propThemeColor,
  isTripCompleted 
}) => {"""

content = re.sub(r'export const PlannerView: React\.FC<PlannerViewProps> = \(\{\s*\}\) => \{', correct_signature, content)

with open("src/components/views/PlannerView.tsx", "w") as f:
    f.write(content)

