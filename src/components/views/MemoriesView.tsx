import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Heart, Play, Plus, Share2, Upload, Video, Image as ImageIcon, Sparkles, X, CheckCircle2, Film } from 'lucide-react';
import { TripGroup, TripMemory } from '../../types';
import { TripRecapReelModal, ReelStyle } from '../modals/TripRecapReelModal';

interface MemoriesViewProps {
  trip: TripGroup;
  lang: string;
  t: (key: string) => string;
  themeColor?: string;
  onUpdateTrip: (updatedTrip: TripGroup) => void;
  onAddGalleryItem?: (item: { imageUrl: string; caption?: string }) => void;
}

const DEFAULT_MEMORIES: (TripMemory & { type?: 'photo' | 'reel'; likes?: number; user?: string })[] = [];

export const MemoriesView: React.FC<MemoriesViewProps> = ({
  trip,
  lang,
  t,
  themeColor = '#6366f1',
  onUpdateTrip,
  onAddGalleryItem
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'reels'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [newMemoryUrl, setNewMemoryUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newType, setNewType] = useState<'photo' | 'reel'>('photo');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [previewItem, setPreviewItem] = useState<(TripMemory & { type?: string; likes?: number; user?: string }) | null>(null);

  const memoriesList = (trip.memories && trip.memories.length > 0)
    ? trip.memories.map((m, idx) => ({
        ...m,
        type: (idx % 2 === 1) ? ('reel' as const) : ('photo' as const),
        likes: 10 + idx * 3,
        user: trip.members[idx % trip.members.length]?.name || 'Traveler'
      }))
    : DEFAULT_MEMORIES;

  const [localList, setLocalList] = useState(() => memoriesList);

  const handleRecapSubmit = (style: ReelStyle) => {
    const isAtrangee = style === 'atrangee';
    const newReelItem = {
      id: `reel_recap_${Date.now()}`,
      imageUrl: '',
      timestamp: 'Just now',
      caption: isAtrangee 
        ? (lang === 'mr' ? '🤪 अतरंगी आठवणी: वेडीवाकडी, फास्ट आणि एकदम मज्जा!' : '🤪 Quirky Memories: Crazy, fast, and pure fun!')
        : (lang === 'mr' ? '✨ अनमोल आठवणी: शांत, सुंदर आणि एस्थेटिक!' : '✨ Memorable Memories: Calm, beautiful, and aesthetic!'),
      type: 'reel' as const,
      likes: 1,
      user: 'You'
    };

    setLocalList(prev => [newReelItem, ...prev]);
  };

  const filteredMemories = localList.filter(item => {
    if (activeTab === 'photos') return item.type !== 'reel';
    if (activeTab === 'reels') return item.type === 'reel';
    return true;
  });

  const handleDeleteLocalItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Security constraint: removes ONLY from local component state
    setLocalList(prev => prev.filter(item => item.id !== id));
  };

  const toggleLike = (id: string) => {
    setLikedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryUrl.trim()) return;

    const newMemory: TripMemory = {
      id: `mem_${Date.now()}`,
      imageUrl: newMemoryUrl.trim(),
      timestamp: 'Just now',
      caption: newCaption.trim() || t('defaultMemoryCaption')
    };

    const updatedMemories = [newMemory, ...(trip.memories || [])];
    onUpdateTrip({
      ...trip,
      memories: updatedMemories,
      gallery: updatedMemories
    });

    if (onAddGalleryItem) {
      onAddGalleryItem({ imageUrl: newMemory.imageUrl, caption: newMemory.caption });
    }

    setNewMemoryUrl('');
    setNewCaption('');
    setShowUploadModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen w-full p-4 sm:p-6 pb-36 space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div 
        className="relative rounded-[20px] p-4 text-white overflow-hidden shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, #4338ca 100%)`
        }}
      >
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5">
              <Camera className="w-3 h-3" />
              {t('photoReelGallery')}
            </span>
            <h2 className="text-lg font-black tracking-tight leading-tight">
              {t('tripMemoriesAndReels')}
            </h2>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white text-indigo-900 rounded-xl font-black text-[10px] uppercase tracking-wider shadow hover:bg-slate-100 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('uploadMemory')}</span>
          </button>
        </div>
      </div>

      {/* Trip Recap Reel Banner Card */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 rounded-[20px] p-4 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-wider border border-white/30">
            <Film className="w-3 h-3" />
            <span>TRIP RECAP REEL</span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
            {lang === 'mr' ? 'ट्रिप संपली! रील कोणती बनवायची?' : "Trip's over! Pick a Reel style!"}
          </h3>
        </div>

        <button
          onClick={() => setShowRecapModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-wider shadow hover:bg-slate-100 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer border border-white/50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{lang === 'mr' ? 'रील तयार करा!' : 'Create Reel!'}</span>
        </button>
      </div>

      {/* Media Filter Tabs */}
      <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('allFeeds')}</span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'photos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{t('photos')}</span>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'reels' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>{t('reelsAndShorts')}</span>
        </button>
      </div>

      {/* Masonry Photo & Reels Feed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredMemories.map((mem, idx) => {
          const isLiked = !!likedIds[mem.id];
          const isReel = mem.type === 'reel';

          return (
            <motion.div
              key={`${mem.id}-${idx}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`group relative rounded-3xl overflow-hidden bg-slate-900 shadow-lg border border-slate-200/80 cursor-pointer ${
                isReel ? 'aspect-[9/14]' : 'aspect-square'
              }`}
              onClick={() => setPreviewItem(mem)}
            >
              {/* Image / Thumbnail */}
              <img
                src={mem.imageUrl}
                alt={mem.caption || 'Trip Memory'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

              {/* Delete (X) Badge Button on top right */}
              <button
                type="button"
                onClick={(e) => handleDeleteLocalItem(e, mem.id)}
                className="absolute top-2.5 right-2.5 z-30 bg-rose-600/90 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-lg transition-all border border-white/40 active:scale-90"
                title={t('deletePhoto')}
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>

              {/* Reel Play Icon Overlay */}
              {isReel && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </div>
                </div>
              )}

              {/* Reel Badge */}
              {isReel && (
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-rose-600/90 backdrop-blur text-white rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Video className="w-3 h-3" />
                  Reel
                </div>
              )}

              {/* Author & Caption Info */}
              <div className="absolute bottom-0 inset-x-0 p-4 text-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                    @{mem.user || 'Traveler'}
                  </span>
                  <span className="text-[10px] text-white/70 font-semibold">{mem.timestamp}</span>
                </div>

                <p className="text-xs font-bold line-clamp-2 leading-snug text-white/95">
                  {mem.caption}
                </p>

                {/* Like / Share Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-white/20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(mem.id);
                    }}
                    className="flex items-center gap-1 text-xs font-bold transition-transform active:scale-125"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isLiked ? 'text-rose-500 fill-rose-500' : 'text-white hover:text-rose-400'
                      }`}
                    />
                    <span>{(mem.likes || 10) + (isLiked ? 1 : 0)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (navigator.share) {
                        navigator.share({ title: 'Trip Memory', text: mem.caption, url: mem.imageUrl });
                      }
                    }}
                    className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Action Button (FAB) - Upload Memory */}
      <button
        onClick={() => setShowUploadModal(true)}
        className="fixed bottom-24 right-5 sm:right-8 z-40 w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white/40"
        style={{ backgroundColor: themeColor }}
        title="Upload Memory"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Upload Memory Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 relative space-y-5 flex flex-col max-h-[85vh]"
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {t('uploadTripMemory')}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {t('addPhotoOrVideoUrl')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Media Type Picker */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('photo')}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      newType === 'photo' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('reel')}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                      newType === 'reel' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Reel / Short
                  </button>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                    Image / Video Thumbnail URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/photo.jpg"
                    value={newMemoryUrl}
                    onChange={(e) => setNewMemoryUrl(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                {/* Quick Presets removed */}

                {/* Caption Input */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                    Caption / Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t('writeCaptionPlaceholder')}
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl text-white font-black uppercase tracking-wider text-xs shadow-lg transition-transform active:scale-95"
                  style={{ backgroundColor: themeColor }}
                >
                  {t('postMemory')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox / Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div 
            className="fixed inset-0 z-[160] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-slate-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-square sm:aspect-4/3 w-full bg-black">
                <img
                  src={previewItem.imageUrl}
                  alt={previewItem.caption}
                  className="w-full h-full object-contain"
                />
                {previewItem.type === 'reel' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-rose-600/80 text-white flex items-center justify-center shadow-2xl">
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 text-white space-y-2 bg-slate-900">
                <div className="flex justify-between items-center text-xs font-bold text-amber-300">
                  <span>@{previewItem.user || 'Traveler'}</span>
                  <span className="text-white/60">{previewItem.timestamp}</span>
                </div>
                <p className="text-sm font-semibold leading-relaxed text-slate-100">
                  {previewItem.caption}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trip Recap Reel Modal */}
      <TripRecapReelModal
        isOpen={showRecapModal}
        onClose={() => setShowRecapModal(false)}
        onSubmit={handleRecapSubmit}
        lang={lang}
        themeColor={themeColor}
      />
    </div>
  );
};
