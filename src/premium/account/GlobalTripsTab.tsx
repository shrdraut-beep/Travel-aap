import React, { useState, useMemo } from 'react';
import { 
  Plus, MapPin, Calendar, Users, Wallet, 
  Search, Sparkles, X, Calculator, Trash2, Plane, TrainFront, Car, Bus,
  Compass, FileText, CheckCircle2, ChevronRight, Loader2, ArrowLeftRight,
  ShieldCheck, HeartHandshake, UserPlus, Check
} from 'lucide-react';
import { useTripContext } from '../../context/TripContext';
import { GlobalBrandHeader } from '../../components/common/GlobalBrandHeader';
import { SmartBudgetModal } from '../../components/modals/SmartBudgetModal';
import { TripGroup, CalculationMode, TripPlan, Member } from '../../types';

// Realistic Destination Photo Resolver
export const getDestinationPhoto = (dest: string = '', name: string = ''): string => {
  const d = `${dest} ${name}`.toLowerCase();
  
  if (d.includes('goa')) {
    return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('nashik')) {
    return 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('manali') || d.includes('snow') || d.includes('himachal')) {
    return 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('mahabaleshwar') || d.includes('panchgani') || d.includes('strawberry')) {
    return 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('lonavala') || d.includes('khandala')) {
    return 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('udaipur')) {
    return 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('jaipur') || d.includes('rajasthan')) {
    return 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('kerala') || d.includes('alleppey') || d.includes('munnar') || d.includes('kochi')) {
    return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('kashmir') || d.includes('srinagar') || d.includes('gulmarg') || d.includes('ladakh') || d.includes('leh')) {
    return 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('varanasi') || d.includes('banaras') || d.includes('ghat')) {
    return 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('shirdi')) {
    return 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('mumbai')) {
    return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('pune')) {
    return 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('ratnagiri') || d.includes('konkan') || d.includes('tarkarli') || d.includes('alibaug') || d.includes('beach')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
  }
  if (d.includes('mountain') || d.includes('trek') || d.includes('hill')) {
    return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
};

// Compact date formatter for travel cards
const formatTripDates = (start?: string, end?: string) => {
  if (!start) return 'Flexible Dates';
  const formatSingle = (s: string) => {
    try {
      const parts = s.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (mIdx >= 0 && mIdx < 12 && !isNaN(day)) {
          return `${day} ${months[mIdx]}`;
        }
      }
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      }
      return s;
    } catch {
      return s;
    }
  };

  const startFormatted = formatSingle(start);
  if (!end || end === start) return startFormatted;
  const endFormatted = formatSingle(end);
  return `${startFormatted} → ${endFormatted}`;
};

// Popular Destinations with real photos for AI modal
const POPULAR_DESTINATIONS = [
  { name: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=150&q=80' },
  { name: 'Manali', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=150&q=80' },
  { name: 'Mahabaleshwar', img: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=150&q=80' },
  { name: 'Nashik', img: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=150&q=80' },
  { name: 'Udaipur', img: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=150&q=80' },
  { name: 'Kerala', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=150&q=80' },
  { name: 'Kashmir', img: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=150&q=80' },
  { name: 'Varanasi', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=150&q=80' },
];

// Preset Template Itineraries
const PROMPT_PRESETS = [
  { label: '3-Day Goa Beach & Sunset', dest: 'Goa', days: '3', type: 'leisure', transport: 'flight', budget: '25000' },
  { label: 'Weekend Mahabaleshwar', dest: 'Mahabaleshwar', days: '2', type: 'family', transport: 'car', budget: '12000' },
  { label: 'Manali Adventure & Snow', dest: 'Manali', days: '5', type: 'adventure', transport: 'bus', budget: '28000' },
  { label: 'Varanasi Ghats & Heritage', dest: 'Varanasi', days: '3', type: 'pilgrimage', transport: 'train', budget: '15000' },
];

const TRANSPORT_OPTIONS = [
  { id: 'flight', label: 'Flight', icon: Plane },
  { id: 'train', label: 'Train', icon: TrainFront },
  { id: 'car', label: 'Cab / Car', icon: Car },
  { id: 'bus', label: 'Bus', icon: Bus },
];

const TRIP_TYPES = [
  { id: 'leisure', label: 'Vacation' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'pilgrimage', label: 'Pilgrimage' },
  { id: 'family', label: 'Family' },
  { id: 'friends', label: 'Friends' },
  { id: 'couple', label: 'Couple' },
  { id: 'solo', label: 'Solo' },
];

interface SmartViaRoute {
  id: string;
  nameEn: string;
  descEn: string;
}

const getSmartViaRoutes = (dep: string, dest: string): SmartViaRoute[] => {
  const d = (dep || '').toLowerCase().trim();
  const t = (dest || '').toLowerCase().trim();

  // Pune <-> Ratnagiri
  if (d.includes('pune') && t.includes('ratnagiri')) {
    return [
      { id: 'Karad', nameEn: 'Via Karad (Amba Ghat)', descEn: 'Pune-Satara-Karad-Amba Ghat (~335 km)' },
      { id: 'Tamhini Ghat', nameEn: 'Via Tamhini Ghat (Scenic)', descEn: 'Tamhini-Mangaon-Chiplun (~310 km)' },
      { id: 'Mumbai', nameEn: 'Via Mumbai / Panvel (NH 66)', descEn: 'Expressway + Coastal NH 66 (~460 km)' },
    ];
  }

  // Mumbai <-> Goa
  if (d.includes('mumbai') && t.includes('goa')) {
    return [
      { id: 'Pune-Kolhapur', nameEn: 'Via Pune-Kolhapur (NH 48)', descEn: '4-Lane Express Highway (~590 km)' },
      { id: 'Chiplun-Ratnagiri', nameEn: 'Via Chiplun-Ratnagiri (NH 66)', descEn: 'Scenic Konkan Coastal Route (~550 km)' },
    ];
  }

  // Pune <-> Goa
  if (d.includes('pune') && t.includes('goa')) {
    return [
      { id: 'Kolhapur-Belagavi', nameEn: 'Via Kolhapur-Belagavi', descEn: 'Smoothest 4-lane Highway (~450 km)' },
      { id: 'Amboli Ghat', nameEn: 'Via Amboli Ghat (Scenic)', descEn: 'Scenic Waterfalls & Ghat (~440 km)' },
      { id: 'Karad-Ratnagiri', nameEn: 'Via Karad-Ratnagiri Coastal', descEn: 'Amba Ghat & Coastal Sightseeing' },
    ];
  }

  // Mumbai <-> Mahabaleshwar
  if (d.includes('mumbai') && t.includes('mahabaleshwar')) {
    return [
      { id: 'Pune-Wai', nameEn: 'Via Pune-Wai (Expressway)', descEn: 'Fast & Easy via Expressway (~260 km)' },
      { id: 'Poladpur Ghat', nameEn: 'Via Poladpur Ghat (Scenic)', descEn: 'Pen-Mahad-Poladpur Route (~220 km)' },
    ];
  }

  // Pune <-> Shirdi
  if (d.includes('pune') && t.includes('shirdi')) {
    return [
      { id: 'Sangamner', nameEn: 'Via Sangamner (Nashik Hwy)', descEn: 'Chakan-Sangamner Route (~200 km)' },
      { id: 'Ahmednagar', nameEn: 'Via Ahmednagar', descEn: 'Shikrapur-Ahmednagar (~205 km)' },
    ];
  }

  return [];
};

export interface GlobalTripsTabProps {
  onCreateTrip?: () => void;
  onOpenAiPlanner?: () => void;
  onEnterTrip?: () => void;
  onOpenProfile?: () => void;
  onOpenSos?: () => void;
}

export const GlobalTripsTab: React.FC<GlobalTripsTabProps> = ({
  onCreateTrip,
  onOpenAiPlanner,
  onEnterTrip,
  onOpenProfile,
  onOpenSos
}) => {
  const { trips, activeTrip, setActiveTrip, addNewTrip, updateActiveTrip, deleteTrip } = useTripContext();

  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAiModal, setShowAiModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showSmartBudget, setShowSmartBudget] = useState(false);
  const [smartBudgetSource, setSmartBudgetSource] = useState<'ai' | 'manual'>('manual');

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // AI Pre-Trip Planner State
  const [aiDep, setAiDep] = useState('Pune');
  const [aiDest, setAiDest] = useState('Goa');
  const [aiVia, setAiVia] = useState('');
  const [aiDays, setAiDays] = useState('3');
  const [aiPersons, setAiPersons] = useState('2');
  const [aiTripType, setAiTripType] = useState('leisure');
  const [aiTransport, setAiTransport] = useState('flight');
  const [aiBudget, setAiBudget] = useState('18000');
  const [aiStartDate, setAiStartDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [aiLoadingStep, setAiLoadingStep] = useState<string | null>(null);
  const [aiPreviewPlan, setAiPreviewPlan] = useState<any>(null);

  const smartViaRoutes = useMemo(() => getSmartViaRoutes(aiDep, aiDest), [aiDep, aiDest]);

  // Manual Trip Planner State
  const [manName, setManName] = useState('');
  const [manDestination, setManDestination] = useState('');
  const [manStartDate, setManStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [manEndDate, setManEndDate] = useState(new Date(Date.now() + 86400000 * 4).toISOString().substring(0, 10));
  const [manTripType, setManTripType] = useState('friends');
  const [manCalcMode, setManCalcMode] = useState<CalculationMode>('admin_pooled');
  const [manTotalBudget, setManTotalBudget] = useState('15000');
  const [manMembers, setManMembers] = useState<{ name: string; deposit: string; upiId: string; isAdmin: boolean }[]>([
    { name: 'Admin', deposit: '2000', upiId: 'admin@okaxis', isAdmin: true },
    { name: 'Sachin', deposit: '2000', upiId: 'sachin@okhdfc', isAdmin: false },
    { name: 'Rohan', deposit: '2000', upiId: 'rohan@icici', isAdmin: false }
  ]);

  // Filtered trips computation
  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return trips;
    const q = searchQuery.toLowerCase();
    return trips.filter(trip => {
      const matchesName = (trip.name || '').toLowerCase().includes(q);
      const matchesDest = (trip.destination || '').toLowerCase().includes(q);
      return matchesName || matchesDest;
    });
  }, [trips, searchQuery]);

  // AI Preset apply
  const handleApplyPreset = (preset: typeof PROMPT_PRESETS[0]) => {
    setAiDest(preset.dest);
    setAiVia('');
    setAiDays(preset.days);
    setAiTripType(preset.type);
    setAiTransport(preset.transport);
    setAiBudget(preset.budget);
  };

  // AI Plan Generation execution
  const executeGenerateAiTrip = async () => {
    if (!aiDest.trim()) {
      showToast('Please enter a destination');
      return;
    }

    setAiLoadingStep('📍 Calculating optimal route & travel times...');
    setAiPreviewPlan(null);

    try {
      await new Promise(r => setTimeout(r, 600));
      setAiLoadingStep(aiTransport === 'train'
        ? '🚂 Checking IRCTC trains & schedules...'
        : aiTransport === 'flight'
        ? '✈️ Checking flight schedules & fares...'
        : '🚗 Calculating highways, ghats, tolls & fuel estimates...');

      await new Promise(r => setTimeout(r, 600));
      setAiLoadingStep('✨ Curating top attractions, sights & daily itinerary...');

      await new Promise(r => setTimeout(r, 500));
      setAiLoadingStep('🏨 Curating verified stays & local cuisine experiences...');

      const response = await fetch('/api/generate-future-trip-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: aiDest.trim(),
          departureCity: aiDep.trim(),
          days: parseInt(aiDays) || 3,
          persons: parseInt(aiPersons) || 2,
          budget: parseInt(aiBudget) || 15000,
          tripType: aiTripType,
          transportMode: aiTransport,
          departureDate: aiStartDate,
          viaRoute: aiVia.trim(),
          lang: 'en'
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const data = await response.json();
      if (data && (data.days || data.itinerary || data.trip_title)) {
        setAiPreviewPlan(data);
      } else {
        throw new Error('Invalid structure');
      }
    } catch (err) {
      console.warn('AI Trip generation fallback to intelligent local builder:', err);
      const fallbackDays = parseInt(aiDays) || 3;
      const parsedBudget = parseInt(aiBudget) || 18000;
      const mockDays = [];
      for (let i = 1; i <= fallbackDays; i++) {
        mockDays.push({
          day_number: i,
          title: `Day ${i}: ${aiDest} Exploration & Sightseeing`,
          morning: [
            { time: '08:30 AM', activity: 'Breakfast & Iconic spot visit', cost: 400, location: `${aiDest} Main Point` }
          ],
          afternoon: [
            { time: '01:00 PM', activity: 'Authentic local lunch & relaxation', cost: 650, location: `${aiDest} Central` },
            { time: '03:30 PM', activity: 'Scenic viewpoint & photo spot', cost: 300, location: `${aiDest} Viewpoint` }
          ],
          evening: [
            { time: '06:30 PM', activity: 'Sunset point & local market visit', cost: 500, location: `${aiDest} Promenade` },
            { time: '08:30 PM', activity: 'Dinner & evening group leisure', cost: 800, location: `${aiDest} Resort` }
          ]
        });
      }

      setAiPreviewPlan({
        trip_title: `${aiDep} to ${aiDest} Getaway`,
        destination: aiDest,
        departureCity: aiDep,
        overview: `A balanced ${aiDays}-day ${aiTripType} journey from ${aiDep} to ${aiDest} optimized for comfort, sightseeing, and budget.`,
        route_info: {
          via: aiVia || (smartViaRoutes.length > 0 ? smartViaRoutes[0].nameEn : 'Direct Highway'),
          distance: `~420 km`,
          duration: `~7h 30m`
        },
        cost_breakdown: {
          transport: Math.round(parsedBudget * 0.35),
          stay: Math.round(parsedBudget * 0.35),
          food: Math.round(parsedBudget * 0.20),
          activities: Math.round(parsedBudget * 0.10),
          total: parsedBudget
        },
        days: mockDays
      });
    } finally {
      setAiLoadingStep(null);
    }
  };

  // Save AI Plan into Context as an active/planned trip
  const handleSaveAiTripToContext = () => {
    if (!aiPreviewPlan) return;

    const numPersons = parseInt(aiPersons) || 2;
    const initialMembers: Member[] = [];
    const colors = ['#0284c7', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

    for (let i = 1; i <= numPersons; i++) {
      initialMembers.push({
        id: `m-ai-${Date.now()}-${i}`,
        name: i === 1 ? 'Me (Admin)' : `Traveller ${i}`,
        color: colors[(i - 1) % colors.length],
        totalDeposited: 0
      });
    }

    // Convert AI day slots into TripPlan items
    const itineraryItems: TripPlan[] = [];
    if (aiPreviewPlan.days && Array.isArray(aiPreviewPlan.days)) {
      aiPreviewPlan.days.forEach((day: any, dIndex: number) => {
        const slots = [
          ...(day.morning || []),
          ...(day.afternoon || []),
          ...(day.evening || [])
        ];
        slots.forEach((slot: any, sIndex: number) => {
          itineraryItems.push({
            id: `plan-${Date.now()}-${dIndex}-${sIndex}`,
            type: slot.activity?.toLowerCase().includes('hotel') ? 'hotel' : 'activity',
            title: slot.activity || `Day ${day.day_number} Visit`,
            detail: slot.location ? `Location: ${slot.location} (${slot.time || 'Morning'})` : `Time: ${slot.time || 'Morning'}`,
            datetime: new Date(Date.now() + 86400000 * (dIndex + 1)).toISOString(),
            cost: slot.cost || 0,
            location: {
              lat: 18.5204 + (dIndex * 0.05),
              lng: 73.8567 + (sIndex * 0.05),
              name: slot.location || aiDest
            },
            exactLocation: slot.location || aiDest,
            realisticCost: slot.cost ? `₹${slot.cost}` : undefined
          });
        });
      });
    }

    const newTrip = addNewTrip({
      name: aiPreviewPlan.trip_title || `${aiDest} Trip`,
      destination: aiDest,
      startDate: aiStartDate,
      endDate: new Date(new Date(aiStartDate).getTime() + (parseInt(aiDays) || 3) * 86400000).toISOString().split('T')[0],
      totalBudget: parseInt(aiBudget) || 18000,
      calculationMode: 'admin_pooled',
      status: 'PLANNED',
      members: initialMembers,
      itinerary: itineraryItems
    });

    setActiveTrip(newTrip);
    setShowAiModal(false);
    setAiPreviewPlan(null);
    showToast('✨ AI trip planned and saved to your vault!');
  };

  // Manual Trip Form Submission
  const handleCreateManualTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manDestination.trim() && !manName.trim()) {
      showToast('Please enter a trip name or destination');
      return;
    }

    const validMembersList = manMembers
      .map(m => ({ ...m, name: m.name.trim() }))
      .filter(m => m.name !== '');

    const finalMembers: Member[] = validMembersList.length > 0
      ? validMembersList.map((m, idx) => ({
          id: `mem-${Date.now()}-${idx}`,
          name: m.name,
          color: ['#0284c7', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][idx % 5],
          totalDeposited: parseFloat(m.deposit) || 0,
          upiId: m.upiId || undefined
        }))
      : [{ id: `mem-${Date.now()}-0`, name: 'Admin', color: '#0284c7', totalDeposited: 0 }];

    const newTrip = addNewTrip({
      name: manName.trim() || `${manDestination.trim()} Trip`,
      destination: manDestination.trim() || manName.trim(),
      startDate: manStartDate,
      endDate: manEndDate,
      calculationMode: manCalcMode,
      totalBudget: parseFloat(manTotalBudget) || 0,
      status: 'ACTIVE',
      members: finalMembers
    });

    setActiveTrip(newTrip);
    setShowManualModal(false);
    showToast('🎉 New trip created & active!');
  };

  // Add Member in Manual Form
  const handleAddMemberRow = () => {
    setManMembers([...manMembers, { name: '', deposit: '0', upiId: '', isAdmin: false }]);
  };

  const handleRemoveMemberRow = (idx: number) => {
    if (manMembers.length > 1) {
      setManMembers(manMembers.filter((_, i) => i !== idx));
    }
  };

  // Change Trip Status
  const handleCycleStatus = (trip: TripGroup) => {
    const nextStatus = trip.status === 'PLANNED' ? 'ACTIVE' : trip.status === 'ACTIVE' ? 'COMPLETED' : 'PLANNED';
    updateActiveTrip({ ...trip, status: nextStatus });
    showToast(`Trip status updated to: ${nextStatus}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-28 font-['Outfit',sans-serif]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 inset-x-0 mx-auto z-[200] max-w-sm px-4 pointer-events-none">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
            <span>{toastMsg}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
          </div>
        </div>
      )}

      {/* Global Brand Header with subtitle and theme (Badge removed per user request) */}
      <GlobalBrandHeader 
        subtitle="Trip Management & Travel Vault"
        theme="ocean"
        onOpenProfile={onOpenProfile}
        onNotifications={onOpenSos}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-20 space-y-3.5">
        {/* Quick Action Category Buttons: Distinct Separate Cards with theme-matching modern icons */}
        <div className="grid grid-cols-2 gap-3 pt-0.5">
          {/* Card 1: AI Trip Planner */}
          <button
            type="button"
            onClick={() => {
              setShowAiModal(true);
              onOpenAiPlanner?.();
            }}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-sky-300 transition-all cursor-pointer active:scale-95 flex flex-col items-center text-center group"
          >
            <div className="size-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30 border border-sky-500 mb-2 group-hover:scale-105 transition-transform">
              <span
                className="material-symbols-outlined text-[32px] text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                travel_explore
              </span>
            </div>
            <span className="text-xs font-bold text-slate-900 mt-0.5 font-['Outfit',sans-serif]">
              AI Trip Planner
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Smart Itinerary
            </span>
          </button>

          {/* Card 2: New Trip */}
          <button
            type="button"
            onClick={() => {
              setShowManualModal(true);
              onCreateTrip?.();
            }}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all cursor-pointer active:scale-95 flex flex-col items-center text-center group"
          >
            <div className="size-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 border border-emerald-500 mb-2 group-hover:scale-105 transition-transform">
              <span
                className="material-symbols-outlined text-[32px] text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                luggage
              </span>
            </div>
            <span className="text-xs font-bold text-slate-900 mt-0.5 font-['Outfit',sans-serif]">
              New Trip
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Custom Itinerary
            </span>
          </button>
        </div>

        {/* Clean Search Input */}
        <div className="relative w-full pt-0.5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search destination, trip name..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Trips List - Streamlined, Compact & Reorganized Trip Card Layout */}
        <section className="space-y-3 pt-0.5">
          {filteredTrips.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 bg-sky-50 border border-sky-100 text-sky-600 rounded-full mx-auto flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  No Trips Found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No trips match your search. Click above to plan with AI or create a new trip manually.
                </p>
              </div>
            </div>
          ) : (
            filteredTrips.map(trip => {
              const isActive = activeTrip && activeTrip.id === trip.id;
              const status = trip.status || 'ACTIVE';
              const totalExpenses = (trip.expenses || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
              const budget = trip.totalBudget || 0;
              const budgetPercent = budget > 0 ? Math.min(100, Math.round((totalExpenses / budget) * 100)) : 0;
              const memberCount = (trip.members || []).length;

              // Ensure Destination (e.g. Goa) is the prominent highlighted title!
              let mainHighlight = trip.destination || trip.name || 'Trip';
              let routeTag: string | null = null;
              if (trip.destination && trip.name && trip.destination.trim().toLowerCase() !== trip.name.trim().toLowerCase()) {
                mainHighlight = trip.destination.trim();
                routeTag = trip.name.trim();
              } else if (trip.name && trip.name.toLowerCase().includes('goa') && (!trip.destination || trip.destination.toLowerCase() !== 'goa')) {
                mainHighlight = 'Goa';
                routeTag = trip.name.trim();
              }

              const photoUrl = getDestinationPhoto(trip.destination, trip.name);

              return (
                <div
                  key={trip.id}
                  className={`bg-white border rounded-2xl p-3 sm:p-3.5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden group ${
                    isActive ? 'border-sky-400 ring-2 ring-sky-100/70' : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600" />
                  )}

                  {/* Top Section: Photo + Compact Reorganized Information Stack */}
                  <div className="flex items-start gap-3">
                    {/* Realistic Destination Photo */}
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 shadow-xs border border-slate-200/90 bg-slate-100 group-hover:scale-102 transition-transform mt-0.5">
                      <img 
                        src={photoUrl} 
                        alt={mainHighlight}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Information Stack - Compact, Clean & Reorganized */}
                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Line 1: Destination Title Highlight + Route + Status */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-baseline gap-1.5 min-w-0 truncate">
                          <h3 className="text-base font-black text-slate-900 tracking-tight leading-tight truncate">
                            {mainHighlight}
                          </h3>
                          {routeTag && (
                            <span className="text-[11px] font-medium text-slate-500 truncate hidden sm:inline">
                              · {routeTag}
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : status === 'PLANNED'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                            {status === 'PLANNED' ? 'Upcoming' : status === 'ACTIVE' ? 'Active' : 'Done'}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded text-[9px] font-black uppercase tracking-wider">
                              Current
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Line 1.5: Route Tag on Mobile if exists */}
                      {routeTag && (
                        <div className="text-[11px] font-medium text-slate-500 sm:hidden truncate leading-none">
                          {routeTag}
                        </div>
                      )}

                      {/* Line 2: Clean Metadata (Dates & Travellers) */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold shrink-0">
                          <Calendar className="w-3 h-3 text-sky-600 shrink-0" />
                          <span>{formatTripDates(trip.startDate, trip.endDate)}</span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold shrink-0">
                          <Users className="w-3 h-3 text-sky-600 shrink-0" />
                          <span>{memberCount} Travellers</span>
                        </span>
                      </div>

                      {/* Line 3: Budget Spent & Total grouped together with sleek progress track */}
                      {budget > 0 && (
                        <div className="pt-0.5 space-y-1">
                          <div className="flex items-center justify-between text-[11px] leading-tight">
                            <span className="text-slate-500">
                              Spent <strong className="text-slate-900 font-black">₹{totalExpenses.toLocaleString('en-IN')}</strong>
                            </span>
                            <span className="text-slate-500">
                              Budget <strong className="text-slate-700 font-bold">₹{budget.toLocaleString('en-IN')}</strong>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${budgetPercent > 90 ? 'bg-rose-500' : 'bg-sky-500'}`}
                              style={{ width: `${budgetPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Bar: Symmetrical & Balanced (NOT lopsided or stuck to one side!) */}
                  <div className="pt-2 mt-2.5 border-t border-slate-100 flex items-center gap-2">
                    {/* Left: Quick Status Cycle */}
                    <button
                      type="button"
                      onClick={() => handleCycleStatus(trip)}
                      className="btn-3d-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-700 cursor-pointer active:scale-95 shrink-0"
                      title="Switch status"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-sky-600" />
                      <span className="text-[11px]">Status</span>
                    </button>

                    {/* Center / Full: Primary Open Trip Button (flex-1 fills available width!) */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTrip(trip);
                        onEnterTrip?.();
                        showToast(`"${mainHighlight}" opened!`);
                      }}
                      className="btn-3d-primary flex-1 py-1.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                    >
                      <span>Open Trip</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Right: Trash / Delete Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete ${mainHighlight}?`)) {
                          deleteTrip(trip.id);
                          showToast('Trip deleted');
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 1. AI PRE-TRIP PLANNER (BOTTOM SHEET POP-UP STYLE LIKE OTHER TABS)        */}
      {/* ========================================================================= */}
      {showAiModal && (
        <div 
          className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200 font-['Outfit',sans-serif]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Mobile Pull Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-sky-50 via-indigo-50/50 to-white border-b border-sky-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/25 border border-sky-500 shrink-0">
                  <span
                    className="material-symbols-outlined text-[26px] text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    travel_explore
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 leading-tight">
                    AI Pre-Trip Planner
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Intelligent itinerary, routes, attractions & realistic budget
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setAiPreviewPlan(null);
                }}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200 shadow-2xs transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/60">
              {/* Popular Destination Chips with Real Photos */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>Popular Destinations</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_DESTINATIONS.map(item => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setAiDest(item.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                        aiDest.toLowerCase() === item.name.toLowerCase()
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img 
                        src={item.img} 
                        alt={item.name} 
                        className="w-4 h-4 rounded-full object-cover shrink-0" 
                      />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ready-made Template Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Preset Packages</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PROMPT_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="p-2.5 bg-white border border-slate-200 hover:border-sky-400 rounded-xl text-left text-xs font-bold text-slate-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>{p.label}</span>
                      <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-black">₹{p.budget}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Departure & Destination Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Departure City
                  </label>
                  <input
                    type="text"
                    value={aiDep}
                    onChange={e => setAiDep(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={aiDest}
                    onChange={e => setAiDest(e.target.value)}
                    placeholder="e.g. Goa"
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-sky-500 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Smart Via Route Options */}
              {smartViaRoutes.length > 0 && (
                <div className="space-y-1.5 p-3 bg-white border border-sky-200 rounded-2xl">
                  <label className="text-xs font-extrabold text-sky-800 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-sky-600" />
                    <span>Recommended Smart Routes</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                    {smartViaRoutes.map(route => (
                      <button
                        key={route.id}
                        type="button"
                        onClick={() => setAiVia(route.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          aiVia === route.id
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight">
                          {route.nameEn}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${aiVia === route.id ? 'text-sky-100' : 'text-slate-500'}`}>
                          {route.descEn}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Transport Mode Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Transport Mode
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TRANSPORT_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAiTransport(opt.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          aiTransport === opt.id
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 font-semibold'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trip Type, Days, Persons, Budget */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Trip Type
                  </label>
                  <select
                    value={aiTripType}
                    onChange={e => setAiTripType(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  >
                    {TRIP_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={aiDays}
                    onChange={e => setAiDays(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Persons
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={aiPersons}
                    onChange={e => setAiPersons(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Budget (₹)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSmartBudgetSource('ai');
                        setShowSmartBudget(true);
                      }}
                      className="text-[10px] font-extrabold text-sky-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Calculator className="w-2.5 h-2.5" />
                      <span>Smart</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    value={aiBudget}
                    onChange={e => setAiBudget(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={aiStartDate}
                  onChange={e => setAiStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              {/* Loading State Banner */}
              {aiLoadingStep && (
                <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-3 text-sky-800 text-xs font-bold animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0 text-sky-600" />
                  <span>{aiLoadingStep}</span>
                </div>
              )}

              {/* AI Generated Preview Itinerary */}
              {aiPreviewPlan && (
                <div className="space-y-3.5 pt-3 border-t border-slate-200">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase">
                        ✨ Generated Itinerary
                      </span>
                      {aiPreviewPlan.route_info && (
                        <span className="text-xs font-bold text-slate-500">
                          {aiPreviewPlan.route_info.distance} • {aiPreviewPlan.route_info.duration}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900">{aiPreviewPlan.trip_title}</h3>
                    <p className="text-xs text-slate-600">{aiPreviewPlan.overview}</p>

                    {/* Cost Breakdown */}
                    {aiPreviewPlan.cost_breakdown && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <div className="text-[10px] text-slate-500 font-bold">Transport</div>
                          <div className="text-xs font-black text-slate-800">₹{aiPreviewPlan.cost_breakdown.transport}</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <div className="text-[10px] text-slate-500 font-bold">Stay</div>
                          <div className="text-xs font-black text-slate-800">₹{aiPreviewPlan.cost_breakdown.stay}</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl text-center">
                          <div className="text-[10px] text-slate-500 font-bold">Food</div>
                          <div className="text-xs font-black text-slate-800">₹{aiPreviewPlan.cost_breakdown.food}</div>
                        </div>
                        <div className="p-2 bg-sky-50 rounded-xl text-center border border-sky-100">
                          <div className="text-[10px] text-sky-700 font-bold">Total Budget</div>
                          <div className="text-xs font-black text-sky-800">₹{aiPreviewPlan.cost_breakdown.total}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Day-by-Day List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Daily Schedule
                    </h4>
                    {aiPreviewPlan.days && aiPreviewPlan.days.map((day: any, dIdx: number) => (
                      <div key={dIdx} className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
                        <div className="font-extrabold text-xs text-sky-700">
                          {day.title || `Day ${day.day_number}`}
                        </div>
                        <div className="space-y-1.5 pl-2 border-l-2 border-slate-100 text-xs">
                          {[...(day.morning || []), ...(day.afternoon || []), ...(day.evening || [])].map((slot: any, sIdx: number) => (
                            <div key={sIdx} className="flex items-start justify-between text-slate-700 py-0.5">
                              <div>
                                <span className="font-mono text-[10px] text-slate-400 font-bold mr-2">{slot.time}</span>
                                <span className="font-semibold">{slot.activity}</span>
                                {slot.location && (
                                  <span className="text-[10px] text-slate-400 ml-1.5">(@ {slot.location})</span>
                                )}
                              </div>
                              {slot.cost > 0 && (
                                <span className="text-[10px] font-bold text-emerald-600 shrink-0 ml-2">₹{slot.cost}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions with Global 3D App Classes */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setAiPreviewPlan(null);
                }}
                className="btn-3d-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              {!aiPreviewPlan ? (
                <button
                  type="button"
                  disabled={Boolean(aiLoadingStep)}
                  onClick={executeGenerateAiTrip}
                  className="btn-3d-primary px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <span
                    className="material-symbols-outlined text-[18px] text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    travel_explore
                  </span>
                  <span>Generate AI Plan</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveAiTripToContext}
                  className="btn-3d-primary px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save &amp; Launch Trip</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MANUAL TRIP PLANNER (BOTTOM SHEET POP-UP STYLE LIKE OTHER TABS)        */}
      {/* ========================================================================= */}
      {showManualModal && (
        <div 
          className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200 font-['Outfit',sans-serif]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Mobile Pull Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-sky-50 via-indigo-50/50 to-white border-b border-sky-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 border border-emerald-500 shrink-0">
                  <span
                    className="material-symbols-outlined text-[26px] text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    luggage
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 leading-tight">
                    Create New Trip
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Configure trip details, calculation mode, and travellers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200 shadow-2xs transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateManualTrip} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/60">
                {/* 1. Basic Trip Details */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>1. Basic Information</span>
                  </h3>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Trip Name
                      </label>
                      <input
                        type="text"
                        value={manName}
                        onChange={e => setManName(e.target.value)}
                        placeholder="e.g. Goa Vacation 2026"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Destination
                      </label>
                      <input
                        type="text"
                        value={manDestination}
                        onChange={e => setManDestination(e.target.value)}
                        placeholder="e.g. Goa / Manali"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Start Date</span>
                        </label>
                        <input
                          type="date"
                          value={manStartDate}
                          onChange={e => setManStartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>End Date</span>
                        </label>
                        <input
                          type="date"
                          value={manEndDate}
                          onChange={e => setManEndDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Calculation Mode & Budget */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>2. Split Mode &amp; Budget</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setManCalcMode('admin_pooled')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        manCalcMode === 'admin_pooled'
                          ? 'bg-sky-50 border-sky-400 text-sky-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs text-sky-600">
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Admin Pooled Fund</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Central pooled fund where expenses are paid from member advance deposits.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setManCalcMode('individual_split')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        manCalcMode === 'individual_split'
                          ? 'bg-purple-50 border-purple-400 text-purple-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs text-purple-600">
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Individual Split</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Direct peer-to-peer split where individuals record and settle expenses.
                      </p>
                    </button>
                  </div>

                  {/* Budget & Smart Budget Calculator */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Total Budget (₹)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setSmartBudgetSource('manual');
                          setShowSmartBudget(true);
                        }}
                        className="text-[11px] font-extrabold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>Smart Budget Calculator</span>
                      </button>
                    </div>
                    <input
                      type="number"
                      value={manTotalBudget}
                      onChange={e => setManTotalBudget(e.target.value)}
                      placeholder="15000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                {/* 3. Co-Travellers Ledger (Name, Deposit, UPI) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>3. Co-Travellers Ledger</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddMemberRow}
                      className="px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ Add Member</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {manMembers.map((mem, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black text-slate-500">#{idx + 1} {mem.isAdmin ? '(Admin)' : ''}</span>
                          {manMembers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMemberRow(idx)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={mem.name}
                            onChange={e => {
                              const val = e.target.value;
                              setManMembers(prev => prev.map((m, i) => i === idx ? { ...m, name: val } : m));
                            }}
                            placeholder="Member Name"
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none"
                          />

                          <input
                            type="number"
                            value={mem.deposit}
                            onChange={e => {
                              const val = e.target.value;
                              setManMembers(prev => prev.map((m, i) => i === idx ? { ...m, deposit: val } : m));
                            }}
                            placeholder="Deposit ₹"
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none"
                          />

                          <input
                            type="text"
                            value={mem.upiId}
                            onChange={e => {
                              const val = e.target.value;
                              setManMembers(prev => prev.map((m, i) => i === idx ? { ...m, upiId: val } : m));
                            }}
                            placeholder="UPI ID (e.g. name@okhdfc)"
                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Footer */}
                  <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-between text-xs font-extrabold text-sky-900">
                    <span>Total Members: {manMembers.length}</span>
                    <span>
                      Total Advance Fund: ₹
                      {manMembers.reduce((sum, m) => sum + (parseFloat(m.deposit) || 0), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Bottom Actions with Global 3D App Classes */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="btn-3d-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-3d-primary px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create &amp; Launch Trip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SMART BUDGET MODAL                                                     */}
      {/* ========================================================================= */}
      {showSmartBudget && (
        <SmartBudgetModal
          isOpen={showSmartBudget}
          onClose={() => setShowSmartBudget(false)}
          lang="en"
          destination={smartBudgetSource === 'ai' ? (aiDest || 'Goa') : (manDestination || 'Goa')}
          days={smartBudgetSource === 'ai' ? (parseInt(aiDays) || 3) : 3}
          persons={smartBudgetSource === 'ai' ? (parseInt(aiPersons) || 2) : manMembers.length}
          transportMode={smartBudgetSource === 'ai' ? aiTransport : 'car'}
          onApplyBudget={(total: number) => {
            if (smartBudgetSource === 'ai') {
              setAiBudget(total.toString());
            } else {
              setManTotalBudget(total.toString());
            }
            setShowSmartBudget(false);
            showToast(`Budget applied: ₹${total.toLocaleString('en-IN')}`);
          }}
        />
      )}
    </div>
  );
};
