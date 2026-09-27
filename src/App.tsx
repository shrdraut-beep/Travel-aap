import React, { useState, useEffect } from 'react';
import { Splash } from './components/routripo/Splash';
import { LoginScreen } from './premium/LoginScreen';
import { UserLandingPage } from './premium/UserLandingPage';

import { PremiumShell } from './premium/layouts/PremiumShell';
import { GlobalTripsTab } from './premium/account/GlobalTripsTab';
import { PremiumPlanTab } from './premium/account/PremiumPlanTab';
import { PremiumSocialTab } from './premium/account/PremiumSocialTab';
import { PremiumDocsTab } from './premium/account/PremiumDocsTab';
import { BargainingTab } from './premium/account/BargainingTab';
import { ExpensesTab } from './premium/account/ExpensesTab';
import { SettingsTab } from './premium/account/SettingsTab';
import { Gavel, Briefcase, Compass, User, Wallet, Calendar, Users, FileText, Plus } from 'lucide-react';

import { AccountScreen } from './premium/account/AccountScreen';
import { AdminScreen } from './premium/admin/AdminScreen';
import { AgentScreen } from './premium/agent/AgentScreen';
import type { AccountItemId } from './premium/account/types';
import { BottomNav } from './premium/mobile/BottomNav';
import type { NavTab, SearchPayload } from './premium/mobile/types';
import type { Offer } from './premium/mobile/OffersRail';
import type { Destination } from './premium/mobile/DestinationRail';

// Sub-screens & views
import { KharchScreen } from './components/routripo/KharchScreen';
import { SocialScreen } from './components/routripo/TripsScreen';
import { NewTripScreen } from './components/routripo/NewTripScreen';
import { FutureTripScreen } from './components/routripo/FutureTripScreen';

// Modals
import { FutureTripModal } from "./components/modals/FutureTripModal";
import { SosModal } from './components/modals/SosModal';
import { CreateTripModal } from './components/modals/CreateTripModal';
import { FuelCalculatorModal } from './components/modals/FuelCalculatorModal';
import { SmartExpenseScannerModal } from './components/modals/SmartExpenseScannerModal';
import { BudgetDashboardModal } from './components/modals/BudgetDashboardModal';
import { UpiQrModal } from './components/UpiQrModal';
import { SecurityThreatModal } from './components/security/SecurityThreatModal';
import { checkSecurityStatus } from './security/rasp';
import { CommunityHubView } from './components/views/CommunityHubView';
import { GroupDecisionPolls } from './components/planning/GroupDecisionPolls';
import { MemoriesView } from './components/views/MemoriesView';
import { GroupSplitPaymentModal } from './components/common/GroupSplitPaymentModal';
import { CancellationRefundModal } from './components/routripo/CancellationRefundModal';
import { LegalPolicyModal } from './components/legal/LegalPolicyModal';
import { 
  BargainNewRequestModal, 
  BargainChatModal, 
  VouchersModal, 
  SecretOffersModal,
  WalletModal, 
  BillScannerModal, 
  TravelCalendarModal, 
  LanguageModal, 
  CurrencyModal, 
  OfferDetailModal, 
  DestinationDetailModal,
  PremiumModalWrapper
} from './premium/modals/PremiumModals';
import { WalletFlowPage } from './premium/user/flows/WalletFlowPage';
import { VouchersOffersFlowPage } from './premium/user/flows/VouchersOffersFlowPage';

// Providers & Stores
import { useTripContext } from './context/TripContext';
import { useAuthStore } from './store/useAuthStore';
// Real Firebase Auth (signInWithEmail/signUpWithEmail from './firebase', doc/getDoc from
// 'firebase/firestore') is built and ready but intentionally not imported here yet — see
// handleLoginSubmit below.
import { useLanguage } from './context/LanguageContext';
import { useCurrency, CurrencyProvider } from './components/booking/useCurrency';
import { BookingFlowProvider } from './context/BookingFlowContext';
import { MusicPlayerProvider } from './components/MusicPlayerContext';
import { MusicPlayerBar } from './components/MusicPlayerBar';
import { initCrashlytics, crashlytics } from './services/crashlytics';
import { CrashlyticsErrorBoundary } from './components/common/CrashlyticsErrorBoundary';

// Router & Booking Result Pages
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { FlightFareSelectionPage } from './pages/FlightFareSelectionPage';
import { FlightPassengerDetailsPage } from './pages/FlightPassengerDetailsPage';
import { FlightSeatSelectionPage } from './pages/FlightSeatSelectionPage';
import { FlightMealsSelectionPage } from './pages/FlightMealsSelectionPage';
import { FlightBaggageSelectionPage } from './pages/FlightBaggageSelectionPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { StaysDetailsPage } from './pages/StaysDetailsPage';
import { StaysResultsPage } from './pages/StaysResultsPage';
import { StaysCheckoutPage } from './pages/StaysCheckoutPage';
import { FlightsResultsPage } from './pages/FlightsResultsPage';
import { CarsResultsPage } from './pages/CarsResultsPage';
import { BusResultsPage } from './pages/BusResultsPage';
import { BusSeatMapPage } from './pages/BusSeatMapPage';
import { CarResultsPage } from './pages/CarResultsPage';
import { AncillariesFlow } from './pages/AncillariesFlow';
import { OrderReviewPage } from './pages/OrderReviewPage';
import { LegalPolicyPage } from './pages/LegalPolicyPage';
import { BookingFlowCoordinator } from './premium/booking/BookingFlowCoordinator';
import type { FlightSearchParams } from './premium/booking/FlightResultsStep';
import { HotelBookingCoordinator } from './premium/booking/HotelBookingCoordinator';
import type { HotelSearchParams } from './premium/booking/HotelBookingCoordinator';
import { BusBookingCoordinator } from './premium/booking/BusBookingCoordinator';
import type { BusSearchParams } from './premium/booking/BusBookingCoordinator';
import { CarBookingCoordinator } from './premium/booking/CarBookingCoordinator';
import type { CarSearchParams } from './premium/booking/CarBookingCoordinator';
import { HolidayBookingCoordinator } from './premium/booking/HolidayBookingCoordinator';
import type { HolidaySearchParams } from './premium/booking/HolidayBookingCoordinator';

function MainApp() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"splash" | "login" | "app">("splash");
  const [role, setRole] = useState<"user" | "agent" | "admin">("user");
  
  // NEW REORGANIZED STATE (Premium)
  const [globalTab, setGlobalTab] = useState<string>("bargaining");
  const [tripTab, setTripTab] = useState<string>("plan");
  const [isTripLevel, setIsTripLevel] = useState(false);

  const currentUser = useAuthStore(state => state.currentUser);
  const initAuthListener = useAuthStore(state => state.initAuthListener);
  const { lang } = useLanguage();
  const { currency } = useCurrency();
  const { addNewTrip, trips, activeTrip, updateActiveTrip, selectTripById } = useTripContext();

  // Modals state
  const [isBargainNewOpen, setIsBargainNewOpen] = useState(false);
  const [isBargainChatOpen, setIsBargainChatOpen] = useState(false);
  const [isVouchersOpen, setIsVouchersOpen] = useState(false);
  const [isSecretOffersOpen, setIsSecretOffersOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);

  // Root cause of "sub-pages open at the bottom/middle instead of the top": this app
  // swaps screens via conditional rendering (phase/tab/isXOpen state), not real
  // browser navigation — so the browser never resets scroll position on its own.
  // This resets both the window and any screen-level scroll container whenever a
  // "screen" changes. Individual screens that manage their own internal
  // overflow-y-auto container (instead of relying on window scroll) still need
  // their own local reset — this covers the app-root level, which is the common case.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('app-scroll-root')?.scrollTo(0, 0);
  }, [phase, isAiPlannerOpen, isCreateTripOpen, isTripLevel, globalTab, tripTab]);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [showFuelCalc, setShowFuelCalc] = useState(false);
  const [isCancellationOpen, setIsCancellationOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [activeLegalPolicy, setActiveLegalPolicy] = useState<string>('terms');
  const [infoModal, setInfoModal] = useState<{ title: string; subtitle?: string; content: string } | null>(null);
  const [activeFlightSearch, setActiveFlightSearch] = useState<FlightSearchParams | null>(null);
  const [activeHotelSearch, setActiveHotelSearch] = useState<HotelSearchParams | null>(null);
  const [activeBusSearch, setActiveBusSearch] = useState<BusSearchParams | null>(null);
  const [activeCarSearch, setActiveCarSearch] = useState<CarSearchParams | null>(null);
  const [activeHolidaySearch, setActiveHolidaySearch] = useState<HolidaySearchParams | null>(null);
  const [isBudgetDashboardOpen, setIsBudgetDashboardOpen] = useState(false);
  const [isUpiQrOpen, setIsUpiQrOpen] = useState(false);
  const [isCommunityHubOpen, setIsCommunityHubOpen] = useState(false);
  const [isPollsOpen, setIsPollsOpen] = useState(false);
  const [isMemoriesOpen, setIsMemoriesOpen] = useState(false);
  const [isGroupSplitOpen, setIsGroupSplitOpen] = useState(false);
  const [isLegalVaultOpen, setIsLegalVaultOpen] = useState(false);
  const [isThreatModalOpen, setIsThreatModalOpen] = useState(false);
  const [securityThreats, setSecurityThreats] = useState<string[]>([]);

  React.useEffect(() => {
    initCrashlytics();
    checkSecurityStatus()
      .then((sec) => {
        if (!sec.safeToRun && sec.threatDetails && sec.threatDetails.length > 0) {
          setSecurityThreats(sec.threatDetails);
          setIsThreatModalOpen(true);
        }
      })
      .catch((e) => {
        console.warn('RASP security check notice:', e);
      });
  }, []);

  React.useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  React.useEffect(() => {
    crashlytics.setUserId(currentUser?.id || null);
    if (currentUser?.email) {
      crashlytics.setCustomKey('userEmail', currentUser.email);
    }
  }, [currentUser]);

  // Global event listeners for modal triggers
  React.useEffect(() => {
    const handleOpenKharch = () => { setIsTripLevel(true); setTripTab('expenses'); };
    const handleOpenFuel = () => setShowFuelCalc(true);
    const handleOpenPlan = () => { setIsTripLevel(true); setTripTab('plan'); };
    
    const handleConvertSmartTrip = (tripPayload: any) => {
      let parsedItinerary = [];
      try {
         const planObj = typeof tripPayload.aiPlan === 'string' ? JSON.parse(tripPayload.aiPlan) : tripPayload.aiPlan;
         if (planObj && planObj.itinerary) {
           parsedItinerary = planObj.itinerary;
         } else if (Array.isArray(planObj)) {
           parsedItinerary = planObj;
         }
      } catch (e) {
         console.warn("Failed to parse aiPlan", e);
      }
      
      const newTripData = {
        name: tripPayload.name || "AI Generated Trip",
        destination: tripPayload.name || "Destination",
        budget: tripPayload.budget || 25000,
        itinerary: parsedItinerary,
        members: [{ id: "m-me", name: "Me", color: "#ec4899", totalDeposited: 0 }],
        startDate: new Date().toISOString().split("T")[0]
      };
      
      if (addNewTrip) {
        addNewTrip(newTripData);
      }
      setIsTripLevel(true);
      setTripTab("plan");
    };

    window.addEventListener("open-kharch-modal", handleOpenKharch);
    window.addEventListener("open-fuel-calculator", handleOpenFuel);
    window.addEventListener("open-add-plan-modal", handleOpenPlan);
    const handleOpenLegal = (e: any) => {
      setIsLegalModalOpen(true);
      if (e.detail?.policyId) {
        setActiveLegalPolicy(e.detail.policyId);
      }
    };
    window.addEventListener("open-legal-modal", handleOpenLegal);
    const handleConvertEvent = (e: any) => {
      if (e.detail) handleConvertSmartTrip(e.detail);
    };
    window.addEventListener("convert-smart-trip", handleConvertEvent);
    
    return () => {
      window.removeEventListener("open-kharch-modal", handleOpenKharch);
      window.removeEventListener("open-fuel-calculator", handleOpenFuel);
      window.removeEventListener("open-add-plan-modal", handleOpenPlan);
      window.removeEventListener("open-legal-modal", handleOpenLegal);
      window.removeEventListener("convert-smart-trip", handleConvertEvent);
    };
  }, [addNewTrip]);

  const handleSearch = (payload: any) => {
    if (!payload) return;
    console.log("Processing search for mode:", payload.mode, payload);

    const formatDate = (d: any, fallbackDays: number) => {
      if (!d) return new Date(Date.now() + 86400000 * fallbackDays).toISOString().split("T")[0];
      if (d instanceof Date) return d.toISOString().split("T")[0];
      return String(d).split("T")[0];
    };

    if (payload.mode === "hotels") {
      setActiveHotelSearch({
        destination: payload.destination || payload.origin || "Mumbai",
        checkInDate: formatDate(payload.dates?.start, 1),
        checkOutDate: formatDate(payload.dates?.end, 3),
        adults: payload.travellers?.adults || 2,
        rooms: payload.rooms || 1
      });
    } else if (payload.mode === "buses") {
      setActiveBusSearch({
        origin: payload.origin || "Mumbai",
        destination: payload.destination || "Goa",
        date: formatDate(payload.dates?.start, 1),
        passengers: payload.travellers?.adults || 1
      });
    } else if (payload.mode === "cabs") {
      setActiveCarSearch({
        location: payload.origin || "Mumbai",
        pickupDate: formatDate(payload.dates?.start, 1),
        dropDate: formatDate(payload.dates?.end, 3),
        passengers: payload.travellers?.adults || 2
      });
    } else if (payload.mode === "holidays") {
      setActiveHolidaySearch({
        location: payload.destination || "Maldives",
        startDate: formatDate(payload.dates?.start, 1),
        travelers: payload.travellers?.adults || 2
      });
    } else {
      const extractCode = (str: string, fallback: string) => {
        if (!str) return fallback;
        const match = str.match(/\(([A-Z]{3})\)/);
        if (match) return match[1];
        if (str.length === 3) return str.toUpperCase();
        const firstWord = str.split(/[\s,]+/)[0];
        return firstWord.toUpperCase().slice(0, 3) || fallback;
      };

      const org = extractCode(payload.origin, "BOM");
      const dst = extractCode(payload.destination, "DEL");
      const departDate = formatDate(payload.dates?.start, 1);
      const returnDate = payload.dates?.end ? formatDate(payload.dates.end, 3) : undefined;

      const searchParamsObj: FlightSearchParams = {
        origin: org,
        destination: dst,
        departDate,
        returnDate,
        adults: payload.travellers?.adults || 1,
        children: payload.travellers?.children || 0,
        infants: payload.travellers?.infants || 0,
        cabinClass: payload.cabin || "Economy",
        tripType: payload.tripType === "round" ? "roundTrip" : payload.tripType === "multicity" ? "multiCity" : "oneWay",
        slices: payload.legs
      };

      setActiveFlightSearch(searchParamsObj);
    }
  };

  const handleCreateTrip = (tripData: any) => {
    addNewTrip(tripData);
    setIsCreateTripOpen(false);
    setIsTripLevel(true);
    setTripTab("plan");
  };

  const handleLoginSubmit = async (data: any) => {
    let userRole: "user" | "agent" | "admin" = "user";
    if (data?.role === "admin") {
      userRole = "admin";
    } else if (data?.role === "agent" || data?.role === "vendor") {
      userRole = "agent";
    } else {
      userRole = "user";
    }
    setRole(userRole);

    const userName =
      data?.name ||
      data?.identifier?.split("@")[0] ||
      (userRole === "admin"
        ? "System Admin"
        : userRole === "agent"
        ? "Shree Ganesh Travels (Vendor / Agent)"
        : "Demo Traveller");
    const userEmail = data?.identifier || data?.email || "";
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4f46e5&color=fff&bold=true`;

    useAuthStore.getState().loginWithUser({
      id: data?.id || `usr-${Date.now()}`,
      name: userName,
      email: userEmail,
      avatar,
      role: userRole
    });

    setPhase("app");
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    setRole("user");
    setPhase("login");
  };

  const handleAccountSelect = (item: string) => {
    switch (item) {
      case 'bargain-new-request':
        setIsBargainNewOpen(true);
        break;
      case 'bargain-chat':
      case 'bargain-requests':
        setIsBargainChatOpen(true);
        break;
      case 'bargain-vouchers':
        setIsVouchersOpen(true);
        break;
      case 'bargain-secret-offers':
        setIsSecretOffersOpen(true);
        break;
      case 'bargain-custom-offers':
      case 'bargain-escrow':
      case 'bargain-budget-advisory':
        setInfoModal({
          title: 'Coming Soon',
          content: 'This feature is currently being developed for VIP users.'
        });
        break;
      case 'expenses-scanner':
        setIsScannerOpen(true);
        break;
      case 'expenses-fuel':
        setShowFuelCalc(true);
        break;
      case 'expenses-budget':
      case 'expenses-dashboard':
        setIsBudgetDashboardOpen(true);
        break;
      case 'expenses-split':
        setIsGroupSplitOpen(true);
        break;
      case 'social-community':
      case 'community':
        setIsCommunityHubOpen(true);
        break;
      case 'social-polls':
      case 'polls':
        setIsPollsOpen(true);
        break;
      case 'social-memories':
      case 'memories':
        setIsMemoriesOpen(true);
        break;
      case 'legal-vault':
      case 'vault':
        setIsLegalVaultOpen(true);
        break;
      case 'upi-pay':
      case 'upi-qr':
        setIsUpiQrOpen(true);
        break;
      case 'sos':
        setIsSosOpen(true);
        break;
      case 'expenses-pool-deposit':
        setIsTripLevel(true);
        setTripTab('expenses');
        window.dispatchEvent(new CustomEvent('switch-expense-tab', { detail: 'settlement' }));
        break;
      case 'expenses-overview':
      case 'expenses-log':
      case 'expenses-add':
        setIsTripLevel(true);
        setTripTab('expenses');
        window.dispatchEvent(new CustomEvent('switch-expense-tab', { detail: 'expenses' }));
        break;
      case 'expenses-budget-alerts':
        setInfoModal({
          title: 'Smart Budget & Expense Alerts',
          content: 'Budget alerts are active! RouTripO monitors your category spending (Stay, Food, Transport) and notifies you when expenses exceed 75% of your allocated budget.'
        });
        break;
      case 'my-tickets':
      case 'hotel-reservations':
        setIsTripLevel(true);
        setTripTab('docs');
        break;
      case 'calendar':
        setIsCalendarOpen(true);
        break;
      case 'explore-packages':
        setGlobalTab('booking');
        break;
      case 'planning-ai':
        setIsAiPlannerOpen(true);
        break;
      case 'create-trip':
        setIsCreateTripOpen(true);
        break;
      case 'profile':
      case 'settings-profile':
        setGlobalTab('settings');
        break;
      case 'wallet':
      case 'settings-wallet':
        setIsWalletOpen(true);
        break;
      case 'notifications':
      case 'settings-notifications':
        break;
      case 'support':
      case 'settings-support':
        setInfoModal({
          title: 'Customer Support',
          content: 'Our VIP travel concierge is available 24/7. Call us at +91 9876543210 or email vip@routripo.app'
        });
        break;
      case 'language':
      case 'settings-language':
        setIsLanguageOpen(true);
        break;
      case 'currency':
      case 'settings-currency':
        setIsCurrencyOpen(true);
        break;
      case 'settings-sos':
        setIsSosOpen(true);
        break;
      case 'agent-portal':
        if (currentUser?.role === 'agent' || currentUser?.role === 'admin') {
          setRole('agent');
        } else {
          setInfoModal({
            title: 'Agent Portal Access',
            content: 'Agent Portal is reserved for registered travel agents and verified operators. Please switch to an agent account.'
          });
        }
        break;
      case 'admin-dashboard':
        if (currentUser?.role === 'admin') {
          setRole('admin');
        } else {
          setInfoModal({
            title: 'Admin Access Restricted',
            content: 'Admin Dashboard is reserved for platform administrators. Please sign in with administrator credentials.'
          });
        }
        break;
      case 'logout':
      case 'settings-logout':
        handleLogout();
        break;
      case 'about':
      case 'settings-about':
      case 'policies':
        setIsLegalModalOpen(true);
        setActiveLegalPolicy('terms');
        break;
      case 'privacy':
      case 'settings-privacy':
        setIsLegalModalOpen(true);
        setActiveLegalPolicy('privacy');
        break;
      case 'delete-account':
        if(window.confirm('Are you sure you want to delete your account?')) {
           handleLogout();
        }
        break;
    }
  };

  // Watch for activeTrip changes to enter trip level automatically
  

  const activeTripForDashboard = activeTrip || trips[0] || { id: 'temp', title: 'New Trip', destination: 'Select a destination', duration: 1, type: 'leisure', members: [] };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'google') {
      try {
        const user = await useAuthStore.getState().login();
        if (user) {
          setRole('user');
          setPhase('app');
          return;
        }
      } catch (err) {
        console.warn("Real Google Sign-In notice:", err);
      }
    }
    handleLoginSubmit({
      identifier: `user@${provider}.com`,
      name: provider === 'google' ? 'Google Traveler' : 'Travel Enthusiast',
      role: 'user'
    });
  };

  return (
    <CrashlyticsErrorBoundary>
      <MusicPlayerProvider>
        <div id="app-scroll-root" className="premium-root w-full">
          {phase === "splash" && <Splash onDone={() => setPhase("login")} />}
          
          {(phase === "login" || !currentUser) && phase !== "splash" && (
            <LoginScreen 
              brandName="RouTripo"
              onSubmit={handleLoginSubmit}
              onTruecaller={(tcUser) => handleLoginSubmit({ identifier: tcUser.phone, name: `${tcUser.name} (Truecaller)`, role: tcUser.role || 'user' })}
              onSocial={handleSocialLogin}
              onForgotPassword={(id) => alert(`Password reset instructions sent to ${id || 'your email'}`)}
              onContinueAsGuest={() => handleLoginSubmit({ identifier: 'guest@routripo.app', name: 'Guest Traveller', role: 'user' })}
            />
          )}

          {phase === "app" && Boolean(currentUser) && (
            <>
              {role === 'user' && (
                <>
                  {isAiPlannerOpen ? (
                    <FutureTripScreen 
                       onBack={() => setIsAiPlannerOpen(false)} 
                       lang={lang as any} 
                       onManualEntry={() => {
                          setIsAiPlannerOpen(false);
                          setIsCreateTripOpen(true);
                       }} 
                    />
                  ) : isCreateTripOpen ? (
                    <NewTripScreen 
                       onBack={() => setIsCreateTripOpen(false)} 
                       onCreate={handleCreateTrip} 
                       trips={trips} 
                       lang={lang} 
                    />
                  ) : !isTripLevel ? (
                    <PremiumShell
                      title={currentUser?.name ? `Hi, ${currentUser.name.split(" ")[0]}` : "Welcome"}
                      subtitle={currentUser?.email || "Traveller Account"}
                      avatarChar={(currentUser?.name || "T").charAt(0).toUpperCase()}
                      activeTab={globalTab}
                      onChangeTab={setGlobalTab}
                      tabs={[
                        { id: "bargaining", label: "Bargaining", Icon: Gavel, imgSrc: "/icons/bargaining.png" },
                        { id: "trips", label: "My Trips", Icon: Briefcase, imgSrc: "/icons/my_trips.png" },
                        { id: "booking", label: "Booking", Icon: Compass, imgSrc: "/icons/booking.png" },
                        { id: "settings", label: "Profile", Icon: User, imgSrc: "/icons/profile.png" }
                      ]}
                    >
                      {globalTab === "bargaining" && <BargainingTab onSelect={handleAccountSelect} />}
                      {globalTab === "trips" && <GlobalTripsTab onCreateTrip={() => setIsCreateTripOpen(true)} onOpenAiPlanner={() => setIsAiPlannerOpen(true)} onEnterTrip={() => { setIsTripLevel(true); setTripTab("plan"); }} />}
                      {globalTab === "booking" && (
                         <UserLandingPage 
                           hideHeader={true} 
                           onNavigate={() => {}} 
                           onOpenAccount={() => setGlobalTab('settings')}
                           onSelectDestination={(d) => setSelectedDestination(d as any)}
                           onSelectOffer={(o) => setSelectedOffer(o as any)}
                           onSearch={handleSearch}
                         />
                      )}
                      {globalTab === "settings" && (
                        <div className="p-5 pb-24">
                          <SettingsTab
                            userName={currentUser?.name || "Traveller"}
                            userEmail={currentUser?.email || ""}
                            language={lang === 'mr' ? 'मराठी' : 'English'}
                            currency={currency || 'INR'}
                            userRole={role}
                            onSelect={handleAccountSelect}
                          />
                        </div>
                      )}
                    </PremiumShell>
                  ) : (
                    (() => {
                      const daysCount = (activeTripForDashboard as any).itinerary?.length || (activeTripForDashboard as any).duration || (activeTripForDashboard as any).days || 2;
                      const durationLabel = `${daysCount} ${daysCount === 1 ? 'Day' : 'Days'}`;
                      const cleanDest = (activeTripForDashboard.destination || 'Destination')
                        .replace(/\s+(Weekend\s+)?(Trip|Tour|Vacation)\b/gi, '')
                        .trim();

                      return (
                        <PremiumShell
                          title={(activeTripForDashboard as any).title || (activeTripForDashboard as any).name || 'My Trip'}
                          subtitle={`${cleanDest || 'Destination'} · ${durationLabel}`}
                          onBack={() => setIsTripLevel(false)}
                          activeTab={tripTab}
                          onChangeTab={setTripTab}
                          tabs={[
                            { id: "plan", label: "Plan", Icon: Calendar, imgSrc: "/icons/trip_plan.png" },
                            { id: "expenses", label: "Expenses", Icon: Wallet, imgSrc: "/icons/trip_expenses.png" },
                            { id: "social", label: "Social", Icon: Users, imgSrc: "/icons/trip_social.png" },
                            { id: "docs", label: "Docs", Icon: FileText, imgSrc: "/icons/trip_docs.png" }
                          ]}
                          renderFab={
                            <button 
                              onClick={() => setIsQuickAddOpen(true)}
                              className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg active:scale-95 transition-transform hover:bg-slate-800"
                            >
                              <Plus className="h-6 w-6" />
                            </button>
                          }
                        >
                          {tripTab === "expenses" && <KharchScreen hideHeader={true} onBack={() => setIsTripLevel(false)} onLogout={() => {}} />}
                          {tripTab === "plan" && <PremiumPlanTab trip={activeTripForDashboard} />}
                          {tripTab === "social" && <SocialScreen hideHeader={true} onBack={() => setIsTripLevel(false)} onLogout={() => {}} />}
                          {tripTab === "docs" && <PremiumDocsTab trip={activeTripForDashboard} />}
                        </PremiumShell>
                      );
                    })()
                  )}
                </>
              )}

              {/* Agent & Admin Screens (Dynamic Props Wired) */}
              <AgentScreen
                open={role === 'agent'}
                agencyName={currentUser?.name || "Shree Ganesh Travels (Vendor)"}
                agentEmail={currentUser?.email || "vendor@routripo.app"}
                onAction={(act) => console.log('agent action:', act)}
                onClose={() => handleLogout()}
              />
              <AdminScreen
                open={role === 'admin'}
                adminName={currentUser?.name || "System Admin"}
                adminEmail={currentUser?.email || "admin@routripo.app"}
                onAction={(act) => console.log('admin action:', act)}
                onClose={() => handleLogout()}
              />

              {/* Comprehensive Premium Modals */}
              <BargainNewRequestModal
                isOpen={isBargainNewOpen}
                onClose={() => setIsBargainNewOpen(false)}
                onSubmit={(data) => {
                  console.log('Requirement posted:', data);
                }}
              />
              <BargainChatModal
                isOpen={isBargainChatOpen}
                onClose={() => setIsBargainChatOpen(false)}
                onOpenVouchers={() => {
                  setIsBargainChatOpen(false);
                  setIsVouchersOpen(true);
                }}
              />
              {isVouchersOpen && (
                <VouchersOffersFlowPage
                  initialTab="passes"
                  onClose={() => setIsVouchersOpen(false)}
                />
              )}
              {isSecretOffersOpen && (
                <VouchersOffersFlowPage
                  initialTab="secret"
                  onClose={() => setIsSecretOffersOpen(false)}
                />
              )}
              {isWalletOpen && (
                <WalletFlowPage
                  onClose={() => setIsWalletOpen(false)}
                />
              )}
              <BillScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
              />
              <TravelCalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
              />
              <LanguageModal
                isOpen={isLanguageOpen}
                onClose={() => setIsLanguageOpen(false)}
              />
              <CurrencyModal
                isOpen={isCurrencyOpen}
                onClose={() => setIsCurrencyOpen(false)}
              />
              <OfferDetailModal
                isOpen={Boolean(selectedOffer)}
                onClose={() => setSelectedOffer(null)}
                offer={selectedOffer}
              />
              <DestinationDetailModal
                isOpen={Boolean(selectedDestination)}
                onClose={() => setSelectedDestination(null)}
                destination={selectedDestination as any}
                onBook={() => {
                   setGlobalTab('booking');
                   setSelectedDestination(null);
                }}
              />
              <SosModal
                isOpen={isSosOpen}
                onClose={() => setIsSosOpen(false)}
              />
              <CancellationRefundModal
                isOpen={isCancellationOpen}
                onClose={() => setIsCancellationOpen(false)}
                contract={null}
              />
              <LegalPolicyModal
                isOpen={isLegalModalOpen}
                onClose={() => setIsLegalModalOpen(false)}
                initialPolicyId={activeLegalPolicy}
              />
              {showFuelCalc && (
                <FuelCalculatorModal 
                  isOpen={showFuelCalc}
                  onClose={() => setShowFuelCalc(false)} 
                  lang={lang} 
                  currencySymbol="₹"
                  onAddAsExpense={(calculatedCost) => {
                    setShowFuelCalc(false);
                  }}
                />
              )}

              {/* Smart Expense OCR Scanner Modal */}
              <SmartExpenseScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                lang={lang}
                themeColor="#ec4899"
                onAddDetectedExpense={(exp) => {
                  console.log("Detected expense:", exp);
                  setIsScannerOpen(false);
                }}
              />

              {/* Budget Dashboard Modal */}
              {isBudgetDashboardOpen && activeTripForDashboard && (
                <BudgetDashboardModal
                  isOpen={isBudgetDashboardOpen}
                  onClose={() => setIsBudgetDashboardOpen(false)}
                  trip={activeTripForDashboard as any}
                  lang={lang}
                />
              )}

              {/* UPI QR Payment Modal */}
              {isUpiQrOpen && (
                <UpiQrModal
                  member={{
                    id: currentUser?.id || 'm-me',
                    name: currentUser?.name || 'Traveler',
                    color: '#ec4899',
                    totalDeposited: 0,
                    upiId: 'routripo.pay@upi'
                  }}
                  amount={500}
                  currencySymbol="₹"
                  lang={lang}
                  t={(k) => k}
                  onClose={() => setIsUpiQrOpen(false)}
                />
              )}

              {/* Group Split Payment Modal */}
              <GroupSplitPaymentModal
                isOpen={isGroupSplitOpen}
                onClose={() => setIsGroupSplitOpen(false)}
                title={activeTripForDashboard?.destination || "Goa Vacation"}
                bookingRef={`SPLIT-${Date.now().toString().slice(-6)}`}
                totalAmount={10000}
              />

              {/* RASP Anti-Tamper Security Threat Modal */}
              <SecurityThreatModal
                isOpen={isThreatModalOpen}
                threats={securityThreats}
                onDismiss={() => setIsThreatModalOpen(false)}
              />

              {/* Community Hub Modal */}
              {isCommunityHubOpen && (
                <PremiumModalWrapper
                  isOpen={isCommunityHubOpen}
                  onClose={() => setIsCommunityHubOpen(false)}
                  title="Travel Community Hub"
                  subtitle="Discover verified stories, reviews & tips"
                >
                  <div className="p-2 max-h-[75vh] overflow-y-auto">
                    <CommunityHubView
                      lang={lang}
                      onCloneTemplate={(tpl) => console.log('Cloned template:', tpl)}
                    />
                  </div>
                </PremiumModalWrapper>
              )}

              {/* Group Decision Polls Modal */}
              {isPollsOpen && activeTripForDashboard && (
                <PremiumModalWrapper
                  isOpen={isPollsOpen}
                  onClose={() => setIsPollsOpen(false)}
                  title="Group Decision Polls"
                  subtitle="Vote on stays, dinner spots & activities"
                >
                  <div className="p-4 max-h-[75vh] overflow-y-auto">
                    <GroupDecisionPolls
                      trip={activeTripForDashboard as any}
                      userId={currentUser?.id || 'user_1'}
                      onUpdateTrip={(updated) => console.log('Updated trip poll:', updated)}
                    />
                  </div>
                </PremiumModalWrapper>
              )}

              {/* Shared Trip Memories Modal */}
              {isMemoriesOpen && (
                <PremiumModalWrapper
                  isOpen={isMemoriesOpen}
                  onClose={() => setIsMemoriesOpen(false)}
                  title="Shared Memories & Gallery"
                  subtitle="Collaborative photo journal of your trip"
                >
                  <div className="p-2 max-h-[75vh] overflow-y-auto">
                    <MemoriesView
                      trip={activeTripForDashboard as any}
                      lang={lang}
                      t={(k) => k}
                      onUpdateTrip={(t) => console.log('Updated trip memories:', t)}
                    />
                  </div>
                </PremiumModalWrapper>
              )}

              {/* Zero-Trust Legal Vault Modal */}
              {isLegalVaultOpen && (
                <PremiumModalWrapper
                  isOpen={isLegalVaultOpen}
                  onClose={() => setIsLegalVaultOpen(false)}
                  title="Zero-Trust Legal Vault"
                  subtitle="AES-256-GCM Envelope Encrypted Document Locker"
                >
                  <div className="p-4 space-y-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs">
                      🔒 All uploaded documents are wrapped with Master KEK and per-user DEKs before storing in the cloud.
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                        <div>
                          <p className="text-xs font-bold text-slate-800">Passport / National ID</p>
                          <p className="text-[10px] text-slate-500">Status: Encrypted & Verified</p>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                        <div>
                          <p className="text-xs font-bold text-slate-800">Travel Insurance Certificate</p>
                          <p className="text-[10px] text-slate-500">Coverage up to ₹10,00,000</p>
                        </div>
                        <span className="text-[10px] font-black bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">Stored</span>
                      </div>
                    </div>
                  </div>
                </PremiumModalWrapper>
              )}

              {/* Quick Add Modal */}
              {isQuickAddOpen && (
                <PremiumModalWrapper
                  isOpen={isQuickAddOpen}
                  onClose={() => setIsQuickAddOpen(false)}
                  title="Quick Actions"
                  subtitle="Add a new item to your trip"
                >
                  <div className="p-5 space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickAddOpen(false);
                        setTripTab("expenses");
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent("trigger-add-expense"));
                        }, 100);
                      }}
                      className="flex items-center gap-3 w-full p-4 rounded-[20px] bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-800 text-[14px]">Add Expense</span>
                        <span className="block font-medium text-slate-500 text-[12px]">Split costs or log a payment</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickAddOpen(false);
                        setTripTab("plan");
                      }}
                      className="flex items-center gap-3 w-full p-4 rounded-[20px] bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-800 text-[14px]">Plan Activity</span>
                        <span className="block font-medium text-slate-500 text-[12px]">Add an event to itinerary</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickAddOpen(false);
                        setTripTab("docs");
                      }}
                      className="flex items-center gap-3 w-full p-4 rounded-[20px] bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-800 text-[14px]">Upload Document</span>
                        <span className="block font-medium text-slate-500 text-[12px]">Save ticket, booking, or visa</span>
                      </div>
                    </button>
                  </div>
                </PremiumModalWrapper>
              )}

              {/* Generic Information Modal */}
              {infoModal && (
                <PremiumModalWrapper
                  isOpen={Boolean(infoModal)}
                  onClose={() => setInfoModal(null)}
                  title={infoModal.title}
                  subtitle={infoModal.subtitle}
                >
                  <div className="space-y-4">
                    <div className="p-4 bg-transparent rounded-2xl border border-slate-100 text-[13px] font-medium leading-relaxed whitespace-pre-line text-slate-700">
                      {infoModal.content}
                    </div>
                    <button
                      type="button"
                      onClick={() => setInfoModal(null)}
                      className="premium-gradient w-full h-11 rounded-full text-white text-[13px] font-bold active:scale-98 transition shadow-sm"
                    >
                      Close & Continue
                    </button>
                  </div>
                </PremiumModalWrapper>
              )}

              {activeFlightSearch && (
                <BookingFlowCoordinator
                  initialSearchParams={activeFlightSearch}
                  onClose={() => setActiveFlightSearch(null)}
                />
              )}

              {activeHotelSearch && (
                <HotelBookingCoordinator
                  initialSearchParams={activeHotelSearch}
                  onClose={() => setActiveHotelSearch(null)}
                />
              )}

              {activeBusSearch && (
                <BusBookingCoordinator
                  initialSearchParams={activeBusSearch}
                  onClose={() => setActiveBusSearch(null)}
                />
              )}

              {activeCarSearch && (
                <CarBookingCoordinator
                  initialSearchParams={activeCarSearch}
                  onClose={() => setActiveCarSearch(null)}
                />
              )}
              {activeHolidaySearch && (
                <HolidayBookingCoordinator
                  initialSearchParams={activeHolidaySearch}
                  onExit={() => setActiveHolidaySearch(null)}
                />
              )}
            </>
          )}
        </div>
        {role === 'user' && phase === 'app' && <MusicPlayerBar lang="en" themeColor="#7b3ff2" />}
      </MusicPlayerProvider>
    </CrashlyticsErrorBoundary>
  );
}


export default function App() {
  const location = useLocation();
  const currentUser = useAuthStore(state => state.currentUser);

  const isLegalRoute = [
    '/legal',
    '/terms',
    '/privacy',
    '/cancellation-refund',
    '/refund-policy',
    '/dpdp',
    '/bargaining-policy',
    '/bargaining'
  ].includes(location.pathname) || location.pathname.startsWith('/legal/');

  const isOverlayRoute = isLegalRoute || (Boolean(currentUser) && [
    '/checkout', 
    '/stays/results', 
    '/stays/details',
    '/stays/checkout',
    '/flights/results', 
    '/flights/fares',
    '/flights/passengers',
    '/flights/seats',
    '/flights/meals',
    '/flights/baggage',
    '/cars/results',
    '/cars',
    '/buses',
    '/buses/seatmap',
    '/ancillaries',
    '/order-review'
  ].includes(location.pathname));

  return (
    <CurrencyProvider>
      <BookingFlowProvider>
        <div className="premium-root min-h-screen w-full bg-[var(--premium-page)] text-[var(--premium-ink)]">
          <div style={{ display: isOverlayRoute ? 'none' : 'block' }}>
            <MainApp />
          </div>

          <Routes>
            {/* Public Legal Policies & Compliance Routes */}
            <Route path="/legal" element={<LegalPolicyPage />} />
            <Route path="/legal/:policyId" element={<LegalPolicyPage />} />
            <Route path="/terms" element={<LegalPolicyPage />} />
            <Route path="/privacy" element={<LegalPolicyPage />} />
            <Route path="/cancellation-refund" element={<LegalPolicyPage />} />
            <Route path="/refund-policy" element={<LegalPolicyPage />} />
            <Route path="/dpdp" element={<LegalPolicyPage />} />
            <Route path="/bargaining-policy" element={<LegalPolicyPage />} />
            <Route path="/bargaining" element={<LegalPolicyPage />} />

            {/* Authenticated Checkout & Booking Flow Routes */}
            {currentUser && (
              <>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/stays/results" element={<StaysResultsPage />} />
                <Route path="/stays/details" element={<StaysDetailsPage />} />
                <Route path="/stays/checkout" element={<StaysCheckoutPage />} />
                <Route path="/flights/results" element={<FlightsResultsPage />} />
                <Route path="/flights/fares" element={<FlightFareSelectionPage />} />
                <Route path="/flights/passengers" element={<FlightPassengerDetailsPage />} />
                <Route path="/flights/seats" element={<FlightSeatSelectionPage />} />
                <Route path="/flights/meals" element={<FlightMealsSelectionPage />} />
                <Route path="/flights/baggage" element={<FlightBaggageSelectionPage />} />
                <Route path="/cars/results" element={<CarsResultsPage />} />
                <Route path="/buses" element={<BusResultsPage />} />
                <Route path="/buses/seatmap" element={<BusSeatMapPage />} />
                <Route path="/cars" element={<CarResultsPage />} />
                <Route path="/ancillaries" element={<AncillariesFlow flightOffer={{}} onComplete={(data) => console.log(data)} />} />
                <Route path="/order-review" element={<OrderReviewPage />} />
              </>
            )}
          </Routes>
        </div>
      </BookingFlowProvider>
    </CurrencyProvider>
  );
}

