import React, { useState, useEffect } from 'react';
import { TripPlan, TransportMode } from '../types';
import { fetchLocationImage, UnsplashImage } from '../services/api/unsplash';
import { MapPin, DollarSign, Clock, Info } from 'lucide-react';
import Markdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';

interface ItineraryCardProps {
  plan: TripPlan;
  dayNumber?: number;
  totalDays?: number;
  city?: string;
  transportMode?: TransportMode;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({ plan, dayNumber, totalDays, city, transportMode }) => {
  const [image, setImage] = useState<UnsplashImage | null>(null);
  const { lang } = useLanguage();

  useEffect(() => {
    if (plan.title) {
      fetchLocationImage(plan.title).then(setImage);
    }
  }, [plan]);

  const hasHotelStay = plan.type === 'hotel' || 
    (plan.detail && (plan.detail.includes('मुक्काम') || plan.detail.includes('Hotel') || plan.detail.includes('Stay'))) ||
    (plan.title && (plan.title.includes('मुक्काम') || plan.title.includes('Hotel') || plan.title.includes('Stay')));

  return (
    <div className="bg-transparent p-4 rounded-[16px] border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
      <div className="flex gap-4 w-full sm:w-auto">
        {image?.thumb ? (
          <img
            src={image.thumb}
            alt={plan.title}
            crossOrigin="anonymous"
            loading="lazy"
            className="w-full h-48 sm:w-40 sm:h-40 rounded-[16px] object-cover shrink-0 border border-slate-200"
          />
        ) : (
          <div className="w-full h-48 sm:w-40 sm:h-40 rounded-[16px] bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
            <MapPin className="w-10 h-10 text-slate-300" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-slate-800 text-base">{plan.title}</h4>
        
        {plan.briefDescription && (
            <p className="text-sm text-slate-600 mt-1">{plan.briefDescription}</p>
        )}

        {plan.detail && (
          <div className="text-sm text-slate-600 mt-2 prose prose-slate prose-sm max-w-none">
            <Markdown>{plan.detail}</Markdown>
          </div>
        )}

        {/* Dynamic Booking Logic */}
        {city && dayNumber && totalDays && (
          <>

            
            {/* Show Return Transport if it's last day */}
            {dayNumber === totalDays && (
              <div className="mt-3">
                {transportMode === 'air' ? (
                  <a href="https://www.ixigo.com/flights" className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] hover:bg-orange-600 transition duration-300">
                    {lang === 'mr' ? 'परतीचे विमान बुक करा ✈️' : lang === 'hi' ? 'रिटर्न फ्लाइट बुक करें ✈️' : 'Book Return Flight ✈️'}
                  </a>
                ) : transportMode === 'rail' ? (
                  <a href="https://www.ixigo.com/trains" className="inline-block bg-rose-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] hover:bg-rose-600 transition duration-300">
                    {lang === 'mr' ? 'परतीची ट्रेन बुक करा 🚆' : lang === 'hi' ? 'रिटर्न ट्रेन बुक करें 🚆' : 'Book Return Train 🚆'}
                  </a>
                ) : (
                  <div className="bg-pink-100 text-pink-800 px-4 py-2 rounded-lg text-sm font-semibold">
                    {lang === 'mr' ? '🚗 तुमच्या स्वतःच्या कारने सुरक्षित परतीचा प्रवास!' : lang === 'hi' ? '🚗 अपनी कार से सुरक्षित वापसी यात्रा!' : '🚗 Safe return journey in your own car!'}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
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
