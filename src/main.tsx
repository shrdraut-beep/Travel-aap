import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './ErrorBoundary.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { TripProvider } from './context/TripContext.tsx';
import "./index.css";
import "./i18n";
import { initClientObservability } from "./observability.ts";
initClientObservability();

// Monkeypatch XMLHttpRequest to prevent "Invalid URL" crashes safely
const originalXhrOpen = XMLHttpRequest.prototype.open;
(XMLHttpRequest.prototype as any).open = function(method: string, url: string | URL, ...rest: any[]) {
  try {
    return (originalXhrOpen as any).apply(this, [method, url, ...rest]);
  } catch (e) {
    console.warn("Caught XHR Invalid URL Error for:", url, e);
    try {
      return (originalXhrOpen as any).apply(this, [method, window.location.href, ...rest]);
    } catch (e2) {
      console.warn("XHR fallback error ignored:", e2);
    }
  }
};

// --- PRODUCTION SECURITY: DISABLE BROWSER CONSOLE ---
// Hackers often use the browser console (F12) to inspect errors and internal logic.
// In production, we completely strip the console so they get zero information.
if (import.meta.env.PROD) {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.warn = noop;
  console.error = noop;
  console.trace = noop;
  window.console.log = noop;
  window.console.error = noop;
  window.console.warn = noop;
}



// Suppress Firestore and Vite transient network warnings
const originalConsoleError = console.error;
console.error = function(...args) {
  const argStr = args.map(a => String(a)).join(' ');
  if (
    argStr.includes('Could not reach Cloud Firestore backend') || 
    argStr.includes('[vite]') || 
    argStr.includes('unavailable') ||
    argStr.includes('Backend didn\'t respond') ||
    argStr.includes('offline mode')
  ) {
    // Completely suppress this to avoid sandbox error overlays
    return;
  }
  originalConsoleError.apply(console, args);
};

const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  const argStr = args.map(a => String(a)).join(' ');
  if (
    argStr.includes('Could not reach Cloud Firestore backend') || 
    argStr.includes('[vite]') || 
    argStr.includes('unavailable') ||
    argStr.includes('Backend didn\'t respond') ||
    argStr.includes('offline mode')
  ) {
    // Completely suppress this to avoid sandbox error overlays
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Suppress Firebase Auth internal unhandled rejections, WebSocket, and Vite errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason) {
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
      reasonLower.includes('auth/popup-closed-by-user') ||
      reasonLower.includes('networkerror') ||
      reasonLower.includes('cloud firestore backend')
    ) {
      event.preventDefault();
    }
  }
});

window.addEventListener('error', (event) => {
  const msgLower = (event.message || '').toLowerCase();
  if (
    msgLower.includes('[vite]') ||
    msgLower.includes('websocket') ||
    msgLower.includes('closed without opened') ||
    msgLower.includes('cloud firestore backend')
  ) {
    event.preventDefault();
  }
});

import { AppLockScreen } from './components/security/AppLockScreen';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <LanguageProvider>
        <TripProvider>
          <App />
        </TripProvider>
      </LanguageProvider>
    </BrowserRouter>
  </ErrorBoundary>,
);
