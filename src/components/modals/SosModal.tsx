import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, X, PhoneCall, MapPin, Share2, AlertTriangle, ShieldCheck, Volume2, VolumeX, Building2, UserPlus, Send } from 'lucide-react';
import { notifyEmergencySOS } from '../../utils/notifications';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
  userName?: string;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
  userName = 'Traveler'
}) => {
  const isMr = lang === 'mr';
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Fetching GPS coordinates...');
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [customContact, setCustomContact] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>([
    '9876543210',
    '9123456789'
  ]);

  // Fetch GPS location on open
  useEffect(() => {
    if (isOpen) {
      setBroadcastSent(false);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setCoords({ lat: latitude, lng: longitude });
            setLocationName(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          },
          (err) => {
            console.warn("Geolocation error:", err);
            setLocationName("GPS unavailable - Share approximate location");
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setLocationName("GPS not supported on this device");
      }
    } else {
      stopSirenSound();
    }
  }, [isOpen]);

  // Siren Audio Synthesizer
  const toggleSirenSound = () => {
    if (isSirenPlaying) {
      stopSirenSound();
    } else {
      startSirenSound();
    }
  };

  const startSirenSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.5);

      let isHigh = false;
      const interval = setInterval(() => {
        if (!ctx || ctx.state === 'closed') {
          clearInterval(interval);
          return;
        }
        if (isHigh) {
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          isHigh = false;
        } else {
          osc.frequency.setValueAtTime(1400, ctx.currentTime);
          isHigh = true;
        }
      }, 500);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      setAudioCtx(ctx);
      setIsSirenPlaying(true);
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const stopSirenSound = () => {
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      setAudioCtx(null);
    }
    setIsSirenPlaying(false);
  };

  const handleBroadcastSOS = () => {
    notifyEmergencySOS(userName, lang);
    setBroadcastSent(true);

    // Share via WhatsApp
    const mapUrl = coords 
      ? `https://maps.google.com/?q=${coords.lat},${coords.lng}`
      : 'Location unavailable';

    const text = isMr
      ? `🚨 *आपत्कालीन SOS इशारा!* \nमी अडचणीत आहे! माझी मदत करा.\nस्थान: ${mapUrl}`
      : `🚨 *EMERGENCY SOS ALERT!* \nI need urgent help! Please assist me.\nMy Location: ${mapUrl}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddContact = () => {
    if (customContact.trim().length >= 10) {
      setEmergencyContacts([...emergencyContacts, customContact.trim()]);
      setCustomContact('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-slate-900 border-2 border-red-500 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-5 flex items-center justify-between shrink-0 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 animate-pulse">
                  <Siren className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-white">
                    {isMr ? 'आणीबाणी SOS केंद्र' : 'Emergency SOS Hub'}
                  </h3>
                  <p className="text-xs text-red-100 font-medium">
                    {isMr ? '२४/७ सुरक्षा आणि त्वरित मदत' : '24/7 Safety & Immediate Response'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopSirenSound();
                  onClose();
                }}
                className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto no-scrollbar flex-1">
              {/* Siren Toggle Banner */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 animate-bounce" />
                  <div>
                    <h4 className="text-sm font-bold text-red-200">
                      {isMr ? 'आपत्कालीन सायरन अ‍ॅलार्म' : 'Loud Emergency Siren'}
                    </h4>
                    <p className="text-[11px] text-red-300/80">
                      {isMr ? 'सभोवतालचे लक्ष वेधून घेण्यासाठी मोठ्या आवाजात सायरन वाजवा' : 'Play high-pitch loud siren to attract nearby help'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleSirenSound}
                  className={`px-3.5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shrink-0 shadow-md transition-all active:scale-95 ${
                    isSirenPlaying
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {isSirenPlaying ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>STOP</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-red-400" />
                      <span>SIREN</span>
                    </>
                  )}
                </button>
              </div>

              {/* GPS Location Tracker */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <MapPin className="w-4 h-4" />
                    {isMr ? 'तुमचे वर्तमान स्थान (GPS)' : 'Live GPS Location'}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    ACCURATE
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-white bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 truncate">
                  {locationName}
                </p>
                {coords && (
                  <a
                    href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-sky-400 hover:underline font-bold flex items-center gap-1 inline-block"
                  >
                    View on Google Maps ↗
                  </a>
                )}
              </div>

              {/* Broadcast Button */}
              <button
                onClick={handleBroadcastSOS}
                className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all border border-red-400/40 cursor-pointer"
              >
                <Share2 className="w-5 h-5 text-white animate-pulse" />
                <span>
                  {broadcastSent
                    ? (isMr ? 'अ‍ॅलर्ट पाठवला! (पुन्हा पाठवा)' : 'SOS Broadcasted! (Send Again)')
                    : (isMr ? '🚨 मित्रांना व व्हाट्सअ‍ॅपवर SOS पाठवा' : '🚨 Broadcast SOS & Share Location')}
                </span>
              </button>

              {/* Direct Emergency Phone Numbers */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  {isMr ? '१-टॅप आपत्कालीन फोन नंबर्स' : '1-Tap Emergency Helplines'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:112"
                    className="p-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 rounded-xl flex items-center justify-between text-white font-black text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-red-400" />
                      <div>
                        <p className="text-xs">112</p>
                        <p className="text-[9px] text-slate-400 font-normal">All Emergency</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-lg">CALL</span>
                  </a>

                  <a
                    href="tel:108"
                    className="p-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 rounded-xl flex items-center justify-between text-white font-black text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-xs">108</p>
                        <p className="text-[9px] text-slate-400 font-normal">Ambulance</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-lg">CALL</span>
                  </a>

                  <a
                    href="tel:100"
                    className="p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded-xl flex items-center justify-between text-white font-black text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs">100</p>
                        <p className="text-[9px] text-slate-400 font-normal">Police</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-lg">CALL</span>
                  </a>

                  <a
                    href="tel:1033"
                    className="p-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 rounded-xl flex items-center justify-between text-white font-black text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-xs">1033</p>
                        <p className="text-[9px] text-slate-400 font-normal">Highway Helpline</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-lg">CALL</span>
                  </a>
                </div>
              </div>

              {/* Personal Emergency Contacts Dialing */}
              <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-3.5 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center justify-between">
                  <span>{isMr ? 'वैयक्तिक संपर्क क्रमांक' : 'Personal Emergency Contacts'}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </h4>

                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={customContact}
                    onChange={(e) => setCustomContact(e.target.value)}
                    placeholder={isMr ? '१० अंकी मोबाईल नंबर' : '10-digit mobile number'}
                    className="flex-1 bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 outline-none focus:border-red-500"
                  />
                  <button
                    onClick={handleAddContact}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {emergencyContacts.map((phone, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/60 rounded-xl border border-slate-800 text-xs font-mono font-bold">
                      <span className="text-slate-300">📞 {phone}</span>
                      <a
                        href={`tel:${phone}`}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-emerald-500 transition-colors"
                      >
                        Call
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
