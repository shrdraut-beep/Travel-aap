cat << 'INNER_EOF' > /tmp/appshell.patch
--- src/components/layout/AppShell.tsx
+++ src/components/layout/AppShell.tsx
@@ -1,6 +1,6 @@
 import React from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
-import { LayoutDashboard, Receipt, Ticket, Camera, Compass, Siren, User, Settings, Navigation, PhoneCall, X, AlertTriangle, ShieldAlert, Share2, Music, Radio, Building2 } from 'lucide-react';
+import { LayoutDashboard, Receipt, Ticket, Camera, Compass, Siren, User, Settings, Navigation, PhoneCall, X, AlertTriangle, ShieldAlert, Share2, Music, Radio, Building2, ChevronLeft } from 'lucide-react';
 import { useAuthStore } from '../../store/useAuthStore';
 import { useLanguage } from '../../context/LanguageContext';
 import { QuirkyLanguageSelector } from '../QuirkyLanguageSelector';
@@ -100,6 +100,16 @@
       {/* Global Header */}
       <header className="sticky top-0 left-0 right-0 glass-effect border-b border-slate-200/60 px-3 py-2.5 flex items-center justify-between z-[60] shadow-sm shrink-0 bg-white/90 backdrop-blur-md gap-2">
         {/* Extreme Left: Pravas Wataghati App Logo */}
+        <div className="flex items-center gap-2">
+          {activeTab !== 'trips-list' && (
+            <button
+              onClick={() => onTabChange('trips-list')}
+              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors active:scale-95 shrink-0"
+            >
+              <ChevronLeft className="w-4 h-4" />
+              <span className="hidden sm:inline">{lang === 'mr' ? 'मागे' : 'Back'}</span>
+            </button>
+          )}
         <button
           type="button"
           onClick={() => {
@@ -125,6 +135,7 @@
             प्रवास वाटाघाटी
           </span>
         </button>
+        </div>
 
         {/* Center / Remaining Space: Continuous Seamless Travel Animation */}
         <div className="flex-1 overflow-hidden relative h-9 mx-1 flex items-center [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
INNER_EOF
cat /tmp/appshell.patch | patch -p0
