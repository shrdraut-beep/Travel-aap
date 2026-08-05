import React, { useState, useEffect } from 'react';
import { TripGroup } from '../../types';
import { ExplorePackagesView } from './ExplorePackagesView';
import { FlightSearchTab } from '../travel/FlightSearchTab';
import { HotelSearchTab } from '../travel/HotelSearchTab';
import { TrainInfoTab } from '../travel/TrainInfoTab';
import { BusSearchTab } from '../travel/BusSearchTab';
import { Compass, Ticket, Building2, CheckCircle2, Plane, Train, Bus, X } from 'lucide-react';

export const TRAVELPAYOUTS_MARKER = "554147";

interface BookingsViewProps {
  trip: TripGroup;
  lang: string;
  t: (key: string) => string;
  currencySymbol: string;
  themeColor?: string;
  onUpdateTrip?: (updatedTrip: TripGroup) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  trip,
  lang,
  t,
  currencySymbol,
  themeColor = '#2563eb'
}) => {
  const [activeModal, setActiveModal] = useState<'packages' | 'flights' | 'hotels' | 'trains' | 'buses' | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen w-full p-4 sm:p-6 pb-44 sm:pb-36 space-y-6 max-w-5xl mx-auto">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[300] bg-slate-900 text-white px-5 py-3 rounded-2xl font-extrabold text-xs shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Clean Grid Layout of Standalone Card Buttons (2 columns) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveModal('packages')}
          className="p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all shadow-sm bg-gradient-to-br from-[#f3e8ff] to-[#faf5ff] border border-[#e9d5ff] hover:shadow-md active:scale-95 text-slate-800"
        >
          <span className="text-3xl drop-shadow-sm">🏝️</span>
          <span className="font-extrabold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'टूर पॅकेजेस' : 'Tour Packages'}</span>
        </button>

        <button
          onClick={() => setActiveModal('flights')}
          className="p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all shadow-sm bg-gradient-to-br from-[#e0f2fe] to-[#f0f9ff] border border-[#bae6fd] hover:shadow-md active:scale-95 text-slate-800"
        >
          <span className="text-3xl drop-shadow-sm">✈️</span>
          <span className="font-extrabold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'विमान' : 'Flights'}</span>
        </button>

        <button
          onClick={() => setActiveModal('hotels')}
          className="p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all shadow-sm bg-gradient-to-br from-[#ffedd5] to-[#fff7ed] border border-[#fed7aa] hover:shadow-md active:scale-95 text-slate-800"
        >
          <span className="text-3xl drop-shadow-sm">🏨</span>
          <span className="font-extrabold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'हॉटेल्स' : 'Hotels'}</span>
        </button>

        <button
          onClick={() => setActiveModal('trains')}
          className="p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all shadow-sm bg-gradient-to-br from-[#dcfce7] to-[#f0fdf4] border border-[#bbf7d0] hover:shadow-md active:scale-95 text-slate-800"
        >
          <span className="text-3xl drop-shadow-sm">🚆</span>
          <span className="font-extrabold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'ट्रेन' : 'Trains'}</span>
        </button>

        <button
          onClick={() => setActiveModal('buses')}
          className="col-span-2 p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all shadow-sm bg-gradient-to-br from-[#f1f5f9] to-[#f8fafc] border border-[#e2e8f0] hover:shadow-md active:scale-95 text-slate-800"
        >
          <span className="text-3xl drop-shadow-sm">🚌</span>
          <span className="font-extrabold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'बस' : 'Buses'}</span>
        </button>
      </div>

      {/* Full-Screen Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col">
          <div className="flex-none pt-safe bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
                {activeModal === 'packages' && (lang === 'mr' ? 'टूर पॅकेजेस' : 'Tour Packages')}
                {activeModal === 'flights' && (lang === 'mr' ? 'विमान बुकिंग' : 'Flight Search')}
                {activeModal === 'hotels' && (lang === 'mr' ? 'हॉटेल बुकिंग' : 'Hotel Search')}
                {activeModal === 'trains' && (lang === 'mr' ? 'ट्रेन माहिती' : 'Train Search')}
                {activeModal === 'buses' && (lang === 'mr' ? 'बस बुकिंग' : 'Bus Search')}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-full transition-colors active:scale-95 shadow-sm border border-rose-200 flex items-center justify-center"
                title={lang === 'mr' ? 'बंद करा' : 'Close'}
              >
                <X className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-safe [&::-webkit-scrollbar]:hidden">
            <div className="p-4 sm:p-6 pb-20">
              {activeModal === 'packages' && <ExplorePackagesView lang={lang} />}
              {activeModal === 'flights' && <FlightSearchTab lang={lang} currencySymbol={currencySymbol} />}
              {activeModal === 'hotels' && <HotelSearchTab lang={lang} currencySymbol={currencySymbol} />}
              {activeModal === 'trains' && <TrainInfoTab lang={lang} />}
              {activeModal === 'buses' && <BusSearchTab lang={lang} currencySymbol={currencySymbol} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
