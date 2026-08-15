import { useAuthStore } from '../../store/useAuthStore';
import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Sparkles,
  Calendar,
  ClipboardList,
  Compass,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  Check,
  Trash2,
  Edit3,
  X,
  ChevronRight,
  Share2,
  QrCode,
  Clock,
  Tag,
  Search,
  Plane,
  Train,
  Hotel,
  Ticket,
  FileText,
  CheckCircle2,
  Info,
  CalendarDays,
  ListFilter,
  ShieldCheck,
  Wallet,
  TrendingDown
} from "lucide-react";

import { DashboardView } from '../views/DashboardView';



import { TopBar, useScrolled, LogoName } from "./SharedUI";
import { TripGroup, TripPlan, PackingItem, Poll, Member } from "../../types";
import { SmartPackingAlert } from "../SmartPackingAlert";
import { TripAwardsBanner } from "../TripAwardsBanner";
import { PollsCard } from "../PollsCard";
import { FlightTrackerWidget } from "../FlightTrackerWidget";
import { TransitSchedules } from "../TransitSchedules";
import { WeatherWidget } from "../WeatherWidget";
import { QuirkyLanguageSelector } from "../QuirkyLanguageSelector";
import { WikipediaSnippet } from "../WikipediaSnippet";
import { UpiQrModal } from "../UpiQrModal";
import { useTripContext } from "../../context/TripContext";
import { useLanguage } from "../../context/LanguageContext";

interface PlanningScreenProps {
  onLogout: () => void;
  onOpenCreateTrip?: () => void;
  onOpenPlanner?: () => void;
  onSOS?: () => void;
  setActive?: (tab: string, subCategory?: string) => void;
  trip?: TripGroup;
}

const DEFAULT_TRIP: TripGroup = {
  id: "no-active-trip",
  name: "My Trip Plan",
  destination: "Destination",
  source: "",
  startDate: new Date().toISOString().substring(0, 10),
  endDate: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10),
  totalBudget: 0,
  calculationMode: "admin_pooled",
  adminId: "",
  status: "ACTIVE",
  members: [],
  deposits: [],
  expenses: [],
  itinerary: [],
  polls: []
};

const INITIAL_PACKING_ITEMS: PackingItem[] = [
  { id: "pk1", name: "ID Card / Aadhaar", isChecked: true, category: "Documents", essential: true },
  { id: "pk2", name: "Train / Flight Tickets", isChecked: true, category: "Documents", essential: true },
  { id: "pk3", name: "Traditional Outfit for Temple Darshan", isChecked: false, category: "Clothes", essential: true },
  { id: "pk4", name: "Comfortable Walking Shoes", isChecked: true, category: "Clothes" },
  { id: "pk5", name: "Mobile Charger & Powerbank", isChecked: false, category: "Electronics", essential: true },
  { id: "pk6", name: "Sunscreen & Sunglasses", isChecked: false, category: "Toiletries" },
  { id: "pk7", name: "Personal Medicines & First Aid", isChecked: true, category: "Medicine", essential: true },
  { id: "pk8", name: "Cash / UPI Scanner", isChecked: true, category: "Essentials", essential: true }
];

import { TripMap } from '../map/TripMap';
export function PlanningScreen({
  onLogout,
  onOpenCreateTrip,
  onOpenPlanner,
  onSOS,
  setActive,
  trip: initialTrip
}: PlanningScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(scrollRef);
  const { activeTrip, updateActiveTrip } = useTripContext();
  const { lang, t } = useLanguage();
  const themeColor = '#6366f1';

  const currentUser = useAuthStore(state => state.currentUser);

  const currentTrip = initialTrip || activeTrip;
  const setCurrentTrip = (updated: TripGroup | ((prev: TripGroup) => TripGroup)) => {
    if (typeof updated === 'function') {
      const next = updated(currentTrip);
      updateActiveTrip(next);
    } else {
      updateActiveTrip(updated);
    }
  };

  // Sub-tabs: 'schedule', 'prep', 'fun', 'tracking', 'friends'
  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'prep' | 'fun' | 'tracking' | 'friends'>('schedule');

  // Schedule View Mode: 'list' | 'calendar'
  const [scheduleViewMode, setScheduleViewMode] = useState<'list' | 'calendar'>('list');

  // Modals & Controls State
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [selectedUpiMember, setSelectedUpiMember] = useState<Member | null>(null);

  // New Plan Form State
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [newPlanType, setNewPlanType] = useState<'ticket' | 'hotel' | 'activity' | 'note'>('activity');
  const [newPlanDate, setNewPlanDate] = useState("2026-08-21T10:00");
  const [newPlanDetail, setNewPlanDetail] = useState("");
  const [newPlanCost, setNewPlanCost] = useState("");
  const [newPlanLocation, setNewPlanLocation] = useState("");

  // Packing List State
  const packingItems = currentTrip.packingList?.length ? currentTrip.packingList : INITIAL_PACKING_ITEMS;
  const [newPackingName, setNewPackingName] = useState("");
  const [newPackingCategory, setNewPackingCategory] = useState("Essentials");

  // Add Plan Handler
  const handleAddPlan = () => {
    if (!newPlanTitle.trim()) return;
    const newPlan: TripPlan = {
      id: `plan-${Date.now()}`,
      type: newPlanType,
      title: newPlanTitle.trim(),
      detail: newPlanDetail.trim(),
      datetime: newPlanDate ? new Date(newPlanDate).toISOString() : new Date().toISOString(),
      cost: newPlanCost ? parseFloat(newPlanCost) : undefined,
      exactLocation: newPlanLocation.trim() || undefined
    };

    setCurrentTrip(prev => ({
      ...prev,
      itinerary: [...(prev.itinerary || []), newPlan]
    }));

    setNewPlanTitle("");
    setNewPlanDetail("");
    setNewPlanCost("");
    setNewPlanLocation("");
    setShowAddPlanModal(false);
  };

  // Delete Plan Handler
  const handleDeletePlan = (planId: string) => {
    setCurrentTrip(prev => ({
      ...prev,
      itinerary: (prev.itinerary || []).filter(p => p.id !== planId)
    }));
  };

  // Toggle Packing Checkbox
  const togglePackingItem = (id: string) => {
    setCurrentTrip(prev => {
      const currentList = prev.packingList?.length ? prev.packingList : INITIAL_PACKING_ITEMS;
      return {
        ...prev,
        packingList: currentList.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item)
      };
    });
  };

  // Add Packing Item
  const handleAddPackingItem = () => {
    if (!newPackingName.trim()) return;
    const newItem: PackingItem = {
      id: `pk-${Date.now()}`,
      name: newPackingName.trim(),
      isChecked: false,
      category: newPackingCategory
    };
    setCurrentTrip(prev => {
      const currentList = prev.packingList?.length ? prev.packingList : INITIAL_PACKING_ITEMS;
      return {
        ...prev,
        packingList: [...currentList, newItem]
      };
    });
    setNewPackingName("");
  };

  // Poll Handlers
  const handleVotePoll = (pollId: string, optionId: string) => {
    const userId = currentUser?.id || "";
    setCurrentTrip(prev => ({
      ...prev,
      polls: (prev.polls || []).map(poll => {
        if (poll.id !== pollId) return poll;
        return {
          ...poll,
          options: poll.options.map(opt => {
            const hasVoted = opt.votes.includes(userId);
            let updatedVotes = opt.votes;
            if (opt.id === optionId) {
              updatedVotes = hasVoted ? opt.votes.filter(u => u !== userId) : [...opt.votes, userId];
            } else {
              updatedVotes = opt.votes.filter(u => u !== userId);
            }
            return { ...opt, votes: updatedVotes };
          })
        };
      })
    }));
  };

  const handleCreatePoll = (question: string, options: string[]) => {
    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      question,
      options: options.map((opt, i) => ({ id: `opt-${i}`, text: opt, votes: [] })),
      createdBy: currentUser?.id || "",
      createdAt: new Date().toISOString(),
      isOpen: true
    };
    setCurrentTrip(prev => ({
      ...prev,
      polls: [...(prev.polls || []), newPoll]
    }));
  };

  const handleClosePoll = (pollId: string) => {
    setCurrentTrip(prev => ({
      ...prev,
      polls: (prev.polls || []).map(p => p.id === pollId ? { ...p, isOpen: false } : p)
    }));
  };

  // Packing Statistics
  
  const showToast = (message: string) => alert(message);

  const packedCount = packingItems.filter(i => i.isChecked).length;
  const totalPacking = packingItems.length;
  const packingPct = totalPacking > 0 ? Math.round((packedCount / totalPacking) * 100) : 0;

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50 min-h-screen">
      <TopBar 
        sub="Smart Itinerary & Planning"
        title={<LogoName />} 
        scrolled={scrolled} 
        onLogout={onLogout} 
        onSOS={onSOS || (() => alert("SOS Alert Triggered!"))} 
        onOpenSettings={setActive ? () => setActive('settings') : undefined}
      />

      <div className="px-4 sm:px-5 mt-2 space-y-4 max-w-4xl mx-auto">

        
        
        {/* MERGED HUB DASHBOARD */}
        <div className="mb-6 -mx-4 sm:mx-0">
          
            <DashboardView
              trip={currentTrip}
              lang="en"
              userId={currentUser?.id || ""}
              t={t}
              currencySymbol="₹"
              poolBalance={0}
              onNavigate={(tab) => { if (setActive) setActive(tab); }}
              onVote={(pollId, optionId) => {}}
              onCreatePoll={() => {}}
              onClosePoll={() => {}}
              onSOS={() => { if (onSOS) onSOS(); }}
              onAddPlaylistItem={() => {}}
              onRemovePlaylistItem={() => {}}
              onAddGalleryItem={() => {}}
              onUpdateTrip={(updated) => setCurrentTrip(updated)}
              onShowToast={(m) => showToast(m)}
              onAddDeposit={() => { if (setActive) setActive("expenses"); }}
            />
            
          
        </div>

        
        
        {/* Budget Grid & AI Manager */}
        <div className="px-5 pt-4 pb-2 space-y-4">
          
          {/* Budget Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Budget */}
            <div className="bg-sky-50/60 p-4 rounded-3xl border border-sky-100 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-sky-600 mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">TOTAL BUDGET</span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                ₹{currentTrip.totalBudget || 0}
              </div>
              <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mt-3">
                TRIP BUDGET
              </div>
            </div>
            {/* Total Expense */}
            <div className="bg-rose-50/60 p-4 rounded-3xl border border-rose-100 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-rose-600 mb-3">
                <TrendingDown className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">TOTAL EXPENSE</span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                ₹{(currentTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0)}
              </div>
              <div className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-3">
                SPENT SO FAR
              </div>
            </div>
            {/* Total Balance */}
            <div className="bg-emerald-50/60 p-4 rounded-3xl border border-emerald-100 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-3">
                <Wallet className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">TOTAL BALANCE</span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                ₹{(currentTrip.totalBudget || 0) - (currentTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0)}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-3">
                AVAILABLE BALANCE
              </div>
            </div>
            {/* Expense Ratio */}
            <div className="bg-purple-50/60 p-4 rounded-3xl border border-purple-100 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-2 w-full text-left">EXPENSE RATIO</span>
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-purple-100" />
                  <circle cx="32" cy="32" r="28" stroke="#a855f7" strokeWidth="5" fill="transparent" strokeDasharray="175.9" strokeDashoffset={175.9 - (Math.min(((currentTrip.totalBudget ? (currentTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0) / currentTrip.totalBudget : 0) * 100), 100) / 100) * 175.9} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-slate-800">{Math.round(currentTrip.totalBudget ? ((currentTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0) / currentTrip.totalBudget) * 100 : 0)}%</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">USED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Spending Status Pill */}
          <div className={`py-2.5 rounded-2xl border flex items-center justify-center font-black text-xs tracking-widest uppercase ${(currentTrip.totalBudget ? ((currentTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0) / currentTrip.totalBudget) * 100 : 0) <= 85 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            SPENDING IS {(currentTrip.totalBudget ? ((currentTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0) / currentTrip.totalBudget) * 100 : 0) <= 85 ? 'SAFE' : 'OVER BUDGET'}.
          </div>

          {/* AI TRIP MANAGER HEADER */}
          <div className="flex items-center justify-between pt-2">
            <h3 className="font-black text-slate-800 tracking-widest uppercase text-sm">AITRIPMANAGER</h3>
            <button onClick={onOpenPlanner} className="px-3 py-1.5 bg-rose-400 hover:bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider transition-all">
              <Sparkles className="w-3 h-3" /> Chat with Manager
            </button>
          </div>

          {/* AI Manager Card */}
          <div className="bg-gradient-to-r from-rose-100/50 to-orange-100/50 p-4 rounded-3xl border border-rose-200/50 flex items-center justify-between cursor-pointer" onClick={onOpenPlanner}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-2xl shadow-lg">🎩</div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Daily Morning Briefing & Manager</h4>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </div>
{/* Planner Category Sub-Nav Pill Bar (Matching old screenshot, redesigned) */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeSubTab === 'schedule' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule</span>
          </button>

          <button
            onClick={() => setActiveSubTab('prep')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeSubTab === 'prep' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Prep</span>
          </button>

          

          

          <button
            onClick={() => setActiveSubTab('friends')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeSubTab === 'friends' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Find Friends</span>
          </button>
        </div>

        {/* Trip Status Notice Card */}
        {currentTrip.status === 'COMPLETED' ? (
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-amber-800 text-xs font-bold flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-600" />
            <span>This trip is completed. Smart features are operating in read-only archive mode.</span>
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Active Trip Planning Mode • All AI assistance & live features ready</span>
          </div>
        )}

        {/* TAB 1: SCHEDULE */}
        {activeSubTab === 'schedule' && (
          <div className="space-y-4">
            
            {/* View Mode Switcher Pill Bar (Smart List View vs Calendar View) */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1">
              <button
                onClick={() => setScheduleViewMode('list')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  scheduleViewMode === 'list' 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ListFilter className="w-4 h-4" />
                <span>Smart List View</span>
              </button>

              <button
                onClick={() => setScheduleViewMode('calendar')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  scheduleViewMode === 'calendar' 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Calendar View</span>
              </button>
            </div>

            {/* Smart List View Content */}
            {scheduleViewMode === 'list' && (
              <div className="space-y-3">
                {(!currentTrip.itinerary || currentTrip.itinerary.length === 0) ? (
                  /* Empty State Matching User's Screenshot */
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Compass className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-800">No plans yet</h3>
                      <p className="text-xs text-slate-500 font-medium">No plans set yet.</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setShowAddPlanModal(true)}
                        className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>ADD PLAN / BOOKING</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Scheduled Plans List */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                        {currentTrip.itinerary.length} Planned Activities
                      </span>
                      <button
                        onClick={() => setShowAddPlanModal(true)}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add Plan</span>
                      </button>
                    </div>

                    {currentTrip.itinerary.map((plan, idx) => (
                      <div 
                        key={plan.id || idx} 
                        className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start justify-between gap-3 hover:border-indigo-200 transition-all"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold ${
                            plan.type === 'ticket' ? 'bg-amber-500' :
                            plan.type === 'hotel' ? 'bg-sky-500' :
                            plan.type === 'activity' ? 'bg-emerald-500' : 'bg-purple-500'
                          }`}>
                            {plan.type === 'ticket' && <Ticket className="w-5 h-5" />}
                            {plan.type === 'hotel' && <Hotel className="w-5 h-5" />}
                            {plan.type === 'activity' && <Compass className="w-5 h-5" />}
                            {plan.type === 'note' && <FileText className="w-5 h-5" />}
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm truncate">{plan.title}</h4>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {plan.type}
                              </span>
                            </div>

                            {plan.detail && (
                              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{plan.detail}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500 pt-1">
                              {plan.datetime && (
                                <span className="flex items-center gap-1 text-indigo-600">
                                  <Clock className="w-3 h-3" />
                                  {new Date(plan.datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                              {plan.exactLocation && (
                                <span className="flex items-center gap-1 text-slate-600">
                                  <MapPin className="w-3 h-3" />
                                  {plan.exactLocation}
                                </span>
                              )}
                              {plan.cost && (
                                <span className="flex items-center gap-0.5 text-emerald-600 font-mono font-extrabold">
                                  ₹{plan.cost}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Calendar View Content */}
            {scheduleViewMode === 'calendar' && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    Calendar Timeline Schedule
                  </h3>
                  <button
                    onClick={() => setShowAddPlanModal(true)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Plan</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {["2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"].map((dateStr, dayIdx) => {
                    const dayPlans = (currentTrip.itinerary || []).filter(p => 
                      p.datetime && new Date(p.datetime).toISOString().startsWith(dateStr)
                    );

                    return (
                      <div key={dateStr} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                            Day {dayIdx + 1} • {new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {dayPlans.length} Activities
                          </span>
                        </div>

                        {dayPlans.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-1 pl-1">No plans scheduled for this day.</p>
                        ) : (
                          <div className="space-y-1.5 pt-1">
                            {dayPlans.map((p, i) => (
                              <div key={p.id || i} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 truncate">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                  <span className="font-bold text-slate-800 truncate">{p.title}</span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                                  {new Date(p.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PREP */}
        {activeSubTab === 'prep' && (
          <div className="space-y-4">
            
            {/* Smart Weather-aware Packing Alert */}
            <SmartPackingAlert 
              destinationCity={currentTrip.destination || "Ujjain"} 
              temp={28} 
              isRaining={false} 
            />

            {/* Packing List Header & Progress Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    Pre-Trip Packing List
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {packedCount} of {totalPacking} items packed ({packingPct}%)
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                  {packingPct}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${packingPct}%` }}
                />
              </div>

              {/* Add Custom Packing Item */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={newPackingName}
                  onChange={(e) => setNewPackingName(e.target.value)}
                  placeholder="Add item (e.g. Umbrella, Sunglasses)..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newPackingCategory}
                  onChange={(e) => setNewPackingCategory(e.target.value)}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="Essentials">Essentials</option>
                  <option value="Clothes">Clothes</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Toiletries">Toiletries</option>
                  <option value="Documents">Documents</option>
                  <option value="Medicine">Medicine</option>
                </select>
                <button
                  onClick={handleAddPackingItem}
                  className="px-3.5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-indigo-700 active:scale-95 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Packing List Items Grouped */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              
              {[...packingItems].sort((a, b) => {
                if (a.isChecked !== b.isChecked) return a.isChecked ? 1 : -1;
                if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '');
                return a.name.localeCompare(b.name);
              }).map(item => (

                <div 
                  key={item.id}
                  onClick={() => togglePackingItem(item.id)}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    item.isChecked 
                      ? 'bg-slate-50/80 border-slate-200/80 opacity-70' 
                      : 'bg-white border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                      item.isChecked 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {item.isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className={`text-xs font-bold ${item.isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.name}
                    </span>
                  </div>

                  {item.category && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                      {item.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FUN */}
        {activeSubTab === 'fun' && (
          <div className="space-y-4">
            {/* Trip Badges & Awards */}
            <TripAwardsBanner trip={currentTrip} lang="en" />

            {/* Group Decision Polls */}
            <PollsCard 
              trip={currentTrip} 
              lang="en" 
              userId={currentUser?.id || ""} 
              onVote={handleVotePoll} 
              onCreatePoll={handleCreatePoll} 
              onClosePoll={handleClosePoll} 
            />
          </div>
        )}

        {/* TAB 5: FIND FRIENDS */}
        {activeSubTab === 'friends' && (
          <div className="space-y-4">
            
            {/* Find Friends Live Map */}
            
              <div className="h-[400px] w-full rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                <TripMap 
                  trip={currentTrip} 
                  lang="en" 
                  userId={currentUser?.id} 
                  isSharingLocation={true} 
                  onUpdateTrip={(t) => setCurrentTrip(t)}
                />
              </div>
            

            {/* Invite Friends Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    Group Members & Invites
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Invite travel buddies & split group deposits
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Join ${currentTrip.name}`,
                        text: `Join our group trip to ${currentTrip.destination}!`,
                        url: window.location.href
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Trip link copied to clipboard!");
                    }
                  }}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Share Trip</span>
                </button>
              </div>

              {/* Members List */}
              <div className="space-y-2 pt-2">
                {currentTrip.members?.map(member => (
                  <div key={member.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
                        style={{ backgroundColor: member.color || '#6366f1' }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{member.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 font-mono">{member.upiId || 'No UPI added'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedUpiMember(member)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                      <span>UPI QR</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            

                      </div>
        )}

      </div>

      {/* Add Plan / Booking Modal */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Add Plan / Booking</h3>
              <button 
                onClick={() => setShowAddPlanModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Plan Title *
                </label>
                <input
                  type="text"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  placeholder="e.g. Flight to Indore, Hotel Check-in, Temple Darshan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={newPlanType}
                    onChange={(e: any) => setNewPlanType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="activity">🎯 Activity</option>
                    <option value="ticket">🎫 Ticket / Transport</option>
                    <option value="hotel">🏨 Hotel / Stay</option>
                    <option value="note">📝 Note</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Est. Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={newPlanCost}
                    onChange={(e) => setNewPlanCost(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newPlanDate}
                  onChange={(e) => setNewPlanDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Location / Address
                </label>
                <input
                  type="text"
                  value={newPlanLocation}
                  onChange={(e) => setNewPlanLocation(e.target.value)}
                  placeholder="e.g. Mahakaleshwar Temple Marg"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Details / Notes
                </label>
                <textarea
                  value={newPlanDetail}
                  onChange={(e) => setNewPlanDetail(e.target.value)}
                  placeholder="e.g. Carry ID proof, reporting time 3:30 AM..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddPlanModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPlan}
                className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
              >
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Modal */}
      {selectedUpiMember && (
        <UpiQrModal
          member={selectedUpiMember}
          currencySymbol="₹"
          lang="en"
          t={(k) => k}
          onClose={() => setSelectedUpiMember(null)}
        />
      )}
    </div>
  );
}
