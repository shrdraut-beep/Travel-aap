cat << 'INNER_EOF' > /tmp/header.patch
--- src/components/layout/AppShell.tsx
+++ src/components/layout/AppShell.tsx
@@ -140,75 +140,16 @@
         {/* Center / Remaining Space: Continuous Seamless Travel Animation */}
-        <div className="flex-1 overflow-hidden relative h-9 mx-1 flex items-center [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
-          <div className="animate-travel-marquee flex items-center gap-10">
-            {/* Travel Animation Group 1 */}
-            <div className="flex items-center gap-6 pr-10">
-              {/* Flying Airplane */}
-              <div className="flex items-center gap-1.5">
-                <span className="animate-plane text-xl sm:text-2xl leading-none">✈️</span>
-                <span className="text-[10px] font-black text-coral uppercase tracking-widest hidden md:inline">{lang === 'mr' ? 'विमान' : 'Flight'}</span>
-              </div>
-
-              {/* Ship */}
-              <div className="flex items-center gap-1.5">
-                <span className="animate-ship text-xl sm:text-2xl leading-none">🛳️</span>
-              </div>
-
-              {/* Driving Van with Smoke Trail */}
-              <div className="flex items-center gap-0.5">
-                <span className="text-sm animate-smoke inline-block -mr-1">💨</span>
-                <span className="animate-van text-xl sm:text-2xl leading-none">🚐</span>
-                <span className="text-[10px] font-black text-emerald uppercase tracking-widest hidden md:inline">{lang === 'mr' ? 'व्हॅन' : 'Roadtrip'}</span>
-              </div>
-
-              {/* Scooter */}
-              <div className="flex items-center gap-1.5">
-                <span className="animate-scooter text-xl sm:text-2xl leading-none">🛵</span>
-              </div>
-
-              {/* Moving Train */}
-              <div className="flex items-center gap-1.5">
-                <span className="animate-train text-xl sm:text-2xl leading-none">🚅</span>
-                <span className="text-[10px] font-black text-coral uppercase tracking-widest hidden md:inline">{lang === 'mr' ? 'ट्रेन' : 'Express'}</span>
-              </div>
-
-              <span className="text-lg sm:text-xl leading-none animate-float opacity-90" style={{ animationDelay: '0s' }}>🌴</span>
-              <span className="text-lg sm:text-xl leading-none animate-float opacity-90" style={{ animationDelay: '0.8s' }}>⛰️</span>
-              <span className="text-lg sm:text-xl leading-none animate-float opacity-90" style={{ animationDelay: '0.4s' }}>🏖️</span>
-            </div>
-
-            {/* Travel Animation Group 2 (Exact Duplicate for Seamless Infinite Motion) */}
-            <div className="flex items-center gap-6 pr-10">
-              {/* Flying Airplane */}
-              <div className="flex items-center gap-1.5">
-                <span className="animate-plane text-xl sm:text-2xl leading-none">✈️</span>
-                <span className="text-[10px] font-black text-coral uppercase tracking-widest hidden md:inline">{lang === 'mr' ? 'विमान' : 'Flight'}</span>
-              </div>
-
-              {/* Ship */}
-              <div className="flex items-center gap-1.5">
-                <span className="animate-ship text-xl sm:text-2xl leading-none">🛳️</span>
-              </div>
-
-              {/* Driving Van with Smoke Trail */}
-              <div className="flex items-center gap-0.5">
-                <span className="text-sm animate-smoke inline-block -mr-1">💨</span>
-                <span className="animate-van text-xl sm:text-2xl leading-none">🚐</span>
-                <span className="text-[10px] font-black text-emerald uppercase tracking-widest hidden md:inline">{lang === 'mr' ? 'व्हॅन' : 'Roadtrip'}</span>
-              </div>
-
-              {/* Scooter */}
-              <div className="flex items-center gap-1.5">
-                <span className="animate-scooter text-xl sm:text-2xl leading-none">🛵</span>
-              </div>
-
-              {/* Moving Train */}
-              <div className="flex items-center gap-1.5">
-                <span className="animate-train text-xl sm:text-2xl leading-none">🚅</span>
-                <span className="text-[10px] font-black text-coral uppercase tracking-widest hidden md:inline">{lang === 'mr' ? 'ट्रेन' : 'Express'}</span>
-              </div>
-
-              <span className="text-lg sm:text-xl leading-none animate-float opacity-90" style={{ animationDelay: '0s' }}>🌴</span>
-              <span className="text-lg sm:text-xl leading-none animate-float opacity-90" style={{ animationDelay: '0.8s' }}>⛰️</span>
-              <span className="text-lg sm:text-xl leading-none animate-float opacity-90" style={{ animationDelay: '0.4s' }}>🏖️</span>
-            </div>
-          </div>
+        <div className="flex-1 overflow-hidden relative h-9 mx-1 flex items-center justify-center">
+          {tripName ? (
+            <span className="font-black text-slate-900 text-sm md:text-base text-center whitespace-nowrap overflow-hidden text-ellipsis px-1 max-w-full">
+              {tripName}
+            </span>
+          ) : (
+            <span className="font-black text-slate-400 text-sm text-center">
+              {lang === 'mr' ? 'माझी सहल' : 'My Trip'}
+            </span>
+          )}
         </div>
INNER_EOF
cat /tmp/header.patch | patch -p0
