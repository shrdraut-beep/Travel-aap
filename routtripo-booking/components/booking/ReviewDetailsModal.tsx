// components/booking/ReviewDetailsModal.tsx
import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { useBookingFlow } from '../../context/BookingFlowContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  onModify: () => void;
  onConfirm: () => void; // hands off to EXISTING payment/Razorpay flow
};

export function ReviewDetailsModal({ visible, onClose, onModify, onConfirm }: Props) {
  const { state } = useBookingFlow();
  const passenger = state.passengers[0];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(7,21,39,0.55)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.white, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.navy }}>Review Details</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={22} color={colors.slate} />
            </Pressable>
          </View>

          <Text style={{ color: colors.slate, lineHeight: 20, marginBottom: spacing.lg }}>
            Please ensure that the spelling of your name and other details match with your travel document/govt. ID,
            as these cannot be changed later. Errors might lead to cancellation penalties.
          </Text>

          <Text style={{ fontWeight: '700', color: colors.navy, marginBottom: spacing.sm }}>Passenger 1</Text>
          <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg }}>
            <DetailRow label="First & Middle Name" value={`${passenger?.salutation ?? ''} ${passenger?.firstName ?? ''}`} />
            <DetailRow label="Last Name" value={passenger?.lastName ?? ''} />
            <DetailRow label="Gender" value={passenger?.salutation === 'Ms.' || passenger?.salutation === 'Mrs.' ? 'Female' : 'Male'} />
            <DetailRow label="Nationality" value={passenger?.nationality ?? ''} />
            <DetailRow label="Date of Birth" value={passenger?.dob ?? ''} last />
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Pressable
              onPress={onModify}
              style={{ flex: 1, borderRadius: radius.sm, paddingVertical: 16, alignItems: 'center', backgroundColor: colors.offWhite }}
            >
              <Text style={{ color: colors.navy, fontWeight: '700' }}>Modify Details</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{ flex: 1, borderRadius: radius.sm, paddingVertical: 16, alignItems: 'center', backgroundColor: colors.navy }}
            >
              <Text style={{ color: colors.white, fontWeight: '700' }}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: last ? 0 : spacing.sm }}>
      <Text style={{ color: colors.slate }}>{label}</Text>
      <Text style={{ color: colors.navy, fontWeight: '600' }}>{value || '—'}</Text>
    </View>
  );
}
