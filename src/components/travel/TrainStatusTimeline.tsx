import React from 'react';
import { motion } from 'motion/react';
import { Clock, Navigation, MapPin, CheckCircle2, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';

export interface ScheduleStop {
  code: string;
  name: string;
  schArr: string;
  schDep: string;
  platform: string;
  distance: string;
  status: 'Departed' | 'Current Station' | 'Upcoming' | string;
  day?: string;
  calcArrDateISO?: string;
  calcDepDateISO?: string;
}

export interface TrainStatusTimelineProps {
  schedule: ScheduleStop[];
  currentStationName?: string;
  nextStationName?: string;
  delayMins?: number;
  speed?: string;
  lastUpdated?: string;
  lang?: string;
}

export const TrainStatusTimeline: React.FC<TrainStatusTimelineProps> = ({
  schedule,
  currentStationName,
  nextStationName,
  delayMins = 0,
  speed = '85 km/h',
  lastUpdated = 'Live Clock',
  lang = 'en',
}) => {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500 font-bold text-sm">
        No schedule stations available for timeline tracking.
      </div>
    );
  }

  // Find index of current station or last departed station
  const currentIdx = schedule.findIndex((s) => s.status === 'Current Station');
  const lastDepartedIdx = schedule.map((s) => s.status).lastIndexOf('Departed');

  // Active Index where engine is physically positioned
  let activeIndex = currentIdx;
  if (activeIndex === -1) {
    if (lastDepartedIdx !== -1) {
      activeIndex = lastDepartedIdx; // Engine just left or is en route from this station
    } else {
      activeIndex = 0; // Train has not departed yet (Origin)
    }
  }

  const isNotStarted = schedule.every((s) => s.status === 'Upcoming');
  const isTerminated = schedule.every((s) => s.status === 'Departed');

  const activeStop = schedule[activeIndex] || schedule[0];
  const nextStop = schedule[Math.min(schedule.length - 1, activeIndex + 1)];

  return (
    <div className="space-y-6">
      {/* HEADER OVERVIEW CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Background Railway Glow */}
        <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Navigation className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  {lang === 'mr' ? 'लाईव्ह स्थिती' : 'Live Motion Tracker'}
                </span>
                <h4 className="font-black text-white text-base">
                  {isNotStarted
                    ? (lang === 'mr' ? 'प्रवास सुरू झाला नाही' : 'Train Has Not Started Yet')
                    : isTerminated
                    ? (lang === 'mr' ? 'प्रवास पूर्ण झाला' : 'Journey Completed')
                    : currentIdx !== -1
                    ? `${lang === 'mr' ? 'स्थानकावर थांबली:' : 'Halted at'} ${activeStop.name}`
                    : `${lang === 'mr' ? 'मार्गावर:' : 'En Route:'} ${activeStop.name} ➔ ${nextStop.name}`}
                </h4>
              </div>
            </div>

            {/* Delay or On-Time Badge */}
            <div className="shrink-0">
              {delayMins > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>+{delayMins}m Late</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>On Time</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">{lang === 'mr' ? 'स्पीड' : 'Train Speed'}</span>
              <span className="font-black text-amber-400 text-sm mt-0.5 block">{speed}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">{lang === 'mr' ? 'पुढील स्थानक' : 'Next Station'}</span>
              <span className="font-black text-white text-sm mt-0.5 block truncate">{nextStop.name}</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">{lang === 'mr' ? 'शेवटचे अद्यतन' : 'Last Updated'}</span>
              <span className="font-black text-emerald-400 text-sm mt-0.5 block truncate">{lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ANIMATED VERTICAL TRAIN TRACK TIMELINE */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
          <h5 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="text-lg">🛤️</span>
            <span>{lang === 'mr' ? 'थेट रेल्वे मार्ग ट्रॅकिंग' : 'Live Station Route & Track Status'}</span>
          </h5>
          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {schedule.length} Stations
          </span>
        </div>

        {/* TIMELINE TRACK WRAPPER */}
        <div className="relative pl-12 pr-2 py-4">
          {/* TRACK BACKGROUND LINES */}
          <div className="absolute left-[26px] top-8 bottom-8 w-[6px] rounded-full overflow-hidden bg-slate-200">
            {/* Active / Completed Track Segment */}
            <motion.div
              className="w-full bg-gradient-to-b from-blue-600 via-indigo-600 to-amber-500 rounded-full"
              initial={{ height: '0%' }}
              animate={{
                height: isTerminated
                  ? '100%'
                  : `${Math.max(4, Math.min(100, ((activeIndex + 0.5) / schedule.length) * 100))}%`,
              }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>

          {/* DOTTED RAILWAY TRACK OVERLAY (Visual Railway Ties Pattern) */}
          <div
            className="absolute left-[28px] top-8 bottom-8 w-[2px] pointer-events-none opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
              backgroundSize: '100% 8px',
            }}
          />

          {/* STATIONS LIST */}
          <div className="space-y-8">
            {schedule.map((stop, index) => {
              const isCurrent = stop.status === 'Current Station';
              const isDeparted = stop.status === 'Departed';
              const isUpcoming = stop.status === 'Upcoming';
              const isActiveEngineNode = index === activeIndex && !isNotStarted && !isTerminated;

              return (
                <div key={`${stop.code}-${index}`} className="relative group">
                  {/* STATION NODE BADGE & LOCOMOTIVE ENGINE */}
                  <div className="absolute -left-[38px] top-0.5 z-20 flex items-center justify-center">
                    {/* Active Locomotive Engine Icon at active station index */}
                    {isActiveEngineNode ? (
                      <motion.div
                        className="relative"
                        initial={{ scale: 0.6, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      >
                        {/* Live Pulsing Aura */}
                        <div className="absolute -inset-2 bg-amber-500/30 rounded-full blur-md animate-ping" />
                        <div className="absolute -inset-1.5 bg-amber-500/40 rounded-full animate-pulse" />

                        {/* Indian Railway Locomotive Engine Badge */}
                        <div className="relative w-9 h-9 bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white text-lg">
                          <span className="leading-none drop-shadow">🚂</span>
                        </div>
                      </motion.div>
                    ) : isDeparted ? (
                      /* Departed Station Check Dot */
                      <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow flex items-center justify-center text-white">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      /* Upcoming Station Dot */
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-300 shadow-sm flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* STATION CONTENT CARD */}
                  <div
                    className={`p-3.5 rounded-2xl transition-all border ${
                      isCurrent
                        ? 'bg-amber-50/90 border-amber-300 shadow-md ring-1 ring-amber-400/50'
                        : isDeparted
                        ? 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                        : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        {/* Station Name & Code */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h6 className="font-black text-slate-900 text-sm">{stop.name}</h6>
                          <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {stop.code}
                          </span>

                          {/* Day Pill */}
                          {stop.day && (
                            <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                              Day {stop.day}
                            </span>
                          )}

                          {/* Platform Pill */}
                          <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300/80">
                            PF #{stop.platform || '1'}
                          </span>
                        </div>

                        {/* Timings Details */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-600">
                          <span>
                            Arr: <strong className="text-slate-900 font-extrabold">{stop.schArr}</strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>
                            Dep: <strong className="text-slate-900 font-extrabold">{stop.schDep}</strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400 text-[11px] font-bold">{stop.distance}</span>
                        </div>
                      </div>

                      {/* Station Status Badge */}
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-xs ${
                            isCurrent
                              ? 'bg-amber-500 text-white shadow-amber-500/20 animate-pulse'
                              : isDeparted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {stop.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* NEXT STATION ETA TAG BETWEEN CURRENT AND NEXT STOP */}
                  {isActiveEngineNode && index < schedule.length - 1 && (
                    <motion.div
                      className="my-3 ml-2 p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-md flex items-center justify-between text-xs font-black gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base animate-bounce">⏱️</span>
                        <span>
                          {lang === 'mr' ? 'पुढील स्थानक गाठत आहे:' : 'Next Stop:'}{' '}
                          <span className="underline decoration-white/60 font-black">{nextStop.name}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider">
                        <span>Speed: {speed}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
