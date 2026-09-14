import React from "react";
import { Plus, Briefcase, MapPin, Calendar, Users, ArrowRight , Wallet, HeadphonesIcon} from "lucide-react";
import { useTripContext } from "../../context/TripContext";
import { ListRow, PillButton, SectionHeader } from "./ui";

export const GlobalTripsTab: React.FC<{ onCreateTrip: () => void, onEnterTrip?: () => void, onOpenAiPlanner?: () => void }> = ({ onCreateTrip, onEnterTrip, onOpenAiPlanner }) => {
  const { trips, selectTripById } = useTripContext();

  return (
    <div className="p-2 pb-24 space-y-1.5">
      {/* Quick Tools Section */}
      <div className="pt-2">
        <div className="grid grid-cols-2 gap-3">
          {/* AI Trip Planner Button */}
          <button
            type="button"
            onClick={onOpenAiPlanner || onCreateTrip}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 text-slate-800 font-bold text-[12px] tracking-wide uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img src="/icons/ai_pre_planner.png" alt="AI Pre Planner" className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform" />
            </div>
            <span className="truncate">AI Pre Planner</span>
          </button>

          {/* New Trip Button */}
          <button
            type="button"
            onClick={onCreateTrip}
            className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 text-slate-800 font-bold text-[12px] tracking-wide uppercase active:scale-95 transition-all cursor-pointer group bg-transparent border-none outline-none"
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <img src="/icons/new_trip.png" alt="New Trip" className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform" />
            </div>
            <span className="truncate">New Trip</span>
          </button>
        </div>
      </div>

      {/* Upcoming Trips Section */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between">
          <SectionHeader title="My Upcoming Trips" />
        </div>
        
        <div className="space-y-0.5">
          {trips.length === 0 ? (
            <div className="rounded-[24px] bg-slate-50 p-8 text-center border border-dashed border-slate-200">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                <Briefcase className="h-8 w-8" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-700">No trips planned yet</h3>
              <p className="mt-1 text-[13px] font-medium text-slate-500">
                Create a new trip to start planning with your group!
              </p>
            </div>
          ) : (
            trips.map((trip: any, index: number) => {
              const tripName = trip.title || trip.name || "My Trip";
              const destName = trip.destination || tripName;
              
              // Select a nice scenic photo based on the index to give some variety
              const photos = [
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
                "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
                "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80"
              ];
              const imageUrl = photos[index % photos.length];
              
              const startDate = trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD';
              const endDate = trip.endDate ? new Date(trip.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD';
              
              let duration = trip.duration;
              if (!duration && trip.startDate && trip.endDate) {
                 duration = Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
              }

              const totalSpent = (trip.expenses || []).reduce((sum: number, exp: any) => sum + (Number(exp.amount) || 0), 0);
              const budget = Number(trip.totalBudget) || 0;

              return (
              <div 
                key={trip.id} 
                onClick={() => { selectTripById(trip.id); onEnterTrip?.(); }}
                className="bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 cursor-pointer transition-all active:scale-[0.98] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] block"
              >
                <div className="relative h-40 w-full bg-slate-200">
                   <img src={imageUrl} alt={tripName} className="w-full h-full object-cover" crossOrigin="anonymous" />
                   <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                   
                   <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-slate-700 shadow-sm">
                     <Calendar className="h-3.5 w-3.5 text-[var(--premium-violet)]" />
                     {startDate} - {endDate}
                   </div>
                   <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-slate-700 shadow-sm">
                     <Users className="h-3.5 w-3.5 text-[var(--premium-pink)]" />
                     {trip.members?.length || 1}
                   </div>
                </div>
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[15px] font-black text-slate-900 leading-none line-clamp-1">{tripName}</h3>
                      <div className="mt-0 flex items-center gap-2 text-[12px] font-medium text-slate-500 leading-tight">
                        <span className="flex items-center gap-1 text-[var(--premium-accent)]">
                          <MapPin className="h-4 w-4" />
                          {destName}
                        </span>
                        {duration && (
                          <span className="flex items-center gap-1 text-slate-400">
                            • {duration} Days
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--premium-accent-soft)] flex items-center justify-center text-[var(--premium-accent)] mt-1">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Expense & Budget Quick Glance */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Wallet className="h-3.5 w-3.5 text-pink-600" />
                      <span>
                        {totalSpent > 0 ? `₹${totalSpent.toLocaleString('en-IN')}` : '₹0'} Spent
                      </span>
                      {budget > 0 && (
                        <span className="text-slate-400 font-normal">
                          / ₹{budget.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {(trip.expenses?.length || 0)} recorded
                    </span>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
      </div>
    </div>
  );
};
