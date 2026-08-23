export const calculateTotal = (baseFare: number, apiTaxes: number, convenienceFee: number) => {
  const gstOnConvenience = convenienceFee * 0.18;
  return {
    total: baseFare + apiTaxes + convenienceFee + gstOnConvenience,
    gstOnConvenience,
    convenienceFee,
    baseFare,
    apiTaxes
  };
};
