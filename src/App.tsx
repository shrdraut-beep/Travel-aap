import React, { useState } from 'react';
import { Splash } from './components/routripo/Splash';
import { LoginScreen } from './components/routripo/LoginScreen';
import { HubScreen } from './components/routripo/HubScreen';
import { BookingScreen } from './components/routripo/BookingScreen';
import { KharchScreen } from './components/routripo/KharchScreen';
import { PlanningScreen } from './components/routripo/PlanningScreen';
import { AllTripsScreen } from './components/routripo/AllTripsScreen';
import { SocialScreen } from './components/routripo/TripsScreen';
import { SettingsScreen } from './components/routripo/SettingsScreen';
import { BottomNav } from './components/routripo/BottomNav';
import { NewTripScreen } from './components/routripo/NewTripScreen';
import { FutureTripScreen } from './components/routripo/FutureTripScreen';
import { SosModal } from './components/modals/SosModal';
import { CreateTripModal } from './components/modals/CreateTripModal';
import { AuthModal } from './components/modals/AuthModal';
import { useTripContext } from './context/TripContext';
import { useAuthStore } from './store/useAuthStore';
import { useLanguage } from './context/LanguageContext';
import { FuelCalculatorModal } from './components/modals/FuelCalculatorModal';
import { CurrencyProvider } from './components/booking/useCurrency';
import { BookingFlowProvider } from './context/BookingFlowContext';

import { MusicPlayerProvider } from './components/MusicPlayerContext';
import { MusicPlayerBar } from './components/MusicPlayerBar';
import { performRaspSecurityCheck } from './security/rasp';
import { SecurityThreatModal } from './components/security/SecurityThreatModal';
import { initCrashlytics, crashlytics } from './services/crashlytics';
import { CrashlyticsErrorBoundary } from './components/common/CrashlyticsErrorBoundary';


// Real, fully-wired role portals (Firestore + business logic already inside — not mockups)
import { AgentPortalView } from './components/views/AgentPortalView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { MyTicketsView } from './components/views/MyTicketsView';

import { NAV_USER_ICONS, TripsIcon, PlanningIcon, SocialIcon, BookingIcon, ExpensesIcon, SettingsIcon } from './theme/icons';
import { Ticket, Download, Tag } from 'lucide-react';
import { UserBiddingScreen } from './components/routripo/UserBiddingScreen';

import { Routes, Route, useLocation } from 'react-router-dom';
import { FlightFareSelectionPage } from './pages/FlightFareSelectionPage';
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

function MainApp() {
  const [phase, setPhase] = useState("splash");
  const [role, setRole] = useState("user"); // 'user', 'agent', 'admin'
  const [active, setActive] = useState("trips");
  const [bookingTab, setBookingTab] = useState("Menu");
  const currentUser = useAuthStore(state => state.currentUser);
  const initAuthListener = useAuthStore(state => state.initAuthListener);

  const isWorkspace = ['planning', 'expenses', 'social'].includes(active);

  const globalNavItems = [
    { key: "bidding", label: "Caught Deals", icon: Tag },
    { key: "booking", label: "Booking", icon: BookingIcon },
    { key: "trips", label: "My Trips", icon: TripsIcon },
    { key: "settings", label: "Settings", icon: SettingsIcon },
    { key: "my-tickets", label: "My Tickets", icon: Ticket },
  ];

  const workspaceNavItems = [
    { key: "planning", label: "Planning", icon: PlanningIcon },
    { key: "expenses", label: "Expenses", icon: ExpensesIcon },
    { key: "social", label: "Social", icon: SocialIcon },
  ];

  React.useEffect(() => {
    initCrashlytics();
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
  
  // RASP (Runtime Application Self-Protection) Threat Check
  const [raspThreats, setRaspThreats] = useState<string[]>([]);
  const [isRaspModalOpen, setIsRaspModalOpen] = useState(false);

  React.useEffect(() => {
    performRaspSecurityCheck().then((status) => {
      if (!status.safeToRun && status.threatDetails.length > 0) {
        setRaspThreats(status.threatDetails);
        setIsRaspModalOpen(true);
      }
    });
  }, []);

  // Modals state
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const { addNewTrip, trips, activeTrip, updateActiveTrip } = useTripContext();
  const { lang } = useLanguage();
  const [showFuelCalc, setShowFuelCalc] = useState(false);
  
  React.useEffect(() => {
    const handleOpenKharch = () => {
      handleSetActive('expenses');
      setTimeout(() => window.dispatchEvent(new Event('trigger-add-expense')), 100);
    };
    const handleOpenFlight = () => handleSetActive('booking', 'Flights');
    const handleOpenFuel = () => setShowFuelCalc(true);
    const handleOpenDeposit = () => {
      handleSetActive('expenses');
      setTimeout(() => window.dispatchEvent(new Event('trigger-add-deposit')), 100);
    };
    const handleOpenPlan = () => {
      handleSetActive('planning');
      setTimeout(() => window.dispatchEvent(new Event('trigger-add-plan')), 100);
    };
    const handleOpenAddMember = () => {
      handleSetActive('expenses'); // members are in balances view
      setTimeout(() => window.dispatchEvent(new Event('trigger-add-member')), 100);
    };
    
    window.addEventListener("open-kharch-modal", handleOpenKharch);
    window.addEventListener("open-deposit-modal", handleOpenDeposit);
    window.addEventListener("open-flight-search", handleOpenFlight);
    window.addEventListener("open-fuel-calculator", handleOpenFuel);
    window.addEventListener("open-add-plan-modal", handleOpenPlan);
    window.addEventListener("open-add-member", handleOpenAddMember);
    
    return () => {
      window.removeEventListener("open-kharch-modal", handleOpenKharch);
      window.removeEventListener("open-deposit-modal", handleOpenDeposit);
      window.removeEventListener("open-flight-search", handleOpenFlight);
      window.removeEventListener("open-fuel-calculator", handleOpenFuel);
      window.removeEventListener("open-add-plan-modal", handleOpenPlan);
      window.removeEventListener("open-add-member", handleOpenAddMember);
    };
  }, []);

  const handleSetActive = (tab: string, subCategory?: string) => {
    console.log("Setting active to", tab);
    setActive(tab);
    if (tab === 'booking') {
      setBookingTab(subCategory || 'Menu');
    } else if (subCategory) {
      setBookingTab(subCategory);
    }
  };

  
  const handleCreateTrip = (tripData: any) => {
    setIsCreateTripOpen(false);
    const colors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    
    let adminId = '';
    const formattedMembers = tripData.members.map((m: any, idx: number) => {
      // If they are the first admin, assign the current user's actual ID
      const isFirstAdmin = m.isAdmin && !adminId;
      const mId = isFirstAdmin && currentUser?.id ? currentUser.id : `m-${Date.now()}-${idx}`;
      
      if (isFirstAdmin) adminId = mId;
      
      return {
        id: mId,
        name: m.name,
        color: colors[idx % colors.length],
        totalDeposited: parseFloat(m.deposit) || 0,
        upiId: m.upiId
      };
    });

    const newTrip = addNewTrip({
      name: tripData.name,
      destination: tripData.destination || tripData.name,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      calculationMode: tripData.calculationMode,
      members: formattedMembers,
      adminId: adminId || (formattedMembers[0]?.id),
      expenses: tripData.importedExpenses || []
    });
    
    setActive('trips');
  };

  const handleLogin = (r: string) => {
    setRole(r);
    setActive(r === 'agent' ? 'overview' : 'trips');
    setPhase("app");
  };

  const handleLogout = () => {
    setPhase('login');
    setActive('trips');
  };

  
  

  // Only the user role uses the tab-strip BottomNav — Agent & Admin
  // portals below already ship with their own full internal navigation.
  const grad = "from-[#1A365D] to-[#2A4A7F]";
  const glow = "shadow-sm";

  return (
    <CrashlyticsErrorBoundary>
      <MusicPlayerProvider>
      <div className="w-full min-h-screen relative font-[Inter]">
        

        {phase === "splash" && <Splash onDone={() => setPhase("login")} />}
        {phase === "login" && <LoginScreen onLogin={handleLogin} />}
        {phase === "app" && (
          <>
            {role === 'user' && active === 'bidding' && (
              <UserBiddingScreen 
                onBack={() => setActive('trips')} 
                onLogout={handleLogout}
                onSOS={() => setIsSosOpen(true)}
                onOpenSettings={() => setActive('settings')}
                onOpenMyTickets={() => setActive('my-tickets')}
                lang={lang as 'en' | 'mr'} 
              />
            )}
            
            {role === 'user' && (active === 'trips' || active === 'all-trips') && (
              <AllTripsScreen 
                setActive={handleSetActive}
                onBack={() => setActive('trips')} 
                onLogout={handleLogout}
                onSOS={() => setIsSosOpen(true)}
              />
            )}
            
            {role === 'user' && active === 'smart-planner' && (
              <FutureTripScreen onBack={() => setActive('trips')} lang={lang as 'en' | 'mr'} />
            )}
            {role === 'user' && active === 'new-trip' && (
              <NewTripScreen 
                onBack={() => setActive('trips')} 
                onCreate={handleCreateTrip}
                trips={trips}
                lang={lang}
              />
            )}
            {role === 'user' && active === 'planning' && (
              <PlanningScreen 
                onLogout={handleLogout} 
                onSOS={() => setIsSosOpen(true)}
                onOpenCreateTrip={() => setActive('new-trip')}
                onOpenPlanner={() => setActive('smart-planner')}
                setActive={handleSetActive}
                onBack={() => setActive('trips')}
              />
            )}
            {role === 'user' && active === 'social' && (
              <SocialScreen 
                onLogout={handleLogout} 
                onSOS={() => setIsSosOpen(true)}
                onOpenSettings={() => setActive('settings')} onOpenMyTickets={() => setActive('my-tickets')}
                onBack={() => setActive('trips')}
              />
            )}
            {role === 'user' && active === 'booking' && (
              <BookingScreen 
                onLogout={handleLogout} 
                onSOS={() => setIsSosOpen(true)}
                initialTab={bookingTab} 
                onOpenSettings={() => setActive('settings')} onOpenMyTickets={() => setActive('my-tickets')}
                onBack={() => setActive('trips')}
                lang={lang}
              />
            )}
            {role === 'user' && active === 'expenses' && (
              <KharchScreen 
                onLogout={handleLogout} 
                onSOS={() => setIsSosOpen(true)}
                onOpenSettings={() => setActive('settings')} onOpenMyTickets={() => setActive('my-tickets')}
                onBack={() => setActive('trips')}
              />
            )}
            {role === 'user' && active === 'settings' && (
              <SettingsScreen 
                onLogout={handleLogout} 
                onSOS={() => setIsSosOpen(true)}
                setActive={handleSetActive}
                onBack={() => setActive("trips")}
              />
            )}
            {role === 'user' && active === 'my-tickets' && (
              <MyTicketsView 
                onBack={() => setActive('trips')}
              />
            )}

            {role === 'agent' && (
              <AgentPortalView lang="en" onShowToast={(msg) => console.log(msg)} onLogout={handleLogout} />
            )}

            {role === 'admin' && (
              <AdminDashboardView lang="en" onLaunchMainApp={() => { setRole('user'); setActive('trips'); }} />
            )}

            {role === 'user' && (
              <BottomNav 
                items={isWorkspace ? workspaceNavItems : globalNavItems} 
                active={active === 'all-trips' ? 'trips' : active} 
                setActive={(key) => handleSetActive(key)} 
                grad={grad} 
                glow={glow} 
              />
            )}

                        {/* Global Modals — user role only; Agent/Admin portals handle their own */}
            {role === 'user' && (
              <SosModal 
                isOpen={isSosOpen} 
                onClose={() => setIsSosOpen(false)} 
              />
            )}
            {role === 'user' && (
              <CreateTripModal
                isOpen={isCreateTripOpen}
                onClose={() => setIsCreateTripOpen(false)}
                onCreate={handleCreateTrip}
                trips={trips}
              />
            )}
            
            {/* Global Modals */}
            <AuthModal />
            {showFuelCalc && (
               <FuelCalculatorModal 
                  isOpen={showFuelCalc}
                  onClose={() => setShowFuelCalc(false)} 
                  lang={lang} 
                  currencySymbol="₹"
                  onAddAsExpense={(calculatedCost) => {
                     if (activeTrip) {
                       const payerId = activeTrip.members?.[0]?.id || 'Group';
                       const newExpense = {
                         id: Math.random().toString(36).substr(2, 9),
                         title: lang === 'mr' ? 'इंधन खर्च (कॅल्क्युलेटर)' : 'Fuel Cost (Calculator)',
                         amount: calculatedCost,
                         category: 'traveling' as any,
                         date: new Date().toISOString().split('T')[0],
                         payer: activeTrip.members?.[0]?.name || 'Group',
                         paidBy: payerId,
                         splitWith: activeTrip.members?.map((m: any) => m.id) || []
                       };
                       updateActiveTrip({
                         ...activeTrip,
                         expenses: [...(activeTrip.expenses || []), newExpense]
                       });
                     }
                     setShowFuelCalc(false);
                  }}
               />
            )}
            
            {/* Removed RASP Anti-Tamper Security Modal as per user request */}
          </>
        )}
      </div>
      {role === 'user' && <MusicPlayerBar lang="en" themeColor="#6366f1" />}
      </MusicPlayerProvider>
    </CrashlyticsErrorBoundary>
  );
}

export default function App() {
  const location = useLocation();
  const isOverlayRoute = [
    '/checkout', 
    '/stays/results', 
    '/stays/details',
    '/stays/checkout',
    '/flights/results', 
    '/flights/fares',
    '/flights/seats',
    '/flights/meals',
    '/flights/baggage',
    '/cars/results',
    '/cars',
    '/buses',
    '/buses/seatmap',
    '/ancillaries',
    '/order-review'
  ].includes(location.pathname);

  return (
    <CurrencyProvider>
      <BookingFlowProvider>
        <div style={{ display: isOverlayRoute ? 'none' : 'block' }}>
          <MainApp />
        </div>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/stays/results" element={<StaysResultsPage />} />
          <Route path="/stays/details" element={<StaysDetailsPage />} />
          <Route path="/stays/checkout" element={<StaysCheckoutPage />} />
          <Route path="/flights/results" element={<FlightsResultsPage />} />
          <Route path="/flights/fares" element={<FlightFareSelectionPage />} />
          <Route path="/flights/seats" element={<FlightSeatSelectionPage />} />
          <Route path="/flights/meals" element={<FlightMealsSelectionPage />} />
          <Route path="/flights/baggage" element={<FlightBaggageSelectionPage />} />
          <Route path="/cars/results" element={<CarsResultsPage />} />

          <Route path="/buses" element={<BusResultsPage />} />
          <Route path="/buses/seatmap" element={<BusSeatMapPage />} />
          <Route path="/cars" element={<CarResultsPage />} />

          <Route path="/ancillaries" element={<AncillariesFlow flightOffer={{}} onComplete={(data) => console.log(data)} />} />
          <Route path="/order-review" element={<OrderReviewPage />} />
        </Routes>
      </BookingFlowProvider>
    </CurrencyProvider>
  );
}
