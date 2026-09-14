import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { PlaylistItem } from '../types';

export interface MusicPlayerContextType {
  currentTrack: PlaylistItem | null;
  isPlaying: boolean;
  isShuffle: boolean;
  playlist: PlaylistItem[];
  playTrack: (track: PlaylistItem, trackList?: PlaylistItem[]) => void;
  addToQueue: (track: PlaylistItem) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  closePlayer: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};

interface MusicPlayerProviderProps {
  children: React.ReactNode;
  playlist?: PlaylistItem[];
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({ children, playlist: initialPlaylist = [] }) => {
  const [currentTrack, setCurrentTrack] = useState<PlaylistItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [queue, setQueue] = useState<PlaylistItem[]>(initialPlaylist);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync external playlist changes if initial state provided
  useEffect(() => {
    if (initialPlaylist && initialPlaylist.length > 0) {
      setQueue(prev => {
        const merged = [...prev];
        initialPlaylist.forEach(item => {
          if (!merged.some(m => m.id === item.id || m.title === item.title)) {
            merged.push(item);
          }
        });
        return merged;
      });
    }
  }, [initialPlaylist]);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };
    const handleEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue, isShuffle, currentTrack]);

  // Sync Audio source when currentTrack changes
  useEffect(() => {
    if (audioRef.current) {
      if (currentTrack && currentTrack.url) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.load();
        
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Playback notice:', err);
        });

        // MediaSession API for lock screen and background control
        if ('mediaSession' in navigator) {
          try {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: currentTrack.title,
              artist: currentTrack.artist || 'RoutTripo',
              album: 'RoutTripo Roadtrip Hits',
              artwork: [
                { 
                  src: currentTrack.thumbnailUrl || '', 
                  sizes: '512x512', 
                  type: 'image/jpeg' 
                }
              ]
            });

            navigator.mediaSession.setActionHandler('play', () => {
              audioRef.current?.play().then(() => setIsPlaying(true));
            });
            navigator.mediaSession.setActionHandler('pause', () => {
              audioRef.current?.pause();
              setIsPlaying(false);
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
              handlePrevTrack();
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
              handleNextTrack();
            });
          } catch (sessionErr) {
            console.error('Error configuring MediaSession:', sessionErr);
          }
        }
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [currentTrack]);

  // Sync play/pause state from UI
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const playTrack = (track: PlaylistItem, trackList?: PlaylistItem[]) => {
    if (trackList && trackList.length > 0) {
      setQueue(trackList);
    } else {
      setQueue(prev => {
        if (!prev.some(t => t.id === track.id)) {
          return [track, ...prev];
        }
        return prev;
      });
    }
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const addToQueue = (track: PlaylistItem) => {
    setQueue(prev => {
      if (prev.some(t => t.id === track.id || t.title === track.title)) return prev;
      return [...prev, track];
    });
    if (!currentTrack) {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleNextTrack = () => {
    if (queue.length === 0) return;
    
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      setCurrentTrack(queue[randomIndex]);
    } else {
      const currentIndex = queue.findIndex(t => t.id === currentTrack?.id || t.title === currentTrack?.title);
      if (currentIndex === -1) {
        setCurrentTrack(queue[0]);
      } else {
        const nextIndex = (currentIndex + 1) % queue.length;
        setCurrentTrack(queue[nextIndex]);
      }
    }
  };

  const handlePrevTrack = () => {
    if (queue.length === 0) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      setCurrentTrack(queue[randomIndex]);
    } else {
      const currentIndex = queue.findIndex(t => t.id === currentTrack?.id || t.title === currentTrack?.title);
      if (currentIndex === -1) {
        setCurrentTrack(queue[queue.length - 1]);
      } else {
        const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
        setCurrentTrack(queue[prevIndex]);
      }
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isShuffle,
        playlist: queue,
        playTrack,
        addToQueue,
        togglePlay,
        nextTrack: handleNextTrack,
        prevTrack: handlePrevTrack,
        toggleShuffle,
        currentTime,
        duration,
        seek,
        closePlayer
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};
