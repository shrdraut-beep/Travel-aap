import React from 'react';
import { ArrowRight, Plane, Compass as Sparkles, ShieldCheck } from 'lucide-react';

export interface FlightResultsLoaderProps {
  originCode?: string;
  destCode?: string;
  departDate?: string;
  passengers?: number;
  cabinClass?: string;
}

export const FlightResultsLoader: React.FC<FlightResultsLoaderProps> = ({
  originCode = 'BOM',
  destCode = 'DEL',
  departDate,
  passengers = 1,
  cabinClass = 'Economy',
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 font-[Inter]">
      {/* Top Header: Enterprise Searching Status */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping mr-1.5" />
                Live Search
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Searching best flights...
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span className="text-slate-900">{originCode.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-900">{destCode.toUpperCase()}</span>
              {departDate && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-medium text-slate-500">{departDate}</span>
                </>
              )}
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-500">
                {passengers} Traveler{passengers > 1 ? 's' : ''} ({cabinClass})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Scanning 500+ airlines & GDS aggregators</span>
          </div>
        </div>

        {/* Shimmer Linear Progress */}
        <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden relative">
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 h-full rounded-full w-1/3 animate-[shimmer_1.6s_infinite_linear] [background-size:200%_100%]" />
        </div>
      </div>

      {/* Filter Tabs Skeleton (Cheapest, Fastest, Best) */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'CHEAPEST', sub: 'Calculating best fare...' },
          { label: 'FASTEST', sub: 'Finding shortest route...' },
          { label: 'BEST VALUE', sub: 'Comparing overall rating...' }
        ].map((tab, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm animate-pulse flex flex-col justify-between h-16"
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-400 tracking-wide">{tab.label}</span>
              <div className="w-12 h-3.5 bg-slate-200 rounded" />
            </div>
            <div className="w-24 h-2.5 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* 4 Dummy Flight Cards (Exact OTA layout matching Skyscanner / MakeMyTrip / Expedia) */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm animate-pulse flex flex-col md:flex-row gap-6 items-center transition-all"
          >
            {/* Flight Segments & Timing */}
            <div className="flex-1 w-full space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                
                {/* Airline Logo Shimmer Circle & Carrier Name */}
                <div className="flex items-center gap-3 w-full sm:w-36 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-20 bg-slate-200 rounded" />
                    <div className="h-2.5 w-12 bg-slate-100 rounded" />
                  </div>
                </div>

                {/* Departure - Duration - Arrival Timings */}
                <div className="flex-1 flex items-center justify-between w-full gap-3 sm:gap-6">
                  
                  {/* Departure Block */}
                  <div className="text-right shrink-0 w-20 sm:w-24 space-y-1">
                    <div className="h-6 w-16 bg-slate-200 rounded ml-auto" />
                    <div className="h-3 w-12 bg-slate-100 rounded ml-auto" />
                  </div>

                  {/* Flight Duration Line */}
                  <div className="flex-1 flex flex-col items-center max-w-xs">
                    <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                    <div className="w-full relative flex items-center justify-center">
                      <div className="h-[2px] bg-slate-200 w-full" />
                      <div className="absolute bg-white px-2 py-0.5 border border-slate-200 rounded-full shadow-2xs">
                        <div className="w-10 h-2 bg-slate-200 rounded-full" />
                      </div>
                    </div>
                    <div className="h-2 w-12 bg-slate-100 rounded mt-2" />
                  </div>

                  {/* Arrival Block */}
                  <div className="text-left shrink-0 w-20 sm:w-24 space-y-1">
                    <div className="h-6 w-16 bg-slate-200 rounded" />
                    <div className="h-3 w-12 bg-slate-100 rounded" />
                  </div>

                </div>
              </div>

              {/* Bottom Card Amenities & Tags */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100/80">
                <div className="h-3 w-28 bg-slate-100 rounded-full" />
                <div className="h-3 w-20 bg-slate-100 rounded-full" />
                <div className="h-3 w-24 bg-slate-100 rounded-full" />
              </div>
            </div>

            {/* Price & Book CTA Column */}
            <div className="w-full md:w-44 flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0 space-y-2">
              <div className="h-2.5 w-16 bg-slate-100 rounded" />
              <div className="h-7 w-28 bg-slate-200 rounded" />
              <div className="h-9 w-full md:w-32 bg-slate-200 rounded-xl mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightResultsLoader;
