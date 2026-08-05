import { ScrollView } from '../ScrollView';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Music, Play, Pause, Plus, Check, RefreshCw, Radio, Sparkles, Volume2 } from 'lucide-react';
import { useMusicPlayer } from '../MusicPlayerContext';
import { PlaylistItem } from '../../types';
import { sanitizeString } from '../../utils/security';

interface MusicSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  themeColor?: string;
  onAddPlaylistItem: (title: string, url: string, artist?: string, thumbnailUrl?: string) => void;
  currentPlaylist?: PlaylistItem[];
}

export const MusicSearchModal: React.FC<MusicSearchModalProps> = ({
  isOpen,
  onClose,
  lang,
  themeColor = '#6366f1',
  onAddPlaylistItem,
  currentPlaylist = []
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [dropdownResults, setDropdownResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const { playTrack, addToQueue, currentTrack, isPlaying, togglePlay } = useMusicPlayer();

  const categories = [
    { id: 'all', label: lang === 'mr' ? 'सर्व गाणी' : 'All Songs', icon: Sparkles },
    { id: 'marathi', label: lang === 'mr' ? '🚩 मराठी स्पेशल' : '🚩 Marathi Special', icon: Radio },
    { id: 'roadtrip', label: lang === 'mr' ? '🚗 रोड ट्रिप हिट्स' : '🚗 Roadtrip Hits', icon: Music },
    { id: 'lofi', label: lang === 'mr' ? '🎧 लोफाय आणि शांत' : '🎧 Lofi & Chill', icon: Volume2 },
    { id: 'bollywood', label: lang === 'mr' ? '🎬 बॉलिवूड टॉप' : '🎬 Bollywood Hits', icon: Music },
  ];

  const fetchMusicApi = async (searchTerm: string) => {
    try {
      const res = await fetch(`/api/search-music?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        return data.results;
      }
    } catch (e) {
      console.warn('Music search error:', e);
    }
    return [];
  };

  const searchSongs = async (searchTerm: string) => {
    const cleanTerm = sanitizeString(searchTerm);
    if (!cleanTerm.trim()) {
      setDropdownResults([]);
      setShowDropdown(false);
      fetchCategorySongs(activeCategory);
      return;
    }
    setIsSearching(true);
    const searchData = await fetchMusicApi(cleanTerm);
    setResults(searchData);
    setDropdownResults(searchData.slice(0, 6));
    setShowDropdown(searchData.length > 0);
    setIsSearching(false);
  };

  const fetchCategorySongs = async (cat: string) => {
    setIsSearching(true);
    const termMap: Record<string, string> = {
      all: 'Travel Roadtrip Marathi Hindi',
      marathi: 'Marathi travel songs Sairat Zingaat',
      roadtrip: 'Roadtrip driving songs',
      lofi: 'Lofi chill travel music',
      bollywood: 'Bollywood travel party songs'
    };
    const queryTerm = termMap[cat] || 'Travel';
    const searchData = await fetchMusicApi(queryTerm);
    setResults(searchData);
    setIsSearching(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategorySongs(activeCategory);
    }
  }, [isOpen, activeCategory]);

  // Strict 500ms Debounce as requested
  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim()) {
        searchSongs(query);
      } else {
        setShowDropdown(false);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [query]);

  const handleSelectDropdownItem = (song: any) => {
    const title = song.name || song.title || song.trackName;
    const url = song.downloadUrl || song.audioUrl || song.previewUrl || song.sourceUrl;
    const artist = song.primaryArtists || song.artist || song.artistName || 'Artist';
    const artwork = song.image || song.artworkUrl || song.artworkUrl100;

    const trackObj: PlaylistItem = {
      id: String(song.id || Math.random()),
      title: title,
      artist: artist,
      url: url,
      thumbnailUrl: artwork,
      addedBy: 'user',
      timestamp: new Date().toISOString()
    };

    // Play immediately & add to queue
    addToQueue(trackObj);
    playTrack(trackObj);
    onAddPlaylistItem(title, url, artist, artwork);

    setAddedIds(prev => ({ ...prev, [trackObj.id]: true }));
    setShowDropdown(false);
  };

  const handleAddTrack = (track: any) => {
    const title = track.name || track.title || track.trackName;
    const url = track.downloadUrl || track.audioUrl || track.previewUrl || track.sourceUrl;
    const artist = track.primaryArtists || track.artist || track.artistName || 'Artist';
    const artwork = track.image || track.artworkUrl || track.artworkUrl100;

    const trackObj: PlaylistItem = {
      id: String(track.id || Math.random()),
      title,
      artist,
      url,
      thumbnailUrl: artwork,
      addedBy: 'user',
      timestamp: new Date().toISOString()
    };

    addToQueue(trackObj);
    onAddPlaylistItem(title, url, artist, artwork);
    setAddedIds(prev => ({ ...prev, [trackObj.id]: true }));
  };

  const handlePreviewPlay = (track: any) => {
    const title = track.name || track.title || track.trackName;
    const url = track.downloadUrl || track.audioUrl || track.previewUrl || track.sourceUrl;
    const artist = track.primaryArtists || track.artist || track.artistName || 'Artist';
    const artwork = track.image || track.artworkUrl || track.artworkUrl100;

    const trackObj: PlaylistItem = {
      id: String(track.id || Math.random()),
      title,
      artist,
      url,
      thumbnailUrl: artwork,
      addedBy: 'user',
      timestamp: new Date().toISOString()
    };

    if (currentTrack?.id === trackObj.id) {
      togglePlay();
    } else {
      playTrack(trackObj);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[88vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 font-sans"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                style={{ backgroundColor: themeColor }}
              >
                <Music className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-wide">
                  {lang === 'mr' ? '🎵 प्रवासासाठी संगीत व गाणी शोधा' : '🎵 Trip Songs & Music Player'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'mr' ? 'आवडीची गाणी शोधा आणि ट्रिप प्लेलिस्टमध्ये जोडा' : 'Search & play direct audio songs'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar with Absolute Live Dropdown */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3 relative z-30">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'mr' ? 'गाण्याचे नाव किंवा गायक शोधा (उदा. Zingaat, Sairat, Arijit)...' : 'Search song name or artist (e.g. Zingaat, Lofi, Travel)...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if (dropdownResults.length > 0) setShowDropdown(true); }}
                className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm font-bold text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              {isSearching && (
                <RefreshCw className="absolute right-3.5 top-3.5 w-4 h-4 text-indigo-400 animate-spin" />
              )}

              {/* LIVE ABSOLUTE DROPDOWN UNDER INPUT */}
              {showDropdown && dropdownResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-slate-950 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
                  <div className="px-3 py-2 bg-indigo-950/60 flex items-center justify-between text-[11px] font-bold text-indigo-300">
                    <span>{lang === 'mr' ? '⚡ थेट शोध निकाल (JioSaavn / Music API)' : '⚡ Live Results (JioSaavn / Music API)'}</span>
                    <button onClick={() => setShowDropdown(false)} className="hover:text-white"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  {dropdownResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectDropdownItem(item)}
                      className="flex items-center gap-3 p-2.5 hover:bg-indigo-900/40 transition-colors cursor-pointer group"
                    >
                      <img
                        src={item.image || item.artworkUrl || ''}
                        alt={item.name || item.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-white truncate group-hover:text-indigo-300">{item.name || item.title}</p>
                        <p className="text-[11px] font-medium text-slate-400 truncate">{item.primaryArtists || item.artist}</p>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 group-hover:scale-105 transition-transform">
                        <Play className="w-3 h-3 fill-current" />
                        <span>{lang === 'mr' ? 'ऐका' : 'Play'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setQuery('');
                      setShowDropdown(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Results Grid / List */}
          <div className="overflow-y-auto   p-4 space-y-2  ">
            {isSearching && results.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
                <p className="text-xs font-bold uppercase tracking-wider">{lang === 'mr' ? 'गाणी शोधत आहे...' : 'Searching music catalog...'}</p>
              </div>
            ) : results.length > 0 ? (
              results.map((song: any) => {
                const songId = String(song.id || song.trackId);
                const isCurrent = currentTrack?.id === songId;
                const isAdded = addedIds[songId] || currentPlaylist.some(p => p.title === (song.name || song.title || song.trackName));

                return (
                  <div
                    key={songId}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img
                          src={song.image || song.artworkUrl || song.artworkUrl100 || ''}
                          alt={song.name || song.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => handlePreviewPlay(song)}
                          className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white"
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-5 h-5 fill-current text-indigo-400" />
                          ) : (
                            <Play className="w-5 h-5 fill-current text-indigo-400 ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-white truncate">{song.name || song.title}</p>
                        <p className="text-xs font-bold text-slate-400 truncate mt-0.5">{song.primaryArtists || song.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handlePreviewPlay(song)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isCurrent && isPlaying
                            ? 'bg-indigo-600 text-white border-indigo-500 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-indigo-400 border-slate-700'
                        }`}
                        title={isCurrent && isPlaying ? 'Pause song' : 'Play song'}
                      >
                        {isCurrent && isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>

                      <button
                        onClick={() => handleAddTrack(song)}
                        disabled={isAdded}
                        className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                          isAdded
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{lang === 'mr' ? 'जोडले' : 'Added'}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>{lang === 'mr' ? 'जोडा' : 'Add'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Music className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm font-bold">{lang === 'mr' ? 'कोणतेही गाणे सापडले नाही' : 'No songs found'}</p>
                <p className="text-xs text-slate-500">{lang === 'mr' ? 'कृपया दुसरा शब्द शोधून पहा' : 'Try searching for another song title or artist'}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
