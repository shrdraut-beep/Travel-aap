import { BiddingContract } from '../../src/types';

export interface CancellationEvaluationResult {
  canRefund: boolean;
  refundType: 'NON_REFUNDABLE' | 'REFUNDABLE';
  refundDeadlineHours: number;
  hoursRemainingToTrip: number;
  lockedPrice: number;
  estimatedRefundAmount: number;
  vendorDisbursalAmount: number;
  policySummary: string;
  verdictMessage: string;
}

export interface CancellationProcessResult {
  success: boolean;
  contractId: string;
  refundIssued: boolean;
  refundAmount: number;
  vendorDisbursalAmount: number;
  reasonCode: 'REFUND_APPROVED_WITHIN_WINDOW' | 'NON_REFUNDABLE_POLICY_BLOCKED' | 'PAST_REFUND_DEADLINE_BLOCKED' | 'ALREADY_COMPLETED' | 'CONTRACT_NOT_FOUND';
  message: string;
  razorpayRefundId?: string;
  processedAt: string;
  contract?: BiddingContract;
}

/**
 * Evaluates refund eligibility strictly according to Vendor-chosen policy
 */
export function evaluateCancellationEligibility(
  contract: BiddingContract,
  tripStartDateStr?: string,
  nowDate = new Date()
): CancellationEvaluationResult {
  const refundType = contract.refundType || (contract.cancellationPolicy?.toLowerCase().includes('non-refundable') ? 'NON_REFUNDABLE' : 'REFUNDABLE');
  const refundDeadlineHours = contract.refundDeadlineHours || (contract.cancellationPolicy?.includes('48') ? 48 : contract.cancellationPolicy?.includes('72') ? 72 : 24);
  const lockedPrice = contract.lockedPrice || 0;

  // Calculate hours remaining until trip start date
  let tripStart = new Date();
  if (tripStartDateStr) {
    tripStart = new Date(tripStartDateStr);
  } else if (contract.startDate) {
    tripStart = new Date(contract.startDate);
  } else {
    // Default to 48 hours in future if not specified
    tripStart = new Date(nowDate.getTime() + 48 * 60 * 60 * 1000);
  }

  const msRemaining = tripStart.getTime() - nowDate.getTime();
  const hoursRemainingToTrip = Math.max(0, Math.round(msRemaining / (1000 * 60 * 60)));

  if (refundType === 'NON_REFUNDABLE') {
    return {
      canRefund: false,
      refundType: 'NON_REFUNDABLE',
      refundDeadlineHours,
      hoursRemainingToTrip,
      lockedPrice,
      estimatedRefundAmount: 0,
      vendorDisbursalAmount: lockedPrice,
      policySummary: '100% Non-Refundable Policy (Mandated by Operator)',
      verdictMessage: 'This booking was accepted under a strict 100% Non-Refundable policy. No refund will be processed. Total escrow funds will be disbursed to the operator.'
    };
  }

  // Refundable policy check against deadline
  const isWithinSafeWindow = hoursRemainingToTrip >= refundDeadlineHours;

  if (isWithinSafeWindow) {
    return {
      canRefund: true,
      refundType: 'REFUNDABLE',
      refundDeadlineHours,
      hoursRemainingToTrip,
      lockedPrice,
      estimatedRefundAmount: lockedPrice,
      vendorDisbursalAmount: 0,
      policySummary: `Refundable Policy (${refundDeadlineHours} hrs before trip start)`,
      verdictMessage: `Eligible for 100% auto-refund. Time remaining (${hoursRemainingToTrip} hrs) meets the required ${refundDeadlineHours} hrs cancellation deadline.`
    };
  } else {
    return {
      canRefund: false,
      refundType: 'REFUNDABLE',
      refundDeadlineHours,
      hoursRemainingToTrip,
      lockedPrice,
      estimatedRefundAmount: 0,
      vendorDisbursalAmount: lockedPrice,
      policySummary: `Refundable Policy (${refundDeadlineHours} hrs deadline exceeded)`,
      verdictMessage: `Cancellation deadline exceeded. Cancellation was requested ${hoursRemainingToTrip} hrs before start, but operator required at least ${refundDeadlineHours} hrs notice. Funds will be disbursed to the operator.`
    };
  }
}

/**
 * Executes Auto-Refund Escrow Engine with simulated Razorpay Refund Gateway
 */
export async function executeAutoRefundEscrow(
  contract: BiddingContract,
  userCancellationReason?: string,
  tripStartDateStr?: string,
  nowDate = new Date()
): Promise<CancellationProcessResult> {
  const processedAt = nowDate.toISOString();

  // If already started or completed, refund is strictly blocked
  if (contract.isStarted || contract.isCompleted) {
    return {
      success: false,
      contractId: contract.contractId,
      refundIssued: false,
      refundAmount: 0,
      vendorDisbursalAmount: 0,
      reasonCode: 'ALREADY_COMPLETED',
      message: 'Cannot cancel an active or completed trip/stay. Escrow payout has already been initiated.',
      processedAt
    };
  }

  const evaluation = evaluateCancellationEligibility(contract, tripStartDateStr, nowDate);

  if (evaluation.refundType === 'NON_REFUNDABLE') {
    // 🔴 100% Non-Refundable: Block Razorpay refund API & disburse to vendor
    contract.escrowStatus = 'FULLY_RELEASED';
    contract.refundDisbursedToVendor = true;
    contract.refundAmount = 0;
    contract.cancellationReason = userCancellationReason || 'User requested cancellation on Non-Refundable deal';
    contract.refundProcessedAt = processedAt;

    return {
      success: false,
      contractId: contract.contractId,
      refundIssued: false,
      refundAmount: 0,
      vendorDisbursalAmount: contract.lockedPrice,
      reasonCode: 'NON_REFUNDABLE_POLICY_BLOCKED',
      message: 'No Refund Applicable: This booking was locked under a 100% Non-Refundable policy chosen by the operator. Funds disbursed to operator.',
      processedAt,
      contract
    };
  }

  if (evaluation.canRefund) {
    // 🟢 Refundable within safe window: Trigger auto-refund to user
    const mockRazorpayRefundId = `rfnd_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    
    contract.escrowStatus = 'REFUNDED';
    contract.refundAmount = contract.lockedPrice;
    contract.refundDisbursedToVendor = false;
    contract.cancellationReason = userCancellationReason || 'Cancelled within free refund window';
    contract.refundProcessedAt = processedAt;

    return {
      success: true,
      contractId: contract.contractId,
      refundIssued: true,
      refundAmount: contract.lockedPrice,
      vendorDisbursalAmount: 0,
      reasonCode: 'REFUND_APPROVED_WITHIN_WINDOW',
      message: `100% Full Refund Auto-Processed: ₹${contract.lockedPrice.toLocaleString()} initiated via Razorpay Escrow Reversal. Refund ID: ${mockRazorpayRefundId}.`,
      razorpayRefundId: mockRazorpayRefundId,
      processedAt,
      contract
    };
  } else {
    // 🟠 Refundable but past deadline: Block refund & disburse to vendor
    contract.escrowStatus = 'FULLY_RELEASED';
    contract.refundDisbursedToVendor = true;
    contract.refundAmount = 0;
    contract.cancellationReason = userCancellationReason || `Cancellation requested past ${evaluation.refundDeadlineHours}h deadline`;
    contract.refundProcessedAt = processedAt;

    return {
      success: false,
      contractId: contract.contractId,
      refundIssued: false,
      refundAmount: 0,
      vendorDisbursalAmount: contract.lockedPrice,
      reasonCode: 'PAST_REFUND_DEADLINE_BLOCKED',
      message: `Cancellation deadline exceeded (${evaluation.hoursRemainingToTrip}h remaining vs ${evaluation.refundDeadlineHours}h required). Refund blocked; ₹${contract.lockedPrice.toLocaleString()} disbursed to operator.`,
      processedAt,
      contract
    };
  }
}
