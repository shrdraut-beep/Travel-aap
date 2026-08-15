import re

with open("src/components/routripo/PlanningScreen.tsx", "r") as f:
    content = f.read()

# Replace state and useEffect
target1 = """  // Packing List State
  const [packingItems, setPackingItems] = useState<PackingItem[]>(() => {
    const saved = localStorage.getItem("routripo_packing_items");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_PACKING_ITEMS;
  });
  const [newPackingName, setNewPackingName] = useState("");
  const [newPackingCategory, setNewPackingCategory] = useState("Essentials");

  useEffect(() => {
    localStorage.setItem("routripo_packing_items", JSON.stringify(packingItems));
  }, [packingItems]);"""

replacement1 = """  // Packing List State
  const packingItems = currentTrip.packingList?.length ? currentTrip.packingList : INITIAL_PACKING_ITEMS;
  const [newPackingName, setNewPackingName] = useState("");
  const [newPackingCategory, setNewPackingCategory] = useState("Essentials");"""

content = content.replace(target1, replacement1)

target2 = """  // Toggle Packing Checkbox
  const togglePackingItem = (id: string) => {
    setPackingItems(prev => prev.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
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
    setPackingItems(prev => [...prev, newItem]);
    setNewPackingName("");
  };"""

replacement2 = """  // Toggle Packing Checkbox
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
  };"""

content = content.replace(target2, replacement2)

with open("src/components/routripo/PlanningScreen.tsx", "w") as f:
    f.write(content)

