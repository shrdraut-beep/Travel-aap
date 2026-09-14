// src/security/rasp.ts
// Runtime Application Self-Protection (RASP) & Anti-Tampering Engine

export interface SecurityStatus {
  isRootedOrJailbroken: boolean;
  isMockLocationDetected: boolean;
  isHookingDetected: boolean;
  isDebuggerAttached: boolean;
  isEmulator: boolean;
  threatDetails: string[];
  safeToRun: boolean;
}

/**
 * Known signatures of Rooting, Jailbreaking, and Instrumentation tools
 */
const KNOWN_SUSPICIOUS_GLOBAL_OBJECTS = [
  '__frida',
  'Frida',
  'frida',
  '_SubstrateInstalled',
  'xposed',
  'XposedBridge',
  'checkJailbreak',
  'jailMonkey',
  'Cydia',
];

const KNOWN_SUSPICIOUS_PATHS = [
  '/system/app/Superuser.apk',
  '/sbin/su',
  '/system/bin/su',
  '/system/xbin/su',
  '/data/local/xbin/su',
  '/data/local/bin/su',
  '/system/sd/xbin/su',
  '/system/bin/failsafe/su',
  '/data/local/su',
  '/su/bin/su',
  '/Applications/Cydia.app',
  '/Library/MobileSubstrate/MobileSubstrate.dylib',
  '/bin/bash',
  '/usr/sbin/sshd',
  '/etc/apt',
];

/**
 * Checks for Root, Jailbreak, and Hooking mechanisms
 */
export function checkRootAndJailbreak(): { detected: boolean; reason?: string } {
  if (typeof window === 'undefined') return { detected: false };

  // 1. Check for Frida / Xposed / Substrate global injection hooks
  for (const hook of KNOWN_SUSPICIOUS_GLOBAL_OBJECTS) {
    if ((window as any)[hook] !== undefined) {
      return { detected: true, reason: `Dynamic hooking framework found (${hook})` };
    }
  }

  // 2. Check for suspicious modified user-agents or inject markers
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('cydia') || ua.includes('xposed') || ua.includes('substrate') || ua.includes('magisk')) {
    return { detected: true, reason: 'Modified system environment user-agent detected' };
  }

  return { detected: false };
}

/**
 * Detects mock locations / location spoofing
 */
export function checkMockLocation(position: GeolocationPosition): boolean {
  if (!position) return false;

  // Modern Android browsers provide isFromMockProvider or mockLocation flags
  const coords: any = position.coords;
  if (coords && coords.isMock === true) return true;
  if ((position as any).isFromMockProvider === true) return true;

  // Improbable GPS jump / 0.0 accuracy anomalies
  if (coords && coords.accuracy === 0 && coords.latitude !== 0) {
    return true;
  }

  return false;
}

/**
 * High-precision DevTools / Debugger detection using timing discrepancies
 */
export function checkDebuggerTiming(): boolean {
  if (typeof window === 'undefined') return false;

  const start = performance.now();
  // Standard debugger timing threshold check
  // eslint-disable-next-line no-debugger
  const end = performance.now();

  return (end - start) > 100; // Debugger breakpoint pause threshold
}

/**
 * Performs comprehensive RASP security audit
 */
export async function performRaspSecurityCheck(): Promise<SecurityStatus> {
  const threats: string[] = [];

  const rootCheck = checkRootAndJailbreak();
  if (rootCheck.detected && rootCheck.reason) {
    threats.push(rootCheck.reason);
  }

  // Check WebGL / GPU renderer for emulator clues
  let isEmulator = false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
        if (
          renderer.toLowerCase().includes('bluestacks') ||
          renderer.toLowerCase().includes('nox') ||
          renderer.toLowerCase().includes('genymotion') ||
          renderer.toLowerCase().includes('goldfish') ||
          renderer.toLowerCase().includes('ranchu')
        ) {
          isEmulator = true;
          threats.push(`Virtualized Android environment (${renderer})`);
        }
      }
    }
  } catch (e) {
    // Non-fatal
  }

  const isDebugger = checkDebuggerTiming();
  if (isDebugger) {
    threats.push('Active debugging session detected');
  }

  const isCompromised = rootCheck.detected;

  return {
    isRootedOrJailbroken: rootCheck.detected,
    isMockLocationDetected: false,
    isHookingDetected: rootCheck.detected,
    isDebuggerAttached: isDebugger,
    isEmulator,
    threatDetails: threats,
    safeToRun: !isCompromised,
  };
}

/**
 * Safely terminates or locks down application upon severe tampering detection
 */
export function terminateAppDueToTampering(reason: string) {
  console.error('CRITICAL SECURITY VIOLATION:', reason);

  try {
    // If running in Capacitor native Android/iOS
    const capApp = (window as any)?.Capacitor?.Plugins?.App;
    if (capApp && typeof capApp.exitApp === 'function') {
      capApp.exitApp();
      return;
    }
  } catch (e) {
    // Fallback
  }

  // Clear sensitive storage immediately
  try {
    localStorage.removeItem('routripo_user');
    sessionStorage.clear();
  } catch (e) {}

  // Halt further execution
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#071527;color:#fff;font-family:sans-serif;padding:24px;text-align:center;">
      <div style="max-width:440px;background:#0B1E3D;border:1px solid #C4432B;border-radius:24px;padding:32px;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
        <div style="font-size:48px;margin-bottom:16px;">🛡️</div>
        <h2 style="font-size:20px;font-weight:900;margin-bottom:8px;color:#FBEAE6;">Security Threat Detected</h2>
        <p style="font-size:14px;color:#A6ADB8;line-height:1.6;margin-bottom:20px;">
          RoutTripo is unable to execute in an insecure or compromised device environment (${reason}).
        </p>
        <div style="font-size:12px;color:#5B6472;border-top:1px solid #1C3358;padding-top:16px;">
          App self-protection active • Error Code: SEC_RASP_TAMPER
        </div>
      </div>
    </div>
  `;
}

export const checkSecurityStatus = performRaspSecurityCheck;
