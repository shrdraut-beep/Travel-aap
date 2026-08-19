
import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  ClipboardList,
  Compass,
  Users,
  DollarSign,
  MapPin,
  Check,
  CheckCircle2,
  Hotel,
  Ticket,
  Car,
  Fuel,
  Info,
  Thermometer,
  Cloud,
  Search,
  Plus,
  Bell,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TopBar, useScrolled, LogoName } from "./SharedUI";
import { TabDashboardLayout } from "./TabDashboardLayout";
import { TripGroup, PackingCategory } from "../../types";
import { useTripContext } from "../../context/TripContext";
import { useLanguage } from "../../context/LanguageContext";
import { CalendarView } from '../views/CalendarView';
import { ItineraryCard } from '../ItineraryCard';

interface PlanningScreenProps {
  onLogout: () => void;
  onOpenCreateTrip?: () => void;
  onOpenPlanner?: () => void;
  onSOS?: () => void;
  setActive?: (tab: string, subCategory?: string) => void;
  trip?: TripGroup;
  onBack?: () => void;
}

const HARDCODED_PACKING_CATEGORIES = (lang: string): PackingCategory[] => {
  const isMr = lang === 'mr';
  return [
    {
      id: 'cat_docs',
      name: isMr ? 'महत्त्वाची कागदपत्रे (Documents)' : 'Important Documents',
      items: [
        { id: 'doc_1', name: isMr ? 'ओळखपत्र (आधार कार्ड / पॅन कार्ड / मतदान कार्ड)' : 'ID Proof (Aadhaar / PAN / Voter ID)', isChecked: false, essential: true },
        { id: 'doc_2', name: isMr ? 'ड्रायव्हिंग लायसन्स' : 'Driving License', isChecked: false, essential: true },
        { id: 'doc_3', name: isMr ? 'प्रवासाची तिकिटे (विमान / ट्रेन / बस)' : 'Travel Tickets (Flight / Train / Bus)', isChecked: false, essential: true },
        { id: 'doc_4', name: isMr ? 'हॉटेल बुकिंग कन्फर्मेशन' : 'Hotel Booking Confirmation', isChecked: false, essential: true },
        { id: 'doc_5', name: isMr ? 'पासपोर्ट आणि व्हिसा' : 'Passport & Visa', isChecked: false, essential: false },
      ]
    },
    {
      id: 'cat_medicines',
      name: isMr ? 'औषधे आणि प्रथमोपचार (Medicines & First Aid)' : 'Medicines & First Aid',
      items: [
        { id: 'med_1', name: isMr ? 'नियमित औषधे (बीपी, शुगर इ.)' : 'Regular Medicines (BP, Sugar, etc.)', isChecked: false, essential: true },
        { id: 'med_2', name: isMr ? 'डोकेदुखी आणि ताप (पॅरासिटामॉल)' : 'Headache & Fever (Paracetamol)', isChecked: false, essential: true },
        { id: 'med_3', name: isMr ? 'ॲसिडिटी आणि गॅसची औषधे' : 'Acidity & Gas Relief', isChecked: false, essential: false },
        { id: 'med_4', name: isMr ? 'उलटी आणि मळमळ थांबवण्याची औषधे' : 'Motion Sickness / Nausea Relief', isChecked: false, essential: false },
        { id: 'med_5', name: isMr ? 'बँड-एड आणि अँटीसेप्टिक मलम' : 'Band-Aid & Antiseptic Ointment', isChecked: false, essential: true },
        { id: 'med_6', name: isMr ? 'ओआरएस (ORS) किंवा इलेक्ट्रॉल' : 'ORS / Electral Powder', isChecked: false, essential: false },
      ]
    },
    {
      id: 'cat_clothing',
      name: isMr ? 'कपडे आणि पादत्राणे (Clothing & Footwear)' : 'Clothing & Footwear',
      items: [
        { id: 'cloth_1', name: isMr ? 'टी-शर्ट्स आणि टॉप्स' : 'T-Shirts & Tops', isChecked: false, essential: true },
        { id: 'cloth_2', name: isMr ? 'पँट्स / जीन्स / ट्रॅक पँट्स' : 'Pants / Jeans / Track Pants', isChecked: false, essential: true },
        { id: 'cloth_3', name: isMr ? 'अंडरवेअर / इनरवियर' : 'Underwear / Innerwear', isChecked: false, essential: true },
        { id: 'cloth_4', name: isMr ? 'रात्रीचे आरामदायक कपडे (Nightwear)' : 'Comfortable Nightwear', isChecked: false, essential: false },
        { id: 'cloth_5', name: isMr ? 'स्वेटर किंवा जॅकेट' : 'Sweater or Jacket', isChecked: false, essential: false },
        { id: 'cloth_6', name: isMr ? 'चालण्यासाठी शूज (ट्रेकिंग/स्पोर्ट)' : 'Walking Shoes (Trekking / Sports)', isChecked: false, essential: true },
        { id: 'cloth_7', name: isMr ? 'स्लीपर्स किंवा सँडल्स' : 'Slippers or Sandals', isChecked: false, essential: false },
        { id: 'cloth_8', name: isMr ? 'मोजे (Socks)' : 'Socks', isChecked: false, essential: true },
      ]
    },
    {
      id: 'cat_electronics',
      name: isMr ? 'इलेक्ट्रॉनिक्स (Electronics)' : 'Electronics',
      items: [
        { id: 'elec_1', name: isMr ? 'मोबाईल आणि चार्जर' : 'Mobile & Charger', isChecked: false, essential: true },
        { id: 'elec_2', name: isMr ? 'पॉवर बँक' : 'Power Bank', isChecked: false, essential: true },
        { id: 'elec_3', name: isMr ? 'इअरफोन्स / हेडफोन्स' : 'Earphones / Headphones', isChecked: false, essential: false },
        { id: 'elec_4', name: isMr ? 'कॅमेरा आणि अतिरिक्त बॅटरी' : 'Camera & Extra Battery', isChecked: false, essential: false },
      ]
    },
    {
      id: 'cat_essentials',
      name: isMr ? 'इतर आवश्यक वस्तू (Essentials)' : 'Essentials & Toiletries',
      items: [
        { id: 'ess_1', name: isMr ? 'रोख रक्कम आणि UPI स्कॅनर' : 'Cash & UPI Scanner', isChecked: false, essential: true },
        { id: 'ess_2', name: isMr ? 'पाण्याची बाटली (पुन्हा वापरण्यायोग्य)' : 'Water Bottle (Reusable)', isChecked: false, essential: true },
        { id: 'ess_3', name: isMr ? 'छत्री / रेनकोट' : 'Umbrella / Raincoat', isChecked: false, essential: false },
        { id: 'ess_4', name: isMr ? 'साबण, शॅम्पू, टूथब्रश, टूथपेस्ट' : 'Soap, Shampoo, Toothbrush, Paste', isChecked: false, essential: true },
        { id: 'ess_5', name: isMr ? 'सनस्क्रीन आणि मॉइश्चरायझर' : 'Sunscreen & Moisturizer', isChecked: false, essential: false },
        { id: 'ess_6', name: isMr ? 'टॉवेल / रुमाल' : 'Towel / Napkin', isChecked: false, essential: true },
        { id: 'ess_7', name: isMr ? 'स्नॅक्स आणि बिस्किटे' : 'Snacks & Biscuits', isChecked: false, essential: false },
      ]
    }
  ];
};

export function PlanningScreen({
  onLogout,
  onOpenCreateTrip,
  onOpenPlanner,
  onSOS,
  setActive,
  trip: initialTrip,
  onBack
}: PlanningScreenProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(scrollRef);
  const { activeTrip, updateActiveTrip } = useTripContext();
  const { lang, t } = useLanguage();
  const isMr = lang === 'mr';
  const [activeSection, setActiveSection] = useState<'none' | 'ai-manager'>('none');

  const currentTrip = initialTrip || activeTrip;
  
  const setCurrentTrip = (updated: TripGroup | ((prev: TripGroup) => TripGroup)) => {
    if (typeof updated === 'function') {
      const next = updated(currentTrip!);
      updateActiveTrip(next);
    } else {
      updateActiveTrip(updated);
    }
  };

  if (!currentTrip) {
    return <div className="p-10 text-center">{isMr ? 'कोणतीही ट्रिप नाही' : 'No Active Trip'}</div>;
  }

  // Budget Calculations
  const expenses = currentTrip.expenses || [];
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = currentTrip.totalBudget || 0;
  const totalBalance = totalBudget - totalExpenses;
  const expenseRatio = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
  const isOverBudget = expenseRatio > 100;
  
  // Weather Logic
  const [weatherData, setWeatherData] = useState<{temp: string, desc: string} | null>(null);
  useEffect(() => {
    const checkWeather = async () => {
      if (!currentTrip.startDate || !currentTrip.endDate) return;
      const start = new Date(currentTrip.startDate);
      const end = new Date(currentTrip.endDate);
      const now = new Date();
      if (now.getTime() > end.getTime() + 86400000) {
        setWeatherData(null);
        return;
      }
      try {
        if (currentTrip.weatherForecast && currentTrip.weatherForecast.length > 0) {
          const w = currentTrip.weatherForecast[0];
          setWeatherData({ temp: `${w.temp}°C`, desc: w.condition });
        }
      } catch (err) {}
    };
    checkWeather();
  }, [currentTrip.startDate, currentTrip.endDate, currentTrip.destination, currentTrip.weatherForecast]);

  // Step 2 States (Estimated Budget)
  const [estTransport, setEstTransport] = useState(currentTrip.budget?.transport || 0);
  const [estAccommodation, setEstAccommodation] = useState(currentTrip.budget?.accommodation || 0);
  const [estFood, setEstFood] = useState(currentTrip.budget?.food || 0);
  const [estShopping, setEstShopping] = useState(currentTrip.budget?.shopping || 0);

  // Fuel Calculator States
  const [origin, setOrigin] = useState(currentTrip.source || '');
  const [destination, setDestination] = useState(currentTrip.destination || '');
  const [mileage, setMileage] = useState('15');
  const [fuelPrice, setFuelPrice] = useState('105');
  const [toll, setToll] = useState('0');
  const [distance, setDistance] = useState('300');
  
  const fuelCost = ((parseFloat(distance) * 2) / parseFloat(mileage)) * parseFloat(fuelPrice) + parseFloat(toll) * 2;

  const handleAutoCalculateAI = () => {
    if (!currentTrip.startDate || !currentTrip.endDate) return;
    const days = Math.max(1, (new Date(currentTrip.endDate).getTime() - new Date(currentTrip.startDate).getTime()) / (1000*3600*24));
    const members = currentTrip.members?.length || 1;
    setEstAccommodation(Math.round(2000 * days * members));
    setEstFood(Math.round(1000 * days * members));
    setEstShopping(Math.round(1500 * members));
    setEstTransport(Math.round(fuelCost > 0 ? fuelCost : 1200 * members));
  };

  const handleSaveBudget = () => {
    setCurrentTrip(prev => ({
      ...prev,
      budget: {
        transport: estTransport,
        accommodation: estAccommodation,
        food: estFood,
        shopping: estShopping
      }
    }));
  };

  const [packingSearch, setPackingSearch] = useState("");
  const packingCategories = currentTrip.detailedPackingList || HARDCODED_PACKING_CATEGORIES(lang);

  const handleToggleItem = (catId: string, itemId: string) => {
    const updated = packingCategories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          items: c.items.map(i => i.id === itemId ? { ...i, isChecked: !i.isChecked } : i)
        };
      }
      return c;
    });
    setCurrentTrip(prev => ({ ...prev, detailedPackingList: updated }));
  };

  const [scheduleMode, setScheduleMode] = useState<'list'|'calendar'>('list');
  const [activePlanTab, setActivePlanTab] = useState<'overview'|'budget'|'schedule'|'packing'>('overview');

  const filteredCategories = packingCategories.map(c => ({
    ...c,
    items: c.items.filter(i => i.name.toLowerCase().includes(packingSearch.toLowerCase()))
  })).filter(c => c.items.length > 0);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50 relative">
      <TopBar 
        sub={isMr ? "प्लॅनिंग प्रवास" : "Trip Journey Flow"} 
        title={<LogoName />} 
        scrolled={scrolled} 
        onLogout={onLogout} 
        onBack={onBack}
      />

      
      <div className="pt-3 pb-8">
        <TabDashboardLayout
          cards={[
            {
              title: isMr ? "AI मॅनेजर" : "AI MANAGER",
              subtitle: isMr ? "ट्रिप अलर्ट्स व रेकमेन्डेशन्स" : "Smart trip alerts & tools",
              icon: Sparkles,
              iconColor: "text-rose-100",
              gradient: activeSection === 'ai-manager'
                ? "from-rose-750 via-rose-850 to-red-950 border-2 border-rose-400 shadow-lg scale-[1.02]"
                : "from-rose-600 via-rose-700 to-red-700 border border-rose-500/30 shadow-rose-200/60",
              subtitleColorClass: "text-rose-100",
              onClick: () => setActiveSection(activeSection === 'ai-manager' ? 'none' : 'ai-manager')
            }
          ]}
          gridTitle={isMr ? "प्लॅनिंग सर्व्हिसेस" : "Planning Services"}
          gridIcon={Compass}
          gridItems={[
            { 
              icon: DollarSign, 
              label: isMr ? "बजेट" : "Budget", 
              color: "from-emerald-500 to-teal-600", 
              isActive: activePlanTab === 'budget',
              onClick: () => setActivePlanTab(activePlanTab === 'budget' ? 'overview' : 'budget') 
            },
            { 
              icon: Calendar, 
              label: isMr ? "शेड्युल" : "Schedule", 
              color: "from-blue-500 to-indigo-600", 
              isActive: activePlanTab === 'schedule',
              onClick: () => setActivePlanTab(activePlanTab === 'schedule' ? 'overview' : 'schedule') 
            },
            { 
              icon: ClipboardList, 
              label: isMr ? "पॅकिंग" : "Packing", 
              color: "from-amber-500 to-orange-600", 
              isActive: activePlanTab === 'packing',
              onClick: () => setActivePlanTab(activePlanTab === 'packing' ? 'overview' : 'packing') 
            }
          ]}
        >
          <div className="px-2 max-w-lg mx-auto w-full mt-6">

            {/* AI Trip Manager Collapsible Alerts */}
            <AnimatePresence mode="wait">
              {activeSection === 'ai-manager' && (
                <motion.div
                  key="ai-manager-panel"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-3xl shadow-sm text-left relative">
                    <button 
                      onClick={() => setActiveSection('none')} 
                      className="absolute top-3 right-3 p-1 rounded-full bg-white/85 hover:bg-white border border-indigo-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5 text-slate-600" />
                    </button>

                    <h4 className="font-black text-indigo-900 text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5 pr-6">
                      <Sparkles className="w-4 h-4 text-indigo-600" /> {isMr ? 'AI ट्रिप मॅनेजर अलर्ट्स' : 'AI Trip Manager Alerts'}
                    </h4>
                    <div className="space-y-2">
                      <div className="bg-white/90 p-3 rounded-2xl flex gap-3 shadow-sm items-start">
                        <span className="text-xl shrink-0">🏨</span>
                        <div>
                          <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">{isMr ? 'बुकिंग रिमाइंडर' : 'Booking Reminder'}</h5>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
                            {isMr 
                              ? `${currentTrip.destination || 'तुमच्या डेस्टिनेशन'} मधील हॉटेल बुकिंग कन्फर्म करा. स्थानिक किंमती १५% ने वाढत आहेत.` 
                              : `Confirm your hotel reservation in ${currentTrip.destination || 'your destination'}. Local prices are rising by 15% due to upcoming events.`}
                          </p>
                        </div>
                      </div>
                      {(!currentTrip.transportMode || currentTrip.transportMode === 'air') && (
                        <div className="bg-white/90 p-3 rounded-2xl flex gap-3 shadow-sm items-start">
                          <span className="text-xl shrink-0">✈️</span>
                          <div>
                            <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">{isMr ? 'प्रवासाची तयारी' : 'Travel Ready'}</h5>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
                              {isMr ? 'प्रवासाच्या २४ तास आधी वेब चेक-इन करा. तिकिटे तयार ठेवा.' : 'Please check-in to your flight/train 24 hours prior. Keep your ID and tickets handy.'}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="bg-white/90 p-3 rounded-2xl flex gap-3 shadow-sm items-start">
                        <span className="text-xl shrink-0">🚗</span>
                        <div>
                          <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">{isMr ? 'ट्रॅफिक इंटेलिजन्स' : 'Route Intelligence'}</h5>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
                            {isMr ? '३० मिनिटे लवकर निघा. रस्त्यावर ट्रॅफिक असू शकते.' : 'Leave 30 mins early. Moderate traffic spotted en-route via local intelligence.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        
            {isOverBudget && (
              <div className="mb-4 bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-start gap-2 shadow-sm text-left">
                <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-800">{isMr ? 'बजेट अलर्ट' : 'Budget Alert'}</h4>
                  <p className="text-xs text-rose-600 font-medium leading-relaxed">
                    {isMr ? 'तुम्ही तुमचे बजेट ओलांडले आहे. कृपया खर्चाची तपासणी करा.' : 'You have exceeded your overall budget. Please review your expenses or adjust estimates.'}
                  </p>
                </div>
              </div>
            )}

        <div className="mb-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-800 tracking-widest uppercase text-sm">{isMr ? 'बजेट डॅशबोर्ड' : 'Budget Dashboard'}</h3>
            {weatherData && (
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-bold border border-blue-100">
                <Thermometer className="w-3 h-3" />
                {weatherData.temp} - {weatherData.desc}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{isMr ? 'एकूण बजेट' : 'TOTAL BUDGET'}</span>
              <span className="text-xl font-black text-slate-800">₹{totalBudget}</span>
            </div>
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">{isMr ? 'एकूण खर्च' : 'TOTAL EXPENSE'}</span>
              <span className="text-xl font-black text-rose-700">₹{totalExpenses}</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex flex-col justify-between col-span-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">{isMr ? 'शिल्लक रक्कम' : 'TOTAL BALANCE'}</span>
              <span className="text-2xl font-black text-emerald-700">₹{totalBalance}</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(expenseRatio, 100)}%` }}
            />
          </div>
          <div className="text-right text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
            {Math.round(expenseRatio)}% {isMr ? 'वापरले' : 'USED'}
          </div>
        </div>

        <div className="space-y-6 pb-4">
            {(activePlanTab === 'overview' || activePlanTab === 'budget') && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">{isMr ? 'बजेट' : 'Trip Budget'}</h3>
                    <p className="text-[10px] font-bold text-slate-500">{isMr ? 'तुमच्या बजेटचा अंदाज लावा.' : 'Estimate and secure your trip budget.'}</p>
                  </div>
                </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{isMr ? 'अंदाजित बजेट' : 'Estimated Budget'}</span>
                <button 
                  onClick={handleAutoCalculateAI}
                  className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all uppercase tracking-widest"
                >
                  <Sparkles className="w-3 h-3" /> {isMr ? 'AI द्वारे कॅल्क्युलेट' : 'Auto-Calculate via AI'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1">{isMr ? 'प्रवास खर्च' : 'Transport'}</label>
                  <input type="number" value={estTransport} onChange={e=>setEstTransport(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-900 focus:outline-none focus:bg-white focus:border-red-500" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1">{isMr ? 'हॉटेल / राहणे' : 'Accommodation'}</label>
                  <input type="number" value={estAccommodation} onChange={e=>setEstAccommodation(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-900 focus:outline-none focus:bg-white focus:border-red-500" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1">{isMr ? 'खाद्यपदार्थ' : 'Food'}</label>
                  <input type="number" value={estFood} onChange={e=>setEstFood(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-900 focus:outline-none focus:bg-white focus:border-red-500" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1">{isMr ? 'खरेदी व इतर' : 'Shopping & Misc'}</label>
                  <input type="number" value={estShopping} onChange={e=>setEstShopping(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-900 focus:outline-none focus:bg-white focus:border-red-500" />
                </div>
              </div>

              {(!currentTrip.transportMode || currentTrip.transportMode === 'road') && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Fuel className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">{isMr ? 'इंधन आणि टोल कॅल्क्युलेटर' : 'Fuel & Tolls (Round Trip)'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <input type="text" value={origin} onChange={e=>setOrigin(e.target.value)} placeholder={isMr ? "सुरुवात (Origin)" : "Origin"} className="bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-xs font-extrabold text-slate-900 placeholder-amber-600/60 focus:outline-none focus:border-amber-500" />
                    <input type="text" value={destination} onChange={e=>setDestination(e.target.value)} placeholder={isMr ? "डेस्टिनेशन" : "Destination"} className="bg-white border border-amber-300 rounded-lg px-2 py-1.5 text-xs font-extrabold text-slate-900 placeholder-amber-600/60 focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-amber-800 block mb-1">{isMr ? 'मायलेज (km/l)' : 'Mileage (km/l)'}</label>
                      <input type="number" value={mileage} onChange={e=>setMileage(e.target.value)} className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-amber-800 block mb-1">{isMr ? 'इंधन दर (₹)' : 'Fuel Price (₹)'}</label>
                      <input type="number" value={fuelPrice} onChange={e=>setFuelPrice(e.target.value)} className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-amber-800 block mb-1">{isMr ? 'टोल (₹)' : 'Tolls (₹)'}</label>
                      <input type="number" value={toll} onChange={e=>setToll(e.target.value)} className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-amber-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900">{isMr ? 'एकूण:' : 'Total:'} ₹{Math.round(fuelCost)}</span>
                    <button 
                      onClick={() => setEstTransport(Math.round(fuelCost))}
                      className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold active:scale-95 transition-all"
                    >
                      {isMr ? 'ट्रान्सपोर्टमध्ये जोडा' : 'Apply to Transport'}
                    </button>
                  </div>
                </div>
              )}

              <button 
                onClick={handleSaveBudget}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-md"
              >
                {isMr ? 'बजेट सेव्ह करा' : 'Save Estimated Budget'}
              </button>
            </div>
            )}

            {(activePlanTab === 'overview' || activePlanTab === 'schedule') && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">{isMr ? 'शेड्युल' : 'Schedule'}</h3>
                    <p className="text-[10px] font-bold text-slate-500">Manage daily itinerary</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest">{isMr ? 'शेड्युल' : 'Schedule'}</h4>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setScheduleMode('list')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${scheduleMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{isMr ? 'लिस्ट' : 'List'}</button>
                    <button onClick={() => setScheduleMode('calendar')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${scheduleMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{isMr ? 'कॅलेंडर' : 'Calendar'}</button>
                  </div>
                </div>
                {scheduleMode === 'calendar' ? (
                  <CalendarView 
                    trip={currentTrip} 
                    itinerary={currentTrip.itinerary || []} 
                    lang={lang} 
                    currencySymbol="₹" 
                    onUpdateTrip={setCurrentTrip}
                  />
                ) : (
                  <div className="space-y-3">
                    {currentTrip.itinerary && currentTrip.itinerary.length > 0 ? (
                      currentTrip.itinerary.map((plan) => (
                        <ItineraryCard key={plan.id} plan={plan} />
                      ))
                    ) : (
                      <div className="text-center text-slate-400 text-xs py-4">{isMr ? 'अद्याप कोणतेही शेड्युल जोडलेले नाही.' : 'No schedule items added yet.'}</div>
                    )}
                  </div>
                )}
              </div>

            )}
            
            {(activePlanTab === 'overview' || activePlanTab === 'packing') && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">{isMr ? 'पॅकिंग लिस्ट' : 'Pre-Trip Packing List'}</h3>
                    <p className="text-[10px] font-bold text-slate-500">Don't forget anything</p>
                  </div>
                </div>
                <div className="relative mb-4">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input 
                    type="text" 
                    value={packingSearch} 
                    onChange={e => setPackingSearch(e.target.value)} 
                    placeholder={isMr ? "शोधा..." : "Search packing items..."}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-4">
                  {filteredCategories.map(cat => (
                    <div key={cat.id}>
                      <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">{cat.name} ({cat.items.length})</h5>
                      <div className="space-y-2">
                        {cat.items.map(item => (
                          <div key={item.id} className="flex items-center gap-2">
                            <button 
                              onClick={() => handleToggleItem(cat.id, item.id)}
                              className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${item.isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}
                            >
                              {item.isChecked && <Check className="w-3.5 h-3.5" />}
                            </button>
                            <span className={`text-xs font-semibold ${item.isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            )}
          </div>
        </div>
        </TabDashboardLayout>
      </div>
    </div>
  );
}
