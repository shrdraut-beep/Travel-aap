import React from 'react';
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--premium-pink)] text-white p-3 shadow-[0_12px_28px_-10px_rgba(40,32,79,0.35)] flex items-center justify-center gap-2 text-sm font-bold">
      <WifiOff className="w-5 h-5" />
      <span>Offline Mode - Data saved locally (ऑफलाइन मोड - डाटा मोबाईलमध्ये सेव्ह केला आहे)</span>
    </div>
  );
};
