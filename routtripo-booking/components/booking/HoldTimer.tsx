// components/booking/HoldTimer.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../theme/tokens';
import { useBookingFlow } from '../../context/BookingFlowContext';

export function HoldTimer() {
  const { state } = useBookingFlow();
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!state.holdExpiresAt) return;
    const tick = () => setRemainingMs(Math.max(0, state.holdExpiresAt! - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state.holdExpiresAt]);

  if (!state.holdExpiresAt) return null;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  const isUrgent = totalSeconds < 120;

  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: isUrgent ? colors.dangerSoft : 'rgba(212,175,55,0.15)',
      }}
    >
      <Text style={{ color: isUrgent ? colors.danger : colors.gold, fontWeight: '700', fontSize: 13 }}>
        {mm}:{ss} Mins left
      </Text>
    </View>
  );
}
