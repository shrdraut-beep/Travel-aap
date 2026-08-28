import { BiddingContract, BidOffer, TripBidRequest } from '../types';
import { getDeviceFingerprint } from './deviceFingerprint';

/**
 * Electronic Digital Contract Generator
 * IT Act Sec 10A & Indian Contract Act 1872 Compliant
 */

export async function generateBiddingContract(
  request: TripBidRequest,
  acceptedBid: BidOffer,
  userId: string,
  userIp = '127.0.0.1',
  vendorIp = '127.0.0.1'
): Promise<BiddingContract> {
  const contractId = `RTO-CNT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const deviceFp = await getDeviceFingerprint();

  const isHotel = request.tripCategory === 'Hotels';
  const totalPrice = acceptedBid.totalPrice;

  // Determine Vendor-Chosen Refund Policy
  const refundType = acceptedBid.refundType || 'REFUNDABLE';
  const refundDeadlineHours = acceptedBid.refundDeadlineHours || (isHotel ? 48 : 24);
  const cancellationPolicy = acceptedBid.cancellationPolicy || (
    refundType === 'NON_REFUNDABLE'
      ? '100% Non-Refundable (Strict Zero Refund Policy set by Operator)'
      : `100% Free Cancellation up to ${refundDeadlineHours} hours before ${isHotel ? 'Check-In' : 'Departure'}. Non-refundable thereafter.`
  );

  // Generate 4-digit PINs for Mutual Handshakes
  const pin1 = Math.floor(1000 + Math.random() * 9000).toString();
  const pin2 = Math.floor(1000 + Math.random() * 9000).toString();
  const pin3 = Math.floor(1000 + Math.random() * 9000).toString();
  const pin4 = Math.floor(1000 + Math.random() * 9000).toString();

  if (isHotel) {
    // 🏨 HOTELS: Single-Stage Release (100% on Check-In)
    const userCheckInPin = pin1;
    const vendorCheckInPin = pin2;

    const legalClause = `This Electronic Contract is executed pursuant to Section 10A of the IT Act, 2000 (India). Category: HOTEL / RESORT (Single-Stage Escrow Release). Locked Price: ₹${totalPrice.toLocaleString()} held in platform Escrow. 100% FULL PAYOUT is immediately released to Hotel Partner (${acceptedBid.vendorName}) upon mutual 4-digit Check-In PIN verification (${userCheckInPin} / ${vendorCheckInPin}). No check-out PIN is required. Cancellation Policy: ${cancellationPolicy}. Room stay and amenities are guaranteed with ZERO hidden surcharges.`;

    return {
      contractId,
      tripRequestId: request.id,
      bidOfferId: acceptedBid.id,
      userId,
      vendorId: acceptedBid.vendorId,
      vendorName: acceptedBid.vendorName,
      tripCategory: 'Hotels',
      startDate: request.startDate,
      endDate: request.endDate,
      lockedPrice: totalPrice,
      refundType,
      refundDeadlineHours,
      escrowModel: 'SINGLE_STAGE_HOTEL',
      escrowStatus: 'HELD',
      advanceAmount: totalPrice,
      balanceAmount: 0,
      advanceReleased: false,
      balanceReleased: false,
      userCheckInPin,
      vendorCheckInPin,
      isCheckedIn: false,
      userStartPin: userCheckInPin,
      vendorStartPin: vendorCheckInPin,
      isStarted: false,
      userEndPin: '',
      vendorEndPin: '',
      isCompleted: false,
      startOtp: userCheckInPin,
      endOtp: '',
      inclusions: acceptedBid.inclusions.length > 0 ? acceptedBid.inclusions : ['Confirmed AC Room', 'Complimentary Breakfast', 'Free Wi-Fi', '24/7 Hot Water'],
      exclusions: acceptedBid.exclusions || ['Room Service / Minibar', 'Laundry', 'Early Check-in Surcharges'],
      cancellationPolicy,
      legalClause,
      timestamp: new Date().toISOString(),
      userSignatureIp: userIp,
      userDeviceFingerprint: deviceFp,
      vendorSignatureIp: vendorIp,
      vendorDeviceFingerprint: `VEND_FP_${acceptedBid.vendorId}`
    };
  }

  // 🚗/🎒 CABS & TRIPS: Two-Stage Release (40% Fuel Advance on Pickup + 60% Balance on Drop-off)
  const advanceAmount = Math.round(totalPrice * 0.40); // 40% fuel advance
  const balanceAmount = totalPrice - advanceAmount;      // 60% final balance
  const userStartPin = pin1;
  const vendorStartPin = pin2;
  const userEndPin = pin3;
  const vendorEndPin = pin4;

  const legalClause = `This Electronic Contract is executed pursuant to Section 10A of the IT Act, 2000 (India). Category: CABS & TRIPS (Two-Stage Escrow Release). Locked Total Price: ₹${totalPrice.toLocaleString()} split into: (1) Stage 1: 40% Fuel/Operational Advance (₹${advanceAmount.toLocaleString()}) released upon Pickup Mutual PIN verification (${userStartPin} / ${vendorStartPin}); (2) Stage 2: Final 60% Balance (₹${balanceAmount.toLocaleString()}) strictly released upon final Drop-off Closing PIN verification (${userEndPin} / ${vendorEndPin}) to guarantee complete itinerary fulfillment. Cancellation Policy: ${cancellationPolicy}.`;

  return {
    contractId,
    tripRequestId: request.id,
    bidOfferId: acceptedBid.id,
    userId,
    vendorId: acceptedBid.vendorId,
    vendorName: acceptedBid.vendorName,
    tripCategory: request.tripCategory || 'Cabs',
    startDate: request.startDate,
    endDate: request.endDate,
    lockedPrice: totalPrice,
    refundType,
    refundDeadlineHours,
    escrowModel: 'TWO_STAGE_CAB_TRIP',
    escrowStatus: 'HELD',
    advanceAmount,
    balanceAmount,
    advanceReleased: false,
    balanceReleased: false,
    userStartPin,
    vendorStartPin,
    isStarted: false,
    userEndPin,
    vendorEndPin,
    isCompleted: false,
    startOtp: userStartPin,
    endOtp: userEndPin,
    inclusions: acceptedBid.inclusions.length > 0 ? acceptedBid.inclusions : ['Toll & State Taxes', 'Parking Charges', 'Driver Night Allowance', 'AC Cab with Fuel'],
    exclusions: acceptedBid.exclusions || ['Personal Expenses', 'Monument Entry Tickets', 'Driver Tips'],
    cancellationPolicy,
    legalClause,
    timestamp: new Date().toISOString(),
    userSignatureIp: userIp,
    userDeviceFingerprint: deviceFp,
    vendorSignatureIp: vendorIp,
    vendorDeviceFingerprint: `VEND_FP_${acceptedBid.vendorId}`
  };
}
