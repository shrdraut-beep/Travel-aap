import React, { useState, useEffect } from 'react';
import { fetchLocationImage } from '../../services/api/unsplash';

const imageCache: Record<string, string> = {};

interface DynamicTripImageProps {
  destName: string;
  fallbackUrl?: string;
  alt?: string;
  className?: string;
}

export const DynamicTripImage: React.FC<DynamicTripImageProps> = ({ 
  destName, 
  fallbackUrl = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80", 
  alt = "Trip Image",
  className = "w-full h-full object-cover"
}) => {
  const [url, setUrl] = useState(imageCache[destName] || fallbackUrl);

  useEffect(() => {
    if (!destName) return;
    
    if (imageCache[destName]) {
      setUrl(imageCache[destName]);
      return;
    }

    let mounted = true;
    fetchLocationImage(destName)
      .then(img => {
        if (mounted && img && img.url && img.url !== fallbackUrl) {
          imageCache[destName] = img.url;
          setUrl(img.url);
        }
      })
      .catch(e => console.error("Error fetching location image:", e));

    return () => { mounted = false; };
  }, [destName, fallbackUrl]);

  return <img src={url} alt={alt || destName} className={className} crossOrigin="anonymous" />;
};
