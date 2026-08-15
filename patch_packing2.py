import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

# Replace packing list state
content = re.sub(
    r"  // Packing List State.*?  \}, \[packingItems\]\);",
    """  // Packing List State
  const packingItems = currentTrip.packingList?.length ? currentTrip.packingList : INITIAL_PACKING_ITEMS;
  const [newPackingName, setNewPackingName] = useState("");
  const [newPackingCategory, setNewPackingCategory] = useState("Essentials");""",
    content,
    flags=re.DOTALL
)

# Replace toggling
content = re.sub(
    r"  // Toggle Packing Checkbox.*?setNewPackingName\(\"\"\);\n  \};",
    """  // Toggle Packing Checkbox
  const togglePackingItem = (id: string) => {
    setCurrentTrip(prev => {
      const currentList = prev.packingList?.length ? prev.packingList : INITIAL_PACKING_ITEMS;
      return {
        ...prev,
        packingList: currentList.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item)
      };
    });
  };

  // Add Packing Item
  const handleAddPackingItem = () => {
    if (!newPackingName.trim()) return;
    const newItem: PackingItem = {
      id: `pk-${Date.now()}`,
      name: newPackingName.trim(),
      isChecked: false,
      category: newPackingCategory
    };
    setCurrentTrip(prev => {
      const currentList = prev.packingList?.length ? prev.packingList : INITIAL_PACKING_ITEMS;
      return {
        ...prev,
        packingList: [...currentList, newItem]
      };
    });
    setNewPackingName("");
  };""",
    content,
    flags=re.DOTALL
)

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)
