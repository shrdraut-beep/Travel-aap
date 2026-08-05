cat << 'INNER_EOF' > /tmp/trips.patch
--- src/components/views/TripListView.tsx
+++ src/components/views/TripListView.tsx
@@ -204,6 +204,22 @@
 
   return (
     <div className="w-full flex flex-col pb-44 sm:pb-36">
+      {activeView !== 'trips' ? (
+        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
+          <button 
+            onClick={() => setActiveView('trips')}
+            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
+          >
+            <ChevronLeft className="w-4 h-4" />
+            <span>{lang === 'mr' ? 'मागे' : 'Back'}</span>
+          </button>
+          <h2 className="font-black text-slate-900 text-sm uppercase tracking-wide">
+            {activeView === 'packages' && (lang === 'mr' ? 'हॉलिडे पॅकेजेस' : 'Holiday Packages')}
+            {activeView === 'templates' && (lang === 'mr' ? 'सहल टेम्पलेट्स' : 'Trip Templates')}
+          </h2>
+          <div className="w-16" /> {/* Spacer for centering */}
+        </div>
+      ) : (
       <div className="px-4 sm:px-5 pt-4 pb-2">
         <div className="grid grid-cols-2 gap-3">
           <button
@@ -226,6 +242,7 @@
           </button>
         </div>
       </div>
+      )}
 
       <main className="flex-1 px-4 sm:px-5 pt-2 space-y-5">
         {activeView === 'trips' && (
INNER_EOF
cat /tmp/trips.patch | patch -p0
