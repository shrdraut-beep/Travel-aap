// components/booking/PassengerForm.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch } from 'react-native';
import { Calendar, ChevronDown } from 'lucide-react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { useBookingFlow, Passenger } from '../../context/BookingFlowContext';

const SALUTATIONS: Passenger['salutation'][] = ['Mr.', 'Ms.', 'Mrs.'];

export function PassengerForm({ index }: { index: number }) {
  const { state, dispatch } = useBookingFlow();
  const existing = state.passengers[index];

  const [salutation, setSalutation] = useState<Passenger['salutation']>(existing?.salutation ?? 'Mr.');
  const [firstName, setFirstName] = useState(existing?.firstName ?? '');
  const [lastName, setLastName] = useState(existing?.lastName ?? '');
  const [nationality, setNationality] = useState(existing?.nationality ?? 'India');
  const [dob, setDob] = useState(existing?.dob ?? '');
  const [isMinor, setIsMinor] = useState(existing?.isUnaccompaniedMinor ?? false);

  const commit = (patch: Partial<Passenger>) => {
    dispatch({
      type: 'SET_PASSENGER',
      index,
      passenger: { salutation, firstName, lastName, nationality, dob, isUnaccompaniedMinor: isMinor, ...patch },
    });
  };

  return (
    <View style={{ backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.navy }}>Adult {index + 1}</Text>
      </View>

      {/* Unaccompanied minor */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.dangerSoft,
          borderRadius: radius.sm,
          padding: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        <Text style={{ color: colors.danger, flex: 1 }}>Unaccompanied Minor Traveling</Text>
        <Switch value={isMinor} onValueChange={v => { setIsMinor(v); commit({ isUnaccompaniedMinor: v }); }} />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        <View style={{ width: 90 }}>
          <Label text="Salutation" />
          <Pressable
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
              padding: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.navy, fontWeight: '600' }}>{salutation}</Text>
            <ChevronDown size={16} color={colors.slate} />
          </Pressable>
        </View>
        <View style={{ flex: 1 }}>
          <Label text="First And Middle Name" />
          <TextInput
            value={firstName}
            onChangeText={t => { setFirstName(t); commit({ firstName: t }); }}
            placeholder="Enter first name"
            placeholderTextColor={colors.slateLight}
            style={inputStyle}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Label text="Last Name" />
          <TextInput
            value={lastName}
            onChangeText={t => { setLastName(t); commit({ lastName: t }); }}
            placeholder="Enter surname"
            placeholderTextColor={colors.slateLight}
            style={inputStyle}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Label text="Nationality" />
          <Pressable
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
              padding: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.navy, fontWeight: '600' }}>{nationality}</Text>
            <ChevronDown size={16} color={colors.slate} />
          </Pressable>
        </View>
      </View>

      <Label text="Date of Birth" />
      <Pressable
        style={{
          borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
          padding: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <Text style={{ color: dob ? colors.navy : colors.slateLight }}>{dob || 'DD/MM/YYYY'}</Text>
        <Calendar size={18} color={colors.slate} />
      </Pressable>
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
