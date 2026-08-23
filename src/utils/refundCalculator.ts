export const calculateRefund = (totalPaid: number, vertical: string) => {
  // Generic cancellation rules for now
  const penalty = totalPaid * 0.2; // 20% penalty
  const appFee = 50; // Fixed app fee
  const nonRefundableTaxes = totalPaid * 0.05; // 5% non-refundable tax

  const refundAmount = Math.max(0, totalPaid - (penalty + appFee + nonRefundableTaxes));

  return {
    totalPaid,
    penalty,
    appFee,
    nonRefundableTaxes,
    refundAmount,
  };
};
