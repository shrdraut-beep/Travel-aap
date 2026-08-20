// components/booking/BaggageSelection.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Minus, Plus, Luggage, ShoppingCart } from 'lucide-react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { useBookingFlow } from '../../context/BookingFlowContext';

export type BaggageOption = { id: string; label: string; kg: number; price: number; icon: 'cabin' | 'checkin' };

type Props = {
  legId: string;
  legSubtitle: string;
  options: BaggageOption[];
  onNext: () => void;
};

export function BaggageSelection({ legId, legSubtitle, options, onNext }: Props) {
  const { dispatch, totals, state } = useBookingFlow();
  const [qty, setQty] = useState<Record<string, number>>({});

  const changeQty = (opt: BaggageOption, delta: number) => {
    const next = Math.max(0, (qty[opt.id] ?? 0) + delta);
    setQty(prev => ({ ...prev, [opt.id]: next }));
    dispatch({
      type: 'SET_BAGGAGE_QTY',
      legId,
      optionId: opt.id,
      label: opt.label,
      kg: opt.kg,
      unitPrice: opt.price,
      qty: next,
    });
  };

  const totalSelected = state.baggage.filter(b => b.legId === legId).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 4 }}>Select Baggage</Text>
        <Text style={{ color: colors.slate, marginBottom: spacing.lg }}>{legSubtitle}</Text>

        {options.map(opt => (
          <View
            key={opt.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.white,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.md,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {opt.icon === 'cabin' ? <Luggage size={22} color={colors.navy} /> : <ShoppingCart size={22} color={colors.navy} />}
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={{ fontWeight: '600', color: colors.navy }}>{opt.label}</Text>
              <Text style={{ color: colors.slate }}>₹{opt.price.toLocaleString('en-IN')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable
                onPress={() => changeQty(opt, -1)}
                style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}
              >
                <Minus size={14} color={colors.white} />
              </Pressable>
              <Text style={{ fontWeight: '700', color: colors.navy, minWidth: 18, textAlign: 'center' }}>{qty[opt.id] ?? 0}</Text>
              <Pressable
                onPress={() => changeQty(opt, 1)}
                style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={14} color={colors.white} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ backgroundColor: colors.white, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: colors.slate }}>Extra baggage ({totalSelected}/1)</Text>
          <Text style={{ fontWeight: '700', color: colors.navy }}>₹{totals.grandTotal.toLocaleString('en-IN')}</Text>
        </View>
        <Text style={{ color: colors.slateLight, marginBottom: spacing.md }}>
          {totalSelected === 0 ? 'No extra baggage' : `${totalSelected} option(s) selected`}
        </Text>
        <Pressable onPress={onNext} style={{ backgroundColor: colors.navy, borderRadius: radius.sm, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ color: colors.white, fontWeight: '700' }}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}
