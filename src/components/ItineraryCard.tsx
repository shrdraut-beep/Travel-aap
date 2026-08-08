import React, { useState, useEffect } from 'react';
import { TripPlan, TransportMode } from '../types';
import { fetchLocationImage, UnsplashImage } from '../services/api/unsplash';
import { MapPin, DollarSign, Clock, Info } from 'lucide-react';
import Markdown from 'react-markdown';

interface ItineraryCardProps {
  plan: TripPlan;
  dayNumber?: number;
  totalDays?: number;
  city?: string;
  transportMode?: TransportMode;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({ plan, dayNumber, totalDays, city, transportMode }) => {
  const [image, setImage] = useState<UnsplashImage | null>(null);

  useEffect(() => {
    if (plan.title) {
      fetchLocationImage(plan.title).then(setImage);
    }
  }, [plan]);

  const hasHotelStay = plan.type === 'hotel' || 
    (plan.detail && (plan.detail.includes('मुक्काम') || plan.detail.includes('Hotel') || plan.detail.includes('Stay'))) ||
    (plan.title && (plan.title.includes('मुक्काम') || plan.title.includes('Hotel') || plan.title.includes('Stay')));

  return (
    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30 shadow-sm flex flex-col sm:flex-row gap-4">
      <div className="flex gap-4 w-full sm:w-auto">
        {image?.thumb ? (
          <img
            src={image.thumb}
            alt={plan.title}
            crossOrigin="anonymous"
            loading="lazy"
            className="w-full h-48 sm:w-40 sm:h-40 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-full h-48 sm:w-40 sm:h-40 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <MapPin className="w-10 h-10 text-white/50" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-white text-base">{plan.title}</h4>
        
        {plan.briefDescription && (
            <p className="text-sm text-white/90 mt-1">{plan.briefDescription}</p>
        )}

        {plan.detail && (
          <div className="text-sm text-white mt-2 prose prose-invert max-w-none">
            <Markdown>{plan.detail}</Markdown>
          </div>
        )}

        {/* Dynamic Booking Logic */}
        {city && dayNumber && totalDays && (
          <>
            {/* Show Hotel booking only if it's a hotel stay AND not last day AND not in transit */}
            {hasHotelStay && dayNumber < totalDays && plan.type !== 'ticket' && (
              <div className="mt-3">
                <a 
                  href={`https://www.agoda.com/search?cid=1969781&textToSearch=${city}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:bg-blue-700 transition duration-300"
                >
                  येथे हॉटेल बुक करा 🏨
                </a>
              </div>
            )}
            
            {/* Show Return Transport if it's last day */}
            {dayNumber === totalDays && (
              <div className="mt-3">
                {transportMode === 'air' ? (
                  <a href="https://www.ixigo.com/flights" className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:bg-orange-600 transition duration-300">
                    परतीचे विमान बुक करा ✈️
                  </a>
                ) : transportMode === 'rail' ? (
                  <a href="https://www.ixigo.com/trains" className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:bg-blue-600 transition duration-300">
                    परतीची ट्रेन बुक करा 🚆
                  </a>
                ) : (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-semibold">
                    🚗 तुमच्या स्वतःच्या कारने सुरक्षित परतीचा प्रवास! 
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/80">
            {plan.exactLocation && (
                <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {plan.exactLocation}
                </div>
            )}
            {plan.realisticCost && (
                <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {plan.realisticCost}
                </div>
            )}
            {plan.travelTime && (
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {plan.travelTime}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
