import React, { useState, useEffect } from 'react';
import { Globe, MapPin, Bus, ShieldAlert, CreditCard, Clock, Compass, Navigation, Loader2 } from 'lucide-react';

interface PublicApisTripWidgetProps {
  destination: string;
  lang: string;
}

export const PublicApisTripWidget: React.FC<PublicApisTripWidgetProps> = ({ destination, lang }) => {
  const isMr = lang === 'mr';

  const [countryInfo, setCountryInfo] = useState<any>(null);
  const [pois, setPois] = useState<any[]>([]);
  const [transitPlan, setTransitPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!destination) return;
    setLoading(true);

    // 1. Fetch REST Countries API info via backend proxy
    fetch(`/api/public-apis/country-info?country=${encodeURIComponent(destination)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setCountryInfo(data.country);
      })
      .catch(err => console.warn('REST Countries error:', err));

    // 2. Fetch Overpass OSM POIs
    fetch(`/api/public-apis/overpass-pois?lat=19.0760&lng=72.8777&category=tourism`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.pois) setPois(data.pois);
      })
      .catch(err => console.warn('Overpass POIs error:', err));

    // 3. Fetch OpenTripPlanner transit data
    fetch('/api/public-apis/opentripplanner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: 'Central Hub', destination: destination || 'City Center' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.routePlan) setTransitPlan(data.routePlan);
      })
      .catch(err => console.warn('OpenTripPlanner error:', err))
      .finally(() => setLoading(false));
  }, [destination]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-5 text-left">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-[16px] flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">
              {isMr ? 'डेस्टिनेशन इंटेलिजन्स (Global APIs)' : 'Destination Intelligence'}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold">
              {isMr ? 'REST Countries, OpenStreetMap & Transit Engine' : 'Powered by REST Countries, Overpass & OTP APIs'}
            </p>
          </div>
        </div>
        {loading && <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />}
      </div>

      {/* 1. REST Countries API Data */}
      {countryInfo && (
        <div className="bg-gradient-to-br from-pink-50/70 to-slate-50 border border-premium-violet rounded-[20px] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-950 uppercase tracking-widest flex items-center gap-1.5">
              <span className="text-lg">{countryInfo.flagEmoji || '🌐'}</span>
              {countryInfo.name} ({countryInfo.capital})
            </span>
            <span className="text-[10px] font-bold bg-premium-violet-soft text-premium-violet px-2 py-0.5 rounded-full uppercase">
              REST Countries API
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="bg-white/80 p-2.5 rounded-[16px] border border-rose-50">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">{isMr ? 'चलण (Currency)' : 'Currency'}</span>
              <span className="text-xs font-black text-slate-800">
                {countryInfo.currencies?.[0]?.symbol || '₹'} {countryInfo.currencies?.[0]?.code || 'INR'}
              </span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-[16px] border border-rose-50">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">{isMr ? 'वेळ क्षेत्र (Timezone)' : 'Timezone'}</span>
              <span className="text-xs font-black text-slate-800 line-clamp-1">
                {countryInfo.timezones?.[0] || 'UTC+05:30'}
              </span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-[16px] border border-rose-50">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">{isMr ? 'भाषा (Language)' : 'Languages'}</span>
              <span className="text-xs font-black text-slate-800 line-clamp-1">
                {countryInfo.languages?.slice(0, 2).join(', ') || 'English'}
              </span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-[16px] border border-rose-50">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">{isMr ? 'ड्रायव्हिंग साईड' : 'Driving Side'}</span>
              <span className="text-xs font-black text-slate-800 capitalize">
                {countryInfo.carSide || 'left'} side
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Overpass OSM POIs */}
      {pois.length > 0 && (
        <div className="bg-premium-pink-soft/60 border border-orange-100 rounded-[20px] p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-premium-pink uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-premium-pink" />
              {isMr ? 'जवळपासची पर्यटन स्थळे आणि आणीबाणी सेवा' : 'Local POIs & Emergency Services'}
            </span>
            <span className="text-[10px] font-bold bg-orange-100 text-premium-pink px-2 py-0.5 rounded-full uppercase">
              Overpass API
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {pois.slice(0, 3).map((poi: any, idx: number) => (
              <div key={idx} className="bg-white p-2.5 rounded-[16px] border border-premium-pink/60 flex items-center gap-2">
                <span className="text-base shrink-0">
                  {poi.type === 'hospital' ? '🏥' : poi.type === 'atm' ? '🏧' : '📍'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-800 truncate">{poi.name}</p>
                  <p className="text-[10px] font-bold text-premium-pink capitalize">{poi.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. OpenTripPlanner Public Transit Route Info (Information layer without action buttons) */}
      {transitPlan && (
        <div className="bg-premium-sky-soft/60 border border-premium-sky-deep rounded-[20px] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[var(--premium-sky-deep)] uppercase tracking-widest flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-premium-sky-deep" />
              {isMr ? 'स्थानिक सार्वजनिक ट्रान्सिट मार्ग' : 'Transit Route Intelligence'}
            </span>
            <span className="text-[10px] font-bold bg-premium-sky-soft text-premium-sky-deep px-2 py-0.5 rounded-full uppercase">
              OpenTripPlanner
            </span>
          </div>

          <div className="bg-white p-3 rounded-[16px] border border-premium-sky-deep/50 flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">{isMr ? 'मार्ग' : 'Route'}</span>
              <span>{transitPlan.origin} ➔ {transitPlan.destination}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">{isMr ? 'कालावधी' : 'Duration'}</span>
              <span>~{transitPlan.durationMinutes} mins</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">{isMr ? 'मोड्स' : 'Modes'}</span>
              <span className="text-premium-sky-deep">{transitPlan.modes?.join(' + ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
