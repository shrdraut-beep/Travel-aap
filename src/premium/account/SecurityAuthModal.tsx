import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  Laptop, 
  LogOut,
  Fingerprint
} from 'lucide-react';
import { 
  SecurityAuthService, 
  type SecuritySettings 
} from '../../services/SecurityAuthService';

interface SecurityAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMr?: boolean;
}

export const SecurityAuthModal: React.FC<SecurityAuthModalProps> = ({
  isOpen,
  onClose,
  isMr = false
}) => {
  const [settings, setSettings] = useState<SecuritySettings>(SecurityAuthService.getSettings());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => {
    setSettings(SecurityAuthService.getSettings());
    const unsub = SecurityAuthService.subscribe((s) => setSettings(s));
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggle = (key: keyof Omit<SecuritySettings, 'sessions'>) => {
    const newVal = SecurityAuthService.toggleSetting(key);
    showToast(`${key} is now ${newVal ? 'Enabled' : 'Disabled'}`);
  };

  const handleRevokeSession = (sessionId: string) => {
    SecurityAuthService.revokeSession(sessionId);
    showToast('Session logged out successfully');
  };

  const handleRevokeAllOther = () => {
    SecurityAuthService.revokeOtherSessions();
    showToast('Logged out of all other devices');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      showToast('New passwords do not match');
      return;
    }
    const res = SecurityAuthService.changePassword(currentPass, newPass);
    if (res.success) {
      setShowPasswordChange(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      showToast(res.message);
    } else {
      showToast(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-['Outfit',sans-serif]">
      <div 
        className="w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Toast */}
        {toastMessage && (
          <div className="absolute top-4 inset-x-0 mx-auto z-50 max-w-xs px-4 pointer-events-none">
            <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
              <span>{toastMessage}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-5 py-4 border-b border-indigo-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Security &amp; 2-Factor Authentication
                </h3>
                <span className="text-[9.5px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Protected
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Biometric FaceID, SMS 2FA &amp; Device Session Management
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* 2FA Toggles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Authentication Factors
            </h4>

            {/* Biometric FaceID / Fingerprint */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Biometric FaceID &amp; TouchID</p>
                  <p className="text-xs text-slate-500 mt-0.5">Prompt biometric scan on high-value travel bookings</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('biometricFaceId')}
                className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                  settings.biometricFaceId ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {/* SMS OTP 2FA */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">SMS OTP Two-Factor (2FA)</p>
                  <p className="text-xs text-slate-500 mt-0.5">Send one-time password to +91 98765 ••••• on logins</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('smsOtp')}
                className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                  settings.smsOtp ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {/* New Device Login Alerts */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Instant Login Security Alerts</p>
                  <p className="text-xs text-slate-500 mt-0.5">Notify via email and push if a new device signs in</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('loginAlerts')}
                className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                  settings.loginAlerts ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>
          </div>

          {/* Password Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Account Password</p>
                <p className="text-[11px] text-slate-500">Last changed 42 days ago</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
              >
                {showPasswordChange ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordChange && (
              <form onSubmit={handlePasswordSubmit} className="space-y-2 pt-2 border-t border-slate-200">
                <input
                  type="password"
                  required
                  placeholder="Current Password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="password"
                  required
                  placeholder="New Password (min 8 characters)"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="password"
                  required
                  placeholder="Confirm New Password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Update Password
                </button>
              </form>
            )}
          </div>

          {/* Active Logged-In Sessions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Devices &amp; Sessions
              </h4>
              {settings.sessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleRevokeAllOther}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  Log Out Other Devices
                </button>
              )}
            </div>

            <div className="space-y-2">
              {settings.sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      sess.isCurrent ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {sess.device.includes('Android') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-slate-900">{sess.device}</p>
                        {sess.isCurrent && (
                          <span className="text-[9.5px] font-mono font-black uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            This Device
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {sess.location} • {sess.lastActive}
                      </p>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit TLS End-to-End Encrypted</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
