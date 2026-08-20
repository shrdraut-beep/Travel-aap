// components/booking/FarePlansSheet.tsx
import React from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { X, Luggage, ShieldCheck, CalendarClock, XCircle } from 'lucide-react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { useBookingFlow, FareTier } from '../../context/BookingFlowContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  flightLabel: string;   // "ISK → DEL"
  airline: string;       // "Indigo 6E 7219"
  departDate: string;
  arriveDate: string;
  departTime: string;
  arriveTime: string;
  fareTiers: FareTier[];
};

export function FarePlansSheet({
  visible, onClose, flightLabel, airline, departDate, arriveDate, departTime, arriveTime, fareTiers,
}: Props) {
  const { dispatch } = useBookingFlow();

  const handleSelect = (fare: FareTier) => {
    dispatch({ type: 'SELECT_FARE', fare });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(7,21,39,0.55)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.offWhite,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            maxHeight: '88%',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: spacing.lg,
              backgroundColor: colors.white,
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.navy }}>Flight Details and fare plans</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={22} color={colors.slate} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
            {/* Flight summary card */}
            <View style={{ backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg }}>
              <Text style={{ color: colors.gold, fontWeight: '700', marginBottom: 4 }}>{airline}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 12, color: colors.slate }}>{departDate}</Text>
                  <Text style={{ fontSize: 22, fontWeight: '700', color: colors.navy }}>{departTime}</Text>
                  <Text style={{ color: colors.slate }}>{flightLabel.split('→')[0].trim()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 12, color: colors.slate }}>{arriveDate}</Text>
                  <Text style={{ fontSize: 22, fontWeight: '700', color: colors.navy }}>{arriveTime}</Text>
                  <Text style={{ color: colors.slate }}>{flightLabel.split('→')[1].trim()}</Text>
                </View>
              </View>
            </View>

            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: spacing.sm }}>Select Fare</Text>

            {fareTiers.map(fare => (
              <Pressable
                key={fare.id}
                onPress={() => handleSelect(fare)}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                }}
              >
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.navy }}>
                  ₹{fare.pricePerAdult.toLocaleString('en-IN')} <Text style={{ fontSize: 13, fontWeight: '400', color: colors.slate }}>per adult</Text>
                </Text>
                <Text style={{ color: colors.gold, fontWeight: '600', marginBottom: spacing.sm }}>{fare.label}</Text>

                <Text style={{ fontWeight: '700', color: colors.navy, marginBottom: 6 }}>Baggage</Text>
                <Row icon={<Luggage size={16} color={colors.success} />} text={`${fare.cabinBaggageKg} KG Cabin bag allowance`} />
                <Row icon={<Luggage size={16} color={colors.success} />} text={`${fare.checkinBaggageKg} KG Check-in bag allowance`} />

                <Text style={{ fontWeight: '700', color: colors.navy, marginTop: spacing.sm, marginBottom: 6 }}>Flexibility</Text>
                {fare.cancellationSlabs.map((slab, i) => (
                  <Row key={i} icon={<XCircle size={16} color={colors.danger} />} text={`Cancellation — ${slab.window}: INR ${slab.fee}`} />
                ))}
                {fare.dateChangeSlabs.map((slab, i) => (
                  <Row key={i} icon={<CalendarClock size={16} color={colors.danger} />} text={`Date change — ${slab.window}: INR ${slab.fee || 'NIL'}`} />
                ))}

                <Text style={{ fontWeight: '700', color: colors.navy, marginTop: spacing.sm, marginBottom: 6 }}>Seats Meals and More</Text>
                <Row
                  icon={<ShieldCheck size={16} color={fare.seatsIncluded === 'free' ? colors.success : colors.slate} />}
                  text={fare.seatsIncluded === 'free' ? 'Free Seats' : 'Chargeable Seats'}
                />
                <Row
                  icon={<ShieldCheck size={16} color={fare.mealsIncluded === 'complimentary' ? colors.success : colors.slate} />}
                  text={fare.mealsIncluded === 'complimentary' ? 'Complimentary Meals' : 'Chargeable Meals'}
                />
              </Pressable>
            ))}
          </ScrollView>

          {/* Sticky continue */}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.white }}>
            <Pressable
              onPress={onClose}
              style={{ backgroundColor: colors.navy, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 16 }}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 }}>
      {icon}
      <Text style={{ color: colors.slate, flex: 1 }}>{text}</Text>
    </View>
  );
}
