import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Train, Building2, Bus } from 'lucide-react';
import { FlightSearchTab } from './travel/FlightSearchTab';
import { HotelSearchTab } from './travel/HotelSearchTab';
import { TrainInfoTab } from './travel/TrainInfoTab';
import { BusSearchTab } from './travel/BusSearchTab';
import { BookingItemPayload } from '../pages/CheckoutPage';
import { useNavigate } from 'react-router-dom';

interface SharedBookingWidgetProps {
  lang: string;
  currencySymbol: string;
}

export const SharedBookingWidget: React.FC<SharedBookingWidgetProps> = ({
  lang,
  currencySymbol,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'flights' | 'buses' | 'trains'>('flights');

  const handleBookNow = (item: BookingItemPayload) => {
    navigate('/checkout', { state: { item, currencySymbol, lang } });
  };

  const handleTabClick = (id: any) => {
    setActiveTab(id);
  };

  const tabs = [
    {
      id: 'flights',
      label: lang === 'mr' ? 'विमान (Flights)' : 'Flights',
      icon: Plane,
      color: 'text-blue-600',
      activeBg: 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
    },
    {
      id: 'buses',
      label: lang === 'mr' ? 'बस (Buses)' : 'Buses',
      icon: Bus,
      color: 'text-emerald-600',
      activeBg: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
    },
    {
      id: 'trains',
      label: lang === 'mr' ? 'ट्रेन (Trains)' : 'Trains',
      icon: Train,
      color: 'text-amber-600',
      activeBg: 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Modern 3-Tab Segmented Controller */}
      <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-3 gap-1.5 shadow-inner border border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as any)}
              className={`py-3 px-1 sm:px-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all ${
                isActive
                  ? `${tab.activeBg} scale-[1.02]`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
              <span className="truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated Tab Content Switcher */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'flights' && (
            <FlightSearchTab lang={lang} currencySymbol={currencySymbol} onBookNow={handleBookNow} />
          )}
          {activeTab === 'buses' && (
            <BusSearchTab lang={lang} currencySymbol={currencySymbol} onBookNow={handleBookNow} />
          )}
          {activeTab === 'trains' && (
            <TrainInfoTab lang={lang} currencySymbol={currencySymbol} onBookNow={handleBookNow} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
