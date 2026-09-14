// src/utils/permissions.ts
/**
 * Just-in-Time Dynamic Permission Controller
 * Meets Apple App Store & Google Play privacy guidelines.
 * Permissions are never requested on app startup; only when the user explicitly taps a feature.
 */

export async function requestCameraAccess(featureReason: string = 'Scan physical receipt / bill via OCR'): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    console.warn('Camera access is not supported on this platform');
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    // Release camera stream immediately after verifying permission
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (err: any) {
    console.info(`[Permission Info] Camera permission not granted for "${featureReason}":`, err.name);
    return false;
  }
}

export async function requestMicrophoneAccess(featureReason: string = 'Voice assistant & audio search'): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (err: any) {
    console.info(`[Permission Info] Microphone not granted for "${featureReason}":`, err.name);
    return false;
  }
}

export async function requestGeolocationAccess(featureReason: string = 'Nearby airport & SOS emergency location'): Promise<GeolocationPosition | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => {
        console.info(`[Permission Info] Geolocation not available for "${featureReason}":`, err.message);
        resolve(null);
      },
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false }
    );
  });
}
