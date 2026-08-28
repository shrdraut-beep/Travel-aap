export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateContactUnlockPayment = async (
  amount: number,
  tripRequestId: string,
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) => {
  // SIMULATION for AI Studio environment since we might not have a real Razorpay key
  // In a real app, this would use Razorpay like initiateRazorpayPayment
  setTimeout(() => {
    onSuccess({
      razorpay_payment_id: 'pay_' + Date.now(),
      razorpay_order_id: 'order_' + Date.now(),
      tripRequestId
    });
  }, 1500);
};

export const initiateRazorpayPayment = async (
  amount: number,
  bookingId: string,
  createBookingData: any,
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    onFailure("Failed to load Razorpay script");
    return;
  }

  // 1. Create order
  const response = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });
  const order = await response.json();
  if (!response.ok) {
    return onFailure(order.details || order.error || "Failed to create order");
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: 'RouTripO',
    order_id: order.id,
    handler: async (paymentResponse: any) => {
      // 2. Create booking in DB
      await import('../services/shared/BookingService').then(s => s.bookingService.createBooking({
        ...createBookingData,
        paymentId: paymentResponse.razorpay_payment_id
      }));

      // 3. Verify signature
      const verifyRes = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          bookingId
        })
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        onSuccess(paymentResponse);
      } else {
        onFailure("Signature verification failed");
      }
    },
    prefill: { name: createBookingData.customer.name, email: createBookingData.customer.email, contact: createBookingData.customer.phone }
  };

  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
};
