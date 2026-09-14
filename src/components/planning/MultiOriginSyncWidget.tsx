import React, { useState } from 'react';
import { 
  Users, MapPin, Plane, Clock, Plus, CheckCircle2, Car, Compass as  Share2, ArrowRight 
} from 'lucide-react';
import { TripGroup } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface MultiOriginSyncWidgetProps {
  trip: TripGroup;
  destination?: string;
}

interface MemberOriginSlot {
  id: string;
  memberName: string;
  originCity: string;
  flightNo: string;
  eta: string;
  status: 'booked' | 'searching';
}

export const MultiOriginSyncWidget: React.FC<MultiOriginSyncWidgetProps> = ({
  trip,
  destination = 'Goa (GOI)',
}) => {
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  const [origins, setOrigins] = useState<MemberOriginSlot[]>([
    {
      id: 'o1',
      memberName: 'Shrd & Team',
      originCity: 'Mumbai (BOM)',
      flightNo: '6E-2134',
      eta: '09:45 AM',
      status: 'booked'
    },
    {
      id: 'o2',
      memberName: 'Amit & Pooja',
      originCity: 'Delhi (DEL)',
      flightNo: 'AI-842',
      eta: '10:15 AM',
      status: 'booked'
    },
    {
      id: 'o3',
      memberName: 'Snehal',
      originCity: 'Pune (PNQ)',
      flightNo: 'Direct Cab MH-12',
      eta: '10:30 AM',
      status: 'booked'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newFlight, setNewFlight] = useState('');
  const [newEta, setNewEta] = useState('10:00 AM');

  const handleAddOrigin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.trim() || !newCity.trim()) return;

    const newSlot: MemberOriginSlot = {
      id: `orig_${Date.now()}`,
      memberName: newMember.trim(),
      originCity: newCity.trim(),
      flightNo: newFlight.trim() || 'Pending',
      eta: newEta.trim(),
      status: newFlight.trim() ? 'booked' : 'searching'
    };

    setOrigins([...origins, newSlot]);
    setNewMember('');
    setNewCity('');
    setNewFlight('');
    setShowAddModal(false);
  };

  return (
    <div className="premium-card p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-[20px] bg-[var(--premium-pink-soft)] text-[var(--premium-pink)] flex items-center justify-center font-bold border border-transparent shrink-0 shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {isMr ? 'मल्टि-ओरिजिन सिंक (वेगवेगळ्या शहरांतून एकत्र प्रवास)' : 'Fly Together from Different Cities'}
              </h3>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[var(--premium-pink-soft)] text-[var(--premium-pink)]">
                LetsFG
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              {destination} • {isMr ? 'सर्व मित्रांच्या फ्लाइट आगमनाची वेळ सिंक करा आणि १ टॅक्सी शेअर करा' : 'Sync arrival flight timings to share single cab from airport'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-[var(--premium-pink)] text-white rounded-[16px] text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isMr ? '+ मित्र जोडा' : '+ Add City Slot'}</span>
        </button>
      </div>

      {/* Sync Window Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-transparent rounded-[20px] p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[16px] bg-white border border-transparent flex items-center justify-center text-[var(--premium-pink)] shadow-2xs shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-premium-pink block">
              {isMr ? 'विमानतळ भेट विंडो (AIRPORT MEETUP WINDOW)' : 'AIRPORT MEETUP & CAB SYNC WINDOW'}
            </span>
            <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
              09:45 AM - 10:30 AM (४५ मिनिटांची विंडो • १ टॅक्सीमध्ये ₹१,५०० बचत)
            </div>
          </div>
        </div>
      </div>

      {/* Origin Slots List */}
      <div className="space-y-3">
        {origins.map((item) => (
          <div
            key={item.id}
            className="p-3.5 bg-transparent rounded-[20px] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-[16px] bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 font-bold">
                <Plane className="w-4 h-4 text-[var(--premium-violet)]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900 truncate">{item.memberName}</h4>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[var(--premium-violet-soft)] text-[var(--premium-violet)]">
                    {item.status === 'booked' ? (isMr ? 'कन्फर्म' : 'Confirmed') : 'Searching'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-500 truncate">
                  {item.originCity} ➔ {destination} • {item.flightNo}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              <div className="text-left sm:text-right">
                <span className="text-[9px] font-black uppercase text-slate-400 block">
                  {isMr ? 'आगमनाची वेळ (ETA)' : 'EXPECTED ARRIVAL'}
                </span>
                <span className="text-xs font-black text-premium-pink block">{item.eta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[16px] bg-[var(--premium-pink-soft)] text-[var(--premium-pink)] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-sm">
                  {isMr ? 'वेगळ्या शहरातून येणारा मित्र जोडा' : 'Add Friend Coming from Another City'}
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

            <form onSubmit={handleAddOrigin} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  {isMr ? 'मित्राचे नाव' : "Friend's Name"} *
                </label>
                <input
                  type="text"
                  required
                  value={newMember}
                  onChange={e => setNewMember(e.target.value)}
                  placeholder={isMr ? 'उदा. रोहित' : 'e.g. Rohit'}
                  className="w-full px-3 py-2 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-premium-pink"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                  {isMr ? 'निघण्याचे शहर (Origin)' : 'Origin City / Airport'} *
                </label>
                <input
                  type="text"
                  required
                  value={newCity}
                  onChange={e => setNewCity(e.target.value)}
                  placeholder={isMr ? 'उदा. बंगलोर (BLR)' : 'e.g. Bangalore (BLR)'}
                  className="w-full px-3 py-2 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-premium-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                    {isMr ? 'फ्लाइट / ट्रेन नंबर' : 'Flight / Train No.'}
                  </label>
                  <input
                    type="text"
                    value={newFlight}
                    onChange={e => setNewFlight(e.target.value)}
                    placeholder="6E-512"
                    className="w-full px-3 py-2 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-premium-pink"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
                    {isMr ? 'आगमनाची वेळ' : 'Arrival Time (ETA)'}
                  </label>
                  <input
                    type="text"
                    value={newEta}
                    onChange={e => setNewEta(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 bg-transparent border border-slate-200 rounded-[16px] text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-premium-pink"
                  />
                </div>
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
                  className="flex-1 py-2.5 bg-[var(--premium-pink)] text-white rounded-[16px] text-xs font-black uppercase tracking-wider hover:opacity-90 shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] cursor-pointer"
                >
                  {isMr ? 'जोडा' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
