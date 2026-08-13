import re

with open('src/components/views/AdSlider.tsx', 'r') as f:
    content = f.read()

target = """  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`/api/get-ads?city=${encodeURIComponent(city)}`);
        if (!res.ok) {
          console.warn("Ads API not available or failed to fetch ads");
          return;
        }
        
        const data = await res.json();
        if (data.ads) {
          setAds(data.ads);
        }
      } catch (err) {
        // Silently fail, as ad fetching failure should not block the app
        console.warn("Failed to fetch ads:", err);
      }
    };

    if (city) {
      fetchAds();
    }
  }, [city]);"""

replacement = """  useEffect(() => {
    const fetchAds = async () => {
      try {
        const adsRef = collection(db, 'agent_ads');
        const q = query(adsRef, where('targetCity', '==', city), where('status', '==', 'APPROVED'));
        const snapshot = await getDocs(q);
        
        const now = new Date();
        const fetchedAds: any[] = [];
        snapshot.forEach(doc => {
          const ad = doc.data();
          const startDate = new Date(ad.startDate);
          const endDate = new Date(ad.endDate);
          endDate.setHours(23, 59, 59, 999);
          
          if (now >= startDate && now <= endDate) {
            fetchedAds.push({ id: doc.id, ...ad });
          }
        });

        if (fetchedAds.length === 0) {
          fetchedAds.push({
            id: 'mock-1',
            title: `Explore ${city} with Local Experts`,
            description: `Book highly-rated local tours and secret experiences. Limited time 20% discount.`,
            imageUrl: 'https://images.unsplash.com/photo-1517400508447-f8dd518b86e3?auto=format&fit=crop&q=80&w=1000',
            targetCity: city
          });
          fetchedAds.push({
            id: 'mock-2',
            title: `Luxury Stays in ${city}`,
            description: `Premium 5-star villas available now. Use code WELCOME for free upgrades.`,
            imageUrl: 'https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?auto=format&fit=crop&q=80&w=1000',
            targetCity: city
          });
        }
        
        setAds(fetchedAds);
      } catch (err) {
        console.warn("Failed to fetch ads:", err);
      }
    };

    if (city) {
      fetchAds();
    }
  }, [city]);"""

# Replace the effect
# Notice that spaces in target might not be exact. We can use regex.
pattern = re.compile(r'useEffect\(\(\) => \{.*?if \(city\) \{.*?fetchAds\(\);\n\s*\}\n\s*\}, \[city\]\);', re.DOTALL)
new_content = pattern.sub(replacement, content)

# Add imports
new_content = new_content.replace(
    "import { motion, AnimatePresence } from 'framer-motion';", 
    "import { motion, AnimatePresence } from 'framer-motion';\nimport { collection, query, where, getDocs } from 'firebase/firestore';\nimport { db } from '../../firebase';"
)

with open('src/components/views/AdSlider.tsx', 'w') as f:
    f.write(new_content)
