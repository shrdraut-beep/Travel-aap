import { safeStorage } from './utils/storage';
import { fetchLocationImage } from "./services/api/unsplash";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, CheckCircle, Info, Map as MapIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, sanitizeForFirestore, auth } from './firebase';
import { doc, onSnapshot, setDoc, deleteDoc, getDoc, collection, query, where, getDocs, getDocFromServer } from 'firebase/firestore';
import { getSyncQueue, removeFromSyncQueue, clearSyncQueue } from './offline';
import { calculateSettlements, CATEGORY_STYLES, getCurrencySymbol, getLanguageFullName, safeCopyToClipboard, formatDate, formatCurrency, getUniqueMembers } from './utils';
import { translations } from './translations';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AppShell } from './components/layout/AppShell';
import { OfflineBanner } from './components/OfflineBanner';
import { apiFetch, syncOfflineActions } from './utils/apiClient';
import html2canvas from 'html2canvas-pro';
import QRCode from 'qrcode';
import { SplashScreen } from './components/SplashScreen';
import { TripListView } from './components/views/TripListView';
import { DashboardView } from './components/views/DashboardView';
import { CommunityHubView } from './components/views/CommunityHubView';
import { TripRecap } from './components/TripRecap';
import { ExpensesView } from './components/views/ExpensesView';
import { ExpensesTabContainer } from './components/views/ExpensesTabContainer';
import { PlannerView } from './components/views/PlannerView';
import { BalancesView } from './components/views/BalancesView';
import { SettingsView } from './components/views/SettingsView';
import { BookingsView } from './components/views/BookingsView';
import { MemoriesView } from './components/views/MemoriesView';
import { ExtrasView } from './components/views/ExtrasView';
import { StoryExport } from './components/StoryExport';
import { FloatingAITripManager } from './components/FloatingAITripManager';
import { ModalsContainer } from './components/modals/ModalsContainer';
import { CreateTripModal } from './components/modals/CreateTripModal';
import { AddMemberModal } from './components/modals/AddMemberModal';
import { FutureTripModal } from './components/modals/FutureTripModal';

import { FuelCalculatorModal } from './components/modals/FuelCalculatorModal';
import { LanguageOnboardingModal } from './components/modals/LanguageOnboardingModal';
import { AuthModal } from './components/modals/AuthModal';
import { MusicSearchModal } from './components/modals/MusicSearchModal';
import { SmartPlanLoadingOverlay } from './components/SmartPlanLoadingOverlay';
import { WelcomeTourModal } from './components/modals/WelcomeTourModal';

import { LiveRadarModal } from './components/modals/LiveRadarModal';
import { initSecurityNotice } from './utils/security';
import { LoginScreen } from './components/views/LoginScreen';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { AgentPortalView } from './components/views/AgentPortalView';
import { useAuthStore } from './store/useAuthStore';
import { Expense, Deposit, TripPlan, Member, TripGroup, Category, DialogConfig, Poll, MemberLocation, PackingCategory, SOSAlert, PlaylistItem, TripMemory, PublicTripTemplate, TransportMode } from './types';
import { MusicPlayerProvider } from './components/MusicPlayerContext';
import { MusicPlayerBar } from './components/MusicPlayerBar';
import { 
  notifyEmergencySOS, 
  notifyExpenseAdded, 
  notifyTripSettled, 
  notifyMemberJoined, 
  notifyAIBriefing 
} from './utils/notifications';

const DEFAULT_TRIP: TripGroup = {
  id: "trip_default",
  name: "My Awesome Trip",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  members: [
    { id: "m1", name: "Me", color: "#3b82f6", totalDeposited: 0 }
  ],
  expenses: [],
  deposits: [],
  itinerary: [],
  tripType: "friends",
  calculationMode: "individual_split",
  logoUrl: "/logo.svg",
  wallpaperUrl: "/screenshot-desktop.png",
  status: 'ACTIVE'
};

import { ErrorBoundary } from './ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppContent />
        <OfflineBanner />
      </LanguageProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { language: lang, setLanguage: setLang } = useLanguage();
  const [newUpdateAvailable, setNewUpdateAvailable] = useState(false);
  const { currentUser, openAuthModal, initAuthListener } = useAuthStore();
  const [showAdminPreview, setShowAdminPreview] = useState(false);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);

  useEffect(() => {
    // Failsafe for unhandled promise rejections (like WebSocket errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reasonStr = typeof event.reason === 'string'
        ? event.reason
        : (event.reason?.message || event.reason?.reason || event.reason?.name || String(event.reason || ''));
      const reasonLower = reasonStr.toLowerCase();

      if (
        reasonLower.includes('websocket') ||
        reasonLower.includes('closed without opened') ||
        reasonLower.includes('closed before') ||
        reasonLower.includes('[vite]') ||
        reasonLower.includes('pending promise') ||
        reasonLower.includes('networkerror') ||
        reasonLower.includes('could not reach cloud firestore') ||
        reasonLower.includes('client is offline') ||
        reasonLower.includes('unavailable') ||
        reasonLower.includes('code=unavailable')
      ) {
        console.warn('Caught background connection notice:', event.reason);
        event.preventDefault(); // Prevent orange error banner
      }
    };
    const handleError = (event: ErrorEvent) => {
      const msgLower = (event.message || '').toLowerCase();
      if (
        msgLower.includes('[vite]') ||
        msgLower.includes('websocket') ||
        msgLower.includes('closed without opened') ||
        msgLower.includes('could not reach cloud firestore') ||
        msgLower.includes('client is offline') ||
        msgLower.includes('unavailable')
      ) {
        console.warn('Caught vite/websocket/firestore notice:', event.message);
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    // Connection Test with 1.2s timeout to prevent app hanging/white screen on slow network
    const testConnection = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection check timeout')), 1200)
        );
        await Promise.race([
          getDocFromServer(doc(db, 'test', 'connection')),
          timeoutPromise
        ]).catch(() => {
          // Silent fallback to local offline mode
        });
        console.log("Firebase Connection Checked");
      } catch (error: any) {
        console.warn("Firestore connection check bypassed:", error?.message || error);
      }
    };
    testConnection();

    initSecurityNotice();
    if (typeof window !== 'undefined') {
      const hasLanguageSelected = localStorage.getItem('pravas_language_selected') === 'true';
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial') === 'true';
      if (!hasLanguageSelected) {
        setShowLanguageOnboardingModal(true);
      } else if (!hasSeenTutorial) {
        setShowWelcomeTour(true);
      }
    }
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  useEffect(() => {
    const unsub = initAuthListener();
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('tripPlanner_activeTab') || "dashboard";
  });
  const [plannerTab, setPlannerTab] = useState<string>("itinerary");
  const [expensesInitialSubTab, setExpensesInitialSubTab] = useState<'expenses' | 'settlement'>('expenses');
  const [showCommunityHub, setShowCommunityHub] = useState(false);
  
  const [tripsList, setTripsList] = useState<TripGroup[]>(() => {
    const saved = localStorage.getItem('tripPlanner_trips');
    if (saved) {
      try {
        const parsed: TripGroup[] = JSON.parse(saved);
        const filtered = parsed.filter(t => t.id !== 'trip_demo_1' && t.id !== 'trip_demo_2');
        if (filtered.length > 0) return filtered;
      } catch (e) {
        console.error("Failed to parse trips from localStorage", e);
      }
    }
    return [];
  });

  const [activeTripId, setActiveTripId] = useState<string | null>(() => {
    const savedId = localStorage.getItem('tripPlanner_activeTripId');
    const savedTrips = localStorage.getItem('tripPlanner_trips');
    let validTrips: TripGroup[] = [];
    if (savedTrips) {
      try {
        const parsed: TripGroup[] = JSON.parse(savedTrips);
        const filtered = parsed.filter(t => t.id !== 'trip_demo_1' && t.id !== 'trip_demo_2');
        validTrips = filtered;
      } catch (e) {}
    }
    if (savedId && validTrips.some(t => t.id === savedId)) {
      return savedId;
    }
    return validTrips.length > 0 ? validTrips[0].id : null;
  });
  
  const [trip, setTrip] = useState<TripGroup>(() => {
    const savedId = localStorage.getItem('tripPlanner_activeTripId');
    const savedTrips = localStorage.getItem('tripPlanner_trips');
    if (savedTrips) {
      try {
        const parsed: TripGroup[] = JSON.parse(savedTrips);
        const filtered = parsed.filter(t => t.id !== 'trip_demo_1' && t.id !== 'trip_demo_2');
        if (filtered.length > 0) {
          if (savedId) {
            const found = filtered.find(t => t.id === savedId);
            if (found) return found;
          }
          return filtered[0];
        }
      } catch (e) {}
    }
    return null;
  });
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  // Offline-First Auto Sync & Loading
  useEffect(() => {
    // 1. Load from IndexedDB on startup to ensure we have the persistent offline data
    import('./offline').then(({ getTripsOffline }) => {
      getTripsOffline().then(offlineTrips => {
        if (offlineTrips && offlineTrips.length > 0) {
          setTripsList(offlineTrips);
          if (activeTripId) {
            const active = offlineTrips.find(t => t.id === activeTripId);
            if (active) setTrip(active);
          }
        }
      }).catch(err => {
        console.warn("Error reading offline trips:", err);
      });
    }).catch(err => {
      console.warn("Error importing offline module:", err);
    });

    // 2. Background Sync when Network Returns
    const handleOnlineSync = () => {
      console.log('Network is back online. Syncing local records...');
      import('./offline').then(async ({ getTripsOffline, saveTripOffline }) => {
        const trips = await getSyncQueue(); // Check sync queue first if we use one, otherwise trips store
        const allTrips = await getTripsOffline();
        for (const t of allTrips) {
          if (t.isSynced === false && (t.id.startsWith("SF-") || !!currentUser || !!t.userEmail)) {
            try {
              // Sync to Firestore
              await setDoc(doc(db, "trips", t.id), sanitizeForFirestore({ ...t, isSynced: true }));
              console.log(`Successfully synced trip ${t.id} to cloud`);
              
              // Update local state
              const syncedTrip = { ...t, isSynced: true };
              await saveTripOffline(syncedTrip);
              setTripsList(prev => prev.map(pt => pt.id === syncedTrip.id ? syncedTrip : pt));
              if (activeTripId === syncedTrip.id) setTrip(syncedTrip);
            } catch (err) {
              console.error(`Failed to background sync trip ${t.id}`, err);
              // Don't throw here, just continue with others
            }
          }
        }
      });
    };

    window.addEventListener('online', handleOnlineSync);
    return () => window.removeEventListener('online', handleOnlineSync);
  }, [activeTripId, db, setTrip, setTripsList]);

  // Cloud Sync: Automatically sync local trips & fetch user's trips from Firestore when logged in
  useEffect(() => {
    // Only subscribe to Firestore if we have a real Firebase Auth user matching our store's user
    // This prevents "Missing or insufficient permissions" warnings during initial load/guest mode
    if (!currentUser || !currentUser.email || !auth.currentUser) {
      return;
    }

    // Verify email match to ensure we are listening to the correct data
    if (auth.currentUser.email?.toLowerCase() !== currentUser.email.toLowerCase()) {
      return;
    }

    const cleanEmail = currentUser.email.toLowerCase();
    const cleanUid = currentUser.id;

    // 1. Ensure all local trips are assigned to this user and backed up to cloud
    const syncLocalToCloud = async () => {
      for (const t of tripsList) {
        if (!t.userEmail || t.userEmail !== cleanEmail) {
          const updatedWithUser = {
            ...t,
            userEmail: cleanEmail,
            userId: cleanUid,
            adminId: (!t.adminId || t.adminId === 'guest') ? cleanUid : t.adminId
          };
          try {
            await setDoc(doc(db, "trips", t.id), sanitizeForFirestore(updatedWithUser));
            console.log(`Synced local trip ${t.id} to account ${cleanEmail}`);
          } catch (e) {
            console.warn("Auto-backup local trip notice:", e);
          }
        }
      }
    };
    syncLocalToCloud();

    // 2. Real-time Firestore listener for user's trips
    const qEmail = query(collection(db, "trips"), where("userEmail", "==", cleanEmail));
    const unsubEmail = onSnapshot(qEmail, (snapshot) => {
      const serverTrips: TripGroup[] = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          serverTrips.push(docSnap.data() as TripGroup);
        }
      });

      if (serverTrips.length > 0) {
        setTripsList((prev) => {
          const map = new Map<string, TripGroup>();
          // Put server trips first
          serverTrips.forEach(t => map.set(t.id, t));
          // Keep any local unsaved trips if not in server
          prev.forEach(t => {
            if (!map.has(t.id)) {
              map.set(t.id, t);
            }
          });
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('tripPlanner_trips', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    }, (err) => {
      console.warn("Firestore userEmail listener notice:", err);
    });

    return () => {
      unsubEmail();
    };
  }, [currentUser?.email, currentUser?.id, auth.currentUser]);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Auto "Create Trip" popup disabled so first-time users land cleanly on Home/Hub screen
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tripCode, setTripCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [smartDepositPrompt, setSmartDepositPrompt] = useState<{
    isOpen: boolean;
    memberId: string;
    memberName: string;
    oldAmount: number;
    newAmount: number;
    note: string;
  } | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showFutureTripModal, setShowFutureTripModal] = useState(false);

  const [showFuelCalculatorModal, setShowFuelCalculatorModal] = useState(false);
  const [showLanguageOnboardingModal, setShowLanguageOnboardingModal] = useState(false);
  const [showLiveRadarModal, setShowLiveRadarModal] = useState(false);
  const [showMusicSearchModal, setShowMusicSearchModal] = useState(false);
  const [showTripRecap, setShowTripRecap] = useState(false);
  const [activeTripForRecap, setActiveTripForRecap] = useState<TripGroup | null>(null);
  const [aiPreFilledData, setAiPreFilledData] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const validAdminId = trip?.members?.find(m => m.id === trip?.adminId) ? (trip?.adminId || '') : (trip?.members?.[0]?.id || "");

  const showDialog = (config: Omit<DialogConfig, 'isOpen'>) => {
    setDialogConfig({ ...config, isOpen: true });
  };

  const closeDialog = () => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Service Worker auto-update detection and Toast trigger
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        // Check if there is already an updated service worker waiting
        if (reg.waiting) {
          setNewUpdateAvailable(true);
        }

        // Listen for new service worker installs
        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update loaded and waiting to be activated
                setNewUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  // Synchronize active trip's alert status to Service Worker's cache storage
  useEffect(() => {
    if (!trip) return;
    const updateAlertsCacheOnLoad = async () => {
      if ('caches' in window) {
        try {
          const cache = await caches.open('pravas-wataghati-v6');
          const isSettled = trip?.status === 'SETTLED';
          const response = new Response(JSON.stringify({ 
            alerts_enabled: !isSettled, 
            tripStatus: trip?.status 
          }));
          await cache.put('/alerts_enabled.json', response);
          localStorage.setItem('alerts_enabled', isSettled ? 'false' : 'true');
        } catch (err) {
          console.error('Error auto-syncing alerts cache:', err);
        }
      }
    };
    updateAlertsCacheOnLoad();
  }, [trip?.id, trip?.status]);

  // Failsafe client-side version check on load
  useEffect(() => {
    const checkAppVersion = async () => {
      try {
        // Cache bust the version fetch itself
        const res = await fetch(`/version.json?t=${Date.now()}`);
        if (!res.ok) return;
        const text = await res.text();
        if (!text || text.trim().startsWith('<')) return; // ignore HTML responses (e.g. offline/fallback)
        const serverVer = JSON.parse(text);
        
        if (serverVer && serverVer.timestamp) {
          const localVerStr = localStorage.getItem('app_version_timestamp');
          const localTimestamp = localVerStr ? parseInt(localVerStr, 10) : null;

          if (localTimestamp && serverVer.timestamp > localTimestamp) {
            if (sessionStorage.getItem('has_reloaded_for_version') === 'true') {
              console.warn("Already reloaded for version in this session, skipping to prevent infinite loop.");
              return;
            }
            sessionStorage.setItem('has_reloaded_for_version', 'true');
            localStorage.setItem('app_version_timestamp', serverVer.timestamp.toString());

            console.log(`Failsafe: New version detected (${serverVer.version}). Clearing caches & reloading.`);
            
            // Clear Cache Storage safely
            if ('caches' in window) {
              try {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
              } catch (e) {}
            }
            
            // Reload page to get new assets immediately
            window.location.reload();
          } else if (!localTimestamp) {
            // First time loading, record timestamp
            localStorage.setItem('app_version_timestamp', serverVer.timestamp.toString());
          }
        }
      } catch (err) {
        console.warn("Failsafe version check warning:", err);
      }
    };

    checkAppVersion();
  }, []);

  // Track previous language to trigger re-fetch only when user switches language
  const prevLangRef = React.useRef(lang);

  // Automatically re-fetch or re-translate itinerary data whenever the user switches the app language
  useEffect(() => {
    if (prevLangRef.current === lang) return;
    prevLangRef.current = lang;

    if (!trip || !trip.id) return;

    // Check if trip has Smart itinerary items or aiPlan
    const hasAiItinerary = (trip.itinerary && trip.itinerary.some(p => p.id.startsWith('plan_ai_'))) || trip.aiPlan;
    if (hasAiItinerary) {
      const currentLanguageName = getLanguageFullName(lang);
      
      const reFetchItineraryInNewLanguage = async () => {
        try {
          setIsSmartGenerating(true);
          const response = await fetch("/api/generate-itinerary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tripName: trip?.name,
              startDate: trip.startDate,
              endDate: trip.endDate,
              members: trip?.members?.map((m) => m.name),
              lang: lang,
              promptInstruction: `Generate itinerary in ${currentLanguageName}`
            })
          });
          const result = await response.json();
          if (result.success && result.text) {
            let parsedPlan: any = null;
            try {
              parsedPlan = JSON.parse(result.text);
            } catch (err) {
              console.error("Failed to parse regenerated itinerary JSON", err);
            }

            if (parsedPlan && parsedPlan.itinerary) {
              const isMr = currentLanguageName === 'Marathi';
              const regeneratedPlans: TripPlan[] = parsedPlan.itinerary.map((dayItem: any, index: number) => {
                const planDate = new Date(trip.startDate);
                planDate.setDate(planDate.getDate() + index);
                const dateStr = planDate.toISOString().split("T")[0];

                let detailText = '';
                if (dayItem.activities && Array.isArray(dayItem.activities)) {
                  dayItem.activities.forEach((act: any) => {
                    const actTime = act.timeOfDay ? act.timeOfDay.toLowerCase() : '';
                    const emoji = actTime.includes('morning') ? '🌅' : actTime.includes('afternoon') ? '☀️' : '🌇';
                    detailText += `### ${emoji} ${act.timeOfDay}\n**${act.activityName}**\n${act.exactLocation}\n*Estimated Cost: ${act.realisticCost}*\n\n`;
                  });
                } else {
                  detailText = dayItem.practical_activities ? `${dayItem.practical_activities}\n\n` : '';
                  if (dayItem.morning || dayItem.afternoon || dayItem.evening) {
                    detailText += `### 🌅 Morning\n${dayItem.morning || ''}\n\n### ☀️ Afternoon\n${dayItem.afternoon || ''}\n\n### 🌇 Evening\n${dayItem.evening || ''}\n\n`;
                  }
                }

                if (dayItem.daily_budget_breakdown) {
                  detailText += `**💰 ${isMr ? 'दैनिक खर्च अंदाज' : 'Daily Budget Breakdown'}:** ${dayItem.daily_budget_breakdown}\n\n`;
                }
                const tips = dayItem.local_pro_tips || dayItem.daily_local_travel_tips || '';
                if (tips) {
                  detailText += `**💡 ${isMr ? 'स्थानिक टिप्स' : 'Local Pro Tips'}:** ${tips}`;
                }

                return {
                  id: `plan_ai_day_${dayItem.day || index + 1}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
                  type: 'activity' as const,
                  title: `${isMr ? 'दिवस' : 'Day'} ${dayItem.day || index + 1}: ${parsedPlan.trip_title || trip?.name}`,
                  detail: detailText,
                  datetime: `${dateStr}T09:00:00`
                };
              });

              // Keep non-Smart custom plans created manually by user
              const customUserPlans = trip.itinerary.filter(p => !p.id.startsWith("plan_ai_"));

              updateTripState({
                ...trip,
                aiPlan: result.text,
                itinerary: [...regeneratedPlans, ...customUserPlans]
              });

              triggerToast(
                lang === 'mr' ? 'नवीन भाषेत (मराठी) सहलीचे नियोजन अपडेट झाले!' :
                lang === 'hi' ? 'नयी भाषा में (हिंदी) यात्रा योजना अपडेट हो गयी!' :
                `Itinerary re-translated in ${currentLanguageName}!`,
                'success'
              );
            }
          }
        } catch (e) {
          console.error("Error re-translating itinerary on language switch:", e);
        } finally {
          setIsSmartGenerating(false);
        }
      };

      reFetchItineraryInNewLanguage();
    }
  }, [lang, trip?.id]);

  // Global callback for Smart trip conversion
  React.useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      triggerToast(lang === 'mr' ? 'तुम्ही पुन्हा ऑनलाइन आहात! सिंक सुरू आहे...' : 'You are back online! Syncing...', 'success');
      
      // Process manual sync queue and offline action queue
      setIsSyncing(true);
      try {
        await syncOfflineActions();
        const queue = await getSyncQueue();
        if (queue.length === 0) {
          triggerToast(lang === 'mr' ? 'सर्व बदल सिंक झाले आहेत!' : 'All changes have been synced!', 'success');
        } else {
          // If there are still items, some requests might be failing permanently, clear them so they don't block
          await clearSyncQueue();
        }
      } catch (err) {
        console.error("Sync failed", err);
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      triggerToast(lang === 'mr' ? 'तुम्ही ऑफलाइन आहात. बदल सेव्ह होतील आणि नंतर सिंक होतील.' : 'You are offline. Changes will be saved locally and synced later.', 'alert');
    };

    const handleOpenDepositModalEvent = () => {
      setShowDepositModal(true);
    };

  }, [lang]);

  React.useEffect(() => {
    (window as any).setShowFutureTripModal = setShowFutureTripModal;
    const convertHandler = async (data: any) => {
      // Calculate end date based on days
      let endDate = "";
      if (data.startDate && data.days) {
        const d = new Date(data.startDate);
        d.setDate(d.getDate() + (Number(data.days) - 1));
        endDate = d.toISOString().split("T")[0];
      }

      // Parse Smart Plan into day-wise itinerary items
      let generatedItinerary: TripPlan[] = [];
      if (data.aiPlan) {
        try {
          const parsed = typeof data.aiPlan === 'string' ? JSON.parse(data.aiPlan) : data.aiPlan;
          const rawItinerary = parsed.itinerary || parsed.dayPlans || parsed.days || [];
          if (Array.isArray(rawItinerary) && rawItinerary.length > 0) {
            const langName = getLanguageFullName(lang);
            generatedItinerary = rawItinerary.map((dayItem: any, index: number) => {
              const planDate = new Date(data.startDate || new Date());
              planDate.setDate(planDate.getDate() + index);
              const dateStr = planDate.toISOString().split("T")[0];

              const dayNum = dayItem.day || index + 1;
              const dayTitle = dayItem.day_title || dayItem.title || `${langName === 'Marathi' ? 'दिवस' : 'Day'} ${dayNum}`;
              const morning = dayItem.morning_9am_to_12pm || dayItem.morning || '';
              const afternoon = dayItem.afternoon_12pm_to_4pm || dayItem.afternoon || '';
              const evening = dayItem.evening_4pm_to_9pm || dayItem.evening || '';
              const stay = dayItem.stay || '';
              const tips = dayItem.daily_local_travel_tips || dayItem.local_pro_tips || '';

              let detailText = '';
              if (morning || afternoon || evening) {
                if (morning) detailText += `### 🌅 ${langName === 'Marathi' ? 'सकाळ (०८:३० AM - १२:०० PM)' : 'Morning (08:30 AM - 12:00 PM)'}\n${morning}\n\n`;
                if (afternoon) detailText += `### ☀️ ${langName === 'Marathi' ? 'दुपार (१२:३० PM - ०४:३० PM)' : 'Afternoon (12:30 PM - 04:30 PM)'}\n${afternoon}\n\n`;
                if (evening) detailText += `### 🌇 ${langName === 'Marathi' ? 'संध्याकाळ (०५:०० PM - ०९:०० PM)' : 'Evening (05:00 PM - 09:00 PM)'}\n${evening}\n\n`;
              } else if (dayItem.details) {
                detailText += `${dayItem.details}\n\n`;
              } else if (dayItem.activities && Array.isArray(dayItem.activities)) {
                dayItem.activities.forEach((act: any) => {
                  const actTime = act.timeOfDay ? act.timeOfDay.toLowerCase() : '';
                  const emoji = actTime.includes('morning') ? '🌅' : actTime.includes('afternoon') ? '☀️' : '🌇';
                  detailText += `### ${emoji} ${act.timeOfDay}\n**${act.activityName}**\n${act.exactLocation}\n*Estimated Cost: ${act.realisticCost}*\n\n`;
                });
              }

              if (stay) {
                detailText += `**🏨 ${langName === 'Marathi' ? 'मुक्काम / हॉटेल' : 'Stay / Hotel'}:** ${stay}\n\n`;
              }

              if (tips) {
                detailText += `**💡 ${langName === 'Marathi' ? 'स्थानिक टिप्स' : 'Local Travel Tips'}:** ${tips}`;
              }

              return {
                id: `plan_ai_day_${dayNum}_${Date.now()}_${index}`,
                type: 'activity' as const,
                title: dayTitle,
                detail: detailText.trim(),
                datetime: `${dateStr}T09:00:00`
              };
            });
          }
        } catch (e) {
          console.error("Failed to parse aiPlan into itinerary", e);
        }
      }

      // Calculate category-wise estimated budget breakdown across ALL 11 categories
      const totalB = Number(data.budget) || 10000;
      const budgetBreakdown: Record<string, number> = {
        food: Math.round(totalB * 0.20),
        fuel: Math.round(totalB * 0.12),
        traveling: Math.round(totalB * 0.18),
        transport: Math.round(totalB * 0.08),
        hotels: Math.round(totalB * 0.22),
        fun: Math.round(totalB * 0.08),
        highway: Math.round(totalB * 0.02),
        restaurant: Math.round(totalB * 0.04),
        tips: Math.round(totalB * 0.01),
        personal: Math.round(totalB * 0.03),
        other: Math.round(totalB * 0.02),
      };

      const unsplashImg = await fetchLocationImage(data.name);
      const wallpaperUrl = unsplashImg?.url || undefined;
      const logoUrl = unsplashImg?.thumb || undefined;

      const newTrip: TripGroup = {
        ...DEFAULT_TRIP,
        id: "trip_" + Date.now(),
        name: data.name,
        userEmail: currentUser?.email?.toLowerCase(),
        userId: currentUser?.id,
        startDate: data.startDate || new Date().toISOString().split("T")[0],
        endDate: endDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        totalBudget: totalB,
        budget: budgetBreakdown,
        transportMode: data.transportMode,
        wallpaperUrl,
        logoUrl,
        aiPlan: typeof data.aiPlan === 'string' ? data.aiPlan : JSON.stringify(data.aiPlan),
        itinerary: generatedItinerary.length > 0 ? generatedItinerary : DEFAULT_TRIP.itinerary,
        members: [{ id: currentUser?.id || "guest", name: currentUser?.name || "Admin", color: "#3b82f6", totalDeposited: 0 }],
        adminId: currentUser?.id || "guest",
        calculationMode: "individual_split"
      };

      await updateTripState(newTrip);
      setActiveTripId(newTrip.id);
      setActiveTab("dashboard");
      
      triggerToast(lang === 'mr' ? 'नवीन सहल यशस्वीरित्या तयार केली गेली!' : 'New trip created successfully!');
    };

    (window as any).onConvertSmartTrip = convertHandler;
    (window as any).onConvertAITrip = convertHandler;

    return () => { 
      try { 
        delete (window as any).onConvertSmartTrip; 
        delete (window as any).onConvertAITrip;
        delete (window as any).setShowFutureTripModal;
      } catch(e){} 
    };
  }, [lang, currentUser]);
  
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<Category>("food");
  const [customCategoryName, setCustomCategoryName] = useState<string>("");
  const [expensePaidBy, setExpensePaidBy] = useState("");
  const [expenseSplitWith, setExpenseSplitWith] = useState<string[]>([]);
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expenseStageId, setExpenseStageId] = useState("");
  const [expenseReceiptImage, setExpenseReceiptImage] = useState<string | undefined>(undefined);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);

  const modalInitialData = React.useMemo(() => {
    if (editingTripId) {
      const et = tripsList.find(t => t.id === editingTripId);
      if (!et) return undefined;
      return {
        name: et.name,
        startDate: et.startDate,
        endDate: et.endDate,
        members: et.members.map(m => ({
          name: m.name, 
          deposit: '', 
          upiId: m.upiId,
          isAdmin: et.adminId === m.id
        }))
      };
    }
    return aiPreFilledData || undefined;
  }, [editingTripId, tripsList, aiPreFilledData]);
  
  const [depositMemberId, setDepositMemberId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");
  
  const [planType, setPlanType] = useState<any>("ticket");
  const [planTitle, setPlanTitle] = useState("");
  const [planDetail, setPlanDetail] = useState("");
  const [planDatetime, setPlanDatetime] = useState("");
  const [planCost, setPlanCost] = useState("");
  const [planBookingRef, setPlanBookingRef] = useState("");
  const [planModalTab, setPlanModalTab] = useState<any>("manual");
  const [bookingText, setBookingText] = useState("");
  const [isParsingBooking, setIsParsingBooking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAIGenerating, setIsSmartGenerating] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<any[]>([]);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);

  const t = (key: string) => (translations as any)[lang]?.[key] || (translations as any)['mr']?.[key] || (translations as any)['en']?.[key] || key;
  const currencySymbol = React.useMemo(() => {
    return getCurrencySymbol(trip?.defaultCurrency || 'INR');
  }, [trip?.defaultCurrency]);

  const triggerToast = (message: string, type: 'success' | 'alert' = 'success') => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  useEffect(() => {
    try {
      localStorage.setItem('tripPlanner_trips', JSON.stringify(tripsList));
    } catch (e) {
      console.error("Local storage quota exceeded or failed:", e);
      triggerToast(lang === 'mr' ? "स्टोरेज फुल झाले आहे, काही जुने फोटो डिलीट करा" : "Storage full! Data may not save. Delete some receipt images.", "alert");
    }
  }, [tripsList]);

  useEffect(() => {
    localStorage.setItem('tripPlanner_activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (activeTripId) {
      localStorage.setItem('tripPlanner_activeTripId', activeTripId);
    } else {
      localStorage.removeItem('tripPlanner_activeTripId');
    }
  }, [activeTripId]);

  useEffect(() => {
    if (activeTripId?.startsWith("SF-")) {
      const unsub = onSnapshot(doc(db, "trips", activeTripId), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as TripGroup;
          setTrip(data);
          setTripsList((prev) => prev.map((t2) => t2.id === data.id ? data : t2));
        } else {
          // If the trip doesn't exist on the server (e.g. deleted or invalid code)
          console.warn(`Trip ${activeTripId} not found on server.`);
          const localTrip = tripsList.find(t => t.id === activeTripId);
          if (localTrip) {
            setTrip(localTrip); // Fallback to local copy if available
          } else {
            setActiveTripId(null); // Return to dashboard
          }
        }
      }, (err) => {
        console.warn(`Firestore trip listener notice for ${activeTripId}:`, err);
        const localTrip = tripsList.find(t => t.id === activeTripId);
        if (localTrip) {
          setTrip(localTrip);
        } else {
          setActiveTripId(null);
          setTrip(null);
        }
      });
      return () => unsub();
    } else if (activeTripId) {
      const localTrip = tripsList.find(t => t.id === activeTripId);
      if (localTrip) setTrip(localTrip);
    }
  }, [activeTripId]);

  // Resolve active trip from local tripsList immediately
  useEffect(() => {
    if (activeTripId) {
      const localTrip = tripsList.find(t => t.id === activeTripId);
      if (localTrip) {
        setTrip(localTrip);
      } else if (!activeTripId.startsWith("SF-")) {
        if (tripsList.length > 0) {
          setActiveTripId(tripsList[0].id);
          setTrip(tripsList[0]);
        } else {
          setActiveTripId(null);
          setTrip(null);
        }
      }
    }
  }, [activeTripId, tripsList]);

  // Fast fallback timeout: if activeTripId is set but trip remains null for > 1.8s, fall back cleanly to Trips List
  useEffect(() => {
    if (activeTripId && !trip) {
      const timer = setTimeout(() => {
        console.warn(`Trip loading timed out for activeTripId=${activeTripId}, falling back.`);
        const fallback = tripsList.find(t => t.id === activeTripId) || (tripsList.length > 0 ? tripsList[0] : null);
        if (fallback) {
          setActiveTripId(fallback.id);
          setTrip(fallback);
        } else {
          setActiveTripId(null);
          setTrip(null);
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [activeTripId, trip, tripsList]);

  const updateTripState = async (tripToUpdate: TripGroup) => {
    let newTrip = { ...tripToUpdate };
    if (currentUser?.email) {
      newTrip.userEmail = newTrip.userEmail || currentUser.email.toLowerCase();
      newTrip.userId = newTrip.userId || currentUser.id;
      if (!newTrip.adminId || newTrip.adminId === 'guest') {
        newTrip.adminId = currentUser.id;
      }
    }

    const isShared = newTrip.id.startsWith("SF-");
    const shouldSaveToCloud = isShared || !!currentUser || !!newTrip.userEmail;

    if (shouldSaveToCloud && typeof navigator !== 'undefined' && !navigator.onLine) {
      newTrip = { ...newTrip, isSynced: false };
    }

    setTrip(newTrip);
    setTripsList((prev) => {
      const exists = prev.some(t => t.id === newTrip.id);
      const updated = exists
        ? prev.map((t2) => (t2.id === newTrip.id ? newTrip : t2))
        : [...prev, newTrip];
      try {
        localStorage.setItem('tripPlanner_trips', JSON.stringify(updated));
      } catch (e) {
        console.error("Local storage update notice:", e);
      }
      return updated;
    });

    // Save to IndexedDB for robust offline persistence
    try {
      import('./offline').then(({ saveTripOffline }) => {
        saveTripOffline(newTrip).catch(console.error);
      });
    } catch (err) {
      console.error('Failed to save to IndexedDB', err);
    }

    if (shouldSaveToCloud) {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          // Robust write with direct await
          await setDoc(doc(db, "trips", newTrip.id), sanitizeForFirestore(newTrip));
          console.log(`Cloud sync success for trip: ${newTrip.id}`);
          
          if (newTrip.isSynced === false) {
             const syncedTrip = { ...newTrip, isSynced: true };
             setTrip(syncedTrip);
             setTripsList((prev) => prev.map((t2) => (t2.id === syncedTrip.id ? syncedTrip : t2)));
             import('./offline').then(({ saveTripOffline }) => saveTripOffline(syncedTrip));
          }
        } catch (e: any) {
          console.error("Firestore sync error:", e);
          // If it's a permission error, it might be the rules
          if (e.message?.includes('permissions')) {
             triggerToast("Sync failed: Check your permissions or login again.", "alert");
          } else {
             triggerToast("Cloud sync failed! Data saved locally.", "alert");
          }
        }
      } else {
        triggerToast("Offline Mode. Data saved locally.", "success");
      }
    }
  };

  const handleCloneTemplate = async (template: PublicTripTemplate) => {
    try {
      const newTrip: TripGroup = {
        ...DEFAULT_TRIP,
        id: "trip_" + Date.now(),
        name: template.name,
        userEmail: currentUser?.email?.toLowerCase(),
        userId: currentUser?.id,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + template.days * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        totalBudget: 0,
        itinerary: template.itinerary,
        transportMode: template.transportMode,
        members: [{ id: currentUser?.id || "guest", name: currentUser?.name || "Admin", color: "#3b82f6", totalDeposited: 0 }],
        adminId: currentUser?.id || "guest",
      };

      await updateTripState(newTrip);

      // Notify server about cloning
      await fetch('/api/clone-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id })
      });

      setActiveTripId(newTrip.id);
      setTrip(newTrip);
      setActiveTab("dashboard");
      triggerToast(lang === 'mr' ? 'सहल यशस्वीरित्या क्लोन झाली!' : 'Trip successfully cloned!');
    } catch (err) {
      console.error(err);
      triggerToast("Failed to clone trip", "alert");
    }
  };

  const handlePublishTrip = async () => {
    if (!trip) return;
    try {
      const templateData = {
        name: trip?.name,
        description: `${lang === 'mr' ? 'एक अप्रतिम सहल' : 'An amazing trip'} with ${trip?.members.length} members.`,
        days: Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1,
        transportMode: trip.transportMode || 'road',
        itinerary: trip.itinerary || [],
        tags: [trip.transportMode || 'road', 'public'],
        authorName: currentUser?.name || "Anonymous",
        authorId: currentUser?.id || "guest",
      };

      const res = await fetch('/api/publish-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: templateData })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(lang === 'mr' ? 'सहल सार्वजनिक केली गेली!' : 'Trip published publicly!');
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to publish trip", "alert");
    }
  };

  const handleVote = (pollId: string, optionId: string) => {
    const userId = currentUser?.id || "guest";
    const updatedPolls = (trip.polls || []).map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          options: poll.options.map(opt => {
            // Remove user from all other options in this poll
            const filteredVotes = opt.votes.filter(v => v !== userId);
            // Add user to the selected option
            if (opt.id === optionId) {
              return { ...opt, votes: [...filteredVotes, userId] };
            }
            return { ...opt, votes: filteredVotes };
          })
        };
      }
      return poll;
    });
    updateTripState({ ...trip, polls: updatedPolls });
  };

  const handleCreatePoll = (question: string, options: string[]) => {
    const newPoll: Poll = {
      id: "poll_" + Date.now(),
      question,
      options: options.map((opt, i) => ({ id: "opt_" + i + "_" + Date.now(), text: opt, votes: [] })),
      createdBy: currentUser?.id || "guest",
      createdAt: new Date().toISOString(),
      isOpen: true
    };
    updateTripState({ ...trip, polls: [...(trip.polls || []), newPoll] });
    triggerToast(lang === 'mr' ? 'पोल सुरू झाला!' : 'Poll started!', 'success');
  };

  const handleClosePoll = (pollId: string) => {
    const updatedPolls = (trip.polls || []).map(p => p.id === pollId ? { ...p, isOpen: false } : p);
    updateTripState({ ...trip, polls: updatedPolls });
  };

  const handleToggleLocationShare = (sharing: boolean) => {
    setIsSharingLocation(sharing);
    if (!sharing && trip.memberLocations) {
      const updated = trip.memberLocations.map(loc => 
        loc.memberId === (currentUser?.id || "guest") ? { ...loc, isSharing: false } : loc
      );
      updateTripState({ ...trip, memberLocations: updated });
    }
  };

  useEffect(() => {
    if (!isSharingLocation) return;

    let watchId: number;
    const updateLocation = (pos: GeolocationPosition) => {
      const userId = currentUser?.id || "guest";
      const newLoc: MemberLocation = {
        memberId: userId,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        lastUpdated: new Date().toISOString(),
        isSharing: true
      };

      const existingLocations = trip.memberLocations || [];
      const updated = existingLocations.find(l => l.memberId === userId)
        ? existingLocations.map(l => l.memberId === userId ? newLoc : l)
        : [...existingLocations, newLoc];

      updateTripState({ ...trip, memberLocations: updated });
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(updateLocation, (err) => {
        setIsSharingLocation(false);
      }, { enableHighAccuracy: true });
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSharingLocation, currentUser]);

  const handleSOS = async (lat: number, lng: number) => {
    if (!trip) return;
    const senderName = currentUser?.name || trip?.members.find(m => m.id === validAdminId)?.name || 'सहकारी (Member)';
    
    // Trigger PWA Push Notification + Audio Siren Alarm + Vibration
    notifyEmergencySOS(senderName, lang);

    const newAlert: SOSAlert = {
      id: "sos_" + Date.now(),
      memberId: currentUser?.id || "guest",
      memberName: senderName,
      lat,
      lng,
      timestamp: new Date().toISOString(),
      isResolved: false
    };

    const updatedAlerts = [newAlert, ...(trip.sosAlerts || [])];
    updateTripState({ ...trip, sosAlerts: updatedAlerts });
    triggerToast(lang === 'mr' ? '🚨 आणीबाणी (SOS) अलर्ट पाठवला!' : '🚨 Emergency SOS Alert Sent!', 'alert');
  };

  const handleAddMembersToTrip = (newMembers: Omit<Member, 'totalDeposited'>[]) => {
    if (!trip) return;
    const formattedMembers: Member[] = newMembers.map(m => ({
      ...m,
      totalDeposited: 0
    }));

    const updatedMembers = getUniqueMembers([...(trip?.members || []), ...formattedMembers]);
    updateTripState({ ...trip, members: updatedMembers });

    // Send push notification for each new member
    formattedMembers.forEach(m => {
      notifyMemberJoined(m.name, trip?.name, lang);
    });

    triggerToast(
      lang === 'mr' 
        ? `${formattedMembers.length} नवीन सोबती सहलीमध्ये जोडले!` 
        : `${formattedMembers.length} member(s) added to trip!`
    );
  };

  const handleAddPlaylistItem = (title: string, url: string, artist?: string, thumbnailUrl?: string) => {
    if (!trip) return;
    if (!currentUser) {
      openAuthModal(() => handleAddPlaylistItem(title, url, artist, thumbnailUrl));
      return;
    }
    const newItem: PlaylistItem = {
      id: "pl_" + Date.now(),
      title,
      url,
      addedBy: currentUser.id,
      timestamp: new Date().toISOString(),
      artist,
      thumbnailUrl
    };
    const updatedPlaylist = [newItem, ...(trip.playlist || [])];
    updateTripState({ ...trip, playlist: updatedPlaylist });
    triggerToast(lang === 'mr' ? 'प्लेलिस्ट मध्ये जोडले!' : 'Added to playlist!', 'success');
  };

  const handleRemovePlaylistItem = (id: string) => {
    if (!trip) return;
    const updatedPlaylist = (trip.playlist || []).filter(item => item.id !== id);
    updateTripState({ ...trip, playlist: updatedPlaylist });
  };

  const handleAddGalleryItem = (imageUrl: string) => {
    if (!trip) return;
    const newItem: TripMemory = {
      id: "gal_" + Date.now(),
      imageUrl,
      timestamp: new Date().toISOString()
    };
    const updatedGallery = [newItem, ...(trip.gallery || [])];
    updateTripState({ ...trip, gallery: updatedGallery });
    triggerToast(lang === 'mr' ? 'फोटो जोडला!' : 'Photo added!', 'success');
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount || !expensePaidBy) {
      triggerToast(t("pleaseFillAll"), "alert");
      return;
    }

    const cleanAmount = expenseAmount.trim();
    // Strict validation: Allow only positive or zero floating point numbers (no negative sign, no letters, no special characters other than single dot)
    if (!/^\d+(\.\d+)?$/.test(cleanAmount)) {
      triggerToast(lang === 'mr' ? 'कृपया वैध संख्या टाका (फक्त अंक आणि दशांश चिन्ह)' : 'Please enter a valid number (digits and decimal only)', 'alert');
      return;
    }
    const parsedAmount = parseFloat(cleanAmount);
    if (isNaN(parsedAmount)) {
      triggerToast(lang === 'mr' ? 'कृपया वैध रक्कम टाका' : 'Please enter a valid amount', 'alert');
      return;
    }

    const proceedWithExpense = () => {
      // Protection for shared trips editing
      if (editingExpenseId && trip.id.startsWith('SF-')) {
        showDialog({
          type: 'prompt',
          title: lang === 'mr' ? 'पासवर्ड टाका' : 'Enter Passcode',
          message: lang === 'mr' ? 'बदल करण्यासाठी पासवर्ड टाका:' : 'Enter passcode to save changes:',
          onConfirm: (enteredPasscode) => {
            if (enteredPasscode === trip.passcode) {
              this_submitExpense();
            } else {
              triggerToast(lang === 'mr' ? 'चुकीचा पासवर्ड!' : 'Incorrect passcode!', 'alert');
            }
            closeDialog();
          },
          onCancel: closeDialog
        });
        return;
      }
      this_submitExpense();
    };

    if (parsedAmount === 0) {
      showDialog({
        type: 'confirm',
        title: lang === 'mr' ? 'शून्य रक्कम' : 'Zero Amount',
        message: lang === 'mr' ? 'तुम्हाला नक्की ० रक्कमेचा खर्च जतन करायचा आहे का?' : 'Are you sure you want to save an expense of 0?',
        onConfirm: () => {
          closeDialog();
          proceedWithExpense();
        },
        onCancel: closeDialog
      });
      return;
    }

    proceedWithExpense();
  };

  const this_submitExpense = () => {
    const finalCategory = (expenseCategory === 'other' && customCategoryName.trim()) 
      ? (customCategoryName.trim() as Category) 
      : expenseCategory;

    if (editingExpenseId) {
      const updatedExpenses = trip.expenses.map(
        (exp) => exp.id === editingExpenseId ? {
          ...exp,
          title: expenseTitle,
          amount: parseFloat(expenseAmount),
          date: expenseDate,
          category: finalCategory,
          paidBy: expensePaidBy,
          splitWith: expenseSplitWith.length > 0 ? expenseSplitWith : trip?.members?.map((m) => m.id),
          stageId: expenseStageId || undefined,
          receiptImage: expenseReceiptImage
        } : exp
      );
      updateTripState({ ...trip, expenses: updatedExpenses });
      setEditingExpenseId(null);
      setExpenseReceiptImage(undefined);
      setCustomCategoryName("");
      triggerToast(lang === "mr" ? "खर्च अपडेट झाला" : "Expense updated", "success");
    } else {
      const newExp: Expense = {
        id: "exp_" + Date.now(),
        title: expenseTitle,
        amount: parseFloat(expenseAmount),
        date: expenseDate,
        category: finalCategory,
        paidBy: expensePaidBy,
        splitWith: expenseSplitWith.length > 0 ? expenseSplitWith : trip?.members?.map((m) => m.id),
        stageId: expenseStageId || undefined,
        receiptImage: expenseReceiptImage
      };
      const finalExpenses = [newExp, ...trip.expenses];
      updateTripState({ ...trip, expenses: finalExpenses });
      setExpenseReceiptImage(undefined);
      setCustomCategoryName("");

      // Trigger push notification for expense added
      const paidMember = trip?.members.find(m => m.id === expensePaidBy);
      notifyExpenseAdded(paidMember?.name || 'Member', newExp.amount, newExp.title, currencySymbol, lang);

      triggerToast(lang === "mr" ? "खर्च जोडला गेला" : "Expense added", "success");

      // Calculate budget threshold sarcastic notifications
      const totalSpentAfter = finalExpenses.reduce((acc, e) => acc + e.amount, 0);
      const dest = trip?.name || "ट्रिप";
      const budgetPct = (trip.totalBudget && trip.totalBudget > 0) ? (totalSpentAfter / trip.totalBudget) * 100 : 0;

      if (budgetPct >= 100) {
        setTimeout(() => {
          showDialog({
            type: 'alert',
            title: "कंगाल मोड ऑन! 💸",
            message: `बजेटच्या बाहेर गेलास भावा! आता परतीचं तिकीट कॅन्सल कर आणि लोकांकडे लिफ्ट मागून परत ये.`,
            onConfirm: closeDialog
          });
        }, 350);
      } else if (budgetPct >= 90) {
        setTimeout(() => {
          showDialog({
            type: 'alert',
            title: "वांदे होणार आता! 🚨",
            message: `अलर्ट! ${dest} ट्रिपचा खिसा रिकामा होतोय. आता पुढचे दिवस फक्त वडापाव आणि हवेवर काढावे लागतील.`,
            onConfirm: closeDialog
          });
        }, 350);
      } else if (budgetPct >= 50) {
        setTimeout(() => {
          showDialog({
            type: 'alert',
            title: "हाताला ब्रेक लाव भावा! 🛑",
            message: `अरे, ५०% बजेट आत्ताच उडवलंस! ${dest} मध्ये अजून खूप मज्जा करायची बाकी आहे.`,
            onConfirm: closeDialog
          });
        }, 350);
      }
    }
    setShowExpenseModal(false);
    setExpenseTitle("");
    setExpenseAmount("");
  };

  const openEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setExpenseTitle(expense.title);
    setExpenseAmount(expense.amount.toString());
    const standardCategories = ['food', 'traveling', 'other', 'personal', 'restaurant', 'tips', 'transport', 'fuel', 'fun', 'highway', 'hotels'];
    if (standardCategories.includes(expense.category)) {
      setExpenseCategory(expense.category as Category);
      setCustomCategoryName("");
    } else {
      setExpenseCategory("other");
      setCustomCategoryName(expense.category);
    }
    setExpensePaidBy(expense.paidBy);
    setExpenseSplitWith(expense.splitWith);
    setExpenseDate(expense.date);
    setExpenseStageId(expense.stageId || "");
    setExpenseReceiptImage(expense.receiptImage);
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = (id: string) => {
    const performDelete = () => {
      updateTripState({ ...trip, expenses: trip.expenses.filter((e) => e.id !== id) });
      triggerToast(lang === 'mr' ? 'खर्च हटवला' : "Expense deleted");
    };

    if (trip.id.startsWith('SF-')) {
      showDialog({
        type: 'prompt',
        title: lang === 'mr' ? 'पासवर्ड टाका' : 'Enter Passcode',
        message: lang === 'mr' ? 'खर्च हटवण्यासाठी पासवर्ड टाका:' : 'Enter passcode to delete expense:',
        onConfirm: (enteredPasscode) => {
          if (enteredPasscode === trip.passcode) {
            performDelete();
          } else {
            triggerToast(lang === 'mr' ? 'चुकीचा पासवर्ड!' : 'Incorrect passcode!', 'alert');
          }
          closeDialog();
        },
        onCancel: closeDialog
      });
    } else {
      showDialog({
        type: 'confirm',
        title: lang === 'mr' ? 'खात्री करा' : 'Confirm Delete',
        message: lang === 'mr' ? 'हा खर्च हटवायचा का?' : 'Delete this expense?',
        onConfirm: () => {
          performDelete();
          closeDialog();
        },
        onCancel: closeDialog
      });
    }
  };

  const executeAddDeposit = (memberId: string, amount: number, note: string, mode: 'add' | 'edit') => {
    if (mode === 'edit') {
      const filteredDeposits = (trip.deposits || []).filter(d => d.memberId !== memberId);
      const newDep: Deposit = {
        id: "dep_" + Date.now(),
        memberId: memberId,
        amount: amount,
        date: new Date().toISOString().split("T")[0],
        note: note || (lang === "mr" ? "अपडेट केलेली जमा" : "Updated Deposit")
      };
      const updatedMembers = (trip.members || []).map(m => 
        m.id === memberId ? { ...m, totalDeposited: amount } : m
      );
      updateTripState({ ...trip, deposits: [...filteredDeposits, newDep], members: updatedMembers });
      triggerToast(lang === "mr" ? "जमा रक्कम बदलली!" : "Deposit updated!", "success");
    } else {
      const newDep: Deposit = {
        id: "dep_" + Date.now(),
        memberId: memberId,
        amount: amount,
        date: new Date().toISOString().split("T")[0],
        note: note || (lang === "mr" ? "नवीन जमा" : "New Deposit")
      };
      const updatedMembers = (trip.members || []).map(m => {
        if (m.id === memberId) {
          return { ...m, totalDeposited: (m.totalDeposited || 0) + amount };
        }
        return m;
      });
      updateTripState({ ...trip, deposits: [...(trip.deposits || []), newDep], members: updatedMembers });
      triggerToast(lang === "mr" ? "जमा रक्कम जोडली!" : "Deposit added!", "success");
    }
    setDepositAmount("");
    setDepositNote("");
    setSmartDepositPrompt(null);
    setShowDepositModal(false);
  };

  const handleAddDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositMemberId || !depositAmount) return;
    const parsedAmt = parseFloat(depositAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) return;

    const targetMember = (trip?.members || []).find(m => m.id === depositMemberId);
    const existingDepositTotal = (trip?.deposits || [])
      .filter(d => d.memberId === depositMemberId)
      .reduce((sum, d) => sum + d.amount, 0) || (targetMember?.totalDeposited || 0);

    if (existingDepositTotal > 0) {
      setSmartDepositPrompt({
        isOpen: true,
        memberId: depositMemberId,
        memberName: targetMember?.name || depositMemberId,
        oldAmount: existingDepositTotal,
        newAmount: parsedAmt,
        note: depositNote
      });
      setShowDepositModal(false);
      return;
    }

    executeAddDeposit(depositMemberId, parsedAmt, depositNote, 'add');
  };

  const handleEditDeposit = (memberId: string) => {
    const targetMember = (trip?.members || []).find(m => m.id === memberId);
    setDepositMemberId(memberId);
    setDepositAmount(targetMember?.totalDeposited ? targetMember.totalDeposited.toString() : "");
    setShowDepositModal(true);
  };

  const handleAddPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const planId = "plan_" + Date.now();
    const newPlan: TripPlan = {
      id: planId,
      type: planType,
      title: planTitle,
      detail: planDetail,
      datetime: planDatetime || new Date().toISOString(),
      cost: planCost ? parseFloat(planCost) : undefined,
      bookingRef: planBookingRef
    };
    let updatedExpenses = [...trip.expenses];
    if (newPlan.cost && newPlan.cost > 0) {
      const expenseId = "exp_auto_" + Date.now();
      const categoryMap: any = {
        "transport": "transport",
        "hotel": "hotels",
        "activity": "other",
        "other": "other"
      };
      const autoExpense: Expense = {
        id: expenseId,
        title: newPlan.title,
        amount: newPlan.cost,
        category: categoryMap[newPlan.type] || "other",
        paidBy: "pool",
        splitWith: trip?.members?.map((m) => m.id),
        date: newPlan.datetime.split("T")[0]
      };
      updatedExpenses.push(autoExpense);
      triggerToast(lang === "mr" ? "खर्चामध्ये आपोआप नोंद झाली!" : "Expense auto-added!");
    }
    updateTripState({
      ...trip,
      itinerary: [...trip.itinerary, newPlan],
      expenses: updatedExpenses
    });
    setShowPlanModal(false);
    triggerToast("Plan added", "success");
  };

  const handleStartSharing = async () => {
    showDialog({
      type: 'prompt',
      title: lang === 'mr' ? 'सुरक्षा कोड' : 'Security Code',
      message: lang === 'mr' ? 'सहलीसाठी ४ अंकी पासवर्ड सेट करा (Security Code):' : 'Set a 4-digit security code for this trip:',
      onConfirm: async (passcode) => {
        if (!passcode || passcode.length < 4) {
          triggerToast(lang === 'mr' ? 'कमीतकमी ४ अंकी पासवर्ड आवश्यक आहे' : 'Min 4-digit code required', 'alert');
          closeDialog();
          return;
        }
        const code = "SF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        const newTrip = { ...trip, id: code, passcode };
        try {
          await setDoc(doc(db, "trips", code), sanitizeForFirestore(newTrip));
          setTripsList((prev) => [...prev.filter(t => t.id !== trip.id), newTrip]);
          setActiveTripId(code);
          setTripCode(code);
          setIsCloudSynced(true);
          setIsAdmin(true);
          triggerToast("Cloud sharing active!", "success");
        } catch (e) {
          console.error(e);
        }
        closeDialog();
      },
      onCancel: closeDialog
    });
  };

  const handleJoinTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode) return;
    try {
      const snap = await getDoc(doc(db, "trips", inputCode.toUpperCase()));
      if (snap.exists()) {
        const data = snap.data() as TripGroup;
        
        if (data.passcode) {
          showDialog({
            type: 'prompt',
            title: lang === 'mr' ? 'पासवर्ड टाका' : 'Enter Passcode',
            message: lang === 'mr' ? 'या सहलीचा पासवर्ड (Security Code) टाका:' : 'Enter the Security Code for this trip:',
            onConfirm: (enteredPasscode) => {
              if (enteredPasscode === data.passcode) {
                this_completeJoin(data);
              } else {
                triggerToast(lang === 'mr' ? 'चुकीचा पासवर्ड!' : 'Incorrect passcode!', 'alert');
              }
              closeDialog();
            },
            onCancel: closeDialog
          });
        } else {
          this_completeJoin(data);
        }
      } else {
        triggerToast(t("invalidCode"), "alert");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const this_completeJoin = (data: TripGroup) => {
    setTripsList((prev) => {
      if (prev.find((t2) => t2.id === data.id)) return prev;
      return [...prev, data];
    });
    setActiveTripId(data.id);
    triggerToast("Joined trip successfully!");
    setShowSyncModal(false);
  };

  const handleScanReceipt = async (base64: string) => {
    setIsScanning(true);
    setExpenseReceiptImage(base64);
    try {
      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, members: trip?.members?.map((m) => m.name) })
      });
      const result = await response.json();
      if (result.success) {
        setExpenseTitle(result.data.title);
        setExpenseAmount(result.data.amount.toString());
        
        let suggestedCategory: string = result.data.category || 'other';
        if (suggestedCategory === 'other') {
          const titleLower = result.data.title.toLowerCase();
          if (/(flight|train|bus|ticket|travel|cab|uber|ola)/.test(titleLower)) {
            suggestedCategory = 'transport';
          } else if (/(hotel|stay|resort|motel|lodge|airbnb|oyo)/.test(titleLower)) {
            suggestedCategory = 'hotels';
          } else if (/(food|restaurant|cafe|dhaba|pizza|burger|lunch|dinner|breakfast)/.test(titleLower)) {
            suggestedCategory = 'food';
          } else if (/(fuel|petrol|diesel|gas)/.test(titleLower)) {
            suggestedCategory = 'fuel';
          } else if (/(toll|highway|fastag)/.test(titleLower)) {
            suggestedCategory = 'highway';
          }
        }
        setExpenseCategory(suggestedCategory as any);
        
        setExpenseDate(result.data.date);
        if (result.data.payerNameSuggestion) {
          const matched = trip?.members.find((m) => m.name.toLowerCase() === result.data.payerNameSuggestion.toLowerCase());
          if (matched) setExpensePaidBy(matched.id);
        }
        triggerToast(lang === "mr" ? "Smart ने माहिती शोधली!" : "Smart extracted details!");
      } else {
        triggerToast(result.error || "Scan failed", "alert");
      }
    } catch (e) {
      console.error(e);
      triggerToast("Smart Service error", "alert");
    } finally {
      setIsScanning(false);
    }
  };

  const handleParseSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingText) return;
    setIsParsingBooking(true);
    try {
      const response = await fetch("/api/parse-booking-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: bookingText, lang })
      });
      const result = await response.json();
      if (result.success) {
        setPlanTitle(result.data.title);
        setPlanType(result.data.type);
        setPlanDetail(result.data.detail);
        setPlanDatetime(result.data.datetime);
        setPlanCost(result.data.cost.toString());
        setPlanBookingRef(result.data.bookingRef);
        setPlanModalTab("manual");
        triggerToast(lang === "mr" ? "नियोजनाची माहिती मिळाली!" : "Extracted info successfully!");
      }
    } catch (e2) {
      console.error(e2);
      triggerToast("Smart Parse error", "alert");
    } finally {
      setIsParsingBooking(false);
    }
  };

  const generateSmartPlan = async (type: string) => {
    setIsSmartGenerating(true);
    setLoadingSteps([
      { id: '1', text: lang === 'mr' ? '📍 अंतर आणि मार्ग मोजत आहे...' : '📍 Calculating route & distance...', status: 'loading' },
      { id: '2', text: lang === 'mr' ? '💰 बजेटचे कॅल्क्युलेशन करत आहे...' : '💰 Checking budget viability...', status: 'pending' },
      { id: '3', text: lang === 'mr' ? '🌤️ प्रवासाच्या तारखेचे हवामान चेक करत आहे...' : '🌤️ Checking travel dates weather...', status: 'pending' },
      { id: '4', text: lang === 'mr' ? '🏛️ ठिकाणाची ऐतिहासिक माहिती घेत आहे...' : '🏛️ Fetching destination historical data...', status: 'pending' },
      { id: '5', text: lang === 'mr' ? '🍽️ प्रसिद्ध हॉटेल्स आणि रेस्टॉरंट्स शोधत आहे...' : '🍽️ Finding popular hotels & restaurants...', status: 'pending' },
      { id: '6', text: lang === 'mr' ? '✨ AI कडून तुमचा ट्रिप प्लॅन तयार होत आहे...' : '✨ AI is crafting your trip plan...', status: 'pending' }
    ]);

    try {
      // 1. Calculate precise number of days
      const start = new Date(trip?.startDate || new Date());
      const end = new Date(trip?.endDate || new Date());
      const totalDays = Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      // Validate destination
      const places = await fetchVerifiedPlaces(trip?.name || "");
      if (!places || places.length === 0) {
        triggerToast(lang === 'mr' ? '📍 ठिकाण सापडले नाही. कृपया योग्य शहराचे किंवा ठिकाणाचे नाव टाका.' : '📍 Destination not found. Please enter a valid city or place name.', "alert");
        setIsSmartGenerating(false);
        return;
      }

      // STEP 1: PRE-TRIP VALIDATION (DISTANCE API)
      if (trip?.source && trip?.name) {
        if (trip?.transportMode === 'train') {
          setLoadingSteps(prev => prev.map(s => s.id === '1' ? { ...s, text: lang === 'mr' ? '🚂 रेल्वे मार्ग आणि वेळ तपासत आहे...' : '🚂 Checking train route & time...' } : s));
        } else if (trip?.transportMode === 'flight') {
          setLoadingSteps(prev => prev.map(s => s.id === '1' ? { ...s, text: lang === 'mr' ? '✈️ विमान प्रवासाचे पर्याय शोधत आहे...' : '✈️ Searching flight options...' } : s));
        } else {
          setLoadingSteps(prev => prev.map(s => s.id === '1' ? { ...s, text: lang === 'mr' ? '🚗 हायवे आणि टोल तपासत आहे...' : '🚗 Checking highways & tolls...' } : s));
        }

        const distMetrics = await fetchDrivingDistanceAndTime(trip.source, trip.name);
        
        // HARD BLOCK VALIDATION
        const practicalAllowedTime = totalDays * 12; // Increased to 12 hours/day for flexibility
        if (distMetrics.totalTransitHours > practicalAllowedTime) {
          triggerToast(lang === 'mr' ? `प्रवास कालावधी इशारा: ${trip.source} ते ${trip.name} प्रवास खूप लांब आहे (${distMetrics.totalTransitHours} तास). जवळचे ठिकाण निवडा.` : `Warning: Travel time (${distMetrics.totalTransitHours} hrs) is too long for a ${totalDays} day trip.`, "alert");
          setIsSmartGenerating(false);
          return;
        }
        setLoadingSteps(prev => prev.map(s => s.id === '1' ? { ...s, status: 'success' } : s));
      } else {
        setLoadingSteps(prev => prev.map(s => s.id === '1' ? { ...s, status: 'success' } : s));
      }

      setLoadingSteps(prev => prev.map(s => s.id === '2' ? { ...s, status: 'loading' } : s));
      // Replace budget mock with a real calculation or a service call if needed
      await new Promise(r => setTimeout(r, 400)); 
      setLoadingSteps(prev => prev.map(s => s.id === '2' ? { ...s, status: 'success' } : s));

      setLoadingSteps(prev => prev.map(s => s.id === '3' ? { ...s, status: 'loading' } : s));
      // Replace weather mock with a real call if available, otherwise skip or mock
      await new Promise(r => setTimeout(r, 400));
      setLoadingSteps(prev => prev.map(s => s.id === '3' ? { ...s, status: 'success' } : s));

      setLoadingSteps(prev => prev.map(s => s.id === '4' ? { ...s, status: 'loading' } : s));
      // Real Wikipedia fetch
      let wikiFacts = "";
      try {
        const dest = trip?.name || "Destination";
        const wikiRes = await fetch(`https://mr.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=3&exlimit=1&titles=${encodeURIComponent(dest)}&explaintext=1&format=json&origin=*`);
        const wikiData = await wikiRes.json();
        const pages = wikiData?.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== "-1") wikiFacts = pages[pageId].extract;
        }
        if (!wikiFacts) {
          const enWikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=3&exlimit=1&titles=${encodeURIComponent(dest)}&explaintext=1&format=json&origin=*`);
          const enWikiData = await enWikiRes.json();
          const enPages = enWikiData?.query?.pages;
          if (enPages) {
            const enPageId = Object.keys(enPages)[0];
            if (enPageId !== "-1") wikiFacts = enPages[enPageId].extract;
          }
        }
        setLoadingSteps(prev => prev.map(s => s.id === '4' ? { ...s, status: 'success' } : s));
      } catch (e) {
        setLoadingSteps(prev => prev.map(s => s.id === '4' ? { ...s, status: 'error', text: lang === 'mr' ? '❌ माहिती मिळाली नाही' : '❌ Info not found' } : s));
      }
      
      setLoadingSteps(prev => prev.map(s => s.id === '5' ? { ...s, status: 'loading' } : s));
      await new Promise(r => setTimeout(r, 600)); // Places check mock
      setLoadingSteps(prev => prev.map(s => s.id === '5' ? { ...s, status: 'success' } : s));

      setLoadingSteps(prev => prev.map(s => s.id === '6' ? { ...s, status: 'loading' } : s));

      // 2. Strict AI Instructions
      const strictRules = `
        STRICT RULES FOR ITINERARY GENERATION:
        1. TRANSPORT MODE: The user is traveling by '${trip?.transportMode || 'road'}'. If they selected Train/Bus/Car, DO NOT mention Airports or Flights under any circumstances.
        2. DURATION: Generate exactly a ${totalDays}-day itinerary.
        3. FOOD: For EVERY Lunch and Dinner, suggest TWO distinct options: (🔴 Local/Non-Veg famous dish) AND (🟢 Pure Veg option). Do NOT force everything to be Pure Veg unless explicitly requested.
        4. WIKIPEDIA FACTS: Incorporate this context: ${wikiFacts || "General destination knowledge"}
      `;

      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: trip?.source || "",
          tripName: trip?.name,
          startDate: trip?.startDate,
          endDate: trip?.endDate,
          members: trip?.members?.map((m) => m.name),
          transportMode: trip?.transportMode || 'road',
          totalBudget: trip?.totalBudget,
          lang,
          promptInstruction: strictRules
        })
      });
      const result = await response.json();
      if (result.success) {
        let parsedPlan: any = null;
        
        const attemptParseJSON = (text: string) => {
          try { return JSON.parse(text); } catch (e) {}
          try { return JSON.parse(text + '"}'); } catch (e) {}
          try { return JSON.parse(text + '"]}'); } catch (e) {}
          try { return JSON.parse(text + '}]}'); } catch (e) {}
          try { return JSON.parse(text + '"}]}'); } catch (e) {}
          try { return JSON.parse(text + ']}'); } catch (e) {}
          try { return JSON.parse(text + '}'); } catch (e) {}
          
          const cleanText = text.replace(/\\n/g, " ").replace(/\\"/g, "'").replace(/\\\\/g, "");
          try { return JSON.parse(cleanText + '"}]}'); } catch (e) {}
          
          return null;
        };

        parsedPlan = attemptParseJSON(result.text);

        if (!parsedPlan) {
          console.error("Failed to parse JSON itinerary text", result.text);
        }

        if (parsedPlan && parsedPlan.itinerary) {
          let generatedPlans: TripPlan[] = parsedPlan.itinerary.map((dayItem: any, index: number) => {
            const planDate = new Date(trip.startDate);
            planDate.setDate(planDate.getDate() + index);
            const dateStr = planDate.toISOString().split("T")[0];

            let detailText = '';
                if (dayItem.activities && Array.isArray(dayItem.activities)) {
                  dayItem.activities.forEach((act: any) => {
                    const actTime = act.timeOfDay ? act.timeOfDay.toLowerCase() : '';
                    const emoji = actTime.includes('morning') ? '🌅' : actTime.includes('afternoon') ? '☀️' : '🌇';
                    detailText += `### ${emoji} ${act.timeOfDay}
**${act.activityName}**
${act.exactLocation}
*Estimated Cost: ${act.realisticCost}*

`;
                  });
                } else {
                  detailText = dayItem.practical_activities ? `${dayItem.practical_activities}

` : '';
                  if (dayItem.morning || dayItem.afternoon || dayItem.evening) {
                    detailText += `### 🌅 Morning
${dayItem.morning || ''}

### ☀️ Afternoon
${dayItem.afternoon || ''}

### 🌇 Evening
${dayItem.evening || ''}

`;
                  }
                }
            if (dayItem.daily_budget_breakdown) {
              detailText += `**💰 ${lang === 'mr' ? 'दैनिक खर्च अंदाज' : 'Daily Budget Breakdown'}:** ${dayItem.daily_budget_breakdown}

`;
            }
            if (dayItem.local_pro_tips) {
              detailText += `**💡 ${lang === 'mr' ? 'स्थानिक टिप्स' : 'Local Pro Tips'}:** ${dayItem.local_pro_tips}`;
            }

            return {
              id: `plan_ai_day_${dayItem.day || index + 1}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
              type: 'activity' as const,
              title: `${lang === 'mr' ? 'दिवस' : 'Day'} ${dayItem.day}: ${parsedPlan.trip_title || trip?.name}`,
              detail: detailText,
              datetime: `${dateStr}T09:00:00`
            };
          });

          // Prepend a Trip Overview with Budget & Weather if available
          let overviewText = '';
          if (parsedPlan.budgetWarning) {
            overviewText += `**⚠️ ${lang === 'mr' ? 'बजेट चेतावणी' : 'Budget Warning'}:** ${parsedPlan.budgetWarning}\n\n`;
          }
          if (parsedPlan.totalEstimatedCost) {
            overviewText += `**💸 ${lang === 'mr' ? 'एकूण अंदाजित खर्च' : 'Total Estimated Cost'}:** ₹${parsedPlan.totalEstimatedCost}\n\n`;
          }
          if (parsedPlan.abort) {
            overviewText = `**🚫 ${lang === 'mr' ? 'प्रवास कालावधी इशारा' : 'Travel Time Warning'}:** ${parsedPlan.budgetWarning}\n\n`;
            generatedPlans = []; // Don't show itinerary if aborted
          } else {
            if (parsedPlan.wiki_summary) {
              overviewText += `**📍 ${lang === 'mr' ? 'ठिकाणाबद्दल थोडक्यात माहिती (Wikipedia)' : 'About Location (Wikipedia)'}:** ${parsedPlan.wiki_summary}\n\n`;
            }
            if (parsedPlan.tollAndFuelCost) {
              overviewText += `**🚗 ${lang === 'mr' ? 'टोल आणि इंधन खर्च (OSM)' : 'Toll & Fuel Cost (OSM)'}:** ₹${parsedPlan.tollAndFuelCost}\n\n`;
            }
          }
          if (parsedPlan.weather) {
            overviewText += `**☁️ ${lang === 'mr' ? 'हवामान अंदाज' : 'Weather Forecast'}:** ${parsedPlan.weather}\n\n`;
          }
          if (parsedPlan.packingList && Array.isArray(parsedPlan.packingList)) {
            overviewText += `**🎒 ${lang === 'mr' ? 'काय सोबत घ्याल?' : 'Packing List'}:**\n${parsedPlan.packingList.map((item) => `- ${item}`).join('\n')}\n\n`;
          }

          if (overviewText) {
            generatedPlans.unshift({
              id: `plan_ai_overview_${Date.now()}`,
              type: 'note' as const,
              title: lang === 'mr' ? '✨ स्मार्ट ट्रिप ओव्हरव्ह्यू (Smart Trip Overview)' : '✨ Smart Trip Overview',
              detail: overviewText.trim(),
              datetime: `${trip?.startDate || new Date().toISOString().split("T")[0]}T08:00:00`
            });
          }

          updateTripState({
            ...trip,
            aiPlan: result.text,
            itinerary: [...generatedPlans, ...trip.itinerary]
          });
          triggerToast(lang === 'mr' ? 'Smart नियोजन यशस्वीरित्या तयार झाले!' : "Detailed Smart Itinerary generated!", "success");
          setLoadingSteps(prev => prev.map(s => s.id === '6' ? { ...s, status: 'success' } : s));
        } else {
          // ... (existing parsing logic if no itinerary)
          const newPlan: TripPlan = {
            id: "plan_ai_" + Date.now(),
            type: "other",
            title: lang === "mr" ? "Smart मार्गदर्शन" : "Smart Guidance",
            detail: result.text,
            datetime: new Date().toISOString()
          };
          updateTripState({ ...trip, itinerary: [newPlan, ...trip.itinerary] });
          triggerToast("Smart Plan generated!");
          setLoadingSteps(prev => prev.map(s => s.id === '6' ? { ...s, status: 'success' } : s));
        }
      } else {
        triggerToast(result.error || "Error generating plan", "alert");
        setLoadingSteps(prev => prev.map(s => s.status === 'loading' ? { ...s, status: 'error' } : s));
      }
    } catch (e: any) {
      console.error(e);
      triggerToast("सध्या Smart ला माहिती मिळवण्यात तांत्रिक अडचण आली आहे, कृपया आपण स्वतः प्लॅन तयार करून पुढे जा.", "alert");
      setShowPlanModal(true);
      setPlanModalTab("manual");
      setLoadingSteps(prev => prev.map(s => s.status === 'loading' ? { ...s, status: 'error' } : s));
    } finally {
      setTimeout(() => setIsSmartGenerating(false), 1500);
    }
  };


  const settlements = trip ? calculateSettlements(trip?.members || [], trip?.expenses || [], trip?.deposits || [], validAdminId, trip?.calculationMode || 'individual_split') : { transfers: [], balances: {} };
  const { transfers, balances } = settlements;
  
  const totalDeposits = (trip?.deposits || []).reduce((s, d) => s + d.amount, 0);
  const poolExpenses = (trip?.expenses || []).filter((e) => e.paidBy === "pool").reduce((s, e) => s + e.amount, 0);
  const poolBalance = totalDeposits - poolExpenses;

  // Final Render
  const activeTripName = activeTripId ? (tripsList.find(t => t.id === activeTripId)?.name || trip?.name) : (lang === 'mr' ? 'प्रवास वाटाघाटी' : 'Pravas Wataghati');



  // Admin Routing & Dashboard Logic
  const path = window.location.pathname;
  if (path === '/admin/login') {
    if (!currentUser || currentUser.email?.toLowerCase() !== 'shrd.raut@gmail.com') {
      return <LoginScreen wallpaperUrl="/screenshot-desktop.png" logoUrl="/logo.svg" isAdminLogin={true} />;
    } else {
      window.history.replaceState({}, '', '/admin/dashboard');
    }
  }
  
  if (path === '/admin/dashboard' || (currentUser?.email?.toLowerCase() === 'shrd.raut@gmail.com' && !showAdminPreview)) {
    if (!currentUser || currentUser.email?.toLowerCase() !== 'shrd.raut@gmail.com') {
      return <LoginScreen wallpaperUrl="/screenshot-desktop.png" logoUrl="/logo.svg" isAdminLogin={true} />;
    }
    return (
      <AdminDashboardView
        lang={lang as 'mr' | 'en' | 'hi'}
        onLaunchMainApp={() => {
          setShowAdminPreview(true);
          if (path.startsWith('/admin')) {
             window.history.pushState({}, '', '/');
          }
        }}
      />
    );
  }
  // MANDATORY AUTHENTICATION GATING: Users cannot access app without Google login
  if (!currentUser) {
    return (
      <LoginScreen
        wallpaperUrl="/screenshot-desktop.png"
        logoUrl="/logo.svg"
      />
    );
  }

  // SECRET ADMIN ROUTING: Strictly triggered ONLY for shrd.raut@gmail.com
  if (currentUser?.email?.toLowerCase() === 'shrd.raut@gmail.com' && !showAdminPreview) {
    return (
      <AdminDashboardView
        lang={lang as 'mr' | 'en' | 'hi'}
        onLaunchMainApp={() => setShowAdminPreview(true)}
      />
    );
  }

  // AGENT ROUTING: Partner / Agent full-screen dashboard
  if (currentUser?.role === 'agent') {
    return (
      <AgentPortalView
        lang={lang}
        onShowToast={(msg) => console.log(msg)}
      />
    );
  }

  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => setShowSplash(false)}
        lang={lang}
        logoUrl="/logo.svg"
        wallpaperUrl="/screenshot-desktop.png"
      />
    );
  }

  const currentDateStr = new Date().toISOString().split('T')[0];
  const isTripCompleted = trip ? trip.endDate < currentDateStr : false;

  const renderContent = () => {

    if (!activeTripId) {
      if (showCommunityHub) {
        return (
          <div className="flex flex-col h-full w-full bg-[#fcfcfd]">
            <header className="sticky top-0 left-0 right-0 glass-effect border-b border-slate-200/60 px-5 py-4 flex items-center z-[60] shadow-sm">
              <button 
                onClick={() => setShowCommunityHub(false)}
                className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-all text-slate-700"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest ml-3">{lang === 'mr' ? 'सुट्ट्या (Holidays)' : 'Holidays'}</h2>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-[130px]">
              <CommunityHubView 
                lang={lang} 
                onCloneTemplate={(template) => {
                  setShowCommunityHub(false);
                  setEditingTripId(null);
                  setAiPreFilledData({
                    name: template.name,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    members: [{name: currentUser?.name || '', deposit: '', isAdmin: true}],
                  });
                  setShowCreateTripModal(true);
                }} 
              />
            </div>
          </div>
        );
      }
      return (
        <TripListView 
          trips={tripsList}
          lang={lang}
          t={t}
          onNavigate={(tab) => setActiveTab(tab)}
          onSelectTrip={setActiveTripId}
          onCommunityTemplates={() => setShowCommunityHub(true)}

          onCreateTrip={() => {
            if (!currentUser) {
              openAuthModal(() => {
                setEditingTripId(null);
                setShowCreateTripModal(true);
              });
              return;
            }
            setEditingTripId(null);
            setShowCreateTripModal(true);
          }}
          onJoinTrip={() => {
            if (!currentUser) {
              openAuthModal(() => setShowSyncModal(true));
              return;
            }
            setShowSyncModal(true);
          }}
          onFutureTripPlan={() => {
            setShowFutureTripModal(true);
          }}
          onEditTrip={(trip) => {
            setEditingTripId(trip.id);
            setShowCreateTripModal(true);
          }}
          onDeleteTrip={(id) => {
            const tName = tripsList.find(t => t.id === id)?.name || "Trip";
            showDialog({
              type: 'confirm',
              title: lang === 'mr' ? 'सहल हटवा' : 'Delete Trip',
              message: `${lang === 'mr' ? 'तुम्ही खात्रीने' : 'Are you sure you want to delete'} "${tName}" ${lang === 'mr' ? 'ही सहल हटवू इच्छिता?' : 'trip?'}`,
              onConfirm: async () => {
                try {
                  await deleteDoc(doc(db, 'trips', id));
                } catch (e) {
                  console.warn("Delete doc error notice:", e);
                }
                setTripsList(prev => prev.filter(t => t.id !== id));
                if (activeTripId === id) setActiveTripId(null);
                triggerToast(lang === 'mr' ? 'सहल हटवली' : 'Trip deleted');
                closeDialog();
              },
              onCancel: closeDialog
            });
          }}
          onUpdateTrip={(updatedTrip) => setTripsList(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t))}
          onShareTrip={handleStartSharing}
        />
      );
    }

    if (!trip) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-slate-600 font-bold text-sm">
            {lang === 'mr' ? 'सहल शोधत आहे...' : 'Loading trip details...'}
          </p>
          <button
            onClick={() => {
              setActiveTripId(null);
              setTrip(null);
              setActiveTab('dashboard');
            }}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-extrabold text-xs shadow-md hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
          >
            {lang === 'mr' ? 'सर्व सहली पहा (Go to Trips)' : 'Back to Trips List'}
          </button>
        </div>
      );
    }


    switch (activeTab) {
      case 'dashboard':
        return <DashboardView 
          trip={trip} 
          lang={lang} 
          userId={currentUser?.id || "guest"}
          t={t} 
          currencySymbol={currencySymbol} 
          poolBalance={poolBalance}
          onNavigate={(tab) => {
            if (tab === 'trips-list') setActiveTripId(null);
            else if (tab === 'share-story') setShowStoryModal(true);
            else if (tab === 'map') {
              setPlannerTab('map');
              setActiveTab('planner');
            } else if (tab === 'balances') {
              setExpensesInitialSubTab('settlement');
              setActiveTab('expenses');
            } else {
              if (tab === 'expenses') {
                setExpensesInitialSubTab('expenses');
              }
              setActiveTab(tab);
            }
          }}
          onVote={handleVote}
          onCreatePoll={handleCreatePoll}
          onClosePoll={handleClosePoll}
          onSOS={handleSOS}
          onAddPlaylistItem={handleAddPlaylistItem}
          onRemovePlaylistItem={handleRemovePlaylistItem}
          onAddGalleryItem={handleAddGalleryItem}
          onUpdateTrip={(updatedTrip) => updateTripState(updatedTrip)}
          onShowRecap={() => {
            setActiveTripForRecap(trip);
            setShowTripRecap(true);
          }}
          onPublish={handlePublishTrip}
          themeColor={trip?.themeColor}
          onShowToast={triggerToast}
          onAddDeposit={() => setShowDepositModal(true)}
          onGenerateAI={generateSmartPlan}
          isAIGenerating={isAIGenerating}
          isTripCompleted={isTripCompleted}
        />;
      case 'expenses':
        return <ExpensesTabContainer
          key="expenses"
          trip={trip}
          lang={lang}
          t={t}
          currencySymbol={currencySymbol}
          adminId={validAdminId || ""}
          balances={balances}
          transfers={transfers}
          initialSubTab={expensesInitialSubTab}
          poolBalance={poolBalance}
          onUpdateTrip={updateTripState}
          onAddExpense={() => {
            if (!currentUser) {
              openAuthModal(() => {
                setEditingExpenseId(null);
                setExpenseTitle("");
                setExpenseAmount("");
                setExpenseCategory("food");
                setExpensePaidBy(validAdminId || "");
                setExpenseSplitWith(trip?.members?.map(m => m.id) || []);
                setExpenseDate(new Date().toISOString().split("T")[0]);
                setShowExpenseModal(true);
              });
              return;
            }
            setEditingExpenseId(null);
            setExpenseTitle("");
            setExpenseAmount("");
            setExpenseCategory("food");
            setExpensePaidBy(validAdminId || "");
            setExpenseSplitWith(trip?.members?.map(m => m.id) || []);
            setExpenseDate(new Date().toISOString().split("T")[0]);
            setShowExpenseModal(true);
          }}
          onDeleteExpense={handleDeleteExpense}
          onEditExpense={openEditExpense}
          
          onAddDeposit={() => setShowDepositModal(true)}
          onEditDeposit={handleEditDeposit}
          onAddMember={() => setShowAddMemberModal(true)}
          onUpdateMemberAvatar={() => {}}
          onUpdateMemberUPI={() => {}}
          onPayUPI={() => {}}
          onShareRequest={() => {}}
          onOpenFuelCalculator={() => setShowFuelCalculatorModal(true)}
          
        />;
      case 'bookings':
        return <BookingsView
          key="bookings"
          trip={trip}
          lang={lang}
          t={t}
          currencySymbol={currencySymbol}
          themeColor={trip?.themeColor}
          onUpdateTrip={updateTripState}
        />;
      case 'social':
      case 'memories':
        return <MemoriesView
          key="social"
          trip={trip}
          lang={lang}
          t={t}
          themeColor={trip?.themeColor}
          onUpdateTrip={updateTripState}
          onAddGalleryItem={(item) => handleAddGalleryItem(typeof item === 'string' ? item : item.imageUrl)}
        />;
      case 'extras':
        return <ExtrasView
          key="extras"
          trip={trip}
          lang={lang}
          t={t}
          currencySymbol={currencySymbol}
          themeColor={trip?.themeColor}
          onAddExpense={() => {
            setEditingExpenseId(null);
            setExpenseTitle("");
            setExpenseAmount("");
            setExpenseCategory("food");
            setExpensePaidBy(validAdminId || "");
            setExpenseSplitWith(trip?.members?.map(m => m.id) || []);
            setExpenseDate(new Date().toISOString().split("T")[0]);
            setShowExpenseModal(true);
          }}
          onSearchFlights={() => setActiveTab('bookings')}
          onOpenFuelCalculator={() => setShowFuelCalculatorModal(true)}
          onAddItineraryPlan={() => setShowPlanModal(true)}
          onAddMember={() => setShowAddMemberModal(true)}
          onSOS={() => handleSOS(18.5204, 73.8567)}
          onUpdateTrip={updateTripState}
          onShowToast={triggerToast}
          onShowRecap={() => setShowStoryModal(true)}
          onPublish={handlePublishTrip}
          
          onOpenSettings={() => setActiveTab('settings')}
          defaultSubTab="planning"
        />;
      case 'planner':
        return <PlannerView 
          key="planner"
          itinerary={trip?.itinerary || []}
          trip={trip} 
          onAddPlan={() => setShowPlanModal(true)}
          onAddDeposit={() => setShowDepositModal(true)}
          onGenerateAI={generateSmartPlan}
          isAIGenerating={isAIGenerating}
          lang={lang} 
          t={t} 
          currencySymbol={currencySymbol}
          activeSubTab={plannerTab}
          onSubTabChange={setPlannerTab}
          onOpenFuelCalculator={() => setShowFuelCalculatorModal(true)}
          onUpdateTrip={updateTripState}
          userId={currentUser?.id || "guest"}
          isSharingLocation={isSharingLocation}
          onToggleLocationShare={handleToggleLocationShare}
          themeColor={trip?.themeColor}
          isTripCompleted={isTripCompleted}
        />;
      case 'settings':
        return <SettingsView 
          key="settings"
          trip={trip}
          isAdmin={isAdmin}
          lang={lang}
          setLang={setLang}
          onOpenLanguageModal={() => setShowLanguageOnboardingModal(true)}
          currency={trip?.defaultCurrency || 'INR'}
          onSetCurrency={(c) => trip && updateTripState({ ...trip, defaultCurrency: c })}
          onUpdateTrip={updateTripState}
          onUpdateMemberAvatar={(memberId, avatarUrl) => {
            if (!trip) return;
            const newMembers = trip?.members?.map(m => m.id === memberId ? { ...m, avatar: avatarUrl } : m);
            updateTripState({ ...trip, members: newMembers });
          }}
          onShare={() => setShowSyncModal(true)}
          onShareApp={async () => {
            const shareUrl = window.location.origin;
            const shareText = lang === 'mr' 
              ? 'प्रवास वाटाघाटी (Pravas Wataghati) - सहलीचे नियोजन आणि खर्च विभागणीसाठी सर्वोत्तम ॲप! येथे क्लिक करा: ' 
              : 'Pravas Wataghati - The best app for trip planning and expense splitting! Check it out here: ';
            
            if (navigator.share) {
              try {
                await navigator.share({
                  title: 'Pravas Wataghati App',
                  text: shareText,
                  url: shareUrl
                });
              } catch (err) {
                await safeCopyToClipboard(shareText + shareUrl);
                triggerToast(lang === 'mr' ? 'ॲप लिंक कॉपी झाली!' : 'App link copied!');
              }
            } else {
              await safeCopyToClipboard(shareText + shareUrl);
              triggerToast(lang === 'mr' ? 'ॲप लिंक कॉपी झाली!' : 'App link copied!');
            }
          }}
          onDelete={() => {
            showDialog({
              type: 'confirm',
              title: lang === 'mr' ? 'सहल हटवा' : 'Delete Trip',
              message: t('deleteTripConfirm'),
              onConfirm: async () => {
                try {
                  await deleteDoc(doc(db, 'trips', trip.id));
                } catch (e) {
                  console.warn("Delete doc error notice:", e);
                }
                setTripsList(prev => prev.filter(t => t.id !== trip.id));
                setActiveTripId(null);
                closeDialog();
              },
              onCancel: closeDialog
            });
          }}
          
          onLeave={() => setActiveTripId(null)}
          onBackToTrips={() => setActiveTripId(null)}
          t={t}
        />;
      default:
        return <DashboardView 
          trip={trip} 
          lang={lang} 
          userId={currentUser?.id || "guest"}
          t={t} 
          currencySymbol={currencySymbol} 
          poolBalance={poolBalance}
          onNavigate={(tab) => {
            if (tab === 'trips-list') setActiveTripId(null);
            else if (tab === 'share-story') setShowStoryModal(true);
            else if (tab === 'map') {
              setPlannerTab('map');
              setActiveTab('planner');
            } else if (tab === 'balances') {
              setExpensesInitialSubTab('settlement');
              setActiveTab('expenses');
            } else {
              if (tab === 'expenses') {
                setExpensesInitialSubTab('expenses');
              }
              setActiveTab(tab);
            }
          }}
          onVote={handleVote}
          onCreatePoll={handleCreatePoll}
          onClosePoll={handleClosePoll}
          onSOS={handleSOS}
          onAddPlaylistItem={handleAddPlaylistItem}
          onRemovePlaylistItem={handleRemovePlaylistItem}
          onAddGalleryItem={handleAddGalleryItem}
          onUpdateTrip={(updatedTrip) => updateTripState(updatedTrip)}
          onShowRecap={() => {
            setActiveTripForRecap(trip);
            setShowTripRecap(true);
          }}
          onPublish={handlePublishTrip}
          themeColor={trip?.themeColor}
          onShowToast={triggerToast}
          onOpenFuelCalculator={() => setShowFuelCalculatorModal(true)}
          onAddDeposit={() => setShowDepositModal(true)}
        />;
    }
  };

  return (
    <ErrorBoundary>
      <MusicPlayerProvider playlist={trip?.playlist || []}>
      <div className="flex flex-col h-screen h-[100dvh] w-full overflow-hidden">
        <OfflineBanner />
        <AppShell 
        activeTab={activeTripId ? activeTab : 'trips-list'}
        onTabChange={(tab) => {
          if (tab === 'trips-list') setActiveTripId(null);
          else setActiveTab(tab);
        }}
        lang={lang}
        tripName={activeTripName}
        wallpaperUrl={activeTripId ? trip?.wallpaperUrl : undefined}
        logoUrl={activeTripId ? trip?.logoUrl : undefined}
        isCloudSynced={activeTripId ? isCloudSynced : undefined}
        isOffline={isOffline || isSyncing}
        onLogoClick={() => {
          setShowSyncModal(true);
        }}
        onSOS={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
              handleSOS(pos.coords.latitude, pos.coords.longitude);
            }, (err) => {
              handleSOS(0, 0); // Fallback without location
            });
          } else {
            handleSOS(0, 0);
          }
        }}
      >
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>

        {showTripRecap && activeTripForRecap && (
          <TripRecap 
            trip={activeTripForRecap}
            lang={lang}
            currencySymbol={currencySymbol}
            onClose={() => setShowTripRecap(false)}
          />
        )}
      </AppShell>

      <ModalsContainer 
        showExpenseModal={showExpenseModal}
        setShowExpenseModal={setShowExpenseModal}
        showDepositModal={showDepositModal}
        setShowDepositModal={setShowDepositModal}
        smartDepositPrompt={smartDepositPrompt}
        onConfirmDepositAction={executeAddDeposit}
        onCancelSmartDeposit={() => setSmartDepositPrompt(null)}
        showPlanModal={showPlanModal}
        setShowPlanModal={setShowPlanModal}
        showSyncModal={showSyncModal}
        setShowSyncModal={setShowSyncModal}
        showPwaModal={showPwaModal}
        setShowPwaModal={setShowPwaModal}
        showPinChangeModal={showPinChangeModal}
        setShowPinChangeModal={setShowPinChangeModal}
        trip={trip}
        lang={lang}
        t={t}
        currencySymbol={currencySymbol}
        isCloudSynced={isCloudSynced}
        isAdmin={isAdmin}
        onVoiceCommand={async (text) => {
          setIsProcessingVoice(true);
          try {
            const response = await fetch("/api/parse-voice-command", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audio: text, targetLanguage: lang })
            });
            const jsonResp = await response.json();
            if (jsonResp.success && jsonResp.data) {
              const { uiData, audioSpeech, detectedLanguageCode } = jsonResp.data;
              
              // Play Audio Speech natively if provided
              if (audioSpeech) {
                if ('speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(audioSpeech);
                  utterance.lang = detectedLanguageCode || (lang === 'mr' ? 'mr-IN' : 'hi-IN');
                  utterance.rate = 1.0;
                  window.speechSynthesis.speak(utterance);
                }
              }

              // Auto-fill expense form if expense data returned
              if (uiData && (uiData.amount !== undefined || uiData.category)) {
                let finalTitle = uiData.description || uiData.title;
                if (!finalTitle && uiData.category) finalTitle = t(uiData.category);
                if (!finalTitle) finalTitle = "Voice Expense";
                
                const validCats = ['food','transport','hotels','tickets','shopping','other','restaurant','fuel','fun'];
                const finalCategory = uiData.category && validCats.includes(uiData.category) ? uiData.category : 'other';
                
                let finalPaidBy = validAdminId || "";
                if (uiData.payer) {
                  const matchedMember = trip?.members.find(m => m.name.toLowerCase().includes(uiData.payer.toLowerCase()));
                  if (matchedMember) finalPaidBy = matchedMember.id;
                }
                
                setEditingExpenseId(null);
                setExpenseTitle(finalTitle);
                setExpenseAmount(uiData.amount?.toString() || "");
                setExpenseCategory(finalCategory);
                setExpensePaidBy(finalPaidBy);
              }
              triggerToast(lang === 'mr' ? 'व्हॉइस एन्ट्री तयार!' : 'Voice entry ready!');
            }
          } catch (e) {
            console.error(e);
            triggerToast(lang === 'mr' ? 'व्हॉइस कमांड फेल' : 'Voice command failed');
          } finally {
            setIsProcessingVoice(false);
          }
        }}
        isProcessingVoice={isProcessingVoice}
        expenseForm={{
          title: expenseTitle, setTitle: setExpenseTitle,
          amount: expenseAmount, setAmount: setExpenseAmount,
          category: expenseCategory, setCategory: setExpenseCategory,
          customCategoryName: customCategoryName, setCustomCategoryName: setCustomCategoryName,
          paidBy: expensePaidBy, setPaidBy: setExpensePaidBy,
          splitWith: expenseSplitWith, setSplitWith: setExpenseSplitWith,
          date: expenseDate, setDate: setExpenseDate,
          stageId: expenseStageId, setStageId: setExpenseStageId,
          receiptImage: expenseReceiptImage, setReceiptImage: setExpenseReceiptImage,
          onSubmit: handleAddExpenseSubmit
        }}
        scan={{
          isScanning,
          onScan: handleScanReceipt,
          demoReceipts: [], // Can populate from constants
          selectedDemoId,
          setSelectedDemoId
        }}
        depositForm={{
          memberId: depositMemberId, setMemberId: setDepositMemberId,
          amount: depositAmount, setAmount: setDepositAmount,
          note: depositNote, setNote: setDepositNote,
          onSubmit: handleAddDepositSubmit
        }}
        planForm={{
          type: planType, setType: setPlanType,
          title: planTitle, setTitle: setPlanTitle,
          detail: planDetail, setDetail: setPlanDetail,
          datetime: planDatetime, setDatetime: setPlanDatetime,
          cost: planCost, setCost: setPlanCost,
          bookingRef: planBookingRef, setBookingRef: setPlanBookingRef,
          onSubmit: handleAddPlanSubmit,
          tab: planModalTab, setTab: setPlanModalTab,
          bookingText, setBookingText,
          isParsing: isParsingBooking,
          onParseSMS: handleParseSMS
        }}
        pinForm={{
          newPinInput: "",
          setNewPinInput: () => {},
          onSubmit: () => {}
        }}
        sync={{
          tripCode,
          inputCode, setInputCode,
          onStartSharing: handleStartSharing,
          onJoinTrip: handleJoinTrip,
          onDisconnect: () => {
             setIsCloudSynced(false);
             const newId = "trip_" + Date.now();
             updateTripState({ ...trip, id: newId });
             triggerToast("Disconnected from cloud");
          },
          onShareLink: async () => {
            const link = window.location.origin + window.location.pathname + "?code=" + tripCode;
            await safeCopyToClipboard(link);
            triggerToast("Link copied!");
          }
        }}
        pwa={{
          isInstallable: false,
          onInstall: () => {}
        }}
        dialog={{
          config: dialogConfig,
          onClose: closeDialog,
          onSubmit: (val) => {
            if (dialogConfig.onConfirm) {
              dialogConfig.onConfirm(val);
            }
          }
        }}
      />

      <LanguageOnboardingModal 
        isOpen={showLanguageOnboardingModal}
        onClose={() => {
          setShowLanguageOnboardingModal(false);
          localStorage.setItem('pravas_language_selected', 'true');
          const hasSeenTutorial = localStorage.getItem('hasSeenTutorial') === 'true';
          if (!hasSeenTutorial) {
            setShowWelcomeTour(true);
          }
        }}
      />

      <FutureTripModal 
        isOpen={showFutureTripModal} 
        onClose={() => setShowFutureTripModal(false)} 
        lang={lang} 
        onAlert={(msg) => triggerToast(msg, 'alert')}
        onManualEntry={() => {
          setShowFutureTripModal(false);
          setShowCreateTripModal(true);
        }}
      />

      <FuelCalculatorModal
        isOpen={showFuelCalculatorModal}
        onClose={() => setShowFuelCalculatorModal(false)}
        lang={lang}
        currencySymbol={currencySymbol}
        onAddAsExpense={(calculatedCost) => {
          setEditingExpenseId(null);
          setExpenseTitle(lang === 'mr' ? 'इंधन आणि टोल खर्च' : 'Fuel & Toll Expenses');
          setExpenseAmount(calculatedCost.toString());
          setExpenseCategory('fuel');
          setExpensePaidBy(validAdminId || "");
          setExpenseSplitWith(trip?.members?.map(m => m.id) || []);
          setExpenseDate(new Date().toISOString().split("T")[0]);
          setShowFuelCalculatorModal(false);
          setShowExpenseModal(true);
        }}
      />

      
        <LiveRadarModal
          isOpen={showLiveRadarModal}
          onClose={() => setShowLiveRadarModal(false)}
          lang={lang}
        />

        
      


      <MusicSearchModal
        isOpen={showMusicSearchModal}
        onClose={() => setShowMusicSearchModal(false)}
        lang={lang}
        themeColor={trip?.themeColor || '#6366f1'}
        onAddPlaylistItem={(title, url, artist, thumbnailUrl) => {
          handleAddPlaylistItem(title, url, artist, thumbnailUrl);
        }}
        currentPlaylist={trip?.playlist || []}
      />

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        existingMembers={trip?.members || []}
        onAddMembers={handleAddMembersToTrip}
        lang={lang}
        t={t}
      />

      <CreateTripModal trips={tripsList} 
        isOpen={showCreateTripModal}
        onClose={() => {
          setShowCreateTripModal(false);
          setEditingTripId(null);
          setAiPreFilledData(null);
        }}
        initialData={modalInitialData}
        onCreate={async (data) => {
          if (!currentUser) return;
          const userId = currentUser.id;
          
          if (editingTripId) {
            const currentTrip = tripsList.find(t => t.id === editingTripId);
            if (!currentTrip) return;

            const existingMembers = currentTrip.members;
            const updatedMembers = data.members.map((m, i) => {
              const existing = existingMembers.find(em => em.name === m.name);
              if (existing) {
                return { ...existing, upiId: m.upiId || existing.upiId };
              }
              return {
                id: "m" + Date.now() + i,
                name: m.name,
                color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"][i % 6],
                totalDeposited: m.deposit ? parseFloat(m.deposit) : 0,
                upiId: m.upiId
              };
            });
            const adminIdx = data.members.findIndex(m => m.isAdmin);
            const newAdminId = adminIdx !== -1 ? updatedMembers[adminIdx].id : currentTrip.adminId;
            
            const updatedTrip: TripGroup = { 
              ...currentTrip, 
              name: data.name, 
              userEmail: currentTrip.userEmail || currentUser?.email?.toLowerCase(),
              userId: currentTrip.userId || currentUser?.id,
              startDate: data.startDate, 
              endDate: data.endDate, 
              calculationMode: data.calculationMode,
              defaultCurrency: data.defaultCurrency || currentTrip.defaultCurrency || 'INR',
              themeColor: data.themeColor || currentTrip.themeColor || '#6366f1',
              members: updatedMembers, 
              adminId: newAdminId
            };

            await updateTripState(updatedTrip);
            setEditingTripId(null);
            setShowCreateTripModal(false);
          } else {
            const adminMemberIndex = data.members.findIndex(m => m.isAdmin);
            const actualAdminMemberIndex = adminMemberIndex !== -1 ? adminMemberIndex : 0;
            const newMembers = data.members.map((m, i) => {
              const isThisAdmin = i === actualAdminMemberIndex;
              return {
                id: isThisAdmin ? userId : "m" + Date.now() + i,
                name: m.name,
                color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"][i % 6],
                totalDeposited: m.deposit ? parseFloat(m.deposit) : 0,
                upiId: m.upiId
              };
            });
            const newTripExpenses = (data.importedExpenses || []).map((exp, expIdx) => {
              const matchedPayer = newMembers.find(m => m.name.toLowerCase().trim() === exp.paidBy.toLowerCase().trim());
              const payerId = matchedPayer ? matchedPayer.id : (newMembers[actualAdminMemberIndex]?.id || userId);
              return {
                id: "exp_imp_" + Date.now() + "_" + expIdx,
                title: exp.title,
                amount: exp.amount,
                date: exp.date,
                category: exp.category,
                paidBy: payerId,
                splitWith: newMembers.map(m => m.id),
              };
            });

            const unsplashImg = await fetchLocationImage(data.name);
            const wallpaperUrl = unsplashImg?.url || undefined;
            const logoUrl = unsplashImg?.thumb || undefined;

            const newTrip: TripGroup = {
              ...DEFAULT_TRIP,
              id: "trip_" + Date.now(),
              name: data.name,
              userEmail: currentUser?.email?.toLowerCase(),
              userId: currentUser?.id,
              startDate: data.startDate,
              endDate: data.endDate,
              calculationMode: data.calculationMode,
              defaultCurrency: data.defaultCurrency || 'INR',
              themeColor: data.themeColor || '#6366f1',
              wallpaperUrl,
              logoUrl,
              adminId: newMembers[actualAdminMemberIndex]?.id || userId,
              members: newMembers,
              expenses: newTripExpenses,
              deposits: data.members.filter(m => m.deposit && parseFloat(m.deposit) > 0).map((m, i) => ({
                id: "dep_init_" + Date.now() + i,
                memberId: newMembers[data.members.findIndex(x => x.name === m.name)].id,
                amount: parseFloat(m.deposit),
                date: new Date().toISOString().split("T")[0],
                note: "Initial Deposit"
              })),
              itinerary: [],
              status: 'ACTIVE'
            };
            await updateTripState(newTrip);
            setActiveTripId(newTrip.id);
            setShowCreateTripModal(false);
          }
          triggerToast(editingTripId ? "Trip updated!" : "Trip created!");
        }}
      />

      {trip && activeTripId && !isTripCompleted && (
        <FloatingAITripManager
          trip={trip}
          lang={lang}
          t={t}
          currencySymbol={currencySymbol}
          isHidden={showExpenseModal || showAddMemberModal || showFuelCalculatorModal || showCreateTripModal || showStoryModal || showDepositModal || showLanguageOnboardingModal}
          onAddExpense={() => {
            setEditingExpenseId(null);
            setExpenseTitle("");
            setExpenseAmount("");
            setExpenseCategory("food");
            setExpensePaidBy(validAdminId || "");
            setExpenseSplitWith(trip?.members?.map(m => m.id) || []);
            setExpenseDate(new Date().toISOString().split("T")[0]);
            setShowExpenseModal(true);
          }}
          onSearchFlights={() => setActiveTab('bookings')}
          onOpenFuelCalculator={() => setShowFuelCalculatorModal(true)}
          onInviteWhatsApp={async () => {
            const inviteText = lang === 'mr'
              ? `नमस्कार! मी "${trip?.name}" या सहलीचे नियोजन करत आहे ✈️. ग्रुपमध्ये सहभागी व्हा:\n${window.location.origin}`
              : `Join my trip "${trip?.name}":\n${window.location.origin}`;
            await safeCopyToClipboard(inviteText);
            triggerToast(lang === 'mr' ? 'लिंक कॉपी झाली!' : 'Link copied!');
          }}
          onAddItineraryPlan={() => setShowPlanModal(true)}
          onAddMember={() => setShowAddMemberModal(true)}
          
        />
      )}

      <StoryExport trip={trip} lang={lang} isOpen={showStoryModal} onClose={() => setShowStoryModal(false)} />

      {/* Offline/Sync Indicator */}
      <AnimatePresence>
        {(isOffline || isSyncing) && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-[110px] left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className={`px-4 py-2.5 rounded-full backdrop-blur-xl border flex items-center gap-2.5 shadow-2xl ${isSyncing ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-slate-900/90 border-slate-700 text-white'}`}>
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span className="text-sm font-bold uppercase tracking-widest">{lang === 'mr' ? 'सिंक होत आहे...' : 'Syncing...'}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold uppercase tracking-widest">{lang === 'mr' ? 'ऑफलाइन मोड' : 'Offline Mode'}</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-2 w-[90%] max-w-sm">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`px-6 py-4 rounded-3xl shadow-xl border flex items-center gap-3 backdrop-blur-xl ${
                n.type === 'success' ? 'bg-emerald-600/90 border-emerald-500 text-white' : 'bg-rose-600/90 border-rose-500 text-white'
              }`}
            >
              {n.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              <span className="text-sm font-black uppercase tracking-wider">{n.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* New Version Available Toast */}
      <AnimatePresence>
        {newUpdateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-[180px] left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
          >
            <button
              onClick={async () => {
                try {
                  if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(key => caches.delete(key)));
                  }
                  if ('serviceWorker' in navigator) {
                    const reg = await navigator.serviceWorker.getRegistration();
                    if (reg && reg.waiting) {
                      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }
                  }
                } catch (e) {
                  console.error(e);
                }
                window.location.reload();
              }}
              className="w-full px-5 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-3xl shadow-2xl border border-emerald-400/50 flex items-center justify-between gap-3 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >

              <div className="flex items-center gap-2.5 text-left">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                  {lang === 'mr' ? 'नवीन आवृत्ती उपलब्ध आहे! ✨' : 'New version available! ✨'}
                </span>
              </div>
              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap">
                {lang === 'mr' ? 'रिफ्रेश करा' : 'Tap to Refresh'}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <MusicPlayerBar lang={lang} themeColor={trip?.themeColor || '#6366f1'} />
      <SmartPlanLoadingOverlay isVisible={isAIGenerating} steps={loadingSteps} lang={lang} />
      <AuthModal wallpaperUrl={trip?.wallpaperUrl || '/screenshot-desktop.png'} logoUrl={trip?.logoUrl || '/logo.svg'} />
      <WelcomeTourModal
        isOpen={showWelcomeTour}
        onClose={() => {
          setShowWelcomeTour(false);
          localStorage.setItem('hasSeenTutorial', 'true');
          localStorage.setItem('pravas_language_selected', 'true');
        }}
        lang={lang}
      />
      </div>
    </MusicPlayerProvider>
    </ErrorBoundary>
  );
}
