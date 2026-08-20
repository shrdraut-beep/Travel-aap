// components/booking/PolicyTable.tsx
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';

type Slab = { window: string; airlineFee: number; platformFee: number };

type Props = {
  routeLabel: string; // "Nasik → Delhi"
  cancellationSlabs: Slab[];
  dateChangeSlabs: Slab[];
};

export function PolicyTable({ routeLabel, cancellationSlabs, dateChangeSlabs }: Props) {
  const [tab, setTab] = useState<'cancel' | 'change'>('cancel');
  const rows = tab === 'cancel' ? cancellationSlabs : dateChangeSlabs;

  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: spacing.sm }}>
        Cancellation & Date Change Policy
      </Text>
      <Text style={{ color: colors.slate, marginBottom: spacing.md }}>{routeLabel}</Text>

      <View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
        <TabButton label="Cancellation charges" active={tab === 'cancel'} onPress={() => setTab('cancel')} />
        <TabButton label="Date change charges" active={tab === 'change'} onPress={() => setTab('change')} />
      </View>

      <View style={{ backgroundColor: colors.white, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: 'row', backgroundColor: colors.navyMuted, padding: spacing.md }}>
          <Text style={{ flex: 1, color: colors.white, fontWeight: '700' }}>Time Frame</Text>
          <Text style={{ flex: 1, color: colors.white, fontWeight: '700', textAlign: 'right' }}>Airline Fee + Platform Fee</Text>
        </View>
        {rows.map((slab, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              padding: spacing.md,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: colors.border,
            }}
          >
            <Text style={{ flex: 1, color: colors.navy }}>{slab.window}</Text>
            <Text style={{ flex: 1, textAlign: 'right', color: colors.navy, fontWeight: '600' }}>
              ₹{slab.airlineFee} + ₹{slab.platformFee}
            </Text>
          </View>
        ))}
      </View>

      <Text style={{ color: colors.slateLight, fontSize: 12, marginTop: spacing.sm }}>*From the time of departure</Text>

      <View style={{ backgroundColor: '#FDF3DC', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md }}>
        <Text style={{ color: '#8A6D1F', fontSize: 13, lineHeight: 19 }}>
          *Important: The airline fee is indicative. RoutTripo does not guarantee the accuracy of this information. All fees mentioned are per passenger. All refunds are subject to airline approval.
        </Text>
      </View>
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginRight: spacing.lg,
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: active ? colors.gold : 'transparent',
      }}
    >
      <Text style={{ color: active ? colors.navy : colors.slate, fontWeight: active ? '700' : '500' }}>{label}</Text>
    </Pressable>
  );
}
