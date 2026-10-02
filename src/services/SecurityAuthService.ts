/**
 * Security & 2-Factor Authentication Service
 * Manages biometric settings, 2FA, session tracking, and password credentials
 */

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecuritySettings {
  biometricFaceId: boolean;
  smsOtp: boolean;
  totpAuthenticator: boolean;
  loginAlerts: boolean;
  pinLockEnabled: boolean;
  sessions: UserSession[];
}

const STORAGE_KEY = 'routripo_security_auth_config';

const INITIAL_SECURITY_SETTINGS: SecuritySettings = {
  biometricFaceId: true,
  smsOtp: true,
  totpAuthenticator: false,
  loginAlerts: true,
  pinLockEnabled: false,
  sessions: [
    {
      id: 'sess-curr',
      device: 'Samsung Galaxy S24 Ultra (Android 14)',
      browser: 'RouTripo App v2.4.0',
      location: 'Mumbai, Maharashtra, India',
      ipAddress: '103.21.244.18',
      lastActive: 'Active Now',
      isCurrent: true
    },
    {
      id: 'sess-2',
      device: 'MacBook Pro 16" (macOS Sequoia)',
      browser: 'Chrome 128.0',
      location: 'Pune, Maharashtra, India',
      ipAddress: '152.57.19.82',
      lastActive: 'Yesterday, 8:45 PM',
      isCurrent: false
    }
  ]
};

type SecurityListener = (settings: SecuritySettings) => void;
const listeners = new Set<SecurityListener>();

export class SecurityAuthService {
  static getSettings(): SecuritySettings {
    if (typeof window === 'undefined') return INITIAL_SECURITY_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SECURITY_SETTINGS));
        return INITIAL_SECURITY_SETTINGS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_SECURITY_SETTINGS;
    }
  }

  static subscribe(listener: SecurityListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  private static notify(settings: SecuritySettings) {
    listeners.forEach((fn) => {
      try {
        fn(settings);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private static save(settings: SecuritySettings) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      this.notify(settings);
    } catch (e) {
      console.error(e);
    }
  }

  static toggleSetting(key: keyof Omit<SecuritySettings, 'sessions'>): boolean {
    const s = this.getSettings();
    (s[key] as boolean) = !s[key];
    this.save(s);
    return s[key] as boolean;
  }

  static revokeSession(sessionId: string): boolean {
    const s = this.getSettings();
    s.sessions = s.sessions.filter((x) => x.id !== sessionId || x.isCurrent);
    this.save(s);
    return true;
  }

  static revokeOtherSessions(): void {
    const s = this.getSettings();
    s.sessions = s.sessions.filter((x) => x.isCurrent);
    this.save(s);
  }

  static changePassword(oldPass: string, newPass: string): { success: boolean; message: string } {
    if (newPass.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }
    // Simulate secure credential hash update
    return { success: true, message: 'Password updated successfully across all devices.' };
  }
}
