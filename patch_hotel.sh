cat << 'INNER_EOF' > /tmp/hotel.patch
--- src/components/travel/HotelSearchTab.tsx
+++ src/components/travel/HotelSearchTab.tsx
@@ -5,6 +5,7 @@
 import { fetchHotelData, HotelOption } from './api';
 import { HandoffModal } from './HandoffModal';
+import { useDebounce } from '../../hooks/useDebounce';
 
 interface HotelSearchTabProps {
   lang: string;
@@ -29,6 +30,10 @@
   const fourDaysLaterStr = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];
 
   const [destination, setDestination] = useState('');
+  const debouncedDestination = useDebounce(destination, 300);
+  const [predictions, setPredictions] = useState<any[]>([]);
+  const [showPredictions, setShowPredictions] = useState(false);
+
   const [checkIn, setCheckIn] = useState(tomorrowStr);
   const [checkOut, setCheckOut] = useState(fourDaysLaterStr);
   const [guests, setGuests] = useState('2');
@@ -42,6 +47,38 @@
     isOpen: false,
     url: '',
     title: ''
   });
+
+  // Fetch Google Places Autocomplete predictions
+  useEffect(() => {
+    const fetchPredictions = async () => {
+      if (!debouncedDestination || debouncedDestination.length < 2) {
+        setPredictions([]);
+        return;
+      }
+      const googleApiKey = (
+        (import.meta as any).env?.VITE_GOOGLE_PLACES_API_KEY ||
+        (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
+        (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
+        ''
+      ).trim();
+      
+      if (!googleApiKey) return;
+      
+      try {
+        const targetUrl = \`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=\${encodeURIComponent(debouncedDestination)}&types=(regions)&key=\${encodeURIComponent(googleApiKey)}\`;
+        const proxyUrl = \`https://corsproxy.io/?\${encodeURIComponent(targetUrl)}\`;
+        const res = await fetch(proxyUrl);
+        if (res.ok) {
+          const data = await res.json();
+          if (data.predictions) {
+            setPredictions(data.predictions);
+            setShowPredictions(true);
+          }
+        }
+      } catch (err) {
+        console.error('Failed to fetch predictions:', err);
+      }
+    };
+    fetchPredictions();
+  }, [debouncedDestination]);
 
   const handleSearch = async (e: React.FormEvent) => {
@@ -108,12 +145,28 @@
                 {lang === 'mr' ? 'गंतव्य' : 'Destination'}
               </label>
-              <input
-                type="text"
-                value={destination}
-                onChange={(e) => setDestination(e.target.value)}
-                placeholder="e.g. New Delhi, Goa, Mumbai, Nashik"
-                className="w-full bg-transparent font-black text-base text-slate-900 outline-none"
-                required
-              />
+              <div className="relative">
+                <input
+                  type="text"
+                  value={destination}
+                  onChange={(e) => {
+                    setDestination(e.target.value);
+                    setShowPredictions(true);
+                  }}
+                  onFocus={() => setShowPredictions(true)}
+                  placeholder="e.g. New Delhi, Goa, Mumbai"
+                  className="w-full bg-transparent font-black text-base text-slate-900 outline-none"
+                  required
+                />
+                {showPredictions && predictions.length > 0 && (
+                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-48 overflow-y-auto">
+                    {predictions.map((p, i) => (
+                      <div 
+                        key={i} 
+                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 text-sm font-semibold text-slate-700 flex flex-col"
+                        onClick={() => {
+                          setDestination(p.description);
+                          setShowPredictions(false);
+                        }}
+                      >
+                        <span>{p.structured_formatting?.main_text || p.description}</span>
+                        <span className="text-[10px] text-slate-400 font-medium">{p.structured_formatting?.secondary_text}</span>
+                      </div>
+                    ))}
+                  </div>
+                )}
+              </div>
             </div>
           </div>
INNER_EOF
cat /tmp/hotel.patch | patch -p0
