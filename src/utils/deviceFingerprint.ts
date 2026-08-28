export const getDeviceFingerprint = async (): Promise<string> => {
  if (typeof window === 'undefined') return 'server_fp';
  
  // A simplistic client-side fingerprinting stand-in for demo purposes.
  // In a real production app, use FingerprintJS or similar.
  const nav = window.navigator;
  const screen = window.screen;
  const fpSource = `${nav.userAgent}|${nav.language}|${screen.colorDepth}|${screen.width}x${screen.height}|${new Date().getTimezoneOffset()}`;
  
  // Basic hash function
  let hash = 0;
  for (let i = 0; i < fpSource.length; i++) {
    const char = fpSource.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `FP_${Math.abs(hash).toString(16).toUpperCase()}`;
};
