import React, { useState } from 'react';
import { X, CheckCircle, ExternalLink, ShieldCheck, Plane, ArrowRight, AlertCircle } from 'lucide-react';

interface WebCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPnr?: string;
  initialLastName?: string;
  initialAirline?: string;
}

interface AirlinePortal {
  id: string;
  name: string;
  code: string;
  logo: string;
  color: string;
  checkInUrl: (pnr: string, lastName: string) => string;
  openWindowHours: number;
}

const AIRLINES: AirlinePortal[] = [
  {
    id: 'indigo',
    name: 'IndiGo',
    code: '6E',
    logo: 'https://images.kiwi.com/airlines/64/6E.png',
    color: 'from-blue-600 to-indigo-700',
    checkInUrl: (pnr, lastName) => pnr && lastName 
      ? 'https://www.goindigo.in/web-check-in.html?pnr=' + encodeURIComponent(pnr) + '&lastName=' + encodeURIComponent(lastName)
      : 'https://www.goindigo.in/web-check-in.html',
    openWindowHours: 48
  },
  {
    id: 'airindia',
    name: 'Air India',
    code: 'AI',
    logo: 'https://images.kiwi.com/airlines/64/AI.png',
    color: 'from-rose-600 to-red-700',
    checkInUrl: (pnr, lastName) => pnr && lastName
      ? 'https://www.airindia.com/in/en/manage/web-check-in.html?pnr=' + encodeURIComponent(pnr) + '&lastName=' + encodeURIComponent(lastName)
      : 'https://www.airindia.com/in/en/manage/web-check-in.html',
    openWindowHours: 48
  },
  {
    id: 'akasa',
    name: 'Akasa Air',
    code: 'QP',
    logo: 'https://images.kiwi.com/airlines/64/QP.png',
    color: 'from-orange-500 to-amber-600',
    checkInUrl: (pnr, lastName) => pnr && lastName
      ? 'https://www.akasaair.com/check-in?pnr=' + encodeURIComponent(pnr) + '&lastName=' + encodeURIComponent(lastName)
      : 'https://www.akasaair.com/check-in',
    openWindowHours: 48
  },
  {
    id: 'spicejet',
    name: 'SpiceJet',
    code: 'SG',
    logo: 'https://images.kiwi.com/airlines/64/SG.png',
    color: 'from-red-500 to-rose-600',
    checkInUrl: (pnr, lastName) => pnr && lastName
      ? 'https://www.spicejet.com/check-in?pnr=' + encodeURIComponent(pnr) + '&lastName=' + encodeURIComponent(lastName)
      : 'https://www.spicejet.com/check-in',
    openWindowHours: 48
  },
  {
    id: 'airindiaexpress',
    name: 'Air India Express',
    code: 'IX',
    logo: 'https://images.kiwi.com/airlines/64/IX.png',
    color: 'from-orange-600 to-red-600',
    checkInUrl: (pnr, lastName) => pnr && lastName
      ? 'https://www.airindiaexpress.com/check-in?pnr=' + encodeURIComponent(pnr) + '&lastName=' + encodeURIComponent(lastName)
      : 'https://www.airindiaexpress.com/check-in',
    openWindowHours: 48
  },
  {
    id: 'vistara',
    name: 'Vistara',
    code: 'UK',
    logo: 'https://images.kiwi.com/airlines/64/UK.png',
    color: 'from-purple-800 to-indigo-900',
    checkInUrl: () => 'https://www.airvistara.com/trip/check-in',
    openWindowHours: 48
  }
];

export const WebCheckInModal: React.FC<WebCheckInModalProps> = ({
  isOpen,
  onClose,
  initialPnr = '',
  initialLastName = '',
  initialAirline = 'IndiGo'
}) => {
  const [selectedAirlineId, setSelectedAirlineId] = useState(() => {
    const found = AIRLINES.find(a => 
      initialAirline.toLowerCase().includes(a.name.toLowerCase()) || 
      initialAirline.toUpperCase().includes(a.code)
    );
    return found ? found.id : 'indigo';
  });
  const [pnr, setPnr] = useState(initialPnr);
  const [lastName, setLastName] = useState(initialLastName);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentAirline = AIRLINES.find(a => a.id === selectedAirlineId) || AIRLINES[0];

  const handleLaunchCheckIn = () => {
    const url = currentAirline.checkInUrl(pnr.trim().toUpperCase(), lastName.trim());
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyPnr = () => {
    if (pnr) {
      navigator.clipboard.writeText(pnr.trim().toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sky-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Plane className="w-3.5 h-3.5" />
            <span>Automated Check-in Assistant</span>
          </div>
          <h2 className="text-xl font-black">Airline Web Check-in</h2>
          <p className="text-xs text-white/80 mt-0.5">
            Grab seats & generate digital boarding pass (Opens 48 hrs prior)
          </p>
        </div>

        <div className="p-5 space-y-5">
          {/* Airline Selector */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              1. Select Airline
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AIRLINES.map((airline) => (
                <button
                  key={airline.id}
                  type="button"
                  onClick={() => setSelectedAirlineId(airline.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    selectedAirlineId === airline.id
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs scale-[1.02]'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={airline.logo}
                    alt={airline.name}
                    className="w-6 h-6 object-contain rounded-md"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="text-[11px] font-bold text-slate-800 truncate max-w-full">
                    {airline.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* PNR & Last Name Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  PNR / Booking Ref
                </label>
                {pnr && (
                  <button
                    type="button"
                    onClick={handleCopyPnr}
                    className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
              <input
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                placeholder="e.g. W9Q7KL"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-black tracking-wider uppercase focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Passenger Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Quick Notice */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Check-in Guidelines ({currentAirline.name})</p>
              <p className="text-[11px] text-amber-800">
                Web check-in closes 60 mins before domestic flights. Free auto-assigned seats are provided or you may select extra legroom seats.
              </p>
            </div>
          </div>

          {/* Action Launch Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleLaunchCheckIn}
              className="w-full bg-gradient-to-r from-sky-500 via-indigo-600 to-pink-600 text-white font-black py-3.5 px-5 rounded-2xl text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <span>Launch {currentAirline.name} Web Check-in Portal</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-slate-400 font-medium mt-2">
              Opens the official airline gateway in an authorized secure window
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebCheckInModal;
