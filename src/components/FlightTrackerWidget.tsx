import React, { useState } from 'react';
import { Plane, Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchFlightStatus, FlightStatus } from '../services/api/flights';

import { LiveRadarModal } from './modals/LiveRadarModal';

interface FlightTrackerProps {
  lang: string;
}

export const FlightTrackerWidget: React.FC<FlightTrackerProps> = ({ lang }) => {
  const [flightNo, setFlightNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<FlightStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLiveRadar, setShowLiveRadar] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNo.trim()) return;

    setLoading(true);
    setError(null);
    const result = await fetchFlightStatus(flightNo.trim());
    if (result) {
      setStatus(result);
    } else {
      setError(lang === 'mr' ? 'उड्डाण आढळले नाही किंवा API त्रुटी.' : 'Flight not found or API error.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 shadow-sm border border-slate-200/50 relative overflow-hidden">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Plane className="w-4 h-4 text-blue-500" />
        {lang === 'mr' ? 'थेट विमान ट्रॅकिंग' : 'Live Flight Tracking'}
      </h3>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="e.g. AI101"
            value={flightNo}
            onChange={(e) => setFlightNo(e.target.value.toUpperCase())}
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 uppercase tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !flightNo.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl font-bold uppercase tracking-widest shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </button>
      </form>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {status && !loading && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-blue-800 font-black text-lg">{status.callsign}</span>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
              status.on_ground ? 'bg-slate-400 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {status.on_ground ? (lang === 'mr' ? 'जमिनीवर' : 'ON GROUND') : (lang === 'mr' ? 'हवेत' : 'IN AIR')}
            </span>
          </div>

          <div className="flex items-center justify-between relative mb-3">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">{lang === 'mr' ? 'देश' : 'Origin'}</p>
              <p className="text-xl font-black text-slate-800">{status.origin_country}</p>
            </div>
            
            <div className="flex-1 px-4 relative flex items-center justify-center">
              <div className="h-px bg-blue-200 w-full absolute"></div>
              <Plane className="w-4 h-4 text-blue-400 bg-blue-50 z-10" />
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">{lang === 'mr' ? 'वेग' : 'Speed'}</p>
              <p className="text-xl font-black text-slate-800">{status.velocity ? Math.round(status.velocity * 3.6) : '--'} km/h</p>
            </div>
          </div>
          
          <div className="flex justify-between mt-3 text-[11px] font-bold text-slate-600">
            <div>
              <p>{lang === 'mr' ? 'उंची' : 'Altitude'}</p>
              <p className="text-slate-800">{status.altitude ? `${Math.round(status.altitude)} m` : '--'}</p>
            </div>
            <div className="text-right">
              <p>{lang === 'mr' ? 'अक्षांश/रेखांश' : 'Lat/Lon'}</p>
              <p className="text-slate-800">
                {status.latitude?.toFixed(2) || '--'}, {status.longitude?.toFixed(2) || '--'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-center space-y-2">
        <button
          type="button"
          onClick={() => setShowLiveRadar(true)}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
        >
          📡 {lang === 'mr' ? 'थेट सॅटेलाईट रडार पहा' : 'View Live Satellite Radar'}
        </button>
        <p className="text-[11px] text-slate-500 font-semibold">
          Powered by OpenSky Network & Satellite Telemetry
        </p>

        
          <LiveRadarModal
            isOpen={showLiveRadar}
            onClose={() => setShowLiveRadar(false)}
            lang={lang}
          />
        
      </div>
    </div>
  );
};
