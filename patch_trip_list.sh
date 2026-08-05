cat << 'INNER_EOF' > /tmp/trip_list.patch
--- src/components/views/TripListView.tsx
+++ src/components/views/TripListView.tsx
@@ -125,18 +125,9 @@
   const [searchQuery, setSearchQuery] = React.useState('');
   const [isBookingOpen, setIsBookingOpen] = React.useState(false);
   const [bookingSearchActive, setBookingSearchActive] = React.useState(false);
-  const [activeMainTab, setActiveMainTab] = React.useState<'my_trips' | 'holidays'>('my_trips');
-  const [holidayTab, setHolidayTab] = React.useState<'agent_trips' | 'shared_trips'>('agent_trips');
+  const [activeView, setActiveView] = React.useState<'trips' | 'packages' | 'templates'>('trips');
 
-  // Filters for Holidays
-  const [holidayFilterDestination, setHolidayFilterDestination] = React.useState('');
-  const [holidayFilterPersons, setHolidayFilterPersons] = React.useState('');
-  const [holidayFilterDays, setHolidayFilterDays] = React.useState('');
-  const [holidayFilterBudget, setHolidayFilterBudget] = React.useState('');
-  const [holidayFilterType, setHolidayFilterType] = React.useState('');
-  const [holidayFilterCategory, setHolidayFilterCategory] = React.useState('');
-
-  // Synchronized Booking Window State
   const {
     activeTab: bookingTab,
     setActiveTab: setBookingTab,
@@ -213,35 +204,30 @@
 
   return (
     <div className="w-full flex flex-col pb-44 sm:pb-36">
-      <div className="px-4 sm:px-5 pt-3 sticky top-0 z-10 bg-[#fcfcfd]/80 backdrop-blur-md pb-2 border-b border-slate-200/50">
-        <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 shadow-inner border border-slate-200">
+      <div className="px-4 sm:px-5 pt-4 pb-2">
+        <div className="grid grid-cols-2 gap-3">
           <button
-            onClick={() => setActiveMainTab('my_trips')}
-            className={`py-2.5 px-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
-              activeMainTab === 'my_trips'
-                ? 'bg-slate-900 text-white shadow-lg scale-[1.02]'
-                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
+            onClick={() => setActiveView(activeView === 'packages' ? 'trips' : 'packages')}
+            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all shadow-sm ${
+              activeView === 'packages' 
+                ? 'border-coral bg-coral/5 text-coral' 
+                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
             }`}
           >
-            <Map className="w-4 h-4" />
-            <span>{lang === 'mr' ? 'माझ्या सहली' : 'My Trips'}</span>
+             <Building2 className="w-6 h-6" />
+             <span className="font-bold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'हॉलिडे पॅकेजेस' : 'Holiday Packages'}</span>
           </button>
           <button
-            onClick={() => setActiveMainTab('holidays')}
-            className={`py-2.5 px-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
-              activeMainTab === 'holidays'
-                ? 'bg-coral text-white shadow-lg scale-[1.02]'
-                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
+            onClick={() => setActiveView(activeView === 'templates' ? 'trips' : 'templates')}
+            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all shadow-sm ${
+              activeView === 'templates' 
+                ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
+                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
             }`}
           >
-            <Globe className="w-4 h-4" />
-            <span>{lang === 'mr' ? 'हॉलिडेज' : 'Holidays'}</span>
+             <Share2 className="w-6 h-6" />
+             <span className="font-bold text-xs uppercase tracking-wider text-center">{lang === 'mr' ? 'सहल टेम्पलेट्स' : 'Trip Templates'}</span>
           </button>
         </div>
       </div>
 
-      <main className="flex-1 px-4 sm:px-5 pt-3 space-y-5">
-        {activeMainTab === 'my_trips' ? (
+      <main className="flex-1 px-4 sm:px-5 pt-2 space-y-5">
+        {activeView === 'trips' && (
           <>
@@ -526,35 +512,9 @@
           </div>
         )}
         </>
-        ) : (
-          <div className="space-y-4">
-            {/* Holidays Sub-Tabs */}
-            <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 shadow-inner border border-slate-200">
-              <button
-                onClick={() => setHolidayTab('agent_trips')}
-                className={`py-2 px-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
-                  holidayTab === 'agent_trips'
-                    ? 'bg-coral text-white shadow-lg'
-                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
-                }`}
-              >
-                <Building2 className="w-3.5 h-3.5" />
-                <span>{lang === 'mr' ? 'हॉलिडे पॅकेजेस' : 'Holiday Packages'}</span>
-              </button>
-              <button
-                onClick={() => setHolidayTab('shared_trips')}
-                className={`py-2 px-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
-                  holidayTab === 'shared_trips'
-                    ? 'bg-emerald-600 text-white shadow-lg'
-                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
-                }`}
-              >
-                <Share2 className="w-3.5 h-3.5" />
-                <span>{lang === 'mr' ? 'सहल टेम्पलेट्स' : 'Trip Templates'}</span>
-              </button>
-            </div>
-
-            {holidayTab === 'agent_trips' ? (
+        )}
+        
+        {activeView === 'packages' && (
               <ExplorePackagesView lang={lang} />
-            ) : (
+        )}
+        
+        {activeView === 'templates' && (
               <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-dashed border-slate-200">
@@ -564,9 +524,7 @@
                 </p>
               </div>
-            )}
-          </div>
         )}
       </main>
 
       {/* Floating Action Button (Only show on My Trips) */}
-      {activeMainTab === 'my_trips' && (
+      {activeView === 'trips' && (
       <div className="fixed bottom-[110px] right-[20px] flex flex-col gap-3 z-50">
INNER_EOF
patch src/components/views/TripListView.tsx < /tmp/trip_list.patch
