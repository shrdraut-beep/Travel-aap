import { searchYouTube } from '../../services/api/youtubeService';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass as Sparkles, Fuel, CheckSquare, Siren, Settings, Share2, Globe, Shield, 
  HelpCircle, PhoneCall, Copy, Check, Music, Plus, Trash2, Play, 
  ExternalLink, FileText, Camera, Video, Compass, Wand2, ArrowRight
} from 'lucide-react';
import { TripGroup, PlaylistItem } from '../../types';
import { QuirkyLanguageSelector } from '../QuirkyLanguageSelector';
import { useLanguage } from '../../context/LanguageContext';
import { safeCopyToClipboard } from '../../utils';
import { MemoriesView } from './MemoriesView';

interface ExtrasViewProps {
  trip: TripGroup;
  lang: string;
  t: (key: string) => string;
  currencySymbol: string;
  themeColor?: string;
  onAddExpense?: () => void;
  onSearchFlights?: () => void;
  onOpenFuelCalculator?: () => void;
  onAddItineraryPlan?: () => void;
  onAddMember?: () => void;
  onSOS?: () => void;
  onUpdateTrip: (updatedTrip: TripGroup) => void;
  onShowToast?: (msg: string, type?: 'success' | 'alert' | 'info') => void;
  onShowRecap?: () => void;
  onPublish?: () => void;
  onExportPDF?: () => void;
  onOpenSettings?: () => void;
  defaultSubTab?: 'planning' | 'memories' | 'utilities';
}

export const ExtrasView: React.FC<ExtrasViewProps> = ({
  trip,
  lang,
  t,
  currencySymbol,
  themeColor = '#6366f1',
  onAddExpense,
  onSearchFlights,
  onOpenFuelCalculator,
  onAddItineraryPlan,
  onAddMember,
  onSOS,
  onUpdateTrip,
  onShowToast,
  onShowRecap,
  onPublish,
  onExportPDF,
  onOpenSettings,
  defaultSubTab = 'planning'
}) => {
  const { setLanguage } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'planning' | 'memories' | 'utilities'>(defaultSubTab);
  const [copiedLink, setCopiedLink] = useState(false);
  const [packingItems, setPackingItems] = useState(
    trip.packingList || [
      { id: 'p1', name: lang === 'mr' ? 'आधार कार्ड / ड्रायव्हिंग लायसन्स' : 'ID Card & Driving License', isChecked: true },
      { id: 'p2', name: lang === 'mr' ? 'फोन चार्जर आणि पॉवरबँक' : 'Phone Charger & Powerbank', isChecked: true },
      { id: 'p3', name: lang === 'mr' ? 'कपडे आणि सनग्लॅसेस' : 'Clothes & Sunglasses', isChecked: false },
      { id: 'p4', name: lang === 'mr' ? 'फर्स्ट एड बॉक्स व औषधे' : 'First Aid Kit & Medicines', isChecked: false }
    ]
  );
  const [newItemName, setNewItemName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songUrl, setSongUrl] = useState('');

  const playlist: PlaylistItem[] = trip.playlist || [
    { id: 's1', title: 'Zingaat', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', artist: 'Ajay-Atul', addedBy: 'Rahul', timestamp: 'Just now' },
    { id: 's2', title: 'Roadtrip Highway Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', artist: 'DJ Snake', addedBy: 'Amit', timestamp: '1 hour ago' }
  ];

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim()) return;

    let finalUrl = songUrl.trim();
    let finalArtist = 'Trip Anthem';
    
    // If user provided a title but no URL, search YouTube dynamically
    if (!finalUrl) {
      if (onShowToast) onShowToast(lang === 'mr' ? 'गाणे शोधत आहे...' : 'Searching song...');
      try {
        const ytResults = await searchYouTube(songTitle.trim());
        if (ytResults && ytResults.length > 0) {
          finalUrl = ytResults[0].url;
          finalArtist = ytResults[0].author.name;
        } else {
          finalUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(songTitle.trim());
        }
      } catch (err) {
        finalUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(songTitle.trim());
      }
    }

    const newSong: PlaylistItem = {
      id: `song_${Date.now()}`,
      title: songTitle.trim(),
      url: finalUrl,
      artist: finalArtist,
      addedBy: 'Member',
      timestamp: 'Just now'
    };

    onUpdateTrip({
      ...trip,
      playlist: [...playlist, newSong]
    });
    setSongTitle('');
    setSongUrl('');
    if (onShowToast) onShowToast(lang === 'mr' ? 'गाणे जोडले गेले!' : 'Song added to trip playlist!');
  };

  const handleRemoveSong = (id: string) => {
    const updated = playlist.filter(s => s.id !== id);
    onUpdateTrip({
      ...trip,
      playlist: updated
    });
  };

  const appUrl = window.location.origin;

  const handleWhatsAppInvite = async () => {
    const inviteText = lang === 'mr'
      ? `नमस्कार! मी "${trip.name}" या सहलीचे नियोजन करत आहे ✈️. खालील लिंकवर क्लिक करून आमच्या सहलीच्या ग्रुपमध्ये सहभागी व्हा:\n${appUrl}`
      : `Hey! I'm planning an epic trip "${trip.name}"! Tap the link to join my trip group:\n${appUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: trip.name,
          text: inviteText,
          url: appUrl
        });
      } catch (err) {
        await safeCopyToClipboard(inviteText);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } else {
      await safeCopyToClipboard(inviteText);
      setCopiedLink(true);
      if (onShowToast) onShowToast(lang === 'mr' ? 'व्हॉट्सॲप आमंत्रण लिंक कॉपी झाली!' : 'WhatsApp invite link copied!');
      setTimeout(() => setCopiedLink(false), 2000);
      window.open(`https://wa.me/?text=${encodeURIComponent(inviteText)}`, '_blank');
    }
  };

  const togglePackingItem = (id: string) => {
    const updated = packingItems.map(item =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    setPackingItems(updated);
    onUpdateTrip({ ...trip, packingList: updated });
  };

  const handleAddPackingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem = {
      id: `pack_${Date.now()}`,
      name: newItemName.trim(),
      isChecked: false
    };
    const updated = [...packingItems, newItem];
    setPackingItems(updated);
    onUpdateTrip({ ...trip, packingList: updated });
    setNewItemName('');
  };

  return (
    <div className="flex flex-col min-h-screen w-full p-4 sm:p-6 pb-36 space-y-5 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div 
        className="relative rounded-3xl p-5 sm:p-6 text-white overflow-hidden shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, #1e1b4b 100%)`
        }}
      >
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-wider">
              ✨ {lang === 'mr' ? 'इतर व वैशिष्ट्ये' : 'Extras & Social Hub'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            {lang === 'mr' ? 'प्लॅनिंग, सोशल मीडिया आणि उपयुक्त टूल' : 'Planning, Social Media & Extras'}
          </h2>
          <p className="text-xs font-semibold text-white/80">
            {lang === 'mr' 
              ? 'गाणी, पॅकिंग चेकलिस्ट, सहल रील व फोटो' 
              : 'Collaborative playlists, packing checklist & trip reels'}
          </p>
        </div>
      </div>

      {/* Sub-Section Navigation Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('planning')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'planning'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 text-amber-500" />
          <span>{lang === 'mr' ? 'प्लॅनिंग व गाणी' : 'Planning & Songs'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('memories')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'memories'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Camera className="w-4 h-4 text-purple-500" />
          <span>{lang === 'mr' ? 'सोशल व आठवणी' : 'Social & Memories'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('utilities')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'utilities'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>{lang === 'mr' ? 'उपयुक्त टूल व रिपोर्ट' : 'Utilities & Reports'}</span>
        </button>
      </div>

      {/* SECTION 1: PLANNING & SONGS */}
      {activeSubTab === 'planning' && (
        <div className="space-y-4 animate-fade-in">
          {/* Trip Music & Spotify Collaborative Playlist */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-black shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-slate-900">{lang === 'mr' ? 'सहलीची प्लेलिस्ट व गाणी' : 'Trip Songs & Spotify Playlist'}</h3>
                  <p className="text-[10px] font-semibold text-slate-400">{playlist.length} {lang === 'mr' ? 'गाणी जोडली आहेत' : 'tracks added'}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddSong} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                placeholder={lang === 'mr' ? 'गाण्याचे नाव (उदा. झिंगाट)' : 'Song title e.g. Zingaat'}
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-pink-500"
              />
              <input
                type="url"
                placeholder={lang === 'mr' ? 'Spotify / YouTube लिंक (ऐच्छिक)' : 'Spotify / MP3 link (optional)'}
                value={songUrl}
                onChange={(e) => setSongUrl(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-pink-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'जोडा' : 'Add'}</span>
              </button>
            </form>

            <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto scrollbar-none flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
              {playlist.map((song) => (
                <div
                  key={song.id}
                  className="p-2.5 rounded-2xl bg-slate-50 hover:bg-pink-50/50 border border-slate-100 flex items-center justify-between gap-2 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate">{song.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 truncate">{song.artist || 'Trip Song'} • {song.addedBy || 'Group'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {song.url && (
                      <a
                        href={song.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-pink-600 hover:bg-pink-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSong(song.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fuel & Toll Calculator Callout */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 sm:p-5 text-white shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white shrink-0">
                <Fuel className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm leading-tight">
                  {lang === 'mr' ? 'पेट्रोल आणि टोल हिशोब' : 'Fuel & Toll Calculator'}
                </h4>
                <p className="text-[11px] text-amber-100 font-medium mt-0.5">
                  {lang === 'mr' ? 'माइलेज व टोलचा अचूक खर्च काढा आणि हिशोबात जोडा' : 'Calculate journey fuel & toll charges instantly'}
                </p>
              </div>
            </div>
            
          </div>

          {/* Smart Packing Checklist */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-slate-900">{lang === 'mr' ? 'स्मार्ट पॅकिंग चेकलिस्ट' : 'Smart Packing Checklist'}</h3>
                  <p className="text-[10px] font-semibold text-slate-400">{packingItems.filter(i => i.isChecked).length} / {packingItems.length} {lang === 'mr' ? 'वस्तू पॅक झाल्या' : 'items packed'}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddPackingItem} className="flex gap-2">
              <input
                type="text"
                placeholder={lang === 'mr' ? 'नवीन वस्तू जोडा (उदा. पॉवर बँक)' : 'Add new item e.g. Power bank'}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm shrink-0 cursor-pointer"
              >
                {lang === 'mr' ? 'जोडा' : 'Add'}
              </button>
            </form>

            <div className="space-y-1.5 max-h-52 overflow-y-auto scrollbar-none flex-1 pb-[30px] [&::-webkit-scrollbar]:hidden">
              {packingItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => togglePackingItem(item.id)}
                  className={`w-full p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    item.isChecked
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                    item.isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                  }`}>
                    {item.isChecked && <Check className="w-3 h-3 stroke-[3px]" />}
                  </div>
                  <span className="text-xs font-bold">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SOCIAL MEDIA & MEMORIES */}
      {activeSubTab === 'memories' && (
        <div className="space-y-5 animate-fade-in">
          {/* Social Cards: Smart Trip Reel & Community Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Trip Reel Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl backdrop-blur flex items-center justify-center border border-white/30">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight italic">{t('aiTripRecap') || (lang === 'mr' ? 'Smart सहल रील' : 'Smart Trip Reel')}</h3>
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">{t('magicMemories') || 'Magic Memories'}</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-indigo-100 leading-snug">
                  {lang === 'mr' 
                    ? 'तुमच्या सहलीच्या फोटोंचे आणि खर्चाचे एक सुंदर रील बनवा!' 
                    : 'Compile your gallery and stats into a dynamic 15s recap!'}
                </p>
                {onShowRecap && (
                  <button 
                    type="button"
                    onClick={onShowRecap}
                    className="w-full py-3 bg-white text-indigo-700 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t('buildRecap') || (lang === 'mr' ? 'रील तयार करा' : 'Build Reel')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Public Community Share Card */}
            <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden border border-white/10">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <Globe className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight italic">{t('communityHub') || (lang === 'mr' ? 'समुदायात शेअर करा' : 'Share to Community')}</h3>
                    <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest">{t('publicTemplate') || 'Public Template'}</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-300 leading-snug">
                  {lang === 'mr' 
                    ? 'तुमचा सहलीचा प्लॅन सार्वजनिक करा जेणेकरून इतर त्याचा वापर करू शकतील!' 
                    : 'Publish your itinerary as a template for other travelers!'}
                </p>
                {onPublish && (
                  <button 
                    type="button"
                    onClick={onPublish}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{t('publishHub') || (lang === 'mr' ? 'पब्लिश करा' : 'Publish')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Embedded Full Memories & Photo Feed */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <MemoriesView
              trip={trip}
              lang={lang}
              t={t}
              themeColor={themeColor}
              onUpdateTrip={onUpdateTrip}
            />
          </div>
        </div>
      )}

      {/* SECTION 3: UTILITIES & REPORTS */}
      {activeSubTab === 'utilities' && (
        <div className="space-y-4 animate-fade-in">
          {/* WhatsApp Invite & App Sharing Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-slate-900">{lang === 'mr' ? 'मित्रांना ग्रुपमध्ये आणा' : 'Invite Friends to Trip'}</h3>
                  <p className="text-[10px] font-semibold text-slate-400">{lang === 'mr' ? 'व्हॉट्सॲप किंवा लिंकने ग्रुप शेअर करा' : 'Share via WhatsApp or link'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleWhatsAppInvite}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (lang === 'mr' ? 'कॉपी झाली!' : 'Copied!') : (lang === 'mr' ? 'शेअर करा' : 'Invite')}</span>
              </button>
            </div>
          </div>

          {/* Emergency SOS Broadcast Alert */}
          <div className="bg-rose-50 rounded-3xl p-5 border border-rose-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Siren className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-rose-950">{lang === 'mr' ? 'आपत्कालीन SOS सायरन' : 'Emergency SOS Siren'}</h3>
                  <p className="text-[10px] font-bold text-rose-600 mt-0.5">{lang === 'mr' ? 'सर्व सहकाऱ्यांना तात्काळ लाईव्ह लोकेशन अलर्ट पाठवा' : 'Broadcast immediate location alert to trip members'}</p>
                </div>
              </div>

              {onSOS && (
                <button
                  type="button"
                  onClick={onSOS}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  {lang === 'mr' ? 'SOS पाठवा' : 'Trigger SOS'}
                </button>
              )}
            </div>
          </div>

          {/* Quick App Preferences Link */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-full p-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer border border-slate-200"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-600" />
                <span>{lang === 'mr' ? 'अ‍ॅप सेटिंग्ज व भाषा पर्याय' : 'App Settings & Language Preferences'}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
