// components/booking/SeatSelection.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors, radius, spacing } from '../../theme/tokens';
import { useBookingFlow } from '../../context/BookingFlowContext';
import { HoldTimer } from './HoldTimer';

type SeatStatus = 'free' | 'xl' | 'paid' | 'disabled';
type SeatCell = { code: string; status: SeatStatus; price: number };

// Demo layout generator — swap with real seat-map API response per leg.
function generateRows(rowCount: number): SeatCell[][] {
  const cols = ['A', 'C', 'D', 'F'];
  return Array.from({ length: rowCount }, (_, r) => {
    const rowNum = r + 1;
    return cols.map(col => ({
      code: `${rowNum}${col}`,
      status: 'disabled' as SeatStatus, // unavailable until fetched/selected
      price: 0,
    }));
  });
}

const statusColor: Record<SeatStatus, string> = {
  free: colors.seatFree,
  xl: colors.seatXL,
  paid: colors.seatPaid,
  disabled: colors.seatDisabled,
};

type Props = {
  legs: { id: string; label: string }[]; // e.g. [{id:'ISK-AMD', label:'ISK → AMD'}, ...]
  onSkip: () => void;
  onNext: () => void;
};

export function SeatSelection({ legs, onSkip, onNext }: Props) {
  const { state, dispatch, totals } = useBookingFlow();
  const [activeLeg, setActiveLeg] = useState(legs[0]?.id);
  const [rows] = useState(() => generateRows(20));

  const selectedForLeg = state.seats.find(s => s.legId === activeLeg);

  const handleSeatPress = (seat: SeatCell) => {
    if (seat.status === 'disabled') return;
    dispatch({
      type: 'TOGGLE_SEAT',
      seat: { legId: activeLeg, seatCode: seat.code, type: seat.status, price: seat.price },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.navy, padding: spacing.lg, paddingTop: 50 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ArrowLeft size={22} color={colors.white} />
            <Text style={{ color: colors.white, fontSize: 20, fontWeight: '700' }}>Seats & Add-ons</Text>
          </View>
          <HoldTimer />
        </View>
      </View>

      {/* Tabs: Select Seats / Meals / Extra Baggage — parent screen owns tab switching */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.navy }}>
        <Text style={{ flex: 1, textAlign: 'center', color: colors.white, fontWeight: '700', paddingVertical: 14, borderBottomWidth: 3, borderBottomColor: colors.gold }}>
          Select Seats
        </Text>
        <Text style={{ flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontWeight: '600', paddingVertical: 14 }}>Meals</Text>
        <Text style={{ flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontWeight: '600', paddingVertical: 14 }}>Extra Baggage</Text>
      </View>

      {/* Leg tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: spacing.md }} contentContainerStyle={{ gap: 10 }}>
        {legs.map(leg => (
          <Pressable
            key={leg.id}
            onPress={() => setActiveLeg(leg.id)}
            style={{
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: radius.pill,
              backgroundColor: activeLeg === leg.id ? colors.navy : colors.white,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: activeLeg === leg.id ? colors.white : colors.navy, fontWeight: '700' }}>{leg.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.lg, marginBottom: spacing.sm }}>
        <LegendItem color={colors.seatFree} label="Free" />
        <LegendItem color={colors.seatXL} label="XL Seat" />
        <LegendItem color={colors.seatPaid} label="Paid Seat" />
      </View>

      {/* Seat map */}
      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.md }}>
        <View style={{ backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md }}>
          {rows.map((row, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {row.slice(0, 2).map(seat => (
                  <SeatButton key={seat.code} seat={seat} selected={selectedForLeg?.seatCode === seat.code} onPress={() => handleSeatPress(seat)} />
                ))}
              </View>
              <Text style={{ color: colors.slateLight, alignSelf: 'center' }}>{i + 1}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {row.slice(2, 4).map(seat => (
                  <SeatButton key={seat.code} seat={seat} selected={selectedForLeg?.seatCode === seat.code} onPress={() => handleSeatPress(seat)} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={{ backgroundColor: colors.white, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: colors.slate }}>Seats ({state.seats.length}/{legs.length})</Text>
          <Text style={{ fontWeight: '700', color: colors.navy }}>₹{totals.grandTotal.toLocaleString('en-IN')}</Text>
        </View>
        <Text style={{ color: colors.slateLight, marginBottom: spacing.md }}>
          {state.seats.length === 0 ? 'No seats selected' : `${state.seats.length} seat(s) selected`}
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

function SeatButton({ seat, selected, onPress }: { seat: SeatCell; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={seat.status === 'disabled'}
      style={{
        width: 34,
        height: 34,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: selected ? colors.gold : statusColor[seat.status],
        backgroundColor: selected ? colors.goldSoft : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 9, color: statusColor[seat.status] }}>{seat.code}</Text>
    </Pressable>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ color: colors.slate, fontSize: 13 }}>{label}</Text>
    </View>
  );
}
