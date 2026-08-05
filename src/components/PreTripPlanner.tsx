import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, MapPin, Compass, RefreshCw, CheckCircle2, ArrowRight, Crown } from 'lucide-react';
import { TripGroup } from '../types';

interface PreTripPlannerProps {
  trip: TripGroup;
  lang: string;
  onGenerateAI?: (type: 'pre' | 'post') => void;
  onOpenMaharajaPlanner?: () => void;
  isAIGenerating?: boolean;
  onNavigate?: (tab: string) => void;
  themeColor?: string;
  isTripCompleted?: boolean;
}

export const PreTripPlanner: React.FC<PreTripPlannerProps> = ({
  trip,
  lang,
  onGenerateAI,
  onOpenMaharajaPlanner,
  isAIGenerating = false,
  onNavigate,
  themeColor = '#6366f1',
  isTripCompleted = false,
}) => {
  const isMr = lang === 'mr';
  const itinerary = trip.itinerary || [];
  const planCount = itinerary.length;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[32px] p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden border border-indigo-500/20 my-4">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      
      <div className="relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 backdrop-blur-md flex items-center justify-center text-indigo-400 border border-indigo-400/30 shrink-0">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 block">
                {isMr ? 'मास्टर प्रवास आराखडा' : 'Master Trip Itinerary'}
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                {isMr ? 'सहल पूर्व एआय प्लॅनर' : 'Pre-Trip AI Planner'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenMaharajaPlanner && (
              <button
                type="button"
                onClick={onOpenMaharajaPlanner}
                className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-purple-600 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:from-amber-400 hover:to-purple-500 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-amber-300/40"
              >
                <Crown className="w-4 h-4 text-slate-950" />
                <span className="text-white">{isMr ? 'महाराजा ट्रिप प्लॅनर 👑' : 'Maharaja Planner 👑'}</span>
              </button>
            )}

            {!isTripCompleted && onGenerateAI && (
              <button
                type="button"
                onClick={() => onGenerateAI('pre')}
                disabled={isAIGenerating}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:from-indigo-400 hover:to-purple-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0 border border-indigo-400/30"
              >
                {isAIGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isMr ? 'तयार होत आहे...' : 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isMr ? 'एआय आराखडा' : 'AI Plan'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-indigo-300 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider">{isMr ? 'कालावधी' : 'Duration'}</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white truncate">
              {trip.startDate && trip.endDate
                ? `${Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)))} Days`
                : (isMr ? 'नियोजित' : 'Scheduled')}
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-emerald-300 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider">{isMr ? 'टप्पे' : 'Stopovers'}</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white">
              {planCount} {isMr ? 'ठिकाणे' : 'Plans'}
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-amber-300 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider">{isMr ? 'गंतव्य' : 'Destination'}</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white truncate">
              {trip.name}
            </p>
          </div>
        </div>

        {/* Itinerary Preview or CTA */}
        {planCount > 0 ? (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
              {isMr ? 'मुख्य आकर्षणे व वेळापत्रक:' : 'Master Schedule Highlights:'}
            </p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-none pr-1 flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
              {itinerary.slice(0, 4).map((plan, idx) => (
                <div key={plan.id || idx} className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/30 text-indigo-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-white font-bold truncate">{plan.title}</span>
                  </div>
                  <span className="text-[10px] text-indigo-200 shrink-0 font-mono">
                    {new Date(plan.datetime).toLocaleDateString(isMr ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-300 italic pt-1">
            {isMr
              ? 'अद्याप मास्टर प्लॅन जोडलेला नाही. एआय बटणावर टॅप करा आणि थेट स्मार्ट मार्गदर्शन मिळवा!'
              : 'No master plan items created yet. Tap the AI button above to auto-generate!'}
          </p>
        )}

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('planner')}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/15 cursor-pointer mt-2"
          >
            <span>{isMr ? 'संपूर्ण वेळापत्रक आणि कॅलेंडर पहा' : 'View Full Schedule & Timeline'}</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        )}
      </div>
    </div>
  );
};
