cat << 'INNER_EOF' > /tmp/bookings2.patch
--- src/components/views/BookingsView.tsx
+++ src/components/views/BookingsView.tsx
@@ -8,7 +8,7 @@
 import { HotelSearchTab } from '../travel/HotelSearchTab';
 import { TrainInfoTab } from '../travel/TrainInfoTab';
 import { BusSearchTab } from '../travel/BusSearchTab';
-import { Compass, Ticket, Building2, CheckCircle2, Plane, Train, Bus } from 'lucide-react';
+import { Compass, Ticket, Building2, CheckCircle2, Plane, Train, Bus, X } from 'lucide-react';
 
 export const TRAVELPAYOUTS_MARKER = "554147";
 
@@ -28,7 +28,7 @@
   currencySymbol,
   themeColor = '#2563eb'
 }) => {
-  const [activeTab, setActiveTab] = useState<'packages' | 'flights' | 'hotels' | 'trains' | 'buses'>('packages');
+  const [activeModal, setActiveModal] = useState<'packages' | 'flights' | 'hotels' | 'trains' | 'buses' | null>(null);
   const [toastMsg, setToastMsg] = useState<string | null>(null);
 
   const showToast = (msg: string) => {
@@ -46,73 +46,112 @@
       {/* Clean Grid Layout of Standalone Card Buttons (2 columns) */}
       <div className="grid grid-cols-2 gap-3">
         <button
-          onClick={() => setActiveTab('packages')}
-          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all shadow-sm ${
-            activeTab === 'packages'
-              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
-              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
-          }`}
+          onClick={() => setActiveModal('packages')}
+          className="p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all shadow-sm bg-gradient-to-br from-[#f3e8ff] to-[#faf5ff] border border-[#e9d5ff] hover:shadow-md active:scale-98 text-slate-800"
+          style={{ transform: 'scale(1)' }}
         >
-          <Compass className="w-6 h-6" />
-          <span className="font-bold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'टूर पॅकेजेस' : 'Tour Packages'}</span>
+          <span className="text-3xl drop-shadow-sm">🏝️</span>
+          <span className="font-extrabold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'टूर पॅकेजेस' : 'Tour Packages'}</span>
         </button>
 
         <button
-          onClick={() => setActiveTab('flights')}
-          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all shadow-sm ${
-            activeTab === 'flights'
-              ? 'border-blue-600 bg-blue-50 text-blue-700'
-              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
-          }`}
+          onClick={() => setActiveModal('flights')}
+          className="p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all shadow-sm bg-gradient-to-br from-[#e0f2fe] to-[#f0f9ff] border border-[#bae6fd] hover:shadow-md active:scale-98 text-slate-800"
+          style={{ transform: 'scale(1)' }}
         >
-          <Plane className="w-6 h-6" />
-          <span className="font-bold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'विमान' : 'Flights'}</span>
+          <span className="text-3xl drop-shadow-sm">✈️</span>
+          <span className="font-extrabold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'विमान' : 'Flights'}</span>
         </button>
 
         <button
-          onClick={() => setActiveTab('hotels')}
-          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all shadow-sm ${
-            activeTab === 'hotels'
-              ? 'border-purple-600 bg-purple-50 text-purple-700'
-              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
-          }`}
+          onClick={() => setActiveModal('hotels')}
+          className="p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all shadow-sm bg-gradient-to-br from-[#ffedd5] to-[#fff7ed] border border-[#fed7aa] hover:shadow-md active:scale-98 text-slate-800"
+          style={{ transform: 'scale(1)' }}
         >
-          <Building2 className="w-6 h-6" />
-          <span className="font-bold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'हॉटेल्स' : 'Hotels'}</span>
+          <span className="text-3xl drop-shadow-sm">🏨</span>
+          <span className="font-extrabold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'हॉटेल्स' : 'Hotels'}</span>
         </button>
 
         <button
-          onClick={() => setActiveTab('trains')}
-          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all shadow-sm ${
-            activeTab === 'trains'
-              ? 'border-amber-600 bg-amber-50 text-amber-700'
-              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
-          }`}
+          onClick={() => setActiveModal('trains')}
+          className="p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all shadow-sm bg-gradient-to-br from-[#dcfce7] to-[#f0fdf4] border border-[#bbf7d0] hover:shadow-md active:scale-98 text-slate-800"
+          style={{ transform: 'scale(1)' }}
         >
-          <Train className="w-6 h-6" />
-          <span className="font-bold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'ट्रेन' : 'Trains'}</span>
+          <span className="text-3xl drop-shadow-sm">🚆</span>
+          <span className="font-extrabold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'ट्रेन' : 'Trains'}</span>
         </button>
 
         <button
-          onClick={() => setActiveTab('buses')}
-          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all shadow-sm ${
-            activeTab === 'buses'
-              ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
-              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
-          }`}
+          onClick={() => setActiveModal('buses')}
+          className="col-span-2 p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 transition-all shadow-sm bg-gradient-to-br from-[#f1f5f9] to-[#f8fafc] border border-[#e2e8f0] hover:shadow-md active:scale-98 text-slate-800"
+          style={{ transform: 'scale(1)' }}
         >
-          <Bus className="w-6 h-6" />
-          <span className="font-bold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'बस' : 'Buses'}</span>
+          <span className="text-3xl drop-shadow-sm">🚌</span>
+          <span className="font-extrabold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'बस' : 'Buses'}</span>
         </button>
       </div>
 
-      {/* Main Content Area */}
-      {activeTab === 'packages' && <ExplorePackagesView lang={lang} />}
-      {activeTab === 'flights' && <FlightSearchTab lang={lang} currencySymbol={currencySymbol} />}
-      {activeTab === 'hotels' && <HotelSearchTab lang={lang} currencySymbol={currencySymbol} />}
-      {activeTab === 'trains' && <TrainInfoTab lang={lang} />}
-      {activeTab === 'buses' && <BusSearchTab lang={lang} currencySymbol={currencySymbol} />}
+      {/* Full-Screen Modal Overlay */}
+      {activeModal && (
+        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col">
+          <div className="flex-none pt-safe bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
+            <div className="flex items-center justify-between px-4 py-3">
+              <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
+                {activeModal === 'packages' && (lang === 'mr' ? 'टूर पॅकेजेस' : 'Tour Packages')}
+                {activeModal === 'flights' && (lang === 'mr' ? 'विमान बुकिंग' : 'Flight Search')}
+                {activeModal === 'hotels' && (lang === 'mr' ? 'हॉटेल बुकिंग' : 'Hotel Search')}
+                {activeModal === 'trains' && (lang === 'mr' ? 'ट्रेन माहिती' : 'Train Search')}
+                {activeModal === 'buses' && (lang === 'mr' ? 'बस बुकिंग' : 'Bus Search')}
+              </h3>
+              <button 
+                onClick={() => setActiveModal(null)}
+                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors active:scale-95"
+              >
+                <X className="w-5 h-5" />
+              </button>
+            </div>
+          </div>
+          <div className="flex-1 overflow-y-auto pb-safe">
+            <div className="p-4 sm:p-6 pb-20">
+              {activeModal === 'packages' && <ExplorePackagesView lang={lang} />}
+              {activeModal === 'flights' && <FlightSearchTab lang={lang} currencySymbol={currencySymbol} />}
+              {activeModal === 'hotels' && <HotelSearchTab lang={lang} currencySymbol={currencySymbol} />}
+              {activeModal === 'trains' && <TrainInfoTab lang={lang} />}
+              {activeModal === 'buses' && <BusSearchTab lang={lang} currencySymbol={currencySymbol} />}
+            </div>
+          </div>
+        </div>
+      )}
     </div>
   );
 };
INNER_EOF
cat /tmp/bookings2.patch | patch -p0
