import React, { useState } from 'react';
import { 
  MapPin, Clock, Navigation, Plus, CheckCircle2, ChevronDown, ChevronUp, 
  ExternalLink, Car, Plane, Train, Footprints, Compass as  Trash2, Calendar
} from 'lucide-react';
import { TripPlan, TripGroup } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface VisualRouteTimelineProps {
  trip: TripGroup;
  onUpdateTrip?: (updated: TripGroup) => void;
  onAddPlan?: (newPlan: Partial<TripPlan>) => void;
}

export const VisualRouteTimeline: React.FC<VisualRouteTimelineProps> = ({
  trip,
  onUpdateTrip,
}) => {
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newLocation, setNewLocation] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newType, setNewType] = useState<'attraction' | 'food' | 'hotel' | 'transit'>('attraction');
  const [newDesc, setNewDesc] = useState('');

  const itinerary = trip.itinerary || [];

  // Group itinerary by days if available, or generate dynamic day slots
  const totalDays = Math.max(
    1,
    trip.startDate && trip.endDate
      ? Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24)) + 1
      : 3
  );

  // Group plans by day
  const plansForDay = itinerary.filter((p, index) => {
    // If plan has datetime, match day, else modulo index
    if (p.datetime) {
      const planDate = new Date(p.datetime);
      const startDate = trip.startDate ? new Date(trip.startDate) : new Date();
      const diffDays = Math.floor((planDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
      return diffDays === selectedDay;
    }
    return (index % totalDays) + 1 === selectedDay;
  });

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const baseDate = trip.startDate ? new Date(trip.startDate) : new Date();
    baseDate.setDate(baseDate.getDate() + (selectedDay - 1));

    const newActivity: TripPlan = {
      id: `plan_${Date.now()}`,
      title: newTitle.trim(),
      detail: newDesc.trim() || newTitle.trim(),
      datetime: baseDate.toISOString(),
      exactLocation: newLocation.trim() || trip.destination || 'Destination Point',
      realisticCost: newCost ? `₹${newCost}` : 'Free',
      travelTime: newTime,
      briefDescription: newDesc.trim(),
      type: newType === 'transit' ? 'ticket' : (newType === 'hotel' ? 'hotel' : 'activity'),
      cost: newCost ? parseFloat(newCost) : 0
    };

    const updated = [...itinerary, newActivity];
    if (onUpdateTrip) {
      onUpdateTrip({ ...trip, itinerary: updated });
    }

    setNewTitle('');
    setNewLocation('');
    setNewCost('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleDeleteActivity = (id: string) => {
    const updated = itinerary.filter(p => p.id !== id);
    if (onUpdateTrip) {
      onUpdateTrip({ ...trip, itinerary: updated });
    }
  };

  const getTransportIcon = (type?: string) => {
    switch (type) {
      case 'flight':
      case 'air':
        return <Plane className="w-3.5 h-3.5 text-sky-600" />;
      case 'train':
      case 'rail':
        return <Train className="w-3.5 h-3.5 text-[var(--premium-violet)]" />;
      case 'travel':
      case 'cab':
        return <Car className="w-3.5 h-3.5 text-premium-pink" />;
      default:
        return <Footprints className="w-3.5 h-3.5 text-premium-sky-deep" />;
    }
  };

  const openGoogleMapsRoute = (locationName: string) => {
    const query = encodeURIComponent(`${locationName}, ${trip.destination || ''}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="premium-card p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-[20px] bg-[var(--premium-violet-soft)] text-[var(--premium-violet)] flex items-center justify-center font-bold border border-transparent shrink-0 shadow-xs">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {isMr ? 'इंटरॅक्टिव्ह दिवसनिहाय रूट टाइमलाइन' : 'Interactive Route & Day Timeline'}
              </h3>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]">
                FloatTrip
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              {trip.destination ? `${trip.source || 'Your City'} ➔ ${trip.destination}` : (isMr ? 'दैनिक प्रवास व फिरण्याची ठिकाणे' : 'Daily stops & sightseeing')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 premium-gradient-pink text-white rounded-[16px] text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isMr ? '+ थांबा जोडा' : '+ Add Stop'}</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((dayNum) => (
          <button
            key={dayNum}
            type="button"
            onClick={() => setSelectedDay(dayNum)}
            className={`px-4 py-2 rounded-[20px] text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedDay === dayNum
                ? 'premium-gradient-pink text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] shadow-pink-100 scale-105'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isMr ? `दिवस ${dayNum}` : `Day ${dayNum}`}</span>
          </button>
        ))}
      </div>

      {/* Timeline Steps List */}
      <div className="space-y-4 pt-1 relative">
        {plansForDay.length > 0 ? (
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--premium-violet-soft)]">
            {plansForDay.map((item, idx) => (
              <div key={item.id || idx} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-6 sm:-left-8 top-3 w-6 h-6 rounded-full bg-white border-2 border-[var(--premium-violet)] flex items-center justify-center shadow-xs">
                  <span className="text-[10px] font-black text-[var(--premium-violet)]">{idx + 1}</span>
                </div>

                <div className="bg-transparent hover:bg-[var(--premium-violet-soft)]/40 p-4 rounded-[20px] border border-slate-200/80 transition-all space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[var(--premium-violet)]" />
                          {item.travelTime || '10:00 AM'}
                        </span>
                        {item.realisticCost && (
                          <span className="text-[10px] font-bold text-[var(--premium-sky-deep)] bg-[var(--premium-sky-soft)] px-2 py-0.5 rounded-md border border-transparent">
                            {item.realisticCost}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-slate-900 mt-1">{item.title}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openGoogleMapsRoute(item.exactLocation || item.title)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-premium-ink hover:bg-[var(--premium-violet-soft)] transition-colors shadow-2xs"
                        title="Open in Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteActivity(item.id)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-[var(--premium-pink)] hover:bg-[var(--premium-pink-soft)] transition-colors shadow-2xs"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.briefDescription && (
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {item.briefDescription}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-slate-500 border-t border-slate-200/50">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3 h-3 text-[var(--premium-pink)] shrink-0" />
                      {item.exactLocation || trip.destination || 'Local Sight'}
                    </span>
                    <button
                      type="button"
                      onClick={() => openGoogleMapsRoute(item.exactLocation || item.title)}
                      className="text-[var(--premium-violet)] hover:underline flex items-center gap-0.5 text-[10px] uppercase tracking-wider font-extrabold"
                    >
                      <Navigation className="w-2.5 h-2.5" /> {isMr ? 'दिशा / मॅप' : 'Navigate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-transparent rounded-[20px] border border-dashed border-slate-300">
            <Navigation className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              {isMr ? `दिवस ${selectedDay} साठी अद्याप थांबे नाहीत` : `No stops scheduled for Day ${selectedDay}`}
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              {isMr ? 'फिरण्यासाठी ठिकाणे, रेस्टॉरंट्स किंवा ॲक्टिव्हिटी जोडण्यासाठी खालील बटणावर क्लिक करा.' : 'Click "+ Add Stop" above to build your daily route itinerary.'}
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-3 px-3.5 py-1.5 premium-gradient-pink text-white rounded-[16px] text-xs font-black uppercase tracking-wider hover:opacity-90"
            >
              {isMr ? '+ थांबा जोडा' : '+ Add Stop'}
            </button>
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[16px] bg-[var(--premium-violet-soft)] text-[var(--premium-violet)] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-sm">
                  {isMr ? `दिवस ${selectedDay} मध्ये थांबा जोडा` : `Add Stop for Day ${selectedDay}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  {isMr ? 'ठिकाणाचे नाव / ॲक्टिव्हिटी' : 'Activity or Spot Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder={isMr ? 'उदा. बागा बीच सनसेट, किल्ले दर्शन' : 'e.g. Baga Beach Sunset, Fort Tour'}
                  className="w-full px-3 py-2 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-premium-violet"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                    {isMr ? 'वेळ' : 'Time'}
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-premium-violet"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                    {isMr ? 'अंदाजित खर्च (₹)' : 'Est. Cost (₹)'}
                  </label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={e => setNewCost(e.target.value)}
                    placeholder="500"
                    className="w-full px-3 py-2 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-premium-violet"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  {isMr ? 'तपशीलवार पत्ता / लँडमार्क' : 'Exact Location / Landmark'}
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder={isMr ? 'उदा. उत्तर गोवा, कलंगुट' : 'e.g. North Goa, Calangute'}
                  className="w-full px-3 py-2 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-premium-violet"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  {isMr ? 'टीप / वर्णन' : 'Notes / Description'}
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder={isMr ? 'उदा. कॅमेरा आणि सनग्लासेस सोबत घ्या...' : 'e.g. Carry camera and water bottle...'}
                  className="w-full px-3 py-2 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-premium-violet"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-[16px] text-xs font-black uppercase tracking-wider hover:bg-slate-200 cursor-pointer"
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 premium-gradient-pink text-white rounded-[16px] text-xs font-black uppercase tracking-wider hover:opacity-90 shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] cursor-pointer"
                >
                  {isMr ? 'सेव्ह करा' : 'Save Stop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
