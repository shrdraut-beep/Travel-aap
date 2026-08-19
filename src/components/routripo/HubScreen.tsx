import React, { useRef, useState } from "react";
import { Package, Plus, Sparkles, Plane, Hotel, Train, Bus, Car, Search, Share2, Edit3, Trash, Compass, CheckCircle2, X, Calendar, MapPin, Tag, LayoutDashboard, Layers, Users, DollarSign } from "lucide-react";
import { TopBar, SectionTitle, useScrolled, Card, Stagger, CountUp, LogoName } from "./SharedUI";
import { MusicPlayerProvider } from "../MusicPlayerContext";
import { DashboardView } from "../views/DashboardView";
import { translations } from "../../translations";
import { TripGroup, Poll } from "../../types";
import { useTripContext } from "../../context/TripContext";
import { useAuthStore } from "../../store/useAuthStore";
import { useOfferStore } from "../../store/useOfferStore";

interface HubScreenProps {
  setActive: (tab: string, subTab?: string) => void;
  onLogout: () => void;
  onOpenCreateTrip?: () => void;
  onOpenPlanner?: () => void;
  onSOS?: () => void;
}

const PAST_AND_ACTIVE_TRIPS: any[] = [];

export function HubScreen({ setActive, onLogout, onOpenCreateTrip, onOpenPlanner, onSOS }: HubScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(scrollRef);
  const { activeTrip, updateActiveTrip, selectTripById, trips } = useTripContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showReadyTripsModal, setShowReadyTripsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ msg: string; type: "success" | "alert" } | null>(null);

  const offers = useOfferStore(state => state.offers);
  const activeOffers = offers.filter(o => o.isActive);

  const t = (key: string) => {
    return translations["en"]?.[key] || key;
  };

  const showToast = (message: string, type: "success" | "alert" = "success") => {
    setToastMessage({ msg: message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentUser = useAuthStore(state => state.currentUser);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-28 bg-slate-50 relative">
      <TopBar 
        sub={currentUser?.name ? `Namaste, ${currentUser.name} 👋` : "Namaste, Traveler 👋"} 
        title={<LogoName />} 
        scrolled={scrolled} 
        onLogout={onLogout} 
        onSOS={onSOS || (() => alert("SOS Triggered!"))} 
        onOpenSettings={() => setActive('settings')}
      />
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border ${
          toastMessage.type === "success" ? "bg-emerald-600 text-white border-emerald-400" : "bg-rose-600 text-white border-rose-400"
        }`}>
          <span>{toastMessage.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Dynamic Swipeable Image Banner Carousel for Major Promotions */}
      <div className="px-2 mt-2">
              </div>



      {/* ================= FULL ACTIVE TRIP DASHBOARD VIEW ================= */}
      <div className="mt-4">
        <MusicPlayerProvider>
          <DashboardView
            trip={activeTrip}
            lang="en"
            userId={currentUser?.id || ""}
            t={t}
            currencySymbol="₹"
            poolBalance={15000}
            onNavigate={(tab) => setActive(tab)}
            onVote={(pollId, optionId) => {
              showToast("Vote recorded!");
            }}
            onCreatePoll={(question, options) => {
              showToast("New poll created!");
            }}
            onClosePoll={(pollId) => {
              showToast("Poll closed!");
            }}
            onSOS={(lat, lng) => {
              if (onSOS) onSOS();
              else alert("SOS Triggered!");
            }}
            onAddPlaylistItem={(title, url, artist, thumbnailUrl) => {
              const newPlay = [...(activeTrip.playlist || []), { id: Math.random().toString(), title, url, artist, addedBy: "You" }];
              updateActiveTrip({ ...activeTrip, playlist: newPlay });
              showToast("Song added to playlist!");
            }}
            onRemovePlaylistItem={(id) => {
              const newPlay = (activeTrip.playlist || []).filter(p => p.id !== id);
              updateActiveTrip({ ...activeTrip, playlist: newPlay });
              showToast("Song removed!");
            }}
            onAddGalleryItem={(img) => {
              showToast("Photo added to memory album!");
            }}
            onUpdateTrip={(updated) => {
              updateActiveTrip(updated);
            }}
            onShowToast={(m, type) => showToast(m, type)}
            onAddDeposit={() => {
              setActive("expenses");
            }}
          />
        </MusicPlayerProvider>
      </div>

      {/* Offers For You & Flagship Hotel Stores */}
      <div className="px-2 border-t border-slate-200 pt-4 bg-slate-50">
      </div>

      {/* Ready Trips Modal */}
      {showReadyTripsModal && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-slate-900 text-base">Ready & Past Itineraries</h3>
              </div>
              <button onClick={() => setShowReadyTripsModal(false)} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">Pre-designed ready trips with pre-calculated budgets & itineraries:</p>

            <div className="space-y-3">
              {trips.map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-900 text-xs">{t.name}</h5>
                    <p className="text-[10px] text-slate-500">{t.startDate} – {t.endDate} • {t.destination}</p>
                  </div>
                  <button
                    onClick={() => {
                      selectTripById(t.id);
                      setShowReadyTripsModal(false);
                    }}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Floating Action Button for New Trip */}
      <button 
        onClick={() => {
          if (onOpenCreateTrip) onOpenCreateTrip();
        }}
        className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex flex-col items-center justify-center text-white shadow-lg shadow-rose-500/30 z-[90] active:scale-95 transition-transform border border-rose-400"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>
    </div>
  );
}
