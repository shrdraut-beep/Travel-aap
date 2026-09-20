import React, { useState } from 'react';

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

import { TransportOptions } from './TransportOptions';
import { BookingFunnelLayout } from './BookingFunnelLayout';
import { SearchResultsToolbar } from './SearchResultsToolbar';
import { Users, Minus, Plus, Search, ShieldCheck, Ticket, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { zuelpayClient } from '../../services/zuelpay.service';

const QUOTAS = ['General', 'Tatkal', 'Ladies', 'Senior Citizen'];
const AC_CLASSES = ['1A', '2A', '3A', '3E', 'CC', 'EC'];

const toMinutes = (time: string) => {
  const [h, m] = String(time || '').split(':');
  return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
};

const durationToMinutes = (duration: string) => {
  const h = String(duration || '').match(/(\d+)h/);
  const m = String(duration || '').match(/(\d+)m/);
  return (h ? parseInt(h[1], 10) : 0) * 60 + (m ? parseInt(m[1], 10) : 0);
};

const extractStationQuery = (str: string) => {
  const match = str.match(/\(([A-Z0-9]{2,5})\)/i);
  if (match) return match[1].toUpperCase();
  return str.trim();
};

export const TrainInfoTab = ({ lang, currencySymbol, onBookNow, onBack }: any) => {
  const isMr = lang === 'mr';
  const [origin, setOrigin] = useState('Mumbai CSMT (CSMT)');
  const [destination, setDestination] = useState('Nasik Road (NK)');
  const [departDate, setDepartDate] = useState(getTomorrowDate());
  const [passengers, setPassengers] = useState(1);
  const [classType, setClassType] = useState('SL');
  const [quota, setQuota] = useState('General');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [trainData, setTrainData] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('departure');
  const [acOnly, setAcOnly] = useState(false);

  // PNR Status state
  const [showPnrModal, setShowPnrModal] = useState(false);
  const [pnrInput, setPnrInput] = useState('');
  const [pnrLoading, setPnrLoading] = useState(false);
  const [pnrResult, setPnrResult] = useState<any | null>(null);
  const [pnrError, setPnrError] = useState<string | null>(null);

  const visibleTrains = React.useMemo(() => {
    const list = acOnly
      ? trainData.filter(t => (t.classes || []).some((c: string) => AC_CLASSES.includes(String(c).toUpperCase())))
      : trainData;

    return [...list].sort((a, b) => {
      if (sortBy === 'departure') return toMinutes(a.departureTime || a.departure_time) - toMinutes(b.departureTime || b.departure_time);
      if (sortBy === 'duration') return durationToMinutes(a.duration) - durationToMinutes(b.duration);
      return (a.price || 0) - (b.price || 0);
    });
  }, [trainData, sortBy, acOnly]);

  const handleTrainSearch = async () => {
    const origCode = extractStationQuery(origin);
    const destCode = extractStationQuery(destination);

    if (origCode.toUpperCase() === destCode.toUpperCase() && origCode !== '') {
      alert(isMr ? "प्रस्थान आणि आगमन ठिकाण एक असू शकत नाही." : "Origin and destination cannot be the same.");
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await zuelpayClient.searchTrains({
        origin: origCode || 'CSMT',
        destination: destCode || 'NK',
        date: departDate,
        quota,
        classType
      });
      if (data && data.results) {
        setTrainData(data.results);
      } else {
        setTrainData([]);
      }
    } catch (err: any) {
      console.error("ZuelPay train search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckPnr = async () => {
    if (!pnrInput || pnrInput.replace(/\D/g, '').length < 10) {
      setPnrError(isMr ? "कृपया वैध १० अंकी PNR नंबर टाका." : "Please enter a valid 10-digit PNR number.");
      return;
    }
    setPnrLoading(true);
    setPnrError(null);
    setPnrResult(null);
    try {
      const res = await zuelpayClient.checkPnr(pnrInput.trim());
      if (res.success && res.pnrStatus) {
        setPnrResult(res.pnrStatus);
      } else {
        setPnrError(res.error || (isMr ? "PNR तपशील सापडले नाहीत." : "Unable to fetch PNR details."));
      }
    } catch (err: any) {
      setPnrError(err.message || "Failed to check PNR status");
    } finally {
      setPnrLoading(false);
    }
  };


  const renderPassengerSelector = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Passengers</h4>
          <p className="text-[10px] text-slate-500">IRCTC Limit: Max 6 per booking</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 rounded-[16px] p-1">
          <button 
            type="button"
            onClick={() => setPassengers(Math.max(1, passengers - 1))} 
            disabled={passengers <= 1}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Minus className="w-4 h-4"/>
          </button>
          <span className="font-black text-slate-900 w-4 text-center">{passengers}</span>
          <button 
            type="button"
            onClick={() => {
              if (passengers < 6) {
                setPassengers(passengers + 1);
              }
            }} 
            disabled={passengers >= 6}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-800 font-bold active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-4 h-4"/>
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-slate-800 mb-3">Quota</h4>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {QUOTAS.map(q => (
            <button
              key={q}
              type="button"
              onClick={() => setQuota(q)}
              className={`shrink-0 px-3 py-2 rounded-[16px] text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${quota === q ? 'premium-gradient-pink text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {passengers >= 6 && (
        <div className="p-3 bg-premium-pink-soft border border-premium-pink rounded-[16px] text-xs font-bold text-premium-pink leading-snug">
          ⚠️ IRCTC Rule: Maximum 6 passengers allowed per general ticket (4 for Tatkal).
        </div>
      )}

      <div>
        <h4 className="font-bold text-slate-800 mb-3">Class</h4>
        <div className="grid grid-cols-4 gap-2">
          {['SL', '3A', '2A', '1A'].map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setClassType(c)}
              className={`py-2 rounded-[16px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${classType === c ? 'premium-gradient-pink text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* ZuelPay Train API & PNR Status Banner */}
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold">
            <Ticket className="w-3.5 h-3.5 text-amber-600" />
            ZuelPay IRCTC API
          </span>
          <span className="hidden sm:inline text-[11px]">Live Train Schedules & Real-time Availability</span>
        </div>
        <button
          type="button"
          onClick={() => setShowPnrModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors shadow-xs cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-pink-600" />
          {isMr ? "PNR स्थिती तपासा" : "Check PNR Status"}
        </button>
      </div>

      <BookingFunnelLayout
        mode="train"
        onBack={onBack}
        origin={origin}
        setOrigin={setOrigin}
        destination={destination}
        setDestination={setDestination}
        date={departDate}
        setDate={setDepartDate}
        onSearch={handleTrainSearch}
        isLoading={isLoading}
        hasSearched={hasSearched}
        lang={lang}
        passengerSummary={`${passengers} Pax, ${classType}, ${quota}`}
        renderPassengerSelector={renderPassengerSelector}
        renderResultsToolbar={() => (
          <SearchResultsToolbar
            lang={lang}
            activeSort={sortBy}
            onSortChange={setSortBy}
            sortOptions={[
              { key: 'departure', label: 'Departure' },
              { key: 'duration', label: 'Fastest' },
              { key: 'price', label: 'Cheapest' },
            ]}
            toggles={[{ key: 'ac', label: 'AC Only', active: acOnly, onToggle: () => setAcOnly(v => !v) }]}
          />
        )}
        renderResults={() => (
          <TransportOptions
            mode="train"
            data={visibleTrains}
            isLoading={isLoading}
            isCached={false}
            origin={origin}
            destination={destination}
            lang={lang}
            currencySymbol={currencySymbol}
            onBookNow={onBookNow}
          />
        )}
      />

      {/* PNR Status Lookup Modal */}
      {showPnrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {isMr ? "IRCTC PNR स्थिती" : "IRCTC PNR Status"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Powered by ZuelPay Travel API
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPnrModal(false);
                  setPnrResult(null);
                  setPnrError(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {isMr ? "१० अंकी PNR नंबर प्रविष्ट करा" : "Enter 10-Digit PNR Number"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={10}
                    value={pnrInput}
                    onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 8421905634"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono font-bold tracking-widest text-center text-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    type="button"
                    onClick={handleCheckPnr}
                    disabled={pnrLoading || pnrInput.length < 10}
                    className="px-5 py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-bold rounded-2xl text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-pink-600/20"
                  >
                    {pnrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {isMr ? "शोधा" : "Get Status"}
                  </button>
                </div>
              </div>

              {pnrError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs font-medium text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{pnrError}</span>
                </div>
              )}

              {pnrResult && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-black text-slate-900">
                        {pnrResult.trainNumber} - {pnrResult.trainName}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {pnrResult.fromStation} → {pnrResult.toStation} ({pnrResult.doj})
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-pink-100 text-pink-800 text-[11px] font-black rounded-full">
                      {pnrResult.chartStatus}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Passenger Status
                    </div>
                    <div className="space-y-1.5">
                      {pnrResult.passengers?.map((p: any) => (
                        <div key={p.passengerNumber} className="flex justify-between items-center text-xs bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-700">Passenger {p.passengerNumber}</span>
                          <span className="font-black text-pink-700">
                            {p.currentStatus} {p.coach ? `• ${p.coach}-${p.berth} (${p.berthType})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

