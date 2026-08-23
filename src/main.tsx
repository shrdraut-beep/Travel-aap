import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './ErrorBoundary.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { TripProvider } from './context/TripContext.tsx';
import './index.css';

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



// Suppress Firestore and Vite transient network warnings
const originalConsoleError = console.error;
console.error = function(...args) {
  if (args.length > 0 && typeof args[0] === 'string') {
    if (args[0].includes('Could not reach Cloud Firestore backend') || args[0].includes('[vite]')) {
      console.warn('Suppressed transient warning/error:', args[0]);
      return;
    }
  }
  originalConsoleError.apply(console, args);
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
      reasonLower.includes('networkerror')
    ) {
      console.warn('Suppressed transient background rejection:', reasonStr);
      event.preventDefault();
    }
  }
});

window.addEventListener('error', (event) => {
  const msgLower = (event.message || '').toLowerCase();
  if (
    msgLower.includes('[vite]') ||
    msgLower.includes('websocket') ||
    msgLower.includes('closed without opened')
  ) {
    console.warn('Caught vite/websocket error:', event.message);
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
