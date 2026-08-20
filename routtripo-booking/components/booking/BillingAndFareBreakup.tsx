// components/booking/BillingAndFareBreakup.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { useBookingFlow } from '../../context/BookingFlowContext';

type Props = {
  baseFare: number;
  taxesAndFees: number;
  convenienceFee: number;      // original (shown struck through)
  convenienceFeeWaived: boolean; // ₹0 conv. fee promo
  onContinue: () => void;
};

export function BillingAndFareBreakup({ baseFare, taxesAndFees, convenienceFee, convenienceFeeWaived, onContinue }: Props) {
  const { dispatch } = useBookingFlow();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hasGst, setHasGst] = useState(false);
  const [gstNumber, setGstNumber] = useState('');

  const total = baseFare + taxesAndFees + (convenienceFeeWaived ? 0 : convenienceFee);

  const handleContinue = () => {
    dispatch({ type: 'SET_BILLING', phone, email, gstNumber: hasGst ? gstNumber : null });
    onContinue();
  };

  return (
    <View style={{ padding: spacing.lg }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: spacing.md }}>Billing Details</Text>

      <Label text="Enter Phone Number" />
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <View style={{ paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, justifyContent: 'center' }}>
          <Text style={{ color: colors.navy, fontWeight: '600' }}>🇮🇳 +91</Text>
        </View>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter Phone number"
          placeholderTextColor={colors.slateLight}
          keyboardType="phone-pad"
          style={[inputStyle, { flex: 1 }]}
        />
      </View>

      <Label text="Email" />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter Email"
        placeholderTextColor={colors.slateLight}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[inputStyle, { marginBottom: spacing.md }]}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
        <Switch value={hasGst} onValueChange={setHasGst} />
        <Text style={{ color: colors.navy }}>I have a GST number (Optional)</Text>
      </View>
      {hasGst && (
        <TextInput
          value={gstNumber}
          onChangeText={setGstNumber}
          placeholder="Enter GST number"
          placeholderTextColor={colors.slateLight}
          autoCapitalize="characters"
          style={[inputStyle, { marginBottom: spacing.lg }]}
        />
      )}

      {/* Fare breakup */}
      <View style={{ backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md }}>
        <Text style={{ fontWeight: '700', color: colors.navy, marginBottom: spacing.sm }}>Fare breakup</Text>
        <FareRow label="Base Fare" value={baseFare} />
        <FareRow label="Taxes & Fees" value={taxesAndFees} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: colors.slateLight, textDecorationLine: convenienceFeeWaived ? 'line-through' : 'none' }}>Convenience Fee</Text>
          <Text style={{ color: colors.slateLight, textDecorationLine: convenienceFeeWaived ? 'line-through' : 'none' }}>₹{convenienceFee}</Text>
        </View>
        {convenienceFeeWaived && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: colors.success, fontWeight: '600' }}>🎟️ Convenience fee off</Text>
            <Text style={{ color: colors.success, fontWeight: '700' }}>₹0</Text>
          </View>
        )}
        <Text style={{ color: colors.slateLight, fontSize: 12, marginBottom: spacing.sm }}>Convenience Fee is non-refundable</Text>
        <View style={{ height: 1, backgroundColor: colors.border, marginBottom: spacing.sm }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: colors.navy }}>Total</Text>
          <Text style={{ fontWeight: '700', fontSize: 16, color: colors.navy }}>₹ {total.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <Pressable
        onPress={handleContinue}
        style={{ backgroundColor: colors.navy, borderRadius: radius.sm, paddingVertical: 16, alignItems: 'center', marginTop: spacing.lg }}
      >
        <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>Continue</Text>
      </Pressable>
    </View>
  );
}

function FareRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
      <Text style={{ color: colors.slate }}>{label}</Text>
      <Text style={{ color: colors.navy, fontWeight: '600' }}>₹ {value.toLocaleString('en-IN')}</Text>
    </View>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={{ color: colors.navy, fontWeight: '600', marginBottom: 6, fontSize: 13 }}>{text}</Text>;
}

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.sm,
  padding: spacing.sm,
  color: colors.navy,
};
