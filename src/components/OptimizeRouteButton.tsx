import React, { useState } from 'react';
import { Route, Loader2, CheckCircle2 } from 'lucide-react';
import { fetchOptimizedRoute, geocodePlace, RouteResult } from '../services/api/routing';
import { TripPlan } from '../types';

interface OptimizeRouteButtonProps {
  itinerary: TripPlan[];
  onUpdateItinerary: (newItinerary: TripPlan[]) => void;
  lang: string;
}

export const OptimizeRouteButton: React.FC<OptimizeRouteButtonProps> = ({ itinerary, onUpdateItinerary, lang }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const updatedItinerary = [...itinerary];
      
      // Group by day using date part of datetime
      const daysMap = new Map<string, TripPlan[]>();
      updatedItinerary.forEach(plan => {
        const dateStr = plan.datetime.split('T')[0];
        if (!daysMap.has(dateStr)) daysMap.set(dateStr, []);
        daysMap.get(dateStr)!.push(plan);
      });

      for (const [dateStr, plans] of daysMap.entries()) {
        if (plans.length < 2) continue;

        // Try to geocode all plans for the day
        const geocodedPlans = await Promise.all(
          plans.map(async (p) => {
            const coords = await geocodePlace(p.title);
            return { plan: p, coords };
          })
        );

        const validPoints = geocodedPlans.filter(gp => gp.coords !== null).map(gp => gp.coords!);
        
        if (validPoints.length > 1) {
          const routeResult = await fetchOptimizedRoute(validPoints);
          
          if (routeResult) {
            // Calculate total time (mins) and distance (km)
            const distanceKm = (routeResult.distance / 1000).toFixed(1);
            const timeMins = Math.round(routeResult.time / 60000);

            // Add optimization details to the last plan of the day
            const lastPlan = plans[plans.length - 1];
            const originalDetail = typeof lastPlan.detail === 'string' ? lastPlan.detail : '';
            
            const optimizationText = lang === 'mr' 
              ? `\n\n**🚗 OSRM ऑप्टिमायझेशन:** एकूण प्रवास ${distanceKm} किमी, वेळ ${timeMins} मिनिटे.`
              : `\n\n**🚗 OSRM Optimization:** Total transit ${distanceKm} km, ~${timeMins} mins.`;
              
            lastPlan.detail = originalDetail + optimizationText;
          }
        }
      }

      onUpdateItinerary(updatedItinerary);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (itinerary.length < 2) return null;

  return (
    <button
      onClick={handleOptimize}
      disabled={loading || success}
      className={`w-full mb-4 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all active:scale-95 ${
        success ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${success ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
          {success ? <CheckCircle2 className="w-5 h-5" /> : <Route className="w-5 h-5" />}
        </div>
        <div className="text-left">
          <h4 className="font-bold text-sm">
            {success 
              ? (lang === 'mr' ? 'प्रवास मार्ग ऑप्टिमाइझ केला!' : 'Route Optimized!')
              : (lang === 'mr' ? 'प्रवास मार्ग ऑप्टिमाइझ करा' : 'Optimize Daily Routes')
            }
          </h4>
          <p className={`text-[10px] uppercase tracking-wider font-bold ${success ? 'text-emerald-500' : 'text-slate-500'}`}>
            {lang === 'mr' ? 'OSRM API वापरून' : 'Powered by OSRM API'}
          </p>
        </div>
      </div>
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
    </button>
  );
};
