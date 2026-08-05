import React, { useState, useEffect } from 'react';
import { TripPlan } from '../types';
import { fetchLocationImage, UnsplashImage } from '../services/api/unsplash';
import { MapPin, DollarSign, Clock, Info } from 'lucide-react';

interface ItineraryCardProps {
  plan: TripPlan;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({ plan }) => {
  const [image, setImage] = useState<UnsplashImage | null>(null);

  useEffect(() => {
    if (plan.title) {
      fetchLocationImage(plan.title).then(setImage);
    }
  }, [plan]);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
      {image?.thumb ? (
        <img
          src={image.thumb}
          alt={plan.title}
          crossOrigin="anonymous"
          loading="lazy"
          className="w-20 h-20 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <MapPin className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <div className="flex-1">
        <h4 className="font-bold text-slate-900">{plan.title}</h4>
        
        {plan.briefDescription && (
            <p className="text-sm text-slate-600 mt-1">{plan.briefDescription}</p>
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
