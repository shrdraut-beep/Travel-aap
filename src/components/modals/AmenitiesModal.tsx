import React from 'react';
import { X, Star, Accessibility, Wifi, PersonStanding, Check } from 'lucide-react';

export interface AmenityCategory {
  title: string;
  icon: React.ReactNode;
  items: string[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  categories: AmenityCategory[];
}

const DEFAULT_CATEGORIES: AmenityCategory[] = [
  { title: 'Popular', icon: <Star size={18} color="#C89B4A" />, items: ['Restaurants', 'Bar'] },
  {
    title: 'Accessibility',
    icon: <Accessibility size={18} color="#C89B4A" />,
    items: ['On-site accessible restaurants / lounges', 'Wheelchair accessible'],
  },
  {
    title: 'Internet access',
    icon: <Wifi size={18} color="#C89B4A" />,
    items: ['Free Wi-Fi in all rooms', 'Wi-Fi in public areas', 'Internet services'],
  },
  {
    title: 'Things to do, ways to relax',
    icon: <PersonStanding size={18} color="#C89B4A" />,
    items: ['Gym/fitness', 'Spa/sauna', 'Swimming pool (outdoor)', 'Swimming pool (indoor)', 'Massage'],
  },
];

export default function AmenitiesModal({ visible, onClose, categories = DEFAULT_CATEGORIES }: Props) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-navy-900/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 h-[85%] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-navy-900">Amenities</h1>
          <button onClick={onClose}><X size={24} className="text-navy-900" /></button>
        </div>
        <div className="flex-1 overflow-y-auto pt-4">
          {categories.map((cat) => (
            <div key={cat.title} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                {cat.icon}
                <h2 className="text-base font-medium text-navy-900">{cat.title}</h2>
              </div>
              {cat.items.map((item) => (
                <div key={item} className="flex items-center gap-2 py-1">
                  <Check size={16} className="text-green-600" />
                  <span className="text-sm text-gray-800">{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
