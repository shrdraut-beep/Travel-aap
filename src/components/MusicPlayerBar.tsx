import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music, X, SkipBack, SkipForward, Shuffle } from 'lucide-react';
import { useMusicPlayer } from './MusicPlayerContext';

interface MusicPlayerBarProps {
  lang: string;
  themeColor?: string;
}

export const MusicPlayerBar: React.FC<MusicPlayerBarProps> = ({ lang, themeColor = '#6366f1' }) => {
  const [skipVotes, setSkipVotes] = useState(0);
  const {
    currentTrack,
    isPlaying,
    isShuffle,
    togglePlay,
    nextTrack,
    prevTrack,
    toggleShuffle,
    currentTime,
    duration,
    seek,
    closePlayer
  } = useMusicPlayer();

  React.useEffect(() => {
    setSkipVotes(0);
  }, [currentTrack?.id || currentTrack?.title]);

  if (!currentTrack || typeof currentTrack !== 'object') return null;

  const progressPercent = duration && typeof duration === 'number' && duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    seek(percentage * duration);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const safeTitle = currentTrack?.title 
    ? (typeof currentTrack.title === 'string' || typeof currentTrack.title === 'number' ? String(currentTrack.title) : 'Unknown Title') 
    : 'Unknown Title';
    
  const safeArtist = currentTrack?.artist 
    ? (typeof currentTrack.artist === 'string' || typeof currentTrack.artist === 'number' ? String(currentTrack.artist) : (lang === 'mr' ? 'संगीत' : 'Shared Track')) 
    : (lang === 'mr' ? 'संगीत' : 'Shared Track');
    
  const safeThumbnailUrl = currentTrack?.thumbnailUrl && typeof currentTrack.thumbnailUrl === 'string' 
    ? currentTrack.thumbnailUrl 
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        className="fixed bottom-[76px] sm:bottom-4 left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-md z-[9999] rounded-[20px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl overflow-hidden pointer-events-auto text-slate-100"
      >
        {/* Seekable Progress Bar */}
        <div 
          onClick={handleProgressBarClick}
          className="h-2 w-full bg-slate-800 cursor-pointer relative group"
        >
          <div 
            className="h-full transition-all duration-100 ease-out rounded-r-full"
            style={{ 
              width: `${progressPercent}%`, 
              backgroundColor: typeof themeColor === 'string' ? themeColor : '#6366f1' 
            }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] pointer-events-none"
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />
        </div>

        <div className="px-3.5 py-2.5 flex items-center justify-between gap-2.5">
          {/* Song Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              {safeThumbnailUrl ? (
                <motion.img
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
                  src={safeThumbnailUrl}
                  alt={safeTitle}
                  className="w-11 h-11 rounded-full object-cover shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] border-2 border-slate-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 text-premium-violet shrink-0">
                  <Music className="w-5 h-5 animate-pulse" />
                </div>
              )}
              {isPlaying && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-premium-violet-soft0 rounded-full p-0.5 shadow border border-slate-900">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-black text-white truncate leading-snug">
                {safeTitle}
              </p>
              <p className="text-[11px] font-medium text-slate-400 truncate">
                {safeArtist}
              </p>
              <p className="text-[10px] font-mono text-premium-violet-soft/80 mt-0.5">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Shuffle Toggle */}
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-lg transition-all ${
                isShuffle ? 'premium-gradient-pink text-white shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button
              onClick={prevTrack}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors active:scale-95"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-full text-slate-950 active:scale-95 transition-all shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] cursor-pointer hover:scale-105"
              style={{ backgroundColor: typeof themeColor === 'string' ? themeColor : '#6366f1' }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current text-slate-950" />
              ) : (
                <Play className="w-4 h-4 fill-current text-slate-950 ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors active:scale-95"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Close */}
            <button
              onClick={closePlayer}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg active:scale-90 transition-colors ml-0.5"
              title={lang === 'mr' ? 'बंद करा' : 'Close player'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
