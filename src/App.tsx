import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
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
import { FloatingAITripManager } from './components/FloatingAITripManager';

// Real, fully-wired role portals (Firestore + business logic already inside — not mockups)
import { AgentPortalView } from './components/views/AgentPortalView';
import { AdminDashboardView } from './components/views/AdminDashboardView';

import { NAV_USER_ICONS } from './theme/icons';

export default function App() {
  const [phase, setPhase] = useState("splash");
  const [role, setRole] = useState("user"); // 'user', 'agent', 'admin'
  const [active, setActive] = useState("hub");
  const [bookingTab, setBookingTab] = useState("Packages");
  
  // Modals state
  const [isSosOpen, setIsSosOpen] = useState(false);

  const handleSetActive = (tab: string, subCategory?: string) => {
    console.log("Setting active to", tab);
    setActive(tab);
    if (subCategory) {
      setBookingTab(subCategory);
    }
  };

  const handleLogin = (r: string) => {
    setRole(r);
    setActive(r === 'agent' ? 'overview' : 'hub');
    setPhase("app");
  };

  const handleLogout = () => {
    setPhase('login');
    setActive('hub');
  };

  const handleCreateTripSuccess = (tripData: any) => {
    setActive('planning');
  };

  // Only the user role uses the tab-strip BottomNav — Agent & Admin
  // portals below already ship with their own full internal navigation.
  const grad = "from-red-500 via-rose-500 to-pink-500";
  const glow = "shadow-rose-500/30";

  return (
    <ErrorBoundary fallback={<div>Error occurred</div>}>
      <div className="w-full h-full min-h-screen relative overflow-hidden font-[Inter]">
        {phase === "splash" && <Splash onDone={() => setPhase("login")} />}
        {phase === "login" && <LoginScreen onLogin={handleLogin} />}
        {phase === "app" && (
          <>
            {role === 'user' && active === 'hub' && (
              <HubScreen 
                setActive={handleSetActive} 
                onLogout={handleLogout} 
                onSOS={() => setIsSosOpen(true)}
                onOpenCreateTrip={() => setActive('new-trip')}
                onOpenPlanner={() => setActive('smart-planner')}
              />
            )}
            {role === 'user' && (active === 'trips' || active === 'all-trips') && (
              <AllTripsScreen 
                onBack={() => setActive('hub')} 
                setActive={handleSetActive} 
                onLogout={handleLogout}
                onSOS={() => setIsSosOpen(true)}
              />
            )}
            {role === 'user' && active === 'new-trip' && (
              <NewTripScreen onBack={() => setActive('hub')} onCreate={handleCreateTripSuccess} />
            )}
            {role === 'user' && active === 'smart-planner' && (
              <FutureTripScreen onBack={() => setActive('hub')} />
            )}
            {role === 'user' && active === 'planning' && (
              <PlanningScreen 
                onLogout={handleLogout} 
                onSOS={() => setIsSosOpen(true)}
                onOpenCreateTrip={() => setActive('new-trip')}
                onOpenPlanner={() => setActive('smart-planner')}
                setActive={handleSetActive}
              />
            )}
            {role === 'user' && active === 'social' && (
              <SocialScreen 
                onLogout={handleLogout} 
                onSOS={() => setIsSosOpen(true)}
                onOpenSettings={() => setActive('settings')}
              />
            )}
            {role === 'user' && active === 'booking' && (
              <BookingScreen 
                onLogout={handleLogout} 
                onSOS={() => setIsSosOpen(true)}
                initialTab={bookingTab} 
                onOpenSettings={() => setActive('settings')}
              />
            )}
            {role === 'user' && active === 'expenses' && (
              <KharchScreen 
                onLogout={handleLogout} 
                onSOS={() => setIsSosOpen(true)}
                onOpenSettings={() => setActive('settings')}
              />
            )}
            {role === 'user' && active === 'settings' && (
              <SettingsScreen 
                onLogout={handleLogout} 
                onSOS={() => setIsSosOpen(true)}
                setActive={handleSetActive}
              />
            )}

            {/* Agent role -> full real Agent Portal (CRM, bidding, invoicing, vendors,
                calendar, tickets, marketing, KYC, wallet, analytics, ads, support —
                all your existing functions, already wired to Firestore) */}
            {role === 'agent' && (
              <AgentPortalView lang="en" onShowToast={(msg) => console.log(msg)} onLogout={handleLogout} />
            )}

            {/* Admin role -> full real Admin Dashboard (live API health, users,
                offers, notifications, support, audit log, payouts) */}
            {role === 'admin' && (
              <AdminDashboardView lang="en" onLaunchMainApp={() => { setRole('user'); setActive('hub'); }} />
            )}

            {/* User role keeps the themed tab-strip bottom nav */}
            {role === 'user' && (
              <BottomNav items={NAV_USER_ICONS} active={active} setActive={(key) => handleSetActive(key)} grad={grad} glow={glow} />
            )}

            {/* Global Modals — user role only; Agent/Admin portals handle their own */}
            {role === 'user' && (
              <SosModal 
                isOpen={isSosOpen} 
                onClose={() => setIsSosOpen(false)} 
              />
            )}

            {/* Floating AI Assistant / Planner */}
            {role === 'user' && (
              <FloatingAITripManager 
                lang="en" 
                currencySymbol="₹" 
              />
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
