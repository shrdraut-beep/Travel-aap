// Routripo Client-side Checkout Integration
export const handleCheckout = async (bookingDetails?: {
  supplierBaseFare?: number;
  supplierTaxes?: number;
  serviceType?: string;
  buyerState?: string;
  vendorAccountId?: string;
}) => {
  try {
    // १. सर्व्हरला रिक्वेस्ट पाठवणे
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierBaseFare: bookingDetails?.supplierBaseFare ?? 10000,
        supplierTaxes: bookingDetails?.supplierTaxes ?? 1800,
        serviceType: bookingDetails?.serviceType ?? 'vendor_commission',
        buyerState: bookingDetails?.buyerState ?? 'MH',
        vendorAccountId: bookingDetails?.vendorAccountId ?? 'acc_123XYZ' // असल्यास
      })
    });
    
    const data = await response.json();

    if (data.success || data.id) {
      const orderId = data.orderId || data.id;
      const amountToPay = data.amountToPay ? (data.amountToPay * 100) : data.amount;

      // २. आलेला Order ID वापरून Razorpay उघडणे
      const options = {
        key: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY",
        amount: amountToPay,
        currency: "INR",
        order_id: orderId,
        name: "Routripo",
        description: "Travel Booking & Services",
        handler: function (response: any) {
          alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
          console.log("Tax Breakup Received from Server:", data.taxBreakup);
          // येथे तुम्ही सर्व्हरला Invoice Generate करण्यासाठी सांगू शकता
        },
        theme: {
          color: "#E11D48"
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      alert("Order creation failed: " + (data.message || data.error));
    }
  } catch (error: any) {
    console.error("Payment checkout error:", error);
    alert("Payment checkout failed. Please check network connection.");
  }
};
