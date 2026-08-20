// components/booking/MealSelection.tsx
import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { Plus, Check } from 'lucide-react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { useBookingFlow } from '../../context/BookingFlowContext';

export type MealOption = { id: string; label: string; price: number; image?: string };

type Props = {
  legId: string;
  legSubtitle: string;   // "Thursday, Aug 20 · Non Stop · 1h 55m"
  options: MealOption[];
  onSkip: () => void;
  onNext: () => void;
};

export function MealSelection({ legId, legSubtitle, options, onSkip, onNext }: Props) {
  const { state, dispatch, totals } = useBookingFlow();
  const selected = state.meals.find(m => m.legId === legId);

  const handleToggle = (opt: MealOption) => {
    dispatch({ type: 'TOGGLE_MEAL', meal: { legId, mealId: opt.id, label: opt.label, price: opt.price } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 4 }}>Select Meal</Text>
        <Text style={{ color: colors.slate, marginBottom: spacing.lg }}>{legSubtitle}</Text>

        {options.map(opt => {
          const isSelected = selected?.mealId === opt.id;
          return (
            <View
              key={opt.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.white,
                borderRadius: radius.md,
                padding: spacing.sm,
                marginBottom: spacing.md,
                borderWidth: isSelected ? 1.5 : 1,
                borderColor: isSelected ? colors.gold : colors.border,
              }}
            >
              {opt.image ? (
                <Image source={{ uri: opt.image }} style={{ width: 56, height: 56, borderRadius: 10, marginRight: spacing.md }} />
              ) : (
                <View style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: colors.navyMuted, marginRight: spacing.md }} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: colors.navy }}>{opt.label}</Text>
                <Text style={{ color: colors.slate }}>{opt.price > 0 ? `₹${opt.price}` : '₹0'}</Text>
              </View>
              <Pressable
                onPress={() => handleToggle(opt)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: radius.sm,
                  backgroundColor: isSelected ? colors.gold : colors.navy,
                }}
              >
                {isSelected ? <Check size={14} color={colors.white} /> : <Plus size={14} color={colors.white} />}
                <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12 }}>{isSelected ? 'Added' : 'Add'}</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <View style={{ backgroundColor: colors.white, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: colors.slate }}>Meals ({state.meals.length}/{1})</Text>
          <Text style={{ fontWeight: '700', color: colors.navy }}>₹{totals.grandTotal.toLocaleString('en-IN')}</Text>
        </View>
        <Text style={{ color: colors.slateLight, marginBottom: spacing.md }}>
          {selected ? selected.label : 'No meals selected'}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={onSkip}>
            <Text style={{ color: colors.navy, fontWeight: '700', textDecorationLine: 'underline' }}>Skip</Text>
          </Pressable>
          <Pressable onPress={onNext} style={{ backgroundColor: colors.navy, borderRadius: radius.sm, paddingHorizontal: 28, paddingVertical: 12 }}>
            <Text style={{ color: colors.white, fontWeight: '700' }}>Next</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
