import { ScrollView } from '../ScrollView';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Fuel, Coffee, ShieldPlus, Wrench, Loader2, Navigation } from 'lucide-react';
import { fetchNearbyUtilities, OSMPlace } from '../../services/api/osm';

interface NearbyUtilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export const NearbyUtilitiesModal: React.FC<NearbyUtilitiesModalProps> = ({ isOpen, onClose, lang }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hospitals' | 'atms' | 'fuel' | 'mechanics'>('hospitals');
  const [data, setData] = useState<{hospitals: OSMPlace[], atms: OSMPlace[], fuel: OSMPlace[], mechanics: OSMPlace[]}>({
    hospitals: [], atms: [], fuel: [], mechanics: []
  });

  useEffect(() => {
    if (!isOpen) return;

    const fetchPlaces = async (lat: number, lon: number) => {
      setLoading(true);
      const res = await fetchNearbyUtilities(lat, lon, 10000); // 10km radius
      setData(res);
      setLoading(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchPlaces(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          // Fallback coordinate (e.g. Mumbai)
          fetchPlaces(19.0760, 72.8777);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      fetchPlaces(19.0760, 72.8777);
    }
  }, [isOpen]);

  const tabs = [
    { id: 'hospitals', icon: ShieldPlus, label: lang === 'mr' ? 'दवाखाना' : 'Hospitals', color: 'text-rose-500', bg: 'bg-rose-100' },
    { id: 'fuel', icon: Fuel, label: lang === 'mr' ? 'पेट्रोल पंप' : 'Fuel', color: 'text-amber-500', bg: 'bg-amber-100' },
    { id: 'mechanics', icon: Wrench, label: lang === 'mr' ? 'गॅरेज' : 'Mechanics', color: 'text-slate-700', bg: 'bg-slate-200' },
    { id: 'atms', icon: Coffee, label: 'ATM', color: 'text-blue-500', bg: 'bg-blue-100' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-slate-50 w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              {lang === 'mr' ? 'जवळपासच्या सुविधा (OSM)' : 'Nearby Utilities'}
            </h3>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-white border-b border-slate-100">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x pb-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shrink-0 snap-center transition-all ${
                    activeTab === tab.id ? `${tab.bg} ${tab.color} shadow-sm` : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto p-4    ">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                <p className="font-bold uppercase tracking-wider text-sm">
                  {lang === 'mr' ? 'शोधत आहे...' : 'Scanning area...'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data[activeTab].length === 0 ? (
                  <div className="text-center py-8 text-slate-500 font-medium">
                    {lang === 'mr' ? 'काहीही आढळले नाही.' : 'No places found nearby.'}
                  </div>
                ) : (
                  data[activeTab].map((place, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 capitalize">{place.name}</h4>
                        {place.distance && (
                          <p className="text-xs text-slate-500 font-medium mt-1">{(place.distance / 1000).toFixed(1)} km away</p>
                        )}
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
