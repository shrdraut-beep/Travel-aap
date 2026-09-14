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
      label: lang === 'mr' ? 'विमान' : 'Flights',
      icon: Plane,
      imgSrc: '/icons/flight.png',
      color: 'text-rose-600',
      activeBg: 'bg-white text-rose-600 shadow-md border-b-2 border-rose-600'
    },
    {
      id: 'buses',
      label: lang === 'mr' ? 'बस' : 'Buses',
      icon: Bus,
      imgSrc: '/icons/bus.png',
      color: 'text-sky-600',
      activeBg: 'bg-white text-sky-600 shadow-md border-b-2 border-sky-600'
    },
    {
      id: 'trains',
      label: lang === 'mr' ? 'रेल्वे' : 'Trains',
      icon: Train,
      imgSrc: '/icons/train.png',
      color: 'text-amber-600',
      activeBg: 'bg-white text-amber-600 shadow-md border-b-2 border-amber-600'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* 3-Tab Segmented Controller with Borderless Floating 3D Icons */}
      <div className="bg-slate-100/80 p-1.5 rounded-[20px] grid grid-cols-3 gap-1.5 shadow-inner border border-slate-200/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as any)}
              className={`py-2 px-1 sm:px-3 rounded-[16px] font-black text-[11px] uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? tab.activeBg
                  : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
            >
              {tab.imgSrc ? (
                <img src={tab.imgSrc} alt={tab.label} className={`w-8 h-8 object-contain transition-transform ${isActive ? 'scale-110 drop-shadow-md' : 'opacity-80'}`} />
              ) : (
                <Icon className="w-6 h-6" />
              )}
              <span>{tab.label}</span>
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
