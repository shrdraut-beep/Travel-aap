import { safeStorage } from '../../utils/storage';
import React, { useState, useEffect } from 'react';
import { Compass, Plane, Building2, Calendar, MapPin, ExternalLink, Plus, Compass as Sparkles, ArrowRight, BookmarkCheck, Trash2 } from 'lucide-react';
import { getFlightDeepLink, getHotelDeepLink, TRAVELPAYOUTS_MARKER } from './config';

interface TripItineraryTabProps {
  lang: string;
  currencySymbol: string;
}

interface SavedTripData {
  id: string;
  title: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  adults: number;
}

export const TripItineraryTab: React.FC<TripItineraryTabProps> = ({ lang, currencySymbol }) => {
  const [viewMode, setViewMode] = useState<'saved' | 'create'>('create');
  const [savedTrips, setSavedTrips] = useState<SavedTripData[]>([]);

  // Load saved trips from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('routripo_saved_trips');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedTrips(parsed);
          setViewMode('saved');
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved trips:', err);
    }
  }, []);

  // TRIP CREATION STATE
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

  const [customOrigin, setCustomOrigin] = useState('');
  const [customDest, setCustomDest] = useState('');
  const [customDepart, setCustomDepart] = useState(tomorrowStr);
  const [customReturn, setCustomReturn] = useState(nextWeekStr);
  const [customAdults, setCustomAdults] = useState(2);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSaveCurrentTrip = () => {
    const newTrip: SavedTripData = {
      id: `trip_${Date.now()}`,
      title: `${customOrigin} ➔ ${customDest} Trip`,
      origin: customOrigin.toUpperCase(),
      destination: customDest.toUpperCase(),
      departDate: customDepart,
      returnDate: customReturn,
      adults: customAdults,
    };

    const updated = [newTrip, ...savedTrips];
    setSavedTrips(updated);
    try {
      localStorage.setItem('routripo_saved_trips', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }

    setSaveSuccessMsg(
      lang === 'mr'
        ? 'सहल यशस्वीरीत्या जतन केली! तुम्ही आता "जतन केलेल्या सहली" मध्ये पाहू शकता.'
        : 'Trip itinerary saved successfully! You can view it under Saved Trips.'
    );
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setViewMode('saved');
    }, 1200);
  };

  const handleDeleteTrip = (id: string) => {
    const updated = savedTrips.filter(t => t.id !== id);
    setSavedTrips(updated);
    try {
      localStorage.setItem('routripo_saved_trips', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage update failed:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <Compass className="w-5 h-5 text-emerald-200" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
              {lang === 'mr' ? 'सहल नियोजन व बुकिंग केंद्र' : 'Smart Itinerary & Travel Hub'}
            </span>
          </div>
          <span className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 rounded-full text-[10px] font-black uppercase">
            Marker #{TRAVELPAYOUTS_MARKER}
          </span>
        </div>
        <h3 className="text-xl font-black tracking-tight">
          {lang === 'mr' ? 'सहल मार्गदर्शक व सोपे बुकिंग' : 'Trip Itinerary Trip Itinerary & Seamless OTA Booking Easy Booking'}
        </h3>
        <p className="text-xs font-semibold text-emerald-100 mt-1">
          {lang === 'mr' ? 'अविॲसेल्स व हॉटेललूकच्या दीप लिंक्सद्वारे जतन केलेल्या सहलींचे थेट बुकिंग पूर्ण करा' : 'Saved trip itineraries linked directly to Aviasales & Hotellook booking engines'}
        </p>
      </div>

      {/* Main Mode Toggle */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200 shadow-inner">
        <button
          onClick={() => setViewMode('saved')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            viewMode === 'saved'
              ? 'bg-white text-emerald-700 shadow-md border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookmarkCheck className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'mr' ? `जतन केलेल्या सहली (${savedTrips.length})` : `Saved Trips (${savedTrips.length})`}</span>
        </button>

        <button
          onClick={() => setViewMode('create')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            viewMode === 'create'
              ? 'bg-white text-emerald-700 shadow-md border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'mr' ? 'नवीन सहल तयार करा' : 'Trip Creation Builder'}</span>
        </button>
      </div>

      {/* VIEW: SAVED TRIPS */}
      {viewMode === 'saved' && (
        <div className="space-y-6">
          {savedTrips.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                <Compass className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h5 className="font-black text-slate-900 text-lg">
                  {lang === 'mr' ? 'कोणतीही जतन केलेली सहल नाही' : 'No Saved Trips Yet'}
                </h5>
                <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
                  {lang === 'mr'
                    ? 'कृपया "नवीन सहल तयार करा" टॅब वापरून तुमचा प्रवास मार्ग व तारखा निवडा आणि सहल जतन करा.'
                    : 'Use the Trip Creation Builder to define your route, select dates, and save your trip.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('create')}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md hover:bg-emerald-700 transition-all"
              >
                {lang === 'mr' ? 'नवीन सहल तयार करा' : 'Create New Trip'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedTrips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {lang === 'mr' ? 'जतन केलेली सहल' : 'Saved Itinerary'}
                      </span>
                      <h4 className="font-black text-slate-900 text-lg sm:text-xl mt-1.5">{trip.title}</h4>
                      <p className="text-xs font-extrabold text-slate-500 flex items-center gap-2 mt-1">
                        <span>🛫 {trip.origin}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span>🛬 {trip.destination}</span>
                        <span className="text-slate-300">•</span>
                        <span>📅 {trip.departDate} to {trip.returnDate}</span>
                        <span className="text-slate-300">•</span>
                        <span>👤 {trip.adults} {trip.adults === 1 ? 'Adult' : 'Adults'}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title="Delete saved trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dynamic Booking Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Flight CTA */}
                    <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                          <Plane className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-black text-slate-900 text-sm">
                            {trip.origin} ➔ {trip.destination} Flights
                          </h5>
                          <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <span>Secure Checkout</span>
                          </p>
                        </div>
                      </div>

                      <a
                        href={getFlightDeepLink(trip.origin, trip.destination, trip.departDate, trip.adults)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow flex items-center gap-1.5 shrink-0"
                      >
                        <span>CHECK LIVE PRICE & BOOK</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Hotel CTA */}
                    <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-black text-slate-900 text-sm">
                            Hotels in {trip.destination}
                          </h5>
                          <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <span>Secure Checkout</span>
                          </p>
                        </div>
                      </div>

                      <a
                        href={getHotelDeepLink(trip.destination, trip.departDate, trip.returnDate, trip.adults)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow flex items-center gap-1.5 shrink-0"
                      >
                        <span>CHECK LIVE PRICE & BOOK</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: TRIP CREATION BUILDER */}
      {viewMode === 'create' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl space-y-4">
            <h4 className="font-black text-slate-900 text-base">
              {lang === 'mr' ? '१. सहल माहिती प्रविष्ट करा' : '1. Define Trip Parameters'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  {lang === 'mr' ? 'प्रारंभ ठिकाण (Origin IATA Code)' : 'Origin Airport Code'}
                </label>
                <input
                  type="text"
                  value={customOrigin}
                  onChange={(e) => setCustomOrigin(e.target.value.toUpperCase())}
                  placeholder="e.g. BOM, ISK, PNQ"
                  className="w-full bg-transparent font-black text-base text-slate-900 outline-none uppercase"
                  maxLength={4}
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  {lang === 'mr' ? 'गंतव्य ठिकाण (Destination IATA Code)' : 'Destination Airport Code'}
                </label>
                <input
                  type="text"
                  value={customDest}
                  onChange={(e) => setCustomDest(e.target.value.toUpperCase())}
                  placeholder="e.g. DEL, GOI, BLR"
                  className="w-full bg-transparent font-black text-base text-slate-900 outline-none uppercase"
                  maxLength={4}
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  {lang === 'mr' ? 'प्रस्थान तारीख' : 'Departure Date'}
                </label>
                <input
                  type="date"
                  value={customDepart}
                  onChange={(e) => setCustomDepart(e.target.value)}
                  className="w-full bg-transparent font-bold text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  {lang === 'mr' ? 'परतीची तारीख' : 'Return Date'}
                </label>
                <input
                  type="date"
                  value={customReturn}
                  onChange={(e) => setCustomReturn(e.target.value)}
                  className="w-full bg-transparent font-bold text-xs text-slate-900 outline-none"
                />
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-emerald-800 flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveCurrentTrip}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{lang === 'mr' ? 'ही सहल जतन करा' : 'Save Itinerary To My Trips'}</span>
            </button>
          </div>

          {/* Dynamic Suggested Bookings with "Check Price" CTA */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl space-y-4">
            <h4 className="font-black text-slate-900 text-base">
              {lang === 'mr' ? '२. उड्डाण व हॉटेल थेट बुकिंग' : '2. Live Flight 2. Live Flight & Hotel Direct OTA Links Hotel Booking Links'}
            </h4>

            {/* Flight Suggestion */}
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Plane className="w-5 h-5 text-blue-600" />
                <div>
                  <h5 className="font-black text-slate-900 text-sm">
                    {customOrigin} ➔ {customDest} Flight ({customDepart})
                  </h5>
                  <p className="text-xs font-semibold text-slate-500">Find Best Flight Deals</p>
                </div>
              </div>

              <a
                href={getFlightDeepLink(customOrigin, customDest, customDepart, customAdults)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow flex items-center gap-1.5 self-start sm:self-auto inline-flex"
              >
                <span>CHECK LIVE PRICE & BOOK</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Hotel Suggestion */}
            <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-purple-600" />
                <div>
                  <h5 className="font-black text-slate-900 text-sm">
                    Hotels in {customDest} ({customDepart} to {customReturn})
                  </h5>
                  <p className="text-xs font-semibold text-slate-500">Booking.com & Hotellook Hotel Search</p>
                </div>
              </div>

              <a
                href={getHotelDeepLink(customDest, customDepart, customReturn, customAdults)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow flex items-center gap-1.5 self-start sm:self-auto inline-flex"
              >
                <span>CHECK LIVE PRICE & BOOK</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
