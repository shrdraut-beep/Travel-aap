// src/utils/deviceFingerprint.ts
// Anti-Fraud Device Fingerprinting Engine

import { safeStorage } from './storage';
import { Device } from '@capacitor/device';

/**
 * Computes a high-entropy SHA-256 canvas rendering fingerprint
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial', sans-serif";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('RouTripO🛡️AntiFraud', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('RouTripO🛡️AntiFraud', 4, 17);

    return canvas.toDataURL();
  } catch (e) {
    return 'canvas-err';
  }
}

/**
 * Computes WebGL GPU vendor & renderer signature
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
      const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      return `${vendor}~${renderer}`;
    }
    return 'webgl-basic';
  } catch (e) {
    return 'webgl-err';
  }
}

/**
 * Generates a SHA-256 hash from a string using Web Crypto API
 */
async function sha256(message: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    // Fallback hash for older environments
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `DEV_${Math.abs(hash).toString(16)}`;
  }

  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return `DEV_${hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 24)}`;
}

/**
 * Returns a persistent, unique Device Identifier.
 * Combines hardware entropy (Canvas, WebGL, Screen, Concurrency) with a persistent storage seed.
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'DEV_SERVER_DEFAULT';
  }

  try {
    // Check persistent storage first
    let storedId = safeStorage.getItem('routripo_device_id');
    if (!storedId) {
      storedId = 'DID_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      safeStorage.setItem('routripo_device_id', storedId);
    }

    const screenData = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const languages = navigator.languages ? navigator.languages.join(',') : navigator.language || '';
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const canvasHash = getCanvasFingerprint();
    const webglHash = getWebGLFingerprint();

    // Check if Capacitor native Device plugin exists
    let nativeId = '';
    try {
      if (typeof Device !== 'undefined' && Device.getId) {
        const idObj = await Device.getId();
        nativeId = idObj.identifier || '';
      }
    } catch (e) {
      // Fallback if not running inside native shell
    }


    const compositeString = [
      storedId,
      nativeId,
      navigator.userAgent,
      screenData,
      timezone,
      languages,
      hardwareConcurrency,
      canvasHash,
      webglHash,
    ].join('###');

    return await sha256(compositeString);
  } catch (err) {
    console.warn('Device fingerprint generation notice:', err);
    return 'DEV_FALLBACK_' + (safeStorage.getItem('routripo_device_id') || 'UNKNOWN');
  }
}

/**
 * Helper to fetch detailed device telemetry for fraud prevention audit logs
 */
export async function getDeviceInfo() {
  const deviceId = await getDeviceFingerprint();
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );

  return {
    deviceId,
    isMobile,
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'web',
    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  };
}
