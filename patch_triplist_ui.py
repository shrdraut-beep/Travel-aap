import sys

with open('src/components/views/TripListView.tsx', 'r') as f:
    content = f.read()

# Replace the image container
old_img_container = """                <div className="h-52 w-full relative" style={{ backgroundColor: themeColor }}>
                  {trip.wallpaperUrl && (
                    <img src={trip.wallpaperUrl} alt={trip.name} className="w-full h-full object-cover mix-blend-overlay" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <div 
                      className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
                      <span className="text-sm font-black text-white uppercase tracking-widest">{lang === 'mr' ? 'थीम' : 'Theme'}</span>
                    </div>
                  </div>"""

new_img_container = """                <div className="h-52 w-full relative bg-slate-100">
                  {trip.wallpaperUrl && (
                    <img src={trip.wallpaperUrl} alt={trip.name} className="w-full h-full object-cover" />
                  )}"""

content = content.replace(old_img_container, new_img_container)

with open('src/components/views/TripListView.tsx', 'w') as f:
    f.write(content)

print("Patched TripListView UI successfully")
