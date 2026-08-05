cat << 'INNER_EOF' > /tmp/appshell_back.patch
--- src/components/layout/AppShell.tsx
+++ src/components/layout/AppShell.tsx
@@ -101,14 +101,6 @@
       <header className="sticky top-0 left-0 right-0 glass-effect border-b border-slate-200/60 px-3 py-2.5 flex items-center justify-between z-[60] shadow-sm shrink-0 bg-white/90 backdrop-blur-md gap-2">
         {/* Extreme Left: Pravas Wataghati App Logo */}
         <div className="flex items-center gap-2">
-          {activeTab !== 'trips-list' && (
-            <button
-              onClick={() => onTabChange('trips-list')}
-              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors active:scale-95 shrink-0"
-            >
-              <ChevronLeft className="w-4 h-4" />
-              <span className="hidden sm:inline">{lang === 'mr' ? 'मागे' : 'Back'}</span>
-            </button>
-          )}
         <button
           type="button"
INNER_EOF
patch src/components/layout/AppShell.tsx < /tmp/appshell_back.patch
