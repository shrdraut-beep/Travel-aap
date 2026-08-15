import re

with open("src/components/views/DashboardView.tsx", "r") as f:
    content = f.read()

playlist_code = """
        {/* Playlist UI */}
        <div className="bg-white/70 backdrop-blur-md rounded-[24px] p-5 border border-slate-200/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <Music className="w-4 h-4" style={{ color: themeColor }} />
              <span className="text-sm font-bold uppercase tracking-widest">{t('tripPlaylist')}</span>
            </div>
            <button 
              onClick={() => {
                setShowPlaylistAdd(!showPlaylistAdd);
                setPlaylistUrl('');
                setPlaylistTitle('');
              }}
              className={`p-2 rounded-xl transition-all border shadow-sm ${showPlaylistAdd ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-900 border-slate-400'}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showPlaylistAdd && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 p-4 bg-slate-50/80 backdrop-blur-md rounded-2xl border border-slate-200/50 relative"
            >
              {/* Toggle manual fallback button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowManualPlaylistAdd(!showManualPlaylistAdd)}
                  className="text-xs font-bold text-coral hover:text-coral/80 transition-colors uppercase tracking-wider"
                >
                  {showManualPlaylistAdd 
                    ? t('goBackToSearch')
                    : t('addUrlManually')
                  }
                </button>
              </div>

              {/* Manual mode inputs */}
              {showManualPlaylistAdd && (
                <div className="space-y-3 pt-2 border-t border-slate-200/50 animate-fade-in">
                  <input 
                    type="text" 
                    placeholder={t('songTitlePlaceholder')}
                    value={playlistTitle}
                    onChange={(e) => setPlaylistTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-coral/20"
                  />
                  <input 
                    type="text" 
                    placeholder="Spotify/YouTube URL..."
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-coral/20"
                  />
                  <button 
                    onClick={() => {
                      if (playlistTitle && playlistUrl) {
                        onAddPlaylistItem(playlistTitle, playlistUrl);
                        setPlaylistTitle('');
                        setPlaylistUrl('');
                        setShowPlaylistAdd(false);
                        setShowManualPlaylistAdd(false);
                      }
                    }}
                    className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg"
                  >
                    {t('addToPlaylist')}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          <div className="space-y-2">
            {(trip.playlist || []).length > 0 ? (
              (trip.playlist || []).map((item) => (
                <div key={typeof item?.id === 'string' || typeof item?.id === 'number' ? String(item.id) : Math.random()} className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-md rounded-[20px] border border-white/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item?.thumbnailUrl && typeof item.thumbnailUrl === 'string' ? (
                      <img 
                        src={item.thumbnailUrl} 
                        alt={typeof item?.title === 'string' ? item.title : 'Thumbnail'} 
                        className="w-12 h-12 rounded-xl object-cover shadow-md shrink-0 border border-white/40"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center shrink-0 shadow-inner">
                        <Music className="w-5 h-5 text-coral animate-pulse" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-800 truncate">
                        {item?.title && (typeof item.title === 'string' || typeof item.title === 'number') ? String(item.title) : 'Unknown Title'}
                      </p>
                      <p className="text-xs font-bold text-slate-500 truncate mt-0.5">
                        {item?.artist && (typeof item.artist === 'string' || typeof item.artist === 'number') 
                          ? String(item.artist) 
                          : ((typeof item?.url === 'string' && item.url.includes('spotify.com')) ? 'Spotify' : (typeof item?.url === 'string' && (item.url.includes('youtube.com') || item.url.includes('youtu.be')) ? 'YouTube' : 'Web Link'))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { window.open(item.url, '_blank'); }} className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-slate-600"><Play className="w-3.5 h-3.5" /></button>
                    {item?.addedBy === userId && (
                      <button onClick={() => onRemovePlaylistItem(item.id)} className="p-2.5 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-200/50">
                <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                  {t('noMusicShared')}
                </p>
              </div>
            )}
          </div>
        </div>
"""

# Insert playlist_code before {/* Trip Manager Live Advisory Chat Modal */}
content = content.replace("{/* Trip Manager Live Advisory Chat Modal */}", playlist_code + "\n      {/* Trip Manager Live Advisory Chat Modal */}")

with open("src/components/views/DashboardView.tsx", "w") as f:
    f.write(content)
