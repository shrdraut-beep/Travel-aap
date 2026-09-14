import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * useScreenShield Hook
 * Enforces Anti-Screenshot & Screen Recording protection
 * on sensitive screens (Caught Deals, Vouchers, OTP Handshake).
 */
export function useScreenShield(isEnabled: boolean = true) {
  useEffect(() => {
    // 1. Mobile Platform Native Shield (FLAG_SECURE)
    if (Capacitor.isNativePlatform()) {
      const toggleNativeShield = async () => {
        try {
          const plugins = (Capacitor as any).Plugins;
          if (plugins && plugins.PrivacyScreen) {
            if (isEnabled) {
              await plugins.PrivacyScreen.enable();
            } else {
              await plugins.PrivacyScreen.disable();
            }
          }
        } catch (err) {
          console.warn('PrivacyScreen plugin notification:', err);
        }
      };

      toggleNativeShield();

      return () => {
        try {
          const plugins = (Capacitor as any).Plugins;
          if (plugins && plugins.PrivacyScreen) {
            plugins.PrivacyScreen.disable().catch(() => {});
          }
        } catch {}
      };
    }

    // 2. Web / Desktop Fallback: Restrict PrintScreen, Ctrl+P, Copy-hotkeys & context menu
    if (isEnabled && typeof window !== 'undefined') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === 'PrintScreen' ||
          ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S'))
        ) {
          e.preventDefault();
          console.warn('⚠️ Anti-Leak Shield: Screenshot/Printing of confidential vendor quotes is restricted.');
        }
      };

      const handleContextMenu = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (target && target.closest('.confidential-vendor-data')) {
          e.preventDefault();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('contextmenu', handleContextMenu);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [isEnabled]);
}
