export const getCachedExchangeRate = async (db: any): Promise<number> => {
  try {
    if (!db) return 85.0;
    const doc = await db.collection('system_config').doc('currency_rates').get();
    if (doc && doc.exists) {
      return doc.data()?.bufferedRate || 85.0;
    }
  } catch (err) {
    // Graceful fallback if missing permissions or db offline
  }
  return 85.0; // Fallback rate USD to INR
};

export const transformPrice = (amount: string | number, currency: string, rate: number): { amount: number, currency: 'INR' } => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (currency === 'INR') {
    return { amount: Math.ceil(numericAmount), currency: 'INR' };
  }
  
  // Apply 3% buffered rate
  const convertedAmount = numericAmount * rate;
  return { amount: Math.ceil(convertedAmount), currency: 'INR' };
};

export const interceptPayload = async (payload: any, rate: number): Promise<any> => {
  if (Array.isArray(payload)) {
    return Promise.all(payload.map(item => interceptPayload(item, rate)));
  } else if (typeof payload === 'object' && payload !== null) {
    const newPayload = { ...payload };
    
    // Check for Duffel pricing fields
    if (newPayload.total_amount && newPayload.total_currency) {
      const converted = transformPrice(newPayload.total_amount, newPayload.total_currency, rate);
      newPayload.total_amount = converted.amount.toString();
      newPayload.total_currency = converted.currency;
    }
    if (newPayload.base_amount && newPayload.base_currency) {
        const converted = transformPrice(newPayload.base_amount, newPayload.base_currency, rate);
        newPayload.base_amount = converted.amount.toString();
        newPayload.base_currency = converted.currency;
    }
    if (newPayload.tax_amount && newPayload.total_currency) {
        const converted = transformPrice(newPayload.tax_amount, newPayload.total_currency, rate);
        newPayload.tax_amount = converted.amount.toString();
    }
    
    for (const key in newPayload) {
      newPayload[key] = await interceptPayload(newPayload[key], rate);
    }
    return newPayload;
  }
  return payload;
};
