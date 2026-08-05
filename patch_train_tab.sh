cat << 'INNER_EOF' > /tmp/train_tab.patch
--- src/components/travel/TrainInfoTab.tsx
+++ src/components/travel/TrainInfoTab.tsx
@@ -10,7 +10,7 @@
 import { fetchTrainData, TrainStatusData } from './api';
 import { Calendar, Clock, MapPin, Search, ArrowRight, Activity, Map, Navigation2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
 import { getCurrencySymbol } from '../../utils';
-import { getTrainDetails, loadTrainCatalog } from '../../services/trainCatalogService';
+import { getTrainDetails, loadTrainCatalog, searchTrainCatalog, TrainCatalogEntry } from '../../services/trainCatalogService';
 import { HandoffModal } from './HandoffModal';
 
 interface TrainInfoTabProps {
@@ -100,6 +100,10 @@
   const getTodayStr = () => new Date().toISOString().split('T')[0];
 
   const [trainNumberInput, setTrainNumberInput] = useState('');
+  const debouncedTrainNumberInput = useDebounce(trainNumberInput, 300);
+  const [trainSuggestions, setTrainSuggestions] = useState<TrainCatalogEntry[]>([]);
+  const [showTrainSuggestions, setShowTrainSuggestions] = useState(false);
+
   const [startDate, setStartDate] = useState(getTodayStr());
   const [activeSubView, setActiveSubView] = useState<'status' | 'timetable'>('status');
   const [mode, setMode] = useState<'status' | 'book' | 'directory'>('status');
@@ -132,6 +136,15 @@
     loadTrainCatalog();
   }, []);
 
+  useEffect(() => {
+    if (debouncedTrainNumberInput.length >= 2) {
+      setTrainSuggestions(searchTrainCatalog(debouncedTrainNumberInput));
+    } else {
+      setTrainSuggestions([]);
+    }
+  }, [debouncedTrainNumberInput]);
+
   const getTrainSchedules = async () => {
     try {
       const module = await import('../../data/trainSchedules.json');
@@ -432,7 +445,7 @@
         <form onSubmit={handleTrainSearch} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {/* Train Number Input */}
-            <div className="bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white rounded-2xl p-3.5 transition-all">
+            <div className="relative bg-slate-50 border border-slate-200 hover:border-amber-400 focus-within:border-amber-500 focus-within:bg-white rounded-2xl p-3.5 transition-all">
               <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                 {lang === 'mr' ? 'ट्रेन नंबर प्रविष्ट करा' : 'Enter Train Number (e.g. 22223)'}
               </label>
@@ -442,11 +455,27 @@
                   type="text"
                   autoComplete="off"
                   value={trainNumberInput}
-                  onChange={(e) => setTrainNumberInput(e.target.value)}
+                  onChange={(e) => {
+                    setTrainNumberInput(e.target.value);
+                    setShowTrainSuggestions(true);
+                  }}
+                  onFocus={() => setShowTrainSuggestions(true)}
                   placeholder={lang === 'mr' ? 'उदा. 22223, राजधानी एक्स्प्रेस' : 'e.g. 22223, Rajdhani Express'}
                   className="w-full bg-transparent font-black text-lg text-slate-900 outline-none"
                   required
                 />
+                {showTrainSuggestions && trainSuggestions.length > 0 && (
+                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl max-h-60 overflow-y-auto z-50">
+                    {trainSuggestions.map((suggestion, index) => (
+                      <button
+                        key={index}
+                        type="button"
+                        className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex flex-col"
+                        onClick={() => {
+                          setTrainNumberInput(suggestion.trainNumber);
+                          setShowTrainSuggestions(false);
+                          // Optional: Auto-submit search here if desired
+                        }}
+                      >
+                        <span className="font-bold text-slate-900">{suggestion.trainNumber} - {suggestion.trainName}</span>
+                        {suggestion.accommodation && (
+                          <span className="text-[10px] font-semibold text-slate-500">{suggestion.accommodation}</span>
+                        )}
+                      </button>
+                    ))}
+                  </div>
+                )}
               </div>
             </div>
INNER_EOF
cat /tmp/train_tab.patch | patch -p0
