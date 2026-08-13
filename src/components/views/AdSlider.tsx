import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface AdSliderProps {
  city: string;
}

export const AdSlider: React.FC<AdSliderProps> = ({ city }) => {
  const [ads, setAds] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
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
  }, [city]);

  useEffect(() => {
    if (ads.length <= 1) return;
    
    // Auto-rotating Carousel logic (4 seconds as requested)
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [ads.length]);

  if (ads.length === 0) return null;

  const ad = ads[currentIndex];

  return (
    <div className="w-full h-48 md:h-64 relative overflow-hidden rounded-3xl bg-slate-100 shadow-md mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
            <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider w-fit mb-3">
              Sponsored
            </span>
            <h3 className="text-white font-black text-2xl md:text-3xl leading-tight mb-2">
              {ad.title}
            </h3>
            <p className="text-slate-200 text-sm font-medium line-clamp-2 max-w-2xl">
              {ad.description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {ads.length > 1 && (
        <div className="absolute bottom-4 right-6 flex gap-2">
          {ads.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40'}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
